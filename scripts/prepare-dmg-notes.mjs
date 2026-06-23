import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const sourcePath = join(root, 'docs', 'release-notes.md')
const outputPath = join(root, 'build', 'release-notes-current.txt')

function formatStamp(stamp) {
  if (!stamp || !/^\d{8}-\d{6}$/.test(stamp)) {
    return new Date().toLocaleString('zh-CN', { hour12: false })
  }

  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)} ${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}`
}

function getGitRevision() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return 'unknown'
  }
}

function extractSection(markdown, version) {
  const lines = markdown.split(/\r?\n/)
  const sections = []
  let current = null

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line)
    if (match) {
      if (current) sections.push(current)
      current = { title: match[1], lines: [] }
      continue
    }

    if (current) current.lines.push(line)
  }

  if (current) sections.push(current)

  const preferred =
    sections.find((section) => section.title === version) ??
    sections.find((section) => section.title.startsWith(`${version} `)) ??
    sections.find((section) => section.title === '当前内测版') ??
    sections[0]

  return preferred?.lines.join('\n').trim() || '本版本暂无单独维护的变更说明。'
}

const notes = extractSection(readFileSync(sourcePath, 'utf8'), packageJson.version)
const buildStamp = process.env.BUILD_STAMP || ''
const content = [
  `ComicToKindle ${packageJson.version} 版本说明`,
  '',
  `构建时间：${formatStamp(buildStamp)}`,
  `构建标识：${buildStamp || '未设置'}`,
  `Git 修订：${getGitRevision()}`,
  '',
  notes,
  ''
].join('\n')

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, content)
console.log(`已生成 dmg 版本说明：${outputPath}`)
