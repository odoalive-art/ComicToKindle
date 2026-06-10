import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Clock3,
  FolderOpen,
  Grid2X2,
  HardDrive,
  Inbox,
  Library,
  List,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Upload
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type NavItem = {
  title: string
  icon: LucideIcon
  active?: boolean
  badge?: string
}

type Comic = {
  title: string
  author: string
  format: string
  pages: number
  status: string
  updatedAt: string
}

const primaryNav: NavItem[] = [
  { title: '漫画库', icon: Library, active: true, badge: '128' },
  { title: '导入收件箱', icon: Inbox, badge: '6' },
  { title: '转换队列', icon: BookOpenCheck, badge: '2' },
  { title: '投递记录', icon: Send },
  { title: '归档', icon: Archive }
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
    updatedAt: '今天'
  },
  {
    title: '海岸线物语 合集',
    author: '未填写',
    format: '文件夹',
    pages: 412,
    status: '待整理',
    updatedAt: '昨天'
  },
  {
    title: '机器猫短篇精选',
    author: '示例作者',
    format: 'PDF',
    pages: 96,
    status: '待转换',
    updatedAt: '本周'
  },
  {
    title: '城市猎人 Vol. 02',
    author: '未填写',
    format: 'CBR',
    pages: 204,
    status: '已入库',
    updatedAt: '6 月'
  }
]

const folders = ['全部漫画', '最近导入', '待整理', 'Kindle 预备区']

function App(): React.JSX.Element {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger className="md:hidden" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold">漫画库</h1>
              <p className="truncate text-xs text-muted-foreground">
                本地收藏、整理状态和转换准备区的工作台框架
              </p>
            </div>
            <div className="hidden min-w-64 items-center gap-2 rounded-md border bg-background px-3 md:flex">
              <Search className="size-4 text-muted-foreground" />
              <Input
                aria-label="搜索漫画"
                className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                placeholder="搜索标题、作者或格式"
              />
            </div>
            <Button variant="outline" size="sm">
              <SlidersHorizontal />
              筛选
            </Button>
            <Button size="sm">
              <Plus />
              添加
            </Button>
          </header>

          <ScrollArea className="h-[calc(100dvh-3.5rem)]">
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
                          <TabsTrigger value="recent">最近</TabsTrigger>
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

                <aside className="flex min-w-0 flex-col gap-5">
                  <Card className="gap-4 rounded-lg py-4 shadow-none">
                    <CardHeader className="px-4">
                      <CardTitle className="text-base">整理面板</CardTitle>
                      <CardDescription>后续用于承载元数据、封面、标签和批处理。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4">
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="text-sm font-medium">当前选中</div>
                        <div className="mt-1 text-sm text-muted-foreground">深夜书店 01</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Upload />
                          导入
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookOpenCheck />
                          准备
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gap-4 rounded-lg py-4 shadow-none">
                    <CardHeader className="px-4">
                      <CardTitle className="text-base">库分组</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4">
                      <div className="space-y-1">
                        {folders.map((folder) => (
                          <button
                            key={folder}
                            className="flex h-9 w-full items-center justify-between rounded-md px-2 text-sm hover:bg-muted"
                            type="button"
                          >
                            <span>{folder}</span>
                            <span className="text-xs text-muted-foreground">占位</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </section>
            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar(): React.JSX.Element {
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
                  <SidebarMenuButton isActive={item.active} tooltip={item.title}>
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
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === '待转换'
        ? 'border-sky-200 bg-sky-50 text-sky-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'

  return <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>{status}</span>
}

export default App
