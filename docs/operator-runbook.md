# 运行手册

本文覆盖当前应用阶段的安装、开发、验证和内测分发流程。

## 仓库位置

当前工作区路径：

```txt
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

注意：该路径位于 iCloud Drive 同步目录，这是 2026-06-15 按用户要求迁回的结果。2026-06-11 项目曾因 `esbuild` 和 Node `.bin` shim 在同步目录下执行卡住而迁出；如果问题再次出现，优先迁回本地非同步目录。

## 安装

```bash
npm install
```

如果 npm 报告 `~/.npm` 下存在 root-owned cache 文件，可以临时使用项目内缓存：

```bash
npm_config_cache=.npm-cache npm install
```

保持 `.npm-cache` 不入库。

## 开发冒烟

```bash
npm run dev
```

预期结果：

- Electron main process 构建成功。
- preload script 构建成功。
- renderer dev server 默认从 `http://localhost:5173/` 启动；如果端口被占用，Vite 会顺延到下一个端口。
- Electron 窗口打开当前工作台 UI。
- 侧边栏包含 `漫画库`、`设计组件`、`基础规范` 等工作区。
- 顶栏深浅模式按钮可以切换整个 renderer 的主题。
- 顶栏中英切换按钮可以切换应用壳、开发期页面和 shadcn 镜像文档阅读语言。
- `所有漫画` 视图首次进入显示空状态，可「新建库」或「打开库」选择 `.ctklib` 托管库包；打开后显示 manifest 投影的部/散卷书架。**双击**某部逐级下钻、**双击**卷册进入阅读器（单页/双页、左右方向、续读）；单击为选中（桌面书架式交互）。库包路径会被记住。
- 压缩包卷册（CBZ/ZIP/CBR/RAR/7z，含分卷 `name.7z.001` 等——只显示入口卷）显示压缩包/锁占位图标；点开阅读或转换时先解压到缓存并显示进度条/进度 toast；加密包弹密码框（可输中文，勾「记住」加入共享密码池，后续同密码包自动解）。
- PDF 单文件卷册显示 `PDF` 类型文字；首次打开或转换时会渲染为页面缓存并显示“准备页面/处理中”进度，之后复用缓存。
- 图片型 EPUB 显示 `EPUB` 类型文字；首次准备时会按 OPF spine / XHTML 图片引用抽取页面。纯文本/重排 EPUB 没有本地图片页时，应提示没有可用页面图片。
- 转换某一卷会先弹「确认书籍信息」框（预填漫画名/卷册名/作者，可改）；产物书名 = 「漫画名 + 卷册」、作者写入元数据。库网格右键某部 / 进入后顶栏铅笔可编辑该部名称/作者；卷册显示名、归属和排序写入 `.ctklib` manifest，不改用户导入源。
- `设计组件` 中的示例复制按钮仍复制英文示例名，例如 `button-with-icon`。
- `网页推送`（或归档条目的「网页推送」入口）打开内嵌 Amazon 网页窗口；首次需在该窗口登录 Amazon（登录态存在独立 `persist:amazon-stk` partition、重启保留）。带产物推送时会盖黑色蒙层并自动填入文件，最后由用户在网页里点 Send。

注意：改动 `src/main/**` 或 `src/preload/**` 后，需重启 `npm run dev`（main/preload 不走 renderer HMR）；否则新增的 IPC handler 不会生效。

使用 `Ctrl+C` 停止 dev 进程。

## 构建验证

```bash
npm run build
```

预期结果：

- node 和 web TypeScript 检查通过。
- electron-vite 构建 `out/main`、`out/preload` 和 `out/renderer`。

## 打包与内测分发

### 一键出内测包（macOS）

每发一轮内测：

```bash
npm run release:mac
```

`release:mac` 由 `scripts/release-mac.mjs` 包装，流程是：

1. 运行 `npm run pack:doctor` 做打包体检（依赖分层、electron-builder dmg-only 配置、版本说明、`BUILD_STAMP`、esbuild native binary）。
2. 运行 `npm run build` 做预构建验证，此时版本号暂不递增。
3. 运行 `npm version prerelease --no-git-tag-version`（版本号 `beta.N → beta.N+1`，不打 git tag）。
4. 运行 `npm run build:mac` 正式出 dmg。

这样可以先排除最常见的构建/环境问题，再修改 `package.json` 版本号。`build:mac` 会生成构建时间戳、写入 dmg 版本说明、调用 electron-builder，并清理非 dmg 的临时/自动更新产物。产物落在 `dist/`：

- `dist/comic-to-kindle-<version>-<YYYYMMDD-HHMMSS>.dmg` ← 发给测试者的就是这个

dmg 挂载后包含：

- `ComicToKindle.app`
- `Applications` 链接
- `版本说明.txt`（构建前由 `docs/release-notes.md` 生成，标题会写入当前 `package.json` 版本、构建时间、构建标识和 Git 修订）

发布前维护：

- 更新 `docs/release-notes.md` 中对应版本的「亮点 / 新增 / 改进 / 修复 / 已知限制 / 下载」。
- 如果能力状态变化，同步更新 `docs/roadmap.md`，不要把探索中或计划中的能力写成已上线。

注意：

- 每发一轮内测用 `release:mac`（版本号自动 `beta.N → beta.N+1`）；只想重打当前版本、不动版本号时用 `npm run build:mac`。
- 只想做打包前体检时用 `npm run pack:doctor`，不会改版本号，也不会生成 dmg。
- 同一版本可以多次重打；dmg 文件名带构建时间戳，不会覆盖旧包，方便留存和对比。
- `release:mac` 会改 `package.json` 版本号但**不自动 git 提交**，记得事后 `git commit`，让仓库版本与发出去的包对得上。
- PDF/EPUB 来源接入后包体会比此前约 116MB 的 dmg 增加（PDF.js 资源 + native canvas）。其中 Electron 框架本体 ~100MB 是固定底座。**别把 UI 库（react / radix / recharts 等）加进 `package.json` 的 `dependencies`**——它们已被 vite 打进 `out/renderer`，放 dependencies 会让 electron-vite 外部化、在 `app.asar` 里重复一份使体积暴涨。`dependencies` 只放 main/preload 运行时真正需要的包；当前白名单由 `npm run pack:doctor` 校验。`electron-builder.yml` 还剔除了 7zip-bin 的 linux/win/mac x64 二进制与 docs/AGENTS.md/.claude 等开发文件。
- 若 `build:mac` 在 electron-builder 下载阶段报 `Client network socket disconnected before secure TLS connection was established`，通常是外部下载/TLS 网络问题，不代表 TypeScript 或打包配置失败。先确认 `npm run build` 与 `npm run pack:doctor` 通过；网络恢复后重跑 `npm run build:mac`，成功后再挂载 dmg 检查 `版本说明.txt` 和 native canvas unpack。

### 关于签名（内测不公证）

- `electron-builder.yml` 设 `mac.identity: null`，跳过 Developer ID、改 **ad-hoc 签名**（Apple Silicon 必须有签名才能启动；ad-hoc 即可）。
- `build:mac` 脚本内置 `CSC_IDENTITY_AUTO_DISCOVERY=false`，避免 electron-builder 去钥匙串找证书（本机有两张同名 `Apple Development` 证书会报 `ambiguous` 而打包失败）。
- 因未做 Apple 公证，测试者下载 `.dmg` 拖入「应用程序」后首次打开会被 Gatekeeper 拦（"无法验证开发者"）。**给测试者的说明**，二选一：
  - 右键应用图标 → 打开 → 弹窗里再点「打开」（只需一次）；或
  - 终端执行 `xattr -dr com.apple.quarantine /Applications/ComicToKindle.app`
- 后续要做正式分发 / 自动更新，再申请 Apple Developer ID（$99/年）配置签名 + 公证，并重新启用 mac zip、blockmap/update info 与 `publish` 配置。

### 其他平台

```bash
npm run build:win     # 需在 Windows 机器或 CI 上跑（sharp 二进制按平台安装）
npm run build:linux   # AppImage / deb / snap
```

这些脚本同样先 `npm run build` 再调 electron-builder。Windows/Linux 暂未配套签名与版本脚本，需要时再补。

## 常用检查

```bash
npm run typecheck
npm run lint
npm run format
git status --short
```

`npm run build` 是当前 UI 系统和应用壳变更后的主验证命令。发布分支前可再运行 `npm run lint` 和 `npm run format`。

## 环境变量

当前没有应用专属环境变量。

如果后续新增转换器路径、Kindle 邮箱设置、转换后自动投递开关或模型位置，需要同步更新本文和 `AGENTS.md`。

Send to Kindle 网页通道有一项可配置项：STK 站点 URL，存 `userData/settings.json` 的 `webpush.url`（默认 amazon.com 美区），可在 `网页推送` 页修改。

## 本地状态与重置

- **托管库包路径**：`app.getPath('userData')/settings.json` 的 `libraryPackagePath`（macOS 通常在 `~/Library/Application Support/comic-to-kindle/` 的 `settings.json` 内）。删除该字段或在应用内「打开库」可重选库包；「新建库」会创建新的 `.ctklib`。
- **库包内容**：`.ctklib/library.json` 保存分组、归属和排序；`.ctklib/books/<bookId>/book.json` 保存卷册显示名和来源 hints；`.ctklib/trash/` 保存库内软删除卷册。导入源文件不再作为库结构真相。
- **renderer 偏好（localStorage）**：`comic-to-kindle-theme`、`comic-to-kindle-language`、`comic-to-kindle-reading-direction`、`comic-to-kindle-reading-mode`、`comic-to-kindle-reading-progress`（每卷续读进度）。清掉对应键即可重置。
- **压缩包解压缓存**：`app.getPath('userData')/extracted/<hash>/`（图片 + `.manifest.json`，按所有分卷的 路径+mtime+size 哈希）。删除整个 `extracted/` 目录即可清空，下次打开会重新解压。
- **文档页面缓存**：`app.getPath('userData')/documents/<hash>/`（PDF 渲染页或图片型 EPUB 抽出的页面 + `.manifest.json`，按源文件 路径+mtime+size 哈希）。删除整个 `documents/` 目录即可清空，下次打开 PDF/EPUB 会重新准备页面。
- **封面缩略图缓存**：`app.getPath('userData')/thumbs/<hash>.webp`。可随时整目录删除，下次进库自动重建。
- **压缩包密码池**：`settings.json` 的 `archivePasswords`（safeStorage 加密的 base64 数组）。删除该字段可清空已记住的解压密码。
- 漫画库本身无数据库/索引；书架由 `.ctklib` manifest 实时投影。删除或损坏 `library.json` 时，打开库包会尽量从各桶 `book.json` 重建。

## 已知工具链说明

- 当前仓库位于 iCloud Drive 同步目录；若再次出现 Node toolchain 卡住，优先迁回本地非同步目录。
- 压缩包解压用内置 7-Zip（`7zip-bin`）。打包时 `electron-builder.yml` 的 `asarUnpack` 必须放行 `node_modules/7zip-bin/**`，运行时把 `path7za` 里的 `app.asar` 替换为 `app.asar.unpacked`，否则打包后 `7za` 不可执行、压缩包卷册无法解压。
- 图像处理用 `sharp`（封面缩略图 + 转换）。`asarUnpack` 必须放行 `node_modules/sharp/**` 和 `node_modules/@img/**`：`@img/sharp-libvips-*` 只含 `.dylib`、不含 `.node`，electron-builder 的 smartUnpack 靠 `.node` 识别会漏掉它，导致打包后 sharp 一调用就崩。
- PDF 渲染用 `pdfjs-dist` + `@napi-rs/canvas`。`asarUnpack` 必须放行 `node_modules/@napi-rs/canvas/**` 与 `node_modules/@napi-rs/canvas-*/**`，否则打包后 native canvas 可能加载失败。`npm run pack:doctor` 会检查 canvas unpack 配置。
- 这些原生库（sharp `.node`、libvips `.dylib`、`7za`、canvas 平台 `.node`）npm 包自带 ad-hoc 签名，无需额外重签。
- shadcn CLI 无法自动把该 Electron Vite 项目识别为标准 Vite app，因此项目通过 `components.json` 手动配置 shadcn。
- `设计组件` 和 `基础规范` 是开发期提效页面，不代表已实现终端用户功能。
- `npm run build` 是当前验证设置是否正确的事实来源。
