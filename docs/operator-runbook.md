# 运行手册

本文覆盖当前基础阶段的安装、开发和验证流程。

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
- `所有漫画` 视图首次进入显示空状态，点「选择漫画库文件夹」选目录后显示部封面网格；**双击**某部看卷册、**双击**卷册进入阅读器（单页/双页、左右方向、续读）；单击为选中（文件管理器式交互）。库根目录会被记住。
- 压缩包卷册（CBZ/ZIP/CBR/RAR/7z，含分卷 `name.7z.001` 等——只显示入口卷）显示压缩包/锁占位图标；点开阅读或转换时先解压到缓存并显示进度条/进度 toast；加密包弹密码框（可输中文，勾「记住」加入共享密码池，后续同密码包自动解）。
- 转换某一卷会先弹「确认书籍信息」框（预填漫画名/卷册名/作者，可改）；产物书名 = 「漫画名 + 卷册」、作者写入元数据。库网格右键某部 / 进入后顶栏铅笔可编辑该部名称/作者（持久化，不改本地文件夹）。
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

`release:mac` = 先 `npm version prerelease --no-git-tag-version`（版本号 `beta.N → beta.N+1`，不打 git tag）→ 再 `npm run build:mac`。免去手动改 `package.json` 版本号。产物落在 `dist/`：

- `dist/comic-to-kindle-<version>.dmg` ← 发给测试者的就是这个
- `dist/ComicToKindle-<version>-arm64-mac.zip`（含 blockmap，自动更新用，当前未启用）

注意：

- **首次出包不用 `release:mac`**，当前已是 `beta.1`，直接 `npm run build:mac` 即可；之后每轮才用 `release:mac` 递增。
- `release:mac` 会改 `package.json` 版本号但**不自动 git 提交**，记得事后 `git commit`，让仓库版本与发出去的包对得上。
- 只单纯打包、不动版本号时用 `npm run build:mac`。

### 关于签名（内测不公证）

- `electron-builder.yml` 设 `mac.identity: null`，跳过 Developer ID、改 **ad-hoc 签名**（Apple Silicon 必须有签名才能启动；ad-hoc 即可）。
- `build:mac` 脚本内置 `CSC_IDENTITY_AUTO_DISCOVERY=false`，避免 electron-builder 去钥匙串找证书（本机有两张同名 `Apple Development` 证书会报 `ambiguous` 而打包失败）。
- 因未做 Apple 公证，测试者下载 `.dmg` 拖入「应用程序」后首次打开会被 Gatekeeper 拦（"无法验证开发者"）。**给测试者的说明**，二选一：
  - 右键应用图标 → 打开 → 弹窗里再点「打开」（只需一次）；或
  - 终端执行 `xattr -dr com.apple.quarantine /Applications/ComicToKindle.app`
- 后续要做正式分发 / 自动更新，再申请 Apple Developer ID（$99/年）配置签名 + 公证，并填好 `electron-builder.yml` 的 `publish.url`（当前是占位 `https://example.com`）。

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

- **库根目录**：`app.getPath('userData')/settings.json` 的 `libraryRoot`（macOS 通常在 `~/Library/Application Support/comic-to-kindle/`）。删除该文件或在应用内「切换文件夹」可重选库。
- **renderer 偏好（localStorage）**：`comic-to-kindle-theme`、`comic-to-kindle-language`、`comic-to-kindle-reading-direction`、`comic-to-kindle-reading-mode`、`comic-to-kindle-reading-progress`（每卷续读进度）。清掉对应键即可重置。
- **压缩包解压缓存**：`app.getPath('userData')/extracted/<hash>/`（图片 + `.manifest.json`，按所有分卷的 路径+mtime+size 哈希）。删除整个 `extracted/` 目录即可清空，下次打开会重新解压。
- **封面缩略图缓存**：`app.getPath('userData')/thumbs/<hash>.webp`。可随时整目录删除，下次进库自动重建。
- **压缩包密码池**：`settings.json` 的 `archivePasswords`（safeStorage 加密的 base64 数组）。删除该字段可清空已记住的解压密码。
- **每部名称/作者覆盖**：`settings.json` 的 `seriesMeta`（`{ <部文件夹名>: { title, author } }`）。删除该字段或对应键可恢复按 `[作者]标题` 解析。
- 漫画库本身无数据库/索引，每次进入实时扫描目录。

## 已知工具链说明

- 当前仓库位于 iCloud Drive 同步目录；若再次出现 Node toolchain 卡住，优先迁回本地非同步目录。
- 压缩包解压用内置 7-Zip（`7zip-bin`）。打包时 `electron-builder.yml` 的 `asarUnpack` 必须放行 `node_modules/7zip-bin/**`，运行时把 `path7za` 里的 `app.asar` 替换为 `app.asar.unpacked`，否则打包后 `7za` 不可执行、压缩包卷册无法解压。
- 图像处理用 `sharp`（封面缩略图 + 转换）。`asarUnpack` 必须放行 `node_modules/sharp/**` 和 `node_modules/@img/**`：`@img/sharp-libvips-*` 只含 `.dylib`、不含 `.node`，electron-builder 的 smartUnpack 靠 `.node` 识别会漏掉它，导致打包后 sharp 一调用就崩。三个原生库（sharp `.node`、libvips `.dylib`、`7za`）npm 包自带 ad-hoc 签名，无需额外重签。
- shadcn CLI 无法自动把该 Electron Vite 项目识别为标准 Vite app，因此项目通过 `components.json` 手动配置 shadcn。
- `设计组件` 和 `基础规范` 是开发期提效页面，不代表已实现终端用户功能。
- `npm run build` 是当前验证设置是否正确的事实来源。
