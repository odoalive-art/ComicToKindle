import { app, ipcMain, shell, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import type { ConvertOptions, ConvertOutput, PreviewPageResult } from './convert'
import { runConvert, runPreview, cancelConvert } from './convert-host'
import { collectVolumeImagePaths } from './library'

/**
 * 产物清单数据层：转换产物的存储、索引与投递状态。
 *
 * 设计要点：
 *   - 产物由应用托管，默认落在 userData/converted/<部>/，用户无需指定路径。
 *   - 清单 userData/artifacts.json 记录「源卷 → N 个产物文件」的映射，用于库内角标和归档视图。
 *   - 一个源卷可能因体积分卷产出多个 EPUB，故 outputs 是数组。
 */

export type ArtifactStatus = 'ready' | 'delivered' | 'failed'

export interface Artifact {
  id: string
  sourceVolumePath: string
  seriesName: string
  seriesTitle: string
  volumeTitle: string
  author: string | null
  outputs: ConvertOutput[]
  format: 'epub'
  pageCount: number
  createdAt: string
  status: ArtifactStatus
}

interface Manifest {
  version: number
  artifacts: Artifact[]
}

const manifestFile = (): string => join(app.getPath('userData'), 'artifacts.json')
const convertedRoot = (): string => join(app.getPath('userData'), 'converted')

function sanitize(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'untitled'
}

/**
 * EPUB 书名/文件名 = 「漫画名 + 卷册」（Kindle 上据此显示与归档）。
 * 卷册名已含漫画名或漫画名缺失时退化，避免重复。
 */
function composeBookTitle(seriesTitle: string, volumeTitle: string): string {
  const s = (seriesTitle ?? '').trim()
  const v = (volumeTitle ?? '').trim()
  if (!s) return v || 'Untitled'
  if (!v || v === s || v.startsWith(s)) return v || s
  return `${s} ${v}`
}

async function readManifest(): Promise<Manifest> {
  try {
    const data = JSON.parse(await fs.readFile(manifestFile(), 'utf-8')) as Manifest
    if (data && Array.isArray(data.artifacts)) return data
  } catch {
    /* 不存在或损坏 → 空清单 */
  }
  return { version: 1, artifacts: [] }
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await fs.writeFile(manifestFile(), JSON.stringify(manifest, null, 2), 'utf-8')
}

async function upsertArtifact(artifact: Artifact): Promise<void> {
  const manifest = await readManifest()
  // 同一源卷重新转换 → 覆盖旧记录
  const idx = manifest.artifacts.findIndex((a) => a.sourceVolumePath === artifact.sourceVolumePath)
  if (idx >= 0) manifest.artifacts[idx] = artifact
  else manifest.artifacts.unshift(artifact)
  await writeManifest(manifest)
}

export interface ConvertRequest {
  sourceVolumePath: string
  seriesName: string
  seriesTitle: string
  volumeTitle: string
  author?: string | null
  options?: ConvertOptions
}

// 供投递层（deliver.ts）读取产物与更新投递状态
export async function getArtifactById(id: string): Promise<Artifact | undefined> {
  return (await readManifest()).artifacts.find((a) => a.id === id)
}

export async function setArtifactStatus(id: string, status: ArtifactStatus): Promise<void> {
  const manifest = await readManifest()
  const artifact = manifest.artifacts.find((a) => a.id === id)
  if (artifact) {
    artifact.status = status
    await writeManifest(manifest)
  }
}

// ---------- IPC ----------
export function setupArtifacts(): void {
  ipcMain.handle('artifacts:list', async (): Promise<Artifact[]> => {
    return (await readManifest()).artifacts
  })

  ipcMain.handle('convert:volume', async (event, req: ConvertRequest): Promise<Artifact> => {
    const sender = event.sender
    // 发起转换的窗口被销毁（关窗/重载）即取消这一卷——否则它会变成后台孤儿，
    // 续跑到完成、写出产物，重开窗口时与重新入队的同卷形成双跑。引擎在下一张图/
    // 下一卷边界处通过 checkCancelled 中止。
    const onSenderGone = (): void => {
      cancelConvert(req.sourceVolumePath)
    }
    sender.once('destroyed', onSenderGone)
    const emitProgress = (percent: number, message: string): void => {
      if (!sender.isDestroyed()) {
        sender.send('convert:progress', {
          sourceVolumePath: req.sourceVolumePath,
          percent,
          message
        })
      }
    }

    const imagePaths = await collectVolumeImagePaths(req.sourceVolumePath)
    if (imagePaths.length === 0) throw new Error('这一卷里没有可转换的图片。')

    const outputDir = join(convertedRoot(), sanitize(req.seriesName))
    await fs.mkdir(outputDir, { recursive: true })

    let result: { outputs: ConvertOutput[]; pageCount: number }
    try {
      result = await runConvert(
        req.sourceVolumePath,
        {
          imagePaths,
          outputDir,
          title: composeBookTitle(req.seriesTitle, req.volumeTitle),
          author: req.author ?? 'Unknown',
          options: req.options
        },
        emitProgress
      )
    } catch (err) {
      emitProgress(-1, `转换失败：${(err as Error).message}`)
      throw err
    } finally {
      if (!sender.isDestroyed()) sender.off('destroyed', onSenderGone)
    }

    const artifact: Artifact = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      sourceVolumePath: req.sourceVolumePath,
      seriesName: req.seriesName,
      seriesTitle: req.seriesTitle,
      volumeTitle: req.volumeTitle,
      author: req.author ?? null,
      outputs: result.outputs,
      format: 'epub',
      pageCount: result.pageCount,
      createdAt: new Date().toISOString(),
      status: 'ready'
    }
    await upsertArtifact(artifact)
    emitProgress(100, '完成')
    return artifact
  })

  // 模拟 Kindle 预览：对单页跑真实转换管线，返回处理前后图与体积，供调参。
  ipcMain.handle(
    'convert:preview',
    async (
      _event,
      req: { sourceVolumePath: string; pageIndex: number; options?: ConvertOptions }
    ): Promise<PreviewPageResult & { pageIndex: number; pageCount: number }> => {
      const imagePaths = await collectVolumeImagePaths(req.sourceVolumePath)
      if (imagePaths.length === 0) throw new Error('这一卷里没有可转换的图片。')
      const idx = Math.max(0, Math.min(req.pageIndex, imagePaths.length - 1))
      const result = await runPreview(imagePaths[idx], idx, req.options)
      return { ...result, pageIndex: idx, pageCount: imagePaths.length }
    }
  )

  // 请求取消某卷的进行中转换；引擎在下一张图/下一卷边界处中止
  ipcMain.handle('convert:cancel', (_event, sourceVolumePath: string): void => {
    cancelConvert(sourceVolumePath)
  })

  ipcMain.handle('artifacts:reveal', async (_event, id: string): Promise<void> => {
    const manifest = await readManifest()
    const artifact = manifest.artifacts.find((a) => a.id === id)
    const first = artifact?.outputs[0]?.path
    if (first) shell.showItemInFolder(first)
  })

  ipcMain.handle('artifacts:export', async (event, id: string): Promise<boolean> => {
    const manifest = await readManifest()
    const artifact = manifest.artifacts.find((a) => a.id === id)
    if (!artifact || artifact.outputs.length === 0) return false

    const win = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, { properties: ['openDirectory'], title: '导出到文件夹' })
      : await dialog.showOpenDialog({ properties: ['openDirectory'], title: '导出到文件夹' })
    if (canceled || filePaths.length === 0) return false

    const destDir = filePaths[0]
    for (const out of artifact.outputs) {
      await fs.copyFile(out.path, join(destDir, out.fileName)).catch(() => {})
    }
    return true
  })

  ipcMain.handle('artifacts:remove', async (_event, id: string): Promise<void> => {
    const manifest = await readManifest()
    const artifact = manifest.artifacts.find((a) => a.id === id)
    if (artifact) {
      for (const out of artifact.outputs) {
        await fs.rm(out.path, { force: true }).catch(() => {})
      }
    }
    manifest.artifacts = manifest.artifacts.filter((a) => a.id !== id)
    await writeManifest(manifest)
  })
}
