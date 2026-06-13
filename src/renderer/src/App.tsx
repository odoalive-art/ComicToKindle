import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CircleFadingArrowUp,
  Clock3,
  Component,
  Copy,
  ExternalLink,
  FileText,
  Info,
  FolderOpen,
  GitBranch,
  Grid2X2,
  HardDrive,
  Home,
  Inbox,
  Library,
  List,
  Loader2,
  Moon,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Rows3,
  Ruler,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sun,
  SwatchBook,
  Terminal,
  AlertCircle,
  ChevronRight,
  Slash,
  Type
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger
} from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar } from '@/components/ui/calendar'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { designTokens } from '@/data/design-tokens'
import {
  installedShadcnComponentSlugs,
  type LocalizedText,
  mirroredShadcnDocs,
  shadcnComponents,
  shadcnDocsSource,
  type ShadcnComponent,
  type ShadcnDocBlock
} from '@/data/shadcn-docs'

type NavItem = {
  id: ViewId
  title: string
  icon: LucideIcon
  badge?: string
}

type ViewId =
  | 'library'
  | 'app-components'
  | 'design-components'
  | 'foundation-standards'
  | 'inbox'
  | 'queue'
  | 'deliveries'
  | 'archive'

type Comic = {
  title: string
  author: string
  format: string
  pages: number
  status: '已入库' | '待整理' | '待转换'
  updatedAt: string
}

type ThemeMode = 'light' | 'dark'
type LanguageMode = 'zh' | 'en'

const uiText = {
  zh: {
    nav: {
      library: '所有漫画',
      'app-components': '应用组件',
      'design-components': 'Shadcn 组件',
      'foundation-standards': '基础规范',
      inbox: '导入收件箱',
      queue: '转换队列',
      deliveries: '投递记录',
      archive: '归档'
    },
    header: {
      componentDescription: 'shadcn/ui 官方组件索引，搭建界面时快速选型',
      appComponentsDescription: '当前项目中已正式安装并使用的基础 UI 组件',
      officialPage: '官方页面',
      sourceDetails: '来源详情',
      foundationDescription: '颜色、字体、字号、间距与基础界面节奏',
      libraryDescription: '本地收藏、整理状态和转换准备区的工作台框架',
      searchComponents: '搜索组件名或 slug',
      searchComics: '搜索标题、作者或格式',
      filter: '筛选',
      add: '添加',
      officialDocs: '官方文档',
      themeTitle: '深浅模式',
      switchToLight: '切换到浅色模式',
      switchToDark: '切换到深色模式',
      languageTitle: '中英切换',
      switchLanguage: 'Switch to English'
    },
    library: {
      localComics: '本地漫画',
      localComicsDescription: '第一版只展示库视图、整理状态和占位操作。',
      all: '全部',
      recent: '新导入',
      todo: '待整理',
      mobileSearch: '搜索漫画',
      title: '标题',
      format: '格式',
      pages: '页数',
      status: '状态',
      updated: '更新',
      gridView: '网格视图',
      listView: '列表视图'
    },
    components: {
      countSuffix: '个组件',
      mirrored: '已镜像',
      pendingMirror: '待镜像',
      installed: '已安装',
      notInstalled: '未安装',
      noMatches: (query: string) => `没有找到匹配 “${query}” 的组件。`,
      notMirrored: '这个组件还没有导入本地镜像数据。',
      openOfficialDocs: '打开官方文档',
      copiedPreviewName: '已复制示例名称',
      copyPreviewName: (name: string) => `复制 ${name}`,
      copied: '已复制'
    },
    source: {
      localMirror: '本地镜像',
      description: '当前本地文档镜像使用的官方源码信息。',
      repository: '来源仓库',
      currentSource: '当前页面源文件'
    },
    sidebar: {
      tagline: '本地漫画工作台',
      workspace: '漫画库',
      folders: '库目录',
      settings: '设置',
      folderNames: ['全部漫画', '新导入', '待整理', 'Kindle 预备区'],
      statuses: {
        已入库: '已入库',
        待整理: '待整理',
        待转换: '待转换'
      }
    },
    foundation: {
      title: '基础规范',
      description:
        '本页沉淀当前 renderer 的基础设计 token 和界面节奏，开发阶段用于快速选取颜色、字体、字号和间距。',
      colors: '颜色',
      colorsNote: '使用语义 token，不直接散落硬编码色值。',
      font: '字体',
      fontNote: '优先系统可读性，保持工作台界面克制。',
      typeScale: '字号',
      typeScaleNote: '内容面板避免使用超大展示字。',
      spacing: '间距',
      spacingNote: '以 Tailwind spacing scale 组织密度。',
      radius: '圆角',
      radiusNote: '沿用 shadcn radius token。',
      layout: '布局',
      layoutNote: '页面边距、最大宽度和关键分栏。',
      tokenCount: (count: number) => `${count} 个 token`,
      levelCount: (count: number) => `${count} 个层级`,
      ruleCount: (count: number) => `${count} 条规则`
    }
  },
  en: {
    nav: {
      library: 'All Comics',
      'app-components': 'App Components',
      'design-components': 'Shadcn Components',
      'foundation-standards': 'Foundations',
      inbox: 'Inbox',
      queue: 'Queue',
      deliveries: 'Deliveries',
      archive: 'Archive'
    },
    header: {
      componentDescription: 'shadcn/ui component index for faster UI assembly',
      appComponentsDescription: 'Core UI components installed and used in the current project',
      officialPage: 'Official page',
      sourceDetails: 'Source',
      foundationDescription: 'Colors, typography, type scale, spacing, and layout rhythm',
      libraryDescription:
        'Workspace shell for local collections, organization, and conversion prep',
      searchComponents: 'Search components or slug',
      searchComics: 'Search title, author, or format',
      filter: 'Filter',
      add: 'Add',
      officialDocs: 'Official docs',
      themeTitle: 'Theme',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      languageTitle: 'Language',
      switchLanguage: '切换到中文'
    },
    library: {
      localComics: 'Local Comics',
      localComicsDescription:
        'The first version only shows library views, states, and placeholder actions.',
      all: 'All',
      recent: 'Recent',
      todo: 'To Organize',
      mobileSearch: 'Search comics',
      title: 'Title',
      format: 'Format',
      pages: 'Pages',
      status: 'Status',
      updated: 'Updated',
      gridView: 'Grid view',
      listView: 'List view'
    },
    components: {
      countSuffix: 'components',
      mirrored: 'Mirrored',
      pendingMirror: 'Pending',
      installed: 'Installed',
      notInstalled: 'Not installed',
      noMatches: (query: string) => `No components found for "${query}".`,
      notMirrored: 'This component has not been imported into the local mirror yet.',
      openOfficialDocs: 'Open official docs',
      copiedPreviewName: 'Preview name copied',
      copyPreviewName: (name: string) => `Copy ${name}`,
      copied: 'Copied'
    },
    source: {
      localMirror: 'Local Mirror',
      description: 'Official source metadata used by the local documentation mirror.',
      repository: 'Repository',
      currentSource: 'Current source file'
    },
    sidebar: {
      tagline: 'Local comic workspace',
      workspace: 'Library',
      folders: 'Library',
      settings: 'Settings',
      folderNames: ['All Comics', 'New Imports', 'To Organize', 'Kindle Prep'],
      statuses: {
        已入库: 'In Library',
        待整理: 'To Organize',
        待转换: 'To Convert'
      }
    },
    foundation: {
      title: 'Foundations',
      description:
        'This page captures the renderer design tokens and interface rhythm used during development.',
      colors: 'Colors',
      colorsNote: 'Use semantic tokens instead of scattered hard-coded colors.',
      font: 'Font',
      fontNote: 'Prioritize system readability and a restrained workspace feel.',
      typeScale: 'Type Scale',
      typeScaleNote: 'Avoid oversized display type inside content panels.',
      spacing: 'Spacing',
      spacingNote: 'Organize density with the Tailwind spacing scale.',
      radius: 'Radius',
      radiusNote: 'Follow the shadcn radius token.',
      layout: 'Layout',
      layoutNote: 'Page margins, max widths, and key column rules.',
      tokenCount: (count: number) => `${count} tokens`,
      levelCount: (count: number) => `${count} levels`,
      ruleCount: (count: number) => `${count} rules`
    }
  }
} as const

const primaryNav: NavItem[] = [
  { id: 'library', title: '所有漫画', icon: Library, badge: '128' },
  { id: 'app-components', title: '应用组件', icon: Package, badge: '15' },
  { id: 'design-components', title: 'Shadcn 组件', icon: Component, badge: '59' },
  { id: 'foundation-standards', title: '基础规范', icon: SwatchBook },
  { id: 'inbox', title: '导入收件箱', icon: Inbox, badge: '6' },
  { id: 'queue', title: '转换队列', icon: BookOpenCheck, badge: '2' },
  { id: 'deliveries', title: '投递记录', icon: Send },
  { id: 'archive', title: '归档', icon: Archive }
]

const libraryStats = [
  { label: '本地漫画', value: '128', note: '占位统计', icon: BookOpen },
  { label: '待整理', value: '18', note: '需要元数据', icon: FolderOpen },
  { label: '待转换', value: '12', note: '准备中', icon: Clock3 },
  { label: '本地空间', value: '42 GB', note: '示例读数', icon: HardDrive }
]

const comics: Comic[] = [
  {
    title: '深夜书店 01',
    author: '示例作者',
    format: 'CBZ',
    pages: 186,
    status: '已入库',
    updatedAt: '2026-06-11'
  },
  {
    title: '海岸线物语 合集',
    author: '未填写',
    format: '文件夹',
    pages: 412,
    status: '待整理',
    updatedAt: '2026-06-10'
  },
  {
    title: '机器猫短篇精选',
    author: '示例作者',
    format: 'PDF',
    pages: 96,
    status: '待转换',
    updatedAt: '2026-06-08'
  },
  {
    title: '城市猎人 Vol. 02',
    author: '未填写',
    format: 'CBR',
    pages: 204,
    status: '已入库',
    updatedAt: '2026-06-01'
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

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Electron renderer may expose clipboard but still reject without a focused document.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function getPreviewTitle(name: string): string {
  const [componentPrefix, ...nameParts] = name.split('-')
  const parts = nameParts.length > 0 ? nameParts : [componentPrefix]

  return parts
    .filter((part) => part !== 'demo')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getLocalizedText(text: LocalizedText, locale: LanguageMode): string {
  if (typeof text === 'string') {
    return text
  }

  return text[locale]
}

function getPreviewHeader(
  block: Extract<ShadcnDocBlock, { type: 'preview' }>,
  locale: LanguageMode
): {
  title: string
  description?: string
} {
  if (!block.description) {
    return { title: getPreviewTitle(block.name) }
  }

  const description = getLocalizedText(block.description, locale)
  const isDescription =
    description.length > 32 || description.includes('`') || /[.!?。！？]$/.test(description)

  if (!isDescription) {
    return { title: description }
  }

  return {
    title: getPreviewTitle(block.name),
    description
  }
}

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ViewId>('library')
  const [componentSearch, setComponentSearch] = useState('')
  const [appComponentSearch, setAppComponentSearch] = useState('')
  const [selectedComponentSlug, setSelectedComponentSlug] = useState('button')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(getInitialLanguageMode)
  const text = uiText[languageMode]
  const activeNavItem = primaryNav.find((item) => item.id === activeView) ?? primaryNav[0]
  const isComponentView = activeView === 'design-components'
  const isFoundationView = activeView === 'foundation-standards'
  const filteredDesignComponents = useMemo(() => {
    const query = componentSearch.trim().toLowerCase()

    if (!query) {
      return shadcnComponents
    }

    return shadcnComponents.filter((item) => {
      const doc = mirroredShadcnDocs[item.slug]
      let localizedDescriptions: string[] = []

      if (doc) {
        const description = doc.description
        localizedDescriptions =
          typeof description === 'string' ? [description] : [description.en, description.zh]
      }

      return (
        item.name.toLowerCase().includes(query) ||
        item.slug.includes(query) ||
        localizedDescriptions.some((description) => description.toLowerCase().includes(query))
      )
    })
  }, [componentSearch])

  const filteredAppComponents = useMemo(() => {
    const query = appComponentSearch.trim().toLowerCase()

    return shadcnComponents.filter((item) => {
      if (!installedShadcnComponentSlugs.has(item.slug)) {
        return false
      }

      if (!query) {
        return true
      }

      const doc = mirroredShadcnDocs[item.slug]
      let localizedDescriptions: string[] = []

      if (doc) {
        const description = doc.description
        localizedDescriptions =
          typeof description === 'string' ? [description] : [description.en, description.zh]
      }

      return (
        item.name.toLowerCase().includes(query) ||
        item.slug.includes(query) ||
        localizedDescriptions.some((description) => description.toLowerCase().includes(query))
      )
    })
  }, [appComponentSearch])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', themeMode === 'dark')
    root.style.colorScheme = themeMode
    window.localStorage.setItem('comic-to-kindle-theme', themeMode)
  }, [themeMode])

  useEffect(() => {
    document.documentElement.lang = languageMode === 'zh' ? 'zh-CN' : 'en'
    window.localStorage.setItem('comic-to-kindle-language', languageMode)
  }, [languageMode])

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full bg-background text-foreground">
        <AppSidebar activeView={activeView} locale={languageMode} onSelect={setActiveView} />
        <SidebarInset className="flex min-w-0 flex-col overflow-hidden">
          <header
            className="flex min-h-14 shrink-0 items-center gap-3 border-b bg-background px-4 py-2"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <SidebarTrigger
              className="md:hidden"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold">{text.nav[activeNavItem.id]}</h1>
              {isComponentView ? (
                <div
                  className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden text-xs text-muted-foreground"
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                  <span>{shadcnDocsSource.repository}</span>
                  <span>·</span>
                  <span>{shadcnDocsSource.license}</span>
                  <span>·</span>
                  <a
                    className="inline-flex min-w-0 items-center gap-1 hover:text-foreground"
                    href={
                      mirroredShadcnDocs[selectedComponentSlug]?.officialUrl ??
                      `https://ui.shadcn.com/docs/components/radix/${selectedComponentSlug}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    {text.header.officialPage}
                    <ExternalLink className="size-3" />
                  </a>
                  <ShadcnSourceDialog
                    locale={languageMode}
                    selectedPath={mirroredShadcnDocs[selectedComponentSlug]?.sourcePath}
                  />
                </div>
              ) : activeView === 'app-components' ? (
                <p className="truncate text-xs text-muted-foreground">
                  {text.header.appComponentsDescription}
                </p>
              ) : isFoundationView ? (
                <p className="truncate text-xs text-muted-foreground">
                  {text.header.foundationDescription}
                </p>
              ) : (
                <p className="truncate text-xs text-muted-foreground">
                  {text.header.libraryDescription}
                </p>
              )}
            </div>
            {!isFoundationView && activeView !== 'app-components' ? (
              <div
                className="hidden min-w-64 items-center gap-2 rounded-md border bg-background px-3 md:flex"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <Search className="size-4 text-muted-foreground" />
                {isComponentView ? (
                  <Input
                    aria-label={text.header.searchComponents}
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    onChange={(event) => setComponentSearch(event.target.value)}
                    placeholder={text.header.searchComponents}
                    value={componentSearch}
                  />
                ) : (
                  <Input
                    aria-label={text.header.searchComics}
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    placeholder={text.header.searchComics}
                  />
                )}
              </div>
            ) : activeView === 'app-components' ? (
              <div
                className="hidden min-w-64 items-center gap-2 rounded-md border bg-background px-3 md:flex"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <Search className="size-4 text-muted-foreground" />
                <Input
                  aria-label="搜索应用组件"
                  className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                  onChange={(event) => setAppComponentSearch(event.target.value)}
                  placeholder="搜索应用组件..."
                  value={appComponentSearch}
                />
              </div>
            ) : null}
            <TooltipProvider>
              <div
                className="flex shrink-0 items-center gap-2"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={
                        themeMode === 'dark' ? text.header.switchToLight : text.header.switchToDark
                      }
                      className="size-10"
                      onClick={() =>
                        setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))
                      }
                      size="icon"
                      variant="outline"
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
                      className="size-10 text-xs"
                      onClick={() => setLanguageMode((current) => (current === 'zh' ? 'en' : 'zh'))}
                      size="icon"
                      variant="outline"
                    >
                      {languageMode === 'zh' ? '中' : 'EN'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    {text.header.languageTitle}
                  </TooltipContent>
                </Tooltip>

                {isComponentView ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        aria-label={text.header.officialDocs}
                        className="hidden size-10 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-medium whitespace-nowrap shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:inline-flex"
                        href="https://ui.shadcn.com/docs/components"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      {text.header.officialDocs}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </TooltipProvider>
            {isComponentView || isFoundationView || activeView === 'app-components' ? null : (
              <div
                className="flex items-center gap-2"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              >
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  {text.header.filter}
                </Button>
                <Button size="sm">
                  <Plus />
                  {text.header.add}
                </Button>
              </div>
            )}
          </header>

          {isComponentView || activeView === 'app-components' ? (
            <DesignComponentsView
              components={
                activeView === 'app-components' ? filteredAppComponents : filteredDesignComponents
              }
              onSelect={setSelectedComponentSlug}
              query={activeView === 'app-components' ? appComponentSearch : componentSearch}
              selectedSlug={
                activeView === 'app-components'
                  ? filteredAppComponents.some((c) => c.slug === selectedComponentSlug)
                    ? selectedComponentSlug
                    : filteredAppComponents[0]?.slug || 'button'
                  : selectedComponentSlug
              }
              locale={languageMode}
            />
          ) : isFoundationView ? (
            <ScrollArea className="min-h-0 flex-1">
              <FoundationStandardsView locale={languageMode} />
            </ScrollArea>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <LibraryView locale={languageMode} />
            </ScrollArea>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function LibraryView({ locale }: { locale: LanguageMode }): React.JSX.Element {
  const text = uiText[locale]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 lg:p-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {libraryStats.map((item) => (
          <Card key={item.label} className="gap-4 rounded-lg py-4 shadow-none">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <item.icon className="size-4" />
                {item.label}
              </CardTitle>
              <CardAction>
                <BadgeCheck className="size-4 text-emerald-600" />
              </CardAction>
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-semibold tracking-normal">{item.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid min-h-[520px] gap-5 xl:grid-cols-[1fr_320px]">
        <Card className="min-w-0 gap-0 rounded-lg py-0 shadow-none">
          <CardHeader className="border-b px-4 py-4">
            <div className="min-w-0">
              <CardTitle className="text-base">{text.library.localComics}</CardTitle>
              <CardDescription>{text.library.localComicsDescription}</CardDescription>
            </div>
            <CardAction className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="icon-sm" aria-label={text.library.gridView}>
                <Grid2X2 />
              </Button>
              <Button variant="secondary" size="icon-sm" aria-label={text.library.listView}>
                <List />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs defaultValue="all" className="min-w-0">
                <TabsList className="w-full sm:w-fit">
                  <TabsTrigger value="all">{text.library.all}</TabsTrigger>
                  <TabsTrigger value="recent">{text.library.recent}</TabsTrigger>
                  <TabsTrigger value="todo">{text.library.todo}</TabsTrigger>
                  <TabsTrigger value="kindle">Kindle</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    aria-label={text.library.mobileSearch}
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    placeholder={text.library.mobileSearch}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[42%] px-4">{text.library.title}</TableHead>
                    <TableHead>{text.library.format}</TableHead>
                    <TableHead className="hidden md:table-cell">{text.library.pages}</TableHead>
                    <TableHead>{text.library.status}</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      {text.library.updated}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comics.map((comic) => (
                    <TableRow key={comic.title}>
                      <TableCell className="px-4">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{comic.title}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {comic.author}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                          {comic.format}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{comic.pages}</TableCell>
                      <TableCell>
                        <StatusLabel locale={locale} status={comic.status} />
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                        {comic.updatedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <aside className="hidden min-w-0 xl:block" />
      </section>
    </main>
  )
}

function FoundationStandardsView({ locale }: { locale: LanguageMode }): React.JSX.Element {
  const text = uiText[locale]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 lg:p-6">
      <header className="border-b pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold">{text.foundation.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {text.foundation.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border bg-muted/40 px-2 py-1">Tailwind CSS 4</span>
            <span className="rounded-md border bg-muted/40 px-2 py-1">shadcn/ui neutral</span>
            <span className="rounded-md border bg-muted/40 px-2 py-1">radius 8px</span>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FoundationSummaryCard
          icon={Palette}
          label={text.foundation.colors}
          value={text.foundation.tokenCount(designTokens.colors.length)}
          note={text.foundation.colorsNote}
        />
        <FoundationSummaryCard
          icon={Type}
          label={text.foundation.font}
          value={designTokens.font.name}
          note={text.foundation.fontNote}
        />
        <FoundationSummaryCard
          icon={Rows3}
          label={text.foundation.typeScale}
          value={text.foundation.levelCount(designTokens.typeScale.length)}
          note={text.foundation.typeScaleNote}
        />
        <FoundationSummaryCard
          icon={Ruler}
          label={text.foundation.spacing}
          value={`${designTokens.spacing[0].value} 基线`}
          note={text.foundation.spacingNote}
        />
        <FoundationSummaryCard
          icon={Ruler}
          label={text.foundation.radius}
          value="0.5rem 基准"
          note={text.foundation.radiusNote}
        />
        <FoundationSummaryCard
          icon={Grid2X2}
          label={text.foundation.layout}
          value={text.foundation.ruleCount(designTokens.layout.length)}
          note={text.foundation.layoutNote}
        />
      </section>

      <section className="space-y-3">
        <SectionHeading
          icon={Palette}
          title="颜色"
          description="颜色以 `src/renderer/src/assets/main.css` 中的 CSS 变量为准，组件中优先使用 Tailwind 语义类。"
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {designTokens.colors.map((item) => (
            <div className="rounded-lg border bg-background p-4" key={item.token}>
              <div
                className="h-16 rounded-md border"
                style={{ background: item.sample }}
                aria-label={`${item.name} 色块`}
              />
              <div className="mt-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.token}</code>
                </div>
                {item.className ? (
                  <code className="mt-2 block w-fit rounded bg-muted px-1.5 py-0.5 text-xs">
                    {item.className}
                  </code>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <SectionHeading
            icon={Type}
            title="字体与字号"
            description="全局字体栈定义在 body 上；字号采用 Tailwind 默认比例，优先保证扫描效率。"
          />
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>层级</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>类名</TableHead>
                  <TableHead>值</TableHead>
                  <TableHead>使用场景</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designTokens.typeScale.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.token}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.className}
                      </code>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell className="text-muted-foreground">{item.usage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeading
            icon={Type}
            title="字体栈"
            description="跨平台桌面应用使用系统 UI 字体兜底。"
          />
          <div className="rounded-lg border bg-background p-4">
            <code className="block whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
              {designTokens.font.value}
            </code>
            <div className="mt-5 space-y-2">
              <div className="text-2xl font-semibold">Aa 基础规范</div>
              <div className="text-sm text-muted-foreground">
                Regular 用于正文，medium 用于列表标题，semibold 用于页面和分区标题。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          icon={Ruler}
          title="间距"
          description="界面密度以 4px 为最小节拍；移动端使用 16px 页面边距，桌面使用 24px 页面边距。"
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {designTokens.spacing.map((item) => (
            <div className="rounded-lg border bg-background p-4" key={item.token}>
              <div className="flex h-14 items-center">
                <div
                  className="h-5 rounded-sm bg-primary"
                  style={{ width: item.value }}
                  aria-label={`${item.value} 间距示意`}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-sm">{item.value}</div>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.className}</code>
              </div>
              <code className="mt-2 block w-fit rounded bg-muted px-1.5 py-0.5 text-xs">
                {item.token}
              </code>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <SectionHeading
            icon={Ruler}
            title="圆角"
            description="圆角来自 shadcn 的 radius CSS 变量映射，优先使用 Tailwind rounded utility。"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {designTokens.radius.map((item) => (
              <div className="rounded-lg border bg-background p-4" key={item.token}>
                <div className={`h-14 border bg-muted ${item.className}`} />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.name}</div>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.className}</code>
                </div>
                <code className="mt-2 block w-fit rounded bg-muted px-1.5 py-0.5 text-xs">
                  {item.token}
                </code>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.usage}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeading
            icon={Grid2X2}
            title="布局"
            description="布局 token 记录当前工作台常用页面边距、宽度和关键分栏约定。"
          />
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>名称</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>类名</TableHead>
                  <TableHead>值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designTokens.layout.map((item) => (
                  <TableRow key={item.token}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.token}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.className}
                      </code>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </main>
  )
}

function FoundationSummaryCard({
  icon: Icon,
  label,
  note,
  value
}: {
  icon: LucideIcon
  label: string
  note: string
  value: string
}): React.JSX.Element {
  return (
    <Card className="gap-4 rounded-lg py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-xl font-semibold tracking-normal">{value}</div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

function SectionHeading({
  description,
  icon: Icon,
  title
}: {
  description: string
  icon: LucideIcon
  title: string
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function DesignComponentsView({
  components,
  locale,
  onSelect,
  query,
  selectedSlug
}: {
  components: ShadcnComponent[]
  locale: LanguageMode
  onSelect: (slug: string) => void
  query: string
  selectedSlug: string
}): React.JSX.Element {
  const text = uiText[locale]
  const selectedComponent =
    shadcnComponents.find((item) => item.slug === selectedSlug) ?? shadcnComponents[0]
  const selectedDoc = mirroredShadcnDocs[selectedComponent.slug]

  return (
    <main className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:grid-rows-none lg:gap-5 lg:p-6">
      <aside className="min-h-0 min-w-0 overflow-hidden lg:hidden">
        <div className="rounded-lg border bg-background">
          <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Components</div>
              <div className="text-xs text-muted-foreground">
                {components.length} / {shadcnComponents.length} {text.components.countSuffix}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto p-2">
            <div className="flex w-max gap-2">
              {components.map((item) => {
                const mirrored = Boolean(mirroredShadcnDocs[item.slug])
                const installed = installedShadcnComponentSlugs.has(item.slug)

                return (
                  <button
                    className={`inline-flex h-9 max-w-44 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:bg-muted ${
                      item.slug === selectedComponent.slug ? 'bg-muted' : 'bg-background'
                    }`}
                    key={item.slug}
                    onClick={() => onSelect(item.slug)}
                    type="button"
                  >
                    <span className="truncate">{item.name}</span>
                    {mirrored || installed ? (
                      <span className="size-1.5 rounded-full bg-emerald-600" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {components.length === 0 ? (
          <Card className="mt-3 rounded-lg py-6 text-center shadow-none">
            <CardContent className="text-sm text-muted-foreground">
              {text.components.noMatches(query)}
            </CardContent>
          </Card>
        ) : null}
      </aside>

      <aside className="hidden min-h-0 min-w-0 overflow-hidden lg:block">
        <Card className="flex h-full min-h-0 gap-0 rounded-lg py-0 shadow-none">
          <CardHeader className="border-b px-4 py-4">
            <CardTitle className="text-base">Components</CardTitle>
            <CardDescription>
              {components.length} / {shadcnComponents.length} {text.components.countSuffix}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-auto p-2">
            <div className="space-y-1">
              {components.map((item) => {
                const mirrored = Boolean(mirroredShadcnDocs[item.slug])
                const installed = installedShadcnComponentSlugs.has(item.slug)

                return (
                  <button
                    className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-muted ${
                      item.slug === selectedComponent.slug ? 'bg-muted' : ''
                    }`}
                    key={item.slug}
                    onClick={() => onSelect(item.slug)}
                    type="button"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {mirrored ? text.components.mirrored : text.components.pendingMirror}
                        {installed ? ` · ${text.components.installed}` : ''}
                      </span>
                    </span>
                    {mirrored ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {components.length === 0 ? (
          <Card className="mt-3 rounded-lg py-6 text-center shadow-none">
            <CardContent className="text-sm text-muted-foreground">
              {text.components.noMatches(query)}
            </CardContent>
          </Card>
        ) : null}
      </aside>

      <article className="min-h-0 min-w-0 overflow-auto">
        {selectedDoc ? (
          <div className="space-y-8">
            <header className="border-b pb-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold">{selectedDoc.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {getLocalizedText(selectedDoc.description, locale)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                    {installedShadcnComponentSlugs.has(selectedDoc.slug)
                      ? text.components.installed
                      : text.components.notInstalled}
                  </span>
                  <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                    {text.components.mirrored}
                  </span>
                </div>
              </div>
            </header>
            <div className="space-y-8">
              {selectedDoc.sections.map((section) => {
                const sectionTitle = getLocalizedText(section.title, locale)

                return (
                  <section className="scroll-mt-20 space-y-3" id={sectionTitle} key={sectionTitle}>
                    <h2 className="text-lg font-semibold">{sectionTitle}</h2>
                    <div className="space-y-3">
                      {section.blocks.map((block, index) => (
                        <ShadcnDocBlockView
                          block={block}
                          key={`${sectionTitle}-${index}`}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <header className="border-b pb-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold">{selectedComponent.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {text.components.notMirrored}
                  </p>
                </div>
              </div>
            </header>
            <div className="space-y-4">
              <code className="block overflow-x-auto rounded-md border bg-muted/50 px-3 py-2 text-xs">
                npx shadcn@latest add {selectedComponent.slug}
              </code>
              <a
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                href={`https://ui.shadcn.com/docs/components/radix/${selectedComponent.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                {text.components.openOfficialDocs}
              </a>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}

function ShadcnSourceDialog({
  locale,
  selectedPath
}: {
  locale: LanguageMode
  selectedPath?: string
}): React.JSX.Element {
  const text = uiText[locale]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <Info className="size-3" />
          {text.header.sourceDetails}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{text.source.localMirror}</DialogTitle>
          <DialogDescription>{text.source.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium">{text.source.repository}</div>
            <div className="text-muted-foreground">{shadcnDocsSource.repository}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium">License</div>
            <div className="text-muted-foreground">{shadcnDocsSource.license}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium">Docs root</div>
            <div className="break-all text-muted-foreground">{shadcnDocsSource.docsRoot}</div>
          </div>
          {selectedPath ? (
            <div className="space-y-1">
              <div className="font-medium">{text.source.currentSource}</div>
              <div className="break-all text-muted-foreground">{selectedPath}</div>
            </div>
          ) : null}
          <div className="space-y-1">
            <div className="font-medium">Source ref</div>
            <div className="break-all text-muted-foreground">{shadcnDocsSource.ref}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShadcnDocBlockView({
  block,
  locale
}: {
  block: ShadcnDocBlock
  locale: LanguageMode
}): React.JSX.Element {
  const text = uiText[locale]
  const [copiedPreviewName, setCopiedPreviewName] = useState<string | null>(null)

  async function handleCopyPreviewName(name: string): Promise<void> {
    await copyTextToClipboard(name)
    setCopiedPreviewName(name)
    window.setTimeout(() => setCopiedPreviewName(null), 1600)
  }

  if (block.type === 'paragraph') {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        <InlineDocText text={getLocalizedText(block.text, locale)} />
      </p>
    )
  }

  if (block.type === 'code' || block.type === 'composition') {
    const language = block.type === 'composition' ? 'text' : block.language

    return (
      <div className="overflow-hidden rounded-lg border bg-muted/40">
        {block.type === 'code' && block.title ? (
          <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
            <InlineDocText text={getLocalizedText(block.title, locale)} />
          </div>
        ) : null}
        <pre className="overflow-x-auto p-3 text-xs leading-5">
          <code data-language={language}>{block.code}</code>
        </pre>
      </div>
    )
  }

  if (block.type === 'preview') {
    const isCopied = copiedPreviewName === block.name
    const previewHeader = getPreviewHeader(block, locale)

    return (
      <div className="overflow-hidden rounded-lg border bg-background">
        <div
          className={`group flex justify-between gap-3 border-b px-4 ${
            previewHeader.description ? 'items-start py-3' : 'min-h-12 items-center py-2'
          }`}
        >
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">
              <InlineDocText text={previewHeader.title} />
            </div>
            {previewHeader.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                <InlineDocText text={previewHeader.description} />
              </p>
            ) : null}
          </div>
          <Button
            aria-label={
              isCopied
                ? text.components.copiedPreviewName
                : text.components.copyPreviewName(block.name)
            }
            className={`shrink-0 text-muted-foreground transition-opacity hover:text-foreground ${
              isCopied ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
            } ${previewHeader.description ? 'mt-0.5' : ''}`}
            onClick={() => handleCopyPreviewName(block.name)}
            size="icon-xs"
            title={isCopied ? text.components.copied : text.components.copyPreviewName(block.name)}
            type="button"
            variant="ghost"
          >
            {isCopied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
        <div className="p-4">
          <ShadcnComponentPreview name={block.name} direction={block.direction} />
        </div>
      </div>
    )
  }

  if (block.type === 'steps') {
    return (
      <ol className="space-y-2">
        {block.items.map((item, index) => (
          <li
            className="flex gap-3 text-sm text-muted-foreground"
            key={`${index}-${getLocalizedText(item, locale)}`}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-xs text-foreground">
              {index + 1}
            </span>
            <span className="pt-0.5">{getLocalizedText(item, locale)}</span>
          </li>
        ))}
      </ol>
    )
  }

  if (block.type === 'table') {
    return (
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {block.columns.map((column) => (
                <TableHead key={getLocalizedText(column, locale)}>
                  {getLocalizedText(column, locale)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row) => (
              <TableRow key={row.join('-')}>
                {row.map((cell) => (
                  <TableCell className="font-mono text-xs" key={cell}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (block.type === 'link') {
    return (
      <a
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={block.href}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLink className="size-4" />
        {getLocalizedText(block.label, locale)}
      </a>
    )
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
      <InlineDocText text={getLocalizedText(block.text, locale)} />
    </div>
  )
}

function InlineDocText({ text }: { text: string }): React.JSX.Element {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
              key={`${part}-${index}`}
            >
              {part.slice(1, -1)}
            </code>
          )
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)

        if (linkMatch) {
          const [, label, href] = linkMatch
          const resolvedHref = href.startsWith('/') ? `https://ui.shadcn.com${href}` : href

          return (
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href={resolvedHref}
              key={`${part}-${index}`}
              rel="noreferrer"
              target="_blank"
            >
              {label}
            </a>
          )
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}

function AlertPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'alert-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="relative w-full max-w-xl rounded-lg border border-destructive/50 p-4 text-destructive dark:border-destructive [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-destructive">
          <AlertCircle className="size-4" />
          <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
          <div className="text-sm opacity-90">
            Your session has expired. Please log in again.
          </div>
        </div>
      </div>
    )
  }

  // alert-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="relative w-full max-w-xl rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground">
        <Terminal className="size-4" />
        <h5 className="mb-1 font-medium leading-none tracking-tight">Heads up!</h5>
        <div className="text-sm text-muted-foreground">
          You can add components to your app using the cli.
        </div>
      </div>
    </div>
  )
}

function AlertDialogPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open alert dialog</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button variant="destructive">Continue</Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AspectRatioPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-[400px] overflow-hidden rounded-xl border bg-muted/30 p-2 shadow-xs">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&auto=format&fit=crop"
            alt="Unsplash Cover"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </div>
  )
}

function AvatarPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center gap-6 p-4" dir={dir}>
      <div className="flex items-center gap-4">
        {/* Avatar with Image */}
        <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
          <img
            className="aspect-square h-full w-full object-cover"
            src="https://github.com/shadcn.png"
            alt="@shadcn"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>

        {/* Avatar with Fallback */}
        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-medium text-muted-foreground select-none">
          CN
        </div>
      </div>
    </div>
  )
}

function BadgePreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'badge-secondary') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">
          Secondary
        </div>
      </div>
    )
  }

  if (name === 'badge-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="inline-flex items-center rounded-full border border-transparent bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/80 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">
          Destructive
        </div>
      </div>
    )
  }

  if (name === 'badge-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">
          Outline
        </div>
      </div>
    )
  }

  // badge-demo / default
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">
        Badge
      </div>
    </div>
  )
}

function BreadcrumbPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'breadcrumb-custom-separator') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            <li className="inline-flex items-center gap-1.5">
              <a className="transition-colors hover:text-foreground" href="#">Home</a>
            </li>
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <Slash className="size-3" />
            </li>
            <li className="inline-flex items-center gap-1.5">
              <a className="transition-colors hover:text-foreground" href="#">Components</a>
            </li>
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <Slash className="size-3" />
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground">
                Breadcrumb
              </span>
            </li>
          </ol>
        </nav>
      </div>
    )
  }

  if (name === 'breadcrumb-ellipsis') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            <li className="inline-flex items-center gap-1.5">
              <a className="transition-colors hover:text-foreground" href="#">Home</a>
            </li>
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <ChevronRight />
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </span>
            </li>
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <ChevronRight />
            </li>
            <li className="inline-flex items-center gap-1.5">
              <a className="transition-colors hover:text-foreground" href="#">Components</a>
            </li>
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <ChevronRight />
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground">
                Breadcrumb
              </span>
            </li>
          </ol>
        </nav>
      </div>
    )
  }

  // breadcrumb-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <nav aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
          <li className="inline-flex items-center gap-1.5">
            <a className="transition-colors hover:text-foreground" href="#">Home</a>
          </li>
          <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
            <ChevronRight />
          </li>
          <li className="inline-flex items-center gap-1.5">
            <a className="transition-colors hover:text-foreground" href="#">Components</a>
          </li>
          <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
            <ChevronRight />
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground">
              Breadcrumb
            </span>
          </li>
        </ol>
      </nav>
    </div>
  )
}

function CalendarPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border bg-background shadow-xs"
      />
    </div>
  )
}

function CardPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            This is a simulated preview showing a card component containing project status.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function CarouselPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

function ChartPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 }
  ]

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--primary))'
    },
    mobile: {
      label: 'Mobile',
      color: 'hsl(var(--chart-2, 210 100% 50%))'
    }
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>Showing mobile and desktop traffic.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckboxPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
      </div>
    </div>
  )
}

function CollapsiblePreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function ComboboxPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" }
  ]

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? frameworks.find((framework) => framework.value === value)?.label
              : "Select framework..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    {framework.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function CommandPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Command className="rounded-lg border shadow-md max-w-[450px]">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Billing</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

function ContextMenuPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset>Back</ContextMenuItem>
          <ContextMenuItem inset disabled>Forward</ContextMenuItem>
          <ContextMenuItem inset>Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset>Bookmark this page</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

function DataTablePreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [filterValue, setFilterValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const allData = [
    { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
    { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
    { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
    { id: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
    { id: "INV005", status: "Paid", method: "Apple Pay", amount: "$550.00" }
  ]

  const filtered = allData.filter(item => 
    item.id.toLowerCase().includes(filterValue.toLowerCase()) ||
    item.method.toLowerCase().includes(filterValue.toLowerCase())
  )

  const itemsPerPage = 3
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const displayedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-4 p-4" dir={dir}>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter invoices..."
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-xs"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.length > 0 ? (
              displayedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell className="text-right">{row.amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function DatePickerPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-[240px] justify-start text-left font-normal"
          >
            <Terminal className="mr-2 h-4 w-4" />
            {date ? date.toDateString() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function DirectionPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [localDir, setLocalDir] = useState<'ltr' | 'rtl'>('ltr')

  return (
    <div className="flex flex-col min-h-24 items-center justify-center gap-4 p-4" dir={dir}>
      <div className="flex gap-2">
        <Button size="sm" variant={localDir === 'ltr' ? 'default' : 'outline'} onClick={() => setLocalDir('ltr')}>LTR</Button>
        <Button size="sm" variant={localDir === 'rtl' ? 'default' : 'outline'} onClick={() => setLocalDir('rtl')}>RTL</Button>
      </div>
      <div className="rounded-md border p-4 w-64 text-sm" dir={localDir}>
        {localDir === 'rtl' ? 'هذا النص مكتوب من اليمين إلى اليسار.' : 'This text is rendered from left to right.'}
      </div>
    </div>
  )
}

function DrawerPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Move Goal</DrawerTitle>
              <DrawerDescription>Set your daily activity goal.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0 text-center text-sm">
              Simulated sliding drawer content area.
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function DropdownMenuPreview({
  direction
}: {
  direction?: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EmptyPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'empty-search') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-xl rounded-xl border bg-gradient-to-b from-muted/20 via-background to-background p-6 text-center shadow-xs">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border bg-muted/40">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold">404 - Not Found</h4>
            <p className="text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need below.
            </p>
          </div>
          <div className="mx-auto mt-5 flex max-w-md gap-2">
            <Input defaultValue="/" className="text-center" />
            <Button variant="outline">Search</Button>
          </div>
          <Button variant="link" className="mt-3 text-sm text-muted-foreground">
            Need help? Contact support
          </Button>
        </div>
      </div>
    )
  }

  if (name === 'empty-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-lg rounded-xl border border-dashed bg-background p-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border bg-muted/30">
            <HardDrive className="size-5 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-semibold">Cloud Storage Empty</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload files to your cloud storage to access them anywhere.
          </p>
          <Button className="mt-5">Upload Files</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-lg rounded-2xl border bg-background p-6 text-center shadow-xs">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/40">
          <FolderOpen className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-semibold">
            {name === 'empty-rtl' ? 'لا توجد مشاريع بعد' : 'No Projects Yet'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {name === 'empty-rtl'
              ? 'لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول.'
              : "You haven't created any projects yet. Get started by creating your first project."}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </div>
        <Button variant="link" className="mt-3 gap-1.5 text-muted-foreground">
          Learn More
          <ArrowUpRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function FieldPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'field-grouped') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This appears on invoices and emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name</label>
                <Input placeholder="Evil Rabbit" />
                <p className="text-xs text-muted-foreground">
                  This appears on invoices and emails.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input placeholder="@evilrabbit" />
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox id="field-notify" defaultChecked />
              <div className="space-y-1">
                <label htmlFor="field-notify" className="text-sm font-medium">
                  Email me product updates
                </label>
                <p className="text-xs text-muted-foreground">
                  Weekly release notes and security alerts.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>All transactions are secure and encrypted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name on Card</label>
            <Input placeholder="Evil Rabbit" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Number</label>
            <Input placeholder="1234 5678 9012 3456" />
            <p className="text-xs text-muted-foreground">Enter your 16-digit card number</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Input placeholder="MM" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input placeholder="YYYY" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CVV</label>
              <Input placeholder="123" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Address</label>
            <p className="text-xs text-muted-foreground">
              The billing address associated with your payment method
            </p>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox id="same-as-shipping" defaultChecked />
              <label htmlFor="same-as-shipping" className="text-sm">
                Same as shipping address
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function HoverCardPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const title = name === 'hover-card-delay' ? 'Open with Delays' : '@shadcn'
  const description =
    name === 'hover-card-delay'
      ? 'Use openDelay and closeDelay to slow the interaction for dense interfaces.'
      : 'The React Framework creator toolkit with fast iteration and polished defaults.'

  return (
    <div className="flex min-h-32 items-center justify-center p-8" dir={dir}>
      <div className="group flex w-full max-w-sm flex-col items-center gap-4">
        <Button variant="outline">
          {name === 'hover-card-delay' ? 'Hover with Delay' : 'Hover Here'}
        </Button>
        <div className="w-full rounded-xl border bg-background p-4 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              CN
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">{title}</div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Joined December 2020
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'input-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <Input disabled value="editor@comic-to-kindle.dev" />
          <p className="text-xs text-muted-foreground">This field is currently disabled.</p>
        </div>
      </div>
    )
  }

  if (name === 'input-field') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input placeholder="shadcn" />
          <p className="text-xs text-muted-foreground">
            Choose a unique username for your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-md space-y-2">
        <label className="text-sm font-medium">API Key</label>
        <Input defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxx" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Your API key is encrypted and stored securely.
          </p>
          <Button size="sm" variant="outline">
            Copy
          </Button>
        </div>
      </div>
    </div>
  )
}

function InputGroupPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'input-group-textarea') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-xl space-y-2">
          <div className="rounded-xl border bg-background p-3 shadow-xs">
            <textarea
              className="min-h-28 w-full resize-none border-0 bg-transparent text-sm outline-hidden"
              defaultValue={'Line 1, Column 1'}
            />
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>script.js</span>
              <div className="flex items-center gap-2">
                <span>0/280</span>
                <Button size="sm" variant="ghost">
                  Run
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Footer positioned below the textarea.
          </p>
        </div>
      </div>
    )
  }

  if (name === 'input-group-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-xl space-y-2">
          <div className="flex overflow-hidden rounded-xl border bg-background shadow-xs">
            <div className="flex items-center border-r bg-muted/30 px-3 text-sm text-muted-foreground">
              https://
            </div>
            <Input
              className="h-11 rounded-none border-0 shadow-none focus-visible:ring-0"
              placeholder="comictokindle.dev"
            />
            <Button className="m-1">Search</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Inline button actions keep the control compact.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-lg space-y-2">
        <div className="flex overflow-hidden rounded-xl border bg-background shadow-xs">
          <Input
            className="h-11 rounded-none border-0 shadow-none focus-visible:ring-0"
            placeholder="Search documentation..."
          />
          <div className="flex items-center border-l px-3 text-muted-foreground">
            <Search className="size-4" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Icon positioned at the end.</p>
      </div>
    </div>
  )
}

function InputOtpPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [otp, setOtp] = useState(name === 'input-otp-separator' ? '826491' : '123456')
  const slots = otp.padEnd(6, ' ').slice(0, 6).split('')

  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
      <div className="flex items-center gap-2">
        {slots.slice(0, 3).map((digit, index) => (
          <div
            className="flex h-12 w-10 items-center justify-center rounded-lg border bg-background text-lg font-semibold shadow-xs"
            key={`otp-a-${index}`}
          >
            {digit.trim() || '•'}
          </div>
        ))}
        <div className="px-1 text-muted-foreground">-</div>
        {slots.slice(3).map((digit, index) => (
          <div
            className="flex h-12 w-10 items-center justify-center rounded-lg border bg-background text-lg font-semibold shadow-xs"
            key={`otp-b-${index}`}
          >
            {digit.trim() || '•'}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setOtp('654321')}>
          Paste sample
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOtp('')}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function ItemPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'item-actions') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-2xl rounded-xl border bg-background p-3 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Build artifacts ready</div>
              <div className="text-sm text-muted-foreground">
                Generated desktop bundles for macOS and Windows.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Review
              </Button>
              <Button size="sm">Publish</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (name === 'item-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-2xl rounded-xl border bg-background p-3 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Your profile has been verified.</div>
              <div className="text-sm text-muted-foreground">
                You can now publish assets and invite collaborators.
              </div>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Open">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-2xl rounded-xl border bg-background p-3 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <BadgeCheck className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Basic Item</div>
            <div className="text-sm text-muted-foreground">
              A simple item with title and description.
            </div>
          </div>
          <Button size="sm">Action</Button>
        </div>
      </div>
    </div>
  )
}

function ShadcnComponentPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  if (name.startsWith('calendar')) {
    return <CalendarPreview direction={direction} />
  }

  if (name.startsWith('card')) {
    return <CardPreview direction={direction} />
  }

  if (name.startsWith('carousel')) {
    return <CarouselPreview direction={direction} />
  }

  if (name.startsWith('chart')) {
    return <ChartPreview direction={direction} />
  }

  if (name.startsWith('checkbox')) {
    return <CheckboxPreview direction={direction} />
  }

  if (name.startsWith('collapsible')) {
    return <CollapsiblePreview direction={direction} />
  }

  if (name.startsWith('combobox')) {
    return <ComboboxPreview direction={direction} />
  }

  if (name.startsWith('command')) {
    return <CommandPreview direction={direction} />
  }

  if (name.startsWith('context-menu')) {
    return <ContextMenuPreview direction={direction} />
  }

  if (name.startsWith('data-table')) {
    return <DataTablePreview direction={direction} />
  }

  if (name.startsWith('date-picker')) {
    return <DatePickerPreview direction={direction} />
  }

  if (name.startsWith('direction')) {
    return <DirectionPreview direction={direction} />
  }

  if (name.startsWith('drawer')) {
    return <DrawerPreview direction={direction} />
  }

  if (name.startsWith('dropdown-menu')) {
    return <DropdownMenuPreview direction={direction} />
  }

  if (name.startsWith('empty')) {
    return <EmptyPreview name={name} direction={direction} />
  }

  if (name.startsWith('field')) {
    return <FieldPreview name={name} direction={direction} />
  }

  if (name.startsWith('hover-card')) {
    return <HoverCardPreview name={name} direction={direction} />
  }

  if (name.startsWith('input-otp')) {
    return <InputOtpPreview name={name} direction={direction} />
  }

  if (name.startsWith('input-group')) {
    return <InputGroupPreview name={name} direction={direction} />
  }

  if (name.startsWith('input')) {
    return <InputPreview name={name} direction={direction} />
  }

  if (name.startsWith('item')) {
    return <ItemPreview name={name} direction={direction} />
  }

  if (name.startsWith('alert-dialog')) {
    return <AlertDialogPreview direction={direction} />
  }

  if (name.startsWith('alert')) {
    return <AlertPreview name={name} direction={direction} />
  }

  if (name.startsWith('aspect-ratio')) {
    return <AspectRatioPreview direction={direction} />
  }

  if (name.startsWith('avatar')) {
    return <AvatarPreview direction={direction} />
  }

  if (name.startsWith('badge')) {
    return <BadgePreview name={name} direction={direction} />
  }

  if (name.startsWith('breadcrumb')) {
    return <BreadcrumbPreview name={name} direction={direction} />
  }

  if (name.startsWith('button-group')) {
    return <ButtonPreview name={name} direction={direction} />
  }

  if (name.startsWith('button') || name === 'spinner-button') {
    return <ButtonPreview name={name} direction={direction} />
  }

  if (name.startsWith('dialog')) {
    return <DialogPreview name={name} direction={direction} />
  }

  if (name.startsWith('table')) {
    return <TablePreview name={name} direction={direction} />
  }

  if (name.startsWith('sidebar') || name.startsWith('Sidebar')) {
    return <SidebarPreview name={name} direction={direction} />
  }

  if (name.startsWith('accordion')) {
    return <AccordionPreview name={name} direction={direction} />
  }

  return (
    <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
      这个预览还没有本地实现：{name}
    </div>
  )
}

function ButtonPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'button-size') {
    return (
      <div className="flex flex-col items-start gap-8 sm:flex-row" dir={dir}>
        <div className="flex items-start gap-2">
          <Button size="sm" variant="outline">
            Small
          </Button>
          <Button size="icon-sm" aria-label="Submit" variant="outline">
            <ArrowUpRight />
          </Button>
        </div>
        <div className="flex items-start gap-2">
          <Button variant="outline">Default</Button>
          <Button size="icon" aria-label="Submit" variant="outline">
            <ArrowUpRight />
          </Button>
        </div>
        <div className="flex items-start gap-2">
          <Button size="lg" variant="outline">
            Large
          </Button>
          <Button size="icon-lg" aria-label="Submit" variant="outline">
            <ArrowUpRight />
          </Button>
        </div>
      </div>
    )
  }

  if (name === 'button-default' || name === 'button-demo') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button>Button</Button>
      </div>
    )
  }

  if (name === 'button-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button variant="outline">Outline</Button>
      </div>
    )
  }

  if (name === 'button-secondary') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button variant="secondary">Secondary</Button>
      </div>
    )
  }

  if (name === 'button-ghost') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button variant="ghost">Ghost</Button>
      </div>
    )
  }

  if (name === 'button-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button variant="destructive">Delete</Button>
      </div>
    )
  }

  if (name === 'button-link') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button variant="link">Link</Button>
      </div>
    )
  }

  if (name === 'button-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button size="icon" variant="outline" aria-label="Submit">
          <CircleFadingArrowUp />
        </Button>
      </div>
    )
  }

  if (name === 'button-with-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button size="sm" variant="outline">
          <GitBranch data-icon="inline-start" />
          New Branch
        </Button>
      </div>
    )
  }

  if (name === 'button-rounded') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button className="rounded-full" size="icon" variant="outline" aria-label="Submit">
          <ArrowUp />
        </Button>
      </div>
    )
  }

  if (name === 'button-spinner' || name === 'spinner-button') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button disabled variant="outline">
            <PreviewSpinner data-icon="inline-start" />
            Generating
          </Button>
          <Button disabled variant="secondary">
            Downloading
            <PreviewSpinner data-icon="inline-start" />
          </Button>
        </div>
      </div>
    )
  }

  if (name === 'button-group-demo') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-0">
          <Button
            className="hidden rounded-r-none sm:inline-flex"
            size="icon"
            variant="outline"
            aria-label="Go Back"
          >
            <ArrowLeft />
          </Button>
          <Button className="rounded-r-none sm:rounded-none sm:border-l-0" variant="outline">
            Archive
          </Button>
          <Button className="rounded-none border-l-0" variant="outline">
            Report
          </Button>
          <Button className="rounded-none border-l-0" variant="outline">
            Snooze
          </Button>
          <Button
            className="rounded-l-none border-l-0"
            size="icon"
            variant="outline"
            aria-label="More Options"
          >
            <MoreHorizontal />
          </Button>
        </div>
      </div>
    )
  }

  if (name === 'button-aschild') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Button asChild variant="outline">
          <a
            href="https://ui.shadcn.com/docs/components/radix/button"
            rel="noreferrer"
            target="_blank"
          >
            Login
          </a>
        </Button>
      </div>
    )
  }

  if (name === 'button-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir="rtl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline">زر</Button>
          <Button variant="destructive">حذف</Button>
          <Button variant="outline">
            إرسال
            <ArrowRight className="rtl:rotate-180" data-icon="inline-end" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Add">
            <Plus />
          </Button>
          <Button disabled variant="secondary">
            <PreviewSpinner data-icon="inline-start" />
            جاري التحميل
          </Button>
        </div>
      </div>
    )
  }

  return <Button>Button</Button>
}

function PreviewSpinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2>): React.JSX.Element {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={['size-4 animate-spin', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

function DialogPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'dialog-no-close-button') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>No close button</DialogTitle>
              <DialogDescription>
                This dialog keeps the default close control hidden for custom flows.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (name === 'dialog-close-button') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Custom close</Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Custom close button</DialogTitle>
              <DialogDescription>
                The footer renders a close action instead of the default icon button.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (name === 'dialog-sticky-footer') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Sticky footer</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80dvh] gap-0 p-0">
            <DialogHeader className="border-b p-6">
              <DialogTitle>Review conversion settings</DialogTitle>
              <DialogDescription>Actions stay visible while the content scrolls.</DialogDescription>
            </DialogHeader>
            <div className="max-h-72 space-y-3 overflow-auto p-6 text-sm text-muted-foreground">
              {Array.from({ length: 6 }, (_, index) => (
                <p key={index}>
                  Setting group {index + 1}: page normalization, margins, contrast, metadata and
                  delivery defaults can be reviewed here.
                </p>
              ))}
            </div>
            <DialogFooter className="border-t p-6">
              <Button variant="outline">Cancel</Button>
              <Button>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (name === 'dialog-scrollable-content') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir={dir}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Scrollable content</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Long content</DialogTitle>
              <DialogDescription>
                The body scrolls when the dialog has more content than available space.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-64 space-y-3 overflow-auto rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              {Array.from({ length: 8 }, (_, index) => (
                <p key={index}>Paragraph {index + 1}: sample dialog content for scrolling.</p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (name === 'dialog-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center" dir="rtl">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">فتح الحوار</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إعدادات القراءة</DialogTitle>
              <DialogDescription>مثال على اتجاه الكتابة من اليمين إلى اليسار.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center" dir={dir}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input defaultValue="Comic Reader" aria-label="Name" />
            <Input defaultValue="reader@example.com" aria-label="Email" />
          </div>
          <DialogFooter>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TablePreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const rows = [
    ['INV001', 'Paid', 'Credit Card', '$250.00'],
    ['INV002', 'Pending', 'PayPal', '$150.00'],
    ['INV003', 'Unpaid', 'Bank Transfer', '$350.00']
  ]

  if (name === 'table-footer') {
    return (
      <div dir={dir}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row[0]}>
                <TableCell className="font-medium">{row[0]}</TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell className="text-right">{row[3]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">$750.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    )
  }

  if (name === 'table-actions') {
    return (
      <div dir={dir}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {['深夜书店 01', '海岸线物语', '城市猎人 Vol. 02'].map((title, index) => (
              <TableRow key={title}>
                <TableCell className="font-medium">{title}</TableCell>
                <TableCell>{index === 0 ? 'Ready' : 'Draft'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" aria-label={`${title} 操作`}>
                    <MoreHorizontal />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (name === 'table-rtl') {
    return (
      <div dir="rtl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفاتورة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 2).map((row) => (
              <TableRow key={row[0]}>
                <TableCell className="font-medium">{row[0]}</TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell className="text-left">{row[3]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div dir={dir}>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[0]}>
              <TableCell className="font-medium">{row[0]}</TableCell>
              <TableCell>{row[1]}</TableCell>
              <TableCell>{row[2]}</TableCell>
              <TableCell className="text-right">{row[3]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AccordionPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  const accordionItems = [
    {
      value: 'item-1',
      trigger: 'Is it accessible?',
      content: 'Yes. It adheres to the WAI-ARIA design pattern.'
    },
    {
      value: 'item-2',
      trigger: 'Is it styled?',
      content:
        'Yes. It comes with default styles that match the other components aesthetic.'
    },
    {
      value: 'item-3',
      trigger: 'Is it animated?',
      content:
        "Yes. It's animated by default, but you can disable it if you prefer."
    }
  ]

  if (name === 'accordion-rtl') {
    return (
      <div dir="rtl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="password">
            <AccordionTrigger>
              كيف يمكنني إعادة تعيين كلمة المرور؟
            </AccordionTrigger>
            <AccordionContent>
              يمكنك إعادة تعيين كلمة المرور باستخدام خيار "نسيت كلمة المرور" في صفحة تسجيل الدخول.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="subscription">
            <AccordionTrigger>
              هل يمكنني تغيير خطة الاشتراك الخاصة بي؟
            </AccordionTrigger>
            <AccordionContent>
              نعم، يمكنك تغيير خطتك في أي وقت من إعدادات الحساب.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment">
            <AccordionTrigger>
              ما هي طرق الدفع التي تقبلونها؟
            </AccordionTrigger>
            <AccordionContent>
              نقبل بطاقات الائتمان الرئيسية و PayPal والتحويل المصرفي.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (name === 'accordion-multiple') {
    return (
      <div dir={dir}>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="notifications">
            <AccordionTrigger>Notification Settings</AccordionTrigger>
            <AccordionContent>
              Manage how you receive notifications. You can enable email alerts
              for updates or push notifications.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy">
            <AccordionTrigger>Privacy & Security</AccordionTrigger>
            <AccordionContent>
              Control your privacy settings and manage how your data is shared
              and used across the platform.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="billing">
            <AccordionTrigger>Billing & Subscription</AccordionTrigger>
            <AccordionContent>
              View and manage your billing information, payment methods, and
              subscription details.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (name === 'accordion-disabled') {
    return (
      <div dir={dir}>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="history">
            <AccordionTrigger>Can I access my account history?</AccordionTrigger>
            <AccordionContent>
              Yes, you can view your complete account history including past
              transactions and activity logs from the dashboard.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="premium" disabled>
            <AccordionTrigger>
              Premium feature information
            </AccordionTrigger>
            <AccordionContent>
              This feature requires a premium subscription. Upgrade your plan to
              access advanced features and tools.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="email">
            <AccordionTrigger>
              How do I update my email address?
            </AccordionTrigger>
            <AccordionContent>
              Go to your profile settings and click on the email field to change
              it. A verification email will be sent to confirm.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (name === 'accordion-borders') {
    return (
      <div dir={dir}>
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-md border"
        >
          <AccordionItem value="billing">
            <AccordionTrigger className="px-4">
              How does billing work?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              We offer monthly and annual subscription plans. Billing is charged
              at the beginning of each cycle.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger className="px-4">
              Is my data secure?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              Your data is encrypted both in transit and at rest. We follow
              industry best practices to keep your information safe.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="integrations">
            <AccordionTrigger className="px-4">
              What integrations do you support?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              We support integrations with popular tools like Slack, GitHub,
              Jira, and many more through our API.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (name === 'accordion-card') {
    return (
      <div dir={dir}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
            <CardDescription>
              Common questions about your account, plans, payments and
              cancellations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="plans">
                <AccordionTrigger>
                  What subscription plans do you offer?
                </AccordionTrigger>
                <AccordionContent>
                  We offer three tiers: Starter ($9/mo), Professional ($29/mo),
                  and Enterprise ($99/mo). Each tier includes different features
                  and support levels.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="billing-card">
                <AccordionTrigger>How does billing work?</AccordionTrigger>
                <AccordionContent>
                  Billing is charged at the beginning of each billing cycle. You
                  can upgrade or downgrade your plan at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cancel">
                <AccordionTrigger>
                  How do I cancel my subscription?
                </AccordionTrigger>
                <AccordionContent>
                  You can cancel your subscription anytime from your account
                  settings. Your access will continue until the end of the
                  current billing period.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    )
  }

  // accordion-basic and accordion-demo (default)
  return (
    <div dir={dir}>
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        {accordionItems.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

function SidebarPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Inbox, label: 'Inbox', badge: '6' },
    { icon: Search, label: 'Search' },
    { icon: Settings, label: 'Settings' }
  ]

  const projects = [
    { icon: FileText, label: 'Design System' },
    { icon: Component, label: 'Components' },
    { icon: Palette, label: 'Brand Assets' }
  ]

  if (name === 'sidebar-rtl') {
    return (
      <div dir="rtl" className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar side="right" className="absolute inset-y-0 right-0">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">لوحة التحكم</span>
                      <span className="text-xs text-muted-foreground">الإصدار 2.0</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>التنقل الرئيسي</SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { icon: Home, label: 'الرئيسية', active: true },
                    { icon: Inbox, label: 'صندوق الوارد', badge: '٦' },
                    { icon: Search, label: 'بحث' },
                    { icon: Settings, label: 'الإعدادات' }
                  ].map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="المستخدم">
                    <BadgeCheck className="size-4" />
                    <span>مستخدم الضيف</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-floating') {
    return (
      <div dir={dir} className="relative h-[400px] overflow-hidden rounded-md border bg-sidebar">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar variant="floating" collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Floating</span>
                      <span className="text-xs text-muted-foreground">v2.0</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-inset') {
    return (
      <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar variant="inset" collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Inset</span>
                      <span className="text-xs text-muted-foreground">v2.0</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Account">
                    <BadgeCheck className="size-4" />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="p-4">
            <h4 className="text-sm font-semibold">Main Content Area</h4>
            <p className="text-xs text-muted-foreground mt-1">
              This content is wrapped in SidebarInset and automatically adjusts to the sidebar width.
            </p>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-icon') {
    return (
      <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen={false}>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Acme Inc</span>
                      <span className="text-xs text-muted-foreground">Enterprise</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.label}>
                      <SidebarMenuButton tooltip={project.label}>
                        {project.icon && <project.icon />}
                        <span>{project.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Account">
                    <BadgeCheck className="size-4" />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-header') {
    return (
      <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Acme Inc</span>
                      <span className="text-xs text-muted-foreground">Enterprise</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarSeparator />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Select Workspace">
                    <span>Workspace</span>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-footer') {
    return (
      <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Acme Inc</span>
                      <span className="text-xs text-muted-foreground">Enterprise</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Account">
                    <BadgeCheck className="size-4" />
                    <span>john@acme.com</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  if (name === 'sidebar-collapsible') {
    return (
      <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
        <SidebarProvider className="!min-h-0 h-full" defaultOpen>
          <Sidebar collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Component className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Acme Inc</span>
                      <span className="text-xs text-muted-foreground">Enterprise</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <SidebarGroupAction title="Add Project">
                  <Plus className="size-4" />
                  <span className="sr-only">Add Project</span>
                </SidebarGroupAction>
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.label}>
                      <SidebarMenuButton tooltip={project.label}>
                        {project.icon && <project.icon />}
                        <span>{project.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Account">
                    <BadgeCheck className="size-4" />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      </div>
    )
  }

  // sidebar-demo (default)
  return (
    <div dir={dir} className="h-[400px] overflow-hidden rounded-md border">
      <SidebarProvider className="!min-h-0 h-full" defaultOpen>
        <Sidebar collapsible="none">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Component className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Acme Inc</span>
                    <span className="text-xs text-muted-foreground">Enterprise</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.label}>
                    <SidebarMenuButton tooltip={project.label}>
                      {project.icon && <project.icon />}
                      <span>{project.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Account">
                  <BadgeCheck className="size-4" />
                  <span>Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}

function AppSidebar({
  activeView,
  locale,
  onSelect
}: {
  activeView: ViewId
  locale: LanguageMode
  onSelect: (view: ViewId) => void
}): React.JSX.Element {
  const text = uiText[locale]

  return (
    <Sidebar collapsible="icon">
      <div
        className="h-9 w-full shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{text.sidebar.workspace}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={item.id === activeView}
                    onClick={() => onSelect(item.id)}
                    tooltip={text.nav[item.id]}
                  >
                    <item.icon />
                    <span>{text.nav[item.id]}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{text.sidebar.folders}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {text.sidebar.folderNames.map((folder) => (
                <SidebarMenuItem key={folder}>
                  <SidebarMenuButton tooltip={folder}>
                    <FolderOpen />
                    <span>{folder}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={text.sidebar.settings}>
              <Settings />
              <span>{text.sidebar.settings}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function StatusLabel({
  locale,
  status
}: {
  locale: LanguageMode
  status: keyof (typeof uiText)['zh']['sidebar']['statuses']
}): React.JSX.Element {
  const text = uiText[locale]
  const tone =
    status === '已入库'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
      : status === '待转换'
        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'

  return (
    <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>
      {text.sidebar.statuses[status]}
    </span>
  )
}

export default App
