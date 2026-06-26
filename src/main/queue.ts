import { app, ipcMain } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

/**
 * 转换队列持久化层。
 *
 * 设计要点：
 *   - 权威源仍是 renderer 的 useConvertActivity hook；main 只做读 / 写盘 + 启动恢复 + 孤儿 tmp 清扫。
 *   - 写盘文件：userData/queue.json，{ version, jobs }。
 *   - 启动恢复：把上次未完成（queued/converting）的任务标为 'interrupted'，不自动重跑，
 *     由 renderer 弹 toast + 角标提示用户「继续 / 不继续」。
 *   - 孤儿 tmp 清扫：扫 userData/converted/<部>/tmp_* 全部 rm（convert.ts 的 tempDir 命名约定）。
 *   - 进度（percent）不持久化：高频、价值低，只在内存广播。
 */

// 与 renderer 的 ConvertJob 结构对齐（双方独立声明，IPC 边界天然解耦）。
// 任何字段调整需同步 renderer 的 ConvertJob / preload 的 PersistedConvertJob。
export type ConvertJobStatus = 'queued' | 'converting' | 'interrupted' | 'failed'

export interface PersistedConvertJob {
  id: string
  sourceVolumePath: string
  seriesPathName: string
  title: string
  author: string | null
  status: ConvertJobStatus
  percent: number
  error?: string
  options?: Record<string, unknown> // 入队时冻结的转换选项快照（renderer ConvertOptionsState）
  enqueuedAt?: string
}

interface QueueFile {
  version: number
  jobs: PersistedConvertJob[]
}

const queueFile = (): string => join(app.getPath('userData'), 'queue.json')
const convertedRoot = (): string => join(app.getPath('userData'), 'converted')

async function readQueue(): Promise<PersistedConvertJob[]> {
  try {
    const data = JSON.parse(await fs.readFile(queueFile(), 'utf-8')) as QueueFile
    if (data && Array.isArray(data.jobs)) {
      // 旧记录把书名拆成 seriesTitle/volumeTitle，读取时折成单一 title
      return data.jobs.map((j) => {
        if (j.title != null) return j
        const legacy = j as PersistedConvertJob & { seriesTitle?: string; volumeTitle?: string }
        const s = (legacy.seriesTitle ?? '').trim()
        const v = (legacy.volumeTitle ?? '').trim()
        const title = !s ? v : !v || v === s || v.startsWith(s) ? v || s : `${s} ${v}`
        return { ...j, title }
      })
    }
  } catch {
    /* 不存在或损坏 → 视作空队列 */
  }
  return []
}

async function writeQueue(jobs: PersistedConvertJob[]): Promise<void> {
  const payload: QueueFile = { version: 1, jobs }
  await fs.writeFile(queueFile(), JSON.stringify(payload, null, 2), 'utf-8')
}

/**
 * 把所有未完成任务（'queued' / 'converting'）标为 'interrupted'（percent 清零、清错误）。
 * 上次会话被强制退出，临时产物已废；不自动重跑，等用户在 UI 上确认是否继续。
 * 'failed' 保持原样（终态，UI 自带重试）。
 */
function reviveJobs(jobs: PersistedConvertJob[]): PersistedConvertJob[] {
  return jobs.map((j) =>
    j.status === 'queued' || j.status === 'converting'
      ? { ...j, status: 'interrupted', percent: 0, error: undefined }
      : j
  )
}

// 扫 userData/converted/<部>/tmp_<id>/ 目录，全部递归 rm。
// 上次会话强杀留下的孤儿目录（convert.ts 在 finally 里清，但崩溃/强杀就漏）。
// 失败不抛错（best effort），不阻塞启动。
async function cleanupOrphanTmpDirs(): Promise<void> {
  const root = convertedRoot()
  let seriesDirs: string[]
  try {
    seriesDirs = await fs.readdir(root)
  } catch {
    return // converted 根目录不存在 → 还没转过任何卷
  }
  for (const series of seriesDirs) {
    const seriesPath = join(root, series)
    let entries: string[]
    try {
      entries = await fs.readdir(seriesPath)
    } catch {
      continue
    }
    for (const name of entries) {
      if (!name.startsWith('tmp_')) continue
      const tmpPath = join(seriesPath, name)
      await fs.rm(tmpPath, { recursive: true, force: true }).catch(() => {})
    }
  }
}

export function setupQueue(): void {
  // 孤儿 tmp 清扫：独立、fire-and-forget，与队列读写互不影响。
  cleanupOrphanTmpDirs().catch((err) =>
    console.warn('[queue] orphan cleanup failed:', err)
  )

  // 每次 load 都把未完成任务回退为 interrupted，不依赖「进程是否重启」这个前提
  // （macOS Cmd+W 关窗不退应用、dev 重载、webpush 窗口吊着，都会让 main 进程存活，
  // 此时新窗口仍须拿到 interrupted 才能重弹确认）。配合 artifacts.ts「窗口销毁即取消
  // 在转的卷」，重复回退不会误伤真在跑的转换、也不留孤儿。
  ipcMain.handle('queue:load', async (): Promise<PersistedConvertJob[]> => {
    const revived = reviveJobs(await readQueue())
    await writeQueue(revived)
    return revived
  })

  ipcMain.handle(
    'queue:save',
    async (_event, jobs: PersistedConvertJob[]): Promise<void> => {
      // 静默兜底：renderer 传非数组时视作空数组
      await writeQueue(Array.isArray(jobs) ? jobs : [])
    }
  )
}
