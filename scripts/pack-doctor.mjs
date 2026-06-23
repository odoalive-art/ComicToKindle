import { readFileSync } from 'node:fs'
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
    ['mac 只构建 dmg', /mac:\n(?:  .+\n)*  target:\n    - dmg/],
    ['dmg 文件名包含 BUILD_STAMP', /artifactName: \$\{name}-\$\{version}-\$\{env\.BUILD_STAMP}\.\$\{ext}/],
    ['dmg 关闭 blockmap/update info', /writeUpdateInfo: false/],
    ['dmg 包含版本说明文件', /name: 版本说明\.txt/],
    ['publish 已关闭', /publish: null/],
    ['排除 agent 本地目录', /!\{\.claude,\.gemini}\/\*\*/],
    ['排除 mac x64 7za', /!node_modules\/7zip-bin\/mac\/x64\/\*\*/],
    ['unpack PDF canvas native 依赖', /node_modules\/@napi-rs\/canvas-\*\/\*\*/]
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
await checkEsbuild()

if (warnings.length > 0) {
  console.log(`\n警告：${warnings.length} 项`)
}

if (errors.length > 0) {
  console.error(`\n打包体检未通过：${errors.length} 项`)
  process.exit(1)
}

console.log('\n打包体检通过')
