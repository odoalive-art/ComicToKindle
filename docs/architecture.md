# 架构说明

本文描述 2026-06-23 时点的应用架构。

## 当前范围

ComicToKindle 目前是一个桌面应用工作台，已打通核心闭环:**本地漫画库浏览 → 卷册阅读 → 多来源卷册转 Kindle 固定版式 EPUB → 归档管理 → 投递到 Kindle（SMTP 邮件 / Send to Kindle 网页通道二选一）**。

已实现：

- Electron 应用壳
- React renderer 应用
- main、preload、renderer 的 TypeScript 配置
- Tailwind CSS 4
- shadcn/ui 组件体系
- 构建和打包脚本
- `src/renderer/src/App.tsx` 中的侧边栏工作台壳
- **真实漫画库浏览**：左侧文件夹树 + 忠实磁盘目录网格；`所有漫画` 直接显示库根目录，递归识别逻辑用于可读卷册、封面和转换元信息（详见「漫画库数据层」）
- **压缩包来源**：CBZ/ZIP/CBR/RAR/7z 卷册（含加密 zip、多卷分卷，共享密码池，解压进度）解出图片供阅读 + 转换（详见「压缩包来源层」）
- **文档来源**：PDF 单文件卷册渲染为页面图片；图片型 EPUB 按 OPF spine / XHTML 图片引用抽成页面（详见「文档来源层」）
- **卷册阅读器**：单页 / 双页、左右阅读方向、记住每卷续读进度；网格封面走缩略图缓存
- **转换流水线**：图片目录、压缩包、PDF、图片型 EPUB → Kindle 固定版式 EPUB3，书名「漫画名 + 卷册」+ 作者元数据、转换前确认弹窗（详见「转换与产物层」）
- **漫画信息编辑**：在应用内改每部的名称/作者（持久化覆盖，不改本地文件夹名）
- **归档视图**：列出转换产物，支持在 Finder 显示 / 导出副本 / 删除 / 投递到 Kindle
- **Kindle 投递**：SMTP 配置页（设备与邮箱）+ 归档手动投递（详见「投递层」）
- **Send to Kindle 网页推送**：应用内嵌 Amazon 网页通道（≤200MB 单文件），自动填入产物、半自动发送（详见「网页推送层」）
- 顶栏应用级深浅模式切换
- 顶栏中英切换
- 自定义交通灯窗口控件（通过 IPC 接管关闭/最小化/最大化）
- 开发期使用的 shadcn 组件索引和本地文档镜像
- 开发期使用的基础规范页，覆盖颜色、字体、字号和间距

未实现：

- 元数据持久化（数据库 / 索引；漫画库当前每次进入实时扫描）
- 纯文本/重排 EPUB 解析（当前 EPUB 首版仅支持图片型）
- 图像处理或 AI 放大
- 本地 AZW3 导出（原型曾用 Calibre，已移除；无线投递发 EPUB）
- 自动投递（转换完成即发；当前只支持归档手动投递）

## 运行层

```txt
Electron main process
  src/main/index.ts
  负责 BrowserWindow 创建、应用生命周期、外部链接打开行为和 main-process IPC。
  处理自定义交通灯的 window-close / window-minimize / window-maximize IPC 事件。
  window-all-closed 统一 app.quit()（含 macOS）：关窗即退，让转换队列持久化的「关窗==重启」前提成立。
  app ready 前调用 registerComicScheme()，ready 后调用 setupLibrary() / setupArchive() / setupArtifacts() / setupQueue() / setupDelivery() / setupWebPush()。
  **窗口缩放背景色**：用 nativeTheme.shouldUseDarkColors 在创建窗口时设置 backgroundColor（深色 #09090b / 浅色 #ffffff），
  同时注册 set-background-color IPC 供 renderer 在用户切换主题时同步。

  src/main/library.ts
  漫画库数据层：comic:// 协议（含封面缩略图通道）、目录扫描、库根目录持久化、每部名称/作者覆盖、
  应用内文件整理（rename/move/createFolder/trash，统一 assertWithinRoot 越权校验 + sanitizeName 名称清洗）。
  导出 collectVolumeImagePaths() 供转换流水线按阅读顺序取图（支持嵌套单话子文件夹）。

  src/main/archive.ts
  压缩包来源层：内置 7-Zip（7zip-bin）解 CBZ/ZIP/CBR/RAR/7z（含加密 zip、多卷分卷）到
  userData/extracted/<hash>/，共享密码池（safeStorage 加密存 settings.json），解压进度流式回传。
  导出 prepareArchive/unlockArchive/getCachedImages/inspectArchive/extractedRoot/isArchiveFile/
  isSplitContinuation 供 library 与 IPC 使用。

  src/main/document.ts
  文档来源层：PDF 用 PDF.js + @napi-rs/canvas 离线渲染为 PNG 页面缓存；图片型 EPUB
  用 7-Zip 解包并按 OPF spine / XHTML 图片引用抽取页面，缓存到 userData/documents/<hash>/。
  导出 prepareDocument/getCachedDocumentImages/inspectDocument/documentType 供 library 与 archive IPC 复用。

  src/main/convert.ts
  转换引擎：图片 → Kindle 固定版式 EPUB3。无 IPC、无 electron 依赖，纯函数 convertMangaToEPUB。

  src/main/artifacts.ts
  产物清单数据层：artifacts.json 读写、转换编排（调用 convert.ts）、转换/产物 IPC。
  导出 getArtifactById / setArtifactStatus 供投递层更新状态。

  src/main/queue.ts
  转换队列持久化层：queue.json 读写、启动恢复（未完成任务 → interrupted，等用户确认）、孤儿 tmp 清扫、queue:load/save IPC。
  调度仍在 renderer 的 useConvertActivity hook 内，main 不持调度器。

  src/main/deliver.ts
  Kindle 投递层：SMTP 配置存储（密码经 safeStorage 加密）、nodemailer 发送、投递 IPC。

  src/main/webpush.ts
  Send to Kindle 网页推送层：独立持久 session 的 BrowserWindow 内嵌 Amazon 网页通道，
  CDP（webContents.debugger）拦截文件选择框、自动填入产物，半自动发送、网页推送 IPC。

Preload process
  src/preload/index.ts
  将安全的 Electron API 桥接给 renderer，暴露 window.api.library.* / archive.* / convert.* / artifacts.* / queue.* / deliver.* / webpush.*。
  类型定义在 src/preload/index.d.ts（LibrarySeries / LibraryVolume / Artifact / PersistedConvertJob / DeliveryConfig* / WebPushResult / 各 API 接口）。

Renderer process
  src/renderer/src/
  负责 React UI、Tailwind 样式和 shadcn/ui 组件。
  App.tsx 是应用壳与全部真实功能视图；i18n.ts 存共享的 uiText + LanguageMode；
  dev/Showcase.tsx 存「设计组件 / 基础规范」开发期演示页（经 import.meta.env.DEV
  门控的 React.lazy 加载，生产构建不打包，详见「构建流水线」）。
```

## 漫画库数据层

漫画库的文件系统访问全部在 main 进程，renderer 通过 preload 暴露的 `window.api.library.*` 调用，不直接用 Node API。

**扫描模型**（`classifyDir` / `listChildren`，递归判定，不预设固定层级）：

- **卷（volume / book）**= 目录**直接**含图片，或直接放着 cbz/pdf/epub 单文件；其下「单话」子文件夹由 collectPages 递归收图。`kind: 'folder' | 'file'`，`sourceType: 'folder' | 'archive' | 'pdf' | 'epub'`；file 卷可为压缩包、PDF 或图片型 EPUB，分卷只展示入口卷。
- **部（series）**= 目录自身无漫画、但**子树里**递归地有 → 可下钻容器，**支持任意深度嵌套**（部里可再有子部）。命名通常为 `[作者] 标题`，解析出作者与标题。
- **空目录**（整棵子树都没有漫画资源）→ **不展示**（只识别含真实漫画资源的目录）。
- 顶层书架与「部」下钻共用 `listChildren`，每级返回同构的 `LibraryEntry[]`（书/卷 或 可继续下钻的部）；前端用路径栈 + 面包屑做多级导航。
- **每部名称/作者覆盖**：默认从 `[作者] 标题` 解析；用户可在应用内改写，覆盖存 `settings.json` 的 `seriesMeta`（按部文件夹名为键），扫描时叠加，**不改本地文件夹名**。
- 文件名一律按**自然排序**（`2.jpg` 在 `10.jpg` 前）。

**IPC 频道**（`ipcMain.handle` ↔ `ipcRenderer.invoke`）：

```txt
library:pickFolder    系统目录选择器，选中后写入 settings.json 并返回路径
library:getSavedRoot  读取已保存的库根目录（不存在/失效则返回 null）
library:scan          扫描库根 → LibraryEntry[]（书/卷 或 部，含封面 URL、卷数/页数）
library:listVolumes   列某部下条目 → LibraryEntry[]（可含可继续下钻的子部）
library:listSubdirs   目录树导航：某目录的直接子文件夹（忠实磁盘含空目录）→ DirNode[]
library:listDirRaw    目录网格数据：某目录完整直接内容（子文件夹 + 可读单文件 + 普通文件 + 自身可读）→ RawListing
library:listPages     按阅读顺序递归收集一卷所有页 → comic:// URL[]
library:setSeriesMeta 写某部名称/作者覆盖到 settings.json 的 seriesMeta → 叠加后的 {title, author}
library:rename        重命名部/卷（真改本地文件名）→ 新绝对路径；顶层部改名时迁移 seriesMeta 键
library:move          把若干部/卷移动到目标文件夹（同库内）
library:createFolder  在父目录下新建文件夹 → 新绝对路径
library:trash         把若干部/卷移入系统废纸篓（shell.trashItem，可还原）
```

**应用内文件整理**：`library:rename/move/createFolder/trash` 都先经 `assertWithinRoot`（规范化后必须落在当前库根内，防路径穿越）+ `sanitizeName`（禁分隔符/`.`/`..`/超长，空格放行）。删除走 `shell.trashItem` 进系统废纸篓。renderer 端入口在库网格右键菜单（卷：重命名/移动到/删除；部：重命名/删除）+ 顶栏「新建文件夹」；错误经稳定码→`uiText.fileops` 翻译。注意「编辑信息」(seriesMeta 覆盖、不动文件) 与「重命名」(真改文件夹) 并存。

**comic:// 协议**：`registerComicScheme()` 在 app ready 前注册为 privileged scheme，`setupLibrary()` 内 `protocol.handle('comic', …)` 服务图片。URL 形如 `comic://img/?p=<encodeURIComponent(绝对路径)>`；返回前做**越权校验**——必须是图片扩展名且位于当前库根目录、压缩包解压缓存目录或文档页面缓存目录内，否则 403。带 `&thumb=1` 走**封面缩略图通道**：sharp 把原图降到 480px webp、按 路径+mtime+size 缓存到 `userData/thumbs/`（网格封面用，避免解全图卡顿；阅读器仍走原图）。`src/renderer/index.html` 的 CSP `img-src` 已放行 `comic:`。

**数据模型**（`src/preload/index.d.ts` 为单一事实来源）：

```txt
LibrarySeries  id, path, name, title, author, volumeCount, coverUrl
LibraryVolume  id, path, name, title, kind('folder'|'file'), sourceType('folder'|'archive'|'pdf'|'epub'), pageCount, coverUrl
LibraryEntry   (LibrarySeries & {type:'folder'}) | (LibraryVolume & {type:'book', author})
DirNode        id, path, name, hasSubfolders                 // 目录树节点
RawPlainFile   id, path, name, ext, sizeBytes, coverUrl
RawListing     folders[]（DirNode + childCount/coverUrl）, files(LibraryVolume[]), plainFiles(RawPlainFile[]), self{readable,pageCount,coverUrl}
```

**浏览与目录导航**（同一份库根，内容区统一网格）：

- **目录网格**：走 `listSubdirs`/`listDirRaw`，**1:1 映射磁盘**（不隐藏空目录、不折叠、不强分部/卷）。文件夹树常驻左侧边栏（「所有漫画」即树根），`所有漫画` 与面包屑根都落到库根目录网格；点文件夹相当于切换面包屑定位。内容区复用统一网格的选中、右键、框选、空白取消和卡片样式，并忠实展示该目录的直接子文件夹、可读漫画单文件、普通文件和图片文件。拖卡片到树节点/文件夹卡=移动（复用 `library:move`），导航状态（库根/当前目录/树展开/拖拽源/版本）由 App 层 `FileNavContext` 跨边栏与内容区共享，文件操作后用 version 自增触发两侧重载。
- **递归识别**：`scan`/`listVolumes` 仍用于识别可读卷册、封面、作者/标题覆盖和转换元信息，但不再作为 `所有漫画` 的默认智能书架页面。

## 压缩包来源层

`src/main/archive.ts`，把压缩包卷册（`kind: 'file'`）解出图片供阅读器、封面、转换流水线共用。

- **后端**：内置 7-Zip（`7zip-bin` 打包各平台 `7za` 二进制），支持加密 zip（ZipCrypto/AES）、CBR(rar)、7z。所有 7za 调用经统一 `run7za` 封装并**主动关闭子进程 stdin**——否则加密包会打印 "Enter password:" 阻塞读 stdin 导致永久挂起；列举/测试另加超时兜底。**打包关键**：`electron-builder.yml` 的 `asarUnpack` 放行 `node_modules/7zip-bin/**`，运行时把 `path7za` 里的 `app.asar` 替换成 `app.asar.unpacked`。
- **分卷**：支持多卷压缩包——数字分卷（`name.7z.001/.002…`）、RAR 新式（`name.partN.rar`）、RAR 旧式（`name.rar + name.r00…`）。库视图只展示**入口卷**（`.001`/`.part1.rar`/`.rar`），续卷由 `isSplitContinuation` 隐藏；解压只把入口路径喂给 7za 自动拼接其余分卷。
- **缓存**：解出的图片落 `userData/extracted/<hash>/`，`hash = sha1(所有分卷的 路径+mtime+size)`（任一分卷变更即失效）；完成后写 `.manifest.json`（按阅读顺序的相对路径），存在即视为缓存完整，避免重复解压。`comic://` 协议放行该缓存目录（与库根并列）。
- **密码（共享密码池）**：每个密码经 `safeStorage` 加密存 `settings.json` 的 `archivePasswords`（base64 数组）。解加密包时逐个密码**直接尝试解压**（不再先 `7za t` 整包校验那一遍，进度立即开始），命中即提到队首；全不中返回 `needs-password`，由 renderer 弹框补录（可勾选记住；密码框用 `-webkit-text-security` 掩码以支持中文输入法）。**标准 zip 加密不加密文件头**，故扫描时 `7za l -slt` 不带密码即可拿到图片数 + 加密标志（`Encrypted = +`），库网格据此标 `locked`。
- **进度**：解压用 `7za x -bsp1` 把百分比流式写到 stdout，逐块解析末位 `NN%` 经 `archive:progress` IPC 回传，renderer 在解锁框进度条 / toast 实时显示（带卷册名 + 完成/失败提示）。
- **图片顺序**：解出后递归收集图片，按相对路径自然排序（与文件夹卷一致）。
- **数据流接入**：`library.collectVolumeImagePaths` / `listPages` 对 file 卷改走缓存（缺则用密码池尝试解，仍需密码则抛 `NEEDS_PASSWORD`）；`listVolumes` 的 file 卷补 `pageCount`/`locked`，已解出则用缓存首图作封面。renderer 在阅读/转换前先调 `archive:prepare`，遇 `needs-password` 弹框走 `archive:unlock`。
- **范围**：当前覆盖 CBZ/ZIP/CBR/RAR/7z（含分卷）。PDF/EPUB 由 `src/main/document.ts` 负责准备页面缓存，renderer 仍复用 `archive:prepare` / `archive:progress` 这组 IPC 入口。

**IPC 频道**：

```txt
archive:prepare   确保单文件来源已准备成页面缓存；压缩包会自动试密码池，PDF/EPUB 委托 document.ts → ArchivePrepareResult
archive:unlock    用用户输入的密码解锁压缩包（可记住）；PDF/EPUB 直接复用 prepare → ArchivePrepareResult
archive:progress  准备进度推送（main → renderer）：{ filePath, percent }
```

**数据模型**（`src/preload/index.d.ts` 为单一事实来源）：

```txt
ArchivePrepareResult  status('ready'|'needs-password'|'error'), message?, pageCount?
LibraryVolume         ... + locked?(加密且未解锁缓存)
```

## 文档来源层

`src/main/document.ts`，把 PDF 与图片型 EPUB 规范化为“按阅读顺序排列的图片页”，供阅读器、封面缩略图和 Kindle 转换流水线复用。

- **PDF**：使用 `pdfjs-dist/legacy/build/pdf.mjs` 读取页面，`@napi-rs/canvas` 在 main 进程离线渲染为 PNG，当前渲染 scale=2；缓存落 `userData/documents/<hash>/pages/`，`hash = sha1(路径 + mtime + size + document-v2)`，源文件变化后自动失效。库网格的 PDF 封面只渲染首页（`getPdfCoverImage` → `<hash>/cover.png`）。PDF.js 的 standard fonts / cmaps / wasm 资源随 `pdfjs-dist` 运行时依赖进入包内。**踩坑（pdfjs v6）**：销毁要调 `loadingTask.destroy()`，`doc` 上没有 `destroy`——早期误用 `doc.destroy()` 会在 `finally` 抛错吞掉已渲染好的封面/页面（表现为「PDF 封面首次进入不渲染、返回再进才出现」，且整本页面缓存的 manifest 永不写入）。
- **图片型 EPUB**：EPUB 本质是 zip，仍用内置 7-Zip 解包到临时 raw 目录；解析 `META-INF/container.xml` 找 OPF，再按 OPF spine 顺序读取 XHTML 中的 `<img>` / SVG `<image>` 本地图片引用，复制成 `pages/0001.ext`。若 spine 中找不到图片，则回退按 manifest 中的 image item 顺序抽取。纯文本/重排 EPUB 不在首版支持范围内，最终没有可用图片时返回 `NO_IMAGES`。
- **缓存与协议**：完成后写 `.manifest.json`，`getCachedDocumentImages()` 命中即复用；`comic://` 协议放行 `userData/documents/`，因此文档页可以和普通图片/压缩包图片一样进入封面、阅读器和转换。
- **IPC 复用**：没有新增 `document:*` IPC。`archive:prepare` 在检测到 PDF/EPUB 时委托 `prepareDocument()`；renderer 的阅读/转换前置准备流程保持一致，只把文案改为通用的“准备页面/处理中”。
- **打包关键**：`pdfjs-dist`、`@napi-rs/canvas`、`fast-xml-parser` 属于 main 运行时依赖，应保留在 `dependencies`；`@napi-rs/canvas` 与平台包需要 `asarUnpack`，否则打包后 native canvas 可能加载失败。

## 转换与产物层

转换技术实现移植自既有原型 quirky-planck（仅取经验证的引擎，不继承其设计）。核心判断：**漫画库 = 源，转换产物（EPUB）是派生物**，两者不混在库网格里；库卡片只加「已转换」角标，产物在「归档」视图独立管理。

**转换引擎 `src/main/convert.ts`**（`convertMangaToEPUB`，纯函数、无 electron 依赖）：

- 输出**固定版式 EPUB3**（`rendition:layout=pre-paginated`），每页一张整图 + 一个 xhtml 包装；`content.opf` 带 Kindle 漫画元数据（`book-type=comic`、`fixed-layout`、`primary-writing-mode`、`page-progression-direction`、`cover-image` 等）。
- `sharp` 图像管线：灰度（封面保留彩色）、按设备档位缩放、mozjpeg 压缩。
- 双页拆分：横图按阅读方向切左右两页；按体积分卷：超过 `maxVolumeSize` 切成多个 EPUB。
- `archiver` 8 的 `ZipArchive` 打包，`mimetype` 必须第一个且 `store`（不压缩）。
- 设备档位（`PROFILE_RES`）：pw3/pw5/pw6/**ko3**/oasis/scribe/original；**默认 pw6/ko3 = 1264×1680**。
- 入参是「按阅读顺序的图片绝对路径列表」，由 `library.collectVolumeImagePaths` 提供，因此支持嵌套单话子文件夹。
- 可取消：`convert:cancel(sourceVolumePath)` 把路径加入 `cancelledPaths`，引擎的 `checkCancelled` 在下一张图/下一卷边界处抛 `Cancelled` 中止（非瞬时）。
- 转换选项（设备档位/方向/灰度/双页/质量/分卷上限）由 renderer「转换设置」页存 `localStorage`，转换时作为 `options` 传入；main 用 `DEFAULTS` 兜底合并。引擎参数与 renderer 默认值需保持一致。
- 原型里的 Calibre/AZW3 已移除（无线投递发 EPUB，亚马逊云端自转）。

**产物清单 `src/main/artifacts.ts`**：

- 产物**由应用托管**，落在 `userData/converted/<部>/`，用户无需指定路径。
- 清单 `userData/artifacts.json` 记录「源卷 → N 个产物文件」映射（一个源卷可能因分卷产出多个 EPUB，故 `outputs` 是数组），用于库内角标命中和归档视图。
- **书籍元数据**：EPUB 的 `dc:title` 与文件名 = `composeBookTitle(seriesTitle, volumeTitle)` =「漫画名 + 卷册」（如「朱音落语 第01卷」，卷册名已含漫画名时去重）；`dc:creator` = 作者。单卷转换前 renderer 弹「确认书籍信息」框预填漫画名/卷册名/作者，可改后再转。

**IPC 频道**：

```txt
convert:volume     转换一卷（取图→转换→写清单）→ Artifact；过程通过 convert:progress 事件上报
convert:cancel     请求取消某卷的进行中转换（sourceVolumePath）
convert:progress   main→renderer 进度事件 { sourceVolumePath, percent, message }
artifacts:list     读取清单 → Artifact[]
artifacts:reveal   在 Finder 中显示产物
artifacts:export   选目录导出产物副本
artifacts:remove   删除产物文件 + 清单条目
```

**数据模型**（`src/preload/index.d.ts` 为单一事实来源）：

```txt
ConvertOutput  path, fileName, sizeBytes, volTitle
Artifact       id, sourceVolumePath, seriesName, seriesTitle, volumeTitle, author,
               outputs(ConvertOutput[]), format('epub'), pageCount, createdAt,
               status('ready'|'delivered'|'failed')   // 投递成功置 'delivered'，失败置 'failed'
               // seriesTitle 为解析后的部标题；旧产物无此字段时 UI 回退 seriesName
```

## 转换队列持久化层

`src/main/queue.ts`，把 renderer 的 `useConvertActivity` 队列状态落到磁盘，解决"重启丢未完成排队"的问题。

- **权威源仍在 renderer**：调度（顺序处理、进度订阅、cancel 标志）由 hook 持有；main 只做读写盘 + 启动恢复 + 孤儿清扫。这样改动量最小，状态机不分裂。
- **关窗即退是前提**：转换跑在 main、调度在 renderer，若窗口能关了又开而 main 仍活着，会产生孤儿转换 + 重复入队。故 `index.ts` 的 `window-all-closed` 统一 `app.quit()`（含 macOS），让「关窗 == 进程重启」成立，持久化模型才自洽。
- **落盘**：`userData/queue.json`，`{ version: 1, jobs: ConvertJob[] }`。每次队列结构变化（enqueue / 状态转移 / cancel / dismiss / clearAll / resume / discard）写一次；**进度（percent）不写盘**——renderer 在 save effect 里用 id/status/error 拼 signature 守门，仅 percent 变化不触发写盘。
- **入队冻结 options**：renderer 在 `enqueue` 时把 `loadConvertOptions()` 快照到 `job.options`，调度时取 `job.options ?? loadConvertOptions()`。后续设置页变更不影响已排队任务；持久化恢复的旧 job 无快照时回退当前设置。
- **恢复不依赖进程是否重启（关键）**：`queue:load` handler **每次**都把未完成任务（`'queued'`/`'converting'`）标为 **`'interrupted'`**（percent 清零、清错误）、写回盘再返回（恢复折叠进 load 而非独立异步，也顺带杜绝了与 renderer load-read 的抢跑）。**不能**用「只首次回退」的进程级守卫——因为 macOS 下 Cmd+W 关窗不退应用（`window-all-closed→app.quit()` 在打包态生效，但 dev/webpush 窗口吊着等情况进程仍可能存活），同一进程内重开窗口必须照样拿到 interrupted 才能重弹确认。配套：**artifacts.ts 在发起转换的 `event.sender` 被销毁（关窗/重载）时把该卷加入 `cancelledPaths`**，引擎在下一边界处中止——这样「每次都回退」不会误伤真在跑的转换，也不留后台孤儿转换（否则孤儿续跑写出产物 + 重开同卷重新入队 = 双跑）。
- **interrupted 不自动跑，等用户确认**：renderer hook 启动 `await window.api.queue.load()` 回填——**interrupted 不被调度器拾取**（调度只跑 `queued`），改由 UI 提示用户：启动弹一次 toast「上次关闭时有 N 个转换被中断，是否继续？」（继续 = interrupted→queued 交给调度器；不继续 = 移除），活动浮窗触发按钮显示警示色角标（含 interrupted 计数）、列表内每条 interrupted 带「继续」按钮。
- **孤儿 tmp 清扫**：`setupQueue()` 里异步扫 `userData/converted/<部>/tmp_<id>/` 全部递归 rm（`convert.ts` 的 `tempDir` 命名约定 `tmp_<taskId>`，正常 finally 里清，但上次会话被强制退出会留下）。失败不抛错、不阻塞启动。
- **不做的事**：不做断点续转（已处理的图片/已打包的卷不能跳过）——一卷耗时分钟级，整卷重跑比维护断点状态简单太多。继续 = 整卷从 0 重跑。不做并发，保持 1 路顺序。

**IPC 频道**：

```txt
queue:load   renderer 启动时拉一次（含首次启动恢复 converting/queued→interrupted）→ PersistedConvertJob[]
queue:save   每次结构变化推一份（payload 是当前 jobs 数组）
```

**数据模型**（`src/preload/index.d.ts` 为单一事实来源）：

```txt
PersistedConvertJob  id, sourceVolumePath, seriesPathName, seriesTitle, volumeTitle, author,
                     status('queued'|'converting'|'interrupted'|'failed'), percent, error?,
                     options?(ConvertOptions 快照), enqueuedAt?
```

## 投递层

`src/main/deliver.ts`，技术实现移植自原型 quirky-planck/sender.js（nodemailer）。

- **配置存储**：SMTP host/port/user/Kindle 邮箱存 `settings.json` 的 `delivery` 字段；**密码用 Electron `safeStorage`（系统钥匙串）加密**后存 `passEncrypted`(base64)，绝不明文落盘、绝不回传 renderer。钥匙串不可用时回退 `passPlain`（极少见）。
- **触发**：归档视图每条产物手动投递，可重发；发送一卷的全部 EPUB 后把 `status` 置 `delivered`，失败置 `failed`。无线投递发 EPUB（亚马逊云端自转）。
- **配置入口**：「设备与邮箱」视图（`DeliverySettingsView`），含保存 + 测试连接。

**IPC 频道**：

```txt
deliver:getConfig   读取配置 → { host, port, user, kindleEmail, hasPassword }（不含密码）
deliver:saveConfig  保存配置；password 非空才更新（加密存储）
deliver:testSMTP    nodemailer verify() 测试连接；密码留空则用已存密码
deliver:send        发送某 artifact 的全部 EPUB → 置 status；未配置则报错引导去设置页
```

## 网页推送层

`src/main/webpush.ts`，在应用内嵌 Amazon「Send to Kindle」网页通道。**单文件上限 200MB**（远高于 SMTP 邮件附件），覆盖体积偏大的漫画卷；适合 SMTP 发不动的大卷。

- **独立窗口 + 持久 session**：复用单一 `BrowserWindow`（`partition: 'persist:amazon-stk'`、`sandbox:true`、`contextIsolation:true`），Amazon 登录态长期保留、重启不丢、不污染主窗口。UA 伪装成桌面 Chrome（默认 UA 含 `Electron` 会被 Amazon 边缘网关拦成异常页）。STK 站点 URL 可配置，存 `settings.json` 的 `webpush.url`，默认 `amazon.com/sendtokindle`（美区/全球）。
- **自动填文件（关键技巧）**：STK 页面**没有持久 `<input type=file>`**，点「Add a file」才即时创建 input 并弹系统框。故用 CDP `Page.setInterceptFileChooserDialog` 拦截该选择框，`Page.fileChooserOpened` 时按 `backendNodeId` 用 `DOM.setFileInputFiles` 直接喂入——既绕过系统对话框、又适配「点击才创建 input」的页面。
- **全自动点击**：武装时盖一层黑色蒙层（显示「正在上传…→已填入」进度），逐 frame 跑探测脚本找到并点击上传入口（成功判定挂在真实 `fileChooserOpened` 事件上，对选择器精度更宽容）；超时则撤蒙层退回半自动引导横幅，并把可见候选元素打日志便于调参。
- **登录态水合修复**：Amazon SPA 首次进入常出现「顶栏已登录、上传区仍显示 Sign in」的水合滞后；装 CDP 拦截器**之前**先 `reload` 一次刷出真正的上传控件（reload 在装拦截器后会把 `setInterceptFileChooserDialog` 清掉，故顺序关键）。
- **半自动**：不自动点 Send，避免 Amazon 改版/跳验证时误发或卡死，最后一步由用户在可见窗口点击。
- **关闭接管**：启用 Page 域后 Amazon 暂存文件触发的 `beforeunload` 被 CDP 接管、不再弹给用户（表现为点关闭没反应），故 `Page.javascriptDialogOpening` 一律放行，并自接管窗口 `close`：弹确认框、确认后 `destroy()` 绕过 beforeunload。
- **结果码**：main 只回稳定码（`not-found`/`no-outputs`/`too-large`/`not-signed-in`/`inject-failed`/`unknown`），文案由 renderer 按语言翻译。

**IPC 频道**：

```txt
webpush:getUrl      读取已配置的 STK 站点 URL
webpush:setUrl      保存 STK 站点 URL（空则回默认）
webpush:openBlank   不带文件打开网页（首次登录 / 管理已发送内容）
webpush:open        校验产物（存在 + ≤200MB）→ 打开网页 + 武装自动填入 → WebPushResult
webpush:reveal      兜底：在 Finder 定位产物，方便手动拖入
```

## Renderer 工作区

当前 renderer 是本地桌面工作台，还不是完整产品 UI。

```txt
漫画库（所有漫画）
  真实本地漫画库浏览，采用桌面「文件管理器」式交互（对标 Eagle）。LibraryView 自带合并顶栏
  （面包屑 + 操作图标按钮：编辑 / 转换活动 / 重新扫描 / 切换文件夹）。
  侧栏开合按钮在桌面态位于边栏顶部（不在内容顶栏，使面包屑与网格左缘对齐）；
  仅窄屏（侧栏切 offcanvas，isMobile）时内容顶栏左侧才出现开合入口。
  未设库 → 空状态选目录；已设库 → 「所有漫画」直接显示库根目录网格，面包屑根与边栏入口一致。
  **双击进入**：双击部卡逐级下钻、双击卷卡进 VolumeReader（单页/双页、左右方向、续读、相邻页预加载）。
  **单击选中**：部 / 卷单击高亮（封面 ring 描边 + 标题/作者浅色反白底 bg-accent，整卡为选中单位）；
  部为单选（纯视觉反馈），卷支持多选——Cmd/Ctrl 点累加、空白拖动框选（marquee，pointer capture）、
  Cmd·Ctrl+A 全选；单个选中仅高亮，选中 2 个及以上后顶栏切为「已选计数 + 全选 + 转换所选 + 退出」。
  **空白单击取消选择**；ESC 退出多选。全程 `select-none` 禁原生文本选区（拖动只框选不选文本）。
  网格用原生 `overflow-y-auto` 容器（非 Radix ScrollArea，后者 Viewport `display:table` 使 min-h-full
  失效、内容下方空白命不中）。封面经 comic:// 加载、内描边、显示续读进度条；
  队列中/中断/失败显示状态角标，已转换显示「已转换」图标角标（封面不再放单独转换按钮）。
  转换入口：选中 → 顶栏「转换所选」——单本走单本确认弹窗（含封面预览），多本走批量确认弹窗。

左侧文件夹树导航（忠实磁盘整理）
  左侧边栏「所有漫画」即文件夹树根（shadcn Collapsible + SidebarMenuButton + SidebarMenuSub 范式，
  单击选中库根目录、双击行或点右侧箭头展开/收起其下文件夹）；点任一文件夹相当于切换面包屑定位，
  内容区仍是统一网格（子文件夹 + 可读单文件 + 普通文件/图片文件）。
  1:1 忠实磁盘（不隐藏空目录、不折叠、不强分部/卷）。所有直接文件/文件夹都可点击、选中、
  右键；**拖卡片到树节点/文件夹卡 = 移动**（封面 <img> 设 draggable=false 防其劫持拖拽手势）。
  状态由 App 层 `FileNavContext` 跨边栏与内容区共享（见「漫画库数据层 · 浏览与目录导航」）。

转换活动（队列）
  转换状态由 App 层 hook `useConvertActivity` 管理（队列顺序处理、进度订阅、产物刷新），
  上提到 App 层因此切换视图时队列不中断；队列经 `window.api.queue.load/save` 持久化到
  `userData/queue.json`，重启后未完成任务标为 interrupted 等用户确认（详见「转换队列持久化层」）。
  库顶栏右上角「转换活动」浮窗（ConvertActivityPopover，idle 图标 BookOpenCheck，进行中 spinner、
  仅中断时 AlertCircle 警示角标）合并展示进行中（排队/进度/中断可继续/失败可重试，每条可取消、
  顶部可「清空」）+ 最近完成（投递/在 Finder 显示/删除），底部「查看全部归档」跳归档页。
  产物显示用「部标题 · 卷」（artifactLabel）。取消的任务静默移除（不弹失败 toast）。

归档（ArchiveView）
  列出 artifacts.json 中的转换产物（卷名/部/文件数/页数/大小/时间/状态）。
  每条操作：投递到 Kindle（SMTP）/ 网页推送（Send to Kindle）/ 在 Finder 中显示 / 导出副本 / 删除。
  转换活动浮窗（ConvertActivityPopover）的「最近完成」条目也带「网页推送」入口。

网页推送（WebPushView）
  Send to Kindle 网页通道的着陆/设置页：使用步骤说明 + STK 站点 URL 配置（webpush:setUrl）
  + 「打开网页」按钮（webpush:openBlank，首次登录/管理已发送内容）。
  实际填文件由 webpush:open 在 main 进程的网页窗口里完成（见「网页推送层」）。
  侧边栏入口在「Kindle 推送」组。

转换设置（ConvertSettingsView）
  设备档位 / 阅读方向 / 灰度 / 双页拆分 / 图片质量 / 单卷上限表单。
  存 localStorage（comic-to-kindle-convert-options），转换时读取并传入。

设备与邮箱（DeliverySettingsView）
  SMTP host/port/user/password + Kindle 邮箱表单，保存 + 测试连接。
  密码不回传渲染端；已存密码时密码框显示占位、留空不修改。

设计组件（仅 dev 构建可见）
  开发期 shadcn/ui 组件索引和本地文档镜像。
  数据源：src/renderer/src/data/shadcn-docs.ts；视图代码在 src/renderer/src/dev/Showcase.tsx。
  已镜像 A 到 I 范围内组件文档，支持中文阅读和英文原文切换。

基础规范（仅 dev 构建可见）
  开发期设计基础参考页，视图代码同在 dev/Showcase.tsx。
  覆盖颜色 token、字体栈、字号层级和间距层级。

扩展功能（extensions）
  waifu2x 等扩展能力的入口壳，暂无内容，以 PageEmpty 空状态组件呈现。
```

`设计组件` 和 `基础规范` 只用于开发阶段提效。除非后续明确做产品化设计，否则不要把它们当作用户功能描述。

## 构建流水线

electron-vite 产出三类构建结果：

```txt
src/main/      -> out/main/
src/preload/   -> out/preload/
src/renderer/  -> out/renderer/
```

`npm run build` 执行：

```txt
typecheck:node
typecheck:web
electron-vite build
```

### 打包（electron-builder）

`npm run build:mac` / `:win` / `:linux` 先 `build` 再调 electron-builder；`npm run pack:doctor` 做打包前体检（依赖分层、dmg-only 配置、版本说明、`BUILD_STAMP`、esbuild native binary）。`release:mac` 由 `scripts/release-mac.mjs` 包装，先跑 `pack:doctor` 和 `build`，通过后才把版本号 prerelease +1，再调用 `build:mac` 正式出包。macOS 内测流程由 `scripts/build-mac-dmg.mjs` 包装：生成 `BUILD_STAMP`、从 `docs/release-notes.md` 写出 `build/release-notes-current.txt`、只构建 dmg、关闭 blockmap/update info，并清理 `dist/` 里的非 dmg 临时产物；dmg 文件名包含版本号和构建时间戳，挂载根目录包含 `版本说明.txt`。打包细节（ad-hoc 签名、Gatekeeper、版本递增、内测分发）见 `docs/operator-runbook.md`。两条架构级约束：

- **依赖分层决定包体**：`package.json` 的 `dependencies` 只放 main/preload 运行时真正 `require` / dynamic import 的包（`@electron-toolkit/preload`、`@electron-toolkit/utils`、`sharp`、`7zip-bin`、`archiver`、`nodemailer`、`pdfjs-dist`、`@napi-rs/canvas`、`fast-xml-parser`）。electron-vite 会把 `dependencies` 外部化并由 electron-builder 拷进 `app.asar`；所有 UI 库（react / radix / recharts 等）已被 vite 打进 `out/renderer`，必须留在 `devDependencies`，否则 asar 里重复一份、体积暴涨（曾因 `shadcn` CLI 误置 dependencies 使 asar 达 200MB）。
- **原生库须 asarUnpack**：`7zip-bin`、`sharp`、`@img`（libvips dylib 无 `.node`，smartUnpack 会漏）、`@napi-rs/canvas`/`@napi-rs/canvas-*` 放进 `asarUnpack`，运行时把 `path7za` 的 `app.asar` 改写为 `app.asar.unpacked`。当前 mac arm64 内测包会剔除 `7zip-bin` 的 linux/win/mac x64 二进制。
- **开发期演示页代码分割**：`dev/Showcase.tsx`（含 recharts/embla/cmdk 等重依赖）经 `import.meta.env.DEV` 门控的 `React.lazy` 加载；生产构建该分支为死代码，Rollup 不产出对应 chunk，演示代码与重依赖完全不进生产包。侧栏 `groupDevMode` 同样按 DEV 隐藏。

### 产品沟通源

- `docs/release-notes.md` 是更新日志源：打包时生成 dmg 根目录的 `版本说明.txt`，未来可渲染为官网 `/changelog`。
- `docs/roadmap.md` 是路线图源：按「已上线 / 正在打磨 / 计划中 / 探索中」维护能力状态，未来可渲染为官网 `/roadmap`。

## UI 系统

renderer 使用 Tailwind CSS 4 和 shadcn/ui。

重要文件：

```txt
components.json
electron.vite.config.ts
src/renderer/src/assets/main.css
src/renderer/src/lib/utils.ts
src/renderer/src/components/ui/
src/renderer/src/components/ui/traffic-lights.tsx  ← 自定义交通灯组件
src/renderer/src/data/design-tokens.ts
src/renderer/src/data/shadcn-docs.ts
```

`components.json` 配置：

```txt
style: new-york
tsx: true
baseColor: neutral
iconLibrary: lucide
```

renderer alias：

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

颜色主题 token 位于 `src/renderer/src/assets/main.css`，通过 CSS variables 和 `@theme inline` 接入 Tailwind/shadcn。基础规范页的数据源位于 `src/renderer/src/data/design-tokens.ts`，用于集中记录和渲染当前 UI 系统约定：

```txt
颜色：--background、--foreground、--primary、--muted、--border 等语义 CSS 变量
字体：Inter 优先，系统 UI 字体兜底
字号：当前工作台使用 Tailwind text-xs 到 text-2xl
间距：以 Tailwind spacing scale 为准，4px 为基础节拍
圆角：基础半径 0.5rem
布局：页面边距、最大宽度和关键分栏尺寸
```

顶栏的深浅模式按钮会切换 `document.documentElement` 上的 `.dark` class，并把用户选择保存到 `localStorage` 的 `comic-to-kindle-theme`。新增 UI 应优先使用语义 token，以便跟随该全局主题切换。

顶栏的中英切换会设置 `document.documentElement.lang`，并把用户选择保存到 `localStorage` 的 `comic-to-kindle-language`。当前应用壳、开发期页面和 shadcn 镜像文档会跟随切换。shadcn 镜像数据使用可本地化文本结构保留英文原文和中文译文；代码块、命令、API、prop、className、路径、组件名、示例名和复制值保持英文源值。

## 计划中的领域边界

下一阶段实现应保持 UI 与系统能力分层：

```txt
漫画库领域（浏览/阅读已实现，元数据存储待做）
  扫描本地目录、图片文件夹、压缩包卷册（archive.ts）、PDF/图片型 EPUB（document.ts）已实现；元数据存储待做。

转换领域（已实现首切）
  规范化页面、处理图像、生成固定版式 EPUB（convert.ts）；产物由 artifacts.ts 托管编排。
  压缩包来源（CBZ/ZIP/CBR/RAR/7z）、PDF 来源、图片型 EPUB 来源已接入；队列持久化（queue.ts）已实现；待做：自动投递、纯文本/重排 EPUB 策略。

投递领域（已实现首切）
  SMTP 投递（deliver.ts）+ Send to Kindle 网页推送（webpush.ts）+ 归档手动投递 + 本地导出副本均已实现。
  待做：自动投递。

任务领域
  跟踪扫描、转换、放大和投递等长任务。
```

Electron main 或专门的服务模块应负责本地文件系统和进程执行。renderer 应通过明确的 preload 或 IPC API 调用这些能力，避免直接使用 Node API。

## 存储

漫画库本身没有数据库 / 索引（每次进入实时扫描目录）。已有的持久化：

- **库根目录**：main 进程写入 `app.getPath('userData')/settings.json` 的 `libraryRoot` 字段。
- **每部名称/作者覆盖**：`settings.json` 的 `seriesMeta`（`{ <部文件夹名>: { title, author } }`），覆盖 `[作者]标题` 解析，不改本地文件夹名。
- **转换产物**：EPUB 文件落在 `app.getPath('userData')/converted/<部>/`；清单 `app.getPath('userData')/artifacts.json`（`{ version, artifacts: Artifact[] }`）。同一源卷重转会覆盖旧清单条目，删除产物会同时删文件和条目。
- **转换队列**：`app.getPath('userData')/queue.json`（`{ version, jobs: PersistedConvertJob[] }`）。每次队列结构变化由 renderer 经 `queue:save` 推送；启动时 `queue.ts` 把未完成任务（queued/converting）标为 `'interrupted'`（不自动跑，等用户在 UI 确认继续/不继续），并扫 `userData/converted/<部>/tmp_<id>/` 清孤儿临时目录。详见「转换队列持久化层」。
- **投递配置**：`settings.json` 的 `delivery` 字段（host/port/user/kindleEmail + `passEncrypted` 或 `passPlain`）。密码经 `safeStorage` 系统钥匙串加密，不明文落盘。
- **压缩包解压缓存**：`app.getPath('userData')/extracted/<hash>/`（图片 + `.manifest.json`），按所有分卷的 路径+mtime+size 哈希。
- **文档页面缓存**：`app.getPath('userData')/documents/<hash>/`（PDF 渲染页或图片型 EPUB 抽出的页面 + `.manifest.json`），按源文件 路径+mtime+size + `document-v1` 哈希。
- **封面缩略图缓存**：`app.getPath('userData')/thumbs/<hash>.webp`（480px），按封面源图 路径+mtime+size 哈希；可安全清空（再开自动重建）。
- **压缩包密码池**：`settings.json` 的 `archivePasswords`（`safeStorage` 加密的 base64 数组），不明文落盘、不回传 renderer。
- **renderer localStorage 键**：
  - `comic-to-kindle-theme` 深浅模式
  - `comic-to-kindle-language` 中英语言
  - `comic-to-kindle-reading-direction` 阅读方向（ltr/rtl）
  - `comic-to-kindle-reading-mode` 阅读模式（single/double）
  - `comic-to-kindle-reading-progress` 每卷续读进度（{ 卷路径: 页索引 } 的 JSON）
  - `comic-to-kindle-convert-options` 转换选项（设备档位/方向/灰度/双页/质量/分卷上限）

后续若引入漫画元数据库 / 索引，需要在本节补充存储引擎、位置、迁移策略、数据模型与重置行为。

## 安全说明

- 主 BrowserWindow 设置了 `sandbox: false`。本地文件访问已落地（漫画库），但全部走 main 进程 + preload IPC，renderer 不直接用 Node API。
- **网页推送窗口**（`webpush.ts`）加载 Amazon 外站，单独用 `sandbox:true` + `contextIsolation:true` + 独立持久 `partition`，无 preload/Node 集成；登录态隔离在该 partition、不进主窗口。CDP 调试器仅附加到该窗口用于拦截文件框，不触碰主窗口。
- **SMTP 凭据**：密码经 `safeStorage`（macOS 钥匙串）加密存 `settings.json`，main 进程持有；`deliver:getConfig` 只回传 `hasPassword` 布尔、绝不回传密码明文给 renderer。
- `comic://` 协议服务图片时做越权校验：只允许图片扩展名且路径位于当前库根目录内，否则返回 403。
- 外部链接通过 `shell.openExternal` 打开，应用窗口拒绝 new-window 导航。
