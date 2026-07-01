import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'
import type { LibraryVolume } from '@/lib/types'
import {
  CONVERT_OPTIONS_KEY,
  DeviceProfileOpt,
  PROFILE_ORDER,
  ConvertOptionsState,
  loadConvertOptions
} from '@/lib/convert-options'

// 模拟 Kindle 转换预览：对单页跑真实转换管线，原图↔转换后对比，可调参并设为默认。
export type ConvertPreviewData = Awaited<ReturnType<typeof window.api.convert.preview>>

export interface ConvertPreviewDialogProps {
  vol: LibraryVolume
  locale: LanguageMode
  onClose: () => void
}

export function ConvertPreviewDialog({
  vol,
  locale,
  onClose
}: ConvertPreviewDialogProps): React.JSX.Element {
  const text = uiText[locale]
  const t = text.convertPreview
  const [opts, setOpts] = useState<ConvertOptionsState>(loadConvertOptions)
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<ConvertPreviewData | null>(null)
  const reqIdRef = useRef(0)

  const set = <K extends keyof ConvertOptionsState>(key: K, value: ConvertOptionsState[K]): void =>
    setOpts((prev) => ({ ...prev, [key]: value }))

  // 调参/翻页 → 防抖重跑单页（main 真实管线，所见即所得）
  useEffect(() => {
    const id = ++reqIdRef.current
    setLoading(true)
    setError(false)
    const timer = setTimeout(() => {
      window.api.convert
        .preview({
          sourceVolumePath: vol.path,
          pageIndex,
          options: {
            deviceProfile: opts.deviceProfile,
            mangaMode: opts.mangaMode,
            grayscale: opts.grayscale,
            splitDoublePages: opts.splitDoublePages,
            imageQuality: opts.imageQuality
          }
        })
        .then((r) => {
          if (id !== reqIdRef.current) return
          setData(r)
          setLoading(false)
        })
        .catch(() => {
          if (id !== reqIdRef.current) return
          setError(true)
          setLoading(false)
        })
    }, 180)
    return () => clearTimeout(timer)
  }, [
    vol.path,
    pageIndex,
    opts.deviceProfile,
    opts.mangaMode,
    opts.grayscale,
    opts.splitDoublePages,
    opts.imageQuality
  ])

  const pageCount = data?.pageCount ?? 1
  const afterBytes = data ? data.outputs.reduce((s, o) => s + o.bytes, 0) : 0
  const ratio = data && data.original.bytes > 0 ? afterBytes / data.original.bytes : 1
  const reductionPct = Math.round((1 - ratio) * 100)

  const apply = (): void => {
    window.localStorage.setItem(CONVERT_OPTIONS_KEY, JSON.stringify(opts))
    toast.success(t.applied)
    onClose()
  }

  // 设备外框 + letterbox：白底页面 + 描边，模拟 e-ink 屏。注意用常量而非内联组件，
  // 否则每次调参重渲染会重建组件、remount <img> 造成闪烁。
  const pageBoxCls =
    'flex h-[46vh] items-center justify-center gap-2 rounded-lg border bg-white p-2 dark:bg-zinc-100'

  return (
    <Dialog open onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t.title}
            <span className="truncate text-xs font-normal text-muted-foreground">{vol.title}</span>
          </DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>

        {/* 对比区：原图 ↔ 转换后 */}
        <div className="flex items-start justify-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 text-center text-xs text-muted-foreground">{t.before}</div>
            <div className={pageBoxCls}>
              {data ? (
                <img
                  src={data.original.dataUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
              ) : null}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {t.after}
              {data?.isCover ? (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t.cover}</span>
              ) : null}
              {data?.split ? (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t.split}</span>
              ) : null}
            </div>
            <div className="relative">
              <div className={pageBoxCls}>
                {error ? (
                  <span className="text-xs text-destructive">{t.failed}</span>
                ) : data ? (
                  data.outputs.map((o, i) => (
                    <img
                      key={i}
                      src={o.dataUrl}
                      alt=""
                      className="max-h-full object-contain"
                      style={{ maxWidth: data.outputs.length > 1 ? '50%' : '100%' }}
                      draggable={false}
                    />
                  ))
                ) : null}
              </div>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[1px]">
                  <Loader2
                    className="size-5 animate-spin text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 翻页 + 体积对比 */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
            </Button>
            <span className="tabular-nums">{t.page(pageIndex + 1, pageCount)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
            >
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
          {data ? (
            <div className="flex items-center gap-2 tabular-nums">
              <span>
                {(data.original.bytes / 1024).toFixed(0)} KB → {(afterBytes / 1024).toFixed(0)} KB
              </span>
              {reductionPct !== 0 ? (
                <span
                  className={
                    reductionPct > 0
                      ? 'rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400'
                      : 'rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-600 dark:text-amber-400'
                  }
                >
                  {reductionPct > 0 ? t.reduction(reductionPct) : t.bigger(-reductionPct)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* 调参 */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">{t.profile}</Label>
            <Select
              value={opts.deviceProfile}
              onValueChange={(v) => set('deviceProfile', v as DeviceProfileOpt)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {text.convertSettings.profiles[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <span className="text-xs">{t.grayscale}</span>
            <Switch checked={opts.grayscale} onCheckedChange={(v) => set('grayscale', v)} />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <span className="text-xs">{t.splitDoublePages}</span>
            <Switch
              checked={opts.splitDoublePages}
              onCheckedChange={(v) => set('splitDoublePages', v)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t.quality}</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {opts.imageQuality}
              </span>
            </div>
            <Slider
              min={45}
              max={100}
              step={1}
              value={[opts.imageQuality]}
              onValueChange={([v]) => set('imageQuality', v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t.close}
          </Button>
          <Button onClick={apply}>{t.apply}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default ConvertPreviewDialog
