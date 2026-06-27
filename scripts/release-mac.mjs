import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

function readVersion() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
}

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...extraEnv }
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// 正式发布包要能被旧版本自动更新，必须：① 自签证书签名（稳定签名身份）② 上传到
// GitHub Release（自动更新 feed）。加 --local 可只出本地签名包不上传（调试用）。
const signIdentity = process.env.CTK_SIGN_IDENTITY?.trim()
const hasToken = !!(process.env.GH_TOKEN || process.env.GITHUB_TOKEN)
const localOnly = process.argv.includes('--local')

const problems = []
if (!signIdentity) {
  problems.push(
    '缺少 CTK_SIGN_IDENTITY（自签证书名）。自动更新依赖稳定签名身份，ad-hoc 包装不上更新。'
  )
}
if (!localOnly && !hasToken) {
  problems.push('缺少 GH_TOKEN（或 GITHUB_TOKEN），上传 GitHub Release 需要。或加 --local 只出本地包。')
}

if (problems.length > 0) {
  console.error('发布前置条件未满足：')
  for (const p of problems) console.error(`  ✗ ${p}`)
  console.error(
    '\n示例：CTK_SIGN_IDENTITY="ComicToKindle Self-Signed" GH_TOKEN=ghp_xxx npm run release:mac'
  )
  process.exit(1)
}

const beforeVersion = readVersion()
console.log(`准备发布 macOS 包：当前版本 ${beforeVersion}`)
console.log(`签名身份（自签）：${signIdentity}`)
console.log(localOnly ? '模式：仅本地出包（不上传）' : '模式：签名出包 + 上传 GitHub Release')

console.log('\n步骤 1/4：打包体检')
run('npm', ['run', 'pack:doctor'])

console.log('\n步骤 2/4：预构建验证（版本号暂不递增）')
run('npm', ['run', 'build'])

console.log('\n步骤 3/4：递增 prerelease 版本号')
run('npm', ['version', 'prerelease', '--no-git-tag-version'])
const afterVersion = readVersion()
console.log(`版本号已更新：${beforeVersion} -> ${afterVersion}`)

console.log(`\n步骤 4/4：签名出包${localOnly ? '' : ' + 上传 GitHub Release'}`)
run('npm', ['run', 'build:mac'], { CTK_PUBLISH: localOnly ? 'never' : 'always' })

console.log(`\nmacOS 发布构建完成：${afterVersion}`)
if (localOnly) {
  console.log('产物在 dist/（dmg + zip + latest-mac.yml）。')
} else {
  console.log(
    '已上传到 GitHub Release（electron-builder 默认建草稿）。\n' +
      '⚠️ 去仓库 Releases 页面把该草稿「发布」出来，旧版本客户端才能检测到更新。\n' +
      '别忘了提交 package.json 的版本号变更。'
  )
}
