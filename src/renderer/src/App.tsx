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
  CircleFadingArrowUp,
  Clock3,
  Component,
  ExternalLink,
  FileText,
  Info,
  FolderOpen,
  GitBranch,
  Grid2X2,
  HardDrive,
  Inbox,
  Library,
  List,
  Loader2,
  Moon,
  MoreHorizontal,
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
  Type
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import { designTokens } from '@/data/design-tokens'
import {
  installedShadcnComponentSlugs,
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
  status: string
  updatedAt: string
}

type ThemeMode = 'light' | 'dark'

const primaryNav: NavItem[] = [
  { id: 'library', title: '漫画库', icon: Library, badge: '128' },
  { id: 'design-components', title: '设计组件', icon: Component, badge: '59' },
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

const folders = ['全部漫画', '新导入', '待整理', 'Kindle 预备区']

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

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ViewId>('library')
  const [componentSearch, setComponentSearch] = useState('')
  const [selectedComponentSlug, setSelectedComponentSlug] = useState('button')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
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

      return (
        item.name.toLowerCase().includes(query) ||
        item.slug.includes(query) ||
        doc?.description.toLowerCase().includes(query)
      )
    })
  }, [componentSearch])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', themeMode === 'dark')
    root.style.colorScheme = themeMode
    window.localStorage.setItem('comic-to-kindle-theme', themeMode)
  }, [themeMode])

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full bg-background text-foreground">
        <AppSidebar activeView={activeView} onSelect={setActiveView} />
        <SidebarInset className="flex min-w-0 flex-col overflow-hidden">
          <header className="flex min-h-14 shrink-0 items-center gap-3 border-b bg-background px-4 py-2">
            <SidebarTrigger className="md:hidden" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold">{activeNavItem.title}</h1>
              {isComponentView ? (
                <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden text-xs text-muted-foreground">
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
                    官方页面
                    <ExternalLink className="size-3" />
                  </a>
                  <ShadcnSourceDialog
                    selectedPath={mirroredShadcnDocs[selectedComponentSlug]?.sourcePath}
                  />
                </div>
              ) : isFoundationView ? (
                <p className="truncate text-xs text-muted-foreground">
                  颜色、字体、字号、间距与基础界面节奏
                </p>
              ) : (
                <p className="truncate text-xs text-muted-foreground">
                  本地收藏、整理状态和转换准备区的工作台框架
                </p>
              )}
            </div>
            {!isFoundationView ? (
              <div className="hidden min-w-64 items-center gap-2 rounded-md border bg-background px-3 md:flex">
                <Search className="size-4 text-muted-foreground" />
                {isComponentView ? (
                  <Input
                    aria-label="搜索设计组件"
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    onChange={(event) => setComponentSearch(event.target.value)}
                    placeholder="搜索组件名或 slug"
                    value={componentSearch}
                  />
                ) : (
                  <Input
                    aria-label="搜索漫画"
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    placeholder="搜索标题、作者或格式"
                  />
                )}
              </div>
            ) : null}
            <Button
              aria-label={themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              onClick={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
              size="icon-sm"
              title="深浅模式"
              variant="outline"
            >
              {themeMode === 'dark' ? <Sun /> : <Moon />}
              <span className="sr-only">深浅模式</span>
            </Button>
            {isComponentView ? (
              <a
                className="hidden h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
                href="https://ui.shadcn.com/docs/components"
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                官方文档
              </a>
            ) : isFoundationView ? null : (
              <>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  筛选
                </Button>
                <Button size="sm">
                  <Plus />
                  添加
                </Button>
              </>
            )}
          </header>

          {isComponentView ? (
            <DesignComponentsView
              components={filteredDesignComponents}
              onSelect={setSelectedComponentSlug}
              query={componentSearch}
              selectedSlug={selectedComponentSlug}
            />
          ) : isFoundationView ? (
            <ScrollArea className="min-h-0 flex-1">
              <FoundationStandardsView />
            </ScrollArea>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <LibraryView />
            </ScrollArea>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function LibraryView(): React.JSX.Element {
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
              <CardTitle className="text-base">本地漫画</CardTitle>
              <CardDescription>第一版只展示库视图、整理状态和占位操作。</CardDescription>
            </div>
            <CardAction className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="icon-sm" aria-label="网格视图">
                <Grid2X2 />
              </Button>
              <Button variant="secondary" size="icon-sm" aria-label="列表视图">
                <List />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs defaultValue="all" className="min-w-0">
                <TabsList className="w-full sm:w-fit">
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="recent">新导入</TabsTrigger>
                  <TabsTrigger value="todo">待整理</TabsTrigger>
                  <TabsTrigger value="kindle">Kindle</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    aria-label="移动端搜索漫画"
                    className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    placeholder="搜索漫画"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[42%] px-4">标题</TableHead>
                    <TableHead>格式</TableHead>
                    <TableHead className="hidden md:table-cell">页数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="hidden text-right md:table-cell">更新</TableHead>
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
                        <StatusLabel status={comic.status} />
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

function FoundationStandardsView(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 lg:p-6">
      <header className="border-b pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold">基础规范</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              本页沉淀当前 renderer 的基础设计 token 和界面节奏，开发阶段用于快速选取颜色、字体、字号和间距。
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
          label="颜色"
          value={`${designTokens.colors.length} 个 token`}
          note="使用语义 token，不直接散落硬编码色值。"
        />
        <FoundationSummaryCard
          icon={Type}
          label="字体"
          value={designTokens.font.name}
          note="优先系统可读性，保持工作台界面克制。"
        />
        <FoundationSummaryCard
          icon={Rows3}
          label="字号"
          value={`${designTokens.typeScale.length} 个层级`}
          note="内容面板避免使用超大展示字。"
        />
        <FoundationSummaryCard
          icon={Ruler}
          label="间距"
          value={`${designTokens.spacing[0].value} 基线`}
          note="以 Tailwind spacing scale 组织密度。"
        />
        <FoundationSummaryCard
          icon={Ruler}
          label="圆角"
          value="0.5rem 基准"
          note="沿用 shadcn radius token。"
        />
        <FoundationSummaryCard
          icon={Grid2X2}
          label="布局"
          value={`${designTokens.layout.length} 条规则`}
          note="页面边距、最大宽度和关键分栏。"
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
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.token}
                      </code>
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
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.token}
                      </code>
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
  onSelect,
  query,
  selectedSlug
}: {
  components: ShadcnComponent[]
  onSelect: (slug: string) => void
  query: string
  selectedSlug: string
}): React.JSX.Element {
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
                {components.length} / {shadcnComponents.length} 个组件
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
              没有找到匹配 “{query}” 的组件。
            </CardContent>
          </Card>
        ) : null}
      </aside>

      <aside className="hidden min-h-0 min-w-0 overflow-hidden lg:block">
        <Card className="flex h-full min-h-0 gap-0 rounded-lg py-0 shadow-none">
          <CardHeader className="border-b px-4 py-4">
            <CardTitle className="text-base">Components</CardTitle>
            <CardDescription>
              {components.length} / {shadcnComponents.length} 个组件
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
                        {mirrored ? '已镜像' : '待镜像'}
                        {installed ? ' · 已安装' : ''}
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
              没有找到匹配 “{query}” 的组件。
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
                  <p className="mt-2 text-sm text-muted-foreground">{selectedDoc.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                    {installedShadcnComponentSlugs.has(selectedDoc.slug) ? '已安装' : '未安装'}
                  </span>
                  <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                    已镜像
                  </span>
                </div>
              </div>
            </header>
            <div className="space-y-8">
              {selectedDoc.sections.map((section) => (
                <section className="scroll-mt-20 space-y-3" id={section.title} key={section.title}>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <div className="space-y-3">
                    {section.blocks.map((block, index) => (
                      <ShadcnDocBlockView block={block} key={`${section.title}-${index}`} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <header className="border-b pb-5">
              <h2 className="text-2xl font-semibold">{selectedComponent.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">这个组件还没有导入本地镜像数据。</p>
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
                打开官方文档
              </a>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}

function ShadcnSourceDialog({ selectedPath }: { selectedPath?: string }): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <Info className="size-3" />
          来源详情
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>本地镜像</DialogTitle>
          <DialogDescription>当前本地文档镜像使用的官方源码信息。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium">来源仓库</div>
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
              <div className="font-medium">当前页面源文件</div>
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

function ShadcnDocBlockView({ block }: { block: ShadcnDocBlock }): React.JSX.Element {
  if (block.type === 'paragraph') {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        <InlineDocText text={block.text} />
      </p>
    )
  }

  if (block.type === 'code' || block.type === 'composition') {
    const language = block.type === 'composition' ? 'text' : block.language

    return (
      <div className="overflow-hidden rounded-lg border bg-muted/40">
        {block.type === 'code' && block.title ? (
          <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
            <InlineDocText text={block.title} />
          </div>
        ) : null}
        <pre className="overflow-x-auto p-3 text-xs leading-5">
          <code data-language={language}>{block.code}</code>
        </pre>
      </div>
    )
  }

  if (block.type === 'preview') {
    return (
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="border-b px-3 py-2">
          <div className="text-sm font-medium">
            <InlineDocText text={block.description ?? block.name} />
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            ComponentPreview · {block.name}
            {block.direction ? ` · ${block.direction}` : ''}
          </div>
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
          <li className="flex gap-3 text-sm text-muted-foreground" key={item}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-xs text-foreground">
              {index + 1}
            </span>
            <span className="pt-0.5">{item}</span>
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
                <TableHead key={column}>{column}</TableHead>
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
        {block.label}
      </a>
    )
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
      {block.text}
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

function ShadcnComponentPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  if (name.startsWith('button') || name === 'spinner-button') {
    return <ButtonPreview name={name} direction={direction} />
  }

  if (name.startsWith('dialog')) {
    return <DialogPreview name={name} direction={direction} />
  }

  if (name.startsWith('table')) {
    return <TablePreview name={name} direction={direction} />
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

function AppSidebar({
  activeView,
  onSelect
}: {
  activeView: ViewId
  onSelect: (view: ViewId) => void
}): React.JSX.Element {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="ComicToKindle">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">ComicToKindle</div>
                <div className="truncate text-xs text-sidebar-foreground/60">本地漫画工作台</div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>工作区</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.id === activeView}
                    onClick={() => onSelect(item.id)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>库目录</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
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
            <SidebarMenuButton tooltip="设置">
              <Settings />
              <span>设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function StatusLabel({ status }: { status: string }): React.JSX.Element {
  const tone =
    status === '已入库'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
      : status === '待转换'
        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'

  return <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>{status}</span>
}

export default App
