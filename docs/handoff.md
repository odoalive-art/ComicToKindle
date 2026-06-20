# 交接记录

## 快照

日期：2026-06-20

ComicToKindle **核心闭环已打通**：漫画库浏览 → 阅读器 → 卷册转 Kindle 固定版式 EPUB → 归档 → 投递到 Kindle（SMTP 邮件 / Send to Kindle 网页通道二选一）。最近一轮（2026-06-20）新增并打磨**应用内 Send to Kindle 网页推送**：≤200MB 大通道、CDP 拦截自动填文件、全自动点击、登录态水合修复。

## 已完成

### 2026-06-20 阶段（应用内 Send to Kindle 网页推送）

- 新增 `src/main/webpush.ts`：独立持久 session（`partition: 'persist:amazon-stk'`）的 BrowserWindow 内嵌 Amazon 网页通道，桌面 Chrome UA 伪装；STK URL 可配置（`settings.json` 的 `webpush.url`，默认 amazon.com 美区）。
- 自动填文件：STK 页面无持久 `<input type=file>`，改用 CDP `Page.setInterceptFileChooserDialog` 拦截选择框 + `fileChooserOpened` 时 `DOM.setFileInputFiles` 按 `backendNodeId` 喂入。
- 全自动点击 + 黑色蒙层进度（「正在上传…→已填入」）：逐 frame 探测并点击上传入口，成功判定挂在真实 `fileChooserOpened` 事件；超时撤蒙层退回半自动横幅，候选元素打日志便于调参。
- 登录态水合修复：首次进入「顶栏已登录、上传区仍显 Sign in」时，装拦截器前先 `reload` 一次刷出真正的上传控件（reload 必须早于 `setInterceptFileChooserDialog`，否则被清掉）。
- 关闭接管：自动放行 CDP `javascriptDialogOpening`（beforeunload），并自接管窗口 `close` 弹确认框、`destroy()` 绕过；半自动（不自动点 Send）。
- renderer：`WebPushView` 着陆/设置页 + 归档/转换活动浮窗的「网页推送」入口；引导横幅/蒙层用 shadcn token 内联样式注入网页（main 进程文案，未接 i18n）。
- 提交：`38231c4`（首版闭环）、`15fd912`（全自动填入 + 水合修复）。

### 2026-06-19 阶段（库视图交互打磨）

- 顶栏功能按钮统一为无描边图标 + Radix tooltip（选择 / 转换活动 / 重新扫描 / 切换文件夹）。
- 侧栏开合按钮从内容顶栏移入边栏顶部（桌面态：展开靠右、收起居中，统一 `size-8` + `hover:bg-sidebar-accent`、右缘对齐选中标签）；内容顶栏面包屑与网格左缘对齐。
- 卷册多选取代旧「转换整部」：「选择」按钮进入多选，顶栏切换为已选计数/全选/转换所选/退出；进入方式含点选、空白处框选（marquee，**pointer capture** 实现，避免 Electron 下丢事件）、Cmd·Ctrl+A 全选；ESC 退出；未选变暗、选中高亮（按主题分别调亮度）。
- 修复小封面下角标/转换按钮溢出、面包屑折行。
- 窄屏（侧栏 offcanvas）补内容顶栏开合入口；移动端 Sheet 下「设置」上方分割线去负边距修右侧溢出。

### 2026-06-19 阶段（转换 + 投递闭环）

- 转换引擎 `src/main/convert.ts`：图片卷册 → Kindle 固定版式 EPUB3（sharp 处理 + archiver `ZipArchive` 打包），默认档位 pw6/ko3；可取消（checkCancelled 在图/卷边界中止）。
- 产物层 `src/main/artifacts.ts`：清单 `userData/artifacts.json`、产物落 `userData/converted/<部>/`；IPC `convert:volume/cancel`、`artifacts:list/reveal/export/remove`。
- 投递层 `src/main/deliver.ts`：nodemailer SMTP；密码用 `safeStorage` 加密存 `settings.json`、**不回传 renderer**（只回 `hasPassword`）；错误码由 renderer 按语言翻译。
- App 层 `useConvertActivity` 队列 hook（顺序处理、进度订阅）+ 库顶栏「转换活动」浮窗；`ArchiveView` / `DeliverySettingsView` / `ConvertSettingsView` 三个真实视图，挂「Kindle 推送」组。

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

浏览/阅读/转换（图片→EPUB）/归档/投递（SMTP + Send to Kindle 网页通道）闭环已实现；仍未实现：元数据存储/索引、压缩包（CBZ/CBR/PDF）来源、图像放大、转换队列持久化、转换后自动投递。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`。

## 下一步建议

1. 队列持久化：当前队列是 renderer 内存态，重启丢未完成排队。
2. 转换后自动投递（可选开关）。
3. 压缩包/单文件来源（CBZ/CBR/PDF）的读取与转换。
4. 视情况引入漫画元数据库/索引，替代每次实时扫描。
5. 阅读器增强：双页「封面单独成页」、缩放/适配宽度、沉浸模式、Home/End 跳首末页。
6. 网页推送小打磨（可选）：蒙层/确认框文案接 i18n（当前 main 进程硬编码中文）；关闭确认改成「仅有已填入未发送文件时才弹」。

## 验证命令

```bash
npm run typecheck
npm run build
npm run dev
```
