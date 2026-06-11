# 架构说明

本文描述 2026-06-11 时点的应用基础架构。

## 当前范围

ComicToKindle 目前是一个桌面应用工作台基础，用于后续承载本地漫画库、Kindle 转换流程和投递工具。

已实现：

- Electron 应用壳
- React renderer 应用
- main、preload、renderer 的 TypeScript 配置
- Tailwind CSS 4
- shadcn/ui 组件体系
- 构建和打包脚本
- `src/renderer/src/App.tsx` 中的侧边栏工作台壳
- 使用静态数据的漫画库占位工作区
- 顶栏应用级深浅模式切换
- 顶栏中英切换
- 开发期使用的 shadcn 组件索引和本地文档镜像
- 开发期使用的基础规范页，覆盖颜色、字体、字号和间距

未实现：

- 漫画文件扫描
- 元数据持久化
- 转换流水线
- 图像处理或 AI 放大
- Kindle 投递
- Send to Kindle 网页嵌入

## 运行层

```txt
Electron main process
  src/main/index.ts
  负责 BrowserWindow 创建、应用生命周期、外部链接打开行为和 main-process IPC。

Preload process
  src/preload/index.ts
  将安全的 Electron API 桥接给 renderer。

Renderer process
  src/renderer/src/
  负责 React UI、Tailwind 样式和 shadcn/ui 组件。
```

## Renderer 工作区

当前 renderer 是本地桌面工作台，还不是完整产品 UI。

```txt
漫画库
  未来本地漫画库的静态占位视图。

设计组件
  开发期 shadcn/ui 组件索引和本地文档镜像。
  数据源：src/renderer/src/data/shadcn-docs.ts
  已镜像 Accordion、Button、Dialog、Sidebar、Table，支持中文阅读和英文原文切换。

基础规范
  开发期设计基础参考页。
  覆盖颜色 token、字体栈、字号层级和间距层级。

导入收件箱 / 转换队列 / 投递记录 / 归档
  导航占位。对应产品工作流尚未实现。
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

## UI 系统

renderer 使用 Tailwind CSS 4 和 shadcn/ui。

重要文件：

```txt
components.json
electron.vite.config.ts
src/renderer/src/assets/main.css
src/renderer/src/lib/utils.ts
src/renderer/src/components/ui/
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
漫画库领域
  扫描本地目录，读取压缩包和图片文件夹，存储元数据。

转换领域
  规范化页面，处理图像，生成 Kindle 友好的 EPUB。

投递领域
  通过 Kindle 邮箱、本地导出或 Send to Kindle 网页流程交付生成文件。

任务领域
  跟踪扫描、转换、放大和投递等长任务。
```

Electron main 或专门的服务模块应负责本地文件系统和进程执行。renderer 应通过明确的 preload 或 IPC API 调用这些能力，避免直接使用 Node API。

## 存储

目前没有存储层。添加持久化时，需要同步记录：

- 存储引擎
- 数据库或文件位置
- 迁移策略
- 数据模型
- 备份和重置行为

## 安全说明

当前 Electron scaffold 的 BrowserWindow 设置了 `sandbox: false`。在实现本地文件访问、Send to Kindle 嵌入或凭据存储之前，需要重新评估。

外部链接通过 `shell.openExternal` 打开，并且应用窗口会拒绝 new-window 导航。
