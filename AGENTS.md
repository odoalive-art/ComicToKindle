# Agent Notes

## Project State

ComicToKindle is a desktop app project for a local comic library, Kindle conversion workflow, and delivery tooling. The repository is currently at the foundation stage: Electron, Vite, React, TypeScript, Tailwind CSS, and shadcn/ui are installed and verified, but product workflows are not implemented.

The active repository path is:

```txt
/Users/linweiqiang/Desktop/ComicToKindle
```

Do not use the old iCloud Drive path. The project was moved off iCloud Drive on 2026-06-11 because running Node toolchain binaries from the synced path caused `esbuild` and `.bin` shim hangs.

## Stack

- Electron 39 with electron-vite 5
- React 19 and TypeScript 5
- Tailwind CSS 4 via `@tailwindcss/vite`
- shadcn/ui 4, Radix primitives, Lucide icons
- electron-builder packaging

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Use `npm run build` as the main verification command after setup or UI-system changes. It runs TypeScript checks and builds Electron main, preload, and renderer outputs.

## UI System

shadcn/ui is configured manually through `components.json` because the shadcn CLI does not auto-detect this Electron Vite project as a standard Vite app.

Aliases:

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

Generated components belong in:

```txt
src/renderer/src/components/ui/
```

Existing generated components:

```txt
button, card, dialog, input, progress, scroll-area, separator, sheet,
sidebar, skeleton, sonner, table, tabs, tooltip
```

`src/renderer/src/hooks/use-mobile.ts` and `src/renderer/src/lib/utils.ts` are part of the shadcn setup.

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

## Development Notes

- Keep docs in `docs/` aligned when adding product workflows.
- Keep README installation and verification commands synchronized with `package.json`.
- Do not add iCloud-specific toolchain workarounds unless the repository is moved back into a synced folder.
- Prefer shadcn/ui components and local patterns over custom component primitives.
