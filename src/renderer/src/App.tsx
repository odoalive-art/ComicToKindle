import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Calendar as CalendarIcon,
  Calculator,
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
  Loader2,
  Moon,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Rows3,
  Ruler,
  BookText,
  Search,
  Send,
  Settings,
  Sun,
  SwatchBook,
  Terminal,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Slash,
  Type,
  Globe,
  Mail,
  Stethoscope,
  FolderPlus,
  ImageOff,
  RefreshCw,
  BookUp,
  FileDown,
  Trash2,
  ListChecks,
  RotateCcw,
  X,
  CheckSquare
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TrafficLights } from '@/components/ui/traffic-lights'
import {
  Card,
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
import { Textarea } from '@/components/ui/textarea'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea
} from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent
} from '@/components/ui/menubar'
import { NativeSelect } from '@/components/ui/native-select'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/spinner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
  SidebarTrigger,
  useSidebar
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList
} from '@/components/ui/combobox'
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
  | 'add-library'
  | 'convert-settings'
  | 'web-push'
  | 'devices-emails'
  | 'system-doctor'
  | 'queue'
  | 'design-components'
  | 'foundation-standards'
  | 'app-components'
  | 'inbox'
  | 'deliveries'
  | 'archive'

type ThemeMode = 'light' | 'dark'
type LanguageMode = 'zh' | 'en'

const uiText = {
  zh: {
    nav: {
      library: '所有漫画',
      'add-library': '添加资源库',
      'convert-settings': '转换设置',
      'web-push': '网页推送',
      'devices-emails': '设备与邮箱',
      'system-doctor': '系统环境医生',
      queue: '任务队列',
      'design-components': 'Shadcn 组件',
      'foundation-standards': '基础规范',
      'app-components': '设计组件',
      inbox: '导入收件箱',
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
      chooseFolder: '选择漫画库文件夹',
      changeFolder: '切换文件夹',
      rescan: '重新扫描',
      emptyTitle: '还没有选择漫画库',
      emptyDescription: '选择一个包含「部 / 卷册」结构的本地文件夹，开始浏览你的漫画。',
      loading: '正在扫描漫画库…',
      noSeries: '这个文件夹里没有找到漫画作品。',
      noVolumes: '这个作品下没有可识别的卷册。',
      unknownAuthor: '未知作者',
      fileVolume: '单文件',
      volumeUnit: (n: number) => `${n} 卷`,
      pageUnit: (n: number) => `${n} 页`
    },
    convert: {
      action: '转换为 Kindle',
      converted: '已转换',
      converting: '转换中…',
      start: (title: string) => `开始转换：${title}`,
      done: (title: string) => `转换完成：${title}`,
      failed: (title: string) => `转换失败：${title}`,
      progress: (pct: number) => `转换中 ${pct}%`
    },
    activity: {
      trigger: '转换活动',
      title: '转换活动',
      active: '进行中',
      completed: '最近完成',
      queued: '排队中',
      converting: '转换中',
      failed: '失败',
      empty: '暂无转换活动。在漫画库里点卷册的「转换为 Kindle」即可开始。',
      retry: '重试',
      dismiss: '移除',
      cancel: '取消',
      clearAll: '清空',
      viewAll: '查看全部归档',
      enqueued: (n: number) => `已加入 ${n} 卷到转换队列`,
      nothingToQueue: '没有可加入队列的卷',
      select: '选择',
      selectExit: '退出选择',
      selectedCount: (n: number) => `已选 ${n} 本`,
      selectAll: '全选',
      selectNone: '取消全选',
      convertSelected: (n: number) => `转换所选（${n}）`
    },
    archiveView: {
      title: '归档',
      description: '已转换的 Kindle 产物，可在 Finder 中查看、导出副本或删除。',
      empty: '还没有任何转换产物。在漫画库里选择一卷开始转换。',
      reveal: '在 Finder 中显示',
      export: '导出副本',
      remove: '删除',
      removed: '已删除产物',
      exported: '已导出副本',
      statusReady: '待投递',
      statusDelivered: '已投递',
      statusFailed: '失败',
      volumeFiles: (n: number) => `${n} 个文件`,
      pages: (n: number) => `${n} 页`,
      deliver: '投递到 Kindle',
      delivering: '投递中…',
      delivered: (title: string) => `已投递：${title}`,
      deliverFailed: (title: string) => `投递失败：${title}`,
      notConfigured: '尚未配置投递，请先到「设备与邮箱」填写 SMTP 和 Kindle 邮箱。'
    },
    convertSettings: {
      title: '转换设置',
      description: '调整转换为 Kindle EPUB 时的默认参数。保存后对之后的每次转换生效。',
      deviceProfile: '设备档位',
      deviceProfileNote: '决定页面缩放的目标分辨率，按你的 Kindle 机型选择。',
      profiles: {
        pw6: 'Paperwhite 6 / Oasis（1264×1680）',
        ko3: 'Kindle Oasis 3（1264×1680）',
        pw5: 'Paperwhite 5（1236×1648）',
        pw3: 'Paperwhite 3（1072×1448）',
        scribe: 'Scribe（1860×2480）',
        original: '保持原始分辨率'
      },
      mangaMode: '日漫方向（从右往左）',
      mangaModeNote: '关闭则按从左往右翻页（适合美式/条漫）。',
      grayscale: '灰度化',
      grayscaleNote: '转为黑白可显著减小体积；封面页始终保留彩色。',
      splitDoublePages: '拆分双页',
      splitDoublePagesNote: '把横向跨页切成左右两页，单页阅读更清晰。',
      imageQuality: '图片质量',
      imageQualityNote: '越高越清晰、体积越大（45–100）。',
      maxVolumeSize: '单卷体积上限（MB）',
      maxVolumeSizeNote: '超过则自动拆成多个 EPUB；邮箱投递通常限制 ~50MB。',
      save: '保存',
      saved: '已保存转换设置',
      reset: '恢复默认'
    },
    delivery: {
      title: '设备与邮箱',
      description: '配置 SMTP 发件服务器和 Kindle 推送邮箱，用于把转换产物发送到 Kindle。',
      smtpHost: 'SMTP 主机',
      smtpHostPlaceholder: 'smtp.example.com',
      smtpPort: '端口',
      smtpUser: '发件邮箱 / 账号',
      smtpPass: '密码 / 授权码',
      smtpPassSaved: '已保存（留空则不修改）',
      smtpPassPlaceholder: '应用专用密码或授权码',
      kindleEmail: 'Kindle 推送邮箱',
      kindleEmailPlaceholder: 'your_kindle@kindle.com',
      save: '保存',
      saved: '已保存配置',
      test: '测试连接',
      testing: '测试中…',
      testSuccess: 'SMTP 连接成功！',
      note: '提示：多数邮箱需用「应用专用密码 / 授权码」而非登录密码；并把发件邮箱加入亚马逊「已认可的发件人」白名单。密码经系统钥匙串加密存储，不会明文落盘。',
      errors: {
        'missing-fields': '请先填写 SMTP 主机、账号和密码。',
        'auth-failed':
          '登录失败：账号或密码不正确。QQ / 163 / Gmail 等邮箱需在邮箱设置里开启 SMTP 服务，并使用「授权码 / 应用专用密码」，而不是登录密码。',
        'connection-failed': '无法连接 SMTP 服务器，请检查主机和端口是否正确。',
        'not-configured': '尚未配置投递，请先在「设备与邮箱」填写 SMTP 和 Kindle 邮箱。',
        'not-found': '找不到该产物。',
        unknown: '操作失败'
      } as Record<string, string>
    },
    reader: {
      back: '返回',
      pageOf: (cur: number, total: number) => `${cur} / ${total}`,
      loadingPages: '正在加载页面…',
      emptyVolume: '这一卷里没有可显示的页面。',
      prev: '上一页',
      next: '下一页',
      toggleDirection: '阅读方向',
      directionLtr: '从左往右',
      directionRtl: '从右往左',
      toggleMode: '阅读模式',
      modeSingle: '单页',
      modeDouble: '双页',
      resume: '继续'
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
      groupMyLibrary: '我的书库',
      groupKindleSend: 'Kindle 推送',
      groupDevMode: '开发模式',
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
      library: 'All Manga',
      'add-library': 'Add Library',
      'convert-settings': 'Conversion',
      'web-push': 'Web Push',
      'devices-emails': 'Devices & Emails',
      'system-doctor': 'System Doctor',
      queue: 'Task Queue',
      'design-components': 'Shadcn Components',
      'foundation-standards': 'Foundations',
      'app-components': 'App Components',
      inbox: 'Inbox',
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
      chooseFolder: 'Choose library folder',
      changeFolder: 'Change folder',
      rescan: 'Rescan',
      emptyTitle: 'No library selected yet',
      emptyDescription:
        'Pick a local folder organized as Series / Volumes to start browsing your comics.',
      loading: 'Scanning library…',
      noSeries: 'No comic series found in this folder.',
      noVolumes: 'No recognizable volumes under this series.',
      unknownAuthor: 'Unknown author',
      fileVolume: 'Single file',
      volumeUnit: (n: number) => `${n} vol${n === 1 ? '' : 's'}`,
      pageUnit: (n: number) => `${n} page${n === 1 ? '' : 's'}`
    },
    convert: {
      action: 'Convert for Kindle',
      converted: 'Converted',
      converting: 'Converting…',
      start: (title: string) => `Converting: ${title}`,
      done: (title: string) => `Converted: ${title}`,
      failed: (title: string) => `Conversion failed: ${title}`,
      progress: (pct: number) => `Converting ${pct}%`
    },
    activity: {
      trigger: 'Conversion activity',
      title: 'Conversion activity',
      active: 'In progress',
      completed: 'Recently completed',
      queued: 'Queued',
      converting: 'Converting',
      failed: 'Failed',
      empty: 'No conversion activity yet. Hit “Convert for Kindle” on a volume to start.',
      retry: 'Retry',
      dismiss: 'Dismiss',
      cancel: 'Cancel',
      clearAll: 'Clear all',
      viewAll: 'View full archive',
      enqueued: (n: number) => `Queued ${n} volume${n === 1 ? '' : 's'} for conversion`,
      nothingToQueue: 'Nothing to queue',
      select: 'Select',
      selectExit: 'Exit selection',
      selectedCount: (n: number) => `${n} selected`,
      selectAll: 'Select all',
      selectNone: 'Deselect all',
      convertSelected: (n: number) => `Convert selected (${n})`
    },
    archiveView: {
      title: 'Archive',
      description: 'Converted Kindle artifacts. Reveal in Finder, export a copy, or delete.',
      empty: 'No converted artifacts yet. Pick a volume in the library to start converting.',
      reveal: 'Reveal in Finder',
      export: 'Export copy',
      remove: 'Delete',
      removed: 'Artifact deleted',
      exported: 'Copy exported',
      statusReady: 'Ready',
      statusDelivered: 'Delivered',
      statusFailed: 'Failed',
      volumeFiles: (n: number) => `${n} file${n === 1 ? '' : 's'}`,
      pages: (n: number) => `${n} page${n === 1 ? '' : 's'}`,
      deliver: 'Send to Kindle',
      delivering: 'Sending…',
      delivered: (title: string) => `Sent: ${title}`,
      deliverFailed: (title: string) => `Send failed: ${title}`,
      notConfigured:
        'Delivery not configured. Set up SMTP and your Kindle email in Devices & Emails first.'
    },
    convertSettings: {
      title: 'Conversion',
      description:
        'Adjust the default parameters used when converting to Kindle EPUB. Saved settings apply to every conversion afterwards.',
      deviceProfile: 'Device profile',
      deviceProfileNote: 'Target resolution for page scaling — pick your Kindle model.',
      profiles: {
        pw6: 'Paperwhite 6 / Oasis (1264×1680)',
        ko3: 'Kindle Oasis 3 (1264×1680)',
        pw5: 'Paperwhite 5 (1236×1648)',
        pw3: 'Paperwhite 3 (1072×1448)',
        scribe: 'Scribe (1860×2480)',
        original: 'Keep original resolution'
      },
      mangaMode: 'Manga direction (right to left)',
      mangaModeNote: 'Turn off for left-to-right paging (Western comics / webtoons).',
      grayscale: 'Grayscale',
      grayscaleNote: 'Black & white greatly reduces size; the cover stays in color.',
      splitDoublePages: 'Split double pages',
      splitDoublePagesNote:
        'Cut wide spreads into left/right pages for clearer single-page reading.',
      imageQuality: 'Image quality',
      imageQualityNote: 'Higher is sharper but larger (45–100).',
      maxVolumeSize: 'Max volume size (MB)',
      maxVolumeSizeNote:
        'Auto-split into multiple EPUBs above this; email delivery usually caps ~50MB.',
      save: 'Save',
      saved: 'Conversion settings saved',
      reset: 'Reset to defaults'
    },
    delivery: {
      title: 'Devices & Emails',
      description: 'Configure your SMTP server and Kindle email to send converted files to Kindle.',
      smtpHost: 'SMTP host',
      smtpHostPlaceholder: 'smtp.example.com',
      smtpPort: 'Port',
      smtpUser: 'Sender email / username',
      smtpPass: 'Password / app token',
      smtpPassSaved: 'Saved (leave blank to keep)',
      smtpPassPlaceholder: 'App-specific password or token',
      kindleEmail: 'Kindle email',
      kindleEmailPlaceholder: 'your_kindle@kindle.com',
      save: 'Save',
      saved: 'Configuration saved',
      test: 'Test connection',
      testing: 'Testing…',
      testSuccess: 'SMTP connection succeeded!',
      note: 'Tip: most providers require an app-specific password / token rather than your login password, and you must add the sender address to Amazon’s approved sender list. The password is encrypted via the system keychain and never stored in plaintext.',
      errors: {
        'missing-fields': 'Please fill in SMTP host, username, and password first.',
        'auth-failed':
          'Login failed: incorrect username or password. Providers like QQ / 163 / Gmail require enabling SMTP and using an app-specific password / token rather than your login password.',
        'connection-failed': 'Cannot reach the SMTP server. Check the host and port.',
        'not-configured':
          'Delivery not configured. Set up SMTP and your Kindle email in Devices & Emails first.',
        'not-found': 'Artifact not found.',
        unknown: 'Operation failed'
      } as Record<string, string>
    },
    reader: {
      back: 'Back',
      pageOf: (cur: number, total: number) => `${cur} / ${total}`,
      loadingPages: 'Loading pages…',
      emptyVolume: 'No pages to show in this volume.',
      prev: 'Previous page',
      next: 'Next page',
      toggleDirection: 'Reading direction',
      directionLtr: 'Left to right',
      directionRtl: 'Right to left',
      toggleMode: 'Reading mode',
      modeSingle: 'Single page',
      modeDouble: 'Double page',
      resume: 'Resume'
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
      groupMyLibrary: 'My Library',
      groupKindleSend: 'Kindle Send',
      groupDevMode: 'Developer Mode',
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
  { id: 'add-library', title: '添加资源库', icon: FolderPlus },
  { id: 'web-push', title: '网页推送', icon: Globe },
  { id: 'devices-emails', title: '设备与邮箱', icon: Mail },
  { id: 'system-doctor', title: '系统环境医生', icon: Stethoscope },
  { id: 'queue', title: '任务队列', icon: BookOpenCheck, badge: '2' },
  { id: 'design-components', title: 'Shadcn 组件', icon: Component, badge: '59' },
  { id: 'foundation-standards', title: '基础规范', icon: SwatchBook },
  { id: 'app-components', title: '应用组件', icon: Package, badge: '15' },
  { id: 'inbox', title: '导入收件箱', icon: Inbox, badge: '6' },
  { id: 'deliveries', title: '投递记录', icon: Send },
  { id: 'archive', title: '归档', icon: Archive }
]

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
    items: [
      { id: 'library', icon: Library, badge: '128' },
      { id: 'add-library', icon: FolderPlus }
    ]
  },
  {
    titleKey: 'groupKindleSend',
    items: [
      { id: 'archive', icon: Archive },
      { id: 'convert-settings', icon: Settings },
      { id: 'web-push', icon: Globe },
      { id: 'devices-emails', icon: Mail },
      { id: 'system-doctor', icon: Stethoscope },
      { id: 'queue', icon: BookOpenCheck, badge: '2' }
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
  const matchedComponent = [...shadcnComponents]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((component) => name === component.slug || name.startsWith(`${component.slug}-`))

  if (matchedComponent) {
    const suffix =
      name === matchedComponent.slug ? '' : name.slice(matchedComponent.slug.length + 1)

    if (!suffix || suffix === 'demo') {
      return matchedComponent.name
    }

    return suffix
      .split('-')
      .filter((part) => part !== 'demo')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  return name
    .split('-')
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
  const [componentSearch] = useState('')
  const [appComponentSearch] = useState('')
  const [selectedComponentSlug, setSelectedComponentSlug] = useState('button')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(getInitialLanguageMode)
  // 转换活动队列上提到 App 层，切换视图时不中断
  const convertActivity = useConvertActivity(languageMode)
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
          ) : (
            <>
              <AppHeader
                languageMode={languageMode}
                activeNavItemId={activeNavItem.id}
                isComponentView={isComponentView}
                selectedComponentSlug={selectedComponentSlug}
              />

              {isComponentView || activeView === 'app-components' ? (
                <DesignComponentsView
                  components={
                    activeView === 'app-components'
                      ? filteredAppComponents
                      : filteredDesignComponents
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
              ) : activeView === 'archive' ? (
                <ArchiveView locale={languageMode} />
              ) : activeView === 'devices-emails' ? (
                <DeliverySettingsView locale={languageMode} />
              ) : activeView === 'convert-settings' ? (
                <ConvertSettingsView locale={languageMode} />
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
  isComponentView: boolean
  selectedComponentSlug: string
}

function AppHeader({
  languageMode,
  activeNavItemId,
  isComponentView,
  selectedComponentSlug
}: AppHeaderProps): React.JSX.Element {
  const text = uiText[languageMode]

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{text.nav[activeNavItemId]}</span>
      </div>

      {isComponentView ? (
        <div
          className="ml-auto flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <a
            aria-label={text.header.officialDocs}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-medium whitespace-nowrap shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            href={
              mirroredShadcnDocs[selectedComponentSlug]?.officialUrl ??
              `https://ui.shadcn.com/docs/components/radix/${selectedComponentSlug}`
            }
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
          </a>
          <ShadcnSourceDialog
            locale={languageMode}
            selectedPath={mirroredShadcnDocs[selectedComponentSlug]?.sourcePath}
          />
        </div>
      ) : null}
    </header>
  )
}

// 来自 preload 的 window.api.library 返回类型（单一事实来源：src/preload/index.d.ts）
type LibrarySeries = Awaited<ReturnType<Window['api']['library']['scan']>>[number]
type LibraryVolume = Awaited<ReturnType<Window['api']['library']['listVolumes']>>[number]
type Artifact = Awaited<ReturnType<Window['api']['artifacts']['list']>>[number]

function CoverImage({ src, alt }: { src: string | null; alt: string }): React.JSX.Element {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-7" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  )
}

const LIBRARY_GRID =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

// ---------- 阅读偏好与进度（持久化于 localStorage） ----------
type ReadingDirection = 'ltr' | 'rtl'
type ReadingMode = 'single' | 'double'

const READING_DIR_KEY = 'comic-to-kindle-reading-direction'
const READING_MODE_KEY = 'comic-to-kindle-reading-mode'
const READING_PROGRESS_KEY = 'comic-to-kindle-reading-progress'

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
type ConvertJobStatus = 'queued' | 'converting' | 'failed'
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
        options: loadConvertOptions()
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

  // 清空：取消进行中的那卷 + 清掉全部排队/失败
  const clearAll = React.useCallback(() => {
    setJobs((prev) => {
      prev.forEach((j) => {
        cancelledIdsRef.current.add(j.id)
        if (j.status === 'converting') void window.api.convert.cancel(j.sourceVolumePath)
      })
      return []
    })
  }, [])

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

  return {
    jobs,
    artifacts,
    activeCount,
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

  const active = activity.jobs
  const completed = activity.artifacts.slice(0, 8)
  const hasAny = active.length > 0 || activity.artifacts.length > 0

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
              ) : (
                <ListChecks className="size-4" />
              )}
              {activity.activeCount > 0 ? (
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none text-primary-foreground">
                  {activity.activeCount}
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
          {activity.activeCount > 0 ? (
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
                            className={`text-xs ${j.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}`}
                          >
                            {j.status === 'converting'
                              ? `${Math.max(0, j.percent)}%`
                              : j.status === 'queued'
                                ? t.queued
                                : t.failed}
                          </span>
                          {j.status === 'failed' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              title={t.retry}
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
  const [root, setRoot] = useState<string | null>(null)
  const [series, setSeries] = useState<LibrarySeries[]>([])
  const [selected, setSelected] = useState<LibrarySeries | null>(null)
  const [volumes, setVolumes] = useState<LibraryVolume[]>([])
  const [readingVolume, setReadingVolume] = useState<LibraryVolume | null>(null)
  const [loading, setLoading] = useState(false)
  // 多选模式：先勾选若干卷再批量转换（替代「转换整部」入口）
  const [selectMode, setSelectMode] = useState(false)
  const [selectedVols, setSelectedVols] = useState<Set<string>>(new Set())
  // 转换活动（队列 + 产物 + 进度）由 App 层 hook 提供，跨视图保活
  const { convertedPaths, jobByPath, enqueue } = activity

  const enqueueVolume = (vol: LibraryVolume): void => {
    if (!selected) return
    enqueue({
      sourceVolumePath: vol.path,
      seriesPathName: selected.name,
      seriesTitle: selected.title,
      volumeTitle: vol.title,
      author: selected.author
    })
  }

  const exitSelect = (): void => {
    setSelectMode(false)
    setSelectedVols(new Set())
  }

  const toggleVol = (path: string): void => {
    setSelectedVols((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const allSelected = volumes.length > 0 && selectedVols.size === volumes.length
  const toggleAll = (): void => {
    setSelectedVols(allSelected ? new Set() : new Set(volumes.map((v) => v.path)))
  }

  const convertSelected = (): void => {
    if (!selected || selectedVols.size === 0) return
    const picked = volumes.filter((v) => selectedVols.has(v.path))
    picked.forEach((vol) =>
      enqueue({
        sourceVolumePath: vol.path,
        seriesPathName: selected.name,
        seriesTitle: selected.title,
        volumeTitle: vol.title,
        author: selected.author
      })
    )
    toast.success(text.activity.enqueued(picked.length))
    exitSelect()
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
      setVolumes([])
      await loadSeries(picked)
    } catch (err) {
      toast.error(`${err}`)
    }
  }

  const rescan = async (): Promise<void> => {
    if (root) await loadSeries(root)
  }

  const openSeries = async (item: LibrarySeries): Promise<void> => {
    exitSelect()
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

  const backToSeries = (): void => {
    exitSelect()
    setSelected(null)
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

  // 阅读某一卷：接管整个内容区
  if (readingVolume) {
    return (
      <VolumeReader volume={readingVolume} locale={locale} onClose={() => setReadingVolume(null)} />
    )
  }

  const showVolumes = selected !== null

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/* 合并后的顶栏：侧栏开关 + 标题/面包屑 + 操作 */}
      <header
        className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {selectMode ? (
          <span
            className="min-w-0 flex-1 truncate text-sm font-medium"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {text.activity.selectedCount(selectedVols.size)}
          </span>
        ) : (
          <Breadcrumb
            className="min-w-0 flex-1"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="shrink-0">
                {showVolumes ? (
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={backToSeries}>
                      {text.nav.library}
                    </button>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {text.nav.library}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {showVolumes && selected ? (
                <>
                  <BreadcrumbSeparator className="shrink-0" />
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage
                      className="truncate font-semibold text-foreground"
                      title={selected.title}
                    >
                      {selected.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
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
                <Button size="sm" disabled={selectedVols.size === 0} onClick={convertSelected}>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setSelectMode(true)}>
                        <CheckSquare className="size-4" />
                        <span className="sr-only">{text.activity.select}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{text.activity.select}</TooltipContent>
                  </Tooltip>
                ) : null}
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
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4 lg:p-6">
            {loading ? (
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
                    const isConverted = convertedPaths.has(vol.path)
                    const job = jobByPath.get(vol.path)
                    const picked = selectedVols.has(vol.path)
                    return (
                      <div key={vol.id} className="group flex flex-col gap-2 text-left">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              selectMode ? toggleVol(vol.path) : setReadingVolume(vol)
                            }
                            className="block w-full text-left"
                          >
                            <AspectRatio
                              ratio={3 / 4}
                              className={`overflow-hidden rounded-lg bg-muted transition-all ${
                                selectMode
                                  ? picked
                                    ? 'ring-2 ring-primary'
                                    : 'brightness-[0.7] dark:brightness-[0.82]'
                                  : ''
                              }`}
                            >
                              <CoverImage src={vol.coverUrl} alt={vol.title} />
                              <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                              {(() => {
                                const prog = getProgress(vol.path)
                                if (prog <= 0 || vol.pageCount <= 0) return null
                                const readPct = Math.min(100, ((prog + 1) / vol.pageCount) * 100)
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
                          </button>
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
                          ) : (
                            /* 转换按钮（hover 显示）/ 队列状态 */
                            <div className="absolute top-1.5 right-1.5 flex max-w-[calc(100%-0.75rem)] justify-end">
                              {job ? (
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
                                ) : (
                                  <span className="text-destructive">{text.activity.failed}</span>
                                )}
                              </Badge>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="size-7 bg-background/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      enqueueVolume(vol)
                                    }}
                                  >
                                    <BookUp className="size-3.5" />
                                    <span className="sr-only">{text.convert.action}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{text.convert.action}</TooltipContent>
                              </Tooltip>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium" title={vol.title}>
                            {vol.title}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {(() => {
                              const prog = getProgress(vol.path)
                              if (prog > 0 && vol.pageCount > 0) {
                                return `${text.reader.resume} · ${text.reader.pageOf(prog + 1, vol.pageCount)}`
                              }
                              return vol.kind === 'file'
                                ? text.library.fileVolume
                                : text.library.pageUnit(vol.pageCount)
                            })()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : series.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {text.library.noSeries}
              </p>
            ) : (
              <div className={LIBRARY_GRID}>
                {series.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openSeries(item)}
                    className="group flex flex-col gap-2 text-left"
                  >
                    <div className="group relative">
                      <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg bg-muted">
                        <CoverImage src={item.coverUrl} alt={item.title} />
                        <div className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10" />
                      </AspectRatio>
                      <Badge
                        variant="secondary"
                        className="absolute top-1.5 right-1.5 max-w-[calc(100%-0.75rem)] truncate bg-background/85 backdrop-blur"
                      >
                        {text.library.volumeUnit(item.volumeCount)}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium" title={item.title}>
                        {item.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.author ?? text.library.unknownAuthor}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
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

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-4xl p-4 lg:p-6">
        <p className="mb-4 text-sm text-muted-foreground">{t.description}</p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Archive />
                </EmptyMedia>
                <EmptyTitle>{t.title}</EmptyTitle>
                <EmptyDescription>{t.empty}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
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
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {a.author}
                      </div>
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
        )}
      </div>
    </ScrollArea>
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
        <Alert variant="destructive" className="w-full max-w-xl">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (name === 'alert-action') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Alert className="w-full max-w-xl">
          <Terminal className="size-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components to your app using the cli.</AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm">
              Learn more
            </Button>
            <Button size="sm">Get started</Button>
          </div>
        </Alert>
      </div>
    )
  }

  if (name === 'alert-custom-colors') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Alert className="w-full max-w-xl border-sky-500/50 text-sky-700 dark:border-sky-500 [&>svg]:text-sky-600 dark:text-sky-400 dark:[&>svg]:text-sky-400">
          <Info className="size-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            This alert uses custom border and text color classes to override the default scheme.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // alert-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Alert className="w-full max-w-xl">
        <Terminal className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the cli.</AlertDescription>
      </Alert>
    </div>
  )
}

function AlertDialogPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'alert-dialog-small') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Small dialog
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete file?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (name === 'alert-dialog-media') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Media dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertCircle className="size-8 text-destructive" />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (name === 'alert-dialog-small-media') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Small media
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertCircle className="size-8 text-destructive" />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete file?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (name === 'alert-dialog-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Destructive</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Delete account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (name === 'alert-dialog-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">إظهار الحوار</Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا وإزالة بياناتك من
                خوادمنا.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction>متابعة</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // alert-dialog-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Open alert dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AspectRatioPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const containerClass = 'w-full overflow-hidden rounded-xl border bg-muted/30 p-2 shadow-xs'

  if (name === 'aspect-ratio-square') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className={`${containerClass} max-w-[250px]`}>
          <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"
              alt="Square crop"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </AspectRatio>
        </div>
      </div>
    )
  }

  if (name === 'aspect-ratio-portrait') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className={`${containerClass} max-w-[220px]`}>
          <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop"
              alt="Portrait crop"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </AspectRatio>
        </div>
      </div>
    )
  }

  if (name === 'aspect-ratio-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <div className={`${containerClass} max-w-[400px]`}>
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&auto=format&fit=crop"
              alt="RTL Aspect Ratio"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </AspectRatio>
        </div>
      </div>
    )
  }

  // aspect-ratio-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className={`${containerClass} max-w-[400px]`}>
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&auto=format&fit=crop"
            alt="Unsplash Cover"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </AspectRatio>
      </div>
    </div>
  )
}

function AvatarPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'avatar-badge') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      </div>
    )
  }

  if (name === 'avatar-badge-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
          <AvatarBadge>
            <CheckCircle2 className="size-2.5" />
          </AvatarBadge>
        </Avatar>
      </div>
    )
  }

  if (name === 'avatar-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
              alt="User A"
            />
            <AvatarFallback>UA</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop"
              alt="User B"
            />
            <AvatarFallback>UB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>+2</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </div>
    )
  }

  if (name === 'avatar-group-count') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
              alt="User A"
            />
            <AvatarFallback>UA</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop"
              alt="User B"
            />
            <AvatarFallback>UB</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+42</AvatarGroupCount>
        </AvatarGroup>
      </div>
    )
  }

  if (name === 'avatar-group-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
              alt="User A"
            />
            <AvatarFallback>UA</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <Plus className="size-3" />
            </AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </div>
    )
  }

  if (name === 'avatar-sizes') {
    return (
      <div className="flex min-h-24 items-end justify-center gap-4 p-4" dir={dir}>
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    )
  }

  if (name === 'avatar-dropdown') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'avatar-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-6 p-4" dir="rtl">
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="مستخدم" />
            <AvatarFallback>م</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
              alt="مستخدمة"
            />
            <AvatarFallback>م</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>+3</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </div>
    )
  }

  // avatar-demo (basic)
  return (
    <div className="flex min-h-24 items-center justify-center gap-6 p-4" dir={dir}>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <Avatar>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <Avatar>
          <AvatarImage
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
            alt="User"
          />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
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
        <Badge variant="secondary">Secondary</Badge>
      </div>
    )
  }

  if (name === 'badge-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    )
  }

  if (name === 'badge-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Badge variant="outline">Outline</Badge>
      </div>
    )
  }

  if (name === 'badge-ghost') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Badge variant="ghost">Ghost</Badge>
      </div>
    )
  }

  if (name === 'badge-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3 p-4" dir={dir}>
        <Badge variant="secondary">
          <CheckCircle2 data-icon="inline-start" className="size-3" />
          Verified
        </Badge>
        <Badge variant="outline">
          <BookOpen data-icon="inline-start" className="size-3" />
          Documentation
        </Badge>
      </div>
    )
  }

  if (name === 'badge-spinner') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3 p-4" dir={dir}>
        <Badge variant="secondary">
          <Loader2 data-icon="inline-start" className="size-3 animate-spin" />
          Deleting
        </Badge>
        <Badge variant="outline">
          Generating
          <Loader2 data-icon="inline-end" className="size-3 animate-spin" />
        </Badge>
      </div>
    )
  }

  if (name === 'badge-link') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Badge variant="default" asChild>
          <a href="https://ui.shadcn.com/docs/components/badge" rel="noreferrer" target="_blank">
            Badge Link
            <ArrowUpRight data-icon="inline-end" className="size-3" />
          </a>
        </Badge>
      </div>
    )
  }

  if (name === 'badge-custom-colors') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3 p-4" dir={dir}>
        <Badge className="border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Blue
        </Badge>
        <Badge className="border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Green
        </Badge>
        <Badge className="border-purple-500/50 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          Purple
        </Badge>
      </div>
    )
  }

  if (name === 'badge-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3 p-4" dir="rtl">
        <Badge variant="default">شارة</Badge>
        <Badge variant="secondary">ثانوي</Badge>
        <Badge variant="destructive">مدمر</Badge>
        <Badge variant="outline">مخطط</Badge>
      </div>
    )
  }

  // badge-demo / default
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Badge>Badge</Badge>
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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  if (name === 'breadcrumb-ellipsis') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  if (name === 'breadcrumb-dropdown') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground">
                  Components
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Button</DropdownMenuItem>
                  <DropdownMenuItem>Card</DropdownMenuItem>
                  <DropdownMenuItem>Dialog</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  if (name === 'breadcrumb-link-component') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="#">Home</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="#">Components</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  if (name === 'breadcrumb-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">المكونات</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>التنقل</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  // breadcrumb-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

function ButtonGroupPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'button-group-orientation') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-6 p-4" dir={dir}>
        <ButtonGroup orientation="horizontal">
          <Button variant="outline">Left</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-size') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            Small
          </Button>
          <Button variant="outline" size="sm">
            Small
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">Default</Button>
          <Button variant="outline">Default</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="lg">
            Large
          </Button>
          <Button variant="outline" size="lg">
            Large
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-separator') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ButtonGroup>
          <Button variant="outline">Format</Button>
          <Button variant="outline">Export</Button>
          <ButtonGroupSeparator />
          <Button variant="outline" size="icon" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-split') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ButtonGroup>
          <Button>Save</Button>
          <ButtonGroupSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" aria-label="More options">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save as draft</DropdownMenuItem>
              <DropdownMenuItem>Save and publish</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Schedule</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-input') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ButtonGroup className="w-full max-w-sm">
          <Input
            placeholder="Search..."
            className="flex-1 rounded-r-none border-r-0 shadow-none focus-visible:ring-0"
          />
          <Button variant="outline" className="rounded-l-none">
            Search
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-dropdown-menu') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ButtonGroup>
          <Button variant="outline">Merge</Button>
          <ButtonGroupSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Merge options">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Merge and commit</DropdownMenuItem>
              <DropdownMenuItem>Squash and merge</DropdownMenuItem>
              <DropdownMenuItem>Rebase and merge</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    )
  }

  if (name === 'button-group-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <ButtonGroup>
          <Button variant="outline">يسار</Button>
          <Button variant="outline">وسط</Button>
          <Button variant="outline">يمين</Button>
        </ButtonGroup>
      </div>
    )
  }

  // button-group-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
    </div>
  )
}

function CalendarPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [date, setDate] = useState<Date | undefined>(new Date())

  if (name === 'calendar-range') {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: new Date(),
      to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange as any}
          className="rounded-md border bg-background shadow-xs"
          numberOfMonths={2}
        />
      </div>
    )
  }

  if (name === 'calendar-dropdown') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="rounded-md border bg-background shadow-xs"
        />
      </div>
    )
  }

  if (name === 'calendar-presets') {
    const today = new Date()
    const [presetDate, setPresetDate] = useState<Date | undefined>(today)
    return (
      <div className="flex min-h-24 items-start justify-center gap-4 p-4" dir={dir}>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={() => setPresetDate(new Date())}>
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPresetDate(new Date(Date.now() + 86400000))}
          >
            Tomorrow
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPresetDate(new Date(Date.now() + 3 * 86400000))}
          >
            In 3 days
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={presetDate}
          onSelect={setPresetDate}
          className="rounded-md border bg-background shadow-xs"
        />
      </div>
    )
  }

  if (name === 'calendar-booked-dates') {
    const bookedDates = [
      new Date(new Date().getFullYear(), new Date().getMonth(), 5),
      new Date(new Date().getFullYear(), new Date().getMonth(), 12),
      new Date(new Date().getFullYear(), new Date().getMonth(), 18)
    ]
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{ booked: 'line-through opacity-50' }}
          className="rounded-md border bg-background shadow-xs"
        />
      </div>
    )
  }

  if (name === 'calendar-custom-cells') {
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

function CardPreview({ direction, name }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'card-size') {
    return (
      <div className="flex min-h-24 items-start justify-center gap-4 p-4" dir={dir}>
        <Card className="w-full max-w-xs">
          <CardHeader>
            <CardTitle className="text-base">Small Card</CardTitle>
            <CardDescription>A compact card variant.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Minimal content.</CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Large Card</CardTitle>
            <CardDescription>A wider card variant with more space.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Extended content area with more detail and description text.
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (name === 'card-spacing') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Card className="w-full max-w-sm p-6">
          <CardHeader className="p-0">
            <CardTitle>Compact Spacing</CardTitle>
            <CardDescription>Reduced padding for dense layouts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 text-sm text-muted-foreground">
            This card uses tighter internal spacing.
          </CardContent>
          <CardFooter className="p-0 pt-4">
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (name === 'card-image') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Card className="w-full max-w-sm overflow-hidden">
          <div className="aspect-video w-full">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop"
              alt="Card image"
              className="h-full w-full object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle>Mountain Landscape</CardTitle>
            <CardDescription>Beautiful scenic photography.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Share</Button>
            <Button>View</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (name === 'card-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>إنشاء مشروع</CardTitle>
            <CardDescription>انشر مشروعك الجديد بنقرة واحدة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">معاينة محاكاة تعرض حالة المشروع.</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">إلغاء</Button>
            <Button>نشر</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

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
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'carousel-sizes') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-8 p-8" dir={dir}>
        <Carousel className="w-full max-w-[200px]">
          <CarouselContent>
            {[1, 2, 3].map((n) => (
              <CarouselItem key={n}>
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-4 text-2xl font-semibold">
                    {n}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            {[1, 2, 3, 4].map((n) => (
              <CarouselItem key={n}>
                <Card>
                  <CardContent className="flex aspect-video items-center justify-center p-6 text-3xl font-semibold">
                    {n}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

  if (name === 'carousel-spacing') {
    return (
      <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
        <Carousel className="w-full max-w-xs">
          <CarouselContent className="-ml-4">
            {[1, 2, 3, 4].map((n) => (
              <CarouselItem key={n} className="pl-4">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6 text-4xl font-semibold">
                    {n}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

  if (name === 'carousel-orientation') {
    return (
      <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
        <Carousel className="w-full max-w-xs" orientation="vertical">
          <CarouselContent className="h-[300px]">
            {[1, 2, 3].map((n) => (
              <CarouselItem key={n}>
                <Card>
                  <CardContent className="flex items-center justify-center p-6 text-2xl font-semibold">
                    {n}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

  if (name === 'carousel-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-8" dir="rtl">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {['الأول', 'الثاني', 'الثالث'].map((label, i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6 text-2xl font-semibold">
                    {label}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

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

function ChartPreview({ direction }: { direction?: string }): React.JSX.Element {
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
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'checkbox-description') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms2" />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="terms2" className="text-sm font-medium leading-none">
              Accept terms and conditions
            </label>
            <p className="text-xs text-muted-foreground">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (name === 'checkbox-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-6 p-4" dir={dir}>
        <div className="flex items-center space-x-2">
          <Checkbox id="checked-disabled" checked disabled />
          <label htmlFor="checked-disabled" className="text-sm font-medium text-muted-foreground">
            Checked & disabled
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="unchecked-disabled" disabled />
          <label htmlFor="unchecked-disabled" className="text-sm font-medium text-muted-foreground">
            Unchecked & disabled
          </label>
        </div>
      </div>
    )
  }

  if (name === 'checkbox-group') {
    const [checkedItems, setCheckedItems] = useState<string[]>(['recents'])
    const items = [
      { id: 'recents', label: 'Recents' },
      { id: 'home', label: 'Home' },
      { id: 'applications', label: 'Applications' },
      { id: 'desktop', label: 'Desktop' }
    ]
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={checkedItems.includes(item.id)}
                onCheckedChange={(c) => {
                  if (c) setCheckedItems([...checkedItems, item.id])
                  else setCheckedItems(checkedItems.filter((i) => i !== item.id))
                }}
              />
              <label htmlFor={item.id} className="text-sm font-medium">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (name === 'checkbox-table') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: 'Design System', status: 'Active' },
              { name: 'Components', status: 'Draft' },
              { name: 'Tokens', status: 'Review' }
            ].map((row) => (
              <TableRow key={row.name}>
                <TableCell>
                  <Checkbox aria-label={`Select ${row.name}`} />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (name === 'checkbox-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms-rtl" />
          <label htmlFor="terms-rtl" className="text-sm font-medium">
            أوافق على الشروط والأحكام
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label htmlFor="terms" className="text-sm font-medium leading-none">
          Accept terms and conditions
        </label>
      </div>
    </div>
  )
}

function CollapsiblePreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [isOpen, setIsOpen] = useState(false)

  if (name === 'collapsible-settings-panel') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize the look and feel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Collapsible className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Font</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <ChevronDown className="size-3.5" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2 text-sm text-muted-foreground">
                <p>Geist — The default sans-serif font.</p>
                <p>Geist Mono — Used for code blocks.</p>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Theme</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <ChevronDown className="size-3.5" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="text-sm text-muted-foreground">
                Light and dark mode with system preference detection.
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (name === 'collapsible-file-tree') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[300px] rounded-md border p-3">
          <Collapsible defaultOpen className="space-y-1">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium hover:bg-muted">
                <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                src
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-1 text-sm text-muted-foreground">
              <div className="rounded-sm px-2 py-1 hover:bg-muted">App.tsx</div>
              <div className="rounded-sm px-2 py-1 hover:bg-muted">index.css</div>
              <Collapsible className="space-y-1">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-muted">
                    <ChevronDown className="size-3.5" />
                    components
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1">
                  <div className="rounded-sm px-2 py-1 hover:bg-muted">Button.tsx</div>
                  <div className="rounded-sm px-2 py-1 hover:bg-muted">Card.tsx</div>
                </CollapsibleContent>
              </Collapsible>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    )
  }

  if (name === 'collapsible-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-sm font-semibold">@peduarte أضاف 3 مكتبات</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/primitives</div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

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
        <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/primitives</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">@stitches/react</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function ComboboxPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  const frameworks = [
    { value: 'next.js', label: 'Next.js' },
    { value: 'sveltekit', label: 'SvelteKit' },
    { value: 'nuxt.js', label: 'Nuxt.js' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' }
  ]

  function renderFrameworks() {
    return frameworks.map((fw) => (
      <ComboboxItem key={fw.value} value={fw.value}>
        {fw.label}
      </ComboboxItem>
    ))
  }

  if (name === 'combobox-multiple') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[280px]">
          <Combobox multiple>
            <ComboboxInput placeholder="Select frameworks..." showClear />
            <ComboboxContent>
              <ComboboxList>
                {renderFrameworks()}
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    )
  }

  if (name === 'combobox-clear-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[280px]">
          <Combobox>
            <ComboboxInput placeholder="Search..." showClear />
            <ComboboxContent>
              <ComboboxList>
                {renderFrameworks()}
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    )
  }

  if (name === 'combobox-groups') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[280px]">
          <Combobox>
            <ComboboxInput placeholder="Select an option..." />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxLabel>Frameworks</ComboboxLabel>
                  {frameworks.slice(0, 3).map((fw) => (
                    <ComboboxItem key={fw.value} value={fw.value}>
                      {fw.label}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
                <ComboboxGroup>
                  <ComboboxLabel>Libraries</ComboboxLabel>
                  <ComboboxItem value="react">React</ComboboxItem>
                  <ComboboxItem value="vue">Vue</ComboboxItem>
                </ComboboxGroup>
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    )
  }

  if (name === 'combobox-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[280px]">
          <Combobox>
            <ComboboxInput placeholder="Disabled combobox..." disabled />
            <ComboboxContent>
              <ComboboxList>{renderFrameworks()}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    )
  }

  if (name === 'combobox-popup') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-[280px]">
          <Combobox>
            <ComboboxInput placeholder="Type to search..." showClear />
            <ComboboxContent side="bottom" sideOffset={6}>
              <ComboboxList>
                {renderFrameworks()}
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    )
  }

  // combobox-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-[280px]">
        <Combobox>
          <ComboboxInput placeholder="Select a framework..." />
          <ComboboxContent>
            <ComboboxList>
              {renderFrameworks()}
              <ComboboxEmpty>No results found.</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}

function CommandPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'command-shortcuts') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Command className="rounded-lg border shadow-md max-w-[450px]">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <span>Calendar</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Search Emoji</span>
                <CommandShortcut>⌘E</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Calculator</span>
                <CommandShortcut>⌘L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    )
  }

  if (name === 'command-groups') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Command className="rounded-lg border shadow-md max-w-[450px]">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <CalendarIcon />
                <span>Calendar</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Search />
                <span>Search Emoji</span>
                <CommandShortcut>⌘E</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Calculator className="text-muted-foreground" />
                <span>Calculator</span>
                <CommandShortcut>⌘L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <Settings />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    )
  }

  if (name === 'command-scrollable') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Command className="rounded-lg border shadow-md max-w-[450px]">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {[
              'Calendar',
              'Search Emoji',
              'Calculator',
              'Profile',
              'Billing',
              'Settings',
              'Notifications',
              'Security',
              'API Keys',
              'Integrations',
              'Teams',
              'Billing Plans'
            ].map((item) => (
              <CommandItem key={item}>{item}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </div>
    )
  }

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
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'context-menu-submenu') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem disabled>Forward</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>Save Page As…</ContextMenuItem>
                <ContextMenuItem>Create Shortcut…</ContextMenuItem>
                <ContextMenuItem>Name Window…</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Developer Tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-shortcuts') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Forward
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              Save Page
              <ContextMenuShortcut>⌘S</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-groups') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuGroup>
              <ContextMenuItem>Back</ContextMenuItem>
              <ContextMenuItem>Forward</ContextMenuItem>
              <ContextMenuItem>Reload</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem>Bookmark this page</ContextMenuItem>
              <ContextMenuItem>Save page as…</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem>Print</ContextMenuItem>
              <ContextMenuItem>Cast…</ContextMenuItem>
              <ContextMenuItem>Find…</ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-icons') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              <ArrowLeft />
              Back
            </ContextMenuItem>
            <ContextMenuItem>
              <ArrowRight />
              Forward
            </ContextMenuItem>
            <ContextMenuItem>
              <ArrowUpRight />
              Reload
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <BookOpen />
              Bookmark
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-checkboxes') {
    const [showFullPath, setShowFullPath] = useState(true)
    const [showToolbar, setShowToolbar] = useState(false)
    const [showStatusBar, setShowStatusBar] = useState(true)
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuCheckboxItem checked={showFullPath} onCheckedChange={setShowFullPath}>
              Show Full Path
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
              Show Toolbar
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              Show Status Bar
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-radio') {
    const [size, setSize] = useState('md')
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here — Size: {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuRadioGroup value={size} onValueChange={setSize}>
              <ContextMenuRadioItem value="sm">Small</ContextMenuRadioItem>
              <ContextMenuRadioItem value="md">Medium</ContextMenuRadioItem>
              <ContextMenuRadioItem value="lg">Large</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  if (name === 'context-menu-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            انقر بزر الفأرة الأيمن هنا
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              رجوع
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              تحديث
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>حفظ الصفحة</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>Back</ContextMenuItem>
          <ContextMenuItem disabled>Forward</ContextMenuItem>
          <ContextMenuItem>Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Bookmark this page</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

function DataTablePreview({ direction }: { direction?: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [filterValue, setFilterValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const allData = [
    { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
    { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
    { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
    { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
    { id: 'INV005', status: 'Paid', method: 'Apple Pay', amount: '$550.00' }
  ]

  const filtered = allData.filter(
    (item) =>
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function DatePickerPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [date, setDate] = useState<Date | undefined>(new Date())

  if (name === 'date-picker-range') {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: new Date(),
      to: new Date(Date.now() + 7 * 86400000)
    })
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range.from ? range.from.toLocaleDateString() : 'Start'} —{' '}
              {range.to ? range.to.toLocaleDateString() : 'End'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={range} onSelect={setRange as any} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (name === 'date-picker-date-of-birth') {
    const [birthDate, setBirthDate] = useState<Date | undefined>(new Date(1995, 5, 15))
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthDate ? birthDate.toLocaleDateString() : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={setBirthDate}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (name === 'date-picker-input') {
    const [inputDate, setInputDate] = useState<Date | undefined>(new Date())
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-[240px]">
              <Input
                value={inputDate ? inputDate.toLocaleDateString() : ''}
                placeholder="Pick a date"
                readOnly
                className="cursor-pointer"
              />
              <CalendarIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={inputDate} onSelect={setInputDate} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (name === 'date-picker-time') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : 'Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
          <Input type="time" defaultValue="12:00" className="w-[100px]" />
        </div>
      </div>
    )
  }

  if (name === 'date-picker-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="ml-2 h-4 w-4" />
              {date ? date.toLocaleDateString('ar-SA') : <span>اختر تاريخًا</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? date.toLocaleDateString() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function DirectionPreview({ direction }: { direction?: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [localDir, setLocalDir] = useState<'ltr' | 'rtl'>('ltr')

  return (
    <div className="flex flex-col min-h-24 items-center justify-center gap-4 p-4" dir={dir}>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={localDir === 'ltr' ? 'default' : 'outline'}
          onClick={() => setLocalDir('ltr')}
        >
          LTR
        </Button>
        <Button
          size="sm"
          variant={localDir === 'rtl' ? 'default' : 'outline'}
          onClick={() => setLocalDir('rtl')}
        >
          RTL
        </Button>
      </div>
      <div className="rounded-md border p-4 w-64 text-sm" dir={localDir}>
        {localDir === 'rtl'
          ? 'هذا النص مكتوب من اليمين إلى اليسار.'
          : 'This text is rendered from left to right.'}
      </div>
    </div>
  )
}

function DrawerPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'drawer-scrollable') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Scrollable</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Terms of Service</DrawerTitle>
                <DrawerDescription>Please read and accept to continue.</DrawerDescription>
              </DrawerHeader>
              <div className="max-h-64 overflow-y-auto px-4 text-sm text-muted-foreground space-y-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <p key={i}>
                    Section {i + 1}: This is sample legal content that would scroll within the
                    drawer. It demonstrates how long-form text flows inside a constrained container.
                  </p>
                ))}
              </div>
              <DrawerFooter>
                <Button>Accept</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Decline</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  if (name === 'drawer-directions') {
    const [side, setSide] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom')
    return (
      <div className="flex min-h-24 items-center justify-center gap-2 p-4" dir={dir}>
        {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
          <Drawer key={s} direction={s}>
            <DrawerTrigger asChild>
              <Button
                variant={side === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSide(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>{s.charAt(0).toUpperCase() + s.slice(1)} Drawer</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  This drawer opens from the {s}.
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        ))}
      </div>
    )
  }

  if (name === 'drawer-responsive-dialog') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Responsive</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                  Make changes to your profile here. Click save when done.
                </DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-3 px-4">
                <Input placeholder="Name" defaultValue="John Doe" />
                <Input placeholder="Email" defaultValue="john@example.com" />
              </div>
              <DrawerFooter>
                <Button>Save changes</Button>
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

  if (name === 'drawer-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">افتح الدرج</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>نقل الهدف</DrawerTitle>
                <DrawerDescription>حدد هدف نشاطك اليومي.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 text-center text-sm">منطقة محتوى الدرج المنزلقة.</div>
              <DrawerFooter>
                <Button>إرسال</Button>
                <DrawerClose asChild>
                  <Button variant="outline">إلغاء</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

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
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'dropdown-menu-submenu') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>New Tab</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>Save Page As…</DropdownMenuItem>
                <DropdownMenuItem>Create Shortcut…</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Developer Tools</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-shortcuts') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              New Tab
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              New Window
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Print
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-icons') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <ArrowUpRight /> New Tab
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy /> Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpen /> Bookmarks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings /> Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-checkboxes') {
    const [showBar, setShowBar] = useState(true)
    const [showGrid, setShowGrid] = useState(false)
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">View</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={showBar} onCheckedChange={setShowBar}>
              Show Status Bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
              Show Grid
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-radio-group') {
    const [position, setPosition] = useState('bottom')
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Panel: {position}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
              <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-destructive') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-avatar') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-complex') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <ArrowUpRight /> New Tab <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy /> Copy Link
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings /> More
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>Save Page</DropdownMenuItem>
                <DropdownMenuItem>Print…</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (name === 'dropdown-menu-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">القائمة</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuItem>الفوترة</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

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

  if (name === 'empty-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HardDrive className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Cloud Storage Empty</EmptyTitle>
            <EmptyDescription>
              Upload files to your cloud storage to access them anywhere.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Upload Files</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (name === 'empty-background') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Empty className="rounded-xl bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/20 dark:to-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No releases yet</EmptyTitle>
            <EmptyDescription>
              Create your first release to get started with your project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Create Release</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (name === 'empty-avatar') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Avatar size="lg">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </EmptyMedia>
            <EmptyTitle>No followers yet</EmptyTitle>
            <EmptyDescription>When someone follows you, they will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (name === 'empty-avatar-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <AvatarGroup>
                <Avatar>
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              </AvatarGroup>
            </EmptyMedia>
            <EmptyTitle>No team members</EmptyTitle>
            <EmptyDescription>Invite team members to start collaborating.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Invite Members</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (name === 'empty-input-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filter to find what you are looking for.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex w-full max-w-xs gap-2">
              <Input placeholder="Search..." />
              <Button variant="outline">Search</Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (name === 'empty-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>لا توجد مشاريع بعد</EmptyTitle>
            <EmptyDescription>
              لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>إنشاء مشروع</Button>
            <Button variant="outline">استيراد مشروع</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  // empty-demo
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </EmptyContent>
      </Empty>
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
        <FieldSet className="w-full max-w-2xl">
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fname">Full name</FieldLabel>
              <Input id="fname" placeholder="Evil Rabbit" />
              <FieldDescription>This appears on invoices and emails.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="uname">Username</FieldLabel>
              <Input id="uname" placeholder="@evilrabbit" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    )
  }

  if (name === 'field-input') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Field className="w-full max-w-md">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" placeholder="you@example.com" />
          <FieldDescription>We&apos;ll never share your email with anyone else.</FieldDescription>
        </Field>
      </div>
    )
  }

  if (name === 'field-textarea') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Field className="w-full max-w-md">
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea id="bio" placeholder="Tell us about yourself..." />
          <FieldDescription>You can @mention other users and organizations.</FieldDescription>
        </Field>
      </div>
    )
  }

  if (name === 'field-select') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Field className="w-full max-w-md">
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>This will be displayed on your profile.</FieldDescription>
        </Field>
      </div>
    )
  }

  if (name === 'field-checkbox') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Field className="w-full max-w-md flex-row items-start gap-3 rounded-lg border p-4">
          <Checkbox id="terms-field" />
          <div className="grid gap-1.5 leading-none">
            <FieldLabel htmlFor="terms-field" className="cursor-pointer">
              Accept terms and conditions
            </FieldLabel>
            <FieldDescription>
              You agree to our Terms of Service and Privacy Policy.
            </FieldDescription>
          </div>
        </Field>
      </div>
    )
  }

  if (name === 'field-switch') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Field className="w-full max-w-md flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="marketing-field">Marketing emails</FieldLabel>
            <FieldDescription>Receive emails about new products and features.</FieldDescription>
          </div>
          <Switch id="marketing-field" />
        </Field>
      </div>
    )
  }

  if (name === 'field-choice-card') {
    const [plan, setPlan] = useState('starter')
    const plans = [
      { id: 'starter', label: 'Starter', desc: 'For small teams', price: '$9/mo' },
      { id: 'pro', label: 'Pro', desc: 'For growing teams', price: '$29/mo' }
    ]
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <FieldSet className="w-full max-w-md">
          <FieldLegend>Plan</FieldLegend>
          <FieldDescription>Choose the plan that fits your needs.</FieldDescription>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors ${plan === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <input
                  type="radio"
                  name="plan"
                  className="sr-only"
                  checked={plan === p.id}
                  onChange={() => setPlan(p.id)}
                />
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.desc}</span>
                <span className="text-sm font-semibold">{p.price}</span>
              </label>
            ))}
          </div>
        </FieldSet>
      </div>
    )
  }

  if (name === 'field-fieldset') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <FieldSet className="w-full max-w-lg">
          <FieldLegend>Account Settings</FieldLegend>
          <FieldDescription>Manage your account preferences.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fname2">Full name</FieldLabel>
              <Input id="fname2" placeholder="Your name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email2">Email</FieldLabel>
              <Input id="email2" placeholder="Your email" />
            </Field>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pass">Password</FieldLabel>
              <Input id="pass" type="password" placeholder="••••••••" />
              <FieldDescription>Must be at least 8 characters.</FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    )
  }

  if (name === 'field-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Field className="w-full max-w-md">
          <FieldLabel htmlFor="email-rtl">البريد الإلكتروني</FieldLabel>
          <Input id="email-rtl" placeholder="you@example.com" />
          <FieldDescription>لن نشارك بريدك الإلكتروني مع أي شخص آخر.</FieldDescription>
        </Field>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <FieldSet className="w-full max-w-2xl">
        <FieldLegend>Payment Method</FieldLegend>
        <FieldDescription>All transactions are secure and encrypted</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
            <Input id="card-name" placeholder="Evil Rabbit" />
          </Field>
          <Field>
            <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
            <Input id="card-number" placeholder="1234 5678 9012 3456" />
            <FieldDescription>Enter your 16-digit card number</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
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

  if (name === 'hover-card-delay') {
    return (
      <div className="flex min-h-40 items-center justify-center p-8" dir={dir}>
        <HoverCard openDelay={100} closeDelay={200}>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-sm">
              Hover (100ms delay)
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@nextjs</h4>
                <p className="text-sm text-muted-foreground">
                  The React Framework – created and maintained by @vercel.
                </p>
                <div className="flex items-center pt-2 gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  <span>Joined December 2021</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    )
  }

  if (name === 'hover-card-sides') {
    const sideLabels = ['left', 'top', 'bottom', 'right'] as const

    return (
      <div className="flex min-h-40 items-center justify-center p-8" dir={dir}>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {sideLabels.map((side) => (
              <HoverCard key={side}>
                <HoverCardTrigger asChild>
                  <Button className="min-w-20" variant="outline">
                    {side}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side={side} className="w-44 text-sm">
                  Hover Card positioned on the {side}.
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Hover each trigger to preview `side` positioning.
          </p>
        </div>
      </div>
    )
  }

  if (name === 'hover-card-rtl') {
    return (
      <div className="flex min-h-40 items-center justify-center p-8" dir="rtl">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-sm font-medium">
              @nextjs
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" dir="rtl">
            <div className="flex justify-between gap-4">
              <div className="space-y-1 flex-1 text-right">
                <h4 className="text-sm font-semibold">@nextjs</h4>
                <p className="text-sm text-muted-foreground font-normal">
                  إطار عمل React — تم إنشاؤه وصيانته بواسطة @vercel.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 text-xs text-muted-foreground">
                  <span>انضم في ديسمبر 2021</span>
                  <Clock3 className="size-3.5" />
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    )
  }

  // hover-card-demo
  return (
    <div className="flex min-h-40 items-center justify-center p-8" dir={dir}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="text-sm font-medium">
            @nextjs
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between gap-4">
            <div className="flex size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
              <img
                className="aspect-square h-full w-full object-cover"
                src="https://github.com/vercel.png"
                alt="@vercel"
              />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm text-muted-foreground font-normal">
                The React Framework – created and maintained by @vercel.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                <span>Joined December 2021</span>
              </div>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold text-muted-foreground select-none">
              v15
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
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

  if (name === 'input-invalid') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium text-destructive">Email</label>
          <Input
            defaultValue="invalid-email"
            className="border-destructive focus-visible:ring-destructive/20"
          />
          <p className="text-xs text-destructive">Please enter a valid email address.</p>
        </div>
      </div>
    )
  }

  if (name === 'input-file') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">Picture</label>
          <Input
            type="file"
            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>
    )
  }

  if (name === 'input-required') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <Input placeholder="Your name" required />
          <p className="text-xs text-muted-foreground">This field is required.</p>
        </div>
      </div>
    )
  }

  if (name === 'input-form') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Sign In</Button>
        </div>
      </div>
    )
  }

  if (name === 'input-inline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <Input
            defaultValue="Untitled Project"
            className="border-none bg-transparent shadow-none px-0 focus-visible:ring-0 rounded-none border-b border-dashed border-muted-foreground/30 hover:border-muted-foreground focus-visible:border-solid focus-visible:border-primary"
          />
          <p className="text-xs text-muted-foreground">Click to edit the project name inline.</p>
        </div>
      </div>
    )
  }

  if (name === 'input-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <Input placeholder="you@example.com" />
          <p className="text-xs text-muted-foreground">لن نشارك بريدك الإلكتروني مع أي شخص.</p>
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
            <InputGroupTextarea className="min-h-28" defaultValue="Line 1, Column 1" />
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
        </div>
      </div>
    )
  }

  if (name === 'input-group-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-lg">
          <InputGroup>
            <InputGroupInput placeholder="comictokindle.dev" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Search</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    )
  }

  if (name === 'input-group-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-lg">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
          </InputGroup>
        </div>
      </div>
    )
  }

  if (name === 'input-group-spinner') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-lg">
          <InputGroup>
            <InputGroupInput placeholder="Loading..." disabled />
            <InputGroupAddon align="inline-end">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    )
  }

  if (name === 'input-group-kbd') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-lg">
          <InputGroup>
            <InputGroupInput placeholder="Search documentation..." />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Kbd>⌘K</Kbd>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    )
  }

  if (name === 'input-group-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-lg">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="بحث..." />
          </InputGroup>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-lg">
        <InputGroup>
          <InputGroupInput placeholder="Search documentation..." />
          <InputGroupAddon align="inline-end">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
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
  const [otp, setOtp] = useState('')

  if (name === 'input-otp-separator') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button size="sm" variant="ghost" onClick={() => setOtp('')}>
          Clear
        </Button>
      </div>
    )
  }

  if (name === 'input-otp-disabled') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center p-4" dir={dir}>
        <InputOTP maxLength={6} disabled>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    )
  }

  if (name === 'input-otp-controlled') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-muted-foreground">
          {otp === '' ? 'Enter your code.' : `You entered: ${otp}`}
        </div>
      </div>
    )
  }

  if (name === 'input-otp-invalid') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} aria-invalid />
            <InputOTPSlot index={1} aria-invalid />
            <InputOTPSlot index={2} aria-invalid />
            <InputOTPSlot index={3} aria-invalid />
            <InputOTPSlot index={4} aria-invalid />
            <InputOTPSlot index={5} aria-invalid />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-destructive font-medium">Invalid code. Please try again.</div>
      </div>
    )
  }

  if (name === 'input-otp-four-digits') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center p-4" dir={dir}>
        <InputOTP maxLength={4} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    )
  }

  if (name === 'input-otp-form') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">Verification Code</h3>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your phone.
            </p>
          </div>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button className="w-full" disabled={otp.length < 6}>
            Verify
          </Button>
        </div>
      </div>
    )
  }

  if (name === 'input-otp-rtl') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center p-4" dir="rtl">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-4 p-4" dir={dir}>
      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setOtp('123456')}>
          Paste sample
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOtp('')}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function ItemPreview({ direction, name }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'item-actions') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia variant="icon">
            <Package className="text-muted-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Build artifacts ready</ItemTitle>
            <ItemDescription>Generated desktop bundles for macOS and Windows.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline">
              Review
            </Button>
            <Button size="sm">Publish</Button>
          </ItemActions>
        </Item>
      </div>
    )
  }

  if (name === 'item-icon') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia variant="icon">
            <CheckCircle2 className="text-emerald-600" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your profile has been verified.</ItemTitle>
            <ItemDescription>You can now publish assets and invite collaborators.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="icon-sm" variant="ghost">
              <ChevronRight className="size-4" />
            </Button>
          </ItemActions>
        </Item>
      </div>
    )
  }

  if (name === 'item-avatar') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia>
            <Avatar>
              <AvatarFallback>SH</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>shadcn</ItemTitle>
            <ItemDescription>Created the shadcn/ui design system.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">Follow</Button>
          </ItemActions>
        </Item>
      </div>
    )
  }

  if (name === 'item-image') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&auto=format&fit=crop"
              className="size-10 rounded object-cover"
              alt="Thumb"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Mountain Landscape</ItemTitle>
            <ItemDescription>Photograph captured at sunrise.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">View</Button>
          </ItemActions>
        </Item>
      </div>
    )
  }

  if (name === 'item-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-2xl rounded-xl border divide-y">
          {['Plan Upgrade', 'Security Alert', 'Payment Received'].map((title, i) => (
            <Item key={title} className="border-0 rounded-none">
              <ItemMedia variant="icon">
                {i === 0 ? (
                  <ArrowUp className="text-emerald-600" />
                ) : i === 1 ? (
                  <AlertCircle className="text-amber-600" />
                ) : (
                  <BadgeCheck className="text-sky-600" />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>
                  {i === 0
                    ? 'Your plan will renew next month.'
                    : i === 1
                      ? 'New login from San Francisco.'
                      : 'Invoice #1234 has been paid.'}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      </div>
    )
  }

  if (name === 'item-dropdown') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia variant="icon">
            <Settings className="text-muted-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Project Settings</ItemTitle>
            <ItemDescription>Manage access, notifications, and integrations.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ItemActions>
        </Item>
      </div>
    )
  }

  if (name === 'item-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Item className="w-full max-w-2xl rounded-xl border">
          <ItemMedia variant="icon">
            <BadgeCheck className="text-emerald-600" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>تم التحقق من الملف الشخصي</ItemTitle>
            <ItemDescription>يمكنك الآن نشر الأصول ودعوة المتعاونين.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">نشر</Button>
          </ItemActions>
        </Item>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Item className="w-full max-w-2xl rounded-xl border">
        <ItemMedia variant="icon">
          <BadgeCheck className="text-muted-foreground" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>A simple item with title and description.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm">Action</Button>
        </ItemActions>
      </Item>
    </div>
  )
}

function KbdPreview({ direction, name }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'kbd-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Kbd>⌘</Kbd> + <Kbd>Shift</Kbd> + <Kbd>N</Kbd>
        </div>
      </div>
    )
  }

  if (name === 'kbd-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Button variant="outline">
          Open Command Palette
          <Kbd>⌘K</Kbd>
        </Button>
      </div>
    )
  }

  if (name === 'kbd-input-group') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Kbd>⌘K</Kbd>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
    </div>
  )
}

function LabelPreview({ direction }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms-label" />
        <Label
          htmlFor="terms-label"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Accept terms and conditions
        </Label>
      </div>
    </div>
  )
}

function MenubarPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'menubar-checkbox') {
    const [checkedState, setCheckedState] = useState({
      showShortcuts: true,
      showFullUrls: false
    })
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem
                checked={checkedState.showShortcuts}
                onCheckedChange={(checked) =>
                  setCheckedState((prev) => ({ ...prev, showShortcuts: !!checked }))
                }
              >
                Always Show Bookmarks Bar
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={checkedState.showFullUrls}
                onCheckedChange={(checked) =>
                  setCheckedState((prev) => ({ ...prev, showFullUrls: !!checked }))
                }
              >
                Always Show Full URLs
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    )
  }

  if (name === 'menubar-radio') {
    const [radioValue, setRadioValue] = useState('andy')
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Profiles</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={radioValue} onValueChange={setRadioValue}>
                <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    )
  }

  if (name === 'menubar-submenu') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                New Window <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email Link</MenubarItem>
                  <MenubarItem>Messages</MenubarItem>
                  <MenubarItem>Notes</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>
                Print... <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    )
  }

  if (name === 'menubar-icons') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>
              <FileText className="mr-2 size-4" />
              File
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Plus className="mr-2 size-4" />
                New <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                <FolderOpen className="mr-2 size-4" />
                Open... <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Settings className="mr-2 size-4" />
              Edit
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Settings className="mr-2 size-4" />
                Preferences
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}

function NativeSelectPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'native-select-groups') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <NativeSelect className="w-[200px]">
          <option value="" disabled>
            Select a fruit
          </option>
          <optgroup label="Citrus">
            <option value="orange">Orange</option>
            <option value="lemon">Lemon</option>
          </optgroup>
          <optgroup label="Berries">
            <option value="strawberry">Strawberry</option>
            <option value="blueberry">Blueberry</option>
          </optgroup>
        </NativeSelect>
      </div>
    )
  }

  if (name === 'native-select-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <NativeSelect disabled className="w-[200px]">
          <option>Select an option</option>
        </NativeSelect>
      </div>
    )
  }

  if (name === 'native-select-invalid') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <NativeSelect className="w-[200px] border-destructive">
          <option value="">Select an option</option>
          <option>Option 1</option>
        </NativeSelect>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <NativeSelect className="w-[200px]">
        <option value="" disabled>
          Select an option
        </option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </NativeSelect>
    </div>
  )
}

function NavigationMenuPreview({ direction }: { direction?: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
            <NavigationMenuContent className="p-4 w-[300px]">
              <NavigationMenuLink>Introduction</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent className="p-4 w-[300px]">
              <NavigationMenuLink>Button</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

function PaginationPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [page, setPage] = useState(1)

  if (name === 'pagination-icons-only') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          {[1, 2, 3].map((p) => (
            <PaginationItem key={p}>
              <PaginationLink href="#" isActive={p === page} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

function PopoverPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'popover-align') {
    return (
      <div className="flex min-h-24 items-start justify-center gap-4 p-4" dir={dir}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Start
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 text-sm">
            Aligned to start.
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Center
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-48 text-sm">
            Aligned to center.
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              End
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 text-sm">
            Aligned to end.
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (name === 'popover-with-form') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Edit</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Edit Name</h4>
              <Input placeholder="Name" />
              <div className="flex justify-end gap-2">
                <Button size="sm">Save</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (name === 'popover-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">افتح</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 text-sm">محتوى منبثق</PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm">
          This is a basic popover with some content.
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ProgressPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const [val, setVal] = useState(60)

  if (name === 'progress-label') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <label className="text-sm font-medium">Upload Progress</label>
          <Progress value={75} className="w-full" />
          <p className="text-xs text-muted-foreground">3 of 4 files uploaded.</p>
        </div>
      </div>
    )
  }

  if (name === 'progress-controlled') {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center gap-3 p-4" dir={dir}>
        <Progress value={val} className="w-full max-w-md" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setVal(Math.max(0, val - 10))}>
            -10
          </Button>
          <span className="text-sm font-medium w-10 text-center">{val}%</span>
          <Button size="sm" variant="outline" onClick={() => setVal(Math.min(100, val + 10))}>
            +10
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Progress value={60} className="w-full max-w-md" />
    </div>
  )
}

function RadioGroupPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'radio-group-description') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <RadioGroup defaultValue="comfortable" className="w-full max-w-md space-y-2">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="comfortable" id="r1" />
            <label htmlFor="r1" className="text-sm font-medium">
              Comfortable
            </label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="compact" id="r2" />
            <label htmlFor="r2" className="text-sm font-medium">
              Compact
            </label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  if (name === 'radio-group-choice-card') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <RadioGroup defaultValue="starter" className="w-full max-w-md">
          {[
            { v: 'starter', l: 'Starter', d: '$9/mo' },
            { v: 'pro', l: 'Pro', d: '$29/mo' }
          ].map((p) => (
            <label
              key={p.v}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
            >
              <RadioGroupItem value={p.v} id={p.v} />
              <div>
                <div className="text-sm font-medium">{p.l}</div>
                <div className="text-xs text-muted-foreground">{p.d}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    )
  }

  if (name === 'radio-group-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <RadioGroup defaultValue="option-one" disabled className="w-full max-w-md space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-one" id="rd1" />
            <label htmlFor="rd1" className="text-sm">
              Option One
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-two" id="rd2" />
            <label htmlFor="rd2" className="text-sm">
              Option Two
            </label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <RadioGroup defaultValue="option-one" className="w-full max-w-md space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-one" id="r-b1" />
          <label htmlFor="r-b1" className="text-sm">
            Option One
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-two" id="r-b2" />
          <label htmlFor="r-b2" className="text-sm">
            Option Two
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-three" id="r-b3" />
          <label htmlFor="r-b3" className="text-sm">
            Option Three
          </label>
        </div>
      </RadioGroup>
    </div>
  )
}

function ResizablePreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'resizable-vertical') {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4 w-full" dir={dir}>
        <div className="w-full max-w-md h-[200px] border rounded-lg overflow-hidden">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-6 bg-muted/20">
                <span className="font-semibold text-sm">Header</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={75}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold text-sm">Content</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    )
  }

  if (name === 'resizable-handle') {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4 w-full" dir={dir}>
        <div className="w-full max-w-md h-[200px] border rounded-lg overflow-hidden">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={30}>
              <div className="flex h-full items-center justify-center p-6 bg-muted/20">
                <span className="font-semibold text-sm">Sidebar</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold text-sm">Content</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    )
  }

  // resizable-demo
  return (
    <div className="flex min-h-[200px] items-center justify-center p-4 w-full" dir={dir}>
      <div className="w-full max-w-md h-[200px] border rounded-lg overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6 bg-muted/20">
              <span className="font-semibold text-sm">One</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold text-sm">Two</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

function SelectPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'select-groups') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (name === 'select-scrollable') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 20 }, (_, i) => (
              <SelectItem key={i} value={`item-${i}`}>
                Item {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (name === 'select-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Select disabled>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (name === 'select-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="اختر خيارًا" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">الخيار أ</SelectItem>
            <SelectItem value="b">الخيار ب</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
          <SelectItem value="3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function SheetPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'sheet-side') {
    const sides: ('top' | 'right' | 'bottom' | 'left')[] = ['top', 'right', 'bottom', 'left']
    return (
      <div className="flex min-h-24 items-center justify-center gap-2 p-4" dir={dir}>
        {sides.map((s) => (
          <Sheet key={s}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                {s}
              </Button>
            </SheetTrigger>
            <SheetContent side={s}>
              <SheetHeader>
                <SheetTitle>{s} Sheet</SheetTitle>
                <SheetDescription>This sheet opens from the {s}.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    )
  }

  if (name === 'sheet-no-close-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent showCloseButton={false}>
            <SheetHeader>
              <SheetTitle>No Close Button</SheetTitle>
              <SheetDescription>This sheet has no default close button.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>This is a basic sheet panel.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SkeletonPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'skeleton-avatar') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-4 p-4" dir={dir}>
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    )
  }

  if (name === 'skeleton-card') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-sm space-y-3 rounded-xl border p-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (name === 'skeleton-text') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/6" />
        </div>
      </div>
    )
  }

  if (name === 'skeleton-form') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-md space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    </div>
  )
}

function SliderPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'slider-range') {
    return (
      <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
        <Slider defaultValue={[25, 75]} className="w-full max-w-md" />
      </div>
    )
  }

  if (name === 'slider-vertical') {
    return (
      <div className="flex min-h-48 items-center justify-center p-4" dir={dir}>
        <Slider defaultValue={[50]} orientation="vertical" className="h-40" />
      </div>
    )
  }

  if (name === 'slider-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
        <Slider defaultValue={[33]} disabled className="w-full max-w-md" />
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
      <Slider defaultValue={[50]} className="w-full max-w-md" />
    </div>
  )
}

function SwitchPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'switch-description') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <div className="flex items-start space-x-3">
          <Switch id="airplane-mode" />
          <div className="grid gap-1.5">
            <label htmlFor="airplane-mode" className="text-sm font-medium">
              Airplane Mode
            </label>
            <p className="text-xs text-muted-foreground">Disable all wireless connections.</p>
          </div>
        </div>
      </div>
    )
  }

  if (name === 'switch-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-6 p-4" dir={dir}>
        <div className="flex items-center space-x-2">
          <Switch id="s1" checked disabled />
          <label htmlFor="s1" className="text-sm text-muted-foreground">
            On
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="s2" disabled />
          <label htmlFor="s2" className="text-sm text-muted-foreground">
            Off
          </label>
        </div>
      </div>
    )
  }

  if (name === 'switch-size') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-4 p-4" dir={dir}>
        <Switch />
        <Switch className="scale-75" />
        <Switch className="scale-125" />
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Switch />
    </div>
  )
}

function ScrollAreaPreview({ direction }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined
  const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

  return (
    <div className="flex min-h-24 items-center justify-center p-6" dir={dir}>
      <ScrollArea className="h-72 w-48 rounded-md border bg-card text-card-foreground shadow-xs">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-semibold leading-none">Tags</h4>
          {tags.map((tag, idx) => (
            <div key={tag}>
              <div className="text-sm py-2">{tag}</div>
              {idx < tags.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function SeparatorPreview({ direction }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div className="flex min-h-24 items-center justify-center p-8" dir={dir}>
      <div className="w-full max-w-sm">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Radix Design System</h4>
          <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Blog</div>
          <Separator orientation="vertical" />
          <div>Docs</div>
          <Separator orientation="vertical" />
          <div>Source</div>
        </div>
      </div>
    </div>
  )
}

function SonnerPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'sonner-types') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 p-6" dir={dir}>
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Success Toast', {
              description: 'The action completed successfully.'
            })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info('Info Toast', {
              description: 'Here is some information.'
            })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning('Warning Toast', {
              description: 'Please check your inputs.'
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error('Error Toast', {
              description: 'Something went wrong.'
            })
          }
        >
          Error
        </Button>
      </div>
    )
  }

  if (name === 'sonner-position') {
    const positions: (
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top-center'
      | 'bottom-center'
    )[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center']
    return (
      <div className="grid grid-cols-2 gap-2 p-6 max-w-sm mx-auto" dir={dir}>
        {positions.map((pos) => (
          <Button
            key={pos}
            variant="outline"
            size="sm"
            onClick={() =>
              toast(`Toast at ${pos}`, {
                position: pos,
                description: `This toast is configured at position: ${pos}`
              })
            }
          >
            {pos}
          </Button>
        ))}
      </div>
    )
  }

  // sonner-demo (default)
  return (
    <div className="flex min-h-24 items-center justify-center p-6" dir={dir}>
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo Clicked')
            }
          })
        }
      >
        Show Toast
      </Button>
    </div>
  )
}

function SpinnerPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'spinner-size') {
    return (
      <div className="flex items-center justify-center gap-6 p-6" dir={dir}>
        <div className="flex flex-col items-center gap-1">
          <Spinner className="size-4" />
          <span className="text-xs text-muted-foreground">sm</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Spinner className="size-6" />
          <span className="text-xs text-muted-foreground">md</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Spinner className="size-8" />
          <span className="text-xs text-muted-foreground">lg</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Spinner className="size-10" />
          <span className="text-xs text-muted-foreground">xl</span>
        </div>
      </div>
    )
  }

  if (name === 'spinner-button') {
    return (
      <div className="flex items-center justify-center gap-4 p-6" dir={dir}>
        <Button disabled>
          <Spinner className="size-4 mr-2" />
          Please wait
        </Button>
        <Button variant="secondary" disabled>
          <Spinner className="size-4 mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  if (name === 'spinner-badge') {
    return (
      <div className="flex items-center justify-center gap-4 p-6" dir={dir}>
        <Badge variant="default" className="gap-1.5">
          <Spinner className="size-3 text-current" />
          Syncing
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Spinner className="size-3 text-current" />
          Processing
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Spinner className="size-3 text-current" />
          Loading
        </Badge>
      </div>
    )
  }

  if (name === 'spinner-input-group') {
    return (
      <div className="flex items-center justify-center p-6 w-full max-w-sm mx-auto" dir={dir}>
        <InputGroup className="w-full">
          <InputGroupInput placeholder="Validating license..." disabled />
          <InputGroupAddon align="inline-end">
            <Spinner className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  // spinner-demo (default)
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 p-6 animate-pulse" dir={dir}>
      <Spinner className="size-6 text-primary" />
      <span className="text-sm font-medium text-muted-foreground">Loading assets...</span>
    </div>
  )
}

function TabsPreview({ direction, name }: { direction?: string; name: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'tabs-line') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList variant="line">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  if (name === 'tabs-vertical') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Tabs defaultValue="account" orientation="vertical" className="flex gap-4">
          <TabsList className="flex-col h-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  if (name === 'tabs-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password" disabled>
              Password
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  if (name === 'tabs-icons') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">
              <Settings className="mr-2 size-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="password">
              <Search className="mr-2 size-4" />
              Search
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

function TogglePreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'toggle-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Toggle variant="outline" aria-label="Toggle italic">
          <Type className="size-4" />
        </Toggle>
      </div>
    )
  }

  if (name === 'toggle-with-text') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Toggle variant="outline" aria-label="Toggle bold">
          <Type className="size-4" /> Bold
        </Toggle>
      </div>
    )
  }

  if (name === 'toggle-size') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-2 p-4" dir={dir}>
        <Toggle size="sm" aria-label="Toggle">
          <Type className="size-3" />
        </Toggle>
        <Toggle aria-label="Toggle">
          <Type className="size-4" />
        </Toggle>
        <Toggle size="lg" aria-label="Toggle">
          <Type className="size-5" />
        </Toggle>
      </div>
    )
  }

  if (name === 'toggle-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <Toggle disabled aria-label="Toggle">
          <Type className="size-4" />
        </Toggle>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <Toggle aria-label="Toggle">
        <Type className="size-4" />
      </Toggle>
    </div>
  )
}

function ToggleGroupPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'toggle-group-outline') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ToggleGroup type="single" variant="outline" defaultValue="left">
          <ToggleGroupItem value="left" aria-label="Left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center">
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  }

  if (name === 'toggle-group-size') {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3 p-4" dir={dir}>
        <ToggleGroup type="single" size="sm" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" size="lg" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  }

  if (name === 'toggle-group-vertical') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ToggleGroup type="single" orientation="vertical" defaultValue="top">
          <ToggleGroupItem value="top">Top</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  }

  if (name === 'toggle-group-disabled') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
        <ToggleGroup type="single" disabled defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  }

  if (name === 'toggle-group-rtl') {
    return (
      <div className="flex min-h-24 items-center justify-center p-4" dir="rtl">
        <ToggleGroup type="single" defaultValue="right">
          <ToggleGroupItem value="right">يمين</ToggleGroupItem>
          <ToggleGroupItem value="center">وسط</ToggleGroupItem>
          <ToggleGroupItem value="left">يسار</ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center justify-center p-4" dir={dir}>
      <ToggleGroup type="single" defaultValue="center">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

function TextareaPreview({ direction }: { direction?: string; name?: string }): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  return (
    <div
      className="flex min-h-24 items-center justify-center p-6 w-full max-w-sm mx-auto"
      dir={dir}
    >
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Your Message</Label>
        <Textarea placeholder="Type your message here." id="message" />
        <p className="text-xs text-muted-foreground">
          Your message will be sent to our support team.
        </p>
      </div>
    </div>
  )
}

function TooltipPreview({
  direction,
  name
}: {
  direction?: string
  name: string
}): React.JSX.Element {
  const dir = direction === 'rtl' ? 'rtl' : undefined

  if (name === 'tooltip-side') {
    const sides: ('top' | 'right' | 'bottom' | 'left')[] = ['top', 'right', 'bottom', 'left']
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 p-6" dir={dir}>
        <TooltipProvider>
          {sides.map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  {side}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={side}>
                <p>Tooltip on the {side}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    )
  }

  if (name === 'tooltip-with-keyboard-shortcut') {
    return (
      <div className="flex min-h-24 items-center justify-center p-6" dir={dir}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover</Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2">
              <span>Add to library</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>B
              </kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  if (name === 'tooltip-disabled-button') {
    return (
      <div className="flex min-h-24 items-center justify-center p-6" dir={dir}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block cursor-not-allowed">
                <Button disabled style={{ pointerEvents: 'none' }}>
                  Hover
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip on a disabled button</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  // tooltip-demo (default)
  return (
    <div className="flex min-h-24 items-center justify-center p-6" dir={dir}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
    return <CalendarPreview name={name} direction={direction} />
  }

  if (name.startsWith('card')) {
    return <CardPreview name={name} direction={direction} />
  }

  if (name.startsWith('carousel')) {
    return <CarouselPreview name={name} direction={direction} />
  }

  if (name.startsWith('chart')) {
    return <ChartPreview direction={direction} />
  }

  if (name.startsWith('checkbox')) {
    return <CheckboxPreview name={name} direction={direction} />
  }

  if (name.startsWith('collapsible')) {
    return <CollapsiblePreview name={name} direction={direction} />
  }

  if (name.startsWith('combobox')) {
    return <ComboboxPreview name={name} direction={direction} />
  }

  if (name.startsWith('command')) {
    return <CommandPreview name={name} direction={direction} />
  }

  if (name.startsWith('context-menu')) {
    return <ContextMenuPreview name={name} direction={direction} />
  }

  if (name.startsWith('data-table')) {
    return <DataTablePreview direction={direction} />
  }

  if (name.startsWith('date-picker')) {
    return <DatePickerPreview name={name} direction={direction} />
  }

  if (name.startsWith('direction')) {
    return <DirectionPreview direction={direction} />
  }

  if (name.startsWith('drawer')) {
    return <DrawerPreview name={name} direction={direction} />
  }

  if (name.startsWith('dropdown-menu')) {
    return <DropdownMenuPreview name={name} direction={direction} />
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

  if (name.startsWith('kbd')) {
    return <KbdPreview name={name} direction={direction} />
  }

  if (name.startsWith('label')) {
    return <LabelPreview name={name} direction={direction} />
  }

  if (name.startsWith('menubar')) {
    return <MenubarPreview name={name} direction={direction} />
  }

  if (name.startsWith('native-select')) {
    return <NativeSelectPreview name={name} direction={direction} />
  }

  if (name.startsWith('navigation-menu')) {
    return <NavigationMenuPreview direction={direction} />
  }

  if (name.startsWith('pagination')) {
    return <PaginationPreview name={name} direction={direction} />
  }

  if (name.startsWith('popover')) {
    return <PopoverPreview name={name} direction={direction} />
  }

  if (name.startsWith('progress')) {
    return <ProgressPreview name={name} direction={direction} />
  }

  if (name.startsWith('radio-group')) {
    return <RadioGroupPreview name={name} direction={direction} />
  }

  if (name.startsWith('resizable')) {
    return <ResizablePreview name={name} direction={direction} />
  }

  if (name.startsWith('scroll-area')) {
    return <ScrollAreaPreview name={name} direction={direction} />
  }

  if (name.startsWith('select')) {
    return <SelectPreview name={name} direction={direction} />
  }

  if (name.startsWith('separator')) {
    return <SeparatorPreview name={name} direction={direction} />
  }

  if (name.startsWith('sheet')) {
    return <SheetPreview name={name} direction={direction} />
  }

  if (name.startsWith('skeleton')) {
    return <SkeletonPreview name={name} direction={direction} />
  }

  if (name.startsWith('slider')) {
    return <SliderPreview name={name} direction={direction} />
  }

  if (name.startsWith('sonner')) {
    return <SonnerPreview name={name} direction={direction} />
  }

  if (name.startsWith('spinner')) {
    return <SpinnerPreview name={name} direction={direction} />
  }

  if (name.startsWith('switch')) {
    return <SwitchPreview name={name} direction={direction} />
  }

  if (name.startsWith('tabs')) {
    return <TabsPreview name={name} direction={direction} />
  }

  if (name.startsWith('textarea')) {
    return <TextareaPreview direction={direction} />
  }

  if (name.startsWith('toggle-group')) {
    return <ToggleGroupPreview name={name} direction={direction} />
  }

  if (name.startsWith('toggle')) {
    return <TogglePreview name={name} direction={direction} />
  }

  if (name.startsWith('tooltip')) {
    return <TooltipPreview name={name} direction={direction} />
  }

  if (name.startsWith('alert-dialog')) {
    return <AlertDialogPreview name={name} direction={direction} />
  }

  if (name.startsWith('alert')) {
    return <AlertPreview name={name} direction={direction} />
  }

  if (name.startsWith('aspect-ratio')) {
    return <AspectRatioPreview name={name} direction={direction} />
  }

  if (name.startsWith('avatar')) {
    return <AvatarPreview name={name} direction={direction} />
  }

  if (name.startsWith('badge')) {
    return <BadgePreview name={name} direction={direction} />
  }

  if (name.startsWith('breadcrumb')) {
    return <BreadcrumbPreview name={name} direction={direction} />
  }

  if (name.startsWith('button-group')) {
    return <ButtonGroupPreview name={name} direction={direction} />
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
      content: 'Yes. It comes with default styles that match the other components aesthetic.'
    },
    {
      value: 'item-3',
      trigger: 'Is it animated?',
      content: "Yes. It's animated by default, but you can disable it if you prefer."
    }
  ]

  if (name === 'accordion-rtl') {
    return (
      <div dir="rtl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="password">
            <AccordionTrigger>كيف يمكنني إعادة تعيين كلمة المرور؟</AccordionTrigger>
            <AccordionContent>
              يمكنك إعادة تعيين كلمة المرور باستخدام خيار "نسيت كلمة المرور" في صفحة تسجيل الدخول.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="subscription">
            <AccordionTrigger>هل يمكنني تغيير خطة الاشتراك الخاصة بي؟</AccordionTrigger>
            <AccordionContent>نعم، يمكنك تغيير خطتك في أي وقت من إعدادات الحساب.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment">
            <AccordionTrigger>ما هي طرق الدفع التي تقبلونها؟</AccordionTrigger>
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
              Manage how you receive notifications. You can enable email alerts for updates or push
              notifications.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy">
            <AccordionTrigger>Privacy & Security</AccordionTrigger>
            <AccordionContent>
              Control your privacy settings and manage how your data is shared and used across the
              platform.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="billing">
            <AccordionTrigger>Billing & Subscription</AccordionTrigger>
            <AccordionContent>
              View and manage your billing information, payment methods, and subscription details.
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
              Yes, you can view your complete account history including past transactions and
              activity logs from the dashboard.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="premium" disabled>
            <AccordionTrigger>Premium feature information</AccordionTrigger>
            <AccordionContent>
              This feature requires a premium subscription. Upgrade your plan to access advanced
              features and tools.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="email">
            <AccordionTrigger>How do I update my email address?</AccordionTrigger>
            <AccordionContent>
              Go to your profile settings and click on the email field to change it. A verification
              email will be sent to confirm.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (name === 'accordion-borders') {
    return (
      <div dir={dir}>
        <Accordion type="single" collapsible className="w-full rounded-md border">
          <AccordionItem value="billing">
            <AccordionTrigger className="px-4">How does billing work?</AccordionTrigger>
            <AccordionContent className="px-4">
              We offer monthly and annual subscription plans. Billing is charged at the beginning of
              each cycle.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger className="px-4">Is my data secure?</AccordionTrigger>
            <AccordionContent className="px-4">
              Your data is encrypted both in transit and at rest. We follow industry best practices
              to keep your information safe.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="integrations">
            <AccordionTrigger className="px-4">What integrations do you support?</AccordionTrigger>
            <AccordionContent className="px-4">
              We support integrations with popular tools like Slack, GitHub, Jira, and many more
              through our API.
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
              Common questions about your account, plans, payments and cancellations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="plans">
                <AccordionTrigger>What subscription plans do you offer?</AccordionTrigger>
                <AccordionContent>
                  We offer three tiers: Starter ($9/mo), Professional ($29/mo), and Enterprise
                  ($99/mo). Each tier includes different features and support levels.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="billing-card">
                <AccordionTrigger>How does billing work?</AccordionTrigger>
                <AccordionContent>
                  Billing is charged at the beginning of each billing cycle. You can upgrade or
                  downgrade your plan at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cancel">
                <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
                <AccordionContent>
                  You can cancel your subscription anytime from your account settings. Your access
                  will continue until the end of the current billing period.
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
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
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
              This content is wrapped in SidebarInset and automatically adjusts to the sidebar
              width.
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
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
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
  const { state } = useSidebar()

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
        {sidebarGroups.map((group, groupIdx) => (
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

      <Separator className="-mx-2 !w-auto bg-sidebar-border" />
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
