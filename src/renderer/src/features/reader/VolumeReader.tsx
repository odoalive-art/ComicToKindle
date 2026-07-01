import React, { useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  BookText,
  Sparkles,
  Blend,
  Shrink,
  Fullscreen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uiText, type LanguageMode } from '@/i18n'
import type { LibraryVolume } from '@/lib/types'
import {
  ReadingDirection,
  ReadingMode,
  getInitialDirection,
  getInitialMode,
  getProgress,
  saveProgress
} from '@/lib/reading-storage'
import { EnhancedImage } from './EnhancedImage'

export interface VolumeReaderProps {
  volume: LibraryVolume
  locale: LanguageMode
  onClose: () => void
}

export function VolumeReader({
  volume,
  locale,
  onClose
}: VolumeReaderProps): React.JSX.Element {
  const text = uiText[locale]
  const [pages, setPages] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<ReadingDirection>(getInitialDirection)
  const [mode, setMode] = useState<ReadingMode>(getInitialMode)
  const [enhance, setEnhance] = useState(false)
  const [scrubIndex, setScrubIndex] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [pageJumpOpen, setPageJumpOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const readerRef = useRef<HTMLDivElement>(null)
  const controlsTimerRef = useRef<number | null>(null)
  // 「按住对比原图」：按下时强制显示原图，用来直接肉眼验证增强是否生效
  const [compareOriginal, setCompareOriginal] = useState(false)

  // 读取 upscale 默认配置
  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('upscale:getConfig')
      .then((cfg) => {
        if (cfg && typeof cfg.enabled === 'boolean') {
          setEnhance(cfg.enabled)
        }
      })
      .catch((err) => console.error('Failed to get upscale config:', err))
  }, [])

  const toggleEnhance = async (): Promise<void> => {
    const next = !enhance
    setEnhance(next)
    setCompareOriginal(false)
    try {
      await window.electron.ipcRenderer.invoke('upscale:setConfig', { enabled: next })
    } catch (err) {
      console.error('Failed to save upscale config:', err)
    }
  }

  // 加载页面并恢复上次阅读进度
  useEffect(() => {
    let active = true
    setLoading(true)
    window.api.library
      .listPages(volume.path)
      .then((p) => {
        if (!active) return
        setPages(p)
        setIndex(Math.min(getProgress(volume.path), Math.max(0, p.length - 1)))
      })
      .catch((err) => toast.error(`${err}`))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [volume.path])

  const total = pages.length
  const step = mode === 'double' ? 2 : 1
  const goPrev = React.useCallback(() => setIndex((i) => Math.max(0, i - step)), [step])
  const goNext = React.useCallback(
    () => setIndex((i) => Math.min(total - 1, i + step)),
    [total, step]
  )

  const showControls = React.useCallback((): void => {
    setControlsVisible(true)
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current)
    if (
      document.fullscreenElement === readerRef.current &&
      !isScrubbing &&
      !compareOriginal &&
      !pageJumpOpen
    ) {
      controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 1600)
    }
  }, [compareOriginal, isScrubbing, pageJumpOpen])

  useEffect(() => {
    if (document.fullscreenElement === readerRef.current) showControls()
  }, [pageJumpOpen, showControls])

  useEffect(() => {
    const onFullscreenChange = (): void => {
      const next = document.fullscreenElement === readerRef.current
      setIsFullscreen(next)
      setControlsVisible(true)
      if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current)
      controlsTimerRef.current = next
        ? window.setTimeout(() => setControlsVisible(false), 1600)
        : null
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current)
    }
  }, [])

  const toggleFullscreen = React.useCallback(async (): Promise<void> => {
    try {
      if (document.fullscreenElement === readerRef.current) await document.exitFullscreen()
      else await readerRef.current?.requestFullscreen()
    } catch {
      toast.error(text.reader.fullscreenFailed)
    }
  }, [text.reader.fullscreenFailed])

  const alignPageIndex = React.useCallback(
    (value: number): number => {
      const clamped = Math.max(0, Math.min(total - 1, Math.round(value)))
      return mode === 'double' ? Math.floor(clamped / 2) * 2 : clamped
    },
    [mode, total]
  )

  const commitScrub = React.useCallback(
    (value: number): void => {
      const next = alignPageIndex(value)
      setScrubIndex(next)
      setIndex(next)
      setIsScrubbing(false)
      showControls()
    },
    [alignPageIndex, showControls]
  )

  // 原图始终并行预热，AI 增强则按「后两跨页 → 前一跨页」串行排队。
  // 快速拖动进度条时暂停 AI 预热，松手后从新位置重新排队，避免放大已跳过页面。
  useEffect(() => {
    if (loading || total === 0) return
    let active = true
    const pendingImages = new Set<HTMLImageElement>()
    const starts = [index + step, index + step * 2, index - step]
    const priorityIndices: number[] = []
    const seen = new Set<number>()
    for (const start of starts) {
      const count = mode === 'double' ? 2 : 1
      for (let offset = 0; offset < count; offset += 1) {
        const pageIndex = start + offset
        if (pageIndex < 0 || pageIndex >= total || seen.has(pageIndex)) continue
        seen.add(pageIndex)
        priorityIndices.push(pageIndex)
      }
    }

    for (const pageIndex of priorityIndices) {
      const image = new Image()
      pendingImages.add(image)
      image.onload = image.onerror = () => pendingImages.delete(image)
      image.src = pages[pageIndex]
    }

    if (enhance && !isScrubbing) {
      void (async () => {
        for (const pageIndex of priorityIndices) {
          if (!active) break
          await new Promise<void>((resolve) => {
            const image = new Image()
            pendingImages.add(image)
            image.onload = image.onerror = () => {
              pendingImages.delete(image)
              resolve()
            }
            const url = pages[pageIndex]
            image.src = `${url}${url.includes('?') ? '&' : '?'}enhance=1`
          })
        }
      })()
    }

    return () => {
      active = false
      for (const image of pendingImages) {
        image.onload = null
        image.onerror = null
        image.src = ''
      }
      pendingImages.clear()
    }
  }, [enhance, index, isScrubbing, loading, mode, pages, step, total])

  // 持久化进度
  useEffect(() => {
    if (!loading && total > 0) saveProgress(volume.path, index)
  }, [index, loading, total, volume.path])

  const toggleDirection = (): void => {
    const next = direction === 'ltr' ? 'rtl' : 'ltr'
    setDirection(next)
    window.localStorage.setItem('comic-to-kindle-reading-direction', next)
    toast(
      `${text.reader.toggleDirection}: ${next === 'rtl' ? text.reader.directionRtl : text.reader.directionLtr}`
    )
  }
  const toggleMode = (): void => {
    const next = mode === 'single' ? 'double' : 'single'
    setMode(next)
    window.localStorage.setItem('comic-to-kindle-reading-mode', next)
    toast(
      `${text.reader.toggleMode}: ${next === 'double' ? text.reader.modeDouble : text.reader.modeSingle}`
    )
  }

  // 键盘导航
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (pageJumpOpen) {
          e.preventDefault()
          setPageJumpOpen(false)
          setIsScrubbing(false)
          setScrubIndex(index)
          return
        }
        if (document.fullscreenElement === readerRef.current) {
          e.preventDefault()
          void document.exitFullscreen()
          return
        }
        onClose()
        return
      }
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        void toggleFullscreen()
        return
      }
      const rtl = direction === 'rtl'
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        rtl ? goPrev() : goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        rtl ? goNext() : goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [direction, goNext, goPrev, index, onClose, pageJumpOpen, toggleFullscreen])

  const rtl = direction === 'rtl'
  const isDouble = mode === 'double'
  const atFirst = index === 0
  const atLast = index + step >= total
  const hasSecond = isDouble && index + 1 < total
  const counter = hasSecond
    ? `${index + 1}–${index + 2} / ${total}`
    : text.reader.pageOf(index + 1, total)
  const sliderIndex = isScrubbing ? scrubIndex : index
  const directionLabel = `${text.reader.toggleDirection}: ${rtl ? text.reader.directionRtl : text.reader.directionLtr}`
  const modeLabel = `${text.reader.toggleMode}: ${isDouble ? text.reader.modeDouble : text.reader.modeSingle}`
  const enhanceLabel =
    locale === 'zh'
      ? `AI 画面增强: ${enhance ? '已开启' : '已关闭'}`
      : `AI Image Enhancement: ${enhance ? 'ON' : 'OFF'}`
  const compareLabel = locale === 'zh' ? '按住对比原图' : 'Hold to compare original'
  const fullscreenLabel = isFullscreen ? text.reader.exitFullscreen : text.reader.fullscreen

  return (
    <div
      ref={readerRef}
      onPointerMove={showControls}
      className="relative flex min-h-0 flex-1 flex-col bg-background"
    >
      <header
        className={cn(
          'flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[opacity,transform] duration-200 motion-reduce:transition-none',
          isFullscreen && 'absolute inset-x-0 top-0 z-20 bg-background/85 backdrop-blur-md',
          isFullscreen && !controlsVisible && 'pointer-events-none -translate-y-full opacity-0'
        )}
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
        {total > 0 ? (
          <div
            className="ml-auto flex shrink-0 items-center gap-1"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleDirection}>
                  <ArrowLeftRight
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="sr-only">{directionLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{directionLabel}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleMode}>
                  {isDouble ? (
                    <BookOpen className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  ) : (
                    <BookText className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  )}
                  <span className="sr-only">{modeLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{modeLabel}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleEnhance}
                  aria-pressed={enhance}
                  className={enhance ? 'bg-accent' : undefined}
                >
                  <Sparkles className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  <span className="sr-only">{enhanceLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{enhanceLabel}</TooltipContent>
            </Tooltip>
            {enhance ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPointerDown={() => setCompareOriginal(true)}
                    onPointerUp={() => setCompareOriginal(false)}
                    onPointerLeave={() => setCompareOriginal(false)}
                    onPointerCancel={() => setCompareOriginal(false)}
                  >
                    <Blend className="size-4 text-muted-foreground" strokeWidth={1.75} />
                    <span className="sr-only">{compareLabel}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{compareLabel}</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => void toggleFullscreen()}>
                  {isFullscreen ? (
                    <Shrink className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  ) : (
                    <Fullscreen className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  )}
                  <span className="sr-only">{fullscreenLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{fullscreenLabel}</TooltipContent>
            </Tooltip>
            <Popover
              open={pageJumpOpen}
              onOpenChange={(open) => {
                setPageJumpOpen(open)
                if (!open) {
                  setIsScrubbing(false)
                  setScrubIndex(index)
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 text-sm tabular-nums text-muted-foreground"
                  aria-label={text.reader.quickJump}
                >
                  {counter}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 p-4"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                onEscapeKeyDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setPageJumpOpen(false)
                  setIsScrubbing(false)
                  setScrubIndex(index)
                }}
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{text.reader.quickJump}</span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {sliderIndex + 1} / {total}
                  </span>
                </div>
                <Slider
                  aria-label={text.reader.quickJump}
                  min={0}
                  max={Math.max(0, total - 1)}
                  step={1}
                  value={[sliderIndex]}
                  onValueChange={(value) => {
                    setIsScrubbing(true)
                    setScrubIndex(alignPageIndex(value[0]))
                    showControls()
                  }}
                  onValueCommit={(value) => commitScrub(value[0])}
                  onPointerCancel={() => {
                    setIsScrubbing(false)
                    setScrubIndex(index)
                  }}
                  className="mt-4"
                />
                <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                  <span>1</span>
                  <span>{total}</span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-muted-foreground" />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {text.reader.emptyVolume}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-900">
          {isDouble ? (
            <div className={`flex h-full w-full ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <EnhancedImage
                key={pages[index]}
                src={pages[index]}
                enhance={enhance}
                locale={locale}
                forceOriginal={compareOriginal}
                alt={`${index + 1}`}
                draggable={false}
                style={{ objectPosition: rtl ? 'left' : 'right' }}
                className="h-full w-full object-contain select-none"
                containerClassName="h-full w-1/2"
              />
              {hasSecond ? (
                <EnhancedImage
                  key={pages[index + 1]}
                  src={pages[index + 1]}
                  enhance={enhance}
                  locale={locale}
                  forceOriginal={compareOriginal}
                  alt={`${index + 2}`}
                  draggable={false}
                  style={{ objectPosition: rtl ? 'right' : 'left' }}
                  className="h-full w-full object-contain select-none"
                  containerClassName="h-full w-1/2"
                />
              ) : null}
            </div>
          ) : (
            <EnhancedImage
              key={pages[index]}
              src={pages[index]}
              enhance={enhance}
              locale={locale}
              forceOriginal={compareOriginal}
              alt={`${index + 1}`}
              draggable={false}
              className="max-h-full max-w-full object-contain select-none"
              containerClassName="h-full w-full"
            />
          )}

          {/* 左半区 */}
          <button
            type="button"
            aria-label={rtl ? text.reader.next : text.reader.prev}
            onClick={rtl ? goNext : goPrev}
            disabled={rtl ? atLast : atFirst}
            className="group absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-3 disabled:pointer-events-none"
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity',
                isFullscreen && !controlsVisible
                  ? 'group-hover:opacity-0'
                  : 'group-hover:opacity-100'
              )}
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
            </span>
          </button>
          {/* 右半区 */}
          <button
            type="button"
            aria-label={rtl ? text.reader.prev : text.reader.next}
            onClick={rtl ? goPrev : goNext}
            disabled={rtl ? atFirst : atLast}
            className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-3 disabled:pointer-events-none"
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity',
                isFullscreen && !controlsVisible
                  ? 'group-hover:opacity-0'
                  : 'group-hover:opacity-100'
              )}
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </span>
          </button>

        </div>
      )}
    </div>
  )
}
export default VolumeReader
