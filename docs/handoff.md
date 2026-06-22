# 交接记录

## 快照

日期：2026-06-22

ComicToKindle **核心闭环已打通**，且**已可打包内测**（macOS dmg，ad-hoc 签名，`npm run release:mac` 一键出包，当前 `0.1.0-beta.2`）：漫画库浏览 → 阅读器 → 卷册转 Kindle 固定版式 EPUB → 归档 → 投递到 Kindle（SMTP 邮件 / Send to Kindle 网页通道二选一）。最近一轮（2026-06-22 下半）做了**打包内测准备 + 包体瘦身（dmg 170→116MB）+ 开发期演示页移出生产包**；上半做了**移动框「＋新建文件夹并移入」**、**UI 清理**、**窗口缩放白边修复**。更早一轮（2026-06-21）补齐**应用内文件整理**、**转换队列持久化 + 中断恢复**、**漫画库文件管理器式交互**、**压缩包来源**、**封面缩略图缓存**、**书籍元数据**与**每部信息编辑**。

## 已完成

### 2026-06-22 阶段（打包内测准备 + 包体瘦身 + 演示页剥离）

分支 `feat/archive-source-layer`，已提交并 push（commit `1df423d`→`c0d452b`）。

- **打包内测就绪**：`electron-builder.yml` 改正脚手架占位符（appId `com.comictokindle.app` / productName `ComicToKindle`）；`mac.identity: null` 走 ad-hoc 签名（Apple Silicon 必须签名才能启动），`build:mac` 内置 `CSC_IDENTITY_AUTO_DISCOVERY=false`（本机有两张同名 Apple Development 证书会报 ambiguous）；新增 `release:mac`（prerelease 版本号 +1 再 build:mac）；版本切 `0.1.0-beta.x`。打包/分发流程见 `docs/operator-runbook.md`「打包与内测分发」。
- **sharp 打包陷阱修复**：`asarUnpack` 增加 `node_modules/sharp/**` 与 `@img/**`——`@img/sharp-libvips-*` 只含 `.dylib` 无 `.node`，electron-builder smartUnpack 会漏，导致打包后 sharp 一调用即崩。
- **包体瘦身 dmg 170→116MB**：`shadcn` CLI 被误置 `dependencies`（拖入 @ts-morph/@modelcontextprotocol/hono 等），加上 recharts/radix 等 UI 库在 asar 与 vite 产物重复。把 `dependencies` 收敛为 main 运行时真正需要的 6 个包，其余全移 `devDependencies`（app.asar 200→8.3MB）；再剔除 7zip-bin 的 linux/win 二进制 + docs/AGENTS.md/*.tsbuildinfo 等开发文件。
- **开发期演示页移出生产包**：`App.tsx`（曾 12263 行）拆分——演示页（设计组件/基础规范 + 全部 *Preview，约 7800 行）抽到 `src/renderer/src/dev/Showcase.tsx`，经 `import.meta.env.DEV` 门控的 `React.lazy` 加载；`uiText`+`LanguageMode` 抽到 `src/renderer/src/i18n.ts`。生产构建该懒加载分支为死代码 → Rollup 不产出 chunk，recharts/embla/cmdk 等重依赖完全不进包。主渲染包 3.3→1.3MB，冷启动白屏明显缓解。侧栏 `groupDevMode` 同样按 DEV 隐藏。
- **卷册视图骨架屏闪烁修复（QA 发现）**：列表渲染 `loading` 优先级高于 `showVolumes`，导致在某部内做移动/删除/重命名后 `refreshAfterFileop` 的整库重扫把卷册网格闪成骨架屏。改渲染条件为 `loading && !showVolumes`（卷册视图改由静默 `refreshVolumes` 刷新）。注：这是上半轮 `refreshAfterFileop` 改为「始终 loadSeries」引入的回归。
- 验证：`npm run typecheck` / `npm run build` 通过，打包后 app 启动正常（sharp/@img 到位、生产包确认无 recharts）。
- 用户口述的后续功能方向（移除解压/多格式预览/模拟 Kindle 预览/外部拖拽导入）记在 agent 记忆 `feature-backlog`，未排期。

### 2026-06-22 阶段（UI 清理 + 窗口修复）

分支 `feat/archive-source-layer`，已提交并 push。

- **移动框「＋新建文件夹并移入」**：移动目标弹框列表顶部新增「＋新建文件夹」入口，点击后弹名称输入框，确认后调 `window.api.library.createFolder(root, name)` → 拿到新路径 → `window.api.library.move(sources, newPath)`，一步完成「库根新建部 + 卷移入」。`submitMoveToNewFolder` 函数封装在 `App.tsx`；`moveNewFolderName` state 控制二级输入弹框。
- **`refreshAfterFileop` 修复**：原先「有 selected 就只刷卷、没有就只刷部」，导致新建后切换到对应视图才出现。改为：**始终** `loadSeries(root)` 刷部列表 → 若有 selected 再 `refreshVolumes()` 刷卷列表，确保操作后两层视图同步更新。
- **图标整理**：转换活动浮窗 idle 状态图标从 `ArrowDownUp` 改为 `BookOpenCheck`；侧边栏移除「转换队列」导航项（转换队列功能已合并入转换活动浮窗，不再需要独立入口）。
- **导航清理**（`App.tsx` `sidebarGroups` / `primaryNav` 移除）：
  - 删除「添加资源库」视图（无实际功能，入口多余）
  - 删除「导入收件箱」导航占位
  - 删除「投递记录」导航占位
  - `system-doctor` 页改为「扩展功能」（`extensions`，icon `Puzzle`），作为 waifu2x 等扩展能力的入口壳，暂无内容
- **`PageEmpty` 复用组件**：提取空状态 UI 为独立组件（居中插画 + 标题 + 描述），归档页「空」状态改用此组件，替换原有骨架屏占位；其他空视图同样复用。
- **归档页 skeleton flash 修复**：切换到归档 Tab 时，loading 状态原先渲染骨架屏，挂载时闪烁一列 4-5 行卡片。修法：loading early-return 改为 `<div className="flex-1" />`（不可见占位）代替骨架屏，消除闪烁。
- **顶栏标题错乱修复**：切到「转换设置」时顶栏显示「所有漫画」。根因：`primaryNav.find()` 对非 primaryNav 视图返回 `undefined`，回退到 `primaryNav[0]`。修法：删除 `primaryNav` 数组、`activeNavItem` 变量、`NavItem` 类型；`AppHeader` 直接接收 `activeView: string` 自行渲染标题，无需通过 nav 数组查找。
- **窗口缩放白边修复**（双层修复）：
  - **Electron 层**：`src/main/index.ts` 引入 `nativeTheme`，添加 `BG_DARK = '#09090b'` / `BG_LIGHT = '#ffffff'` 常量，`themeBg()` helper 按 `nativeTheme.shouldUseDarkColors` 选色；`BrowserWindow` 选项加 `backgroundColor: themeBg()` 作为初始值；添加 `ipcMain.on('set-background-color', ...)` handler 供 renderer 切换主题时同步。
  - **Browser 层**：`src/renderer/src/assets/main.css` 给 `html` 加 `@apply bg-background; height: 100%`（此前没有 html 背景色，缩放时露出 Chromium 默认白色）；`body`/`#root` 从 `min-height: 100vh` 改为 `height: 100%`（修等高撑满，避免内容区短时出现下方空白）。
  - `src/preload/index.ts` 和 `index.d.ts` 添加 `setBackgroundColor: (color: string) => void`；`App.tsx` 主题 `useEffect` 切换时调用 `window.api.setBackgroundColor(dark ? BG_DARK : BG_LIGHT)`。
- 验证：`npm run build` 通过，已提交并 push。

### 2026-06-21 阶段（应用内文件整理 — 文件管理器化第一片）

分支 `feat/archive-source-layer`，commit `c68d762`（功能 + 本段文档，已 push）、`9e808d1`（前一轮文档同步）。注：本机 git push 在 sandbox 内连不上 GitHub（LibreSSL SSL_ERROR_SYSCALL），由用户在终端 `! git push` 手动推成功。

- **main 文件操作（`src/main/library.ts` 末段 + IPC）**：`rename` / `move` / `createFolder` / `trash` 四个真·本地文件操作。统一越权校验 `assertWithinRoot`（规范化后必须落在 `currentRoot` 内，防路径穿越）+ `sanitizeName`（禁分隔符/`.`/`..`/超长，**空格放行**——漫画名常含空格）。删除走 `shell.trashItem`（进系统废纸篓，可还原）。重命名顶层「部」时迁移其 `seriesMeta` 覆盖键；单文件卷重命名自动补回原扩展名。
- **preload + 类型**：`window.api.library.rename/move/createFolder/trash`（`index.ts` + `index.d.ts`）。
- **renderer（App.tsx LibraryView）**：卷册卡片右键菜单（重命名 / 移动到… / 删除），部卡片右键菜单补（重命名 / 删除，与既有「编辑信息」并列——注意「编辑信息」是改 `seriesMeta` 覆盖不动文件，「重命名」才真改文件夹名）；顶栏加「新建文件夹」按钮（部视图建子文件夹、库根视图建新「部」）。多选时右键命中已选卷 → 对整组移动/删除。移动目标 = 其他「部」（弹框列表点选）。删除走 AlertDialog 二次确认。操作后 `refreshAfterFileop`（部视图重扫 / 卷视图刷卷）。错误码经 `fileopErr` 翻译，新增 `uiText.*.fileops` 中英文案。
- **交互踩坑（重要）**：卡片右键 `ContextMenu` 在带框选逻辑的 `gridWrap` 内，Radix 把菜单内容 portal 到 body，但 **React 合成事件按组件树冒泡**回 `onWrapPointerDown`，被误判为「点空白」→ 起框选 + `setPointerCapture` 吞掉点击 → 菜单项点了没反应、菜单不收起（只有「新建文件夹」工具栏按钮正常）。修法：`onWrapPointerDown` 开头加 `if (!wrap.contains(e.target)) return` 放行 portal 事件（对所有 portal 内容通用）。另留 `deferOpen`（菜单关闭那帧延一拍开弹框）作双保险。
- 验证：`npm run typecheck` + `npm run build` 通过，改动区无新增 lint 错误；**用户已手测通过**（重命名/移动/删除/新建文件夹）。
- 待办（第二片，backlog）：拖拽移动；移动框里「新建文件夹并移入」；批量重命名；移动到任意层级（当前仅「卷→其他部」）。**用户要求：下次开工前先逐项对清交互细节再实现，别直接开做。**

### 2026-06-21 阶段（队列持久化 + 中断恢复 + 文件管理器式交互）

分支 `feat/archive-source-layer`，commit `6c8e4e8`（队列持久化）、`0ec9734`（顶栏拖动）、`c5f5014`（文件管理器交互）。

- **转换队列持久化**：`src/main/queue.ts` + `userData/queue.json`，调度仍在 renderer `useConvertActivity`。关窗即退出应用（`window-all-closed→app.quit()` 含 macOS），使「关窗==重启」成立。
- **中断恢复（不自动跑）**：`queue:load` **每次**把未完成任务（queued/converting）标为 `interrupted`（不用进程级守卫——实测 macOS Cmd+W 不退进程）；renderer 启动弹 toast「N 个被中断，继续/不继续」+ 活动浮窗警示角标 + 每条「继续」。配套：`artifacts.ts` 在发起转换的 `event.sender` 销毁时取消该卷，杜绝孤儿转换 + 双跑。启动清扫 `converted/<部>/tmp_*` 孤儿目录。
- **多本确认弹窗**：单本走单本确认弹窗、多本走批量确认弹窗（共享漫画名/作者 + 各卷书名预览）。
- **文件管理器式交互**：双击进入（部→卷、卷→阅读器）、单击选中（整卡为单位，封面 ring + 标题反白底 `bg-accent`）、Cmd/框选多选、空白单击取消、全程 `select-none`；网格弃 Radix ScrollArea 改原生滚动容器（修「下方空白命不中」）；去掉顶栏「选择」入口与封面单独转换按钮；活动浮窗 idle 图标 → `ArrowDownUp`。
- **窗口拖动**：内容顶栏空白可拖（面包屑容器去 no-drag、仅可点元素 no-drag）。
- 验证：`npm run build` 通过；手测队列中断恢复 + 交互。**未 push**（本机 git push 走 TLS 被环境中断，curl 通、git 不通，待用户自行 push）。

### 2026-06-21 阶段（压缩包打磨 + 封面缩略图 + 书籍元数据 + 每部信息编辑）

分支 `feat/archive-source-layer`，两个 commit（`d4c9b57` 压缩包/缩略图、`bff13ca` 元数据）。

- **分卷压缩包**：识别数字分卷（`name.7z.001/.002…`）、RAR 新式（`partN.rar`）、RAR 旧式（`.rar+.r00…`）；库只展示入口卷（`isSplitContinuation` 隐藏续卷），解压喂入口由 7za 自动拼卷；缓存 hash 纳入所有分卷指纹。
- **防挂起**：统一 `run7za` 主动关闭子进程 stdin（否则加密包等待密码输入挂死，曾导致整库扫描卡空白）；列举/测试加超时。
- **解压进度**：`7za x -bsp1` 流式百分比 → `archive:progress` IPC → 解锁框进度条 / toast 实时显示（带卷册名 + 完成/失败提示）；去掉解压前 `7za t` 整包校验那一遍，进度即时开始、总耗时约减半。
- **中文密码**：解锁框改 `type=text` + `-webkit-text-security` 掩码（`type=password` 在 macOS/Chromium 强制英文输入法），加明文切换。
- **封面缩略图**：`comic://` 加 `thumb=1` 通道，sharp 降到 480px webp 缓存 `userData/thumbs/`；网格封面改走缩略图，大图库（单页约 4MB/1700 万像素）加载与交互卡顿显著缓解，阅读器仍走原图。
- **书籍元数据**：`artifacts.ts composeBookTitle` 把 EPUB `dc:title`/文件名合成「漫画名 + 卷册」，`dc:creator`=作者（之前断点：只用 volumeTitle、seriesTitle 未进 EPUB）；单卷转换前弹「确认书籍信息」框预填可改，底部小卡片预览。
- **每部信息编辑**：`library:setSeriesMeta` 把名称/作者覆盖存 `settings.json` 的 `seriesMeta`，扫描时叠加，不改本地文件夹名；入口=库网格右键或进入该部后顶栏铅笔。
- 验证：`npm run typecheck` 通过；7za 分卷拼卷 + 753MB 加密包流式进度（22 个进度点）实测正确。

### 2026-06-20 阶段（压缩包来源 CBZ/ZIP/CBR/7z + 加密支持）

- 新增 `src/main/archive.ts`：内置 7-Zip（`7zip-bin`）解压 CBZ/ZIP/CBR/7z，含**加密 zip**；解出图片落 `userData/extracted/<hash>/`（路径+mtime+size 缓存 + `.manifest.json`），阅读器/封面/转换共用。
- **共享密码池**：密码经 `safeStorage` 加密存 `settings.json` 的 `archivePasswords`；解加密包时逐个 `7za t -p` 试，命中提队首；全不中弹框补录（可勾「记住」）。标准 zip 加密头不加密，扫描时 `l -slt` 即可拿页数 + 加密标志，库网格标 `locked`。
- 接入数据流：`library.collectVolumeImagePaths`/`listPages` 对 file 卷走缓存，`listVolumes` 补 `pageCount`/`locked`/缓存封面；`comic://` 放行解压缓存目录；新增 IPC `archive:prepare`/`archive:unlock` + preload + 类型。
- renderer（App.tsx LibraryView）：阅读/转换/批量转换前置 `ensureArchiveReady`（prepare→needs-password 弹解锁对话框→unlock），压缩包卡片显示压缩包/锁占位图标，解锁后刷新网格；新增 `uiText.*.archive` 文案（中英）。
- 打包：`electron-builder.yml` `asarUnpack` 放行 `node_modules/7zip-bin/**`；运行时把 `path7za` 的 `app.asar` 替换为 `app.asar.unpacked`。
- 验证：`npm run build` 通过；`7za` inspect/test/extract 逻辑对加密/明文/中文名 zip 实测正确；electron 启动无报错。PDF/EPUB 仍按 file 卷显示但不解析（renderer 提示暂不支持）。

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

**Git 推送（2026-06-21）**：macOS 自带 `/usr/bin/git` 用 LibreSSL，跟 GitHub 握手会间歇性被重置（`LibreSSL SSL_ERROR_SYSCALL`；读操作/curl 基本正常、push 易挂）。已设全局 `git config --global http.version HTTP/1.1` **降低概率但未根除**——push 仍可能偶发失败，**失败就重试，一般几次内成功**（实测重试到第 3 次过）。提交身份已规整为全局 `user.name=olart` / `user.email=247497017+odoalive-art@users.noreply.github.com`（GitHub 隐私 noreply，关联 `odoalive-art`、不漏真实邮箱/主机名）。

**待办提醒**：本分支领先 `main` 的历史已于 2026-06-21 改写过作者身份（旧的 `linweiqiang@…local` → noreply）并 force-push；本地留了备份分支 `backup/pre-author-rewrite`（指向旧 tip），用户确认无误后可 `git branch -D backup/pre-author-rewrite` 删除。**下次接力时若该分支仍在，提醒用户是否删除。**

`设计组件` 和 `基础规范` 都是开发期提效页面，不是终端用户产品功能。

浏览/阅读/转换（图片 + CBZ/ZIP/CBR/RAR/7z 压缩包含分卷→EPUB，书名+作者元数据）/队列持久化（含中断恢复）/应用内文件整理第一片（右键重命名/移动/删除到废纸篓/新建文件夹/移动框新建文件夹并移入）/归档/投递（SMTP + Send to Kindle 网页通道）/扩展功能入口壳 闭环已实现；仍未实现：元数据存储/索引、PDF/EPUB 来源、图像放大（waifu2x，待接入扩展功能页）、转换后自动投递、文件整理第二片（拖拽/批量重命名等）。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`。

## 下一步建议

1. **应用内本地文件夹整理**：第一片已落地（重命名/移动/删除到废纸篓/新建文件夹/移动框新建并移入）。第二片（backlog）：拖拽移动、批量重命名（因卷名错标问题对话中暂缓，UX 方案未定）、移动到任意层级——**下次开工前先把交互细节逐项对清楚再实现，别直接开做**。
2. **扩展功能（extensions）页**：已建入口壳，waifu2x AI 放大待填充。
3. 转换后自动投递（可选开关）。
4. PDF/EPUB 来源（需光栅化，依赖更重）；压缩包来源已覆盖 CBZ/ZIP/CBR/7z。
5. 压缩包来源打磨：解压缓存 + 缩略图缓存的清理/容量上限；设置页管理已记住的密码池；扫描时为非加密包补封面（当前压缩包封面仍在首次打开后才出现）。
6. 视情况引入漫画元数据库/索引，替代每次实时扫描。
7. 阅读器增强：双页「封面单独成页」、缩放/适配宽度、沉浸模式、Home/End 跳首末页。
8. 网页推送小打磨（可选）：蒙层/确认框文案接 i18n（当前 main 进程硬编码中文）；关闭确认改成「仅有已填入未发送文件时才弹」。
9. 批量转换弹窗已实现（共享漫画名/作者 + 书名预览）；若需**逐卷**书籍信息编辑可再做。

## 验证命令

```bash
npm run typecheck
npm run build
npm run dev
```
