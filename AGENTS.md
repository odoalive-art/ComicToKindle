# Agent 说明

## 项目状态

ComicToKindle 是一个桌面应用项目，用于本地漫画库管理、Kindle 转换流程和投递工具。核心闭环已打通：应用壳、卷册阅读器、卷册（图片目录 + CBZ/ZIP/CBR/RAR/7z 压缩包，含加密 zip 与多卷分卷；PDF 单文件；图片型 EPUB）转 Kindle 固定版式 EPUB（sharp + archiver，书名「漫画名+卷册」+ 作者元数据 + 转换确认弹窗）、转换队列持久化（`userData/queue.json`，关窗即退；重启后未完成任务标为 interrupted 等用户确认继续 + 孤儿 tmp 清扫）、产物归档、投递到 Kindle（SMTP 邮件 nodemailer + safeStorage 加密凭据 / Send to Kindle 网页通道 ≤200MB 二选一）。漫画库已改为 Eagle 式 App 独占 `.ctklib` 托管库包（`library.json` + `books/<bookId>/book.json` + `source.*`/`images/`）：支持新建/打开库包、扫描导入源、复制卷册入库、导入预览、导入时选择散卷/已有部/新建部、外部拖放文件或文件夹导入、散卷展示、部 CRUD、多级分组下钻、卷册归属、卷册显示名、部名/作者编辑、右键上移/下移排序、导入后删除源选项、卷册软删除到库内 `trash/`、库内回收站列表/还原/清空；阅读/转换复用现有桶路径取图。尚未实现：元数据索引、纯文本/重排 EPUB、图像放大、转换后自动投递。数据层与压缩包/文档来源/转换/队列持久化/投递/网页推送层（comic:// 协议含封面缩略图、7zip-bin 解压、PDF.js 渲染、IPC、数据模型、存储键、产物清单、凭据安全、CDP 自动填文件）详见 `docs/architecture.md`。

当前仓库路径：

```txt
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

当前仓库位于 iCloud Drive 同步目录，这是 2026-06-15 按用户要求手动迁回的结果。已知风险仍然存在：2026-06-11 曾在同步盘路径下遇到 `esbuild` 和 `.bin` shim 卡住；如果再次复现，优先把仓库迁回本地非同步目录后再继续开发。

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

已生成组件以 `src/renderer/src/components/ui/` 目录实际文件为准（当前约 55 个，含部分自定义如 `traffic-lights`）；完整清单见记忆 `project-ui-system`。

`src/renderer/src/hooks/use-mobile.ts` 和 `src/renderer/src/lib/utils.ts` 属于 shadcn setup 的一部分。

## Renderer 工作区

`src/renderer/src/App.tsx` 当前提供侧边栏应用壳，包含这些工作区入口：

```txt
漫画库（所有漫画）
扩展功能
归档
设备与邮箱
转换设置
网页推送
设计组件
基础规范
```

`漫画库` 是真实功能，采用桌面书架式交互（对标 Eagle）：内容区通过 `library:scan/listVolumes` 的 manifest 投影渲染部（folder）与散卷（book），支持多级分组下钻、面包屑、双击进入/打开、单击选中整卡、右键整理、卷册框选/多选和空白取消；顶层「所有漫画」框选只纳入卷册卡，部文件夹仍保持单选，避免批量转换/移动误作用到部。可读卷册除图片文件夹外，也支持 CBZ/ZIP/CBR/RAR/7z 压缩包（含加密 zip 与分卷，共享密码池，解压进度）、PDF 单文件和图片型 EPUB；阅读/转换前经 `window.api.archive.prepare/unlock` 统一准备成页面缓存（PDF 渲染、EPUB 抽图、压缩包解出）。导入入口包括顶栏按钮和库内容区外部拖放，都会进入同一个扫描/预览弹窗；预览中可选择落到散卷、已有顶层部或新建部。部名/作者、卷册显示名、分组归属和排序均写入 `.ctklib` 的 manifest / book manifest，不改用户原始文件；右键整理走 `library:renameBook/renameSeries/deleteSeries/reorderSeries/reorderBooks/trashBooks` 等托管库 IPC，删除卷册进入库内 `trash/` 并可在回收站还原或清空。文件访问全部走 main 进程 + preload（`window.api.library/archive/convert/artifacts/deliver/webpush.*`），拖放路径通过 Electron `webUtils.getPathForFile(file)` 由 preload 暴露；数据层细节见 `docs/architecture.md`。`归档`（产物管理 + 投递）、`设备与邮箱`（SMTP 配置）、`转换设置`、`网页推送`（Send to Kindle 网页通道着陆/设置页，对应 `src/main/webpush.ts`）均已是真实 UI，挂在侧边栏「Kindle 推送」组（注意：侧边栏渲染用 `sidebarGroups` 而非 `primaryNav`）。`扩展功能`（extensions，icon Puzzle）是 waifu2x 等扩展能力的入口壳，暂无内容，以 `PageEmpty` 空状态组件呈现。`设计组件 / 基础规范` 是开发期工具页，**仅 dev 构建可见**（侧栏 `groupDevMode` 与视图都按 `import.meta.env.DEV` 门控），视图代码在 `src/renderer/src/dev/Showcase.tsx`（经 `React.lazy` 加载，生产包不打包，连同 recharts 等重依赖一并剔除）。已移除的导航占位：`导入收件箱`、`投递记录`、`添加资源库`；`转换队列` 功能已并入转换活动浮窗，不再有独立导航项。

顶栏有应用级深浅模式切换按钮，会在 `document.documentElement` 上切换 `.dark` class，并把选择保存到 `localStorage` 的 `comic-to-kindle-theme`。

顶栏也有中英切换按钮，会更新 `document.documentElement.lang`，并把选择保存到 `localStorage` 的 `comic-to-kindle-language`。应用壳、开发期页面和 shadcn 镜像文档会跟随切换；代码、命令、API、组件名、示例名和复制值保持英文源值。

**桌面化交互约定（这是应用不是网页）**：全局 `user-select: none`（输入类控件例外；个别需选中处用 Tailwind `select-text` 放开），网页式快捷键（刷新/缩放/打印）已在主进程 `before-input-event` 拦掉——不要重新放开或新增依赖浏览器默认行为的交互。`Cmd/Ctrl+R` 已复用为「重命名选中项」（主进程转发 `app:rename-selected` IPC，渲染层按单选项映射：卷→重命名弹窗、部→编辑信息），`Delete/Backspace` 删除选中卷/部。空状态统一用可配置的 `PageEmpty`；「列一批东西 + 批量操作」的弹窗（导入卷册、库内回收站等）复用 `components/EntityListDialog.tsx`，不要再各写一套。左右布局组件必须防横向溢出：外层和文本区用 `min-w-0`，长标题/路径/说明用截断或折行，右侧按钮/菜单等交互入口保持 `shrink-0` 或独立操作区，不给操作区设置会裁剪按钮文案的固定窄宽/`max-width`；优先压缩信息文本而不是挤走或裁掉操作入口。顶栏与右键菜单里的 Lucide 图标线宽统一用 `strokeWidth={1.75}`，顶栏工具图标优先用 `text-muted-foreground` 弱化到说明文案同级。

`设计组件` 是开发期 shadcn/ui 组件本地镜像和选型入口。源数据位于：

```txt
src/renderer/src/data/shadcn-docs.ts
```

该镜像当前跟踪 shadcn Radix docs 路径，已完成 A 到 I 范围内组件的本地文档镜像补全，并覆盖 Accordion、Button、Dialog、Sidebar、Table 等早期重点组件以及 Empty、Field、Hover Card、Input、Input Group、Input OTP、Item 等新增条目。本地镜像文档支持中文阅读和英文原文切换，数据结构会保留英文官方文本。

梳理 shadcn 设计组件时，完整规则见 `docs/agent-collaboration.md` 的 `shadcn 设计组件梳理规则`。核心原则是：官方文档路径、source ref 和 license 要可追溯；`索引中`、`已镜像`、`已安装` 三种状态必须分清；预览尽量贴近官方，但不要为了单个示例引入重依赖；中文翻译只用于阅读，复制内容保持英文源值。

`基础规范` 是开发期设计参考页，覆盖当前 renderer UI 系统中的颜色 token、字体栈、字号层级和间距层级。它不应被当作终端用户功能。

基础规范页的数据源位于：

```txt
src/renderer/src/data/design-tokens.ts
```

颜色主题的真实运行时 token 仍以 `src/renderer/src/assets/main.css` 中的 CSS variables 和 `@theme inline` 为准；`design-tokens.ts` 用于集中记录和渲染规范数据，不替代 Tailwind/shadcn 的语义类使用方式。

## 当前产品边界

已实现：Eagle 式 `.ctklib` 托管库包（`library.json` + `books/<bookId>/book.json` + `source.*`/`images/`）+ manifest 投影书架网格（部/散卷、多级下钻、面包屑、排序、分组、部名/作者和卷册显示名编辑）+ 导入即复制成桶并可选删除源 + 导入目标选择（散卷/已有部/新建部）+ 外部拖放导入 + 库内 `trash/` 软删除/还原/清空 + 封面缩略图缓存 `userData/thumbs/`、卷册阅读器、库包路径持久化（`userData/settings.json`）、压缩包来源（`src/main/archive.ts`，7zip-bin 解 CBZ/ZIP/CBR/RAR/7z + 加密 zip + 多卷分卷到 `userData/extracted/`，safeStorage 加密的共享密码池，解压进度）、文档来源（`src/main/document.ts`，PDF.js + `@napi-rs/canvas` 渲染 PDF，图片型 EPUB 抽取页面到 `userData/documents/`）、卷册转 Kindle 固定版式 EPUB（`src/main/convert.ts`，书名「漫画名+卷册」+ 作者）、产物清单与归档（`src/main/artifacts.ts`，`userData/artifacts.json` + `userData/converted/`）、**转换队列持久化**（`src/main/queue.ts`，`userData/queue.json`；关窗即退出应用使「关窗==重启」成立；重启后未完成任务（queued/converting）标为 `'interrupted'`、不自动跑，由启动 toast +活动浮窗角标提示用户「继续/不继续」，继续=整卷从 0 重跑；孤儿 `tmp_*` 清扫；options 入队时冻结）、SMTP 投递（`src/main/deliver.ts`，凭据 safeStorage 加密）、Send to Kindle 网页推送（`src/main/webpush.ts`，内嵌网页 + CDP 自动填文件，≤200MB）、App 层转换队列调度（`useConvertActivity` hook）。

应用尚未实现：

- 漫画元数据存储 / 索引（当前书架由 `.ctklib` manifest 实时投影，无数据库）
- 纯文本/重排 EPUB 解析（当前只支持图片型 EPUB）
- 图像增强或 AI 放大
- 转换后自动投递

除非代码已经实现，否则不要把这些写成现有功能。

## 开发备注

- 添加产品工作流时，保持 `docs/` 同步更新。
- 保持 README 中的安装和验证命令与 `package.json` 同步。
- **`package.json` 的 `dependencies` 只放 main/preload 进程运行时真正需要的包**（当前：`sharp` / `7zip-bin` / `archiver` / `nodemailer` / `pdfjs-dist` / `@napi-rs/canvas` / `fast-xml-parser` / `@electron-toolkit{,/preload}`）；新增 UI/渲染层库一律装到 `devDependencies`，否则会被外部化进 `app.asar` 使打包体积暴涨（详见 `docs/architecture.md` 「打包」）。
- 除非仓库重新移回同步目录，否则不要新增 iCloud 特定工具链 workaround。
- 优先使用 shadcn/ui 组件和本地既有模式，不要随意新增自定义 primitive。
- 未经用户明确授权，绝不擅自执行 `git commit` 或 `git push` 提交及推送操作，必须先询问用户并获得确认。
- 多 agent 接力时遵守 `docs/agent-collaboration.md`，结束阶段前更新必要文档和交接记录。
