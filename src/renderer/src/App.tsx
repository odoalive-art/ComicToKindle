import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Component,
  FileText,
  FolderOpen,
  Library,
  Loader2,
  Moon,
  BookText,
  Send,
  Settings,
  Sun,
  SwatchBook,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  List,
  LayoutGrid,
  Folder
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
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
import { uiText, type LanguageMode } from './i18n'

// 开发期组件/规范演示页：仅 dev 构建载入，生产包里整段不存在（含 recharts 等重依赖）
const DevShowcase = import.meta.env.DEV ? React.lazy(() => import('./dev/Showcase')) : null

type ViewId =
  | 'library'
  | 'convert-settings'
  | 'web-push'
  | 'devices-emails'
  | 'extensions'
  | 'design-components'
  | 'foundation-standards'
  | 'app-components'
  | 'archive'

type ThemeMode = 'light' | 'dark'

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
      { id: 'convert-settings', icon: Settings },
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
  // 转换活动队列上提到 App 层，切换视图时不中断
  const convertActivity = useConvertActivity(languageMode)

  // ---- 文件导航共享状态（边栏树 ↔ 内容网格）----
  const [libRoot, setLibRoot] = useState<string | null>(null)
  const [fileDir, setFileDir] = useState<string | null>(null)
  const [navExpanded, setNavExpanded] = useState<Set<string>>(new Set())
  const [navKids, setNavKids] = useState<Map<string, DirNode[]>>(new Map())
  const [navVersion, setNavVersion] = useState(0)
  const [navDropTarget, setNavDropTarget] = useState<string | null>(null)
  const navDragPaths = React.useRef<string[]>([])

  const ensureKids = React.useCallback(async (dir: string): Promise<void> => {
    const list = await window.api.library.listSubdirs(dir)
    setNavKids((prev) => new Map(prev).set(dir, list))
  }, [])

  // 切库 → 重置文件视图与树，预载根目录子文件夹
  useEffect(() => {
    setFileDir(null)
    setNavKids(new Map())
    setNavExpanded(libRoot ? new Set([libRoot]) : new Set())
    if (libRoot) void ensureKids(libRoot)
  }, [libRoot, ensureKids])

  // 文件操作后：重载所有已展开节点的子文件夹（树同步增删/改名）
  useEffect(() => {
    if (navVersion === 0) return
    navExpanded.forEach((p) => void ensureKids(p))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navVersion, ensureKids])

  const fileNav: FileNavValue = {
    root: libRoot,
    setRoot: setLibRoot,
    fileDir,
    openFolder: (dir) => {
      setActiveView('library')
      setFileDir(dir)
      // 展开 root→dir 整条链，方便左树定位
      if (libRoot && dir.startsWith(libRoot)) {
        const chain = new Set<string>([libRoot])
        let acc = libRoot
        for (const seg of dir.slice(libRoot.length).split('/').filter(Boolean)) {
          acc = `${acc}/${seg}`
          chain.add(acc)
        }
        setNavExpanded((prev) => new Set([...prev, ...chain]))
        chain.forEach((p) => {
          if (!navKids.has(p)) void ensureKids(p)
        })
      }
    },
    exitToShelf: () => setFileDir(null),
    expanded: navExpanded,
    toggleNode: (path) =>
      setNavExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else {
          next.add(path)
          if (!navKids.has(path)) void ensureKids(path)
        }
        return next
      }),
    kids: navKids,
    version: navVersion,
    bump: () => setNavVersion((v) => v + 1),
    getDragPaths: () => navDragPaths.current,
    setDragPaths: (paths) => {
      navDragPaths.current = paths
    },
    dropTarget: navDropTarget,
    setDropTarget: setNavDropTarget
  }

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

  return (
    <FileNavContext.Provider value={fileNav}>
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
                  <WebPushView
                    locale={languageMode}
                    onGotoArchive={() => setActiveView('archive')}
                  />
                ) : activeView === 'devices-emails' ? (
                  <DeliverySettingsView locale={languageMode} />
                ) : activeView === 'convert-settings' ? (
                  <ConvertSettingsView locale={languageMode} />
                ) : activeView === 'extensions' ? (
                  <PageEmpty
                    icon={Puzzle}
                    label={languageMode === 'zh' ? '暂无可用扩展' : 'No extensions available yet'}
                  />
                ) : (
                  <div className="flex-1 bg-background" />
                )}
              </>
            )}
          </SidebarInset>
        </div>
        <Toaster theme={themeMode} />
      </SidebarProvider>
    </FileNavContext.Provider>
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

// 来自 preload 的 window.api.library 返回类型（单一事实来源：src/preload/index.d.ts）
// 库根顶层项 = 「书(卷册)」或「部文件夹」；书本质上是一卷 LibraryVolume + 作者
type LibraryEntry = Awaited<ReturnType<Window['api']['library']['scan']>>[number]
type LibrarySeries = Extract<LibraryEntry, { type: 'folder' }>
type LibraryBook = Extract<LibraryEntry, { type: 'book' }>
// 某「部」下钻后列出的条目同样是 LibraryEntry（书/卷 或 可继续下钻的子部）。
// 「卷(可读单元)」即其中的 book 变体——读图/转换/解锁等只处理它。
type LibraryDirEntry = Awaited<ReturnType<Window['api']['library']['listVolumes']>>[number]
type LibraryVolume = Extract<LibraryDirEntry, { type: 'book' }>
type Artifact = Awaited<ReturnType<Window['api']['artifacts']['list']>>[number]
// 文件视图（忠实磁盘）：树节点 + 某目录的完整直接内容
type DirNode = Awaited<ReturnType<Window['api']['library']['listSubdirs']>>[number]
type RawListing = Awaited<ReturnType<Window['api']['library']['listDirRaw']>>
type RawFolder = RawListing['folders'][number]
type RawVolume = RawListing['files'][number]

// ============ 文件导航共享状态（边栏文件夹树 ↔ 内容网格）============
// 树常驻边栏、网格在内容区，二者跨组件共享同一份状态，故提升到 App 并经 Context 下发。
interface FileNavValue {
  root: string | null
  setRoot: (r: string | null) => void
  /** null = 书架视图；非空 = 文件视图，展示该目录的网格 */
  fileDir: string | null
  /** 进入文件视图看某目录（并切到库视图） */
  openFolder: (dir: string) => void
  /** 回到书架视图 */
  exitToShelf: () => void
  expanded: Set<string>
  toggleNode: (path: string) => void
  kids: Map<string, DirNode[]>
  /** 文件操作后自增，触发树与网格重载 */
  version: number
  bump: () => void
  /** 拖拽中的源路径（跨边栏树/网格共享，存模块级 ref，避免 setState 抖动） */
  getDragPaths: () => string[]
  setDragPaths: (paths: string[]) => void
  dropTarget: string | null
  setDropTarget: (p: string | null) => void
}
const FileNavContext = React.createContext<FileNavValue | null>(null)
const useFileNav = (): FileNavValue => {
  const v = React.useContext(FileNavContext)
  if (!v) throw new Error('FileNavContext missing')
  return v
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
        {quiet ? null : <ImageOff className="size-7" />}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false} // 否则原生图片拖拽会劫持卡片的 HTML5 拖拽手势（文件视图拖动移动）
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  )
}

/** 「部」书摞卡的可点击视觉（错位卡片 + 卷数角标 + 标题/作者），下钻容器复用。 */
function FolderStackCard({
  item,
  picked,
  volumeUnitLabel,
  unknownAuthor,
  onClick,
  onDoubleClick
}: {
  item: LibrarySeries
  picked: boolean
  volumeUnitLabel: string
  unknownAuthor: string
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
      className="group flex cursor-default flex-col gap-2 text-left"
    >
      <div className="group relative">
        {/* 背后两层错位卡片，暗示「文件夹里有多卷」 */}
        <div className="pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-muted-foreground/20" />
        <div className="pointer-events-none absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-lg bg-muted-foreground/30" />
        <AspectRatio
          ratio={3 / 4}
          className={`relative overflow-hidden rounded-lg bg-muted transition-all ${
            picked ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
        >
          <CoverImage src={item.coverUrl} alt={item.title} />
          <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
        </AspectRatio>
        <Badge
          variant="secondary"
          className="absolute top-1.5 right-1.5 max-w-[calc(100%-0.75rem)] gap-1 truncate bg-background/85 backdrop-blur"
        >
          <Library className="size-3" />
          {volumeUnitLabel}
        </Badge>
      </div>
      <div
        className={`min-w-0 rounded-md px-1.5 py-0.5 ${
          picked ? 'bg-accent text-accent-foreground' : ''
        }`}
      >
        <div className="truncate text-sm font-medium" title={item.title}>
          {item.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{item.author ?? unknownAuthor}</div>
      </div>
    </button>
  )
}

// ============ 文件视图（Eagle 式：左常驻文件夹树 + 右混合网格，拖到树节点=移动）============
// 与书架视图相反：1:1 忠实磁盘，不隐藏空目录、不折叠单话、不强分部/卷，专供整理。

const basenameOf = (p: string): string => p.split('/').filter(Boolean).pop() ?? p

/** 文件整理错误码 → 本地化文案 */
function fileopErrText(e: unknown, text: (typeof uiText)[LanguageMode]): string {
  const m = `${e}`
  if (m.includes('NAME_EXISTS')) return text.fileops.errNameExists
  if (m.includes('INVALID_NAME')) return text.fileops.errInvalidName
  if (m.includes('MOVE_INTO_SELF')) return text.fileops.errMoveIntoSelf
  return text.fileops.errGeneric
}

/** 边栏常驻文件夹树：消费 FileNav 上下文，点文件夹即进文件视图；拖卡片到节点=移动 */
function FileTree({ locale }: { locale: LanguageMode }): React.JSX.Element | null {
  const fileNav = useFileNav()
  const text = uiText[locale]
  if (!fileNav.root) return null
  const rootNode: DirNode = {
    id: fileNav.root,
    path: fileNav.root,
    name: text.fileView.root,
    hasSubfolders: true
  }
  const dropMove = async (dest: string): Promise<void> => {
    const paths = fileNav.getDragPaths()
    if (!paths.length) return
    try {
      await window.api.library.move(paths, dest)
      toast.success(text.fileops.moved(paths.length))
      fileNav.bump()
    } catch (e) {
      toast.error(fileopErrText(e, text))
    }
  }
  return (
    <div className="px-1 pb-1">
      <FileTreeRow
        node={rootNode}
        depth={0}
        currentDir={fileNav.fileDir ?? ''}
        expanded={fileNav.expanded}
        kids={fileNav.kids}
        dropTarget={fileNav.dropTarget}
        onToggle={fileNav.toggleNode}
        onSelect={fileNav.openFolder}
        onDropMove={(dest) => void dropMove(dest)}
        setDropTarget={fileNav.setDropTarget}
      />
    </div>
  )
}

const FILE_GRID =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

/** 左侧文件夹树的一行（含懒加载子节点、拖放目标高亮） */
function FileTreeRow({
  node,
  depth,
  currentDir,
  expanded,
  kids,
  dropTarget,
  onToggle,
  onSelect,
  onDropMove,
  setDropTarget
}: {
  node: DirNode
  depth: number
  currentDir: string
  expanded: Set<string>
  kids: Map<string, DirNode[]>
  dropTarget: string | null
  onToggle: (path: string) => void
  onSelect: (path: string) => void
  onDropMove: (dest: string) => void
  setDropTarget: (path: string | null) => void
}): React.JSX.Element {
  const isOpen = expanded.has(node.path)
  const selected = currentDir === node.path
  const children = kids.get(node.path)
  return (
    <div>
      <div
        onClick={() => onSelect(node.path)}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          setDropTarget(node.path)
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => {
          e.preventDefault()
          setDropTarget(null)
          onDropMove(node.path)
        }}
        style={{ paddingLeft: depth * 14 + 8 }}
        className={`flex h-7 cursor-default items-center gap-1 rounded-md pr-2 text-sm ${
          dropTarget === node.path
            ? 'bg-primary/20 ring-1 ring-primary'
            : selected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (node.hasSubfolders) onToggle(node.path)
          }}
          className={`flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground ${
            node.hasSubfolders ? 'hover:bg-foreground/10' : 'invisible'
          }`}
        >
          {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>
        {isOpen ? (
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate" title={node.name}>
          {node.name}
        </span>
      </div>
      {isOpen && children
        ? children.map((c) => (
            <FileTreeRow
              key={c.path}
              node={c}
              depth={depth + 1}
              currentDir={currentDir}
              expanded={expanded}
              kids={kids}
              dropTarget={dropTarget}
              onToggle={onToggle}
              onSelect={onSelect}
              onDropMove={onDropMove}
              setDropTarget={setDropTarget}
            />
          ))
        : null}
    </div>
  )
}

function FileView({
  locale,
  onOpenVolume
}: {
  locale: LanguageMode
  onOpenVolume: (vol: RawVolume) => void
}): React.JSX.Element {
  const text = uiText[locale]
  const fileNav = useFileNav()
  const root = fileNav.root ?? ''
  const currentDir = fileNav.fileDir ?? root
  const [listing, setListing] = useState<RawListing | null>(null)
  const [loading, setLoading] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [renameReq, setRenameReq] = useState<{ path: string; name: string; busy: boolean } | null>(
    null
  )
  const [newFolderReq, setNewFolderReq] = useState<{ name: string; busy: boolean } | null>(null)
  const [deleteReq, setDeleteReq] = useState<{ paths: string[]; busy: boolean } | null>(null)

  const fileopErr = (e: unknown): string => fileopErrText(e, text)

  // 当前目录或文件操作版本变化 → 拉网格内容（树由 App 层据 version 同步）
  useEffect(() => {
    let active = true
    setPicked(new Set())
    setLoading(true)
    window.api.library
      .listDirRaw(currentDir)
      .then((l) => active && setListing(l))
      .catch(
        () =>
          active &&
          setListing({
            folders: [],
            files: [],
            self: { readable: false, pageCount: 0, coverUrl: null }
          })
      )
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentDir, fileNav.version])

  const navigate = (dir: string): void => fileNav.openFolder(dir)

  const doMove = async (paths: string[], dest: string): Promise<void> => {
    if (paths.length === 0) return
    try {
      await window.api.library.move(paths, dest)
      toast.success(text.fileops.moved(paths.length))
      setPicked(new Set())
      fileNav.bump()
    } catch (e) {
      toast.error(fileopErr(e))
    }
  }

  const submitRename = async (): Promise<void> => {
    if (!renameReq || renameReq.busy || !renameReq.name.trim()) return
    setRenameReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.rename(renameReq.path, renameReq.name)
      setRenameReq(null)
      toast.success(text.fileops.renamed)
      fileNav.bump()
    } catch (e) {
      toast.error(fileopErr(e))
      setRenameReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitNewFolder = async (): Promise<void> => {
    if (!newFolderReq || newFolderReq.busy || !newFolderReq.name.trim()) return
    setNewFolderReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.createFolder(currentDir, newFolderReq.name)
      setNewFolderReq(null)
      toast.success(text.fileops.created)
      fileNav.bump()
    } catch (e) {
      toast.error(fileopErr(e))
      setNewFolderReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitDelete = async (): Promise<void> => {
    if (!deleteReq || deleteReq.busy) return
    setDeleteReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.trash(deleteReq.paths)
      toast.success(text.fileops.deleted(deleteReq.paths.length))
      setDeleteReq(null)
      setPicked(new Set())
      fileNav.bump()
    } catch (e) {
      toast.error(fileopErr(e))
      setDeleteReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  // 点击卡片：普通点=单选，⌘/Ctrl 点=切换多选
  const onCardClick = (path: string, e: React.MouseEvent): void => {
    if (e.metaKey || e.ctrlKey) {
      setPicked((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
    } else {
      setPicked(new Set([path]))
    }
  }

  // 右键命中：在选区内则对整组，否则只对它
  const targetsOf = (path: string): string[] =>
    picked.has(path) && picked.size > 1 ? [...picked] : [path]

  const onCardDragStart = (path: string): void => {
    fileNav.setDragPaths(picked.has(path) && picked.size > 1 ? [...picked] : [path])
  }

  // 面包屑：root → currentDir
  const crumbs: Array<{ name: string; path: string }> = (() => {
    const out: Array<{ name: string; path: string }> = [{ name: text.fileView.root, path: root }]
    if (currentDir.startsWith(root)) {
      let acc = root
      for (const seg of currentDir.slice(root.length).split('/').filter(Boolean)) {
        acc = `${acc}/${seg}`
        out.push({ name: seg, path: acc })
      }
    }
    return out
  })()

  const isEmpty =
    !loading &&
    listing !== null &&
    listing.folders.length === 0 &&
    listing.files.length === 0 &&
    !listing.self.readable

  return (
    <div className="flex min-h-0 flex-1">
      {/* 面包屑 + 网格（文件夹树常驻左侧边栏，见 AppSidebar） */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-1 border-b px-3 text-sm">
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1
                return (
                  <React.Fragment key={c.path}>
                    {i > 0 ? <BreadcrumbSeparator className="shrink-0" /> : null}
                    <BreadcrumbItem className="min-w-0">
                      {last ? (
                        <BreadcrumbPage className="truncate font-medium">{c.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <button
                            type="button"
                            className="truncate"
                            onClick={() => navigate(c.path)}
                          >
                            {c.name}
                          </button>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => setNewFolderReq({ name: '', busy: false })}
              >
                <FolderPlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{text.fileops.newFolder}</TooltipContent>
          </Tooltip>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : isEmpty ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {text.fileView.emptyFolder}
            </p>
          ) : (
            <div className={FILE_GRID}>
              {/* 本文件夹自身可读（直接铺着图片）→ 阅读入口 */}
              {listing?.self.readable ? (
                <button
                  type="button"
                  onDoubleClick={() =>
                    onOpenVolume({
                      id: currentDir,
                      path: currentDir,
                      name: basenameOf(currentDir),
                      title: basenameOf(currentDir),
                      kind: 'folder',
                      sourceType: 'folder',
                      pageCount: listing.self.pageCount,
                      coverUrl: listing.self.coverUrl
                    } as RawVolume)
                  }
                  className="group flex cursor-default flex-col gap-1.5 text-left"
                >
                  <AspectRatio
                    ratio={3 / 4}
                    className="relative overflow-hidden rounded-md bg-muted ring-1 ring-primary/40"
                  >
                    <CoverImage src={listing.self.coverUrl} alt="" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-primary/85 py-1 text-xs font-medium text-primary-foreground">
                      <BookOpen className="size-3.5" />
                      {text.fileView.readFolder}
                    </div>
                  </AspectRatio>
                  <div className="truncate text-xs text-muted-foreground">
                    {text.library.pageUnit(listing.self.pageCount)}
                  </div>
                </button>
              ) : null}

              {/* 子文件夹卡（可下钻 / 可作为移动目标） */}
              {listing?.folders.map((f) => (
                <FileFolderCard
                  key={f.path}
                  folder={f}
                  picked={picked.has(f.path)}
                  dropTarget={dropTarget === f.path}
                  itemLabel={text.fileView.itemUnit(f.childCount)}
                  renameLabel={text.fileops.rename}
                  deleteLabel={text.fileops.delete}
                  onClick={(e) => onCardClick(f.path, e)}
                  onOpen={() => navigate(f.path)}
                  onDragStart={() => onCardDragStart(f.path)}
                  onDropMove={() => doMove(fileNav.getDragPaths(), f.path)}
                  setDropTarget={(v) => setDropTarget(v ? f.path : null)}
                  onRename={() => setRenameReq({ path: f.path, name: f.name, busy: false })}
                  onDelete={() => setDeleteReq({ paths: targetsOf(f.path), busy: false })}
                />
              ))}

              {/* 可读单文件（cbz/pdf/epub） */}
              {listing?.files.map((v) => (
                <FileVolumeCard
                  key={v.path}
                  vol={v}
                  picked={picked.has(v.path)}
                  typeLabel={fileVolumeTypeLabel(v, text)}
                  renameLabel={text.fileops.rename}
                  deleteLabel={text.fileops.delete}
                  onClick={(e) => onCardClick(v.path, e)}
                  onOpen={() => onOpenVolume(v)}
                  onDragStart={() => onCardDragStart(v.path)}
                  onRename={() => setRenameReq({ path: v.path, name: v.name, busy: false })}
                  onDelete={() => setDeleteReq({ paths: targetsOf(v.path), busy: false })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 重命名 */}
      <Dialog
        open={renameReq !== null}
        onOpenChange={(o) => (!o && !renameReq?.busy ? setRenameReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.renameTitle}</DialogTitle>
            <DialogDescription>{text.fileops.renameDesc}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={renameReq?.name ?? ''}
            placeholder={text.fileops.namePlaceholder}
            onChange={(e) => setRenameReq((s) => (s ? { ...s, name: e.target.value } : s))}
            onKeyDown={(e) => e.key === 'Enter' && void submitRename()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameReq(null)}>
              {text.fileops.cancel}
            </Button>
            <Button onClick={() => void submitRename()} disabled={renameReq?.busy}>
              {text.fileops.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建文件夹 */}
      <Dialog
        open={newFolderReq !== null}
        onOpenChange={(o) => (!o && !newFolderReq?.busy ? setNewFolderReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.newFolderTitle}</DialogTitle>
            <DialogDescription>{text.fileops.newFolderDesc}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newFolderReq?.name ?? ''}
            placeholder={text.fileops.newFolderPlaceholder}
            onChange={(e) => setNewFolderReq((s) => (s ? { ...s, name: e.target.value } : s))}
            onKeyDown={(e) => e.key === 'Enter' && void submitNewFolder()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewFolderReq(null)}>
              {text.fileops.cancel}
            </Button>
            <Button onClick={() => void submitNewFolder()} disabled={newFolderReq?.busy}>
              {text.fileops.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog
        open={deleteReq !== null}
        onOpenChange={(o) => (!o && !deleteReq?.busy ? setDeleteReq(null) : undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.fileops.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {text.fileops.deleteDesc(deleteReq?.paths.length ?? 0)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReq?.busy}>{text.fileops.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void submitDelete()
              }}
            >
              {text.fileops.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** 文件视图：子文件夹卡（可下钻、可拖入移动） */
function FileFolderCard({
  folder,
  picked,
  dropTarget,
  itemLabel,
  renameLabel,
  deleteLabel,
  onClick,
  onOpen,
  onDragStart,
  onDropMove,
  setDropTarget,
  onRename,
  onDelete
}: {
  folder: RawFolder
  picked: boolean
  dropTarget: boolean
  itemLabel: string
  renameLabel: string
  deleteLabel: string
  onClick: (e: React.MouseEvent) => void
  onOpen: () => void
  onDragStart: () => void
  onDropMove: () => void
  setDropTarget: (v: boolean) => void
  onRename: () => void
  onDelete: () => void
}): React.JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', 'move')
            onDragStart()
          }}
          onClick={onClick}
          onDoubleClick={onOpen}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setDropTarget(true)
          }}
          onDragLeave={() => setDropTarget(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDropTarget(false)
            onDropMove()
          }}
          className="group flex cursor-default flex-col gap-1.5 text-left"
        >
          <AspectRatio
            ratio={3 / 4}
            className={`relative overflow-hidden rounded-md bg-muted transition-all ${
              dropTarget
                ? 'ring-2 ring-primary'
                : picked
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
            }`}
          >
            {folder.coverUrl ? (
              <CoverImage src={folder.coverUrl} alt={folder.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Folder className="size-10" />
              </div>
            )}
            <Badge
              variant="secondary"
              className="absolute top-1 right-1 gap-1 bg-background/85 px-1.5 text-[10px] backdrop-blur"
            >
              <Folder className="size-3" />
              {itemLabel}
            </Badge>
          </AspectRatio>
          <div
            className={`truncate rounded px-1 text-xs font-medium ${picked ? 'bg-accent' : ''}`}
            title={folder.name}
          >
            {folder.name}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setTimeout(onRename, 0)}>
          <Pencil className="size-4" />
          {renameLabel}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => setTimeout(onDelete, 0)}>
          <Trash2 className="size-4" />
          {deleteLabel}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** 文件视图：可读单文件卡（cbz/pdf/epub） */
function FileVolumeCard({
  vol,
  picked,
  typeLabel,
  renameLabel,
  deleteLabel,
  onClick,
  onOpen,
  onDragStart,
  onRename,
  onDelete
}: {
  vol: RawVolume
  picked: boolean
  typeLabel: string
  renameLabel: string
  deleteLabel: string
  onClick: (e: React.MouseEvent) => void
  onOpen: () => void
  onDragStart: () => void
  onRename: () => void
  onDelete: () => void
}): React.JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', 'move')
            onDragStart()
          }}
          onClick={onClick}
          onDoubleClick={onOpen}
          className="group flex cursor-default flex-col gap-1.5 text-left"
        >
          <AspectRatio
            ratio={3 / 4}
            className={`relative overflow-hidden rounded-md bg-muted transition-all ${
              picked ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
            }`}
          >
            <CoverImage src={vol.coverUrl} alt={vol.title} quiet />
            {!vol.coverUrl ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
                {vol.locked ? (
                  <Lock className="size-8" />
                ) : vol.sourceType === 'archive' ? (
                  <FileArchive className="size-8" />
                ) : (
                  <FileText className="size-8" />
                )}
              </div>
            ) : null}
          </AspectRatio>
          <div className="min-w-0">
            <div
              className={`truncate rounded px-1 text-xs font-medium ${picked ? 'bg-accent' : ''}`}
              title={vol.title}
            >
              {vol.title}
            </div>
            <div className="truncate px-1 text-[11px] text-muted-foreground">{typeLabel}</div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setTimeout(onRename, 0)}>
          <Pencil className="size-4" />
          {renameLabel}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => setTimeout(onDelete, 0)}>
          <Trash2 className="size-4" />
          {deleteLabel}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function fileVolumeTypeLabel(v: RawVolume, text: (typeof uiText)[LanguageMode]): string {
  if (v.sourceType === 'pdf') return text.library.pdfVolume
  if (v.sourceType === 'epub') return text.library.epubVolume
  if (v.sourceType === 'archive') return text.library.fileVolume
  return text.library.pageUnit(v.pageCount)
}

const LIBRARY_GRID =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
// 列表视图里展开某部后的卷册封面网格：比顶层书架更密一档（嵌在部下，封面更小）
const LIST_VOLUME_GRID =
  'grid grid-cols-3 gap-3 px-2 py-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'

/** EPUB 书名 = 「漫画名 + 卷册」（与 main/artifacts.ts composeBookTitle 保持一致，用于预览） */
function composeBookTitle(seriesTitle: string, volumeTitle: string): string {
  const s = seriesTitle.trim()
  const v = volumeTitle.trim()
  if (!s) return v || 'Untitled'
  if (!v || v === s || v.startsWith(s)) return v || s
  return `${s} ${v}`
}

// ---------- 阅读偏好与进度（持久化于 localStorage） ----------
type ReadingDirection = 'ltr' | 'rtl'
type ReadingMode = 'single' | 'double'

const READING_DIR_KEY = 'comic-to-kindle-reading-direction'
const READING_MODE_KEY = 'comic-to-kindle-reading-mode'
const READING_PROGRESS_KEY = 'comic-to-kindle-reading-progress'

// 漫画库书架视图：icon=图标平铺 / list=Finder 列表（部可就地展开看卷）
type LibraryViewMode = 'icon' | 'list'
const LIBRARY_VIEW_KEY = 'comic-to-kindle-library-view'
function getInitialLibraryView(): LibraryViewMode {
  return window.localStorage.getItem(LIBRARY_VIEW_KEY) === 'list' ? 'list' : 'icon'
}

// 转换选项（非敏感，存 localStorage）。字段与 main 的 convert.ts DEFAULTS 保持一致。
const CONVERT_OPTIONS_KEY = 'comic-to-kindle-convert-options'
type DeviceProfileOpt = 'pw6' | 'ko3' | 'pw5' | 'pw3' | 'scribe' | 'original'
const PROFILE_ORDER: DeviceProfileOpt[] = ['pw6', 'ko3', 'pw5', 'pw3', 'scribe', 'original']
interface ConvertOptionsState {
  deviceProfile: DeviceProfileOpt
  mangaMode: boolean
  grayscale: boolean
  splitDoublePages: boolean
  imageQuality: number
  maxVolumeSize: number
}
const DEFAULT_CONVERT_OPTIONS: ConvertOptionsState = {
  deviceProfile: 'pw6',
  mangaMode: true,
  grayscale: true,
  splitDoublePages: true,
  imageQuality: 85,
  maxVolumeSize: 45
}
function loadConvertOptions(): ConvertOptionsState {
  try {
    const raw = window.localStorage.getItem(CONVERT_OPTIONS_KEY)
    if (raw) return { ...DEFAULT_CONVERT_OPTIONS, ...JSON.parse(raw) }
  } catch {
    /* 解析失败回退默认 */
  }
  return { ...DEFAULT_CONVERT_OPTIONS }
}

// ---------- 转换活动（队列）：上提到 App 层，跨视图保活 ----------
// 持久化到 userData/queue.json（main 端 queue.ts），重启后恢复；converting 回退为 queued 整卷重跑。
// 'interrupted'：上次会话被强制退出时未完成的任务，重启后不自动跑、等用户确认继续
type ConvertJobStatus = 'queued' | 'converting' | 'interrupted' | 'failed'
interface ConvertJob {
  id: string
  sourceVolumePath: string
  seriesPathName: string // 部文件夹名，IPC 用作 seriesName / 输出目录名
  seriesTitle: string
  volumeTitle: string
  author: string | null
  status: ConvertJobStatus
  percent: number
  error?: string
  // 入队时冻结的转换选项快照：设置页后续变更不影响已排队任务
  options?: ConvertOptionsState
  enqueuedAt?: string
}
interface ConvertEnqueueInput {
  sourceVolumePath: string
  seriesPathName: string
  seriesTitle: string
  volumeTitle: string
  author: string | null
}
interface ConvertActivity {
  jobs: ConvertJob[]
  artifacts: Artifact[]
  activeCount: number
  interruptedCount: number
  convertedPaths: Set<string>
  jobByPath: Map<string, ConvertJob>
  enqueue: (input: ConvertEnqueueInput) => void
  retry: (id: string) => void
  dismiss: (id: string) => void
  cancel: (job: ConvertJob) => void
  clearAll: () => void
  refreshArtifacts: () => Promise<void>
}

function useConvertActivity(locale: LanguageMode): ConvertActivity {
  const text = uiText[locale]
  const [jobs, setJobs] = useState<ConvertJob[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  // 持久化 hydration 完成前不写盘，避免空 state 覆盖磁盘上的旧队列
  const [hydrated, setHydrated] = useState(false)
  const runningRef = useRef(false)
  // 已取消任务的 id：用于在转换 promise 落定时静默处理（不标失败、不弹 toast）
  const cancelledIdsRef = useRef<Set<string>>(new Set())

  const refreshArtifacts = React.useCallback(async () => {
    try {
      setArtifacts(await window.api.artifacts.list())
    } catch {
      /* 清单读取失败时静默 */
    }
  }, [])

  useEffect(() => {
    refreshArtifacts()
  }, [refreshArtifacts])

  // 启动时从 main 拉回上次会话的队列；main 已把未完成任务标为 'interrupted'（不自动跑）。
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const loaded = (await window.api.queue.load()) as ConvertJob[]
        if (active && Array.isArray(loaded)) setJobs(loaded)
      } catch {
        /* 读盘失败 → 视作空队列 */
      } finally {
        if (active) setHydrated(true)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // 结构 signature：只看 id/status/error；percent 改变（高频）不触发写盘。
  const lastSigRef = useRef<string | null>(null)
  useEffect(() => {
    if (!hydrated) return
    const sig = jobs.map((j) => `${j.id}:${j.status}:${j.error ?? ''}`).join('|')
    if (sig === lastSigRef.current) return
    lastSigRef.current = sig
    void window.api.queue.save(jobs)
  }, [jobs, hydrated])

  // 进度订阅：更新对应 converting 任务的百分比
  useEffect(() => {
    return window.api.convert.onProgress(({ sourceVolumePath, percent }) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.sourceVolumePath === sourceVolumePath && j.status === 'converting'
            ? { ...j, percent }
            : j
        )
      )
    })
  }, [])

  // 顺序处理队列：空闲且有排队任务时启动下一个
  useEffect(() => {
    if (runningRef.current) return
    const next = jobs.find((j) => j.status === 'queued')
    if (!next) return
    runningRef.current = true
    setJobs((prev) =>
      prev.map((j) => (j.id === next.id ? { ...j, status: 'converting', percent: 0 } : j))
    )
    window.api.convert
      .volume({
        sourceVolumePath: next.sourceVolumePath,
        seriesName: next.seriesPathName,
        seriesTitle: next.seriesTitle,
        volumeTitle: next.volumeTitle,
        author: next.author,
        // 入队时快照过 options 就用它；持久化恢复的旧 job 无快照时回退到当前设置
        options: next.options ?? loadConvertOptions()
      })
      .then(async () => {
        await refreshArtifacts()
        setJobs((prev) => prev.filter((j) => j.id !== next.id))
        if (!cancelledIdsRef.current.delete(next.id))
          toast.success(text.convert.done(next.volumeTitle))
      })
      .catch((err) => {
        // 用户取消的任务已从列表移除，静默处理
        if (cancelledIdsRef.current.delete(next.id)) return
        setJobs((prev) =>
          prev.map((j) => (j.id === next.id ? { ...j, status: 'failed', error: `${err}` } : j))
        )
        toast.error(`${text.convert.failed(next.volumeTitle)} — ${err}`)
      })
      .finally(() => {
        runningRef.current = false
      })
  }, [jobs, refreshArtifacts, text])

  const enqueue = React.useCallback((input: ConvertEnqueueInput) => {
    setJobs((prev) => {
      if (prev.some((j) => j.sourceVolumePath === input.sourceVolumePath)) return prev
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          status: 'queued',
          percent: 0,
          // 入队时冻结当前转换设置，免得设置页一改就影响已排队任务
          options: loadConvertOptions(),
          enqueuedAt: new Date().toISOString(),
          ...input
        }
      ]
    })
  }, [])

  const retry = React.useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'queued', percent: 0, error: undefined } : j))
    )
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  // 取消某个任务：进行中的请求 main 中止，并从列表移除（静默）
  const cancel = React.useCallback((job: ConvertJob) => {
    cancelledIdsRef.current.add(job.id)
    if (job.status === 'converting') void window.api.convert.cancel(job.sourceVolumePath)
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
  }, [])

  // 清空：取消进行中的那卷 + 清掉全部排队/失败/中断
  const clearAll = React.useCallback(() => {
    setJobs((prev) => {
      prev.forEach((j) => {
        cancelledIdsRef.current.add(j.id)
        if (j.status === 'converting') void window.api.convert.cancel(j.sourceVolumePath)
      })
      return []
    })
  }, [])

  // 中断任务「继续」：标回 queued，调度器随即接手
  const resumeAll = React.useCallback(() => {
    setJobs((prev) =>
      prev.map((j) =>
        j.status === 'interrupted' ? { ...j, status: 'queued', percent: 0, error: undefined } : j
      )
    )
  }, [])

  // 中断任务「不继续」：从队列移除
  const discardInterrupted = React.useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== 'interrupted'))
  }, [])

  // 启动后若有被中断的任务，弹一次 toast 让用户选「继续 / 不继续」（只弹一次）
  const interruptedPromptRef = useRef(false)
  useEffect(() => {
    if (!hydrated || interruptedPromptRef.current) return
    const n = jobs.filter((j) => j.status === 'interrupted').length
    if (n === 0) return
    interruptedPromptRef.current = true
    toast.warning(text.activity.interruptedToast(n), {
      duration: Infinity,
      action: { label: text.activity.interruptedResume, onClick: () => resumeAll() },
      cancel: { label: text.activity.interruptedDiscard, onClick: () => discardInterrupted() }
    })
  }, [hydrated, jobs, text, resumeAll, discardInterrupted])

  const convertedPaths = useMemo(
    () => new Set(artifacts.map((a) => a.sourceVolumePath)),
    [artifacts]
  )
  const jobByPath = useMemo(() => {
    const m = new Map<string, ConvertJob>()
    jobs.forEach((j) => m.set(j.sourceVolumePath, j))
    return m
  }, [jobs])
  const activeCount = useMemo(
    () => jobs.filter((j) => j.status === 'queued' || j.status === 'converting').length,
    [jobs]
  )
  const interruptedCount = useMemo(
    () => jobs.filter((j) => j.status === 'interrupted').length,
    [jobs]
  )

  return {
    jobs,
    artifacts,
    activeCount,
    interruptedCount,
    convertedPaths,
    jobByPath,
    enqueue,
    retry,
    dismiss,
    cancel,
    clearAll,
    refreshArtifacts
  }
}

function getInitialDirection(): ReadingDirection {
  return window.localStorage.getItem(READING_DIR_KEY) === 'rtl' ? 'rtl' : 'ltr'
}
function getInitialMode(): ReadingMode {
  return window.localStorage.getItem(READING_MODE_KEY) === 'double' ? 'double' : 'single'
}
function readProgressMap(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(READING_PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}
function getProgress(volumePath: string): number {
  const value = readProgressMap()[volumePath]
  return typeof value === 'number' ? value : 0
}
function saveProgress(volumePath: string, index: number): void {
  const map = readProgressMap()
  map[volumePath] = index
  try {
    window.localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(map))
  } catch {
    /* 忽略写入失败 */
  }
}

/**
 * PDF 来源阅读器：用 comic:// 把原 PDF 喂给 Chromium 内置查看器（PDFium）直接渲染，
 * 秒开、无需预渲染整本。代价是失去统一阅读器的双页/RTL/续读（PDF 转 Kindle 时才整本渲染）。
 */
function PdfReader({
  volume,
  locale,
  onClose
}: {
  volume: LibraryVolume
  locale: LanguageMode
  onClose: () => void
}): React.JSX.Element {
  const text = uiText[locale]
  const src = `comic://img/?p=${encodeURIComponent(volume.path)}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header
        className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft className="size-4" />
          {text.reader.back}
        </Button>
        <span
          className="min-w-0 truncate text-sm font-semibold text-foreground"
          title={volume.title}
        >
          {volume.title}
        </span>
      </header>
      <iframe
        title={volume.title}
        src={src}
        className="min-h-0 w-full flex-1 border-0 bg-neutral-900"
      />
    </div>
  )
}

function VolumeReader({
  volume,
  locale,
  onClose
}: {
  volume: LibraryVolume
  locale: LanguageMode
  onClose: () => void
}): React.JSX.Element {
  const text = uiText[locale]
  const [pages, setPages] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<ReadingDirection>(getInitialDirection)
  const [mode, setMode] = useState<ReadingMode>(getInitialMode)

  // 加载页面并恢复上次阅读进度
  useEffect(() => {
    let active = true
    setLoading(true)
    window.api.library
      .listPages(volume.path)
      .then((p) => {
        if (!active) return
        setPages(p)
        setIndex(Math.min(getProgress(volume.path), Math.max(0, p.length - 1)))
      })
      .catch((err) => toast.error(`${err}`))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [volume.path])

  const total = pages.length
  const step = mode === 'double' ? 2 : 1
  const goPrev = React.useCallback(() => setIndex((i) => Math.max(0, i - step)), [step])
  const goNext = React.useCallback(
    () => setIndex((i) => Math.min(total - 1, i + step)),
    [total, step]
  )

  // 持久化进度
  useEffect(() => {
    if (!loading && total > 0) saveProgress(volume.path, index)
  }, [index, loading, total, volume.path])

  const toggleDirection = (): void => {
    const next = direction === 'ltr' ? 'rtl' : 'ltr'
    setDirection(next)
    window.localStorage.setItem(READING_DIR_KEY, next)
    toast(
      `${text.reader.toggleDirection}: ${next === 'rtl' ? text.reader.directionRtl : text.reader.directionLtr}`
    )
  }
  const toggleMode = (): void => {
    const next = mode === 'single' ? 'double' : 'single'
    setMode(next)
    window.localStorage.setItem(READING_MODE_KEY, next)
    toast(
      `${text.reader.toggleMode}: ${next === 'double' ? text.reader.modeDouble : text.reader.modeSingle}`
    )
  }

  // 键盘导航
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const rtl = direction === 'rtl'
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        rtl ? goPrev() : goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        rtl ? goNext() : goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [direction, goNext, goPrev, onClose])

  const rtl = direction === 'rtl'
  const isDouble = mode === 'double'
  const atFirst = index === 0
  const atLast = index + step >= total
  const hasSecond = isDouble && index + 1 < total
  const counter = hasSecond
    ? `${index + 1}–${index + 2} / ${total}`
    : text.reader.pageOf(index + 1, total)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header
        className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft className="size-4" />
          {text.reader.back}
        </Button>
        <span
          className="min-w-0 truncate text-sm font-semibold text-foreground"
          title={volume.title}
        >
          {volume.title}
        </span>
        {total > 0 ? (
          <div
            className="ml-auto flex shrink-0 items-center gap-1"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleDirection}
              title={`${text.reader.toggleDirection}: ${rtl ? text.reader.directionRtl : text.reader.directionLtr}`}
            >
              <ArrowLeftRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleMode}
              title={`${text.reader.toggleMode}: ${isDouble ? text.reader.modeDouble : text.reader.modeSingle}`}
            >
              {isDouble ? <BookOpen className="size-4" /> : <BookText className="size-4" />}
            </Button>
            <span className="ml-1 text-sm tabular-nums text-muted-foreground">{counter}</span>
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {text.reader.emptyVolume}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-900">
          {isDouble ? (
            <div className={`flex h-full w-full ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <img
                key={pages[index]}
                src={pages[index]}
                alt={`${index + 1}`}
                draggable={false}
                style={{ objectPosition: rtl ? 'left' : 'right' }}
                className="h-full w-1/2 object-contain select-none"
              />
              {hasSecond ? (
                <img
                  key={pages[index + 1]}
                  src={pages[index + 1]}
                  alt={`${index + 2}`}
                  draggable={false}
                  style={{ objectPosition: rtl ? 'right' : 'left' }}
                  className="h-full w-1/2 object-contain select-none"
                />
              ) : null}
            </div>
          ) : (
            <img
              key={pages[index]}
              src={pages[index]}
              alt={`${index + 1}`}
              draggable={false}
              className="max-h-full max-w-full object-contain select-none"
            />
          )}

          {/* 预加载相邻页 */}
          {Array.from({ length: 6 }, (_, k) => index - 2 + k)
            .filter((i) => i >= 0 && i < total && i !== index && !(isDouble && i === index + 1))
            .map((i) => (
              <img key={`pre-${i}`} src={pages[i]} alt="" aria-hidden className="hidden" />
            ))}

          {/* 左半区 */}
          <button
            type="button"
            aria-label={rtl ? text.reader.next : text.reader.prev}
            onClick={rtl ? goNext : goPrev}
            disabled={rtl ? atLast : atFirst}
            className="group absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-3 disabled:pointer-events-none"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ChevronLeft className="size-5" />
            </span>
          </button>
          {/* 右半区 */}
          <button
            type="button"
            aria-label={rtl ? text.reader.prev : text.reader.next}
            onClick={rtl ? goPrev : goNext}
            disabled={rtl ? atFirst : atLast}
            className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-3 disabled:pointer-events-none"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ChevronRight className="size-5" />
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function ConvertActivityPopover({
  activity,
  locale,
  onOpenArchive
}: {
  activity: ConvertActivity
  locale: LanguageMode
  onOpenArchive: () => void
}): React.JSX.Element {
  const text = uiText[locale]
  const t = text.activity
  const ta = text.archiveView
  const [open, setOpen] = useState(false)
  const [delivering, setDelivering] = useState<Set<string>>(new Set())

  const deliver = async (a: Artifact): Promise<void> => {
    setDelivering((p) => new Set(p).add(a.id))
    const toastId = toast.loading(`${ta.deliver} · ${a.volumeTitle}`)
    try {
      const res = await window.api.deliver.send(a.id)
      if (res.success) toast.success(ta.delivered(a.volumeTitle), { id: toastId })
      else
        toast.error(
          `${ta.deliverFailed(a.volumeTitle)} — ${deliveryErrorMsg(text.delivery, res)}`,
          {
            id: toastId
          }
        )
      await activity.refreshArtifacts()
    } catch (err) {
      toast.error(`${ta.deliverFailed(a.volumeTitle)} — ${err}`, { id: toastId })
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
        toast.success(ta.webPushOpened(a.volumeTitle))
      } else {
        const msg = ta.webPushErrors[res.code ?? 'unknown'] ?? ta.webPushErrors.unknown
        toast.error(`${a.volumeTitle} — ${msg}`)
        if (res.code === 'inject-failed') await window.api.webpush.reveal(a.id)
      }
    } catch (err) {
      toast.error(`${a.volumeTitle} — ${err}`)
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
                <Loader2 className="size-4 animate-spin" />
              ) : onlyInterrupted ? (
                <AlertCircle className="size-4 text-amber-500" />
              ) : (
                <BookOpenCheck className="size-4" />
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
                        <span className="min-w-0 flex-1 truncate text-sm" title={j.volumeTitle}>
                          {j.volumeTitle}
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
                              <RotateCcw className="size-3.5" />
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
                      <div className="truncate text-xs text-muted-foreground">{j.seriesTitle}</div>
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
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Send className="size-3.5" />
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
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Globe className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title={ta.reveal}
                          onClick={() => window.api.artifacts.reveal(a.id)}
                        >
                          <FolderOpen className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          title={ta.remove}
                          onClick={() => removeArtifact(a.id)}
                        >
                          <Trash2 className="size-3.5" />
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

function LibraryView({
  locale,
  activity,
  onOpenArchive
}: {
  locale: LanguageMode
  activity: ConvertActivity
  onOpenArchive: () => void
}): React.JSX.Element {
  const text = uiText[locale]
  const { isMobile } = useSidebar()
  // 库根目录提升到 App 层（边栏文件夹树与内容区共享）；此处复用同一份
  const fileNav = useFileNav()
  const root = fileNav.root
  const setRoot = fileNav.setRoot
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
  // 部（series）层单击选中：纯视觉高亮，给「可双击进入」的预期反馈（暂无批量动作，故单选）
  const [selectedSeriesPath, setSelectedSeriesPath] = useState<string | null>(null)
  // 书架视图模式（图标/列表）+ 列表视图里就地展开的部 + 各部卷册缓存
  const [viewMode, setViewMode] = useState<LibraryViewMode>(getInitialLibraryView)
  // 文件视图（Eagle 式忠实磁盘整理器）：由边栏文件夹树驱动，fileNav.fileDir 非空即进入
  const fileMode = fileNav.fileDir !== null
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [volCache, setVolCache] = useState<Map<string, LibraryDirEntry[]>>(new Map())
  // 框选（橡皮筋）：在空白处按下拖动进入多选
  const gridWrapRef = React.useRef<HTMLDivElement>(null)
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

  const volumeTypeLabel = (v: LibraryVolume): string => {
    if (v.sourceType === 'pdf') return text.library.pdfVolume
    if (v.sourceType === 'epub') return text.library.epubVolume
    if (v.sourceType === 'archive') return text.library.fileVolume
    return text.library.pageUnit(v.pageCount)
  }

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

  // 转换前确认书籍信息（单卷册）：预填漫画名/作者/卷册名，可改后再转
  const [convertReq, setConvertReq] = useState<{
    vol: LibraryVolume
    seriesPathName: string
    seriesTitle: string
    author: string
    volumeTitle: string
  } | null>(null)

  // 多选批量转换前确认：共享漫画名 + 作者（改一次对全部生效），列出各卷书名预览
  const [batchConvertReq, setBatchConvertReq] = useState<{
    seriesPathName: string
    seriesTitle: string
    author: string
    vols: LibraryVolume[]
    busy: boolean
  } | null>(null)

  // 编辑某部漫画的名称/作者（持久化覆盖，不改本地文件夹名）
  const [seriesMetaReq, setSeriesMetaReq] = useState<{
    name: string
    title: string
    author: string
    busy: boolean
  } | null>(null)

  // ---- 文件整理（真·本地文件操作）----
  const [renameReq, setRenameReq] = useState<{ path: string; name: string; busy: boolean } | null>(
    null
  )
  const [moveReq, setMoveReq] = useState<{ sources: string[]; busy: boolean } | null>(null)
  const [moveNewFolderName, setMoveNewFolderName] = useState<string | null>(null)
  const [deleteReq, setDeleteReq] = useState<{ paths: string[]; busy: boolean } | null>(null)
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
          : text.archive.extractFailed
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
  const enqueueVolume = (vol: LibraryVolume): void => {
    if (!selected) return
    setConvertReq({
      vol,
      seriesPathName: selected.name,
      seriesTitle: selected.title,
      author: selected.author ?? '',
      volumeTitle: vol.title
    })
  }

  const submitConvert = async (): Promise<void> => {
    if (!convertReq) return
    const { vol, seriesPathName, seriesTitle, author, volumeTitle } = convertReq
    setConvertReq(null)
    exitSelect() // 从选择态走单本转换后退出多选
    if (!(await ensureArchiveReady(vol))) return
    enqueue({
      sourceVolumePath: vol.path,
      seriesPathName,
      seriesTitle: seriesTitle.trim(),
      volumeTitle: volumeTitle.trim(),
      author: author.trim() || null
    })
  }

  const openSeriesMeta = (item: LibrarySeries | null): void => {
    if (!item) return
    setSeriesMetaReq({
      name: item.name,
      title: item.title,
      author: item.author ?? '',
      busy: false
    })
  }

  const submitSeriesMeta = async (): Promise<void> => {
    if (!seriesMetaReq || seriesMetaReq.busy) return
    const { name, title, author } = seriesMetaReq
    setSeriesMetaReq({ ...seriesMetaReq, busy: true })
    const updated = await window.api.library.setSeriesMeta(name, {
      title,
      author: author.trim() || null
    })
    setSeries((prev) =>
      prev.map((s) => (s.type === 'folder' && s.name === name ? { ...s, ...updated } : s))
    )
    setSelected((prev) => (prev && prev.name === name ? { ...prev, ...updated } : prev))
    setSeriesMetaReq(null)
    toast.success(text.seriesMeta.saved)
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
    // 列表视图：重拉已展开各部的卷册缓存（文件操作可能改了卷的增删/命名）
    if (expanded.size > 0) {
      const fresh = new Map<string, LibraryDirEntry[]>()
      await Promise.all(
        [...expanded].map(async (p) => {
          fresh.set(p, await window.api.library.listVolumes(p))
        })
      )
      setVolCache(fresh)
    }
  }

  // 右键命中的卷：若它在多选集合内则对整组操作，否则只对它
  const volTargets = (vol: LibraryVolume): string[] =>
    selectedVols.has(vol.path) && selectedVols.size > 1 ? [...selectedVols] : [vol.path]

  const submitRename = async (): Promise<void> => {
    if (!renameReq || renameReq.busy || !renameReq.name.trim()) return
    setRenameReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.rename(renameReq.path, renameReq.name)
      setRenameReq(null)
      toast.success(text.fileops.renamed)
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setRenameReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const submitMove = async (destDir: string): Promise<void> => {
    if (!moveReq || moveReq.busy) return
    setMoveReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.move(moveReq.sources, destDir)
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
      const newPath = await window.api.library.createFolder(root, moveNewFolderName)
      await window.api.library.move(moveReq.sources, newPath)
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
      await window.api.library.trash(deleteReq.paths)
      const n = deleteReq.paths.length
      setDeleteReq(null)
      exitSelect()
      toast.success(text.fileops.deleted(n))
      await refreshAfterFileop()
    } catch (e) {
      toast.error(fileopErr(e))
      setDeleteReq((s) => (s ? { ...s, busy: false } : s))
    }
  }

  const openNewFolder = (): void => {
    const parent = selected ? selected.path : root
    if (!parent) return
    setNewFolderReq({ parent, name: '', busy: false })
  }

  const submitNewFolder = async (): Promise<void> => {
    if (!newFolderReq || newFolderReq.busy || !newFolderReq.name.trim()) return
    setNewFolderReq((s) => (s ? { ...s, busy: true } : s))
    try {
      await window.api.library.createFolder(newFolderReq.parent, newFolderReq.name)
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

  // 文件管理器式单击选中：普通点 = 只选这一卷；Cmd/Ctrl 点或已在多选模式 = 累加/切换。
  // （已在多选模式里点击累加，保留「选择」按钮 + 连点多选的既有流程）
  const onVolumeClick = (vol: LibraryVolume, e: React.MouseEvent): void => {
    const additive = e.metaKey || e.ctrlKey || selectMode
    const next = new Set(additive ? selectedVols : [])
    if (additive && next.has(vol.path)) next.delete(vol.path)
    else next.add(vol.path)
    setSelectedVols(next)
    setSelectMode(next.size > 0)
  }

  // 双击打开阅读器：先清掉选择态再进入（解压/解锁仍在 openVolume 内处理）
  const onVolumeOpen = async (vol: LibraryVolume): Promise<void> => {
    exitSelect()
    await openVolume(vol)
  }

  // 当前层里可选/可转换的「卷」(book)——子部不参与多选与批量转换
  const bookVolumes = volumes.filter((v): v is LibraryVolume => v.type === 'book')
  const allSelected = bookVolumes.length > 0 && selectedVols.size === bookVolumes.length
  const toggleAll = (): void => {
    setSelectedVols(allSelected ? new Set() : new Set(bookVolumes.map((v) => v.path)))
  }

  // 转换所选：单本走单本确认弹窗（含封面预览），多本走批量确认弹窗
  const convertSelected = (): void => {
    if (!selected || selectedVols.size === 0) return
    const picked = bookVolumes.filter((v) => selectedVols.has(v.path))
    if (picked.length === 1) {
      enqueueVolume(picked[0])
      return
    }
    setBatchConvertReq({
      seriesPathName: selected.name,
      seriesTitle: selected.title,
      author: selected.author ?? '',
      vols: picked,
      busy: false
    })
  }

  const submitBatchConvert = async (): Promise<void> => {
    if (!batchConvertReq || batchConvertReq.busy) return
    const { seriesPathName, seriesTitle, author, vols } = batchConvertReq
    setBatchConvertReq((s) => (s ? { ...s, busy: true } : s))
    // 压缩包逐个确保解出（密码池命中或弹框；共享密码池下多为一次输入）
    const ready: LibraryVolume[] = []
    for (const vol of vols) {
      if (await ensureArchiveReady(vol)) ready.push(vol)
    }
    ready.forEach((vol) =>
      enqueue({
        sourceVolumePath: vol.path,
        seriesPathName,
        seriesTitle: seriesTitle.trim(),
        volumeTitle: vol.title,
        author: author.trim() || null
      })
    )
    if (ready.length > 0) toast.success(text.activity.enqueued(ready.length))
    setBatchConvertReq(null)
    exitSelect()
  }

  // 框选拖动态（用 ref 避免每次移动都触发重渲染）
  const marqueeDrag = React.useRef<{
    startX: number
    startY: number
    wrapRect: DOMRect
    base: Set<string>
    moved: boolean
  } | null>(null)

  // 空白处按下：记录起点并抓取指针。两级都生效——卷册层拖动进入框选，部层仅用于
  // 「空白单击取消选中」。命中卡片则不处理（交给卡片自身 onClick）。
  const onWrapPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return
    const el = e.target as HTMLElement
    const wrap = gridWrapRef.current
    if (!wrap) return
    // Radix 右键菜单/弹框的内容被 portal 到 document.body，但 React 事件仍沿组件树冒泡到此处。
    // 这类事件的 DOM target 不在 wrap 内——若不剔除，点击菜单项会被误判为「空白处按下」从而
    // 起框选 + setPointerCapture，吞掉点击，导致菜单项点了没反应、菜单也不收起。
    if (!wrap.contains(el)) return
    if (el.closest('[data-vol-card],[data-series-card]')) return
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
    // 框选橡皮筋仅在卷册层有意义（部层无批量动作）
    if (selected === null || volumes.length === 0) return
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
    if (hit.size > 0) setSelectMode(true)
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
    window.api?.library?.getSavedRoot().then((saved) => {
      if (!active || !saved) return
      setRoot(saved)
      loadSeries(saved)
    })
    return () => {
      active = false
    }
  }, [loadSeries])

  const chooseFolder = async (): Promise<void> => {
    if (!window.api?.library) {
      toast.error('漫画库接口未就绪，请重启 npm run dev')
      return
    }
    try {
      const picked = await window.api.library.pickFolder()
      if (!picked) return
      setRoot(picked)
      setSelected(null)
      setTrail([])
      setVolumes([])
      await loadSeries(picked)
    } catch (err) {
      toast.error(`${err}`)
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

  // 散卷/单行本书（顶层 book）转换：复用单卷册确认弹窗，系列名/标题就用书本身
  const enqueueTopBook = (book: LibraryBook): void => {
    setConvertReq({
      vol: book,
      seriesPathName: book.name,
      seriesTitle: book.title,
      author: book.author ?? '',
      volumeTitle: book.title
    })
  }

  // 列表视图：某一卷的转换（不在「部」内时也能转，系列名/标题取其所属部）
  const enqueueVolumeIn = (vol: LibraryVolume, folder: LibrarySeries): void => {
    setConvertReq({
      vol,
      seriesPathName: folder.name,
      seriesTitle: folder.title,
      author: folder.author ?? '',
      volumeTitle: vol.title
    })
  }

  const switchView = (mode: LibraryViewMode): void => {
    setViewMode(mode)
    window.localStorage.setItem(LIBRARY_VIEW_KEY, mode)
  }

  const loadFolderVolumes = React.useCallback(async (folderPath: string): Promise<void> => {
    const vols = await window.api.library.listVolumes(folderPath)
    setVolCache((prev) => new Map(prev).set(folderPath, vols))
  }, [])

  // 列表视图里就地展开/收起一个部；首次展开按需拉取其卷册
  const toggleExpand = (folderPath: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
        if (!volCache.has(folderPath)) void loadFolderVolumes(folderPath)
      }
      return next
    })
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

  // 卷册视图下 Cmd/Ctrl+A：只全选内容区的漫画卷，而非浏览器默认的整页全选
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'a') return
      const t = e.target as HTMLElement | null
      // 输入类控件内保留原生全选
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (selected === null || volumes.length === 0) return
      e.preventDefault()
      setSelectMode(true)
      setSelectedVols(new Set(volumes.filter((v) => v.type === 'book').map((v) => v.path)))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, volumes])

  // 阅读某一卷：接管整个内容区
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

  const showVolumes = selected !== null

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
                {unlockReq?.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                    <Loader2 className="size-3.5 animate-spin" />
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
      {/* 单卷册转换前：确认书籍信息 */}
      <Dialog
        open={convertReq !== null}
        onOpenChange={(o) => (!o ? setConvertReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{text.convertMeta.title}</DialogTitle>
          </DialogHeader>
          {convertReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitConvert()
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{text.convertMeta.series}</label>
                <Input
                  autoFocus
                  value={convertReq.seriesTitle}
                  onChange={(e) =>
                    setConvertReq((s) => (s ? { ...s, seriesTitle: e.target.value } : s))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{text.convertMeta.volume}</label>
                <Input
                  value={convertReq.volumeTitle}
                  placeholder={text.convertMeta.volumePlaceholder}
                  onChange={(e) =>
                    setConvertReq((s) => (s ? { ...s, volumeTitle: e.target.value } : s))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{text.convertMeta.author}</label>
                <Input
                  value={convertReq.author}
                  placeholder={text.convertMeta.authorPlaceholder}
                  onChange={(e) => setConvertReq((s) => (s ? { ...s, author: e.target.value } : s))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  {text.convertMeta.previewLabel}
                </label>
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted text-muted-foreground">
                    {convertReq.vol.coverUrl ? (
                      <CoverImage src={convertReq.vol.coverUrl} alt="" quiet />
                    ) : (
                      <BookText className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div
                      className="line-clamp-2 text-sm font-medium"
                      title={composeBookTitle(convertReq.seriesTitle, convertReq.volumeTitle)}
                    >
                      {composeBookTitle(convertReq.seriesTitle, convertReq.volumeTitle)}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {convertReq.author.trim() || text.convertMeta.authorPlaceholder}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setConvertReq(null)}>
                  {text.convertMeta.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={!convertReq.volumeTitle.trim() && !convertReq.seriesTitle.trim()}
                >
                  {text.convertMeta.start}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 多选批量转换前：确认共享漫画名/作者 + 各卷书名预览 */}
      <Dialog
        open={batchConvertReq !== null}
        onOpenChange={(o) => (!o && !batchConvertReq?.busy ? setBatchConvertReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {text.convertMeta.batchTitle}
              {batchConvertReq ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {text.convertMeta.batchCount(batchConvertReq.vols.length)}
                </span>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {batchConvertReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitBatchConvert()
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{text.convertMeta.series}</label>
                <Input
                  autoFocus
                  value={batchConvertReq.seriesTitle}
                  disabled={batchConvertReq.busy}
                  onChange={(e) =>
                    setBatchConvertReq((s) => (s ? { ...s, seriesTitle: e.target.value } : s))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{text.convertMeta.author}</label>
                <Input
                  value={batchConvertReq.author}
                  placeholder={text.convertMeta.authorPlaceholder}
                  disabled={batchConvertReq.busy}
                  onChange={(e) =>
                    setBatchConvertReq((s) => (s ? { ...s, author: e.target.value } : s))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  {text.convertMeta.batchVolumes}
                </label>
                <ScrollArea className="max-h-52 rounded-lg border bg-card">
                  <div className="divide-y">
                    {batchConvertReq.vols.map((vol) => (
                      <div
                        key={vol.path}
                        className="truncate px-3 py-1.5 text-sm"
                        title={composeBookTitle(batchConvertReq.seriesTitle, vol.title)}
                      >
                        {composeBookTitle(batchConvertReq.seriesTitle, vol.title)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={batchConvertReq.busy}
                  onClick={() => setBatchConvertReq(null)}
                >
                  {text.convertMeta.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={batchConvertReq.busy || batchConvertReq.vols.length === 0}
                >
                  {text.convertMeta.start}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {/* 编辑某部漫画的名称/作者（持久化，不改本地文件夹） */}
      <Dialog
        open={seriesMetaReq !== null}
        onOpenChange={(o) => (!o && !seriesMetaReq?.busy ? setSeriesMetaReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.seriesMeta.edit}</DialogTitle>
            <DialogDescription>{text.seriesMeta.desc}</DialogDescription>
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
                <label className="text-xs text-muted-foreground">{text.seriesMeta.name}</label>
                <Input
                  autoFocus
                  value={seriesMetaReq.title}
                  onChange={(e) =>
                    setSeriesMetaReq((s) => (s ? { ...s, title: e.target.value } : s))
                  }
                />
              </div>
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
      {/* 文件整理：重命名（真·改本地文件名） */}
      <Dialog
        open={renameReq !== null}
        onOpenChange={(o) => (!o && !renameReq?.busy ? setRenameReq(null) : undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{text.fileops.renameTitle}</DialogTitle>
            <DialogDescription>{text.fileops.renameDesc}</DialogDescription>
          </DialogHeader>
          {renameReq ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submitRename()
              }}
              className="space-y-3"
            >
              <Input
                autoFocus
                value={renameReq.name}
                placeholder={text.fileops.namePlaceholder}
                onChange={(e) => setRenameReq((s) => (s ? { ...s, name: e.target.value } : s))}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRenameReq(null)}
                  disabled={renameReq.busy}
                >
                  {text.fileops.cancel}
                </Button>
                <Button type="submit" disabled={!renameReq.name.trim() || renameReq.busy}>
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
                      <FolderInput className="size-4 shrink-0 text-muted-foreground" />
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
                    <FolderPlus className="size-4 shrink-0" />
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
            <AlertDialogTitle>{text.fileops.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteReq ? text.fileops.deleteDesc(deleteReq.paths.length) : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
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
                  <Button
                    size="sm"
                    disabled={selectedVols.size === 0}
                    onClick={() => convertSelected()}
                  >
                    <BookUp className="size-4" />
                    {text.activity.convertSelected(selectedVols.size)}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={exitSelect}>
                        <X className="size-4" />
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
                          <Pencil className="size-4" />
                          <span className="sr-only">{text.seriesMeta.edit}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{text.seriesMeta.edit}</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {!showVolumes && !fileMode ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => switchView(viewMode === 'icon' ? 'list' : 'icon')}
                        >
                          {viewMode === 'icon' ? (
                            <List className="size-4" />
                          ) : (
                            <LayoutGrid className="size-4" />
                          )}
                          <span className="sr-only">
                            {viewMode === 'icon' ? text.library.viewList : text.library.viewIcon}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {viewMode === 'icon' ? text.library.viewList : text.library.viewIcon}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={openNewFolder}>
                        <FolderPlus className="size-4" />
                        <span className="sr-only">{text.fileops.newFolder}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{text.fileops.newFolder}</TooltipContent>
                  </Tooltip>
                  <ConvertActivityPopover
                    activity={activity}
                    locale={locale}
                    onOpenArchive={onOpenArchive}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={rescan} disabled={loading}>
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="sr-only">{text.library.rescan}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{text.library.rescan}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={chooseFolder}>
                        <FolderOpen className="size-4" />
                        <span className="sr-only">{text.library.changeFolder}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{text.library.changeFolder}</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          ) : null}
        </header>

        {!root ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen />
                </EmptyMedia>
                <EmptyTitle>{text.library.emptyTitle}</EmptyTitle>
                <EmptyDescription>{text.library.emptyDescription}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={chooseFolder}>
                  <FolderOpen className="size-4" />
                  {text.library.chooseFolder}
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : fileMode ? (
          <FileView locale={locale} onOpenVolume={(v) => void onVolumeOpen(v as LibraryVolume)} />
        ) : (
          // 用原生滚动容器而非 Radix ScrollArea：后者 Viewport 内层 display:table 使
          // min-h-full 失效、内容下方空白不在容器内（空白单击取消选择会失灵）。容器自身
          // 即滚动区 + 指针目标，撑满 flex 高度，下方空白也能命中。
          <div
            ref={gridWrapRef}
            onPointerDown={onWrapPointerDown}
            onPointerMove={onWrapPointerMove}
            onPointerUp={onWrapPointerUp}
            className="relative min-h-0 flex-1 overflow-y-auto p-4 select-none lg:p-6"
          >
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
                    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
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
                    // 子部：渲染为可继续下钻的「书摞」卡（双击进入更深一层）
                    if (vol.type === 'folder') {
                      return (
                        <ContextMenu key={vol.id}>
                          <ContextMenuTrigger asChild>
                            <FolderStackCard
                              item={vol}
                              picked={selectedSeriesPath === vol.path}
                              volumeUnitLabel={text.library.volumeUnit(vol.volumeCount)}
                              unknownAuthor={text.library.unknownAuthor}
                              onClick={() => onSeriesClick(vol)}
                              onDoubleClick={() => void openSeries(vol)}
                            />
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => deferOpen(() => openSeriesMeta(vol))}>
                              <Pencil className="size-4" />
                              {text.seriesMeta.edit}
                            </ContextMenuItem>
                            <ContextMenuItem
                              onSelect={() =>
                                deferOpen(() =>
                                  setRenameReq({ path: vol.path, name: vol.name, busy: false })
                                )
                              }
                            >
                              <FolderInput className="size-4" />
                              {text.fileops.rename}
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              variant="destructive"
                              onSelect={() =>
                                deferOpen(() => setDeleteReq({ paths: [vol.path], busy: false }))
                              }
                            >
                              <Trash2 className="size-4" />
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
                            onClick={(e) => onVolumeClick(vol, e)}
                            onDoubleClick={() => void onVolumeOpen(vol)}
                            className="group flex cursor-default flex-col gap-2 text-left"
                          >
                            <div className="relative">
                              <div className="block w-full text-left">
                                <AspectRatio
                                  ratio={3 / 4}
                                  className={`overflow-hidden rounded-lg bg-muted transition-all ${
                                    picked
                                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                      : selectMode
                                        ? 'brightness-[0.7] dark:brightness-[0.82]'
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
                                        <Lock className="size-8" />
                                      ) : vol.sourceType === 'archive' ? (
                                        <FileArchive className="size-8" />
                                      ) : (
                                        <FileText className="size-8" />
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
                                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>{text.convert.converted}</TooltipContent>
                                </Tooltip>
                              ) : null}
                              {/* 选择模式：右上角复选框 */}
                              {selectMode ? (
                                <div className="pointer-events-none absolute top-1.5 right-1.5">
                                  <Checkbox
                                    checked={picked}
                                    className="size-6 border-2 bg-background/85 backdrop-blur data-[state=checked]:bg-primary"
                                  />
                                </div>
                              ) : job ? (
                                /* 队列状态角标（转换入口已并入选中 + 顶栏「转换所选」，封面不再放单独转换按钮） */
                                <div className="absolute top-1.5 right-1.5 flex max-w-[calc(100%-0.75rem)] justify-end">
                                  <Badge
                                    variant="secondary"
                                    className="pointer-events-none max-w-full gap-1 truncate bg-background/85 backdrop-blur"
                                  >
                                    {job.status === 'converting' ? (
                                      <>
                                        <Loader2 className="size-3 animate-spin" />
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
                                  return volumeTypeLabel(vol)
                                })()}
                              </div>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onSelect={() =>
                              deferOpen(() =>
                                setRenameReq({ path: vol.path, name: vol.name, busy: false })
                              )
                            }
                          >
                            <Pencil className="size-4" />
                            {text.fileops.rename}
                          </ContextMenuItem>
                          <ContextMenuItem
                            disabled={moveTargets().length === 0}
                            onSelect={() =>
                              deferOpen(() => setMoveReq({ sources: volTargets(vol), busy: false }))
                            }
                          >
                            <FolderInput className="size-4" />
                            {text.fileops.move}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() => setDeleteReq({ paths: volTargets(vol), busy: false }))
                            }
                          >
                            <Trash2 className="size-4" />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  })}
                </div>
              )
            ) : series.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {text.library.noSeries}
              </p>
            ) : viewMode === 'list' ? (
              // 列表视图：部=纯文字行（三角在右），展开后部名吸顶、其下卷册以封面网格呈现；
              // 书=不可展开的叶子文字行。
              <div className="flex flex-col">
                {series.map((item) => {
                  const picked = selectedSeriesPath === item.path
                  if (item.type === 'book') {
                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-series-card
                            onClick={() => onSeriesClick(item)}
                            onDoubleClick={() => void onVolumeOpen(item)}
                            className={`group flex cursor-default items-center gap-2.5 rounded-md px-3 py-2 ${
                              picked ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                            }`}
                          >
                            <span className="shrink-0 text-muted-foreground">
                              {item.kind === 'file' ? (
                                item.sourceType === 'archive' ? (
                                  <FileArchive className="size-4" />
                                ) : (
                                  <FileText className="size-4" />
                                )
                              ) : (
                                <BookText className="size-4" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm" title={item.title}>
                              {item.title}
                            </span>
                            <span className="shrink-0 truncate text-xs text-muted-foreground">
                              {item.author ?? text.library.unknownAuthor}
                            </span>
                            {convertedPaths.has(item.path) ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            ) : null}
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onSelect={() => deferOpen(() => enqueueTopBook(item))}>
                            <BookUp className="size-4" />
                            {text.convert.action}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onSelect={() =>
                              deferOpen(() =>
                                setRenameReq({ path: item.path, name: item.name, busy: false })
                              )
                            }
                          >
                            <Pencil className="size-4" />
                            {text.fileops.rename}
                          </ContextMenuItem>
                          <ContextMenuItem
                            disabled={moveTargets().length === 0}
                            onSelect={() =>
                              deferOpen(() => setMoveReq({ sources: [item.path], busy: false }))
                            }
                          >
                            <FolderInput className="size-4" />
                            {text.fileops.move}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() => setDeleteReq({ paths: [item.path], busy: false }))
                            }
                          >
                            <Trash2 className="size-4" />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  }
                  const isOpen = expanded.has(item.path)
                  const vols = volCache.get(item.path)
                  return (
                    <div key={item.id} className="flex flex-col">
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            data-series-card
                            onClick={() => onSeriesClick(item)}
                            onDoubleClick={() => void openSeries(item)}
                            className={`group sticky top-0 z-10 flex cursor-default items-center gap-2.5 border-b bg-background/95 px-3 py-2 backdrop-blur ${
                              picked ? 'text-accent-foreground' : ''
                            }`}
                          >
                            <Library className="size-4 shrink-0 text-muted-foreground" />
                            <span
                              className="min-w-0 flex-1 truncate text-sm font-medium"
                              title={item.title}
                            >
                              {item.title}
                            </span>
                            <span className="shrink-0 truncate text-xs text-muted-foreground">
                              {item.author ?? text.library.unknownAuthor}
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {text.library.volumeUnit(item.volumeCount)}
                            </Badge>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(item.path)
                              }}
                              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-foreground/10"
                            >
                              {isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onSelect={() => deferOpen(() => openSeriesMeta(item))}>
                            <Pencil className="size-4" />
                            {text.seriesMeta.edit}
                          </ContextMenuItem>
                          <ContextMenuItem
                            onSelect={() =>
                              deferOpen(() =>
                                setRenameReq({ path: item.path, name: item.name, busy: false })
                              )
                            }
                          >
                            <FolderInput className="size-4" />
                            {text.fileops.rename}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() => setDeleteReq({ paths: [item.path], busy: false }))
                            }
                          >
                            <Trash2 className="size-4" />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      {isOpen ? (
                        !vols ? (
                          <div className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                          </div>
                        ) : vols.length === 0 ? (
                          <p className="px-3 py-4 text-xs text-muted-foreground">
                            {text.library.noVolumes}
                          </p>
                        ) : (
                          <div className={LIST_VOLUME_GRID}>
                            {vols.map((v) => {
                              // 子部：列表内仍以书摞卡呈现，双击进入下钻（切到该部的卷网格）
                              if (v.type === 'folder') {
                                return (
                                  <FolderStackCard
                                    key={v.id}
                                    item={v}
                                    picked={selectedSeriesPath === v.path}
                                    volumeUnitLabel={text.library.volumeUnit(v.volumeCount)}
                                    unknownAuthor={text.library.unknownAuthor}
                                    onClick={() => onSeriesClick(v)}
                                    onDoubleClick={() => void openSeries(v)}
                                  />
                                )
                              }
                              const vConverted = convertedPaths.has(v.path)
                              const vjob = jobByPath.get(v.path)
                              const vprog = getProgress(v.path)
                              return (
                                <ContextMenu key={v.id}>
                                  <ContextMenuTrigger asChild>
                                    <div
                                      onDoubleClick={() => void onVolumeOpen(v)}
                                      className="group flex cursor-default flex-col gap-1.5 text-left"
                                    >
                                      <div className="relative">
                                        <AspectRatio
                                          ratio={3 / 4}
                                          className="overflow-hidden rounded-md bg-muted"
                                        >
                                          <CoverImage
                                            src={v.coverUrl}
                                            alt={v.title}
                                            quiet={v.kind === 'file'}
                                          />
                                          {!v.coverUrl && v.kind === 'file' ? (
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
                                              {v.locked ? (
                                                <Lock className="size-7" />
                                              ) : v.sourceType === 'archive' ? (
                                                <FileArchive className="size-7" />
                                              ) : (
                                                <FileText className="size-7" />
                                              )}
                                            </div>
                                          ) : null}
                                          <div className="pointer-events-none absolute inset-0 rounded-md border border-foreground/10" />
                                          {vprog > 0 && v.pageCount > 0 ? (
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/30">
                                              <div
                                                className="h-full bg-primary"
                                                style={{
                                                  width: `${Math.min(100, ((vprog + 1) / v.pageCount) * 100)}%`
                                                }}
                                              />
                                            </div>
                                          ) : null}
                                        </AspectRatio>
                                        {vConverted && !vjob ? (
                                          <Badge
                                            variant="secondary"
                                            className="absolute top-1 left-1 size-5 justify-center rounded-full bg-background/85 p-0 backdrop-blur"
                                          >
                                            <CheckCircle2 className="size-3 text-emerald-500" />
                                          </Badge>
                                        ) : null}
                                        {vjob ? (
                                          <div className="absolute top-1 right-1 flex max-w-[calc(100%-0.5rem)] justify-end">
                                            <Badge
                                              variant="secondary"
                                              className="pointer-events-none max-w-full gap-1 truncate bg-background/85 px-1.5 text-[10px] backdrop-blur"
                                            >
                                              {vjob.status === 'converting' ? (
                                                <>
                                                  <Loader2 className="size-3 animate-spin" />
                                                  {text.convert.progress(Math.max(0, vjob.percent))}
                                                </>
                                              ) : vjob.status === 'queued' ? (
                                                text.activity.queued
                                              ) : vjob.status === 'interrupted' ? (
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
                                      </div>
                                      <div className="min-w-0">
                                        <div
                                          className="truncate text-xs font-medium"
                                          title={v.title}
                                        >
                                          {v.title}
                                        </div>
                                        <div className="truncate text-[11px] text-muted-foreground">
                                          {vprog > 0 && v.pageCount > 0
                                            ? `${text.reader.resume} · ${text.reader.pageOf(vprog + 1, v.pageCount)}`
                                            : volumeTypeLabel(v)}
                                        </div>
                                      </div>
                                    </div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem
                                      onSelect={() => deferOpen(() => enqueueVolumeIn(v, item))}
                                    >
                                      <BookUp className="size-4" />
                                      {text.convert.action}
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      onSelect={() =>
                                        deferOpen(() =>
                                          setRenameReq({ path: v.path, name: v.name, busy: false })
                                        )
                                      }
                                    >
                                      <Pencil className="size-4" />
                                      {text.fileops.rename}
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      disabled={moveTargets().length === 0}
                                      onSelect={() =>
                                        deferOpen(() =>
                                          setMoveReq({ sources: [v.path], busy: false })
                                        )
                                      }
                                    >
                                      <FolderInput className="size-4" />
                                      {text.fileops.move}
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      variant="destructive"
                                      onSelect={() =>
                                        deferOpen(() =>
                                          setDeleteReq({ paths: [v.path], busy: false })
                                        )
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                      {text.fileops.delete}
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              )
                            })}
                          </div>
                        )
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={LIBRARY_GRID}>
                {series.map((item) => {
                  const picked = selectedSeriesPath === item.path
                  // ① 书(卷册)：平铺一张封面，双击直接进阅读器、可转换/整理
                  if (item.type === 'book') {
                    const isConverted = convertedPaths.has(item.path)
                    const job = jobByPath.get(item.path)
                    const prog = getProgress(item.path)
                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-series-card
                            onClick={() => onSeriesClick(item)}
                            onDoubleClick={() => void onVolumeOpen(item)}
                            className="group flex cursor-default flex-col gap-2 text-left"
                          >
                            <div className="relative">
                              <AspectRatio
                                ratio={3 / 4}
                                className={`overflow-hidden rounded-lg bg-muted transition-all ${
                                  picked
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
                                      <Lock className="size-8" />
                                    ) : item.sourceType === 'archive' ? (
                                      <FileArchive className="size-8" />
                                    ) : (
                                      <FileText className="size-8" />
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
                              </AspectRatio>
                              {isConverted && !job ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="absolute top-1.5 left-1.5 size-6 justify-center rounded-full bg-background/85 p-0 backdrop-blur"
                                    >
                                      <CheckCircle2 className="size-3.5 text-emerald-500" />
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
                                        <Loader2 className="size-3 animate-spin" />
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
                            </div>
                            <div
                              className={`min-w-0 rounded-md px-1.5 py-0.5 ${
                                picked ? 'bg-accent text-accent-foreground' : ''
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
                            <BookUp className="size-4" />
                            {text.convert.action}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onSelect={() =>
                              deferOpen(() =>
                                setRenameReq({ path: item.path, name: item.name, busy: false })
                              )
                            }
                          >
                            <Pencil className="size-4" />
                            {text.fileops.rename}
                          </ContextMenuItem>
                          <ContextMenuItem
                            disabled={moveTargets().length === 0}
                            onSelect={() =>
                              deferOpen(() => setMoveReq({ sources: [item.path], busy: false }))
                            }
                          >
                            <FolderInput className="size-4" />
                            {text.fileops.move}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onSelect={() =>
                              deferOpen(() => setDeleteReq({ paths: [item.path], busy: false }))
                            }
                          >
                            <Trash2 className="size-4" />
                            {text.fileops.delete}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  }
                  // ② 部文件夹：错位「书摞」+ 卷数角标，双击进入看卷册
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
                          className="group flex cursor-default flex-col gap-2 text-left"
                        >
                          <div className="group relative">
                            {/* 背后两层错位卡片，暗示「文件夹里有多卷」 */}
                            <div className="pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-muted-foreground/20" />
                            <div className="pointer-events-none absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-lg bg-muted-foreground/30" />
                            <AspectRatio
                              ratio={3 / 4}
                              className={`relative overflow-hidden rounded-lg bg-muted transition-all ${
                                picked
                                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                  : ''
                              }`}
                            >
                              <CoverImage src={item.coverUrl} alt={item.title} />
                              <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                            </AspectRatio>
                            <Badge
                              variant="secondary"
                              className="absolute top-1.5 right-1.5 max-w-[calc(100%-0.75rem)] gap-1 truncate bg-background/85 backdrop-blur"
                            >
                              <Library className="size-3" />
                              {text.library.volumeUnit(item.volumeCount)}
                            </Badge>
                          </div>
                          <div
                            className={`min-w-0 rounded-md px-1.5 py-0.5 ${
                              picked ? 'bg-accent text-accent-foreground' : ''
                            }`}
                          >
                            <div className="truncate text-sm font-medium" title={item.title}>
                              {item.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {item.author ?? text.library.unknownAuthor}
                            </div>
                          </div>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onSelect={() => deferOpen(() => openSeriesMeta(item))}>
                          <Pencil className="size-4" />
                          {text.seriesMeta.edit}
                        </ContextMenuItem>
                        <ContextMenuItem
                          onSelect={() =>
                            deferOpen(() =>
                              setRenameReq({ path: item.path, name: item.name, busy: false })
                            )
                          }
                        >
                          <FolderInput className="size-4" />
                          {text.fileops.rename}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          variant="destructive"
                          onSelect={() =>
                            deferOpen(() => setDeleteReq({ paths: [item.path], busy: false }))
                          }
                        >
                          <Trash2 className="size-4" />
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

function ConvertSettingsView({ locale }: { locale: LanguageMode }): React.JSX.Element {
  const text = uiText[locale]
  const t = text.convertSettings
  const [opts, setOpts] = useState<ConvertOptionsState>(loadConvertOptions)

  const set = <K extends keyof ConvertOptionsState>(key: K, value: ConvertOptionsState[K]): void =>
    setOpts((prev) => ({ ...prev, [key]: value }))

  const save = (): void => {
    window.localStorage.setItem(CONVERT_OPTIONS_KEY, JSON.stringify(opts))
    toast.success(t.saved)
  }
  const reset = (): void => setOpts({ ...DEFAULT_CONVERT_OPTIONS })

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
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-xl p-4 lg:p-6">
        <p className="mb-5 text-sm text-muted-foreground">{t.description}</p>
        <div className="space-y-4">
          {/* 设备档位 */}
          <div className="space-y-1.5">
            <Label>{t.deviceProfile}</Label>
            <Select
              value={opts.deviceProfile}
              onValueChange={(v) => set('deviceProfile', v as DeviceProfileOpt)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t.profiles[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t.deviceProfileNote}</p>
          </div>

          {/* 开关组 */}
          <SwitchRow
            label={t.mangaMode}
            note={t.mangaModeNote}
            checked={opts.mangaMode}
            onChange={(v) => set('mangaMode', v)}
          />
          <SwitchRow
            label={t.grayscale}
            note={t.grayscaleNote}
            checked={opts.grayscale}
            onChange={(v) => set('grayscale', v)}
          />
          <SwitchRow
            label={t.splitDoublePages}
            note={t.splitDoublePagesNote}
            checked={opts.splitDoublePages}
            onChange={(v) => set('splitDoublePages', v)}
          />

          {/* 图片质量 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.imageQuality}</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">{t.imageQualityNote}</p>
          </div>

          {/* 单卷上限 */}
          <div className="space-y-1.5">
            <Label htmlFor="max-vol">{t.maxVolumeSize}</Label>
            <Input
              id="max-vol"
              inputMode="numeric"
              value={String(opts.maxVolumeSize)}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^0-9]/g, ''))
                set('maxVolumeSize', n > 0 ? n : 1)
              }}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">{t.maxVolumeSizeNote}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button onClick={save}>{t.save}</Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="size-4" />
              {t.reset}
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// 产物显示标题：「部标题 · 卷」。旧产物无 seriesTitle 时回退 seriesName
function artifactLabel(a: {
  seriesTitle?: string
  seriesName?: string
  volumeTitle: string
}): string {
  const series = a.seriesTitle || a.seriesName
  return series ? `${series} · ${a.volumeTitle}` : a.volumeTitle
}

// 把 main 返回的投递错误码翻译成当前语言文案；unknown 时附带服务器原始细节
function deliveryErrorMsg(
  d: { errors: Record<string, string> },
  res: { code?: string; detail?: string }
): string {
  const errors = d.errors
  const known = res.code ? errors[res.code] : undefined
  if (known) return res.code === 'unknown' && res.detail ? `${known}：${res.detail}` : known
  return res.detail ? `${errors.unknown}：${res.detail}` : errors.unknown
}

function DeliverySettingsView({ locale }: { locale: LanguageMode }): React.JSX.Element {
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

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-xl p-4 lg:p-6">
        <p className="mb-5 text-sm text-muted-foreground">{t.description}</p>
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
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {t.save}
            </Button>
            <Button variant="outline" onClick={test} disabled={testing}>
              {testing ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {testing ? t.testing : t.test}
            </Button>
          </div>
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
        </div>
      </div>
    </ScrollArea>
  )
}

function PageEmpty({
  icon: Icon,
  label
}: {
  icon: React.ElementType
  label: string
}): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
      <Icon className="size-10 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

function ArchiveView({ locale }: { locale: LanguageMode }): React.JSX.Element {
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
  const exportCopy = async (id: string): Promise<void> => {
    const ok = await window.api.artifacts.export(id)
    if (ok) toast.success(t.exported)
  }
  const remove = async (id: string): Promise<void> => {
    await window.api.artifacts.remove(id)
    toast.success(t.removed)
    await load()
  }
  const [delivering, setDelivering] = useState<Set<string>>(new Set())
  const deliver = async (a: Artifact): Promise<void> => {
    setDelivering((prev) => new Set(prev).add(a.id))
    const toastId = toast.loading(`${t.deliver} · ${a.volumeTitle}`)
    try {
      const res = await window.api.deliver.send(a.id)
      if (res.success) {
        toast.success(t.delivered(a.volumeTitle), { id: toastId })
      } else {
        toast.error(`${t.deliverFailed(a.volumeTitle)} — ${deliveryErrorMsg(text.delivery, res)}`, {
          id: toastId
        })
      }
      await load()
    } catch (err) {
      toast.error(`${t.deliverFailed(a.volumeTitle)} — ${err}`, { id: toastId })
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
        toast.success(t.webPushOpened(a.volumeTitle))
      } else {
        const msg = t.webPushErrors[res.code ?? 'unknown'] ?? t.webPushErrors.unknown
        toast.error(`${a.volumeTitle} — ${msg}`)
        // 自动填充失败时在 Finder 中定位文件，方便手动拖入
        if (res.code === 'inject-failed') await window.api.webpush.reveal(a.id)
      }
    } catch (err) {
      toast.error(`${a.volumeTitle} — ${err}`)
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
      <CheckCircle2 className="size-3 text-emerald-500" />
    ) : status === 'failed' ? (
      <AlertCircle className="size-3 text-destructive" />
    ) : (
      <Clock3 className="size-3 text-muted-foreground" />
    )

  if (loading) return <div className="flex-1" />

  if (artifacts.length === 0) {
    return <PageEmpty icon={Archive} label={t.empty} />
  }

  return (
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
                  <FileText className="size-5 text-muted-foreground" />
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
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{a.author}</div>
                  ) : null}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{t.volumeFiles(a.outputs.length)}</span>
                    <span>{t.pages(a.pageCount)}</span>
                    <span>{formatBytes(totalBytes)}</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => deliver(a)}
                    disabled={delivering.has(a.id)}
                  >
                    {delivering.has(a.id) ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    <span className="hidden lg:inline">
                      {delivering.has(a.id) ? t.delivering : t.deliver}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => webPush(a)}
                    disabled={pushing.has(a.id)}
                    title={t.webPush}
                  >
                    {pushing.has(a.id) ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Globe className="size-4" />
                    )}
                    <span className="hidden lg:inline">{t.webPush}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => reveal(a.id)}>
                    <FolderOpen className="size-4" />
                    <span className="hidden lg:inline">{t.reveal}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => exportCopy(a.id)}>
                    <FileDown className="size-4" />
                    <span className="hidden lg:inline">{t.export}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}

function WebPushView({
  locale,
  onGotoArchive
}: {
  locale: LanguageMode
  onGotoArchive: () => void
}): React.JSX.Element {
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
              <Globe className="size-4" />
              {t.openLogin}
            </Button>
            <Button variant="outline" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {t.save}
            </Button>
            <Button variant="ghost" onClick={onGotoArchive}>
              <Archive className="size-4" />
              {t.gotoArchive}
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
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
  const fileNav = useFileNav()

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
                      // 「所有漫画」= 书架视图；点它回到书架（退出文件视图）
                      const active =
                        item.id === activeView &&
                        !(item.id === 'library' && fileNav.fileDir !== null)
                      return (
                        <SidebarMenuItem key={uniqueKey}>
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => {
                              if (item.id === 'library') fileNav.exitToShelf()
                              onSelect(item.id)
                            }}
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
                  {/* 「我的书库」下常驻文件夹树（仅展开态显示） */}
                  {group.titleKey === 'groupMyLibrary' && state === 'expanded' ? (
                    <FileTree locale={locale} />
                  ) : null}
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
                <Settings className="size-4 shrink-0" />
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
