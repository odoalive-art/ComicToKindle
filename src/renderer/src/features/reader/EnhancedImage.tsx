import React, { useEffect, useState } from 'react'
import type { LanguageMode } from '@/i18n'
import { cn } from '@/lib/utils'

export type EnhanceStatus = 'idle' | 'enhancing' | 'enhanced' | 'failed' | 'original'

/** 增强状态角标文案/样式（状态显形）：让用户随时知道当前页是不是真增强了 */
export function enhanceBadge(
  status: EnhanceStatus | 'compare',
  locale: LanguageMode
): { label: string; dot: string } | null {
  const zh = locale === 'zh'
  switch (status) {
    case 'enhancing':
      return { label: zh ? '增强中…' : 'Enhancing…', dot: 'bg-amber-400 animate-pulse' }
    case 'enhanced':
      return { label: zh ? '已增强' : 'Enhanced', dot: 'bg-emerald-400' }
    case 'failed':
      return { label: zh ? '增强失败 · 原图' : 'Failed · original', dot: 'bg-red-400' }
    case 'original':
      return { label: zh ? '未增强 · 原图' : 'Off · original', dot: 'bg-zinc-400' }
    case 'compare':
      return { label: zh ? '原图（对比）' : 'Original (compare)', dot: 'bg-white' }
    default:
      return null
  }
}

export interface EnhancedImageProps {
  src: string
  enhance: boolean
  locale: LanguageMode
  /** 「按住对比原图」按下时为 true：强制显示原图并标注对比态 */
  forceOriginal?: boolean
  alt?: string
  className?: string
  style?: React.CSSProperties
  draggable?: boolean
  containerClassName?: string
}

export const EnhancedImage = React.memo(function EnhancedImage({
  src,
  enhance,
  locale,
  forceOriginal,
  alt,
  className,
  style,
  draggable,
  containerClassName
}: EnhancedImageProps): React.JSX.Element {
  const enhancedUrl = `${src}${src.includes('?') ? '&' : '?'}enhance=1`
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [peekResult, setPeekResult] = useState<{
    url: string
    status: 'enhanced' | 'original' | 'failed'
  } | null>(null)

  useEffect(() => {
    if (!enhance) return
    let active = true

    let sourcePath: string | null = null
    try {
      const url = new URL(src)
      if (url.protocol === 'comic:') sourcePath = url.searchParams.get('p')
    } catch {
      // 非法 URL 交给下面的统一失败态处理。
    }

    if (!sourcePath) {
      console.warn('[upscale] 本页增强失败: 无法从 comic:// URL 取得源图片路径')
      queueMicrotask(() => {
        if (active) setPeekResult({ url: enhancedUrl, status: 'failed' })
      })
      return () => {
        active = false
      }
    }

    // 增强图以独立叠层加载；IPC 只确认协议响应是否来自增强缓存。
    // 原图节点始终保留在下层，避免同一个 <img> 换 src 时出现黑帧。
    window.api.upscale
      .peek(sourcePath)
      .then((result) => {
        if (!active) return
        if (result.status === '1') {
          setPeekResult({ url: enhancedUrl, status: 'enhanced' })
        } else if (result.status === '0') {
          setPeekResult({ url: enhancedUrl, status: 'original' })
        } else {
          console.warn('[upscale] 本页增强失败:', result.error ?? '(无失败原因)')
          setPeekResult({ url: enhancedUrl, status: 'failed' })
        }
      })
      .catch((error) => {
        if (active) {
          console.warn(
            '[upscale] 本页增强失败:',
            error instanceof Error ? error.message : String(error)
          )
          setPeekResult({ url: enhancedUrl, status: 'failed' })
        }
      })

    return () => {
      active = false
    }
  }, [enhance, enhancedUrl, src])

  const currentPeekStatus = peekResult?.url === enhancedUrl ? peekResult.status : 'pending'
  const ready = enhance && loadedUrl === enhancedUrl && currentPeekStatus === 'enhanced'
  const status: EnhanceStatus = !enhance
    ? 'idle'
    : currentPeekStatus === 'failed'
      ? 'failed'
      : currentPeekStatus === 'original'
        ? 'original'
        : ready
          ? 'enhanced'
          : 'enhancing'

  const badge = enhance ? enhanceBadge(forceOriginal ? 'compare' : status, locale) : null

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        containerClassName
      )}
    >
      <img src={src} alt={alt} draggable={draggable} style={style} className={className} />
      {enhance ? (
        <img
          src={enhancedUrl}
          alt=""
          aria-hidden
          draggable={false}
          style={style}
          onLoad={() => setLoadedUrl(enhancedUrl)}
          onError={() => setPeekResult({ url: enhancedUrl, status: 'failed' })}
          className={cn(
            className,
            'pointer-events-none absolute inset-0 m-auto transition-opacity duration-200 ease-out motion-reduce:transition-none',
            ready && !forceOriginal ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : null}
      {badge ? (
        <div
          className={cn(
            'absolute bottom-2 right-2 z-10 flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm select-none pointer-events-none transition-transform duration-200 motion-reduce:transition-none',
            ready ? 'animate-in fade-in zoom-in-95 duration-200' : ''
          )}
        >
          <span className={cn('size-1.5 rounded-full', badge.dot)} />
          <span>{badge.label}</span>
        </div>
      ) : null}
    </div>
  )
})
