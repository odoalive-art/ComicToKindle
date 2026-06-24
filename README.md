# ComicToKindle

ComicToKindle 是一个 Electron 桌面应用，用于本地漫画库管理、面向 Kindle 的转换流程和投递工具。

当前已实现完整闭环：可运行的应用壳、真实的本地漫画库浏览（左侧文件夹树导航 + 忠实磁盘目录网格，递归识别可读卷册用于阅读/转换，可在应用内改每部名称/作者，封面走缩略图缓存）、卷册阅读器（单页/双页、左右阅读方向、记住续读进度）、卷册（图片目录 + CBZ/ZIP/CBR/RAR/7z 压缩包，PDF 单文件、图片型 EPUB）转 Kindle 固定版式 EPUB（sharp + archiver，书名「漫画名+卷册」+ 作者元数据、转换前确认弹窗）、转换队列持久化（含重启后中断恢复）、产物归档、以及投递到 Kindle（SMTP 邮件 nodemailer + safeStorage 加密凭据 / Send to Kindle 网页通道 ≤200MB 二选一）。库视图采用文件管理器式交互（双击进入、单击选中、整卡框选多选），并支持应用内文件整理（右键重命名/移动到另一部/删除到废纸篓、新建文件夹，均为真·本地文件操作）。另含开发期用于搭建界面的设计辅助工作区。尚未实现：漫画元数据库/索引、图像 AI 放大、转换后自动投递。

## 技术栈

- Electron 39
- electron-vite 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui 4、Radix primitives、Lucide icons
- electron-builder 打包

## 环境要求

- Node.js 22 或更新版本
- npm 10 或更新版本
- macOS、Windows 或 Linux，需满足 Electron 支持的开发目标

当前仓库路径：

```bash
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

注意：该路径位于 iCloud Drive 同步目录。2026-06-11 曾在同步盘路径下遇到 `esbuild` 和 `.bin` shim 执行卡住的问题；如果再次复现，优先把仓库迁回本地非同步目录再继续开发。

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

该命令会启动 Electron main process、preload script 和 renderer dev server。

## 验证

```bash
npm run typecheck
npm run build
```

`npm run build` 会编译 main、preload 和 renderer，并输出到 `out/`。

## 打包

```bash
npm run pack:doctor   # 打包前体检（依赖分层、builder 配置、esbuild、版本说明）
npm run build:mac      # macOS dmg（当前内测主用）
npm run release:mac    # 版本号 prerelease +1 后再打 macOS 包（每轮内测用）
npm run build:win
npm run build:linux
```

平台安装包由 electron-builder 生成（macOS 走 ad-hoc 签名，未公证）。当前 macOS 内测流程只保留 dmg，文件名带版本号和构建时间戳，避免同版本重打互相覆盖；dmg 根目录会带 `版本说明.txt`，内容由 `docs/release-notes.md` 生成。跨平台打包可能需要在目标系统运行，或提前配置对应平台工具链。完整的内测分发、签名、Gatekeeper 绕过与版本递增说明见 `docs/operator-runbook.md`「打包与内测分发」。

## 项目结构

```txt
src/main/                 Electron main process
src/preload/              Preload bridge 和暴露给 renderer 的类型
src/renderer/             React renderer 应用
src/renderer/src/assets/  Tailwind 和 shadcn CSS token
src/renderer/src/components/ui/
                          shadcn/ui 生成组件
src/renderer/src/data/    开发期本地数据，包括设计 token 和 shadcn 文档镜像数据
docs/                     架构、运行手册、交接记录、多 Agent 协作规则、更新日志和路线图
```

## 多 Agent 协作

如果使用 Codex、Claude Code、Antigravity 接力开发，先阅读：

```txt
docs/agent-collaboration.md
```

该文档记录共同入口、验证命令、文档同步规则和交接格式。

## shadcn/ui

shadcn 配置位于 `components.json`。

alias 配置：

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

生成的 UI 组件应放在：

```txt
src/renderer/src/components/ui/
```

已生成组件以 `src/renderer/src/components/ui/` 目录实际文件为准（当前约 55 个，含部分自定义组件）。

## 当前状态

截至 2026-06-24：

- Electron + Vite + React + TypeScript 应用可以成功构建。
- Tailwind CSS 和 shadcn/ui 已配置。
- 真实本地漫画库浏览：通过 main 进程忠实列出磁盘目录（库根即「所有漫画」目录网格），左侧文件夹树用于定位；递归识别可读卷册用于阅读/转换与封面；`comic://` 协议加载封面（封面走 480px webp 缩略图缓存）；库根目录持久化；每部名称/作者可在应用内编辑（右键网格 / 顶栏铅笔，存 `settings.json` 的 `seriesMeta`，不改本地文件夹名）。
- 卷册阅读器：单页/双页、左右阅读方向、记住每卷续读进度。
- 压缩包来源：CBZ/ZIP/CBR/RAR/7z 卷册（含加密 zip 与多卷分卷）经内置 7-Zip（`src/main/archive.ts`，7zip-bin）解出图片到 `userData/extracted/`，阅读/转换共用，解压有进度反馈；加密包用 safeStorage 加密的共享密码池，缺密码时弹框补录。
- 文档来源：PDF 单文件卷册经 PDF.js + `@napi-rs/canvas` 渲染成页面 PNG 缓存；图片型 EPUB 经 7-Zip 解包后按 OPF spine/XHTML 图片引用抽取页面。两者都复用阅读器与 Kindle 转换流水线；纯文本/重排 EPUB 暂不支持。
- 转换闭环：卷册 → Kindle 固定版式 EPUB（`src/main/convert.ts`，sharp + archiver），书名「漫画名 + 卷册」+ 作者元数据、单卷转换前弹确认弹窗；产物由应用托管落在 `userData/converted/`，「归档」视图管理；库卡片显示「已转换」角标。
- 库视图交互＝文件管理器式（对标 Eagle），内容区统一使用网格交互：`所有漫画` 直接显示库根目录网格；左侧边栏文件夹树相当于目录面包屑/定位器，点文件夹后同一套网格忠实列出磁盘直接内容（子文件夹、可读漫画单文件、普通文件、图片文件）。卡片按下即选中，单个选中仅高亮，选中 2 个及以上进入多选模式。
- 应用内文件整理：库网格右键**重命名 / 移动到另一部 / 删除到废纸篓**、顶栏「新建文件夹」；左树导航进入的目录网格支持所有直接文件/文件夹点击、选中、右键和**拖拽移动**（拖卡片到树节点/文件夹）；均为真·本地文件操作，统一越权校验，删除走系统废纸篓可还原。
- 转换队列持久化：队列落 `userData/queue.json`（`src/main/queue.ts`），关窗即退出应用；重启后未完成任务标为「中断」、由 toast + 角标提示用户确认是否继续（不自动重跑），并清扫孤儿临时目录。
- Kindle 投递：SMTP（`src/main/deliver.ts`，nodemailer），密码经 `safeStorage` 加密存储、不回传 renderer；「设备与邮箱」配置页可保存 + 测试连接，归档每条可手动投递/重发。
- Send to Kindle 网页推送：应用内嵌 Amazon 网页通道（`src/main/webpush.ts`，≤200MB 单文件，适合 SMTP 发不动的大卷），CDP 拦截文件框自动填入产物、半自动发送；归档/转换活动浮窗均有「网页推送」入口。
- 顶栏提供应用级深浅模式切换和中英切换，切换会影响整个 renderer。
- 开发期工作区包含 shadcn 组件选型页和基础规范页；基础规范页读取 `src/renderer/src/data/design-tokens.ts`。
- 尚未实现：漫画元数据存储/索引、图像 AI 放大、转换后自动投递；批量重命名、文件夹树节点右键菜单。

详细架构（漫画库数据层、IPC、数据模型、存储键）见 `docs/architecture.md`。
