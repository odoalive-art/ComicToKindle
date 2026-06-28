# ComicToKindle 更新日志

本文是 ComicToKindle 的更新日志源文件。它同时服务两件事：

- 打包时生成 dmg 根目录里的 `版本说明.txt`
- 未来上线官网后渲染为 `/changelog`

维护规则：

- 每个公开内测版本用二级标题：`## <version> · <YYYY-MM-DD>`
- 每个版本优先包含「亮点 / 新增 / 改进 / 修复 / 已知限制 / 下载」这些稳定栏目；没有内容的栏目可以省略
- 不把尚未实现的能力写成已上线；路线规划放在 `docs/roadmap.md`
- dmg 文件名由打包脚本生成，补记录时把最终文件名写进「下载」

## 下一版（未发布） · 2026-06-28

### 新增

- 图片目录、压缩包和图片型 EPUB 阅读器新增本地 waifu2x AI 放大：原图先显示、增强完成后替换，支持状态角标、邻页预取、缓存管理与按住对比原图。
- `扩展功能` 页新增引擎状态、倍率、降噪、缓存上限与清理入口。
- 阅读器新增顶栏页码触发的快速翻页面板和沉浸全屏；漫画画面默认无常驻进度条，拖动时预览页码、松手后跳转，全屏控件静置后自动隐藏。
- AI 原图对比与全屏按钮统一使用 Lucide `Blend`、`Fullscreen`/`Shrink` 图标；`Esc` 优先关闭快速翻页面板，避免连带退出阅读器。
- 阅读器顶栏与书架顶栏统一使用 36×36 ghost icon Button、muted 图标色、1.75 线宽和 Tooltip；AI 开启态改用轻量 accent 背景，不再使用独立橙色图标。

### 验证

- 真实 ZIP（182 页）与图片型 EPUB（165 页）均完成「增强中 → 已增强 → 原图对比」回归；首屏分别从 850px→1700px、1072px→2144px。
- 本地自签安装包构建通过；zip 解包后 `codesign --verify --deep --strict` 通过，arm64 waifu2x 可执行与 cunet 模型可用。

### 修复

- 修复开启 AI 增强后翻页可能短暂黑闪：邻页始终预热原图，增强图改为独立叠层并淡入，快速跳页期间暂停无效的 AI 预取。

### 已知限制

- PDF 阅读继续使用 Chromium 内置查看器，暂不支持阅读增强；转换输出也不会烤入增强图。
- 转换后自动投递暂缓：约 50MB 的 SMTP 实用体积目标会导致大卷漫画严重压缩，当前优先使用 ≤200MB 的 Send to Kindle 网页推送。

## 0.1.0-beta.4 · 2026-06-27

### 修复

- 修复 electron-builder 26 配置 `mac.identity: null` 时会在解析自定义 `sign` 钩子前跳过签名，导致自签证书未应用的问题。
- macOS 打包改为用 `identity: "-"` 进入 `scripts/sign-mac.cjs`，再由钩子按 `CTK_SIGN_IDENTITY` 执行自签或 ad-hoc `codesign`，避开本机 `@electron/osx-sign` 卡死问题。

### 验证

- 已从安装在 `/Applications` 的 `0.1.0-beta.3` 完成一次真实 electron-updater/Squirrel.Mac 自动升级：发现新版、下载、点击重启、替换并重启到 `0.1.0-beta.4` 全部通过。
- 更新后应用仍为 `Authority=ComicToKindle Self-Signed` / `Identifier=com.comictokindle.app`，`codesign --verify --strict` 通过。

### 下载

- `comic-to-kindle-0.1.0-beta.4-20260627-171139.dmg`

## 0.1.0-beta.3 · 2026-06-27

### 修复

- 接通自定义 macOS 签名钩子，发布产物使用稳定自签证书签名，同时保留不传 `CTK_SIGN_IDENTITY` 时的 ad-hoc 本地出包。
- 新增打包体检项，防止 `mac.identity` 再次被改回会跳过钩子的 `null`。

### 验证

- 最终 zip 解压后显示 `Authority=ComicToKindle Self-Signed` 与 `Identifier=com.comictokindle.app`，`codesign --verify --strict` 通过。
- `latest-mac.yml` 的 zip `size` / `sha512` 与最终产物一致。

### 下载

- `comic-to-kindle-0.1.0-beta.3-20260627-170610.dmg`

## 未发布 · 2026-06-25

### 新增

- 导入预览弹窗新增「导入目标」选择，可把本次导入的全部候选卷册放入散卷、已有部或新建部。
- 库内容区支持从 Finder/桌面拖放文件或文件夹导入；拖放入口复用现有扫描、预览、删源勾选和导入进度。

### 改进

- `library:scanImport` 支持接收多个路径并合并候选与跳过项，按钮导入和拖放导入共用同一套预览管线。
- preload 暴露 Electron `webUtils.getPathForFile(file)`，用于在 renderer 拖放事件中安全取得真实磁盘路径。
- 漫画库移除列表模式和视图切换入口，保留单一书架网格浏览方式。
- 漫画库顶栏图标改用说明文案同级的弱化色值，顶栏与右键菜单图标线宽统一为 1.75，降低工具区视觉重量。

### 修复

- 修复库内回收站等实体列表弹窗在长标题和右侧操作按钮并排时横向溢出的问题；长信息会截断或折行，操作入口保持可见。

## 0.1.0-beta.2 · 2026-06-23

### 亮点

- 完成本地漫画库到 Kindle 投递的核心闭环：浏览、阅读、转换、归档、投递。
- 新增 PDF 单文件与图片型 EPUB 来源，来源准备后可直接阅读并转换为 Kindle 固定版式 EPUB。
- macOS 内测包改为 dmg-only，文件名带构建时间戳，方便留存和对比。
- dmg 根目录内置 `版本说明.txt`，打开安装包即可查看当前版本摘要。

### 新增

- 支持图片目录与 CBZ/ZIP/CBR/RAR/7z 压缩包卷册，含加密 zip、多卷分卷、共享密码池与解压进度。
- 支持 PDF 单文件卷册，自动渲染为页面图片后进入阅读器和 Kindle 转换。
- 支持图片型 EPUB 来源，按 OPF spine / XHTML 图片引用抽取页面。
- 支持 Kindle 固定版式 EPUB 转换，写入书名「漫画名 + 卷册」和作者元数据。
- 支持转换队列持久化；应用重启后未完成任务标记为中断，由用户确认是否继续重跑。
- 支持归档视图管理转换产物，并通过 SMTP 邮件或 Send to Kindle 网页通道投递。
- 支持 Eagle 式 `.ctklib` 托管库包：导入复制成桶，分组、书名、作者和排序写入 manifest，不改用户导入源。
- 支持库内回收站：卷册软删除到 `.ctklib/trash/`，可还原或清空。

### 改进

- 开发期 `设计组件 / 基础规范` 页面仅 dev 构建可见，生产包不再打入演示页重依赖。
- 打包依赖分层收敛到 main/preload 运行时依赖，避免 UI 库重复进入 `app.asar`。
- mac arm64 包剔除不需要的 7zip linux/win/mac x64 二进制与本地 agent 配置目录。

### 修复

- 修复 sharp/libvips 打包后不可用的问题，显式 unpack `sharp` 与 `@img`。
- 修复压缩包解密场景下 7za 等待 stdin 导致的阻塞风险。
- 修复部分库整理操作后卷册视图短暂闪回骨架屏的问题。

### 已知限制

- 尚未实现漫画元数据库/索引；当前书架由 `.ctklib` manifest 实时投影。
- EPUB 首版仅支持图片型来源；纯文本/重排 EPUB 暂不解析为页面。
- 尚未实现图像增强或 AI 放大。
- 尚未实现转换后自动投递。

### 下载

- beta.2 已完成本地打包验收；公开下载请使用后续 beta.3 或 beta.4 Release。
