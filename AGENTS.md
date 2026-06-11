# Agent 说明

## 项目状态

ComicToKindle 是一个桌面应用项目，用于后续实现本地漫画库、Kindle 转换流程和投递工具。仓库当前处于基础阶段：Electron、Vite、React、TypeScript、Tailwind CSS 和 shadcn/ui 已安装并验证，产品工作流尚未实现。

当前仓库路径：

```txt
/Users/linweiqiang/Desktop/ComicToKindle
```

不要使用旧 iCloud Drive 路径。项目在 2026-06-11 从同步盘路径迁出，因为在该路径运行 Node 工具链二进制时出现过 `esbuild` 和 `.bin` shim 卡住。

## 技术栈

- Electron 39 with electron-vite 5
- React 19 and TypeScript 5
- Tailwind CSS 4 via `@tailwindcss/vite`
- shadcn/ui 4、Radix primitives、Lucide icons
- electron-builder packaging

## 命令

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

完成 setup 或 UI 系统相关变更后，优先使用 `npm run build` 作为主验证命令。它会运行 TypeScript 检查，并构建 Electron main、preload 和 renderer 输出。

## 多 Agent 协作

Codex、Claude Code、Antigravity 接力开发时，先读：

```txt
docs/agent-collaboration.md
```

该文件是本项目的共同协作协议，规定入口文档、验证命令、交接格式、文档同步和冲突处理方式。

中文优先是硬性协作原则：面向用户的回复、项目文档、交接记录、运行手册、任务记录、UI 文案和 commit message 默认使用中文；技术名词、命令、路径、包名、API 名称保留原文。只有用户明确要求其他语言时才切换。

## UI 系统

shadcn/ui 通过 `components.json` 手动配置。原因是 shadcn CLI 无法自动把这个 Electron Vite 项目识别为标准 Vite app。

alias：

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

生成的组件应放在：

```txt
src/renderer/src/components/ui/
```

当前已生成组件：

```txt
button, card, dialog, input, progress, scroll-area, separator, sheet,
sidebar, skeleton, sonner, table, tabs, tooltip
```

`src/renderer/src/hooks/use-mobile.ts` 和 `src/renderer/src/lib/utils.ts` 属于 shadcn setup 的一部分。

## Renderer 工作区

`src/renderer/src/App.tsx` 当前提供侧边栏应用壳，包含这些工作区入口：

```txt
漫画库
设计组件
基础规范
导入收件箱
转换队列
投递记录
归档
```

当前只有 `漫画库`、`设计组件` 和 `基础规范` 有实际本地 UI。漫画库内容是占位数据，不是真实扫描器或持久化层。

顶栏有应用级深浅模式切换按钮，会在 `document.documentElement` 上切换 `.dark` class，并把选择保存到 `localStorage` 的 `comic-to-kindle-theme`。

`设计组件` 是开发期 shadcn/ui 组件本地镜像和选型入口。源数据位于：

```txt
src/renderer/src/data/shadcn-docs.ts
```

该镜像当前跟踪 shadcn Radix docs 路径，并有 Button、Dialog、Table 的本地文档内容；Button 预览已尽量贴近官方 Radix 页面。

梳理 shadcn 设计组件时，完整规则见 `docs/agent-collaboration.md` 的 `shadcn 设计组件梳理规则`。核心原则是：官方文档路径、source ref 和 license 要可追溯；`索引中`、`已镜像`、`已安装` 三种状态必须分清；预览尽量贴近官方，但不要为了单个示例引入重依赖。

`基础规范` 是开发期设计参考页，覆盖当前 renderer UI 系统中的颜色 token、字体栈、字号层级和间距层级。它不应被当作终端用户功能。

基础规范页的数据源位于：

```txt
src/renderer/src/data/design-tokens.ts
```

颜色主题的真实运行时 token 仍以 `src/renderer/src/assets/main.css` 中的 CSS variables 和 `@theme inline` 为准；`design-tokens.ts` 用于集中记录和渲染规范数据，不替代 Tailwind/shadcn 的语义类使用方式。

## 当前产品边界

应用尚未实现：

- 本地漫画扫描或元数据存储
- CBZ、CBR、图片文件夹、EPUB 或 PDF 转换逻辑
- 图像增强或 AI 放大
- Send to Kindle 网页嵌入
- Kindle 邮箱投递
- 任务队列、持久化或设置

除非代码已经实现，否则不要把这些写成现有功能。

## 开发备注

- 添加产品工作流时，保持 `docs/` 同步更新。
- 保持 README 中的安装和验证命令与 `package.json` 同步。
- 除非仓库重新移回同步目录，否则不要新增 iCloud 特定工具链 workaround。
- 优先使用 shadcn/ui 组件和本地既有模式，不要随意新增自定义 primitive。
- 多 agent 接力时遵守 `docs/agent-collaboration.md`，结束阶段前更新必要文档和交接记录。
