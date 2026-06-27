import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Cpu, Trash2, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { upscaleText } from '../i18n'

interface ExtensionsViewProps {
  locale: 'zh' | 'en'
}

export function ExtensionsView({ locale }: ExtensionsViewProps): React.JSX.Element {
  const t = upscaleText[locale]

  const [config, setConfig] = useState({
    enabled: false,
    model: 'cunet',
    scale: 2,
    denoise: 1,
    cacheLimitMB: 2048
  })

  const [status, setStatus] = useState<{
    engineReady: boolean
    gpu: 'available' | 'cpu-only' | 'none'
    model: string
  } | null>(null)

  const [cacheSize, setCacheSize] = useState<number | null>(null)
  const [clearing, setClearing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [cfg, stat, size] = await Promise.all([
        window.electron.ipcRenderer.invoke('upscale:getConfig'),
        window.electron.ipcRenderer.invoke('upscale:status'),
        window.electron.ipcRenderer.invoke('upscale:cacheSize')
      ])
      if (cfg) setConfig(cfg)
      if (stat) setStatus(stat)
      if (typeof size === 'number') setCacheSize(size)
    } catch (err) {
      console.error('Failed to load upscale data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateConfigValue = async (key: string, value: any) => {
    const nextConfig = { ...config, [key]: value }
    setConfig(nextConfig)
    try {
      await window.electron.ipcRenderer.invoke('upscale:setConfig', { [key]: value })
      toast.success(t.saveSuccess)
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const handleClearCache = async () => {
    setClearing(true)
    try {
      const bytesReleased = await window.electron.ipcRenderer.invoke('upscale:clearCache')
      const sizeStr = formatBytes(bytesReleased)
      toast.success(t.clearSuccess(sizeStr))
      // 刷新缓存大小
      const size = await window.electron.ipcRenderer.invoke('upscale:cacheSize')
      if (typeof size === 'number') setCacheSize(size)
    } catch (err) {
      toast.error(t.clearFailed)
    } finally {
      setClearing(false)
    }
  }

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return '...'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Spinner className="text-muted-foreground" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 bg-background">
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{t.title}</h1>
          <p className="text-sm text-muted-foreground break-words">{t.subtitle}</p>
        </div>

        <Separator />

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-500 shrink-0" strokeWidth={1.75} />
                  <CardTitle className="text-lg truncate">{t.cardTitle}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed break-words">
                  {t.cardDesc}
                </CardDescription>
              </div>

              {status && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`gap-1 px-2 py-0.5 ${
                      status.engineReady
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {status.engineReady ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <XCircle className="size-3.5" />
                    )}
                    {status.engineReady ? t.engineReady : t.engineNotReady}
                  </Badge>

                  <Badge variant={status.gpu === 'available' ? "outline" : "secondary"} className="gap-1 px-2 py-0.5">
                    <Cpu className="size-3.5" />
                    {status.gpu === 'available'
                      ? t.gpuAvailable
                      : status.gpu === 'cpu-only'
                      ? t.cpuOnly
                      : t.noGpu}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0 min-w-0">
            {status && status.gpu !== 'available' && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" strokeWidth={1.75} />
                <p className="leading-relaxed break-words">{t.cpuWarning}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* 开关：默认是否启用 */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4 min-w-0 gap-4">
                <div className="space-y-0.5 pr-4 min-w-0 flex-1">
                  <label className="text-sm font-medium leading-none truncate block">
                    {t.enableDefault}
                  </label>
                  <p className="text-xs text-muted-foreground leading-normal break-words mt-1">
                    {t.enableDefaultDesc}
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(val) => updateConfigValue('enabled', val)}
                  className="shrink-0"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 放大倍率 */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground truncate block">{t.scale}</label>
                  <Select
                    value={String(config.scale)}
                    onValueChange={(val) => updateConfigValue('scale', Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="2x" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 降噪等级 */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground truncate block">{t.denoise}</label>
                  <Select
                    value={String(config.denoise)}
                    onValueChange={(val) => updateConfigValue('denoise', Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t.denoiseLevels.none}</SelectItem>
                      <SelectItem value="0">{t.denoiseLevels.low}</SelectItem>
                      <SelectItem value="1">{t.denoiseLevels.medium}</SelectItem>
                      <SelectItem value="2">{t.denoiseLevels.high}</SelectItem>
                      <SelectItem value="3">{t.denoiseLevels.highest}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 缓存上限 */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground truncate block">{t.cacheLimit}</label>
                  <Select
                    value={String(config.cacheLimitMB)}
                    onValueChange={(val) => updateConfigValue('cacheLimitMB', Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512 MB</SelectItem>
                      <SelectItem value="1024">1 GB</SelectItem>
                      <SelectItem value="2048">2 GB</SelectItem>
                      <SelectItem value="4096">4 GB</SelectItem>
                      <SelectItem value="8192">8 GB</SelectItem>
                      <SelectItem value="16384">16 GB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 缓存大小与清理 */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground truncate block">{t.cacheSize}</label>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground min-w-0">
                      <span className="tabular-nums font-medium truncate">{formatBytes(cacheSize)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClearCache}
                      disabled={clearing || cacheSize === 0}
                      title={t.clearCache}
                      className="shrink-0"
                    >
                      {clearing ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
