import React, { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Component,
  FileText,
  FolderOpen,
  Library,
  Loader2,
  Moon,
  BookText,
  Settings,
  Sun,
  SwatchBook,
  Globe,
  Mail,
  FolderPlus,
  ImageOff,
  RefreshCw,
  BookUp,
  FileDown,
  Trash2,
  RotateCcw,
  X,
  Lock,
  FileArchive,
  Eye,
  EyeOff,
  Pencil,
  FolderInput,
  Puzzle,
  MoreHorizontal
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EntityListDialog } from '@/components/EntityListDialog'
import { TrafficLights } from '@/components/ui/traffic-lights'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { uiText, type LanguageMode } from './i18n'
import OnboardingView from './onboarding'
import { ExtensionsView } from './extensions/ExtensionsView'
import { PdfReader } from '@/features/reader/PdfReader'
import { VolumeReader } from '@/features/reader/VolumeReader'
import { PageEmpty } from '@/components/PageEmpty'
import { DeliverySettingsView } from '@/features/delivery/DeliverySettingsView'
import { ArchiveView } from '@/features/delivery/ArchiveView'
import { WebPushView } from '@/features/delivery/WebPushView'

import type {
  ViewId,
  ThemeMode,
  LibraryEntry,
  LibrarySeries,
  LibraryBook,
  LibraryDirEntry,
  LibraryVolume,
  ImportScanResult,
  ImportTarget,
  TrashBookView
} from '@/lib/types'
import {
  volumeFormatLabel
} from '@/lib/format'
import { getProgress } from '@/lib/reading-storage'
import { useConvertActivity, type ConvertActivity } from '@/features/convert/useConvertActivity'
import { ConvertActivityPopover } from '@/features/convert/ConvertActivityPopover'
import { ConvertPreviewDialog } from '@/features/convert/ConvertPreviewDialog'
import { ConvertWorkbench, type WorkbenchItem } from '@/features/convert/ConvertWorkbench'

// 开发期组件/规范演示页：仅 dev 构建载入，生产包里整段不存在（含 recharts 等重依赖）
const DevShowcase = import.meta.env.DEV ? React.lazy(() => import('./dev/Showcase')) : null



type SidebarGroupItem = {
  id: ViewId
  icon: LucideIcon
  badge?: string
}

type SidebarGroupConfig = {
  titleKey: 'groupMyLibrary' | 'groupKindleSend' | 'groupDevMode'
  items: SidebarGroupItem[]
}

const sidebarGroups: SidebarGroupConfig[] = [
  {
    titleKey: 'groupMyLibrary',
    items: [{ id: 'library', icon: Library, badge: '128' }]
  },
  {
    titleKey: 'groupKindleSend',
    items: [
      { id: 'archive', icon: Archive },
      { id: 'web-push', icon: Globe },
      { id: 'devices-emails', icon: Mail },
      { id: 'extensions', icon: Puzzle }
    ]
  },
  {
    titleKey: 'groupDevMode',
    items: [
      { id: 'design-components', icon: Component, badge: '59' },
      { id: 'foundation-standards', icon: SwatchBook }
    ]
  }
]

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem('comic-to-kindle-theme')

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialLanguageMode(): LanguageMode {
  if (typeof window === 'undefined') {
    return 'zh'
  }

  const storedLanguage = window.localStorage.getItem('comic-to-kindle-language')

  return storedLanguage === 'en' ? 'en' : 'zh'
}

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ViewId>('library')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(getInitialLanguageMode)
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return window.localStorage.getItem('comic-to-kindle-onboarded') !== 'true'
  })
  // 转换活动队列上提到 App 层，切换视图时不中断
  const convertActivity = useConvertActivity(languageMode)

  // ---- 当前托管库包路径，上提到 App 层以便切换视图后保持选择 ----
  const [libRoot, setLibRoot] = useState<string | null>(null)

  const isShowcaseView =
    activeView === 'design-components' ||
    activeView === 'foundation-standards' ||
    activeView === 'app-components'

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', themeMode === 'dark')
    root.style.colorScheme = themeMode
    window.localStorage.setItem('comic-to-kindle-theme', themeMode)
    window.api.setBackgroundColor(themeMode === 'dark' ? '#09090b' : '#ffffff')
  }, [themeMode])

  useEffect(() => {
    document.documentElement.lang = languageMode === 'zh' ? 'zh-CN' : 'en'
    window.localStorage.setItem('comic-to-kindle-language', languageMode)
  }, [languageMode])

  if (showOnboarding) {
    return (
      <OnboardingView
        locale={languageMode}
        setLocale={setLanguageMode}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onComplete={() => {
          window.localStorage.setItem('comic-to-kindle-onboarded', 'true')
          setShowOnboarding(false)
          window.api?.library?.getSaved().then((saved) => {
            if (saved) {
              setLibRoot(saved)
            }
          })
        }}
      />
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full bg-muted/50 text-foreground">
        <AppSidebar
          activeView={activeView}
          locale={languageMode}
          onSelect={setActiveView}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
        />
        <SidebarInset className="flex min-w-0 flex-col overflow-hidden">
          {activeView === 'library' ? (
            // 库视图自带合并后的顶栏（标题/面包屑 + 操作），不再叠加 AppHeader
            <LibraryView
              locale={languageMode}
              activity={convertActivity}
              root={libRoot}
              setRoot={setLibRoot}
              onOpenArchive={() => setActiveView('archive')}
            />
          ) : DevShowcase && isShowcaseView ? (
            <React.Suspense fallback={<div className="flex-1 bg-background" />}>
              <DevShowcase activeView={activeView} locale={languageMode} />
            </React.Suspense>
          ) : (
            <>
              <AppHeader languageMode={languageMode} activeNavItemId={activeView} />

              {activeView === 'archive' ? (
                <ArchiveView locale={languageMode} />
              ) : activeView === 'web-push' ? (
                <WebPushView locale={languageMode} onGotoArchive={() => setActiveView('archive')} />
              ) : activeView === 'devices-emails' ? (
                <DeliverySettingsView locale={languageMode} />
              ) : activeView === 'extensions' ? (
                <ExtensionsView locale={languageMode} />
              ) : (
                <div className="flex-1 bg-background" />
              )}
            </>
          )}
        </SidebarInset>
      </div>
      <Toaster theme={themeMode} />
    </SidebarProvider>
  )
}

interface AppHeaderProps {
  languageMode: LanguageMode
  activeNavItemId: ViewId
}

function AppHeader({ languageMode, activeNavItemId }: AppHeaderProps): React.JSX.Element {
  const text = uiText[languageMode]
  const { isMobile } = useSidebar()

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {isMobile ? (
        <SidebarTrigger
          className="-ml-1 size-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        />
      ) : null}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{text.nav[activeNavItemId]}</span>
      </div>
    </header>
  )
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

/** 文件夹卡的可点击视觉（封面 + 册数角标 + 文件夹名），下钻容器复用。纯收纳，无作者。 */
function FolderStackCard({
  item,
  picked,
  volumeUnitLabel,
  onClick,
  onDoubleClick
}: {
  item: LibrarySeries
  picked: boolean
  volumeUnitLabel: string
  onClick: () => void
  onDoubleClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      data-series-card
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onDoubleClick()
      }}
      className="group flex cursor-default flex-col gap-2 text-left outline-none"
    >
      <AspectRatio
        ratio={5 / 7}
        className={`relative overflow-hidden rounded-lg bg-muted transition-all ${
          picked ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
        }`}
      >
        <CoverImage src={item.coverUrl} alt={item.title} />
        <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
      </AspectRatio>
      <div
        className={`min-w-0 rounded-md px-1.5 py-0.5 ${
          picked ? 'bg-accent text-accent-foreground' : ''
        }`}
      >
        <div className="truncate text-sm font-medium" title={item.title}>
          {item.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{volumeUnitLabel}</div>
      </div>
    </button>
  )
}

const LIBRARY_GRID =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'



// ---------- 转换活动（队列）：上提到 App 层，跨视图保活 ----------
// 持久化到 userData/queue.json（main 端 queue.ts），重启后恢复；converting 回退为 queued 整卷重跑。
// 'interrupted'：上次会话被强制退出时未完成的任务，重启后不自动跑、等用户确认继续


function LibraryView({
  locale,
  activity,
  root,
  setRoot,
  onOpenArchive
}: {
  locale: LanguageMode
  activity: ConvertActivity
  root: string | null
  setRoot: (r: string | null) => void
  onOpenArchive: () => void
}): React.JSX.Element {
  const text = uiText[locale]
  const { isMobile } = useSidebar()
  const managedLibrary = root?.toLowerCase().endsWith('.ctklib') ?? false
  const [series, setSeries] = useState<LibraryEntry[]>([])
  const [selected, setSelected] = useState<LibrarySeries | null>(null)
  // 下钻路径栈（面包屑）：[根下的部, 子部, …]，selected 恒为栈顶（当前所在部）
  const [trail, setTrail] = useState<LibrarySeries[]>([])
  const [volumes, setVolumes] = useState<LibraryDirEntry[]>([])
  const [readingVolume, setReadingVolume] = useState<LibraryVolume | null>(null)
  const [loading, setLoading] = useState(false)
  // 多选模式：先勾选若干卷再批量转换（替代「转换整部」入口）
  const [selectMode, setSelectMode] = useState(false)
  const [selectedVols, setSelectedVols] = useState<Set<string>>(new Set())
  // Shift+单击的范围锚点：记录上一次普通点选的卷 path，shift 时据此整段选中
  const selectAnchorRef = useRef<string | null>(null)
  // 部（series）层单击选中：纯视觉高亮，给「可双击进入」的预期反馈（暂无批量动作，故单选）
  const [selectedSeriesPath, setSelectedSeriesPath] = useState<string | null>(null)
  // 框选（橡皮筋）：在空白处按下拖动进入多选
  const gridWrapRef = React.useRef<HTMLDivElement>(null)
  const dragImportDepthRef = React.useRef(0)
  const [marquee, setMarquee] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  // 转换活动（队列 + 产物 + 进度）由 App 层 hook 提供，跨视图保活
  const { convertedPaths, jobByPath, enqueue } = activity

  // ---- 单文件来源：压缩包解出 / PDF 渲染 / 图片型 EPUB 抽图 ----
  const isUnsupportedVol = (v: LibraryVolume): boolean =>
    v.kind === 'file' && !['archive', 'pdf', 'epub'].includes(v.sourceType)

  // 解锁对话框：用 Promise + ref 让阅读/转换流程能 await 用户输入密码
  const [unlockReq, setUnlockReq] = useState<{
    vol: LibraryVolume
    password: string
    error: string | null
    remember: boolean
    busy: boolean
    show: boolean
  } | null>(null)
  const unlockResolve = React.useRef<((ok: boolean) => void) | null>(null)
  // 单文件准备进度（压缩包解压 / PDF 渲染 / 图片型 EPUB 抽图）
  const [extractPct, setExtractPct] = useState<number | null>(null)
  const prepareToastRef = React.useRef<string | number | null>(null) // 准备中的 toast id（实时更新文案）
  const extractNameRef = React.useRef<string>('') // 当前准备卷册名，供 toast/进度文案使用
  const extractStartedRef = React.useRef(false) // 是否真的开始处理（缓存命中则不触发，用于决定是否提示“完成”）

  // 转换工作台（格式转换）：整页三栏，逐卷编辑书籍信息 + 全局参数，替代旧的单卷/批量确认弹窗。
  // null = 关闭；非空数组 = 本次要转换的卷（每卷可独立改系列名/卷册名/作者）。
  const [workbench, setWorkbench] = useState<WorkbenchItem[] | null>(null)

  // 编辑「书籍信息」（名称 + 作者）。kind='series' 改部（renameSeries），
  // kind='book' 改单本散卷/卷册（setBookMeta，作者跟书走）。持久化覆盖，不改本地文件夹名。
  const [seriesMetaReq, setSeriesMetaReq] = useState<{
    kind: 'series' | 'book'
    id?: string
    name: string
    title: string
    author: string
    busy: boolean
  } | null>(null)

  // ---- 文件整理（真·本地文件操作）----
  // 批量重命名（托管库 manifest 级，只改卷册 displayName）：序号模板 + 实时预览
  const [batchRenameReq, setBatchRenameReq] = useState<{
    items: { id: string; oldName: string }[]
    template: string
    start: number
    busy: boolean
  } | null>(null)
  // 批量设置作者（多选 → 同一作者）：文件夹不再持有作者，作者一律按书设
  const [batchAuthorReq, setBatchAuthorReq] = useState<{
    ids: string[]
    author: string
    busy: boolean
  } | null>(null)
  const [moveReq, setMoveReq] = useState<{ sources: string[]; busy: boolean } | null>(null)
  const [moveNewFolderName, setMoveNewFolderName] = useState<string | null>(null)
  const [deleteReq, setDeleteReq] = useState<{
    paths: string[]
    kind?: 'series' | 'books'
    /** 删「部」时是否连卷册一并删除（默认 false = 解散，卷册移到未分组） */
    withBooks?: boolean
    busy: boolean
  } | null>(null)
  const [importReq, setImportReq] = useState<{
    scan: ImportScanResult
    deleteSourceAfter: boolean
    target: ImportTarget
    busy: boolean
    progress?: { done: number; total: number; name: string; fraction: number }
  } | null>(null)
  const [dragImportActive, setDragImportActive] = useState(false)
  const [trashReq, setTrashReq] = useState<{
    items: TrashBookView[]
    busy: boolean
  } | null>(null)
  const [newFolderReq, setNewFolderReq] = useState<{
    parent: string
    name: string
    busy: boolean
  } | null>(null)

  React.useEffect(() => {
    return window.api.archive.onProgress(({ percent }) => {
      extractStartedRef.current = true
      setExtractPct(percent)
      if (prepareToastRef.current != null) {
        toast.loading(text.archive.extractingNamed(extractNameRef.current, percent), {
          id: prepareToastRef.current
        })
      }
    })
  }, [text])

  React.useEffect(() => {
    return window.api.library.onImportProgress((p) => {
      setImportReq((s) => (s ? { ...s, progress: p } : s))
    })
  }, [])

  const refreshVolumes = React.useCallback(async () => {
    if (!selected) return
    try {
      setVolumes(await window.api.library.listVolumes(selected.path))
    } catch {
      /* 刷新失败保持原状 */
    }
  }, [selected])

  const requestUnlock = (vol: LibraryVolume): Promise<boolean> =>
    new Promise((resolve) => {
      unlockResolve.current = resolve
      setUnlockReq({ vol, password: '', error: null, remember: true, busy: false, show: false })
    })

  /** 确保单文件卷册已准备成页面缓存；加密压缩包需要密码时弹框。返回是否可继续 */
  const ensureArchiveReady = async (vol: LibraryVolume): Promise<boolean> => {
    if (vol.kind !== 'file') return true
    if (isUnsupportedVol(vol)) {
      toast.error(text.archive.unsupported)
      return false
    }
    const tid = toast.loading(text.archive.preparingNamed(vol.title))
    prepareToastRef.current = tid
    extractNameRef.current = vol.title
    extractStartedRef.current = false
    setExtractPct(null)
    const r = await window.api.archive.prepare(vol.path)
    prepareToastRef.current = null
    setExtractPct(null)
    if (r.status === 'ready') {
      // 真正处理过才提示“完成”；缓存命中（瞬间 ready）则静默收起 toast
      if (extractStartedRef.current) toast.success(text.archive.done(vol.title), { id: tid })
      else toast.dismiss(tid)
      if (!vol.coverUrl) void refreshVolumes()
      return true
    }
    toast.dismiss(tid)
    if (r.status === 'error') {
      toast.error(
        r.message === 'NO_IMAGES'
          ? vol.sourceType === 'archive'
            ? text.archive.noImages
            : text.archive.noPages
          : `${text.archive.extractFailed}：${r.message ?? ''}`
      )
      return false
    }
    return requestUnlock(vol)
  }

  const submitUnlock = async (): Promise<void> => {
    if (!unlockReq || unlockReq.busy || !unlockReq.password) return
    const name = unlockReq.vol.title
    extractNameRef.current = name
    setUnlockReq({ ...unlockReq, busy: true, error: null })
    setExtractPct(0)
    const r = await window.api.archive.unlock(
      unlockReq.vol.path,
      unlockReq.password,
      unlockReq.remember
    )
    setExtractPct(null)
    if (r.status === 'ready') {
      toast.success(text.archive.done(name))
      const resolve = unlockResolve.current
      unlockResolve.current = null
      setUnlockReq(null)
      await refreshVolumes()
      resolve?.(true)
    } else if (r.status === 'needs-password') {
      setUnlockReq((s) => (s ? { ...s, busy: false, error: text.archive.wrongPassword } : s))
    } else {
      toast.error(text.archive.extractFailed)
      const resolve = unlockResolve.current
      unlockResolve.current = null
      setUnlockReq(null)
      resolve?.(false)
    }
  }

  const cancelUnlock = (): void => {
    const resolve = unlockResolve.current
    unlockResolve.current = null
    setUnlockReq(null)
    resolve?.(false)
  }

  const openVolume = async (vol: LibraryVolume): Promise<void> => {
    // PDF 阅读走内置查看器，无需预渲染整本；直接进阅读器
    if (vol.sourceType === 'pdf') {
      setReadingVolume(vol)
      return
    }
    if (await ensureArchiveReady(vol)) setReadingVolume(vol)
  }

  // 单卷册转换：先弹窗确认书籍信息，确认后解出（如需）再入队
  // 模拟 Kindle 预览：先确保源已准备成页面缓存，再开预览弹窗调参
  const [previewVol, setPreviewVol] = useState<LibraryVolume | null>(null)
  const openConvertPreview = async (vol: LibraryVolume): Promise<void> => {
    if (await ensureArchiveReady(vol)) setPreviewVol(vol)
  }

  const enqueueVolume = (vol: LibraryVolume): void => {
    if (!selected) return
    setWorkbench([
      {
        vol,
        seriesPathName: selected.name,
        title: vol.title,
        author: (vol as LibraryBook).author ?? ''
      }
    ])
  }

  // 工作台「开始转换」：右栏参数已即调即存为 localStorage 默认，enqueue 入队时会读它做快照。
  // 逐卷确保源已准备（压缩包解出 / PDF 渲染）后入队，进度走 App 层队列 popover。
  const startWorkbench = async (items: WorkbenchItem[]): Promise<void> => {
    setWorkbench(null)
    exitSelect()
    const ready: WorkbenchItem[] = []
    for (const it of items) {
      if (await ensureArchiveReady(it.vol)) ready.push(it)
    }
    ready.forEach((it) =>
      enqueue({
        sourceVolumePath: it.vol.path,
        seriesPathName: it.seriesPathName,
        title: it.title.trim(),
        author: it.author.trim() || null
      })
    )
    if (ready.length > 0) toast.success(text.activity.enqueued(ready.length))
  }

  // 文件夹「重命名」：纯收纳容器只有名字，没有作者
  const openSeriesMeta = React.useCallback((item: LibrarySeries | null): void => {
    if (!item) return
    setSeriesMetaReq({
      kind: 'series',
      id: item.id,
      name: item.name,
      title: item.title,
      author: '',
      busy: false
    })
  }, [])

  // 编辑单本散卷/卷册的书籍信息（书名 + 作者）——跟文件夹同款弹窗
  const openBookMeta = React.useCallback((book: LibraryBook): void => {
    setSeriesMetaReq({
      kind: 'book',
      id: book.id,
      name: book.name,
      title: book.title,
      author: book.author ?? '',
      busy: false
    })
  }, [])

  const submitSeriesMeta = async (): Promise<void> => {
    if (!seriesMetaReq || seriesMetaReq.busy || !seriesMetaReq.id) return
    const author = seriesMetaReq.author.trim() || null
    setSeriesMetaReq({ ...seriesMetaReq, busy: true })
    try {
      if (seriesMetaReq.kind === 'book') {
        await window.api.library.setBookMeta(seriesMetaReq.id, seriesMetaReq.title, author)
      } else {
        await window.api.library.renameSeries(seriesMetaReq.id, seriesMetaReq.title)
        setSelected((prev) =>
          prev && prev.id === seriesMetaReq.id
            ? { ...prev, name: seriesMetaReq.title, title: seriesMetaReq.title }
            : prev
        )
      }
      setSeriesMetaReq(null)
      toast.success(text.seriesMeta.saved)
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setSeriesMetaReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  // Radix 右键菜单关闭那一帧会派发 pointerup/focus 事件，刚打开的 Dialog/AlertDialog 会把它
  // 误判为「点击外部」而立即自关 → 表现为「点了菜单项没反应」。把开弹框延到下一宏任务
  // （菜单已收起后）执行即可规避。新建文件夹用的是工具栏按钮，无此问题。
  const deferOpen = (fn: () => void): void => {
    setTimeout(fn, 0)
  }

  // ---- 文件整理：错误码翻译 + 统一刷新 + 各操作 ----
  const fileopErr = (e: unknown): string => {
    const m = `${e}`
    if (m.includes('NAME_EXISTS')) return text.fileops.errNameExists
    if (m.includes('INVALID_NAME')) return text.fileops.errInvalidName
    if (m.includes('MOVE_INTO_SELF')) return text.fileops.errMoveIntoSelf
    return text.fileops.errGeneric
  }

  // 操作后刷新：卷册视图刷卷，部视图重扫
  const refreshAfterFileop = async (): Promise<void> => {
    if (root) await loadSeries(root)
    if (selected) await refreshVolumes()
  }

  const swapIdOrder = (ids: string[], id: string, delta: -1 | 1): string[] | null => {
    const idx = ids.indexOf(id)
    const nextIdx = idx + delta
    if (idx < 0 || nextIdx < 0 || nextIdx >= ids.length) return null
    const next = [...ids]
    ;[next[idx], next[nextIdx]] = [next[nextIdx], next[idx]]
    return next
  }

  const reorderTopSeries = async (id: string, delta: -1 | 1): Promise<void> => {
    if (!managedLibrary || !root) return
    const ids = series.filter((item) => item.type === 'folder').map((item) => item.id)
    const ordered = swapIdOrder(ids, id, delta)
    if (!ordered) return
    try {
      await window.api.library.reorderSeries(ordered)
      await loadSeries(root)
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const reorderUngroupedBook = async (id: string, delta: -1 | 1): Promise<void> => {
    if (!managedLibrary || !root) return
    const ids = series.filter((item) => item.type === 'book').map((item) => item.id)
    const ordered = swapIdOrder(ids, id, delta)
    if (!ordered) return
    try {
      await window.api.library.reorderBooks(null, ordered)
      await loadSeries(root)
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const reorderSeriesBook = async (
    seriesId: string,
    bookId: string,
    ids: string[],
    delta: -1 | 1
  ): Promise<void> => {
    if (!managedLibrary) return
    const ordered = swapIdOrder(ids, bookId, delta)
    if (!ordered) return
    try {
      await window.api.library.reorderBooks(seriesId, ordered)
      if (selected?.id === seriesId) await refreshVolumes()
      if (root) await loadSeries(root)
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const renderSortItems = (
    ids: string[],
    id: string,
    onMove: (delta: -1 | 1) => Promise<void>
  ): React.JSX.Element | null => {
    if (!managedLibrary) return null
    const idx = ids.indexOf(id)
    return (
      <>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={idx <= 0} onSelect={() => void onMove(-1)}>
          <ArrowUp className="size-4" strokeWidth={1.75} />
          {text.library.moveUp}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={idx < 0 || idx >= ids.length - 1}
          onSelect={() => void onMove(1)}
        >
          <ArrowDown className="size-4" strokeWidth={1.75} />
          {text.library.moveDown}
        </ContextMenuItem>
      </>
    )
  }

  // 右键命中的卷：若它在多选集合内则对整组操作，否则只对它
  const volTargets = (vol: LibraryVolume): string[] => {
    if (!managedLibrary) {
      return selectedVols.has(vol.path) && selectedVols.size > 1 ? [...selectedVols] : [vol.path]
    }
    if (selectedVols.has(vol.path) && selectedVols.size > 1) {
      return (selected !== null ? volumes : series)
        .filter((v): v is LibraryVolume => v.type === 'book' && selectedVols.has(v.path))
        .map((v) => v.id)
    }
    return [vol.id]
  }

  // 序号模板渲染：含 {n} 则替换，否则在末尾补空格 + 序号
  const renderBatchName = (template: string, num: number): string =>
    template.includes('{n}') ? template.replaceAll('{n}', String(num)) : `${template} ${num}`.trim()

  // 当前层按显示顺序取出被多选的卷册（批量重命名只作用卷册）
  const buildBatchItems = (): { id: string; oldName: string }[] =>
    (selected !== null ? volumes : series)
      .filter((v): v is LibraryVolume => v.type === 'book' && selectedVols.has(v.path))
      .map((v) => ({ id: v.id, oldName: v.name }))

  const openBatchRename = (): void => {
    const items = buildBatchItems()
    if (items.length === 0) return
    setBatchRenameReq({ items, template: text.fileops.batchDefaultTemplate, start: 1, busy: false })
  }

  const submitBatchRename = async (): Promise<void> => {
    if (!batchRenameReq || batchRenameReq.busy) return
    const { items, template, start } = batchRenameReq
    if (!template.trim() || items.length === 0) return
    const updates = items.map((it, i) => ({
      id: it.id,
      displayName: renderBatchName(template, start + i)
    }))
    if (updates.some((u) => !u.displayName.trim())) return
    setBatchRenameReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.renameBooks(updates)
      const n = updates.length
      setBatchRenameReq(null)
      exitSelect()
      toast.success(text.fileops.batchRenamed(n))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setBatchRenameReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const openBatchAuthor = (): void => {
    const ids = (selected !== null ? volumes : series)
      .filter((v): v is LibraryVolume => v.type === 'book' && selectedVols.has(v.path))
      .map((v) => v.id)
    if (ids.length === 0) return
    setBatchAuthorReq({ ids, author: '', busy: false })
  }

  const submitBatchAuthor = async (): Promise<void> => {
    if (!batchAuthorReq || batchAuthorReq.busy) return
    setBatchAuthorReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.setBooksAuthor(
        batchAuthorReq.ids,
        batchAuthorReq.author.trim() || null
      )
      const n = batchAuthorReq.ids.length
      setBatchAuthorReq(null)
      exitSelect()
      toast.success(text.fileops.batchAuthorDone(n))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setBatchAuthorReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitMove = async (destDir: string): Promise<void> => {
    if (!moveReq || moveReq.busy) return
    setMoveReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.assignBooks(moveReq.sources, destDir)
      const n = moveReq.sources.length
      setMoveReq(null)
      setMoveNewFolderName(null)
      exitSelect()
      toast.success(text.fileops.moved(n))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setMoveReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitMoveToNewFolder = async (): Promise<void> => {
    if (
      !moveReq ||
      moveReq.busy ||
      moveNewFolderName === null ||
      !moveNewFolderName.trim() ||
      !root
    )
      return
    setMoveReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.createSeries(moveNewFolderName, moveReq.sources)
      const n = moveReq.sources.length
      setMoveReq(null)
      setMoveNewFolderName(null)
      exitSelect()
      toast.success(text.fileops.moved(n))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setMoveReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitDelete = async (): Promise<void> => {
    if (!deleteReq || deleteReq.busy) return
    setDeleteReq((s) => (s ? { ...s, busy: true } : s))
    try {
      if (deleteReq.kind === 'series') {
        const withBooks = deleteReq.withBooks === true
        await Promise.all(
          deleteReq.paths.map((id) => window.api.library.deleteSeries(id, withBooks))
        )
      } else {
        await window.api.library.trashBooks(deleteReq.paths)
      }
      setDeleteReq(null)
      exitSelect() // 删除后清掉多选态，避免残留已删 path 让 toolbar 计数变脏
      setSelectedSeriesPath(null) // 删的是部时，清掉部选中态
      toast.success(text.fileops.deleted(deleteReq.paths.length))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setDeleteReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const openNewFolder = (): void => {
    const parent = selected?.path ?? root
    if (!parent) return
    setNewFolderReq({ parent, name: '', busy: false })
  }

  const submitNewFolder = async (): Promise<void> => {
    if (!newFolderReq || newFolderReq.busy || !newFolderReq.name.trim()) return
    setNewFolderReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.createSeries(newFolderReq.name, [])
      setNewFolderReq(null)
      toast.success(text.fileops.created)
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setNewFolderReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  // 移动目标 = 其他「部」文件夹（散卷/卷册可移入任一部；书本身不能当目标）
  const moveTargets = (): LibrarySeries[] =>
    series.filter((s): s is LibrarySeries => s.type === 'folder' && s.path !== selected?.path)

  const exitSelect = (): void => {
    setSelectMode(false)
    setSelectedVols(new Set())
  }

  const shouldUseSelectMode = (count: number): boolean => count >= 2

  // 文件管理器式按下即选中：普通点 = 只选这一项；Cmd/Ctrl 点或已在多选模式 = 累加/切换；
  // Shift 点 = 从锚点到当前项整段选中。只有选中 2 个及以上才进入多选模式。
  const onSelectablePointerDown = (path: string, e: React.PointerEvent): void => {
    if (e.button !== 0 || !e.isPrimary) return

    // Shift+单击：以上一次点选项为锚点，对当前层可选「卷」的视觉顺序整段选中。
    // 锚点保持不变，便于反复 shift 调整范围；Cmd/Ctrl 同按时在现有选区上叠加。
    if (e.shiftKey) {
      const orderedPaths = bookVolumes.map((v) => v.path)
      const anchorIdx = selectAnchorRef.current ? orderedPaths.indexOf(selectAnchorRef.current) : -1
      const curIdx = orderedPaths.indexOf(path)
      if (anchorIdx !== -1 && curIdx !== -1) {
        const [lo, hi] = anchorIdx <= curIdx ? [anchorIdx, curIdx] : [curIdx, anchorIdx]
        const additive = e.metaKey || e.ctrlKey || selectMode
        const next = new Set(additive ? selectedVols : [])
        for (let i = lo; i <= hi; i++) next.add(orderedPaths[i])
        setSelectedVols(next)
        setSelectMode(shouldUseSelectMode(next.size))
        return
      }
      // 无有效锚点：退化为普通单选（落到下方逻辑，并把当前项设为新锚点）
    }

    if (!e.metaKey && !e.ctrlKey && selectedVols.size > 1 && selectedVols.has(path)) return
    const additive = e.metaKey || e.ctrlKey || selectMode
    const next = new Set(additive ? selectedVols : [])
    if (additive && next.has(path)) next.delete(path)
    else next.add(path)
    setSelectedVols(next)
    setSelectMode(shouldUseSelectMode(next.size))
    selectAnchorRef.current = path
  }

  const onVolumePointerDown = (vol: LibraryVolume, e: React.PointerEvent): void =>
    onSelectablePointerDown(vol.path, e)

  // 双击打开阅读器：先清掉选择态再进入（解压/解锁仍在 openVolume 内处理）
  const onVolumeOpen = async (vol: LibraryVolume): Promise<void> => {
    exitSelect()
    await openVolume(vol)
  }

  // 当前层里可选/可转换的「卷」(book)——子部不参与多选；部内取卷册，顶层书架取散卷
  const bookVolumes = (selected !== null ? volumes : series).filter(
    (v): v is LibraryVolume => v.type === 'book'
  )
  const topSeriesIds = series.filter((item) => item.type === 'folder').map((item) => item.id)
  const topBookIds = series.filter((item) => item.type === 'book').map((item) => item.id)
  const currentVolumeIds = bookVolumes.map((item) => item.id)
  const topImportTargetSeries = series.filter(
    (item): item is LibrarySeries => item.type === 'folder'
  )
  const importTargetSeries =
    selected && !topImportTargetSeries.some((item) => item.id === selected.id)
      ? [selected, ...topImportTargetSeries]
      : topImportTargetSeries
  const importTargetValue =
    importReq?.target.kind === 'series'
      ? `series:${importReq.target.seriesId}`
      : (importReq?.target.kind ?? 'ungrouped')
  const selectedConvertCount = selectedVols.size
  const allSelected = bookVolumes.length > 0 && selectedVols.size === bookVolumes.length
  const toggleAll = (): void => {
    const paths = bookVolumes.map((v) => v.path)
    setSelectedVols(allSelected ? new Set() : new Set(paths))
    setSelectMode(!allSelected && shouldUseSelectMode(paths.length))
  }

  // 转换所选：书名/作者一律用书自带的（都是单册）；seriesPathName 用于输出目录分组，
  // 文件夹内用文件夹名、顶层散卷用书自己的名。打开工作台逐本可改。
  const convertSelected = (): void => {
    if (selectedVols.size === 0) return
    const picked = bookVolumes.filter((v) => selectedVols.has(v.path))
    if (picked.length === 0) return
    const items: WorkbenchItem[] = picked.map((v) => ({
      vol: v,
      seriesPathName: selected ? selected.name : (v as LibraryBook).name,
      title: v.title,
      author: (v as LibraryBook).author ?? ''
    }))
    setWorkbench(items)
  }

  // 把当前选中的散卷/卷册移入某部（成组）：打开移动弹窗选目标部或新建部
  const groupSelected = (): void => {
    const ids = bookVolumes.filter((v) => selectedVols.has(v.path)).map((v) => v.id)
    if (ids.length === 0) return
    setMoveReq({ sources: ids, busy: false })
  }

  // 框选拖动态（用 ref 避免每次移动都触发重渲染）
  const marqueeDrag = React.useRef<{
    startX: number
    startY: number
    wrapRect: DOMRect
    base: Set<string>
    moved: boolean
  } | null>(null)

  // 空白处按下：记录起点并抓取指针。顶层和部内都可框选卷册卡；部文件夹仍只单选，
  // 避免批量转换/移动等卷册操作误作用到文件夹。命中卡片则不处理（交给卡片自身 onClick）。
  const onWrapPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return
    const el = e.target as HTMLElement
    const wrap = gridWrapRef.current
    if (!wrap) return
    // Radix 右键菜单/弹框的内容被 portal 到 document.body，但 React 事件仍沿组件树冒泡到此处。
    // 这类事件的 DOM target 不在 wrap 内——若不剔除，点击菜单项会被误判为「空白处按下」从而
    // 起框选 + setPointerCapture，吞掉点击，导致菜单项点了没反应、菜单也不收起。
    if (!wrap.contains(el)) return
    // 卡片与交互元素（空状态的导入按钮等）不触发框选，否则 setPointerCapture 会吞掉点击
    if (el.closest('button, a, [data-vol-card], [data-series-card]')) return
    const wrapRect = wrap.getBoundingClientRect()
    marqueeDrag.current = {
      startX: e.clientX - wrapRect.left,
      startY: e.clientY - wrapRect.top,
      wrapRect,
      base: new Set(selectMode ? selectedVols : []),
      moved: false
    }
    e.preventDefault() // 抑制原生文本选区
    wrap.setPointerCapture(e.pointerId)
  }

  const onWrapPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = marqueeDrag.current
    if (!d) return
    const x = e.clientX - d.wrapRect.left
    const y = e.clientY - d.wrapRect.top
    if (!d.moved && Math.hypot(x - d.startX, y - d.startY) < 6) return
    d.moved = true
    const left = Math.min(d.startX, x)
    const top = Math.min(d.startY, y)
    const width = Math.abs(x - d.startX)
    const height = Math.abs(y - d.startY)
    // 框选框是容器内 absolute 定位，容器自身是滚动区 → 叠加 scroll 偏移对齐内容
    const wrap = gridWrapRef.current
    setMarquee({
      left: left + (wrap?.scrollLeft ?? 0),
      top: top + (wrap?.scrollTop ?? 0),
      width,
      height
    })
    // 命中测试（视口坐标，无需 scroll 偏移）
    const sel = {
      left: d.wrapRect.left + left,
      top: d.wrapRect.top + top,
      right: d.wrapRect.left + left + width,
      bottom: d.wrapRect.top + top + height
    }
    const hit = new Set(d.base)
    gridWrapRef.current?.querySelectorAll<HTMLElement>('[data-vol-card]').forEach((card) => {
      const r = card.getBoundingClientRect()
      const intersect = !(
        r.right < sel.left ||
        r.left > sel.right ||
        r.bottom < sel.top ||
        r.top > sel.bottom
      )
      const path = card.dataset.volPath
      if (path && intersect) hit.add(path)
    })
    setSelectMode(shouldUseSelectMode(hit.size))
    setSelectedVols(hit)
  }

  const onWrapPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = marqueeDrag.current
    const wrap = gridWrapRef.current
    if (wrap?.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId)
    // 空白处按下未拖动 = 单击空白 → 取消两级选中（marqueeDrag 仅在按到非卡片区时才有值）
    if (d && !d.moved) {
      exitSelect()
      setSelectedSeriesPath(null)
    }
    marqueeDrag.current = null
    setMarquee(null)
  }

  const loadSeries = React.useCallback(async (target: string) => {
    setLoading(true)
    try {
      setSeries(await window.api.library.scan(target))
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化：读取已保存的库根目录并扫描
  useEffect(() => {
    let active = true
    window.api?.library?.getSaved().then((saved) => {
      if (!active || !saved) return
      setRoot(saved)
      loadSeries(saved)
    })
    return () => {
      active = false
    }
  }, [loadSeries])

  const openManagedLibrary = async (): Promise<void> => {
    if (!window.api?.library) {
      toast.error('漫画库接口未就绪，请重启 npm run dev')
      return
    }
    try {
      const picked = await window.api.library.open()
      if (!picked) return
      setRoot(picked)
      setSelected(null)
      setTrail([])
      setVolumes([])
      await loadSeries(picked)
    } catch (err) {
      toast.error(`${err}`.includes('INVALID_LIBRARY') ? text.library.openInvalid : `${err}`)
    }
  }

  const createManagedLibrary = async (): Promise<void> => {
    if (!window.api?.library) {
      toast.error('漫画库接口未就绪，请重启 npm run dev')
      return
    }
    try {
      const created = await window.api.library.create()
      if (!created) return
      setRoot(created)
      setSelected(null)
      setTrail([])
      setVolumes([])
      await loadSeries(created)
    } catch (err) {
      toast.error(`${err}`.includes('NAME_EXISTS') ? text.fileops.errNameExists : `${err}`)
    }
  }

  const openImportPreview = async (srcRoot?: string | string[]): Promise<void> => {
    if (!root) return
    try {
      const scan = await window.api.library.scanImport(srcRoot)
      if (scan.candidates.length === 0) {
        toast.info(text.library.importEmpty)
        return
      }
      const defaultTarget: ImportTarget = selected
        ? { kind: 'series', seriesId: selected.id }
        : { kind: 'ungrouped' }
      setImportReq({
        scan,
        deleteSourceAfter: false,
        target: defaultTarget,
        busy: false
      })
    } catch (err) {
      toast.error(`${err}`, { id: 'library-import' })
    }
  }

  const importIntoLibrary = async (): Promise<void> => {
    await openImportPreview()
  }

  const onImportDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!managedLibrary || !root || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragImportDepthRef.current += 1
    setDragImportActive(true)
  }

  const onImportDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!managedLibrary || !root || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragImportActive(true)
  }

  const onImportDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!managedLibrary || !root || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragImportDepthRef.current = Math.max(0, dragImportDepthRef.current - 1)
    if (dragImportDepthRef.current === 0) setDragImportActive(false)
  }

  const onImportDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    if (!managedLibrary || !root) return
    e.preventDefault()
    dragImportDepthRef.current = 0
    setDragImportActive(false)
    const paths = [...e.dataTransfer.files]
      .map((file) => window.api.library.getPathForFile(file))
      .filter((path) => path.length > 0)
    if (paths.length === 0) {
      toast.error(text.library.importDropNoPath, { id: 'library-import' })
      return
    }
    await openImportPreview(paths)
  }

  const submitImport = async (): Promise<void> => {
    if (!root || !importReq || importReq.busy) return
    const target = importReq.target
    if (target.kind === 'new' && target.title.trim().length === 0) {
      toast.error(text.fileops.errInvalidName, { id: 'library-import' })
      return
    }
    // 进度条在弹窗内显示，初值 0；不再用 toast 刷进度
    setImportReq((s) =>
      s
        ? {
            ...s,
            busy: true,
            progress: { done: 0, total: s.scan.candidates.length, name: '', fraction: 0 }
          }
        : s
    )
    try {
      const ids = await window.api.library.importBooks(importReq.scan.candidates, {
        deleteSourceAfter: importReq.deleteSourceAfter
      })
      if (target.kind === 'series') {
        await window.api.library.assignBooks(ids, target.seriesId)
      } else if (target.kind === 'new') {
        await window.api.library.createSeries(target.title.trim(), ids)
      }
      toast.success(text.library.importDone(importReq.scan.candidates.length), {
        id: 'library-import'
      })
      setImportReq(null)
      await refreshAfterFileop()
    } catch (err) {
      toast.error(`${err}`, { id: 'library-import' })
      setImportReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const openTrash = async (): Promise<void> => {
    try {
      const items = await window.api.library.listTrash()
      setTrashReq({ items, busy: false })
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const restoreTrashItem = async (trashId: string): Promise<void> => {
    if (!root || !trashReq || trashReq.busy) return
    setTrashReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.restoreTrashBooks([trashId])
      const items = await window.api.library.listTrash()
      setTrashReq({ items, busy: false })
      toast.success(text.library.trashRestored)
      await loadSeries(root)
    } catch (err) {
      toast.error(`${err}`)
      setTrashReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const emptyLibraryTrash = async (): Promise<void> => {
    if (!trashReq || trashReq.busy || trashReq.items.length === 0) return
    const ok = window.confirm(text.library.emptyTrashConfirm)
    if (!ok) return
    setTrashReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.emptyTrash()
      setTrashReq({ items: [], busy: false })
      toast.success(text.library.trashEmptied)
    } catch (err) {
      toast.error(`${err}`)
      setTrashReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  // 重新扫描：不只刷顶层书架，还要刷新当前打开的部卷册与已展开各部的缓存，
  // 否则在卷册视图里导入新文件后点重扫不生效（须退回上级再进才刷新）。
  const rescan = async (): Promise<void> => {
    await refreshAfterFileop()
  }

  // 顶层书架卡单击 = 选中高亮（单选，纯视觉反馈）；双击才进入（书→阅读器 / 部→卷册）
  const onSeriesClick = (item: { path: string }): void => {
    setSelectedSeriesPath((prev) => (prev === item.path ? prev : item.path))
  }

  // 散卷/单行本书（顶层 book）转换：打开工作台，系列名/标题就用书本身
  const enqueueTopBook = (book: LibraryBook): void => {
    setWorkbench([
      {
        vol: book,
        seriesPathName: book.name,
        title: book.title,
        author: book.author ?? ''
      }
    ])
  }

  // 进入某「部」并设定下钻路径栈（栈顶恒为当前部）。从顶层进入与从部内继续下钻共用。
  const enterSeries = async (item: LibrarySeries, nextTrail: LibrarySeries[]): Promise<void> => {
    exitSelect()
    setSelectedSeriesPath(null)
    setTrail(nextTrail)
    setSelected(item)
    setLoading(true)
    try {
      setVolumes(await window.api.library.listVolumes(item.path))
    } catch (err) {
      toast.error(`${err}`)
    } finally {
      setLoading(false)
    }
  }

  // 双击一个部 = 在当前路径基础上再深一层
  const openSeries = (item: LibrarySeries): Promise<void> => enterSeries(item, [...trail, item])

  // 面包屑点击某层 = 截断路径栈跳回该层
  const navigateTrail = (index: number): Promise<void> =>
    enterSeries(trail[index], trail.slice(0, index + 1))

  const backToSeries = (): void => {
    exitSelect()
    setSelected(null)
    setTrail([])
    setVolumes([])
  }

  // 多选模式下按 ESC 退出
  useEffect(() => {
    if (!selectMode) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') exitSelect()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectMode])

  // Cmd/Ctrl+A：只全选内容区的漫画卷（顶层散卷或部内卷册），而非浏览器默认的整页全选
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'a') return
      // 阅读时内容区是阅读器而非书架，全选漫画卷不应生效
      if (readingVolume) return
      const t = e.target as HTMLElement | null
      // 输入类控件内保留原生全选
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const layer = selected !== null ? volumes : series
      const paths = layer.filter((v) => v.type === 'book').map((v) => v.path)
      if (paths.length === 0) return
      e.preventDefault()
      setSelectedVols(new Set(paths))
      setSelectMode(shouldUseSelectMode(paths.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, volumes, series, readingVolume])

  // Delete / Backspace：删除内容区当前选中的漫画卷，走删除确认弹窗。
  // macOS 主删除键产生 'Backspace'，故两者都接管；阅读/输入/弹窗已开时不介入。
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (readingVolume || deleteReq) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const layer = selected !== null ? volumes : series
      const sel = layer.filter(
        (v): v is LibraryVolume => v.type === 'book' && selectedVols.has(v.path)
      )
      // 优先删选中的卷；没有选中卷时，若单选了某个「部」文件夹则删该部
      if (sel.length > 0) {
        e.preventDefault()
        setDeleteReq({
          paths: managedLibrary ? sel.map((v) => v.id) : sel.map((v) => v.path),
          kind: managedLibrary ? 'books' : undefined,
          busy: false
        })
        return
      }
      if (selectedSeriesPath) {
        const folder = [...series, ...volumes].find(
          (s): s is LibrarySeries => s.type === 'folder' && s.path === selectedSeriesPath
        )
        if (folder) {
          e.preventDefault()
          setDeleteReq({
            paths: [managedLibrary ? folder.id : folder.path],
            kind: managedLibrary ? 'series' : undefined,
            busy: false
          })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    selectedVols,
    selectedSeriesPath,
    selected,
    volumes,
    series,
    managedLibrary,
    readingVolume,
    deleteReq
  ])

  // Cmd/Ctrl+R（主进程已拦掉刷新并转发为 IPC）：单选「书」→编辑书籍信息；单选「文件夹」→重命名
  useEffect(() => {
    const off = window.api?.onRenameShortcut?.(() => {
      if (readingVolume || batchRenameReq) return
      const ae = document.activeElement as HTMLElement | null
      if (ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) return
      const layer = selected !== null ? volumes : series
      // 多选多个卷 → 批量重命名弹窗
      if (managedLibrary && selectedVols.size > 1) {
        const items = layer
          .filter((v): v is LibraryVolume => v.type === 'book' && selectedVols.has(v.path))
          .map((v) => ({ id: v.id, oldName: v.name }))
        if (items.length > 1) {
          setBatchRenameReq({
            items,
            template: text.fileops.batchDefaultTemplate,
            start: 1,
            busy: false
          })
        }
        return
      }
      // 单选一本书（散卷或夹内皆同）→ 编辑书籍信息（书名 + 作者）
      if (selectedVols.size === 1) {
        const path = [...selectedVols][0]
        const vol = layer.find((v): v is LibraryVolume => v.type === 'book' && v.path === path)
        if (vol) openBookMeta(vol as LibraryBook)
        return
      }
      // 没选卷、单选了一个部 → 编辑信息
      if (selectedVols.size === 0 && selectedSeriesPath) {
        const folder = [...series, ...volumes].find(
          (s): s is LibrarySeries => s.type === 'folder' && s.path === selectedSeriesPath
        )
        if (folder) openSeriesMeta(folder)
      }
    })
    return off
  }, [
    readingVolume,
    batchRenameReq,
    managedLibrary,
    selectedVols,
    selectedSeriesPath,
    selected,
    volumes,
    series,
    openSeriesMeta,
    openBookMeta
  ])

  const showVolumes = selected !== null

  // 阅读某一卷：接管整个内容区（须排在所有 hooks 之后，否则提前 return 会少调用 hook）
  if (readingVolume) {
    // PDF 来源走 Chromium 内置查看器（秒开，不预渲染整本）；其余走统一图片阅读器
    if (readingVolume.sourceType === 'pdf') {
      return (
        <PdfReader volume={readingVolume} locale={locale} onClose={() => setReadingVolume(null)} />
      )
    }
    return (
      <VolumeReader volume={readingVolume} locale={locale} onClose={() => setReadingVolume(null)} />
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      {/* 压缩包解锁对话框：阅读/转换前置遇加密包时弹出 */}
      <Dialog open={unlockReq !== null} onOpenChange={(o) => (!o ? cancelUnlock() : undefined)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.archive.dialogTitle}</DialogTitle>
            {unlockReq ? (
              <DialogDescription>{text.archive.dialogDesc(unlockReq.vol.title)}</DialogDescription>
            ) : null}
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submitUnlock()
            }}
            className="space-y-3"
          >
            {/* 用 text + CSS 遮罩而非 type=password：后者在 macOS/Chromium 下会强制英文输入法，
              无法输入中文密码。-webkit-text-security 既能掩码又保留 IME 输入。 */}
            <div className="relative">
              <Input
                type="text"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="pr-10"
                style={
                  unlockReq?.show
                    ? undefined
                    : ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)
                }
                value={unlockReq?.password ?? ''}
                placeholder={text.archive.placeholder}
                onChange={(e) =>
                  setUnlockReq((s) => (s ? { ...s, password: e.target.value, error: null } : s))
                }
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setUnlockReq((s) => (s ? { ...s, show: !s.show } : s))}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              >
                {unlockReq?.show ? (
                  <EyeOff className="size-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="size-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
            {unlockReq?.error ? (
              <p className="text-xs text-destructive">{unlockReq.error}</p>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={unlockReq?.remember ?? true}
                onCheckedChange={(c) =>
                  setUnlockReq((s) => (s ? { ...s, remember: c === true } : s))
                }
              />
              {text.archive.remember}
            </label>
            {unlockReq?.busy ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${extractPct ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {text.archive.extracting(extractPct ?? 0)}
                </p>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={cancelUnlock}>
                {text.archive.cancel}
              </Button>
              <Button type="submit" disabled={!unlockReq?.password || unlockReq?.busy}>
                {unlockReq?.busy ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                    {text.archive.unlocking}
                  </>
                ) : (
                  text.archive.unlock
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* 模拟 Kindle 转换预览（调参） */}
      {previewVol ? (
        <ConvertPreviewDialog
          vol={previewVol}
          locale={locale}
          onClose={() => setPreviewVol(null)}
        />
      ) : null}
      {/* 格式转换工作台：独立模态弹窗（两栏：待转换列表 + 书籍信息/转换格式） */}
      {workbench ? (
        <ConvertWorkbench
          initial={workbench}
          locale={locale}
          onClose={() => setWorkbench(null)}
          onStart={(items) => void startWorkbench(items)}
          onPreview={(vol) => void openConvertPreview(vol)}
        />
      ) : null}
      {/* 编辑某部漫画的名称/作者（持久化，不改本地文件夹） */}
      <Dialog
        open={seriesMetaReq !== null}
        onOpenChange={(o) => (!o && !seriesMetaReq?.busy ? setSeriesMetaReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {seriesMetaReq?.kind === 'book'
                ? text.seriesMeta.bookEdit
                : text.seriesMeta.folderEdit}
            </DialogTitle>
            <DialogDescription>
              {seriesMetaReq?.kind === 'book'
                ? text.seriesMeta.bookDesc
                : text.seriesMeta.folderDesc}
            </DialogDescription>
          </DialogHeader>
          {seriesMetaReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitSeriesMeta()
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  {seriesMetaReq.kind === 'book'
                    ? text.seriesMeta.bookName
                    : text.seriesMeta.folderName}
                </label>
                <Input
                  autoFocus
                  value={seriesMetaReq.title}
                  onChange={(e) =>
                    setSeriesMetaReq((s) => (s ? { ...s, title: e.target.value } : s))
                  }
                />
              </div>
              {seriesMetaReq.kind === 'book' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">{text.seriesMeta.author}</label>
                  <Input
                    value={seriesMetaReq.author}
                    placeholder={text.seriesMeta.authorPlaceholder}
                    onChange={(e) =>
                      setSeriesMetaReq((s) => (s ? { ...s, author: e.target.value } : s))
                    }
                  />
                </div>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSeriesMetaReq(null)}
                  disabled={seriesMetaReq.busy}
                >
                  {text.seriesMeta.cancel}
                </Button>
                <Button type="submit" disabled={!seriesMetaReq.title.trim() || seriesMetaReq.busy}>
                  {text.seriesMeta.save}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 库整理：批量重命名（序号模板 + 实时预览，只改卷册 displayName） */}
      <Dialog
        open={batchRenameReq !== null}
        onOpenChange={(o) => (!o && !batchRenameReq?.busy ? setBatchRenameReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{text.fileops.batchRenameTitle}</DialogTitle>
            <DialogDescription>
              {batchRenameReq ? text.fileops.batchRenameDesc(batchRenameReq.items.length) : ''}
            </DialogDescription>
          </DialogHeader>
          {batchRenameReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitBatchRename()
              }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {text.fileops.batchTemplateLabel}
                  </div>
                  <Input
                    autoFocus
                    value={batchRenameReq.template}
                    placeholder={text.fileops.batchTemplatePlaceholder}
                    onChange={(e) =>
                      setBatchRenameReq((s) => (s ? { ...s, template: e.target.value } : s))
                    }
                  />
                </div>
                <div className="w-24 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {text.fileops.batchStartLabel}
                  </div>
                  <Input
                    type="number"
                    value={batchRenameReq.start}
                    onChange={(e) =>
                      setBatchRenameReq((s) =>
                        s ? { ...s, start: Math.trunc(Number(e.target.value) || 0) } : s
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{text.fileops.batchTemplateHint}</div>
              <div className="space-y-1">
                <div className="text-xs font-medium">{text.fileops.batchPreviewTitle}</div>
                <div className="max-h-48 space-y-0.5 overflow-auto rounded-md border bg-muted/30 p-2 text-sm">
                  {batchRenameReq.items.map((it, i) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <span className="flex-1 truncate text-muted-foreground">{it.oldName}</span>
                      <span className="shrink-0 text-muted-foreground">→</span>
                      <span className="flex-1 truncate font-medium">
                        {renderBatchName(batchRenameReq.template, batchRenameReq.start + i)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setBatchRenameReq(null)}
                  disabled={batchRenameReq.busy}
                >
                  {text.fileops.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={!batchRenameReq.template.trim() || batchRenameReq.busy}
                >
                  {text.fileops.confirm}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 库整理：批量设置作者（多选 → 同一作者） */}
      <Dialog
        open={batchAuthorReq !== null}
        onOpenChange={(o) => (!o && !batchAuthorReq?.busy ? setBatchAuthorReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.batchAuthorTitle}</DialogTitle>
            <DialogDescription>
              {batchAuthorReq ? text.fileops.batchAuthorDesc(batchAuthorReq.ids.length) : ''}
            </DialogDescription>
          </DialogHeader>
          {batchAuthorReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitBatchAuthor()
              }}
              className="space-y-3"
            >
              <Input
                autoFocus
                value={batchAuthorReq.author}
                placeholder={text.seriesMeta.authorPlaceholder}
                onChange={(e) =>
                  setBatchAuthorReq((s) => (s ? { ...s, author: e.target.value } : s))
                }
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setBatchAuthorReq(null)}
                  disabled={batchAuthorReq.busy}
                >
                  {text.fileops.cancel}
                </Button>
                <Button type="submit" disabled={batchAuthorReq.busy}>
                  {text.fileops.confirm}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 文件整理：新建文件夹 */}
      <Dialog
        open={newFolderReq !== null}
        onOpenChange={(o) => (!o && !newFolderReq?.busy ? setNewFolderReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.newFolderTitle}</DialogTitle>
            <DialogDescription>{text.fileops.newFolderDesc}</DialogDescription>
          </DialogHeader>
          {newFolderReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitNewFolder()
              }}
              className="space-y-3"
            >
              <Input
                autoFocus
                value={newFolderReq.name}
                placeholder={text.fileops.newFolderPlaceholder}
                onChange={(e) => setNewFolderReq((s) => (s ? { ...s, name: e.target.value } : s))}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNewFolderReq(null)}
                  disabled={newFolderReq.busy}
                >
                  {text.fileops.cancel}
                </Button>
                <Button type="submit" disabled={!newFolderReq.name.trim() || newFolderReq.busy}>
                  {text.fileops.confirm}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 文件整理：移动到另一部 */}
      <Dialog
        open={moveReq !== null}
        onOpenChange={(o) => {
          if (!o && !moveReq?.busy) {
            setMoveReq(null)
            setMoveNewFolderName(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.moveTitle}</DialogTitle>
            <DialogDescription>
              {moveReq ? text.fileops.moveDesc(moveReq.sources.length) : ''}
            </DialogDescription>
          </DialogHeader>
          {moveReq ? (
            <div className="space-y-1">
              {moveTargets().length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  {text.fileops.noMoveTarget}
                </p>
              ) : (
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {moveTargets().map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={moveReq.busy}
                      onClick={() => void submitMove(t.path)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                    >
                      <FolderInput
                        className="size-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t pt-1">
                {moveNewFolderName === null ? (
                  <button
                    type="button"
                    disabled={moveReq.busy || !root}
                    onClick={() => setMoveNewFolderName('')}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <FolderPlus className="size-4 shrink-0" strokeWidth={1.75} />
                    <span>{text.fileops.moveNewFolder}</span>
                  </button>
                ) : (
                  <form
                    className="flex items-center gap-2 px-1 py-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void submitMoveToNewFolder()
                    }}
                  >
                    <Input
                      autoFocus
                      value={moveNewFolderName}
                      onChange={(e) => setMoveNewFolderName(e.target.value)}
                      placeholder={text.fileops.moveNewFolderPlaceholder}
                      disabled={moveReq.busy}
                      className="h-8 flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={moveReq.busy}
                      onClick={() => setMoveNewFolderName(null)}
                    >
                      <X className="size-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={moveReq.busy || !moveNewFolderName.trim()}
                    >
                      {text.fileops.confirm}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMoveReq(null)}
              disabled={moveReq?.busy}
            >
              {text.fileops.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 文件整理：删除到废纸篓 */}
      <AlertDialog
        open={deleteReq !== null}
        onOpenChange={(o) => (!o && !deleteReq?.busy ? setDeleteReq(null) : undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {managedLibrary && deleteReq?.kind === 'books'
                ? text.library.trashBooksTitle
                : managedLibrary && deleteReq?.kind === 'series'
                  ? text.library.deleteSeriesTitle
                  : text.fileops.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteReq
                ? managedLibrary && deleteReq.kind === 'books'
                  ? text.library.trashBooksDesc(deleteReq.paths.length)
                  : managedLibrary && deleteReq.kind === 'series'
                    ? text.library.deleteSeriesDesc
                    : text.fileops.deleteDesc(deleteReq.paths.length)
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {managedLibrary && deleteReq?.kind === 'series' ? (
            <label className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
              <Checkbox
                checked={deleteReq.withBooks === true}
                disabled={deleteReq.busy}
                onCheckedChange={(checked) =>
                  setDeleteReq((s) => (s ? { ...s, withBooks: checked === true } : s))
                }
              />
              <span className="leading-5 text-muted-foreground">
                {text.library.deleteSeriesWithBooks}
              </span>
            </label>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReq?.busy}>{text.fileops.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void submitDelete()
              }}
              disabled={deleteReq?.busy}
            >
              {text.fileops.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EntityListDialog
        open={importReq !== null}
        busy={importReq?.busy}
        onClose={() => setImportReq(null)}
        title={text.library.importBooks}
        description={
          importReq
            ? text.library.importConfirm(
                importReq.scan.candidates.length,
                importReq.scan.skipped.length
              )
            : ''
        }
        items={(importReq?.scan.candidates ?? []).map((item) => ({
          key: item.sourcePath,
          icon: BookText,
          primary: item.displayName,
          primaryTitle: item.displayName,
          secondary: item.sourceType.toUpperCase()
        }))}
        actions={[
          {
            label: text.fileops.cancel,
            variant: 'ghost',
            disabled: importReq?.busy,
            onClick: () => setImportReq(null)
          },
          {
            label: text.library.importBooks,
            disabled: importReq?.busy,
            loading: importReq?.busy,
            onClick: () => void submitImport()
          }
        ]}
      >
        {importReq?.busy ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="min-w-0 truncate">
                {text.library.importProgress(
                  importReq.progress?.done ?? 0,
                  importReq.progress?.total ?? importReq.scan.candidates.length,
                  importReq.progress?.name ?? ''
                )}
              </span>
              <span className="shrink-0 tabular-nums">
                {Math.round((importReq.progress?.fraction ?? 0) * 100)}%
              </span>
            </div>
            <Progress value={(importReq.progress?.fraction ?? 0) * 100} />
          </div>
        ) : importReq ? (
          <FieldGroup className="gap-4">
            <Field className="gap-2">
              <FieldLabel>{text.library.importTarget}</FieldLabel>
              <Select
                value={importTargetValue}
                disabled={importReq.busy}
                onValueChange={(value) =>
                  setImportReq((s) => {
                    if (!s) return s
                    if (value === 'ungrouped') {
                      return { ...s, target: { kind: 'ungrouped' } }
                    }
                    if (value === 'new') {
                      return { ...s, target: { kind: 'new', title: '' } }
                    }
                    return {
                      ...s,
                      target: { kind: 'series', seriesId: value.replace(/^series:/, '') }
                    }
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ungrouped">{text.library.ungrouped}</SelectItem>
                    {importTargetSeries.map((item) => (
                      <SelectItem key={item.id} value={`series:${item.id}`}>
                        {item.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">{text.library.importTargetNew}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {importReq.target.kind === 'new' ? (
              <Field className="gap-2">
                <FieldLabel htmlFor="import-new-series-name">
                  {text.library.importNewSeriesName}
                </FieldLabel>
                <Input
                  id="import-new-series-name"
                  autoFocus
                  value={importReq.target.title}
                  disabled={importReq.busy}
                  placeholder={text.fileops.newFolderPlaceholder}
                  onChange={(e) =>
                    setImportReq((s) =>
                      s && s.target.kind === 'new'
                        ? { ...s, target: { ...s.target, title: e.target.value } }
                        : s
                    )
                  }
                />
              </Field>
            ) : null}
            <Field
              orientation="horizontal"
              className="rounded-md border border-destructive/25 bg-destructive/5 p-3"
            >
              <Checkbox
                checked={importReq.deleteSourceAfter}
                disabled={importReq.busy}
                onCheckedChange={(checked) =>
                  setImportReq((s) => (s ? { ...s, deleteSourceAfter: checked === true } : s))
                }
              />
              <span className="leading-5 text-muted-foreground">
                {text.library.deleteSourceAfterImport}
              </span>
            </Field>
          </FieldGroup>
        ) : null}
      </EntityListDialog>
      <EntityListDialog
        open={trashReq !== null}
        busy={trashReq?.busy}
        onClose={() => setTrashReq(null)}
        title={text.library.trashTitle}
        description={text.library.trashDesc}
        scrollClassName="max-h-72"
        emptyText={text.library.trashEmpty}
        items={(trashReq?.items ?? []).map((item) => ({
          key: item.trashId,
          icon: BookText,
          primary: item.displayName,
          primaryTitle: item.displayName,
          secondary: item.seriesTitleHint ?? text.library.ungrouped,
          action: (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={trashReq?.busy}
              onClick={() => void restoreTrashItem(item.trashId)}
            >
              <RotateCcw className="size-3.5" strokeWidth={1.75} />
              {text.library.restore}
            </Button>
          )
        }))}
        actions={[
          {
            label: text.library.emptyTrash,
            variant: 'destructive',
            disabled: trashReq?.busy || trashReq?.items.length === 0,
            onClick: () => void emptyLibraryTrash()
          },
          {
            label: text.fileops.cancel,
            variant: 'ghost',
            disabled: trashReq?.busy,
            onClick: () => setTrashReq(null)
          }
        ]}
      />
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        {/* 合并后的顶栏：侧栏开关 + 标题/面包屑 + 操作 */}
        <header
          className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          {/* 窄屏（侧栏 offcanvas）时补一个开合入口 */}
          {isMobile ? (
            <SidebarTrigger
              className="-ml-1 size-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            />
          ) : null}
          {selectMode ? (
            // 文本标签：保持可拖动（不加 no-drag），让占满的空白区也能拖窗
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {text.activity.selectedCount(selectedVols.size)}
            </span>
          ) : (
            // 容器不设 no-drag：flex-1 撑满的空白区随顶栏可拖；只有内部可点链接单独 no-drag
            <Breadcrumb className="min-w-0 flex-1">
              <BreadcrumbList className="flex-nowrap">
                <>
                  <BreadcrumbItem className="shrink-0">
                    {showVolumes ? (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          onClick={backToSeries}
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                          {text.nav.library}
                        </button>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {text.nav.library}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {/* 下钻路径：祖先部可点击跳回，栈顶（当前部）为不可点的当前页 */}
                  {trail.map((node, i) => {
                    const isLast = i === trail.length - 1
                    return (
                      <React.Fragment key={node.path}>
                        <BreadcrumbSeparator className="shrink-0" />
                        <BreadcrumbItem className="min-w-0">
                          {isLast ? (
                            <BreadcrumbPage
                              className="truncate font-semibold text-foreground"
                              title={node.title}
                            >
                              {node.title}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <button
                                type="button"
                                onClick={() => void navigateTrail(i)}
                                className="truncate"
                                title={node.title}
                                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                              >
                                {node.title}
                              </button>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    )
                  })}
                </>
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {root ? (
            <div
              className="ml-2 flex shrink-0 items-center gap-1"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              {selectMode ? (
                <>
                  <Button variant="ghost" size="sm" onClick={toggleAll}>
                    {allSelected ? text.activity.selectNone : text.activity.selectAll}
                  </Button>
                  {managedLibrary ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={selectedVols.size === 0}
                      onClick={groupSelected}
                    >
                      <FolderInput className="size-4 text-muted-foreground" strokeWidth={1.75} />
                      {text.fileops.move}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    disabled={selectedConvertCount === 0}
                    onClick={() => convertSelected()}
                  >
                    <BookUp className="size-4 text-muted-foreground" strokeWidth={1.75} />
                    {text.activity.convertSelected(selectedConvertCount)}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={exitSelect}>
                        <X className="size-4 text-muted-foreground" strokeWidth={1.75} />
                        <span className="sr-only">{text.activity.selectExit}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{text.activity.selectExit}</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  {showVolumes ? (
                    // 多选入口已并入卡片单击/框选，顶栏不再需要独立「选择」按钮
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSeriesMeta(selected)}
                        >
                          <Pencil className="size-4 text-muted-foreground" strokeWidth={1.75} />
                          <span className="sr-only">{text.fileops.rename}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{text.fileops.rename}</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {managedLibrary ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={openNewFolder}>
                            <FolderPlus
                              className="size-4 text-muted-foreground"
                              strokeWidth={1.75}
                            />
                            <span className="sr-only">{text.fileops.newFolder}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{text.fileops.newFolder}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={importIntoLibrary}>
                            <FileDown className="size-4 text-muted-foreground" strokeWidth={1.75} />
                            <span className="sr-only">{text.library.importBooks}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{text.library.importBooks}</TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={openNewFolder}>
                          <FolderPlus className="size-4 text-muted-foreground" strokeWidth={1.75} />
                          <span className="sr-only">{text.fileops.newFolder}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{text.fileops.newFolder}</TooltipContent>
                    </Tooltip>
                  )}
                  <ConvertActivityPopover
                    activity={activity}
                    locale={locale}
                    onOpenArchive={onOpenArchive}
                  />
                  {/* 低频的库管理动作（重新扫描/切换库/新建库）收进溢出菜单，给顶栏减负 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal
                          className="size-4 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <span className="sr-only">{text.library.moreActions}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {managedLibrary ? (
                        <>
                          <DropdownMenuItem onClick={openTrash}>
                            <Trash2 strokeWidth={1.75} />
                            {text.library.trashTitle}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}
                      <DropdownMenuItem onClick={rescan} disabled={loading}>
                        <RefreshCw className={loading ? 'animate-spin' : ''} strokeWidth={1.75} />
                        {text.library.rescan}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openManagedLibrary}>
                        <FolderOpen strokeWidth={1.75} />
                        {text.library.changeFolder}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={createManagedLibrary}>
                        <FolderPlus strokeWidth={1.75} />
                        {text.library.createLibrary}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ) : null}
        </header>

        {!root ? (
          <PageEmpty
            icon={FolderOpen}
            title={text.library.emptyTitle}
            label={text.library.emptyDescription}
            actions={
              <>
                <Button onClick={createManagedLibrary}>{text.library.createLibrary}</Button>
                <Button variant="outline" onClick={openManagedLibrary}>
                  {text.library.openLibrary}
                </Button>
              </>
            }
          />
        ) : (
          // 用原生滚动容器而非 Radix ScrollArea：后者 Viewport 内层 display:table 使
          // min-h-full 失效、内容下方空白不在容器内（空白单击取消选择会失灵）。容器自身
          // 即滚动区 + 指针目标，撑满 flex 高度，下方空白也能命中。
          <div
            ref={gridWrapRef}
            onPointerDown={onWrapPointerDown}
            onPointerMove={onWrapPointerMove}
            onPointerUp={onWrapPointerUp}
            onDragEnter={onImportDragEnter}
            onDragOver={onImportDragOver}
            onDragLeave={onImportDragLeave}
            onDrop={(e) => void onImportDrop(e)}
            className={cn(
              'relative min-h-0 flex-1 overflow-y-auto p-4 select-none lg:p-6',
              dragImportActive ? 'ring-2 ring-primary ring-inset' : ''
            )}
          >
            {dragImportActive ? (
              <div className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-lg border border-dashed border-primary bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-md bg-background px-4 py-3 text-sm font-medium shadow-sm">
                  <FileDown className="size-5 text-primary" strokeWidth={1.75} />
                  <span>{text.library.importDropHere}</span>
                </div>
              </div>
            ) : null}
            {marquee ? (
              <div
                className="pointer-events-none absolute z-10 rounded-sm border border-primary bg-primary/15"
                style={{
                  left: marquee.left,
                  top: marquee.top,
                  width: marquee.width,
                  height: marquee.height
                }}
              />
            ) : null}
            {loading && !showVolumes ? (
              <div className={LIBRARY_GRID}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="aspect-[5/7] w-full rounded-lg" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                ))}
              </div>
            ) : showVolumes ? (
              volumes.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  {text.library.noVolumes}
                </p>
              ) : (
                <div className={LIBRARY_GRID}>
                  {volumes.map((vol) => {
                    // 子部：渲染为可继续下钻的文件夹卡（双击进入更深一层）
                    if (vol.type === 'folder') {
                      return (
                        <ContextMenu key={vol.id}>
                          <ContextMenuTrigger asChild>
                            <FolderStackCard
                              item={vol}
                              picked={selectedSeriesPath === vol.path}
                              volumeUnitLabel={text.library.volumeUnit(vol.volumeCount)}
                              onClick={() => onSeriesClick(vol)}
                              onDoubleClick={() => void openSeries(vol)}
                            />
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => deferOpen(() => openSeriesMeta(vol))}>
                              <Pencil className="size-4" strokeWidth={1.75} />
                              {text.fileops.rename}
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              variant="destructive"
                              onSelect={() =>
                                deferOpen(() =>
                                  setDeleteReq({
                                    paths: [managedLibrary ? vol.id : vol.path],
                                    kind: managedLibrary ? 'series' : undefined,
                                    busy: false
                                  })
                                )
                              }
                            >
                              <Trash2 className="size-4" strokeWidth={1.75} />
                              {text.fileops.delete}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      )
                    }
                    const isConverted = convertedPaths.has(vol.path)
                    const job = jobByPath.get(vol.path)
                    const picked = selectedVols.has(vol.path)
                    return (
                      <ContextMenu key={vol.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-vol-card
                            data-vol-path={vol.path}
                            onPointerDown={(e) => onVolumePointerDown(vol, e)}
                            onDoubleClick={() => void onVolumeOpen(vol)}
                            className="group flex cursor-default flex-col gap-2 text-left"
                          >
                            <div className="relative">
                              <div className="block w-full text-left">
                                <AspectRatio
                                  ratio={5 / 7}
                                  className={`overflow-hidden rounded-lg bg-muted transition-shadow ${
                                    picked
                                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                      : ''
                                  }`}
                                >
                                  <CoverImage
                                    src={vol.coverUrl}
                                    alt={vol.title}
                                    quiet={vol.kind === 'file'}
                                  />
                                  {/* 压缩包卷册尚无封面：占位图标（加密则用锁） */}
                                  {!vol.coverUrl && vol.kind === 'file' ? (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
                                      {vol.locked ? (
                                        <Lock className="size-8" strokeWidth={1.75} />
                                      ) : vol.sourceType === 'archive' ? (
                                        <FileArchive className="size-8" strokeWidth={1.75} />
                                      ) : (
                                        <FileText className="size-8" strokeWidth={1.75} />
                                      )}
                                    </div>
                                  ) : null}
                                  <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                                  {(() => {
                                    const prog = getProgress(vol.path)
                                    if (prog <= 0 || vol.pageCount <= 0) return null
                                    const readPct = Math.min(
                                      100,
                                      ((prog + 1) / vol.pageCount) * 100
                                    )
                                    return (
                                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/30">
                                        <div
                                          className="h-full bg-primary"
                                          style={{ width: `${readPct}%` }}
                                        />
                                      </div>
                                    )
                                  })()}
                                  {/* 多选未选中项压暗：用遮罩代替 filter:brightness，避免逐张封面建合成层导致首次进入卡顿 */}
                                  <div
                                    className={`pointer-events-none absolute inset-0 rounded-lg bg-black/30 transition-opacity duration-300 ease-out ${
                                      selectMode && !picked ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                </AspectRatio>
                              </div>
                              {/* 已转换角标：小封面下用图标圆点，避免文字撑破封面 */}
                              {isConverted && !job ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="absolute top-1.5 left-1.5 size-6 justify-center rounded-full bg-background/85 p-0 backdrop-blur"
                                    >
                                      <CheckCircle2
                                        className="size-3.5 text-emerald-500"
                                        strokeWidth={1.75}
                                      />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>{text.convert.converted}</TooltipContent>
                                </Tooltip>
                              ) : null}
                              {job ? (
                                /* 队列状态角标（转换入口已并入选中 + 顶栏「转换所选」，封面不再放单独转换按钮） */
                                <div className="absolute top-1.5 right-1.5 flex max-w-[calc(100%-0.75rem)] justify-end">
                                  <Badge
                                    variant="secondary"
                                    className="pointer-events-none max-w-full gap-1 truncate bg-background/85 backdrop-blur"
                                  >
                                    {job.status === 'converting' ? (
                                      <>
                                        <Loader2
                                          className="size-3 animate-spin"
                                          strokeWidth={1.75}
                                        />
                                        {text.convert.progress(Math.max(0, job.percent))}
                                      </>
                                    ) : job.status === 'queued' ? (
                                      text.activity.queued
                                    ) : job.status === 'interrupted' ? (
                                      <span className="text-amber-500">
                                        {text.activity.interrupted}
                                      </span>
                                    ) : (
                                      <span className="text-destructive">
                                        {text.activity.failed}
                                      </span>
                                    )}
                                  </Badge>
                                </div>
                              ) : null}
                              <Badge
                                variant="secondary"
                                className="pointer-events-none absolute right-1.5 bottom-1.5 bg-background/85 px-1.5 py-0 text-[10px] backdrop-blur"
                              >
                                {volumeFormatLabel(vol, text.library.imageFolder)}
                              </Badge>
                            </div>
                            <div
                              className={`min-w-0 rounded-md px-1.5 py-0.5 ${
                                picked ? 'bg-accent text-accent-foreground' : ''
                              }`}
                            >
                              <div className="truncate text-sm font-medium" title={vol.title}>
                                {vol.title}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {(() => {
                                  const prog = getProgress(vol.path)
                                  if (prog > 0 && vol.pageCount > 0) {
                                    return `${text.reader.resume} · ${text.reader.pageOf(prog + 1, vol.pageCount)}`
                                  }
                                  return vol.author ?? text.library.unknownAuthor
                                })()}
                              </div>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {selected ? (
                            <ContextMenuItem onSelect={() => deferOpen(() => enqueueVolume(vol))}>
                              <BookUp className="size-4" strokeWidth={1.75} />
                              {text.convert.action}
                            </ContextMenuItem>
                          ) : null}
                          <ContextMenuItem
                            onSelect={() => deferOpen(() => void openConvertPreview(vol))}
                          >
                            <Eye className="size-4" strokeWidth={1.75} />
                            {text.convertPreview.open}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onSelect={() => deferOpen(() => openBookMeta(vol as LibraryBook))}
                          >
                            <Pencil className="size-4" strokeWidth={1.75} />
                            {text.seriesMeta.edit}
                          </ContextMenuItem>
                          {managedLibrary && selectedVols.size > 1 && selectedVols.has(vol.path) ? (
                            <>
                              <ContextMenuItem onSelect={() => deferOpen(() => openBatchRename())}>
                                <Pencil className="size-4" strokeWidth={1.75} />
                                {text.fileops.batchRename(selectedVols.size)}
                              </ContextMenuItem>
                              <ContextMenuItem onSelect={() => deferOpen(() => openBatchAuthor())}>
                                <Pencil className="size-4" strokeWidth={1.75} />
                                {text.fileops.batchAuthor(selectedVols.size)}
                              </ContextMenuItem>
                            </>
                          ) : null}
                          <ContextMenuItem
                            disabled={!managedLibrary && moveTargets().length === 0}
                            onSelect={() =>
                              deferOpen(() => setMoveReq({ sources: volTargets(vol), busy: false }))
                            }
                          >
                            <FolderInput className="size-4" strokeWidth={1.75} />
                            {text.fileops.move}
                          </ContextMenuItem>
                          {renderSortItems(currentVolumeIds, vol.id, (delta) =>
                            reorderSeriesBook(selected.id, vol.id, currentVolumeIds, delta)
                          )}
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() =>
                                setDeleteReq({
                                  paths: volTargets(vol),
                                  kind: managedLibrary ? 'books' : undefined,
                                  busy: false
                                })
                              )
                            }
                          >
                            <Trash2 className="size-4" strokeWidth={1.75} />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  })}
                </div>
              )
            ) : series.length === 0 ? (
              <div className="flex h-full min-h-[24rem] flex-col">
                <PageEmpty
                  icon={BookUp}
                  title={text.library.emptyLibraryTitle}
                  label={text.library.emptyLibraryDesc}
                  actions={
                    <Button size="lg" onClick={importIntoLibrary}>
                      {text.library.importBooks}
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className={LIBRARY_GRID}>
                {series.map((item) => {
                  const picked = selectedSeriesPath === item.path
                  // ① 书(卷册)：平铺一张封面，双击直接进阅读器、可多选/转换/整理
                  if (item.type === 'book') {
                    const isConverted = convertedPaths.has(item.path)
                    const job = jobByPath.get(item.path)
                    const prog = getProgress(item.path)
                    const bookPicked = selectedVols.has(item.path)
                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-vol-card
                            data-vol-path={item.path}
                            onPointerDown={(e) => onVolumePointerDown(item, e)}
                            onDoubleClick={() => void onVolumeOpen(item)}
                            className="group flex cursor-default flex-col gap-2 text-left"
                          >
                            <div className="relative">
                              <AspectRatio
                                ratio={5 / 7}
                                className={`overflow-hidden rounded-lg bg-muted transition-shadow ${
                                  bookPicked
                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                    : ''
                                }`}
                              >
                                <CoverImage
                                  src={item.coverUrl}
                                  alt={item.title}
                                  quiet={item.kind === 'file'}
                                />
                                {!item.coverUrl && item.kind === 'file' ? (
                                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    {item.locked ? (
                                      <Lock className="size-8" strokeWidth={1.75} />
                                    ) : item.sourceType === 'archive' ? (
                                      <FileArchive className="size-8" strokeWidth={1.75} />
                                    ) : (
                                      <FileText className="size-8" strokeWidth={1.75} />
                                    )}
                                  </div>
                                ) : null}
                                <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                                {prog > 0 && item.pageCount > 0 ? (
                                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/30">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${Math.min(100, ((prog + 1) / item.pageCount) * 100)}%`
                                      }}
                                    />
                                  </div>
                                ) : null}
                                {/* 多选未选中项压暗：用遮罩代替 filter:brightness，避免逐张封面建合成层导致首次进入卡顿 */}
                                <div
                                  className={`pointer-events-none absolute inset-0 rounded-lg bg-black/30 transition-opacity duration-300 ease-out ${
                                    selectMode && !bookPicked ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                              </AspectRatio>
                              {isConverted && !job ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="absolute top-1.5 left-1.5 size-6 justify-center rounded-full bg-background/85 p-0 backdrop-blur"
                                    >
                                      <CheckCircle2
                                        className="size-3.5 text-emerald-500"
                                        strokeWidth={1.75}
                                      />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>{text.convert.converted}</TooltipContent>
                                </Tooltip>
                              ) : null}
                              {job ? (
                                <div className="absolute top-1.5 right-1.5 flex max-w-[calc(100%-0.75rem)] justify-end">
                                  <Badge
                                    variant="secondary"
                                    className="pointer-events-none max-w-full gap-1 truncate bg-background/85 backdrop-blur"
                                  >
                                    {job.status === 'converting' ? (
                                      <>
                                        <Loader2
                                          className="size-3 animate-spin"
                                          strokeWidth={1.75}
                                        />
                                        {text.convert.progress(Math.max(0, job.percent))}
                                      </>
                                    ) : job.status === 'queued' ? (
                                      text.activity.queued
                                    ) : job.status === 'interrupted' ? (
                                      <span className="text-amber-500">
                                        {text.activity.interrupted}
                                      </span>
                                    ) : (
                                      <span className="text-destructive">
                                        {text.activity.failed}
                                      </span>
                                    )}
                                  </Badge>
                                </div>
                              ) : null}
                              <Badge
                                variant="secondary"
                                className="pointer-events-none absolute right-1.5 bottom-1.5 bg-background/85 px-1.5 py-0 text-[10px] backdrop-blur"
                              >
                                {volumeFormatLabel(item, text.library.imageFolder)}
                              </Badge>
                            </div>
                            <div
                              className={`min-w-0 rounded-md px-1.5 py-0.5 ${
                                bookPicked ? 'bg-accent text-accent-foreground' : ''
                              }`}
                            >
                              <div className="truncate text-sm font-medium" title={item.title}>
                                {item.title}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {prog > 0 && item.pageCount > 0
                                  ? `${text.reader.resume} · ${text.reader.pageOf(prog + 1, item.pageCount)}`
                                  : (item.author ?? text.library.unknownAuthor)}
                              </div>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onSelect={() => deferOpen(() => enqueueTopBook(item))}>
                            <BookUp className="size-4" strokeWidth={1.75} />
                            {text.convert.action}
                          </ContextMenuItem>
                          <ContextMenuItem
                            onSelect={() => deferOpen(() => void openConvertPreview(item))}
                          >
                            <Eye className="size-4" strokeWidth={1.75} />
                            {text.convertPreview.open}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onSelect={() => deferOpen(() => openBookMeta(item))}>
                            <Pencil className="size-4" strokeWidth={1.75} />
                            {text.seriesMeta.edit}
                          </ContextMenuItem>
                          {managedLibrary &&
                          selectedVols.size > 1 &&
                          selectedVols.has(item.path) ? (
                            <>
                              <ContextMenuItem onSelect={() => deferOpen(() => openBatchRename())}>
                                <Pencil className="size-4" strokeWidth={1.75} />
                                {text.fileops.batchRename(selectedVols.size)}
                              </ContextMenuItem>
                              <ContextMenuItem onSelect={() => deferOpen(() => openBatchAuthor())}>
                                <Pencil className="size-4" strokeWidth={1.75} />
                                {text.fileops.batchAuthor(selectedVols.size)}
                              </ContextMenuItem>
                            </>
                          ) : null}
                          <ContextMenuItem
                            disabled={!managedLibrary && moveTargets().length === 0}
                            onSelect={() =>
                              deferOpen(() =>
                                setMoveReq({ sources: volTargets(item), busy: false })
                              )
                            }
                          >
                            <FolderInput className="size-4" strokeWidth={1.75} />
                            {text.fileops.move}
                          </ContextMenuItem>
                          {renderSortItems(topBookIds, item.id, (delta) =>
                            reorderUngroupedBook(item.id, delta)
                          )}
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() =>
                                setDeleteReq({
                                  paths: volTargets(item),
                                  kind: managedLibrary ? 'books' : undefined,
                                  busy: false
                                })
                              )
                            }
                          >
                            <Trash2 className="size-4" strokeWidth={1.75} />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  }
                  // ② 部文件夹：封面 + 卷数角标，双击进入看卷册
                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <button
                          type="button"
                          data-series-card
                          onClick={() => onSeriesClick(item)}
                          onDoubleClick={() => void openSeries(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void openSeries(item)
                          }}
                          className="group flex cursor-default flex-col gap-2 text-left outline-none"
                        >
                          <AspectRatio
                            ratio={5 / 7}
                            className={`relative overflow-hidden rounded-lg bg-muted transition-all ${
                              picked
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                : ''
                            }`}
                          >
                            <CoverImage src={item.coverUrl} alt={item.title} />
                            <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                          </AspectRatio>
                          <div
                            className={`min-w-0 rounded-md px-1.5 py-0.5 ${
                              picked ? 'bg-accent text-accent-foreground' : ''
                            }`}
                          >
                            <div className="truncate text-sm font-medium" title={item.title}>
                              {item.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {text.library.volumeUnit(item.volumeCount)}
                            </div>
                          </div>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onSelect={() => deferOpen(() => openSeriesMeta(item))}>
                          <Pencil className="size-4" strokeWidth={1.75} />
                          {text.fileops.rename}
                        </ContextMenuItem>
                        {renderSortItems(topSeriesIds, item.id, (delta) =>
                          reorderTopSeries(item.id, delta)
                        )}
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          variant="destructive"
                          onSelect={() =>
                            deferOpen(() =>
                              setDeleteReq({
                                paths: [managedLibrary ? item.id : item.path],
                                kind: managedLibrary ? 'series' : undefined,
                                busy: false
                              })
                            )
                          }
                        >
                          <Trash2 className="size-4" strokeWidth={1.75} />
                          {text.fileops.delete}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}







function AppSidebar({
  activeView,
  locale,
  onSelect,
  themeMode,
  setThemeMode,
  languageMode,
  setLanguageMode
}: {
  activeView: ViewId
  locale: LanguageMode
  onSelect: (view: ViewId) => void
  themeMode: ThemeMode
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>
  languageMode: LanguageMode
  setLanguageMode: React.Dispatch<React.SetStateAction<LanguageMode>>
}): React.JSX.Element {
  const text = uiText[locale]
  const { state, isMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <div
        className={`h-12 w-full shrink-0 flex items-center ${
          state === 'expanded' ? 'px-4' : 'justify-center px-0'
        }`}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {state === 'expanded' ? <TrafficLights /> : null}
        <SidebarTrigger
          className={`size-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            state === 'expanded' ? 'ml-auto -mr-2' : ''
          }`}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        />
      </div>
      <SidebarContent
        className={`transition-[margin] duration-200 ease-out ${
          state === 'expanded' ? '-mt-4' : '-mt-2'
        }`}
      >
        {sidebarGroups
          .filter((group) => import.meta.env.DEV || group.titleKey !== 'groupDevMode')
          .map((group, groupIdx) => (
            <React.Fragment key={group.titleKey}>
              {groupIdx > 0 ? <SidebarSeparator /> : null}
              <SidebarGroup>
                <SidebarGroupLabel>{text.sidebar[group.titleKey]}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item, itemIdx) => {
                      const uniqueKey = `${group.titleKey}-${item.id}-${itemIdx}`
                      return (
                        <SidebarMenuItem key={uniqueKey}>
                          <SidebarMenuButton
                            isActive={item.id === activeView}
                            onClick={() => onSelect(item.id)}
                            tooltip={text.nav[item.id]}
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span>{text.nav[item.id]}</span>
                          </SidebarMenuButton>
                          {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </React.Fragment>
          ))}
      </SidebarContent>

      <Separator className={`bg-sidebar-border ${isMobile ? '' : '-mx-2 !w-auto'}`} />
      <SidebarFooter className="p-2 pt-2">
        <div className="flex items-center justify-between w-full gap-2">
          <SidebarMenu className="flex-1 min-w-0">
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={text.sidebar.settings}>
                <Settings className="size-4 shrink-0" strokeWidth={1.75} />
                <span>{text.sidebar.settings}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {state === 'expanded' && (
            <TooltipProvider>
              <div className="flex items-center gap-1 shrink-0">
                <ButtonGroup>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label={
                          themeMode === 'dark'
                            ? text.header.switchToLight
                            : text.header.switchToDark
                        }
                        onClick={() =>
                          setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))
                        }
                        size="icon-sm"
                        variant="outline"
                        className="shadow-none"
                      >
                        {themeMode === 'dark' ? <Sun /> : <Moon />}
                        <span className="sr-only">{text.header.themeTitle}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      {text.header.themeTitle}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label={text.header.switchLanguage}
                        className="text-xs shadow-none"
                        onClick={() =>
                          setLanguageMode((current) => (current === 'zh' ? 'en' : 'zh'))
                        }
                        size="icon-sm"
                        variant="outline"
                      >
                        {languageMode === 'zh' ? '中' : 'EN'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      {text.header.languageTitle}
                    </TooltipContent>
                  </Tooltip>
                </ButtonGroup>
              </div>
            </TooltipProvider>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default App
