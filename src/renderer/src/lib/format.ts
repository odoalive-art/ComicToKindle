import type { LibraryVolume } from '@/lib/types'

/** 封面右下角标显示的来源格式：压缩包/PDF/EPUB 取真实扩展名（CBZ/ZIP/CBR/PDF…），图片目录走 i18n 文案。 */
export function volumeFormatLabel(vol: LibraryVolume, imagesLabel: string): string {
  if (vol.sourceType === 'folder') return imagesLabel
  const base = vol.path.split(/[/\\]/).pop() ?? ''
  const dot = base.lastIndexOf('.')
  const ext = dot > 0 ? base.slice(dot + 1).toUpperCase() : ''
  return ext || vol.sourceType.toUpperCase()
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// 产物显示标题：书名（漫画名 + 卷册已合一）。旧产物经 main 读取迁移后也带 title。
export function artifactLabel(a: { title?: string; seriesName?: string }): string {
  return a.title || a.seriesName || 'Untitled'
}

// 把 main 返回的投递错误码翻译成当前语言文案；unknown 时附带服务器原始细节
export function deliveryErrorMsg(
  d: { errors: Record<string, string> },
  res: { code?: string; detail?: string }
): string {
  const errors = d.errors
  const known = res.code ? errors[res.code] : undefined
  if (known) return res.code === 'unknown' && res.detail ? `${known}：${res.detail}` : known
  return res.detail ? `${errors.unknown}：${res.detail}` : errors.unknown
}
