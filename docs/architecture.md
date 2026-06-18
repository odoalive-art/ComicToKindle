# 架构说明

本文描述 2026-06-19 时点的应用架构。

## 当前范围

ComicToKindle 目前是一个桌面应用工作台，已实现真实的本地漫画库浏览与卷册阅读器；Kindle 转换流程和投递工具尚未实现。

已实现：

- Electron 应用壳
- React renderer 应用
- main、preload、renderer 的 TypeScript 配置
- Tailwind CSS 4
- shadcn/ui 组件体系
- 构建和打包脚本
- `src/renderer/src/App.tsx` 中的侧边栏工作台壳
- **真实漫画库浏览**：扫描本地目录，按「部 / 卷册」两级展示（详见「漫画库数据层」）
- **卷册阅读器**：单页 / 双页、左右阅读方向、记住每卷续读进度
- 顶栏应用级深浅模式切换
- 顶栏中英切换
- 自定义交通灯窗口控件（通过 IPC 接管关闭/最小化/最大化）
- 开发期使用的 shadcn 组件索引和本地文档镜像
- 开发期使用的基础规范页，覆盖颜色、字体、字号和间距

未实现：

- 元数据持久化（数据库 / 索引；当前每次进入实时扫描）
- 转换流水线（CBZ/CBR/图片文件夹 → Kindle 友好 EPUB）
- 图像处理或 AI 放大
- Kindle 投递
- Send to Kindle 网页嵌入
- 任务队列

## 运行层

```txt
Electron main process
  src/main/index.ts
  负责 BrowserWindow 创建、应用生命周期、外部链接打开行为和 main-process IPC。
  处理自定义交通灯的 window-close / window-minimize / window-maximize IPC 事件。
  app ready 前调用 registerComicScheme()，ready 后调用 setupLibrary()。

  src/main/library.ts
  漫画库数据层：comic:// 协议、目录扫描、库根目录持久化。

Preload process
  src/preload/index.ts
  将安全的 Electron API 桥接给 renderer，暴露 window.api.library.*。
  类型定义在 src/preload/index.d.ts（LibrarySeries / LibraryVolume / LibraryAPI）。

Renderer process
  src/renderer/src/
  负责 React UI、Tailwind 样式和 shadcn/ui 组件。
```

## 漫画库数据层

漫画库的文件系统访问全部在 main 进程，renderer 通过 preload 暴露的 `window.api.library.*` 调用，不直接用 Node API。

**目录约定**（识别两级结构）：

```txt
库根目录 / 部(文件夹) / 卷册(文件夹或单文件) / [单话子文件夹] / 图片
```

- **部（series）**= 顶层文件夹，命名通常为 `[作者] 标题`，解析出作者与标题。
- **卷册（volume）**= 第二层；文件夹封面取首图、递归统计页数，遇到「单话」子文件夹会下钻取图；预留 `kind: 'folder' | 'file'` 给将来的 cbz/pdf 单文件卷册。
- 文件名一律按**自然排序**（`2.jpg` 在 `10.jpg` 前）。

**IPC 频道**（`ipcMain.handle` ↔ `ipcRenderer.invoke`）：

```txt
library:pickFolder    系统目录选择器，选中后写入 settings.json 并返回路径
library:getSavedRoot  读取已保存的库根目录（不存在/失效则返回 null）
library:scan          扫描库根 → LibrarySeries[]（含封面 URL、卷数）
library:listVolumes   扫描某部 → LibraryVolume[]（含封面 URL、页数、kind）
library:listPages     按阅读顺序递归收集一卷所有页 → comic:// URL[]
```

**comic:// 协议**：`registerComicScheme()` 在 app ready 前注册为 privileged scheme，`setupLibrary()` 内 `protocol.handle('comic', …)` 服务图片。URL 形如 `comic://img/?p=<encodeURIComponent(绝对路径)>`；返回前做**越权校验**——必须是图片扩展名且位于当前库根目录内，否则 403。`src/renderer/index.html` 的 CSP `img-src` 已放行 `comic:`。

**数据模型**（`src/preload/index.d.ts` 为单一事实来源）：

```txt
LibrarySeries  id, path, name, title, author, volumeCount, coverUrl
LibraryVolume  id, path, name, title, kind('folder'|'file'), pageCount, coverUrl
```

## Renderer 工作区

当前 renderer 是本地桌面工作台，还不是完整产品 UI。

```txt
漫画库（所有漫画）
  真实本地漫画库浏览。LibraryView 自带合并顶栏（侧栏开关 + 面包屑 + 操作）。
  未设库 → 空状态选目录；一级部封面网格 → 点进二级卷册封面网格。
  点卷册进入 VolumeReader（单页/双页、左右方向、续读、相邻页预加载）。
  封面经 comic:// 加载，内描边样式，卷册卡片显示续读进度条。

设计组件
  开发期 shadcn/ui 组件索引和本地文档镜像。
  数据源：src/renderer/src/data/shadcn-docs.ts
  已镜像 A 到 I 范围内组件文档，支持中文阅读和英文原文切换。

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
src/renderer/src/components/ui/traffic-lights.tsx  ← 自定义交通灯组件
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
漫画库领域（浏览/阅读已实现，元数据存储待做）
  扫描本地目录、图片文件夹已实现；压缩包读取与元数据存储待做。

转换领域
  规范化页面，处理图像，生成 Kindle 友好的 EPUB。

投递领域
  通过 Kindle 邮箱、本地导出或 Send to Kindle 网页流程交付生成文件。

任务领域
  跟踪扫描、转换、放大和投递等长任务。
```

Electron main 或专门的服务模块应负责本地文件系统和进程执行。renderer 应通过明确的 preload 或 IPC API 调用这些能力，避免直接使用 Node API。

## 存储

当前没有数据库 / 漫画索引（每次进入实时扫描目录）。已有的持久化：

- **库根目录**：main 进程写入 `app.getPath('userData')/settings.json` 的 `libraryRoot` 字段。
- **renderer localStorage 键**：
  - `comic-to-kindle-theme` 深浅模式
  - `comic-to-kindle-language` 中英语言
  - `comic-to-kindle-reading-direction` 阅读方向（ltr/rtl）
  - `comic-to-kindle-reading-mode` 阅读模式（single/double）
  - `comic-to-kindle-reading-progress` 每卷续读进度（{ 卷路径: 页索引 } 的 JSON）

后续若引入漫画元数据库 / 索引，需要在本节补充存储引擎、位置、迁移策略、数据模型与重置行为。

## 安全说明

- BrowserWindow 设置了 `sandbox: false`。本地文件访问已落地（漫画库），但全部走 main 进程 + preload IPC，renderer 不直接用 Node API；后续实现 Send to Kindle 嵌入或凭据存储前需重新评估。
- `comic://` 协议服务图片时做越权校验：只允许图片扩展名且路径位于当前库根目录内，否则返回 403。
- 外部链接通过 `shell.openExternal` 打开，应用窗口拒绝 new-window 导航。
