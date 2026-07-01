import React, { useState, useEffect } from 'react'
import { Globe, Loader2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'

export interface WebPushViewProps {
  locale: LanguageMode
  onGotoArchive: () => void
}

export function WebPushView({
  locale,
  onGotoArchive
}: WebPushViewProps): React.JSX.Element {
  const t = uiText[locale].webPushView
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.api.webpush.getUrl().then(setUrl)
  }, [])

  const save = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.api.webpush.setUrl(url.trim())
      setUrl(await window.api.webpush.getUrl())
      toast.success(t.saved)
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-xl p-4 lg:p-6">
        <p className="mb-5 text-sm text-muted-foreground">{t.description}</p>
        <div className="space-y-5">
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <h3 className="mb-2 text-sm font-medium">{t.howTitle}</h3>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
            </ol>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stk-url">{t.urlLabel}</Label>
            <Input
              id="stk-url"
              value={url}
              placeholder="https://www.amazon.com/sendtokindle"
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.urlNote}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button onClick={() => window.api.webpush.openBlank()}>
              <Globe className="size-4" strokeWidth={1.75} />
              {t.openLogin}
            </Button>
            <Button variant="outline" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : null}
              {t.save}
            </Button>
            <Button variant="ghost" onClick={onGotoArchive}>
              <Archive className="size-4" strokeWidth={1.75} />
              {t.gotoArchive}
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
export default WebPushView
