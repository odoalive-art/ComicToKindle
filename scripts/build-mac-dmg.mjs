import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const stamp = process.env.BUILD_STAMP || makeBuildStamp()

// 自签发布：传 CTK_SIGN_IDENTITY=<自签证书名> 即用自签证书签名（自动更新依赖
// 稳定签名身份）。不传则回落 ad-hoc（关掉证书查找，避免本机同名证书 ambiguous）。
const signIdentity = process.env.CTK_SIGN_IDENTITY?.trim()
const env = {
  ...process.env,
  BUILD_STAMP: stamp,
  CSC_IDENTITY_AUTO_DISCOVERY: signIdentity ? 'true' : 'false'
}

function makeBuildStamp() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('')
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: false
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// ad-hoc 构建只留 dmg；自签发布构建额外保留自动更新所需产物（zip + latest-mac.yml
// + blockmap），否则 electron-updater 找不到更新来源。
function cleanupArtifacts() {
  const distDir = join(root, 'dist')
  if (!existsSync(distDir)) return

  const keepExt = signIdentity
    ? ['.dmg', '.zip', '.blockmap', '.yml']
    : ['.dmg']

  for (const entry of readdirSync(distDir)) {
    if (keepExt.some((ext) => entry.endsWith(ext))) continue
    rmSync(join(distDir, entry), { recursive: true, force: true })
  }
}

function printDmgInventory() {
  const distDir = join(root, 'dist')
  if (!existsSync(distDir)) return

  const dmgs = readdirSync(distDir)
    .filter((entry) => entry.endsWith('.dmg'))
    .sort()

  console.log('\n当前 dist/ 中保留的 dmg：')
  for (const dmg of dmgs) {
    const sizeMb = statSync(join(distDir, dmg)).size / 1024 / 1024
    console.log(`- ${dmg} (${sizeMb.toFixed(1)} MB)`)
  }
}

console.log(`mac dmg 构建标识：${stamp}`)
console.log(signIdentity ? `签名身份（自签）：${signIdentity}` : '签名：ad-hoc（无自动更新）')
run('npm', ['run', 'build'])
run('npm', ['run', 'prepare:dmg-notes'])

const builderArgs = ['--mac', '--publish', 'never']
// 用自签证书名覆盖 electron-builder.yml 里的 identity:null
if (signIdentity) builderArgs.push(`-c.mac.identity=${signIdentity}`)
run('electron-builder', builderArgs)

cleanupArtifacts()
printDmgInventory()
