import React, { useState } from 'react'
import { BookText, Eye, X, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { uiText, type LanguageMode } from '@/i18n'
import type { LibraryVolume } from '@/lib/types'
import {
  CONVERT_OPTIONS_KEY,
  DeviceProfileOpt,
  PROFILE_ORDER,
  ConvertOptionsState,
  loadConvertOptions
} from '@/lib/convert-options'

// 转换工作台里左栏「待转换列表」的一项：每卷可独立编辑系列名/卷册名/作者
export interface WorkbenchItem {
  vol: LibraryVolume
  seriesPathName: string
  title: string // 书名（漫画名 + 卷册合一），开始转换时直接作为 EPUB 书名
  author: string
}

function CoverImage({
  src,
  alt,
  quiet = false
}: {
  src: string | null
  alt: string
  /** 由父级负责画占位图标（如压缩包的锁/归档图标）时置 true，避免叠一个 ImageOff */
  quiet?: boolean
}): React.JSX.Element {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        {quiet ? null : <ImageOff className="size-7" strokeWidth={1.75} />}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false} // 否则原生图片拖拽会劫持卡片的 HTML5 拖拽手势（目录网格拖动移动）
      onError={() => setFailed(true)}
      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
    />
  )
}

// 「格式转换」独立模态弹窗：左=待转换列表，右=逐卷书籍信息 + 全局转换参数。
// 右栏参数即调即存为默认（删了独立设置页后这里是唯一入口）。
export function ConvertWorkbench({
  initial,
  locale,
  onClose,
  onStart,
  onPreview
}: {
  initial: WorkbenchItem[]
  locale: LanguageMode
  onClose: () => void
  onStart: (items: WorkbenchItem[]) => void
  onPreview: (vol: LibraryVolume) => void
}): React.JSX.Element {
  const text = uiText[locale]
  const t = text.workbench
  const tm = text.convertMeta
  const ts = text.convertSettings
  const [items, setItems] = useState<WorkbenchItem[]>(initial)
  const [activeIdx, setActiveIdx] = useState(0)
  const [opts, setOpts] = useState<ConvertOptionsState>(loadConvertOptions)

  const setOpt = <K extends keyof ConvertOptionsState>(
    key: K,
    value: ConvertOptionsState[K]
  ): void =>
    setOpts((prev) => {
      const next = { ...prev, [key]: value }
      window.localStorage.setItem(CONVERT_OPTIONS_KEY, JSON.stringify(next))
      return next
    })

  const active = items[activeIdx] ?? null

  // 移除某卷：保留至少 1 卷；删的是当前/前面的项时回拨高亮索引
  const removeAt = (idx: number): void => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
    setActiveIdx((cur) => (idx < cur ? cur - 1 : Math.min(cur, items.length - 2)))
  }

  // 左表行内编辑：双击单元格进入，Enter/失焦提交，Esc 取消
  type EditField = 'title' | 'author'
  const [editing, setEditing] = useState<{ row: number; field: EditField } | null>(null)
  const [draft, setDraft] = useState('')
  const beginEdit = (row: number, field: EditField, current: string): void => {
    setActiveIdx(row)
    setEditing({ row, field })
    setDraft(current)
  }
  const commitEdit = (): void => {
    setEditing((cur) => {
      if (cur)
        setItems((prev) =>
          prev.map((it, i) => (i === cur.row ? { ...it, [cur.field]: draft } : it))
        )
      return null
    })
  }
  const editCell = (
    row: number,
    field: EditField,
    value: string,
    placeholder?: string
  ): React.JSX.Element => {
    if (editing?.row === row && editing.field === field) {
      return (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitEdit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setEditing(null)
            }
          }}
          className="h-7 px-1.5 py-0 text-sm"
        />
      )
    }
    return (
      <div
        className="min-h-7 truncate py-1"
        title={value || placeholder}
        onDoubleClick={(e) => {
          e.stopPropagation()
          beginEdit(row, field, value)
        }}
      >
        {value || <span className="text-muted-foreground">{placeholder ?? ''}</span>}
      </div>
    )
  }

  const SwitchRow = ({
    label,
    note,
    checked,
    onChange
  }: {
    label: string
    note: string
    checked: boolean
    onChange: (v: boolean) => void
  }): React.JSX.Element => (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{note}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent
        showCloseButton
        // 打开时 Radix 会自动聚焦容器内首个可聚焦元素 = 分隔条（role=separator tabIndex=0），
        // 触发 focus-visible 高亮环，看着像「被选中」。阻止默认自动聚焦即可（焦点陷阱/Esc 不受影响）。
        onOpenAutoFocus={(e) => e.preventDefault()}
        // 正在编辑单元格时按 Esc 只取消编辑，不关整个弹窗
        onEscapeKeyDown={(e) => {
          if (editing) e.preventDefault()
        }}
        // 中间分隔条拖动时 react-resizable-panels 会 setPointerCapture，
        // 被 Radix 误判为「点击弹窗外」而关闭——来源是分隔条则不关。
        onPointerDownOutside={(e) => {
          const target = e.detail.originalEvent.target as HTMLElement | null
          if (target?.closest('[data-slot="resizable-handle"],[data-separator]')) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          const target = e.detail.originalEvent.target as HTMLElement | null
          if (target?.closest('[data-slot="resizable-handle"],[data-separator]')) e.preventDefault()
        }}
        className="flex h-[85vh] w-[92vw] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 space-y-0 border-b px-4 py-2.5 text-left">
          <DialogTitle className="text-sm font-semibold">{t.title}</DialogTitle>
        </DialogHeader>

        {/* 两栏主体：左=待转换表格，右=书籍详情+转换格式，中间可拖分隔 */}
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          {/* 左：待转换表格（书名/卷数/作者，双击行内编辑） */}
          <ResizablePanel defaultSize={56} minSize={32}>
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-baseline justify-between px-4 py-3">
                <h3 className="text-sm font-semibold">{t.queue}</h3>
                <span className="text-xs text-muted-foreground">
                  {t.editHint} · {t.queueCount(items.length)}
                </span>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead className="w-8 text-center">#</TableHead>
                      <TableHead>{t.colTitle}</TableHead>
                      <TableHead className="w-44">{t.colAuthor}</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, i) => (
                      <TableRow
                        key={it.vol.path}
                        data-state={i === activeIdx ? 'selected' : undefined}
                        onClick={() => setActiveIdx(i)}
                        className="group cursor-default"
                      >
                        <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {editCell(i, 'title', it.title, t.colTitle)}
                        </TableCell>
                        <TableCell>
                          {editCell(i, 'author', it.author, tm.authorPlaceholder)}
                        </TableCell>
                        <TableCell className="p-0 pr-2">
                          {items.length > 1 ? (
                            <button
                              type="button"
                              aria-label={t.remove}
                              onClick={(e) => {
                                e.stopPropagation()
                                removeAt(i)
                              }}
                              className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                            >
                              <X className="size-4" strokeWidth={1.75} />
                            </button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* 右：书籍详情（只读封面）+ 转换格式 + 开始转换 */}
          <ResizablePanel defaultSize={44} minSize={28}>
            <div className="flex h-full min-h-0 flex-col">
              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-5 p-4">
                  {/* 书籍信息：只读封面 + 书名/作者，点封面进模拟 Kindle 预览 */}
                  {active ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onPreview(active.vol)}
                        className="group relative aspect-[5/7] w-44 overflow-hidden rounded-lg border bg-muted shadow-sm"
                        title={text.convertPreview.open}
                      >
                        {active.vol.coverUrl ? (
                          <CoverImage src={active.vol.coverUrl} alt="" quiet />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <BookText className="size-10" strokeWidth={1.25} />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                          <span className="flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium shadow">
                            <Eye className="size-4" strokeWidth={1.75} />
                            {text.convertPreview.open}
                          </span>
                        </div>
                      </button>
                      <div className="w-full space-y-0.5 text-center">
                        <div className="text-sm font-medium" title={active.title}>
                          {active.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {active.author.trim() || tm.authorPlaceholder}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">{t.empty}</div>
                  )}

                  <Separator />

                  {/* 转换格式（全局参数） */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">{t.format}</h3>
                    {/* 设备档位 */}
                    <div className="space-y-1.5">
                      <Label>{ts.deviceProfile}</Label>
                      <Select
                        value={opts.deviceProfile}
                        onValueChange={(v) => setOpt('deviceProfile', v as DeviceProfileOpt)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFILE_ORDER.map((p) => (
                            <SelectItem key={p} value={p}>
                              {ts.profiles[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <SwitchRow
                      label={ts.mangaMode}
                      note={ts.mangaModeNote}
                      checked={opts.mangaMode}
                      onChange={(v) => setOpt('mangaMode', v)}
                    />
                    <SwitchRow
                      label={ts.grayscale}
                      note={ts.grayscaleNote}
                      checked={opts.grayscale}
                      onChange={(v) => setOpt('grayscale', v)}
                    />
                    <SwitchRow
                      label={ts.splitDoublePages}
                      note={ts.splitDoublePagesNote}
                      checked={opts.splitDoublePages}
                      onChange={(v) => setOpt('splitDoublePages', v)}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{ts.imageQuality}</Label>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {opts.imageQuality}
                        </span>
                      </div>
                      <Slider
                        min={45}
                        max={100}
                        step={1}
                        value={[opts.imageQuality]}
                        onValueChange={([v]) => setOpt('imageQuality', v)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="max-vol">{ts.maxVolumeSize}</Label>
                      <Input
                        id="max-vol"
                        inputMode="numeric"
                        value={String(opts.maxVolumeSize)}
                        onChange={(e) => {
                          const n = Number(e.target.value.replace(/[^0-9]/g, ''))
                          setOpt('maxVolumeSize', n > 0 ? n : 1)
                        }}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="shrink-0 border-t p-4">
                <Button
                  className="w-full"
                  disabled={items.length === 0}
                  onClick={() => onStart(items)}
                >
                  {t.startCount(items.length)}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  )
}
export default ConvertWorkbench
