# 交接记录

## 快照

日期：2026-06-19

ComicToKindle 已从基础阶段进入**真实漫画库浏览 + 阅读器**阶段。本阶段（2026-06-18/19）落地：漫画库数据层（comic:// 协议、目录扫描、库根目录持久化）、「所有漫画」两级浏览（部 → 卷册）、卷册阅读器（单页/双页、左右方向、续读、切换 toast），以及侧边栏开合动效优化、库视图顶栏合并、封面内描边等 UI 细节。

## 已完成

### 2026-06-18/19 阶段（漫画库浏览 + 阅读器）

- 漫画库数据层 `src/main/library.ts`：注册 `comic://` 协议（库根越权校验）；扫描部（`[作者] 标题`）/ 卷册，自然排序、封面首图、递归页数；IPC `library:pickFolder/getSavedRoot/scan/listVolumes/listPages`；库根目录持久化到 `userData/settings.json`。
- preload 暴露 `window.api.library.*` 并补全类型（`LibrarySeries`/`LibraryVolume`）。
- 「所有漫画」视图：空状态选目录、部封面网格、卷册封面网格、面包屑、骨架屏；替换原 mock LibraryView 并清理其专用 mock 数据。
- 卷册阅读器 `VolumeReader`：单页/双页、左右阅读方向（RTL 左右排布与翻页反转）、记住每卷续读、相邻页预加载、键盘 + 左右半区点击导航、切换 toast 反馈；卷册卡片显示续读进度条。
- `index.html` CSP 放行 `comic:`；`.gitignore` 加 `*.tsbuildinfo`。
- UI 细节：侧边栏开合动效改 `ease-out` + 时长对齐 + 标签淡出 + 消除纵向跳动；库视图合并顶栏（消除双标题栏）；封面改内描边。

### 早期阶段（基础搭建）

- 初始化 Electron + Vite + React + TypeScript 应用。
- 安装 npm 依赖。
- 接入 Tailwind CSS 4。
- 手动配置 shadcn/ui。
- 生成基础 shadcn/ui 组件。
- 搭建侧边栏应用壳，去掉原侧边栏 Header 顶栏。
- 将侧边栏分组"工作区"重命名为"漫画库"，将其第一项"漫画库"重命名为"所有漫画"。
- 将"设计组件"重命名为"Shadcn 组件"。
- 在侧边栏新增"应用组件"菜单，直接复用 `DesignComponentsView` 的两栏文档预览布局，仅列出当前项目已正式安装并使用的 15 个基础 UI 组件。
- 修复了 `accordion.tsx` 中由于 Radix 联合类型报错导致的既有 TS 类型错误，使应用构建完全通畅。
- 完成了以 A 开头的 Shadcn 组件文档镜像补全及高保真模拟预览（Alert, Alert Dialog, Aspect Ratio, Avatar）。
- 完成了以 B 开头的 Shadcn 组件文档镜像补全及高保真模拟预览（Badge, Breadcrumb, Button Group）。
- 使用本地 CLI 在项目里实际安装了 10 个 C & D 组组件，并在 package.json 中自动集成了 Recharts、React-Day-Picker、Embla Carousel 等相关重依赖。
- 完成了以 C 和 D 开头的 14 个 Shadcn 官方组件的完整双语文档镜像及高保真/完整功能交互预览（Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Direction, Drawer, Dropdown Menu）。
- 完成了以 E 到 I 开头的 7 个 Shadcn 官方组件文档镜像补全及本地预览实现（Empty, Field, Hover Card, Input, Input Group, Input OTP, Item）。
- 实现自定义窗口交通灯（`traffic-lights.tsx`）并通过 IPC 接管关闭/最小化/最大化；`titleBarStyle: 'hiddenInset'` 保留，系统交通灯被自定义实现替代。
- 侧边栏和内容区顶栏高度统一为 `h-12`；侧边栏收起时将切换按钮移至左上角。
- 修复侧边栏 icon 模式下左右间距不对称问题（移除 `SidebarInset` 的 `peer-data-[state=collapsed]:ml-2`）。
- 修复交通灯 icon 悬浮触发范围（改用命名 `group/tl`，作用域精确到交通灯整体区域）。
- 验证 `npm run build` 通过。

## 重要上下文

当前仓库路径：

```txt
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

该仓库于 2026-06-15 按用户要求迁回 iCloud Drive 同步目录。已知风险：2026-06-11 曾在同步盘路径下遇到 Node toolchain binary 卡住；如果再次复现，优先迁回本地非同步目录后再继续开发。

`设计组件` 和 `基础规范` 都是开发期提效页面，不是终端用户产品功能。

本地漫画扫描与浏览、卷册阅读器已实现；仍未实现：元数据存储/索引、转换流水线、图像处理、EPUB 生成、Kindle 投递和任务队列。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`。

## 下一步建议

1. 转换投递（App 核心）：多选卷册 → 转 Kindle 格式（EPUB/MOBI）→ 邮箱/USB 投递。
2. 视情况引入漫画元数据库/索引，替代每次实时扫描。
3. 阅读器可继续增强：双页「封面单独成页」、缩放/适配宽度、沉浸模式、Home/End 跳首末页。
4. 明确转换流程由 Electron main、worker 还是独立服务模块执行；实现凭据相关能力前重新评估 sandbox 与 IPC 边界。

## 验证命令

```bash
npm run typecheck
npm run build
npm run dev
```
