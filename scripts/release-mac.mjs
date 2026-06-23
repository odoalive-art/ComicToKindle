import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

function readVersion() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const beforeVersion = readVersion()

console.log(`准备发布 macOS 内测包：当前版本 ${beforeVersion}`)
console.log('\n步骤 1/4：打包体检')
run('npm', ['run', 'pack:doctor'])

console.log('\n步骤 2/4：预构建验证（版本号暂不递增）')
run('npm', ['run', 'build'])

console.log('\n步骤 3/4：递增 prerelease 版本号')
run('npm', ['version', 'prerelease', '--no-git-tag-version'])

const afterVersion = readVersion()
console.log(`版本号已更新：${beforeVersion} -> ${afterVersion}`)

console.log('\n步骤 4/4：生成 dmg')
run('npm', ['run', 'build:mac'])

console.log(`\nmacOS 内测包发布构建完成：${afterVersion}`)
