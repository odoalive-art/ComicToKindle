# ComicToKindle

ComicToKindle 是一个 Electron 桌面应用，用于本地漫画库管理、面向 Kindle 的转换流程和投递工具。

当前已实现完整闭环：可运行的应用壳、真实的本地漫画库浏览（按「部 / 卷册」两级展示）、卷册阅读器（单页/双页、左右阅读方向、记住续读进度）、卷册转 Kindle 固定版式 EPUB（sharp + archiver）、产物归档、以及 SMTP 投递到 Kindle 邮箱（nodemailer + safeStorage 加密凭据）。库视图支持多选/框选批量转换。另含开发期用于搭建界面的设计辅助工作区。尚未实现：漫画元数据库/索引、压缩包（CBZ/CBR/PDF）来源、图像 AI 放大、队列持久化。

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
npm run build:mac
npm run build:win
npm run build:linux
```

平台安装包由 electron-builder 生成。跨平台打包可能需要在目标系统运行，或提前配置对应平台工具链。

## 项目结构

```txt
src/main/                 Electron main process
src/preload/              Preload bridge 和暴露给 renderer 的类型
src/renderer/             React renderer 应用
src/renderer/src/assets/  Tailwind 和 shadcn CSS token
src/renderer/src/components/ui/
                          shadcn/ui 生成组件
src/renderer/src/data/    开发期本地数据，包括设计 token 和 shadcn 文档镜像数据
docs/                     架构、运行手册、交接记录和多 Agent 协作规则
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

截至 2026-06-19：

- Electron + Vite + React + TypeScript 应用可以成功构建。
- Tailwind CSS 和 shadcn/ui 已配置。
- 真实本地漫画库浏览：通过 main 进程扫描目录、`comic://` 协议加载封面，按「部 / 卷册」两级展示；库根目录持久化。
- 卷册阅读器：单页/双页、左右阅读方向、记住每卷续读进度。
- 转换闭环：卷册 → Kindle 固定版式 EPUB（`src/main/convert.ts`，sharp + archiver），产物由应用托管落在 `userData/converted/`，「归档」视图管理；库卡片显示「已转换」角标。
- 库视图多选：选择按钮 / 点选 / 空白处框选 / Cmd·Ctrl+A 全选 → 批量转换。
- Kindle 投递：SMTP（`src/main/deliver.ts`，nodemailer），密码经 `safeStorage` 加密存储、不回传 renderer；「设备与邮箱」配置页可保存 + 测试连接，归档每条可手动投递/重发。
- 顶栏提供应用级深浅模式切换和中英切换，切换会影响整个 renderer。
- 开发期工作区包含 shadcn 组件选型页和基础规范页；基础规范页读取 `src/renderer/src/data/design-tokens.ts`。
- 尚未实现：漫画元数据存储/索引、压缩包（CBZ/CBR/PDF）来源、图像 AI 放大、队列持久化。

详细架构（漫画库数据层、IPC、数据模型、存储键）见 `docs/architecture.md`。
