import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const stamp = process.env.BUILD_STAMP || makeBuildStamp()
const env = {
  ...process.env,
  BUILD_STAMP: stamp,
  CSC_IDENTITY_AUTO_DISCOVERY: 'false'
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

function removeNonDmgArtifacts() {
  const distDir = join(root, 'dist')
  if (!existsSync(distDir)) return

  for (const entry of readdirSync(distDir)) {
    if (entry.endsWith('.dmg')) continue
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
run('npm', ['run', 'build'])
run('npm', ['run', 'prepare:dmg-notes'])
run('electron-builder', ['--mac', '--publish', 'never'])
removeNonDmgArtifacts()
printDmgInventory()
