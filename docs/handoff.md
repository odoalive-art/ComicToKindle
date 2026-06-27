# 交接记录

## 快照

日期：2026-06-27

ComicToKindle **核心闭环已打通**，且**已可打包内测**（macOS dmg，ad-hoc 签名，`npm run release:mac` 一键出包，当前 `0.1.0-beta.2`）：托管漫画库浏览 → 阅读器 → 卷册转 Kindle 固定版式 EPUB → 归档 → 投递到 Kindle（SMTP 邮件 / Send to Kindle 网页通道二选一）。最新一轮（2026-06-25，导入增强）已实现导入预览目标选择（散卷 / 已有部 / 新建部）和库内容区外部拖放导入；拖放路径通过 preload 暴露的 Electron `webUtils.getPathForFile(file)` 获取，按钮导入和拖放导入共用扫描 → 预览 → 导入管线。此前同日分支 `feat/scan-managed-volumes` / PR #2 已把漫画库收敛为 Eagle 式 `.ctklib` 托管库包：导入复制成桶，分组/书名/作者/排序只写 manifest，卷册软删除进库内 `trash/`，旧文件视图与本地文件整理 IPC 已移除；同轮完成 Shift 范围多选、Cmd/Ctrl+A 只全选漫画、Delete 删卷/部、删除部可选连内部卷册一并移入回收站、网页式快捷键收敛、Cmd/Ctrl+R 复用为「重命名选中项」。4 项托管库交互实测已全部通过（多分卷导入读/转、manifest 损坏重建、导入中断自动清 `.tmp`、改名/分组/排序不改用户漫画内容且 bookId 桶路径稳定）。2026-06-23 新增 **PDF 单文件来源 + 图片型 EPUB 来源**，并把 macOS 内测打包改为 **dmg-only + 构建时间戳防覆盖 + dmg 内置版本说明.txt + 自动清理非 dmg 产物**；2026-06-22 完成打包内测准备、包体瘦身、开发期演示页移出生产包、移动框「＋新建文件夹并移入」、UI 清理和窗口缩放白边修复。最新一轮（2026-06-27，分支 `feat/convert-workbench`）把库模型简化为「书（单册，自带书名+作者）+ 文件夹（纯收纳，无作者，作者跟书走）」，转换书名收为单一字段、转换工作台改独立模态弹窗、单本编辑统一为「编辑信息」(书名+作者) + 多选「批量设置作者」。

## 已完成

### 2026-06-27 阶段（库模型简化 + 转换台模态弹窗，分支 `feat/convert-workbench`）

- **转换书名单字段**（commit `86ea1e5`）：`Artifact`/`ConvertRequest`/`PersistedConvertJob`/渲染层把 `seriesTitle`+`volumeTitle` 收为单一 `title`；转换不再 `composeBookTitle` 拼接，直接以 `title` 作 EPUB 书名；`seriesName`（输出目录名）保留；旧 artifacts.json/queue.json 读取时自动折成 `title`。
- **库模型简化**（commit `169f941`）：取消「部/系列」特殊身份——`SeriesNode`/`LibrarySeries` 去掉 author，文件夹成纯收纳容器；每本书自带书名+作者（复用 `book.json.seriesAuthorHint`），**作者跟书走**：建/移入/解散/重命名文件夹只改归属 hint、不碰作者。新增 `setBookMeta`(书名+作者) / `setBooksAuthor`(批量) IPC。卡片里外统一为「书名+作者」+ 页数封面角标；文件夹卡只显名字+册数。转换预填用书自带书名（不再拼文件夹名）。
- **转换台改模态弹窗 + 单本编辑统一**（commit `80946ae`）：转换工作台从整页接管改为应用内模态 `Dialog`（顶栏瘦身、Esc/遮罩关闭、编辑单元格时 Esc 只取消编辑）；夹内单本右键由「重命名」改为「编辑信息」(书名+作者)，与散卷一致，`Cmd/Ctrl+R` 单选任意书皆开「编辑信息」；移除旧的纯重命名 `renameReq`（文件夹仍走「重命名文件夹」）。
- 验证：`npm run typecheck` 通过；尚未真机 `npm run dev` 实跑。文档/记忆已随本轮同步（AGENTS.md、architecture.md、roadmap.md、operator-runbook.md、README.md + 记忆）。

### 2026-06-25 阶段（导入增强：目标选择 + 外部拖放）

- **导入目标选择**：导入预览弹窗新增「导入目标」选择，根视图默认散卷，部内导入默认当前部，可选已有部或「＋ 新建部…」。选新建部时就地展开部名输入框；部名为空会阻止提交。
- **后置归属**：`library:import` 仍先复制成桶并进入散卷；renderer 取得返回的 `bookIds` 后，已有部走 `library:assignBooks(ids, seriesId)`，新建部走 `library:createSeries(title, null, ids)`，不改导入复制主流程。
- **外部拖放导入**：托管库内容滚动区接收 Finder/桌面拖放，拖入时显示虚线高亮遮罩和「拖放到此处导入」文案；drop 后复用同一个扫描/预览弹窗，目标选择、删源勾选和进度条保持一致。
- **Electron 路径桥接**：preload 从 `electron` 导入 `webUtils`，暴露 `window.api.library.getPathForFile(file)`；renderer 不依赖已移除的 `File.path`。
- **多路径扫描**：`library:scanImport` 支持 `string | string[]`；数组路径按现有文件选择框多选逻辑合并 `candidates/skipped`。
- **部内刷新**：导入完成后复用 `refreshAfterFileop()`，刷新顶层 manifest 和当前部卷册列表，避免部内导入后页面不更新。
- **实体列表防溢出**：`EntityListDialog` 增加 `min-w-0`、文本截断/折行、右侧操作区收缩保护，修复库内回收站长标题 + Restore 按钮横向撑出弹窗的问题；协作规则同步要求左右布局优先压缩信息文本，不挤走交互入口。
- **移除列表模式**：漫画库顶层不再提供「列表视图 / 图标视图」切换，保留单一书架网格，删除对应状态、localStorage key 使用、列表渲染分支和文案。
- **顶层框选放开**：`所有漫画` 顶层也可空白拖动框选散卷卡；部文件夹不进入批量卷册选择，避免批量转换/移动误作用到部。
- **工具图标统一**：漫画库顶栏图标改用 `text-muted-foreground`，顶栏与右键菜单 Lucide 图标线宽统一为 `strokeWidth={1.75}`，保留警示类状态色。
- **文案与文档**：补中英文 UI 文案；更新 `AGENTS.md`、`docs/architecture.md`、`docs/roadmap.md`、`docs/release-notes.md`、`docs/plan-import-enhancements.md`。
- 验证：`npm run typecheck`、`npm run build` 通过；用户已验收导入增强、列表模式移除、实体列表防溢出和图标线宽调整。待完全重启 `npm run dev` 后补打包 dmg 中 `webUtils.getPathForFile` 验证。

### 2026-06-25 阶段（库交互打磨 + 桌面化快捷键收敛）

分支 `feat/scan-managed-volumes`（已 push，PR #2 → main）。本轮均经 `npm run typecheck` + eslint，建议合并前真机过一遍。

- **多选**：卷卡支持 Shift+单击范围选择（锚点可反复收放，Cmd/Ctrl 叠加）；Cmd/Ctrl+A 顶层散卷与部内卷册都只全选漫画卷、不再整页全选；Delete/Backspace 删除选中卷（macOS 退格适配）。
- **桌面化收敛**：全局 `user-select: none`（输入框/textarea/contenteditable 例外，个别处用 Tailwind `select-text` 放开）；主进程 before-input-event 拦掉刷新/缩放/打印（详见 architecture「运行层」）。
- **Ctrl/Cmd+R 复用为重命名**：主进程拦截刷新后转发 `app:rename-selected` IPC（preload 加 `onRenameShortcut`），渲染层按单选项映射——单选「卷」→重命名弹窗、单选「部」→编辑信息；未选/多选/输入聚焦/阅读中不触发。兜底图闪现随重载禁用一并消失。
- **删除文件夹可选删内部**：`deleteSeries(seriesId, deleteBooks)` 新增第二参；删除「部」弹窗加勾选「同时删除文件夹内的卷册」——默认仍解散（卷册回散卷），勾选则 trashBooks 移入库内回收站。Delete 键现也能删单选的「部」。
- **空状态/弹窗组件沉淀**：空状态统一为可配置 `PageEmpty`（icon/title/label/actions 按需）；导入卷册与回收站弹窗沉淀为通用 `components/EntityListDialog.tsx`（标题/描述/条目列表/附加模块/按钮组全可配）。
- **性能**：多选未选中项压暗由 `filter: brightness` 改半透明遮罩 + `transition-opacity duration-300`，消除首次进入多选时逐张封面建合成层的卡顿。
- **修复**：部卡片 `<button>` 加 `outline-none` 去掉点击后框住图文且不消失的原生焦点描边；submitDelete 成功后清掉多选态与部选中态，避免残留已删 path 让计数变脏。
- **托管库包实测**：4 项交互实测已全部通过：①多分卷导入读/转 ②`library.json` 损坏后从桶 `book.json` 重建 ③导入中断只残 `.tmp` 且下次打开自动清理 ④改名/分组/排序不改用户漫画内容，bookId 桶路径稳定。

### 2026-06-24 阶段（Eagle 式 `.ctklib` 托管库包阶段 1）

分支 `feat/scan-managed-volumes`。

- **库包骨架**：`src/main/library.ts` 接入 App 独占 `.ctklib` 库包，结构为 `library.json` + `books/<bookId>/book.json` + `source.*`/`images/` + `trash/`。`settings.json` 新增 `libraryPackagePath`，启动读取 `library:getSaved`，不再自动使用旧 `libraryRoot`。
- **原子写与恢复**：`library.json`、`book.json` 写入走 `*.tmp` → rename；导入桶先落 `books/<id>.tmp/`，复制完成后 rename 为正式桶。打开库包会清理残留 `.tmp` 桶；`library.json` 缺失/损坏时遍历各桶 `book.json` 重建 manifest。
- **导入扫描与复制**：新增 `library:scanImport` / `library:import` / `library:importProgress`。扫描只识别候选不动源文件；导入把 CBZ/ZIP/CBR/RAR/7z/PDF/图片型 EPUB 复制为 `source.*`，散图文件夹复制为 `images/`。分卷压缩包会复制入口卷和续卷。导入完成全部进 `ungrouped` 散卷。
- **兼容旧阅读/转换链路**：`.ctklib` 下旧 `scan/listVolumes` 被改为 manifest 投影；卷册 `path` 直接指向桶内 `source.*` 或 `images/`，因此 `listPages`、`archive:prepare`、`collectVolumeImagePaths`、`convert:volume` 继续复用。
- **comic:// 安全收口**：托管库只放行库包内 `books/`，并继续放行 `userData/extracted/` 与 `userData/documents/` 缓存；不再放行整个库包根。
- **renderer 最小阶段 1 接线**：空状态提供「新建库包 / 打开库包」；托管库根不进入旧文件视图；顶栏提供「导入卷册」，用轻量确认框展示“导入 N / 跳过 M”，导入后重拉 manifest。旧物理文件整理入口在托管库下会被拦截并提示后续阶段接入，避免误动桶内源文件。
- **阶段 2 manifest 操作**：新增 `library:createSeries/renameSeries/deleteSeries/assignBooks/reorderSeries/reorderBooks/renameBook`。建部、解散部、卷册移入/移出、改部名/作者会同步 `library.json` 与桶内 `book.json` hints；卷册改名只写 `book.json.displayName`，不移动源文件。
- **阶段 2 UI 接线**：现有库 UI 可新建部、编辑部名/作者、右键卷册改显示名、移入已有部，或在移动弹框里“新建部并移入”。部的删除在托管库中语义为“解散部，卷册回散卷”；卷册菜单里的删除暂作为“移回散卷”过渡，真正库内软删除留给阶段 3。
- **阶段 3 部分收口**：新增 `library:trashBooks`，卷册删除会把桶移动到库内 `trash/` 并从 manifest 摘除；导入流程改为预览弹窗，展示候选卷册与跳过数量，并提供“导入完成后删除源文件或源文件夹”复选项。打开库包时清理 `books/*.tmp` 和残留 `library.json.tmp`。
- **库内回收站 UI**：新增 `library:listTrash/restoreTrashBooks/emptyTrash`，顶栏可打开“库内回收站”弹窗，列出已软删除卷册、单项还原或清空。还原会读取 `book.json` hints，尽量回到原部；找不到原部时会重建部，无 hint 则回散卷。
- **排序 UI**：右键菜单新增“上移 / 下移”，顶层部调用 `reorderSeries`，顶层散卷和部内卷册调用 `reorderBooks`，排序只写 manifest，不移动桶目录。当前书架网格和部内网格都已接入。
- 验证：`npm run typecheck`、`npm run build` 通过；4 项托管库交互实测已全部通过。
- 收口：旧文件视图和本地文件操作 IPC 已移除，后续不要再按本地文件夹整理模型扩展。

### 2026-06-24 阶段（库根目录网格 + 左树导航统一 + 交互收口 + PDF 封面修复）

分支 `feat/archive-source-layer`。

- **扫描机制重构**：`src/main/library.ts` 用 `classifyDir`/`listChildren` 递归判定目录角色（直接含图片或 cbz/pdf/epub 单文件=卷；自身无漫画但子树里有=可下钻的部；整棵无漫画则隐藏），替代旧的固定两级约定。修正：直接含图的文件夹一律判为卷；只含单文件的文件夹判为部（该文件作其下一卷）。`scan`/`listVolumes` 现返回 `LibraryEntry[]`（可含子部）。
- **书架视图多级下钻**：前端 `selected` + 新增 `trail` 路径栈，部里可再进子部，面包屑显示完整路径、各级可点回；`FolderStackCard` 复用书摞卡。
- **重新扫描刷新修复**：`rescan` 改为复用 `refreshAfterFileop`，重扫时同步刷新顶层 + 当前打开的部卷册 + 已展开各部缓存（原先在卷册视图内重扫不生效，须退回再进）。
- **PDF 封面首次不渲染修复（/verify 实测发现）**：`document.ts` 三处 PDF 函数误用 `doc.destroy()`，但 pdfjs v6 的 destroy 在 `loadingTask` 上——`finally` 抛错吞掉已渲染好的封面/页面（封面已落盘故二次进入才显示；整本转换的 `writeManifest` 也永不执行）。改为 `task.destroy()`。
- **Eagle 式忠实磁盘整理能力**（用户反馈：现有库整理不如 Finder 顺手，以 Eagle 为标杆）：数据层加 `library:listSubdirs`（树）/`library:listDirRaw`（目录网格数据），1:1 映射磁盘不隐藏不折叠。左侧边栏「所有漫画」即文件夹树根（shadcn Collapsible + SidebarMenuButton + SidebarMenuSub 范式，参考 sidebar-07，单击定位目录、双击行或点右侧箭头展开其下文件夹）；拖卡片到树/文件夹卡=移动（封面 `<img>` 设 `draggable=false` 防劫持拖拽）。导航状态由 App 层 `FileNavContext` 跨边栏与内容区共享，文件操作后 version 自增触发两侧重载。复用现有 `library:rename/move/createFolder/trash`。
- **左树导航与内容网格合并**：按用户确认，左侧文件夹树不再代表另一套内容区交互，而是类似面包屑/目录定位器；右侧内容区统一使用书架网格的卡片样式、单击选中、Cmd/Ctrl 累加、框选、空白取消、ESC、右键菜单和拖拽语义。`listDirRaw` 扩展 `plainFiles`，左树进入目录时同一套网格忠实展示子文件夹、可读漫画单文件、普通文件和图片文件；所有直接文件/文件夹都可点击、选中、右键，普通文件仅做整理，不双击打开。
- **移除默认智能书架根**：按用户确认，`所有漫画` 不再进入 `fileDir === null` 的智能书架页；库根加载后直接设为 `fileDir = root`，边栏「所有漫画」和内容区面包屑根都落到同一个库根目录网格，避免同名入口出现两种页面。递归识别逻辑仍用于可读卷册、封面和转换元信息。
- **目录网格交互收口**：移除 `[Read this folder]` 自身可读卡；单个卡片选中仅高亮，选中 2 个及以上才进入多选顶栏；卡片封面不再显示 checkbox、文件夹 `x 项` 和普通文件扩展名标签；选中从 click 提前到 pointerdown，按下即反馈，拖动已选多选组时不先打散选择。
- **左树细节收口**：去掉节点前文件夹图标，展开箭头移到右侧；可展开行单击定位目录、双击展开/收起，箭头单击展开/收起；可展开行使用默认光标并禁文本选区，避免 hover 变文本光标或双击选中文字。
- 验证：`npm run typecheck`、`npm run build` 通过；`/verify` 真机实测确认递归扫描判定/空目录隐藏/PDF 封面首渲染/三层下钻 + 面包屑/重扫即时刷新；文件视图的树/网格/下钻/「所有漫画」即树根经截图实测，拖拽移动由用户手动确认。
- 待办（用户反馈中提到、未做）：文件视图树节点的右键菜单；边栏收成图标条时树的显隐；标签/智能文件夹（第一版明确不做）。

### 2026-06-23 阶段（PDF/图片型 EPUB 来源）

- **文档来源层**：新增 `src/main/document.ts`，PDF 用 `pdfjs-dist` + `@napi-rs/canvas` 渲染为 PNG 页面缓存；图片型 EPUB 用 7-Zip 解包后解析 `META-INF/container.xml` / OPF / spine XHTML 图片引用，抽成页面缓存。
- **统一页面缓存**：文档页面落 `userData/documents/<hash>/pages/`，写 `.manifest.json`；`comic://` 安全白名单放行该缓存目录，封面缩略图、阅读器、转换流水线都可直接复用。
- **库扫描接入**：`LibraryVolume.sourceType` 扩展为 `folder | archive | pdf | epub`；PDF/EPUB 在卷册网格显示独立类型文字，未准备时可轻量统计页数，准备后用缓存首图作封面。
- **IPC 复用**：renderer 仍走 `archive:prepare` / `archive:progress` / `archive:unlock`；`archive.ts` 检测到 PDF/EPUB 时委托 `prepareDocument()`，UI 文案改成通用「准备页面/处理中」。加密密码弹窗仍只用于压缩包。
- **首版限制**：EPUB 仅支持图片型来源；纯文本/重排 EPUB 没有可用本地图片时会提示没有可用页面图片。
- **打包依赖**：`dependencies` 增加 `pdfjs-dist`、`@napi-rs/canvas`、`fast-xml-parser`；`electron-builder.yml` `asarUnpack` 增加 `@napi-rs/canvas` 与平台包；`pack:doctor` 增加依赖白名单和 canvas unpack 检查。
- 验证：`npm run typecheck`、`npm run build`、`npm run pack:doctor` 通过；`npm run build:mac` 连续两次在 electron-builder 外部下载阶段失败（`Client network socket disconnected before secure TLS connection was established`），尚未产出包含 PDF/EPUB 来源的新 dmg。网络恢复后需重跑 `npm run build:mac`，并检查 `app.asar.unpacked` 中的 `@napi-rs/canvas-*` 平台包。

### 2026-06-23 阶段（macOS 内测打包产物整理）

- **mac dmg-only**：`mac.target` 显式设为 `dmg`，`dmg.writeUpdateInfo: false`，`publish: null`，不再产出 mac zip、blockmap、latest/beta yml 等自动更新附属文件。
- **防覆盖文件名**：`dmg.artifactName` 改为 `${name}-${version}-${env.BUILD_STAMP}.dmg`；`scripts/build-mac-dmg.mjs` 每次打包生成 `YYYYMMDD-HHMMSS` 构建标识，同版本重打不会覆盖旧包。
- **dmg 内置版本说明**：新增 `docs/release-notes.md` 作为说明源；`scripts/prepare-dmg-notes.mjs` 生成 `build/release-notes-current.txt`，dmg 根目录显示为 `版本说明.txt`，内容含当前版本、构建时间、构建标识、Git 修订与当前内测说明。
- **更新日志与路线图源**：`docs/release-notes.md` 已升级为可发布 changelog 源，按「亮点 / 新增 / 改进 / 修复 / 已知限制 / 下载」维护；新增 `docs/roadmap.md`，按「已上线 / 正在打磨 / 计划中 / 探索中」维护，未来可直接渲染为官网 `/changelog` 和 `/roadmap`。
- **打包体检与稳发版**：新增 `npm run pack:doctor`（检查依赖分层、dmg-only 配置、版本说明、`BUILD_STAMP`、esbuild native binary）；`release:mac` 改由 `scripts/release-mac.mjs` 执行，先体检和预构建，通过后才递增 prerelease 版本号并正式出 dmg。
- **产物清理与包内排除**：`build:mac` 结束后清理 `dist/` 中非 `.dmg` 项；`electron-builder.yml` 额外排除 `.claude/.gemini`，并剔除 mac arm64 包不需要的 `7zip-bin/mac/x64`。
- 验证：`npm run pack:doctor` 通过；`npm run build:mac` 通过；新产物 `dist/comic-to-kindle-0.1.0-beta.2-20260623-092833.dmg` 挂载后根目录含 `ComicToKindle.app` / `Applications` / `版本说明.txt`；`dist/` 只保留 dmg；包内 7zip 只剩 mac arm64，`.claude/.gemini` 未进入 asar。

### 2026-06-22 阶段（打包内测准备 + 包体瘦身 + 演示页剥离）

分支 `feat/archive-source-layer`，已提交并 push（commit `1df423d`→`c0d452b`）。

- **打包内测就绪**：`electron-builder.yml` 改正脚手架占位符（appId `com.comictokindle.app` / productName `ComicToKindle`）；`mac.identity: null` 走 ad-hoc 签名（Apple Silicon 必须签名才能启动），`build:mac` 内置 `CSC_IDENTITY_AUTO_DISCOVERY=false`（本机有两张同名 Apple Development 证书会报 ambiguous）；新增 `release:mac`（prerelease 版本号 +1 再 build:mac）；版本切 `0.1.0-beta.x`。打包/分发流程见 `docs/operator-runbook.md`「打包与内测分发」。
- **sharp 打包陷阱修复**：`asarUnpack` 增加 `node_modules/sharp/**` 与 `@img/**`——`@img/sharp-libvips-*` 只含 `.dylib` 无 `.node`，electron-builder smartUnpack 会漏，导致打包后 sharp 一调用即崩。
- **包体瘦身 dmg 170→116MB**：`shadcn` CLI 被误置 `dependencies`（拖入 @ts-morph/@modelcontextprotocol/hono 等），加上 recharts/radix 等 UI 库在 asar 与 vite 产物重复。把 `dependencies` 收敛为 main 运行时真正需要的 6 个包，其余全移 `devDependencies`（app.asar 200→8.3MB）；再剔除 7zip-bin 的 linux/win 二进制 + docs/AGENTS.md/\*.tsbuildinfo 等开发文件。
- **开发期演示页移出生产包**：`App.tsx`（曾 12263 行）拆分——演示页（设计组件/基础规范 + 全部 \*Preview，约 7800 行）抽到 `src/renderer/src/dev/Showcase.tsx`，经 `import.meta.env.DEV` 门控的 `React.lazy` 加载；`uiText`+`LanguageMode` 抽到 `src/renderer/src/i18n.ts`。生产构建该懒加载分支为死代码 → Rollup 不产出 chunk，recharts/embla/cmdk 等重依赖完全不进包。主渲染包 3.3→1.3MB，冷启动白屏明显缓解。侧栏 `groupDevMode` 同样按 DEV 隐藏。
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
- 验证：`npm run build` 通过；`7za` inspect/test/extract 逻辑对加密/明文/中文名 zip 实测正确；electron 启动无报错。当时 PDF/EPUB 尚未解析，已在 2026-06-23 后续阶段补齐。

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

- 漫画库数据层 `src/main/library.ts`：注册 `comic://` 协议（库根越权校验）；递归判定部/卷（`classifyDir`/`listChildren`），自然排序、封面首图、递归页数；IPC `library:pickFolder/getSavedRoot/scan/listVolumes/listSubdirs/listDirRaw/listPages`（后两者供文件视图忠实列盘）；库根目录持久化到 `userData/settings.json`。
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

浏览/阅读/转换（图片目录 + CBZ/ZIP/CBR/RAR/7z 压缩包含分卷 + PDF + 图片型 EPUB → Kindle 固定版式 EPUB，书名+作者元数据）/队列持久化（含中断恢复）/`.ctklib` 托管库包（导入复制成桶、manifest 分组/改名/排序、库内回收站）/归档/投递（SMTP + Send to Kindle 网页通道）/扩展功能入口壳闭环已实现；仍未实现：元数据存储/索引、纯文本/重排 EPUB、图像放大（waifu2x，待接入扩展功能页）、转换后自动投递、批量重命名。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`。

## 下一步建议

1. **托管库整理体验**：继续打磨批量重命名、导入时选择目标部/新建部、外部拖拽导入等 manifest 级能力；不要恢复本地文件夹整理、文件视图树节点右键或拖拽移动用户文件的旧方向。
2. **扩展功能（extensions）页**：已建入口壳，waifu2x AI 放大待填充。
3. 转换后自动投递（可选开关）。
4. PDF/图片型 EPUB 来源打磨：大 PDF 渲染耗时、特殊字体/页面兼容性、EPUB 目录结构兼容性，以及纯文本/重排 EPUB 的明确提示或后续策略。
5. 压缩包/文档缓存打磨：解压缓存、文档页面缓存和缩略图缓存的清理/容量上限；设置页管理已记住的密码池；扫描时为非加密包补封面（当前压缩包封面仍在首次打开后才出现）。
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
