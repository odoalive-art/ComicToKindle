// 拉取 waifu2x-ncnn-vulkan（AI 放大引擎）的 macOS 二进制 + cunet 模型到 resources/。
//
// 为什么用脚本而不是把二进制提交进 git：二进制 + 模型有数十 MB，不该进版本库。
// 本脚本把固定版本的官方 release 拉下来、解压、只取 `waifu2x-ncnn-vulkan` 可执行文件
// 与 `models-cunet/`（本期默认模型），放到 `resources/waifu2x-ncnn-vulkan/`（已 gitignore）。
// 打包前（electron-builder pack / release-mac）必须先跑本脚本，否则产物里没有引擎。
//
// 用法：npm run fetch:upscale        （缺失才拉，幂等）
//       npm run fetch:upscale -- --force   （强制重拉）
//
// 路径契约（与 src/main/upscale.ts 的 resolveEngineResources 对齐）：
//   resources/waifu2x-ncnn-vulkan/waifu2x-ncnn-vulkan   ← 可执行文件（+x）
//   resources/waifu2x-ncnn-vulkan/models-cunet/         ← cunet 模型目录
// dev 联调可用环境变量覆盖：CTK_WAIFU2X_BIN / CTK_WAIFU2X_MODELS。

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

// 固定版本，保证可复现。升级时改这里并更新 SHA256（设为 null 跳过校验）。
const VERSION = '20250915'
const ASSET = `waifu2x-ncnn-vulkan-${VERSION}-macos.zip`
const URL = `https://github.com/nihui/waifu2x-ncnn-vulkan/releases/download/${VERSION}/${ASSET}`
const SHA256 = 'a5b58b239eb3aa030db5464f6759637fe412d8c07891a4346ea57f708b514d42'

const MODEL = 'cunet' // 本期默认模型；只取这个目录，少打几十 MB
const destDir = join(root, 'resources', 'waifu2x-ncnn-vulkan')
const destBin = join(destDir, 'waifu2x-ncnn-vulkan')
const destModels = join(destDir, `models-${MODEL}`)

const force = process.argv.includes('--force')

if (!force && existsSync(destBin) && existsSync(destModels)) {
  console.log(`✓ waifu2x 引擎已就绪：${destDir}（--force 可强制重拉）`)
  process.exit(0)
}

const work = mkdtempSync(join(tmpdir(), 'ctk-waifu2x-'))
const zipPath = join(work, ASSET)

try {
  console.log(`↓ 下载 ${URL}`)
  execFileSync('curl', ['-fL', '--retry', '3', '-o', zipPath, URL], { stdio: 'inherit' })

  if (SHA256 && !SHA256.startsWith('__')) {
    const actual = createHash('sha256').update(readFileSync(zipPath)).digest('hex')
    if (actual !== SHA256) {
      throw new Error(`SHA256 校验失败：期望 ${SHA256}，实际 ${actual}`)
    }
    console.log('✓ SHA256 校验通过')
  } else {
    const actual = createHash('sha256').update(readFileSync(zipPath)).digest('hex')
    console.log(`! 未配置 SHA256 校验。本次下载 sha256=${actual}（可填回脚本 SHA256 常量启用校验）`)
  }

  console.log('… 解压')
  execFileSync('unzip', ['-q', '-o', zipPath, '-d', work], { stdio: 'inherit' })

  // release 解压后为 waifu2x-ncnn-vulkan-<version>-macos/ 子目录
  const extracted = join(work, `waifu2x-ncnn-vulkan-${VERSION}-macos`)
  const srcBin = join(extracted, 'waifu2x-ncnn-vulkan')
  const srcModels = join(extracted, `models-${MODEL}`)
  if (!existsSync(srcBin)) throw new Error(`解压包里找不到二进制：${srcBin}`)
  if (!existsSync(srcModels)) throw new Error(`解压包里找不到模型目录：${srcModels}`)

  rmSync(destDir, { recursive: true, force: true })
  mkdirSync(destDir, { recursive: true })
  cpSync(srcBin, destBin)
  chmodSync(destBin, 0o755) // 确保执行位（iCloud/解压可能丢）
  cpSync(srcModels, destModels, { recursive: true })

  // 官方 macos 包是 x86_64+arm64 universal；内测包只发 arm64（同 7zip-bin 只留 mac/arm64），
  // 把二进制瘦到 arm64 省 ~11MB。lipo 不在或已是单架构则跳过。
  try {
    const info = execFileSync('lipo', ['-archs', destBin], { encoding: 'utf8' }).trim()
    if (info.includes('x86_64') && info.includes('arm64')) {
      execFileSync('lipo', ['-thin', 'arm64', destBin, '-output', destBin])
      chmodSync(destBin, 0o755)
      console.log('✓ 已瘦身为 arm64')
    }
  } catch {
    console.log('! 跳过 lipo 瘦身（无 lipo 或非 universal）')
  }

  console.log(`✓ 已就绪：${destBin}`)
  console.log(`✓ 模型：${destModels}`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
