import React, { useState } from 'react'
import {
  Loader2,
  AlertCircle,
  BookOpenCheck,
  RotateCcw,
  X,
  Send,
  Globe,
  FolderOpen,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'
import type { Artifact } from '@/lib/types'
import { formatBytes, artifactLabel, deliveryErrorMsg } from '@/lib/format'
import type { ConvertActivity } from './useConvertActivity'

export interface ConvertActivityPopoverProps {
  activity: ConvertActivity
  locale: LanguageMode
  onOpenArchive: () => void
}

export function ConvertActivityPopover({
  activity,
  locale,
  onOpenArchive
}: ConvertActivityPopoverProps): React.JSX.Element {
  const text = uiText[locale]
  const t = text.activity
  const ta = text.archiveView
  const [open, setOpen] = useState(false)
  const [delivering, setDelivering] = useState<Set<string>>(new Set())

  const deliver = async (a: Artifact): Promise<void> => {
    setDelivering((p) => new Set(p).add(a.id))
    const toastId = toast.loading(`${ta.deliver} · ${a.title}`)
    try {
      const res = await window.api.deliver.send(a.id)
      if (res.success) toast.success(ta.delivered(a.title), { id: toastId })
      else
        toast.error(`${ta.deliverFailed(a.title)} — ${deliveryErrorMsg(text.delivery, res)}`, {
          id: toastId
        })
      await activity.refreshArtifacts()
    } catch (err) {
      toast.error(`${ta.deliverFailed(a.title)} — ${err}`, { id: toastId })
    } finally {
      setDelivering((p) => {
        const n = new Set(p)
        n.delete(a.id)
        return n
      })
    }
  }
  const removeArtifact = async (id: string): Promise<void> => {
    await window.api.artifacts.remove(id)
    await activity.refreshArtifacts()
  }
  const [pushing, setPushing] = useState<Set<string>>(new Set())
  const webPush = async (a: Artifact): Promise<void> => {
    setPushing((p) => new Set(p).add(a.id))
    try {
      const res = await window.api.webpush.open(a.id)
      if (res.success) {
        toast.success(ta.webPushOpened(a.title))
      } else {
        const msg = ta.webPushErrors[res.code ?? 'unknown'] ?? ta.webPushErrors.unknown
        toast.error(`${a.title} — ${msg}`)
        if (res.code === 'inject-failed') await window.api.webpush.reveal(a.id)
      }
    } catch (err) {
      toast.error(`${a.title} — ${err}`)
    } finally {
      setPushing((p) => {
        const n = new Set(p)
        n.delete(a.id)
        return n
      })
    }
  }

  const active = activity.jobs
  const completed = activity.artifacts.slice(0, 8)
  const hasAny = active.length > 0 || activity.artifacts.length > 0
  // 角标：进行中(queued/converting) + 中断 都计入；只有中断时用警示色 + 警示图标
  const badgeCount = activity.activeCount + activity.interruptedCount
  const onlyInterrupted = activity.activeCount === 0 && activity.interruptedCount > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              {activity.activeCount > 0 ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={1.75} />
              ) : onlyInterrupted ? (
                <AlertCircle className="size-4 text-amber-500" strokeWidth={1.75} />
              ) : (
                <BookOpenCheck className="size-4 text-muted-foreground" strokeWidth={1.75} />
              )}
              {badgeCount > 0 ? (
                <span
                  className={`absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none ${
                    onlyInterrupted
                      ? 'bg-amber-500 text-white'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {badgeCount}
                </span>
              ) : null}
              <span className="sr-only">{t.trigger}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.trigger}</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">{t.title}</span>
          {active.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => activity.clearAll()}
            >
              {t.clearAll}
            </Button>
          ) : null}
        </div>
        {!hasAny ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          // 用普通 overflow 滚动容器而非 ScrollArea：后者 Viewport 内层 display:table
          // 会按内容宽度撑开、突破浮窗宽度，导致行内 truncate 失效、右侧按钮被挤出
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="p-2">
              {active.length > 0 ? (
                <>
                  <div className="px-1 py-1 text-xs font-medium text-muted-foreground">
                    {t.active}
                  </div>
                  {active.map((j) => (
                    <div key={j.id} className="rounded-md px-2 py-2 hover:bg-muted/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm" title={j.title}>
                          {j.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          <span
                            className={`text-xs ${
                              j.status === 'failed'
                               ? 'text-destructive'
                                : j.status === 'interrupted'
                                  ? 'text-amber-500'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {j.status === 'converting'
                              ? `${Math.max(0, j.percent)}%`
                              : j.status === 'queued'
                                ? t.queued
                                : j.status === 'interrupted'
                                  ? t.interrupted
                                  : t.failed}
                          </span>
                          {j.status === 'failed' || j.status === 'interrupted' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              title={j.status === 'interrupted' ? t.resume : t.retry}
                              onClick={() => activity.retry(j.id)}
                            >
                              <RotateCcw className="size-3.5" strokeWidth={1.75} />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            title={t.cancel}
                            onClick={() => activity.cancel(j)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </span>
                      </div>
                      {j.status === 'converting' ? (
                        <div className="mt-1 h-1 overflow-hidden rounded bg-muted">
                          <div
                            className="h-full bg-primary transition-[width]"
                            style={{ width: `${Math.max(0, j.percent)}%` }}
                          />
                        </div>
                      ) : null}
                      {j.status === 'failed' && j.error ? (
                        <div className="mt-0.5 truncate text-xs text-destructive" title={j.error}>
                          {j.error}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </>
              ) : null}
              {completed.length > 0 ? (
                <>
                  <div className="px-1 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                    {t.completed}
                  </div>
                  {completed.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm" title={artifactLabel(a)}>
                          {artifactLabel(a)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.status === 'delivered'
                            ? ta.statusDelivered
                            : formatBytes(a.outputs.reduce((s, o) => s + o.sizeBytes, 0))}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title={ta.deliver}
                          disabled={delivering.has(a.id)}
                          onClick={() => deliver(a)}
                        >
                          {delivering.has(a.id) ? (
                            <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                          ) : (
                            <Send className="size-3.5" strokeWidth={1.75} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title={ta.webPush}
                          disabled={pushing.has(a.id)}
                          onClick={() => webPush(a)}
                        >
                          {pushing.has(a.id) ? (
                            <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                          ) : (
                            <Globe className="size-3.5" strokeWidth={1.75} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title={ta.reveal}
                          onClick={() => window.api.artifacts.reveal(a.id)}
                        >
                          <FolderOpen className="size-3.5" strokeWidth={1.75} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          title={ta.remove}
                          onClick={() => removeArtifact(a.id)}
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        )}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => {
              setOpen(false)
              onOpenArchive()
            }}
          >
            {t.viewAll}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
export default ConvertActivityPopover
