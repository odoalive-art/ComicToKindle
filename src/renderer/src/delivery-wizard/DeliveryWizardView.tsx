import React, { useState, useEffect } from 'react'
import {
  Loader2,
  Mail,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { onboardingText } from '../i18n'
import type { LanguageMode } from '../i18n'

interface DeliveryWizardViewProps {
  locale: LanguageMode
  onSaveSuccess?: () => void
  onCancel?: () => void
  onSkip?: () => void
  isEmbedInOnboarding?: boolean
}

type ProviderType = 'qq' | '163' | 'gmail' | 'custom'

export default function DeliveryWizardView({
  locale,
  onSaveSuccess,
  onCancel,
  onSkip,
  isEmbedInOnboarding = false
}: DeliveryWizardViewProps): React.JSX.Element {
  const t = onboardingText[locale].delivery

  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<ProviderType>('qq')
  const [host, setHost] = useState('smtp.qq.com')
  const [port, setPort] = useState('465')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [kindleEmail, setKindleEmail] = useState('')
  const [hasPassword, setHasPassword] = useState(false)

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // 初始化：如果已经有配置，读取之
  useEffect(() => {
    window.api?.deliver?.getConfig().then((cfg) => {
      if (cfg) {
        setHost(cfg.host || 'smtp.qq.com')
        setPort(String(cfg.port || '465'))
        setUser(cfg.user || '')
        setKindleEmail(cfg.kindleEmail || '')
        setHasPassword(cfg.hasPassword || false)

        // 识别服务商
        const h = cfg.host?.toLowerCase() || ''
        if (h.includes('qq.com')) {
          setProvider('qq')
        } else if (h.includes('163.com')) {
          setProvider('163')
        } else if (h.includes('gmail.com')) {
          setProvider('gmail')
        } else if (h) {
          setProvider('custom')
        }
      }
    })
  }, [])

  // 邮箱服务商改变时自动填入默认值
  const handleProviderChange = (p: ProviderType): void => {
    setProvider(p)
    if (p === 'qq') {
      setHost('smtp.qq.com')
      setPort('465')
    } else if (p === '163') {
      setHost('smtp.163.com')
      setPort('465')
    } else if (p === 'gmail') {
      setHost('smtp.gmail.com')
      setPort('465')
    }
  }

  // 测试 SMTP 连接
  const testConnection = async (): Promise<void> => {
    if (!host.trim() || !user.trim()) {
      toast.error(locale === 'zh' ? '请先填写 SMTP 主机和发件人邮箱。' : 'Please fill SMTP Host and Sender Email first.')
      return
    }

    setTesting(true)
    setTestResult(null)
    try {
      const res = await window.api.deliver.testSMTP({
        host: host.trim(),
        port: Number(port) || 465,
        user: user.trim(),
        password: password || undefined // 如果密码为空，主进程在测试时会读 keychain 里的已存密码
      })

      if (res.success) {
        setTestResult({ success: true })
        toast.success(t.testSuccess)
      } else {
        const errorDetail = res.detail || res.code || 'Unknown Error'
        setTestResult({ success: false, message: errorDetail })
        toast.error(`${t.testFailed} (${errorDetail})`)
      }
    } catch (err) {
      const errMsg = `${err}`
      setTestResult({ success: false, message: errMsg })
      toast.error(`${t.testFailed}: ${errMsg}`)
    } finally {
      setTesting(false)
    }
  }

  // 保存设置并退出向导
  const handleSaveAndFinish = async (): Promise<void> => {
    if (!host.trim() || !user.trim() || !kindleEmail.trim()) {
      toast.error(locale === 'zh' ? '请填写所有必要字段。' : 'Please fill all required fields.')
      return
    }

    setSaving(true)
    try {
      await window.api.deliver.saveConfig({
        host: host.trim(),
        port: Number(port) || 465,
        user: user.trim(),
        kindleEmail: kindleEmail.trim(),
        password: password || undefined
      })
      toast.success(locale === 'zh' ? '投递配置已成功保存！' : 'Delivery configuration saved successfully!')
      onSaveSuccess?.()
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setSaving(false)
    }
  }

  // 获取各种邮箱的专属获取密码帮助文案
  const getProviderHelpText = (): React.ReactNode => {
    if (provider === 'qq') {
      return (
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground select-text">
          <p>
            {locale === 'zh'
              ? '🔑 QQ 邮箱需要使用「授权码」作为密码：'
              : '🔑 QQ Mail requires an "Authorization Code" as password:'}
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              {locale === 'zh'
                ? '登录 QQ 邮箱网页端 -> 点击上方「设置」 -> 「账户」。'
                : 'Log in to QQ Mail web page -> Click "Settings" -> "Account".'}
            </li>
            <li>
              {locale === 'zh'
                ? '向下滚动找到「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务」栏目。'
                : 'Scroll down to the "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV Service" section.'}
            </li>
            <li>
              {locale === 'zh'
                ? '开启「POP3/SMTP服务」，并按照提示生成「授权码」（一串 16 位英文字母）。'
                : 'Enable "POP3/SMTP Service", and follow the instructions to generate the "Authorization Code" (16 letters).'}
            </li>
            <li>{locale === 'zh' ? '将生成好的授权码填入上方的密码框中。' : 'Paste the generated code into the Password field above.'}</li>
          </ol>
        </div>
      )
    }

    if (provider === '163') {
      return (
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground select-text">
          <p>
            {locale === 'zh'
              ? '🔑 163 网易邮箱需要使用「授权密码」作为密码：'
              : '🔑 163 Mail requires an "Authorization Password" as password:'}
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              {locale === 'zh'
                ? '登录 163 邮箱网页端 -> 点击顶部的「设置」 -> 「POP3/SMTP/IMAP」。'
                : 'Log in to 163 Mail web page -> Click "Settings" -> "POP3/SMTP/IMAP".'}
            </li>
            <li>
              {locale === 'zh'
                ? '确保「POP3/SMTP服务」处于开启状态。'
                : 'Ensure that "POP3/SMTP Service" is enabled.'}
            </li>
            <li>
              {locale === 'zh'
                ? '点击「新增授权密码」，按页面提示完成短信验证，获取并复制授权密码。'
                : 'Click "Add Auth Password", verify via SMS as prompted, and copy the authorization password.'}
            </li>
            <li>{locale === 'zh' ? '将复制的授权密码填入上方的密码框中。' : 'Paste the authorization password into the Password field above.'}</li>
          </ol>
        </div>
      )
    }

    if (provider === 'gmail') {
      return (
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground select-text">
          <p>
            {locale === 'zh'
              ? '🔑 Gmail 邮箱需要使用「应用专用密码」作为密码：'
              : '🔑 Gmail requires an "App Password" as password:'}
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              {locale === 'zh'
                ? '登录您的 Google 账户 -> 进入「安全性 (Security)」设置页面。'
                : 'Go to your Google Account Settings -> "Security" tab.'}
            </li>
            <li>
              {locale === 'zh'
                ? '确保已开启「两步验证 (2-Step Verification)」。'
                : 'Ensure that "2-Step Verification" is turned ON.'}
            </li>
            <li>
              {locale === 'zh'
                ? '搜索或在页面下方找到「应用专用密码 (App passwords)」。'
                : 'Search for "App passwords" or locate it under the signing-in Google section.'}
            </li>
            <li>
              {locale === 'zh'
                ? '输入一个自定义名称（例如 ComicToKindle），点击生成并复制 16 位密码（去掉空格）。'
                : 'Enter a custom app name (e.g. ComicToKindle), click generate and copy the 16-character password.'}
            </li>
          </ol>
        </div>
      )
    }

    return (
      <div className="space-y-1 text-xs leading-relaxed text-muted-foreground select-text">
        <p>
          {locale === 'zh'
            ? '💡 提示：目前绝大多数邮箱提供商均出于安全考虑限制了第三方直接使用账户登录密码。'
            : '💡 Tip: Most email providers prohibit third-party apps from using the primary account password for security reasons.'}
        </p>
        <p>
          {locale === 'zh'
            ? '请进入您的邮箱网页端设置，开启 SMTP 服务并生成用于第三方应用的「授权码」或「应用专用密码」。'
            : 'Please visit your email settings on the web, enable SMTP, and generate an "App Password" or "Auth Token".'}
        </p>
      </div>
    )
  }

  // 亚马逊设置链接的跳转
  const getAmazonSettingsUrl = (): string => {
    return 'https://www.amazon.com/hz/mycd/myx#/home/settings'
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* 顶部进度条：仅独立使用时显示；嵌入引导时隐藏，避免被误读为引导总进度 */}
      {!isEmbedInOnboarding && (
        <div className="relative h-1 w-full bg-muted">
          <div
            className="absolute h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <h2 className="text-xl font-bold tracking-tight">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </div>

          {/* 步骤一：SMTP 设置 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium text-foreground">{t.smtpTitle}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.smtpDesc}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="provider-select">{t.emailProvider}</Label>
                  <NativeSelect
                    id="provider-select"
                    value={provider}
                    className="w-full"
                    onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
                  >
                    <NativeSelectOption value="qq">QQ 邮箱 (smtp.qq.com)</NativeSelectOption>
                    <NativeSelectOption value="163">163 网易邮箱 (smtp.163.com)</NativeSelectOption>
                    <NativeSelectOption value="gmail">Gmail (smtp.gmail.com)</NativeSelectOption>
                    <NativeSelectOption value="custom">{t.customProvider}</NativeSelectOption>
                  </NativeSelect>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5 min-w-0">
                    <Label htmlFor="wizard-smtp-host">{t.host}</Label>
                    <Input
                      id="wizard-smtp-host"
                      value={host}
                      disabled={provider !== 'custom'}
                      onChange={(e) => setHost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor="wizard-smtp-port">{t.port}</Label>
                    <Input
                      id="wizard-smtp-port"
                      value={port}
                      disabled={provider !== 'custom'}
                      inputMode="numeric"
                      onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="wizard-smtp-user">{t.user}</Label>
                  <Input
                    id="wizard-smtp-user"
                    type="email"
                    placeholder="your_email@example.com"
                    value={user}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="wizard-smtp-pass">{t.pass}</Label>
                  <Input
                    id="wizard-smtp-pass"
                    type="password"
                    value={password}
                    autoComplete="new-password"
                    placeholder={hasPassword ? '••••••••' : t.passPlaceholder}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* 邮箱帮助文案容器 */}
                <div className="rounded-lg bg-muted/40 border p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <Info className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
                    <span>
                      {locale === 'zh' ? '如何获取密码？' : 'How to get password?'}
                    </span>
                  </div>
                  {getProviderHelpText()}
                </div>
              </div>
            </div>
          )}

          {/* 步骤二：亚马逊白名单 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium text-foreground">{t.amazonTitle}</h3>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed select-text">
                <div className="space-y-2">
                  <p>{t.amazonStep1}</p>
                  <div className="pl-4">
                    <a
                      href={getAmazonSettingsUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <span>
                        {locale === 'zh'
                          ? '🔗 访问亚马逊美国官网个人文档设置 (Amazon.com Settings)'
                          : '🔗 Visit Amazon.com Personal Document Settings'}
                      </span>
                      <ExternalLink className="size-3" strokeWidth={1.75} />
                    </a>
                  </div>
                  <div className="pl-4">
                    <a
                      href="https://www.amazon.co.jp/hz/mycd/myx#/home/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <span>
                        {locale === 'zh'
                          ? '🔗 访问亚马逊日本官网个人文档设置 (Amazon.co.jp Settings)'
                          : '🔗 Visit Amazon.co.jp Personal Document Settings'}
                      </span>
                      <ExternalLink className="size-3" strokeWidth={1.75} />
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <p>{t.amazonStep2}</p>
                  <div className="pl-4 bg-muted/30 border rounded-md p-2 font-mono text-xs text-foreground flex items-center justify-between">
                    <span className="truncate">{user || 'your_email@example.com'}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans uppercase shrink-0">
                      {locale === 'zh' ? '待添加' : 'To Add'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p>{t.amazonStep3}</p>
                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor="wizard-kindle-email" className="text-foreground">
                      {t.kindleEmail}
                    </Label>
                    <Input
                      id="wizard-kindle-email"
                      placeholder={t.kindlePlaceholder}
                      value={kindleEmail}
                      onChange={(e) => setKindleEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤三：连接自检 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b pb-2">
                <h3 className="font-medium text-foreground">
                  {locale === 'zh' ? '配置自检与测试' : 'Configuration Self-Check & Test'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'zh'
                    ? '在保存并完成引导前，让我们先测试一下 SMTP 连接是否通畅。'
                    : 'Let\'s test the SMTP connection before saving and completing.'}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 space-y-3 text-sm select-text">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t.host}</span>
                  <span className="font-medium">{host}:{port}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t.user}</span>
                  <span className="font-medium truncate max-w-[240px]">{user}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">{t.kindleEmail}</span>
                  <span className="font-medium truncate max-w-[240px]">{kindleEmail}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30 border gap-3">
                {testResult === null ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="size-4 shrink-0" strokeWidth={1.75} />
                    <span>
                      {locale === 'zh'
                        ? '尚未进行 SMTP 连通性测试。'
                        : 'SMTP connection test has not been performed yet.'}
                    </span>
                  </div>
                ) : testResult.success ? (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <CheckCircle2 className="size-8 text-emerald-500 shrink-0" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.testSuccess}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <ShieldAlert className="size-8 text-destructive shrink-0" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-destructive">
                      {t.testFailed}
                    </span>
                    <p className="text-[10px] text-muted-foreground max-w-sm break-all select-text">
                      {testResult.message}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={testing}
                  className="w-full sm:w-auto"
                >
                  {testing ? (
                    <Loader2 className="size-4 animate-spin mr-1.5" strokeWidth={1.75} />
                  ) : (
                    <Mail className="size-4 mr-1.5" strokeWidth={1.75} />
                  )}
                  {testing ? t.testing : t.testBtn}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部导航按钮 */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={testing || saving}
            >
              <ArrowLeft className="size-4 mr-1.5" strokeWidth={1.75} />
              {t.prevBtn}
            </Button>
          )}
          {step === 1 && !isEmbedInOnboarding && onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={testing || saving}>
              {locale === 'zh' ? '取消' : 'Cancel'}
            </Button>
          )}
          {/* 嵌入引导时允许跳过投递配置（投递是可选项，可之后在设置里配） */}
          {isEmbedInOnboarding && onSkip && (
            <Button variant="ghost" onClick={onSkip} disabled={testing || saving}>
              {locale === 'zh' ? '稍后配置' : 'Set up later'}
            </Button>
          )}
        </div>

        {step < 3 ? (
          <Button
            onClick={() => {
              if (step === 1 && !user.trim()) {
                toast.error(locale === 'zh' ? '发件人邮箱不能为空' : 'Sender Email cannot be empty')
                return
              }
              setStep(step + 1)
            }}
          >
            {t.nextBtn}
            <ArrowRight className="size-4 ml-1.5" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button onClick={handleSaveAndFinish} disabled={saving || testing}>
            {saving ? (
              <Loader2 className="size-4 animate-spin mr-1.5" strokeWidth={1.75} />
            ) : (
              <CheckCircle2 className="size-4 mr-1.5" strokeWidth={1.75} />
            )}
            {isEmbedInOnboarding ? t.finishBtn : t.saveBtn}
          </Button>
        )}
      </div>
    </div>
  )
}
