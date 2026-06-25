# 实现计划：Eagle 式 App 独占库包（卷册导入 + manifest 分组）

> 状态：阶段 1-3 + §4.2 旧代码移除均已完成（typecheck/build 通过）。4 项交互实测已通过：多分卷导入读/转、manifest 损坏重建、导入中断无残桶、分组改名后用户漫画内容未动且 bookId 桶路径稳定。
>
> 历史状态（阶段 3 执行中时）：2026-06-24 已完成 `.ctklib` 库包骨架、导入扫描/复制、manifest 原子写、兼容旧 `scan/listVolumes/listPages` 的最小 renderer 接线；随后补齐部 CRUD / 归属 / 改名 / 排序 IPC，并在现有 UI 上接入新建部、编辑部名/作者、卷册改名、移入已有部/新建部、解散部。阶段 3 已补导入预览、导入后删除源选项、卷册软删除到库内 `trash/`、回收站列表/还原/清空、右键上移/下移排序 UI；移除旧文件视图仍待做。
> 分支：`feat/scan-managed-volumes`。语言：中文优先。
> 拍板日期：2026-06-24。

---

## 1. 背景与决策（先读，避免走回头路）

产品方向**已彻底定为 Eagle 模型**，覆盖并作废以下旧方案，执行时不要再捡回来：

- ❌ 文件视图 1:1 磁盘镜像（`listDirRaw` / `listSubdirs` 那套）
- ❌ 「文件夹结构 = 层级真相、App 真的移动用户文件」方案
- ❌ 按文件夹名解析 + `seriesMeta` 覆盖的元数据方案

**新模型一句话**：库是一个 App 独占的 `.ctklib` 包；导入 = 把识别出的卷册**复制**进库（原文件不动，由用户自己管）；分组/书名/作者/排序**只存在 manifest 里，永不移动物理文件**。

三条不可动摇的原则：

1. **导入即复制**：原始文件零改动；提供「导入后删除/移动源文件」为可选项。
2. **分组只改 manifest**：建组、改名、调整归属、排序——全部只写 JSON，绝不 `fs.rename` 用户内容。
3. **可恢复**：根 manifest 损坏时，能从每个桶里的 `book.json` 反推重建整库结构。

数据迁移：**不需要**。仍在内测，旧的「指向用户文件夹」库直接弃用，引导用户新建库包重新导入。

---

## 2. 目标架构

### 2.1 库包目录结构（App 独占，用户不应手动进入）

```
<库名>.ctklib/
  library.json              # 唯一真相：库元信息 + 部(分组)树 + 排序
  books/
    <bookId>/               # 每本卷册一个桶，bookId = 短 uuid/nanoid，不可变
      book.json             # 该卷册自描述（冗余兜底，可重建 library.json）
      source.<ext>          # 复制进来的原件：source.cbz / source.zip / source.pdf / source.epub
      images/               # 仅当源是「散图文件夹」时：复制进来的图片（保留原相对结构）
      cover.webp            # 封面缩略图（由 sharp 生成，~480px）
  trash/                    # 库内删除的桶移到这里（软删除，可还原），非系统废纸篓
```

要点：
- **桶是 archive/pdf/epub（单文件 `source.*`）或 imageFolder（`images/`）二选一**，与现有 `LibraryVolume.sourceType` 对齐。
- `bookId` 一旦生成永不变；桶位置永不动。改名/分组只改 JSON。
- 库包默认放**本地非同步目录**（见 §6 库位置），不放 iCloud。

### 2.2 卷册取图路径（关键复用点）

桶给下游（阅读器 / 转换）的「源卷路径」`sourceVolumePath`：
- archive/pdf/epub 桶 → `books/<id>/source.<ext>`
- imageFolder 桶 → `books/<id>/images/`

这两种路径**喂给现有 `collectVolumeImagePaths(path)`（`library.ts:724`）即可正常出图**——archive 走解压缓存、pdf 走 pdfjs、文件夹走 `collectPages`。**整条转换+阅读链路一行不改**。

---

## 3. 数据格式（Schema）

### 3.1 `library.json`（根 manifest，唯一真相）

```ts
interface LibraryManifest {
  version: 1
  libraryId: string            // 库自身 uuid，用于跨设备识别
  name: string                 // 库显示名
  createdAt: string            // ISO
  updatedAt: string            // ISO，每次写更新
  series: SeriesNode[]         // 部（分组），有序
  ungrouped: string[]          // 未分组卷册的 bookId，有序
}

interface SeriesNode {
  id: string                   // 部 id（uuid）
  title: string                // 书名（部名）
  author: string | null
  bookIds: string[]            // 归属本部的卷册 id，按用户排序
  createdAt: string
}
```

设计说明：
- **散卷（未分组）放 `ungrouped`**，不强制建部——对应记忆里「散卷当书」。
- 卷册的归属是**单一的**：要么在某个 `series.bookIds` 里，要么在 `ungrouped` 里，不允许同时存在（导入时入 `ungrouped`，建组时从 `ungrouped` 迁入 series）。
- `series` 与 `bookIds` 都是**有序数组**，顺序即用户排序。

### 3.2 `books/<id>/book.json`（桶自描述，冗余兜底）

```ts
interface BookRecord {
  id: string                   // = 桶目录名 bookId
  sourceType: 'archive' | 'pdf' | 'epub' | 'folder'
  sourceFile: string | null    // 'source.cbz' 等；folder 型为 null
  displayName: string          // 卷册显示名（默认取原文件名去扩展名，可被用户改）
  originalName: string         // 导入时的原始文件/文件夹名（保留备查）
  importedFrom: string         // 导入时的源绝对路径（仅记录，不依赖其存在）
  pageCount: number            // 已知页数（0 = 未 inspect）
  addedAt: string              // ISO
  // 冗余的归属信息，供 library.json 损坏时重建：
  seriesTitleHint: string | null   // 重建时落到哪个部（按 title 合并）
  seriesAuthorHint: string | null
}
```

重建逻辑（库自检时，若 `library.json` 缺失/损坏）：遍历所有桶的 `book.json`，按 `seriesTitleHint` 把卷册聚成部，无 hint 的进 `ungrouped`，生成一份新 `library.json`。

### 3.3 写盘纪律（强制）

- **所有 manifest 写入必须原子**：写 `library.json.tmp` → `fs.rename` 覆盖。禁止直接 `writeFile(library.json)`（中途崩溃会毁库）。
- 每次改 `library.json` 同步 `updatedAt`。
- 改某卷册归属/书名时，**同时更新该桶 `book.json` 的 hint 字段**，保证兜底数据不落后。

---

## 4. 主进程改造（`src/main`）

### 4.1 复用（从 `library.ts` 保留，可能挪文件）

直接保留，逻辑不动：
- `buildThumb` / `thumbsRoot`（`library.ts:161-181`）——封面缩略图
- comic:// 协议注册与 `handleComicProtocol`（`:832-886`）——**需改安全校验，见 §4.4**
- inspect 缓存整套（`:215-258`）
- `inspectFileVolume` / `fileVolumeBase` / `buildFileVolume`（`:262-363`）——页数/加密/封面
- `resolveVolumeImagePaths` / `collectVolumeImagePaths` / `listPages` / `isArchiveVolume` / `isDocumentVolume` / `collectPages`（`:656-726`）——取图核心
- `parseSeriesName`（`:184`）——导入时从文件名猜 `[作者] 标题`

### 4.2 删除（与磁盘镜像方案绑定，全部移除）

- `classifyDir` / `countValidChildren` / `listChildren` / `scanLibrary` / `listVolumes`（`:365-480`）
- 文件视图整块：`DirNode` / `RawListing` / `RawPlainFile` / `listSubdirs` / `listDirRaw` / `hasSubfolders` / `sortedChildDirs` / `sortedVolumeFiles` / `sortedPlainFiles`（`:482-654`）
- 在地文件操作：`renameEntry` / `moveEntries` / `createFolderIn` / `trashEntries` / `sanitizeName` / `assertWithinRoot` 中针对用户文件夹的部分（`:728-830`）
- `seriesMeta` 整套：`readSeriesMeta` / `resolveSeriesMeta` / `SeriesMetaOverride` / `library:setSeriesMeta`（`:190-213, :942-951`）
- 对应 IPC：`library:scan` / `listVolumes` / `listSubdirs` / `listDirRaw` / `rename` / `move` / `createFolder` / `trash` / `setSeriesMeta`
- preload 中对应条目（`src/preload/index.ts:9-23`）与 `index.d.ts` 类型

> 注意：`library:pickFolder`/`getSavedRoot` 的语义变了（见 §4.3），不是直接删。

### 4.3 新增：库包模型（建议新建 `src/main/library-package.ts`）

核心类型与函数签名（执行时以此为准）：

```ts
// —— 路径解析 ——
function libraryRoot(): string | null            // 当前打开的 .ctklib 绝对路径
function booksDir(): string                       // <root>/books
function bucketDir(id: string): string            // <root>/books/<id>
function bucketSourcePath(rec: BookRecord): string // 给下游的 sourceVolumePath

// —— manifest 读写（原子）——
async function readLibraryManifest(): Promise<LibraryManifest>
async function writeLibraryManifest(m: LibraryManifest): Promise<void>   // tmp+rename
async function readBookRecord(id: string): Promise<BookRecord>
async function writeBookRecord(rec: BookRecord): Promise<void>           // tmp+rename

// —— 库生命周期 ——
async function createLibrary(parentDir: string, name: string): Promise<string>  // 建 .ctklib 骨架，返回路径
async function openLibrary(packagePath: string): Promise<LibraryManifest>       // 校验+打开，必要时从 book.json 重建
async function getSavedLibrary(): Promise<string | null>                        // settings.json 记住上次打开的库

// —— 导入 ——
interface ImportCandidate {
  sourcePath: string
  sourceType: BookRecord['sourceType']
  displayName: string
}
interface ImportScanResult {
  candidates: ImportCandidate[]
  skipped: Array<{ path: string; reason: string }>   // 无法识别的杂物
}
async function scanImportSource(srcRoot: string): Promise<ImportScanResult>     // 只识别，不复制
interface ImportOptions { deleteSourceAfter?: boolean }
async function importBooks(
  candidates: ImportCandidate[],
  opts: ImportOptions,
  onProgress: (done: number, total: number, name: string) => void
): Promise<string[]>   // 逐个复制成桶+写 book.json+抽封面，返回新 bookId 列表（入 ungrouped）

// —— 列表（读 manifest+桶，替代旧 scan）——
interface LibraryView {
  series: Array<SeriesNode & { coverUrl: string | null; volumeCount: number }>
  ungrouped: BookView[]
}
interface BookView {
  id: string
  sourceType: BookRecord['sourceType']
  displayName: string
  pageCount: number
  coverUrl: string | null
  locked: boolean
}
async function getLibraryView(): Promise<LibraryView>
async function getSeriesBooks(seriesId: string): Promise<BookView[]>
async function inspectBook(id: string): Promise<VolumeInspect>   // 懒补页数/封面/加密，复用 inspectFileVolume

// —— 部 / 归属 / 排序（纯 manifest）——
async function createSeries(title: string, author: string | null, bookIds: string[]): Promise<SeriesNode>
async function renameSeries(seriesId: string, title: string, author: string | null): Promise<void>
async function deleteSeries(seriesId: string): Promise<void>   // 部解散，卷册退回 ungrouped（不删桶）
async function assignBooks(bookIds: string[], targetSeriesId: string | null): Promise<void> // null=移回 ungrouped
async function reorderSeries(orderedSeriesIds: string[]): Promise<void>
async function reorderBooks(seriesId: string | null, orderedBookIds: string[]): Promise<void>
async function renameBook(id: string, displayName: string): Promise<void>  // 改卷册显示名（同步 book.json）

// —— 删除（软删除到库内 trash）——
async function trashBooks(ids: string[]): Promise<void>        // 移桶到 <root>/trash/，从 manifest 摘除
```

导入复制细节：
- 复制用流式 `fs.copyFile`（单文件）或递归拷贝（imageFolder）；**大文件要原子**：先拷到 `books/<id>.tmp/`，完成再 rename 成 `books/<id>/`，避免中途崩溃留半个桶。
- 封面：archive/pdf 用现有 `inspectFileVolume` 出首图 → `buildThumb` → 存 `cover.webp`；imageFolder 用 `findFirstImage`。封面可异步补，不阻塞导入完成。
- `scanImportSource` 识别规则（复用 `isVolumeFile` / `isImage` / `isSplitContinuation`）：
  - 单文件 cbz/zip/cbr/rar/7z/pdf/epub → 一个 archive/pdf/epub 候选（分卷续卷 `isSplitContinuation` 跳过，由主卷代表）
  - 直接铺图的文件夹 → 一个 folder 候选
  - 含上述内容的父文件夹 → 递归进入继续找候选（**不把父文件夹整体当一卷**）
  - 其他文件（txt/nfo/exe…）→ 进 `skipped`，不导入

### 4.4 comic:// 安全校验调整（`library.ts:843-886`）

现在放行 `currentRoot` + 解压缓存 + 文档缓存。改为：放行**库包内 `books/` 目录** + 解压缓存 + 文档缓存（库包内的 `cover.webp` 与 imageFolder 桶图片都在 `books/` 下）。`currentRoot` 概念由 `libraryRoot()` 取代。

### 4.5 IPC 与 preload 重命名

新 IPC（`library-package.ts` 注册）：

| IPC | 说明 |
|---|---|
| `library:create` | 选父目录 + 名称 → 建库包 |
| `library:open` | 选 `.ctklib` 打开 |
| `library:getSaved` | 取上次打开的库 |
| `library:view` | `getLibraryView` |
| `library:seriesBooks` | `getSeriesBooks` |
| `library:inspectBook` | 懒补单卷信息 |
| `library:scanImport` | `scanImportSource`（向导预览） |
| `library:import` | `importBooks`（带进度事件 `library:importProgress`） |
| `library:createSeries` / `renameSeries` / `deleteSeries` | 部 CRUD |
| `library:assignBooks` / `reorderSeries` / `reorderBooks` / `renameBook` | 归属与排序 |
| `library:trashBooks` | 软删除 |
| `library:listPages` | **保留不变**（阅读器取图） |

下游 `ConvertRequest`（`artifacts.ts:79`）：`sourceVolumePath` 改为传 `bucketSourcePath(rec)`；`seriesName`/`seriesTitle`/`volumeTitle`/`author` 改为从 manifest 取（不再从磁盘路径推）。`artifacts.ts` 本身逻辑不用改，只是调用方传值来源变了。

---

## 5. 渲染层改造（`src/renderer/src/App.tsx`，5206 行单文件）

> 这是工作量大头。建议借机把库相关 UI 拆成独立组件文件，降低单文件体积。

要做：
1. **空库引导**：无库时引导「新建库」或「打开库」。
2. **导入向导**（新）：选源文件夹/文件 → 调 `library:scanImport` 展示「将导入 N 卷 / 跳过 M 个杂物」预览 → 勾选「导入后删除源文件」→ 确认 → 进度条（`library:importProgress`）→ 完成入库。
3. **库主界面**（重构）：从「扫描磁盘」改成读 `library:view`，渲染「部网格 + 散卷网格」；卡片封面/页数走 `inspectBook` 懒补（复用现有 `inspectVolume` 的后台补齐套路）。
4. **建组与归属**：选中若干散卷 →「新建部」或「移入已有部」；部内可调卷册顺序、改书名/作者。拖拽可作为后续增强，先用菜单/按钮跑通。
5. **删除**：库内软删除（`trashBooks`），文案说明「移入库内回收站，可还原」。
6. **删除整块文件视图 UI**（树/网格/右键整理那套）。

不动（只认卷册路径，复用）：阅读器、转换弹窗、转换队列、归档视图、投递（SMTP / Send to Kindle）。

---

## 6. 库位置（已定）

- 默认放**本地非同步目录**：建库向导默认父目录用 `app.getPath('documents')` 或让用户选，**明确避免 iCloud/CloudDocs**（大库 + 同步会撞 `.icloud` 占位符与上传卡顿）。
- 跨设备：靠**手动导出库包**（整个 `.ctklib` 拷走，对端 `library:open`）。本期不做实时同步。
- `settings.json` 记住 `libraryPackagePath`，启动自动打开。

---

## 7. 分阶段执行 + 验收标准

### 阶段 1：库包模型 + 导入（先跑通闭环）
范围：§4.3 库生命周期 + 导入 + `getLibraryView` + comic:// 调整（§4.4）+ 下游接线（§4.5 末）。
**验收**：
- 能新建/打开 `.ctklib`，结构符合 §2.1。
- 选一个混着 cbz/pdf/散图文件夹/杂物 txt 的源目录导入：识别正确、杂物进 skipped 不导入、原文件未被改动、每个桶含 `book.json`+`source.*`/`images/`+`cover.webp`。
- 导入后卷册出现在「散卷」区，**能进阅读器、能发起转换并产出 EPUB**（证明下游复用成立）。
- manifest 与 `book.json` 写入是原子的（tmp+rename）。

### 阶段 2：部 CRUD + 归属 + 排序（纯 manifest）
范围：§4.3 部/归属/排序全部 + 渲染层建组 UI。
**验收**：
- 建部、改名/作者、移入移出、部内外排序、解散部——**全程零 `fs.rename` 用户内容**。判据为卷内 `images/` 与 `source.*` 内容 mtime 不变，且 bookId 桶路径（目录名）稳定；桶目录自身 mtime 会因 `book.json` 重写而变化，属正常，不作判据。
- 改完关 App 重开，结构与排序完整恢复。
- 转换弹窗的书名/作者预填来自 manifest（部 title + 卷册 displayName）。

### 阶段 3：收尾与健壮性
范围：导入后删源选项、跳过报告 UI、软删除回收站、manifest 损坏从 `book.json` 重建、导入大文件进度与原子性。
**验收**：
- 手动损坏/删除 `library.json` 后 `library:open` 能从桶重建出等价结构。
- 导入中途强杀进程：库里不残留半个桶（只可能残留 `.tmp` 临时目录，下次打开自动清）。
- 「导入后删除源」勾选时源被删、不勾时源保留。

---

## 8. 边界与风险（执行时务必处理）

1. **原子写**：`library.json`、`book.json`、桶目录三处都要 tmp+rename。这是防毁库的第一道线。
2. **导入大文件**：漫画一卷几百 MB，复制要有进度、可取消；取消/失败要清掉 `.tmp` 残留。
3. **重复导入**：同一源文件二次导入——按内容 hash 或 `importedFrom` 提示「可能已存在」，但不强制去重（让用户决定）。
4. **bookId 稳定性**：artifacts 清单按 `sourceVolumePath` 索引（`artifacts.ts:73`），桶路径稳定反而比旧方案更好，但要确认改 displayName/分组**不改桶路径**，否则会与已转换产物失联。
5. **加密压缩包**：桶里存的是加密 `source.cbz`，封面/页数在解锁前拿不到——沿用现有 `locked` 占位 + 首次打开解锁流程，不在导入期强制解密。
6. **trash 回收站**：库内 `trash/` 软删除，需提供还原/清空；与系统废纸篓区分清楚（旧 `trashEntries` 用的是系统废纸篓，新模型不再动用户原文件，故改为库内软删除）。
7. **路径校验**：所有桶路径操作仍要校验落在 `libraryRoot()` 内，防穿越。

---

## 9. 质检清单（计划作者复查时逐条核对）

代码层：
- [ ] §4.2 列出的磁盘镜像 / seriesMeta / 文件视图代码确实删干净，无残留死代码与未用 IPC。
- [ ] 所有 manifest/book.json/桶写入均为原子（grep 确认无裸 `writeFile(library.json)` / 无非 tmp 的桶 rename）。
- [ ] comic:// 校验已切到 `books/` 根，旧 `currentRoot` 越权口子已关。
- [ ] 下游 `collectVolumeImagePaths` / `listPages` / `artifacts` 未被改坏，转换+阅读对 archive/pdf/epub/folder 四类桶都通。

行为层（手测）：
- [ ] 阶段 1/2/3 各自「验收」项全过。
- [ ] 分组/改名/排序操作后，用 `stat` 确认卷内 `images/` 与 `source.*` 内容 mtime 不变，且 bookId 桶路径（目录名）稳定；桶目录自身 mtime 会因 `book.json` 重写而变化，属正常，不作判据。
- [ ] 损坏 `library.json` 后能重建（阶段 3 验收）。
- [ ] 导入混杂源：杂物不入库、原文件无改动（除非显式勾选删源）。
- [ ] 库默认不落在 iCloud/CloudDocs 路径。

文档层：
- [ ] `docs/architecture.md` 同步新库模型，移除文件视图/磁盘镜像描述。
- [ ] 记忆 `managed-volume-scan-direction.md` 标记为「已实现」并指向最终代码位置。
- [ ] `docs/handoff.md` 更新交接状态。

---

## 10. 关键文件索引（执行参考）

| 关注点 | 位置 |
|---|---|
| 现库数据层（多数将删/重写） | `src/main/library.ts` |
| 取图核心（复用） | `library.ts:656-726`（`collectVolumeImagePaths` 等） |
| 缩略图（复用） | `library.ts:161-181` |
| comic:// 协议（改校验） | `library.ts:832-886` |
| inspect 缓存（复用） | `library.ts:215-258` |
| 转换入参/产物（接线） | `src/main/artifacts.ts:79-160` |
| 转换引擎（不动，只认 imagePaths） | `src/main/convert.ts:239-262` |
| 压缩包/文档取图（不动） | `src/main/archive.ts` / `src/main/document.ts` |
| preload API 暴露 | `src/preload/index.ts` / `src/preload/index.d.ts` |
| 渲染层（库 UI 重构大头） | `src/renderer/src/App.tsx` |
