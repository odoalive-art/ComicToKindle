import React, { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  FolderOpen,
  FolderPlus,
  Upload,
  CheckCircle2,
  Moon,
  Sun,
  Globe,
  ArrowRight,
  ArrowLeft,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { onboardingText } from '../i18n'
import type { LanguageMode } from '../i18n'
import DeliveryWizardView from '../delivery-wizard/DeliveryWizardView'

type ThemeMode = 'light' | 'dark'

interface OnboardingViewProps {
  locale: LanguageMode
  setLocale: (lang: LanguageMode) => void
  themeMode: ThemeMode
  setThemeMode: (theme: ThemeMode) => void
  onComplete: () => void
}

export default function OnboardingView({
  locale,
  setLocale,
  themeMode,
  setThemeMode,
  onComplete
}: OnboardingViewProps): React.JSX.Element {
  const [step, setStep] = useState(1)
  const [libPath, setLibPath] = useState<string | null>(null)

  // 导入状态
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importingFileName, setImportingFileName] = useState('')
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const dragDepthRef = useRef(0)

  const t = onboardingText[locale]

  // 初始化检查：看是否已经配置过库路径
  useEffect(() => {
    window.api?.library?.getSaved().then((saved) => {
      if (saved) {
        setLibPath(saved)
      }
    })
  }, [])

  // 监听导入进度
  useEffect(() => {
    if (!isImporting || !window.api?.library?.onImportProgress) return
    const unsub = window.api.library.onImportProgress((p) => {
      setImportProgress(Math.round(p.fraction * 100))
      setImportingFileName(p.name)
    })
    return () => unsub()
  }, [isImporting])

  // 新建库包
  const handleCreateLibrary = async (): Promise<void> => {
    if (!window.api?.library) return
    try {
      const created = await window.api.library.create()
      if (created) {
        setLibPath(created)
        toast.success(
          locale === 'zh' ? '成功创建漫画库包！' : 'Successfully created library bundle!'
        )
      }
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  // 打开库包
  const handleOpenLibrary = async (): Promise<void> => {
    if (!window.api?.library) return
    try {
      const picked = await window.api.library.open()
      if (picked) {
        setLibPath(picked)
        toast.success(
          locale === 'zh' ? '成功关联漫画库包！' : 'Successfully linked library bundle!'
        )
      }
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  // 触发文件选择导入
  const handleSelectAndImport = async (): Promise<void> => {
    if (!window.api?.library) return
    setIsImporting(true)
    setImportProgress(0)
    setImportingFileName('')
    setImportedCount(null)

    try {
      const scan = await window.api.library.scanImport()
      if (scan.candidates.length === 0) {
        setIsImporting(false)
        return
      }

      const ids = await window.api.library.importBooks(scan.candidates, {
        deleteSourceAfter: false
      })
      setImportedCount(ids.length)
      toast.success(t.import.success(ids.length))
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setIsImporting(false)
    }
  }

  // 拖拽导入逻辑
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer.types.includes('Files')) return
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer.types.includes('Files')) return
    e.dataTransfer.dropEffect = 'copy'
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    dragDepthRef.current = 0

    if (!window.api?.library) return

    const files = [...e.dataTransfer.files]
    const paths = files
      .map((file) => window.api.library.getPathForFile(file))
      .filter((p) => p && p.length > 0)

    if (paths.length === 0) return

    setIsImporting(true)
    setImportProgress(0)
    setImportingFileName('')
    setImportedCount(null)

    try {
      const scan = await window.api.library.scanImport(paths)
      if (scan.candidates.length === 0) {
        toast.info(
          locale === 'zh'
            ? '拖入的文件中没有发现有效的漫画。'
            : 'No valid comics found in dropped files.'
        )
        setIsImporting(false)
        return
      }

      const ids = await window.api.library.importBooks(scan.candidates, {
        deleteSourceAfter: false
      })
      setImportedCount(ids.length)
      toast.success(t.import.success(ids.length))
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-muted/30 p-4 select-none">
      <Card className="w-full max-w-2xl h-[560px] flex flex-col shadow-xl border overflow-hidden bg-background">
        <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-between p-8 sm:p-12">
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center space-y-6">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-9" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {t.welcome.title}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    {t.welcome.subtitle}
                  </p>
                </div>
              </div>

              {/* Preferences Setup */}
              <div className="grid grid-cols-2 gap-4 border-t pt-6 mt-6">
                <div className="space-y-1.5 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Globe className="size-3" />
                    {t.welcome.languageSelect}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant={locale === 'zh' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full h-8"
                      onClick={() => setLocale('zh')}
                    >
                      中文
                    </Button>
                    <Button
                      variant={locale === 'en' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full h-8"
                      onClick={() => setLocale('en')}
                    >
                      English
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    {themeMode === 'dark' ? <Moon className="size-3" /> : <Sun className="size-3" />}
                    {t.welcome.themeSelect}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant={themeMode === 'light' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full h-8"
                      onClick={() => setThemeMode('light')}
                    >
                      {locale === 'zh' ? '浅色' : 'Light'}
                    </Button>
                    <Button
                      variant={themeMode === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full h-8"
                      onClick={() => setThemeMode('dark')}
                    >
                      {locale === 'zh' ? '深色' : 'Dark'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={() => setStep(2)}>
                  {t.welcome.startBtn}
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Library Config */}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-between p-8 sm:p-12">
              <div className="space-y-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold tracking-tight">{t.library.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.library.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={handleCreateLibrary}
                    className="flex flex-col items-center justify-center p-6 border rounded-xl bg-card hover:bg-muted/30 transition-all text-center gap-3 cursor-pointer group"
                  >
                    <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderPlus className="size-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground block">
                        {t.library.createBtn}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {locale === 'zh' ? '在本地新建一个漫画数据库' : 'Initialize a new local database'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleOpenLibrary}
                    className="flex flex-col items-center justify-center p-6 border rounded-xl bg-card hover:bg-muted/30 transition-all text-center gap-3 cursor-pointer group"
                  >
                    <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderOpen className="size-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground block">
                        {t.library.openBtn}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {locale === 'zh' ? '导入或打开已有的库包路径' : 'Open a previously created bundle'}
                      </span>
                    </div>
                  </button>
                </div>

                {libPath && (
                  <div className="rounded-lg bg-muted/40 border p-3.5 space-y-1 text-xs select-text">
                    <span className="font-medium text-muted-foreground">
                      {t.library.selectedPath}
                    </span>
                    <p className="font-mono text-foreground break-all">{libPath}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-6 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  {locale === 'zh' ? '返回' : 'Back'}
                </Button>
                <Button
                  onClick={() => {
                    if (!libPath) {
                      toast.error(t.library.errorNoPath)
                      return
                    }
                    setStep(3)
                  }}
                  disabled={!libPath}
                >
                  {t.library.nextBtn}
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Import First Book */}
          {step === 3 && (
            <div className="flex-1 flex flex-col justify-between p-8 sm:p-12">
              <div className="space-y-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold tracking-tight">{t.import.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.import.desc}</p>
                </div>

                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-card transition-all text-center gap-3 h-48 select-none ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                  }`}
                >
                  {isImporting ? (
                    <div className="w-full max-w-xs space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-primary shrink-0" />
                        <span className="text-sm font-semibold">{t.import.importing}</span>
                      </div>
                      <Progress value={importProgress} className="h-1.5 w-full" />
                      <p className="text-[10px] text-muted-foreground truncate select-text">
                        {importingFileName || '...'}
                      </p>
                    </div>
                  ) : importedCount !== null ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 className="size-10 text-emerald-500 shrink-0" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {t.import.success(importedCount)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="size-8 text-muted-foreground opacity-60 shrink-0" />
                      <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                        {t.import.dragHint}
                      </p>
                    </>
                  )}
                </div>

                {!isImporting && importedCount === null && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={handleSelectAndImport}>
                      {t.import.selectBtn}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-6 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} disabled={isImporting}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  {locale === 'zh' ? '返回' : 'Back'}
                </Button>
                <div className="flex gap-2">
                  {importedCount === null && (
                    <Button variant="ghost" onClick={() => setStep(4)} disabled={isImporting}>
                      {t.import.skipBtn}
                    </Button>
                  )}
                  <Button
                    onClick={() => setStep(4)}
                    disabled={isImporting || (importedCount === null && !libPath)}
                  >
                    {t.import.nextBtn}
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Delivery Settings */}
          {step === 4 && (
            <div className="flex-1 min-h-0 flex flex-col">
              <DeliveryWizardView
                locale={locale}
                isEmbedInOnboarding={true}
                onSaveSuccess={onComplete}
                onSkip={onComplete}
                onCancel={() => setStep(3)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
