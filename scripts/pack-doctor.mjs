import { accessSync, constants as fsConstants, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const errors = []
const warnings = []

function pass(message) {
  console.log(`✓ ${message}`)
}

function fail(message) {
  errors.push(message)
  console.error(`✗ ${message}`)
}

function warn(message) {
  warnings.push(message)
  console.warn(`! ${message}`)
}

function readText(path) {
  return readFileSync(join(root, path), 'utf8')
}

async function checkEsbuild() {
  try {
    const esbuild = await import('esbuild')
    await esbuild.transform('const ok = true', { loader: 'js' })
    pass(`esbuild 可执行 (${esbuild.version})`)
  } catch (error) {
    fail(`esbuild native binary 不可用，请先运行 npm rebuild esbuild。${error.message}`)
  }
}

function checkDependencies(packageJson) {
  const expected = new Set([
    '@electron-toolkit/preload',
    '@electron-toolkit/utils',
    '@napi-rs/canvas',
    '7zip-bin',
    'archiver',
    'electron-updater',
    'fast-xml-parser',
    'nodemailer',
    'pdfjs-dist',
    'sharp'
  ])

  const dependencies = Object.keys(packageJson.dependencies ?? {})
  const extra = dependencies.filter((name) => !expected.has(name))
  const missing = [...expected].filter((name) => !dependencies.includes(name))

  if (extra.length > 0) {
    fail(`dependencies 中出现非 main/preload 运行时依赖：${extra.join(', ')}`)
  }

  if (missing.length > 0) {
    fail(`dependencies 缺少打包运行时依赖：${missing.join(', ')}`)
  }

  const uiLeaks = ['react', 'react-dom', 'radix-ui', 'lucide-react', 'recharts', 'shadcn'].filter((name) =>
    dependencies.includes(name)
  )
  if (uiLeaks.length > 0) {
    fail(`UI/开发依赖误入 dependencies：${uiLeaks.join(', ')}`)
  }

  if (extra.length === 0 && missing.length === 0 && uiLeaks.length === 0) {
    pass('dependencies 分层正常')
  }
}

function checkBuilderConfig() {
  const config = readText('electron-builder.yml')
  const requiredSnippets = [
    ['mac 构建 dmg + zip(自动更新)', /target:[\s\S]*?- dmg[\s\S]*?- zip/],
    ['mac 自定义签名钩子', /identity: ["']-["'][\s\S]*?sign: scripts\/sign-mac\.cjs/],
    ['dmg 文件名包含 BUILD_STAMP', /artifactName: \$\{name}-\$\{version}-\$\{env\.BUILD_STAMP}\.\$\{ext}/],
    ['dmg 关闭 blockmap/update info', /writeUpdateInfo: false/],
    ['dmg 包含版本说明文件', /name: 版本说明\.txt/],
    ['publish feed = GitHub', /publish:\n\s*provider: github/],
    ['排除 agent 本地目录', /!\{\.claude,\.gemini}\/\*\*/],
    ['排除 mac x64 7za', /!node_modules\/7zip-bin\/mac\/x64\/\*\*/],
    ['unpack PDF canvas native 依赖', /node_modules\/@napi-rs\/canvas-\*\/\*\*/],
    ['waifu2x 引擎随 resources/** 解包', /asarUnpack:[\s\S]*?- resources\/\*\*/]
  ]

  let ok = true
  for (const [label, pattern] of requiredSnippets) {
    if (pattern.test(config)) {
      pass(label)
    } else {
      ok = false
      fail(`electron-builder.yml 未满足：${label}`)
    }
  }

  return ok
}

function checkReleaseNotes(packageJson) {
  try {
    const notes = readText('docs/release-notes.md')
    const escapedVersion = packageJson.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`^## ${escapedVersion}(?:\\s|$)`, 'm').test(notes)) {
      pass(`版本说明包含当前版本章节 ${packageJson.version}`)
      return
    }

    if (notes.includes('## 当前内测版')) {
      pass('版本说明包含当前内测版兜底章节')
      return
    }

    fail('docs/release-notes.md 缺少当前版本章节或“当前内测版”兜底章节')
  } catch (error) {
    fail(`无法读取 docs/release-notes.md：${error.message}`)
  }
}

function checkBuildStampEnv() {
  const stamp = process.env.BUILD_STAMP
  if (!stamp) {
    pass('BUILD_STAMP 未预设，build:mac 会自动生成')
    return
  }

  if (/^\d{8}-\d{6}$/.test(stamp)) {
    pass(`BUILD_STAMP 格式正确 (${stamp})`)
  } else {
    fail(`BUILD_STAMP 格式应为 YYYYMMDD-HHMMSS，当前为 ${stamp}`)
  }
}

function checkUpscaleEngine() {
  // waifu2x 引擎不进 git（数十 MB），由 npm run fetch:upscale 拉到 resources/waifu2x-ncnn-vulkan/。
  // 缺失 → 警告（打包前补拉，不挡日常体检）；存在但坏（没执行位/缺模型）→ 失败。
  const engineDir = join(root, 'resources', 'waifu2x-ncnn-vulkan')
  const binary = join(engineDir, 'waifu2x-ncnn-vulkan')
  const modelDir = join(engineDir, 'models-cunet')

  let binaryOk = false
  try {
    statSync(binary)
    binaryOk = true
  } catch {
    warn('waifu2x 引擎未拉取（resources/waifu2x-ncnn-vulkan/）。打包前先运行 npm run fetch:upscale。')
    return
  }

  if (binaryOk) {
    try {
      accessSync(binary, fsConstants.X_OK)
      pass('waifu2x 二进制存在且可执行')
    } catch {
      fail('waifu2x 二进制缺执行位，请运行 npm run fetch:upscale 重新拉取（脚本会 chmod +x）。')
    }
  }

  try {
    if (statSync(modelDir).isDirectory() && readdirSync(modelDir).length > 0) {
      pass('waifu2x cunet 模型目录就绪')
    } else {
      fail('waifu2x models-cunet 目录为空。')
    }
  } catch {
    fail('waifu2x 缺 models-cunet 模型目录，请运行 npm run fetch:upscale。')
  }
}

function checkPackageVersion(packageJson) {
  if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
    pass(`package.json 版本号格式正常 (${packageJson.version})`)
  } else {
    fail(`package.json 版本号不是有效 semver：${packageJson.version}`)
  }
}

const packageJson = JSON.parse(readText('package.json'))

console.log('打包体检开始...\n')
checkPackageVersion(packageJson)
checkDependencies(packageJson)
checkBuilderConfig()
checkReleaseNotes(packageJson)
checkBuildStampEnv()
checkUpscaleEngine()
await checkEsbuild()

if (warnings.length > 0) {
  console.log(`\n警告：${warnings.length} 项`)
}

if (errors.length > 0) {
  console.error(`\n打包体检未通过：${errors.length} 项`)
  process.exit(1)
}

console.log('\n打包体检通过')
