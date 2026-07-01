import React, { useState, useEffect } from 'react'
import { Settings, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'
import { deliveryErrorMsg } from '@/lib/format'
import DeliveryWizardView from '@/delivery-wizard'

export interface DeliverySettingsViewProps {
  locale: LanguageMode
}

export function DeliverySettingsView({ locale }: DeliverySettingsViewProps): React.JSX.Element {
  const text = uiText[locale]
  const t = text.delivery
  const [host, setHost] = useState('')
  const [port, setPort] = useState('465')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [kindleEmail, setKindleEmail] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    window.api.deliver.getConfig().then((cfg) => {
      setHost(cfg.host)
      setPort(String(cfg.port))
      setUser(cfg.user)
      setKindleEmail(cfg.kindleEmail)
      setHasPassword(cfg.hasPassword)
    })
  }, [])

  const save = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.api.deliver.saveConfig({
        host: host.trim(),
        port: Number(port) || 465,
        user: user.trim(),
        kindleEmail: kindleEmail.trim(),
        password: password || undefined
      })
      if (password) setHasPassword(true)
      setPassword('')
      toast.success(t.saved)
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setSaving(false)
    }
  }

  const test = async (): Promise<void> => {
    setTesting(true)
    try {
      const res = await window.api.deliver.testSMTP({
        host: host.trim(),
        port: Number(port) || 465,
        user: user.trim(),
        password: password || undefined
      })
      if (res.success) toast.success(t.testSuccess)
      else toast.error(deliveryErrorMsg(t, res))
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setTesting(false)
    }
  }

  const [showWizard, setShowWizard] = useState(false)

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-xl p-4 lg:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground min-w-0 flex-1">{t.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setShowWizard(true)}
            >
              <Settings className="size-4 mr-1.5" strokeWidth={1.75} />
              {locale === 'zh' ? '使用向导配置' : 'Use Setup Wizard'}
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="smtp-host">{t.smtpHost}</Label>
                <Input
                  id="smtp-host"
                  value={host}
                  placeholder={t.smtpHostPlaceholder}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtp-port">{t.smtpPort}</Label>
                <Input
                  id="smtp-port"
                  value={port}
                  inputMode="numeric"
                  onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp-user">{t.smtpUser}</Label>
              <Input
                id="smtp-user"
                value={user}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp-pass">{t.smtpPass}</Label>
              <Input
                id="smtp-pass"
                type="password"
                value={password}
                autoComplete="new-password"
                placeholder={hasPassword ? t.smtpPassSaved : t.smtpPassPlaceholder}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kindle-email">{t.kindleEmail}</Label>
              <Input
                id="kindle-email"
                value={kindleEmail}
                placeholder={t.kindleEmailPlaceholder}
                onChange={(e) => setKindleEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : null}
                {t.save}
              </Button>
              <Button variant="outline" onClick={test} disabled={testing}>
                {testing ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Mail className="size-4" strokeWidth={1.75} />
                )}
                {testing ? t.testing : t.test}
              </Button>
            </div>
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
          </div>
        </div>
      </ScrollArea>
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl h-[560px] p-0 overflow-hidden flex flex-col">
          <DeliveryWizardView
            locale={locale}
            isEmbedInOnboarding={false}
            onCancel={() => setShowWizard(false)}
            onSaveSuccess={() => {
              setShowWizard(false)
              window.api.deliver.getConfig().then((cfg) => {
                setHost(cfg.host || '')
                setPort(String(cfg.port || '465'))
                setUser(cfg.user || '')
                setKindleEmail(cfg.kindleEmail || '')
                setHasPassword(cfg.hasPassword || false)
              })
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
export default DeliverySettingsView
