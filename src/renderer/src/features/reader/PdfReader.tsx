import React, { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uiText, type LanguageMode } from '@/i18n'
import type { LibraryVolume } from '@/lib/types'

export interface PdfReaderProps {
  volume: LibraryVolume
  locale: LanguageMode
  onClose: () => void
}

/**
 * PDF 来源阅读器：用 comic:// 把原 PDF 喂给 Chromium 内置查看器（PDFium）直接渲染，
 * 秒开、无需预渲染整本。代价是失去统一阅读器的双页/RTL/续读（PDF 转 Kindle 时才整本渲染）。
 */
export function PdfReader({
  volume,
  locale,
  onClose
}: PdfReaderProps): React.JSX.Element {
  const text = uiText[locale]
  const src = `comic://img/?p=${encodeURIComponent(volume.path)}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header
        className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft className="size-4 text-muted-foreground" strokeWidth={1.75} />
          {text.reader.back}
        </Button>
        <span
          className="min-w-0 truncate text-sm font-semibold text-foreground"
          title={volume.title}
        >
          {volume.title}
        </span>
      </header>
      <iframe
        title={volume.title}
        src={src}
        className="min-h-0 w-full flex-1 border-0 bg-neutral-900"
      />
    </div>
  )
}
export default PdfReader
