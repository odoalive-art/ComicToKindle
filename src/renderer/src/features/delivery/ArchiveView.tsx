import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Clock3,
  Archive,
  FileText,
  Send,
  Globe,
  MoreHorizontal,
  FolderOpen,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'
import type { Artifact } from '@/lib/types'
import { formatBytes, artifactLabel, deliveryErrorMsg } from '@/lib/format'
import PageEmpty from '@/components/PageEmpty'

export interface ArchiveViewProps {
  locale: LanguageMode
}

export function ArchiveView({ locale }: ArchiveViewProps): React.JSX.Element {
  const text = uiText[locale]
  const t = text.archiveView
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      setArtifacts(await window.api.artifacts.list())
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const reveal = async (id: string): Promise<void> => {
    await window.api.artifacts.reveal(id)
  }
  const remove = async (id: string): Promise<void> => {
    await window.api.artifacts.remove(id)
    toast.success(t.removed)
    await load()
  }
  const [delivering, setDelivering] = useState<Set<string>>(new Set())
  const deliver = async (a: Artifact): Promise<void> => {
    setDelivering((prev) => new Set(prev).add(a.id))
    const toastId = toast.loading(`${t.deliver} · ${a.title}`)
    try {
      const res = await window.api.deliver.send(a.id)
      if (res.success) {
        toast.success(t.delivered(a.title), { id: toastId })
      } else {
        toast.error(`${t.deliverFailed(a.title)} — ${deliveryErrorMsg(text.delivery, res)}`, {
          id: toastId
        })
      }
      await load()
    } catch (err) {
      toast.error(`${t.deliverFailed(a.title)} — ${err}`, { id: toastId })
    } finally {
      setDelivering((prev) => {
        const next = new Set(prev)
        next.delete(a.id)
        return next
      })
    }
  }

  const [pushing, setPushing] = useState<Set<string>>(new Set())
  const webPush = async (a: Artifact): Promise<void> => {
    setPushing((prev) => new Set(prev).add(a.id))
    try {
      const res = await window.api.webpush.open(a.id)
      if (res.success) {
        toast.success(t.webPushOpened(a.title))
      } else {
        const msg = t.webPushErrors[res.code ?? 'unknown'] ?? t.webPushErrors.unknown
        toast.error(`${a.title} — ${msg}`)
        // 自动填充失败时在 Finder 中定位文件，方便手动拖入
        if (res.code === 'inject-failed') await window.api.webpush.reveal(a.id)
      }
    } catch (err) {
      toast.error(`${a.title} — ${err}`)
    } finally {
      setPushing((prev) => {
        const next = new Set(prev)
        next.delete(a.id)
        return next
      })
    }
  }

  const statusLabel = (status: Artifact['status']): string =>
    status === 'delivered'
      ? t.statusDelivered
      : status === 'failed'
        ? t.statusFailed
        : t.statusReady
  const statusIcon = (status: Artifact['status']): React.JSX.Element =>
    status === 'delivered' ? (
      <CheckCircle2 className="size-3 text-emerald-500" strokeWidth={1.75} />
    ) : status === 'failed' ? (
      <AlertCircle className="size-3 text-destructive" strokeWidth={1.75} />
    ) : (
      <Clock3 className="size-3 text-muted-foreground" strokeWidth={1.75} />
    )

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-muted-foreground" />
      </div>
    )

  if (artifacts.length === 0) {
    return <PageEmpty icon={Archive} label={t.empty} />
  }

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-4xl p-4 lg:p-6">
          <div className="space-y-3">
            {artifacts.map((a) => {
              const totalBytes = a.outputs.reduce((sum, o) => sum + o.sizeBytes, 0)
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-4 rounded-lg border bg-card p-4 text-card-foreground"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="size-5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium" title={artifactLabel(a)}>
                        {artifactLabel(a)}
                      </span>
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        {statusIcon(a.status)}
                        {statusLabel(a.status)}
                      </Badge>
                    </div>
                    {a.author ? (
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {a.author}
                      </div>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{t.volumeFiles(a.outputs.length)}</span>
                      <span>{t.pages(a.pageCount)}</span>
                      <span>{formatBytes(totalBytes)}</span>
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => deliver(a)}
                          disabled={delivering.has(a.id)}
                        >
                          {delivering.has(a.id) ? (
                            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                          ) : (
                            <Send className="size-4" strokeWidth={1.75} />
                          )}
                          <span className="hidden lg:inline">
                            {delivering.has(a.id) ? t.delivering : t.deliver}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t.deliver}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => webPush(a)}
                          disabled={pushing.has(a.id)}
                        >
                          {pushing.has(a.id) ? (
                            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                          ) : (
                            <Globe className="size-4" strokeWidth={1.75} />
                          )}
                          <span className="hidden lg:inline">{t.webPush}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t.webPush}</TooltipContent>
                    </Tooltip>
                    {/* 低频的「在 Finder 中显示 / 删除」收进溢出菜单，给行内动作减负 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" strokeWidth={1.75} />
                          <span className="sr-only">{text.library.moreActions}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => reveal(a.id)}>
                          <FolderOpen strokeWidth={1.75} />
                          {t.reveal}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => remove(a.id)}>
                          <Trash2 strokeWidth={1.75} />
                          {t.remove}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </TooltipProvider>
  )
}
export default ArchiveView
