# ComicToKindle

ComicToKindle 是一个 Electron 桌面应用基础项目，用于后续实现本地漫画库、面向 Kindle 的转换流程和投递工具。

当前项目包含可运行的应用壳、漫画库占位工作区，以及开发期用于搭建界面的设计辅助工作区。漫画扫描、图像处理、EPUB 生成和 Kindle 投递等产品工作流尚未实现。

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

当前生成组件包括 accordion、button、card、dialog、input、progress、scroll-area、separator、sheet、sidebar、skeleton、sonner、table、tabs 和 tooltip。

## 当前状态

截至 2026-06-11：

- Electron + Vite + React + TypeScript 应用可以成功构建。
- Tailwind CSS 和 shadcn/ui 已配置。
- renderer 已有侧边栏应用壳和漫画库占位工作区。
- 顶栏提供应用级深浅模式切换和中英切换，切换会影响整个 renderer。
- 开发期工作区包含 shadcn 组件选型页和基础规范页；基础规范页读取 `src/renderer/src/data/design-tokens.ts`。
- shadcn 本地组件文档镜像目前包含完整组件索引，并已补全 A 到 I 范围内组件文档；这些镜像文档支持中文阅读和英文原文切换，复制示例名时仍复制英文源值。
- 尚未实现真实漫画库、转换器、图像放大、EPUB 生成或 Kindle 投递功能。
