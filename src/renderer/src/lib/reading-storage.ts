// ---------- 阅读偏好与进度（持久化于 localStorage） ----------
export type ReadingDirection = 'ltr' | 'rtl'
export type ReadingMode = 'single' | 'double'

export const READING_DIR_KEY = 'comic-to-kindle-reading-direction'
export const READING_MODE_KEY = 'comic-to-kindle-reading-mode'
export const READING_PROGRESS_KEY = 'comic-to-kindle-reading-progress'

export function getInitialDirection(): ReadingDirection {
  return window.localStorage.getItem(READING_DIR_KEY) === 'rtl' ? 'rtl' : 'ltr'
}
export function getInitialMode(): ReadingMode {
  return window.localStorage.getItem(READING_MODE_KEY) === 'double' ? 'double' : 'single'
}
export function readProgressMap(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(READING_PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}
export function getProgress(volumePath: string): number {
  const value = readProgressMap()[volumePath]
  return typeof value === 'number' ? value : 0
}
export function saveProgress(volumePath: string, index: number): void {
  const map = readProgressMap()
  map[volumePath] = index
  try {
    window.localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(map))
  } catch {
    /* 忽略写入失败 */
  }
}
