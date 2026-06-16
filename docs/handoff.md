# 交接记录

## 快照

日期：2026-06-16

ComicToKindle 处于桌面应用基础阶段。已完成自定义交通灯窗口控件、侧边栏高度统一、收起状态切换按钮迁移、侧边栏左右间距修复、交通灯 icon 悬浮作用域修复，以及移除内容区 GitHub 链接。

## 已完成

- 初始化 Electron + Vite + React + TypeScript 应用。
- 安装 npm 依赖。
- 接入 Tailwind CSS 4。
- 手动配置 shadcn/ui。
- 生成基础 shadcn/ui 组件。
- 搭建侧边栏应用壳，去掉原侧边栏 Header 顶栏。
- 将侧边栏分组"工作区"重命名为"漫画库"，将其第一项"漫画库"重命名为"所有漫画"。
- 将"设计组件"重命名为"Shadcn 组件"。
- 在侧边栏新增"应用组件"菜单，直接复用 `DesignComponentsView` 的两栏文档预览布局，仅列出当前项目已正式安装并使用的 15 个基础 UI 组件。
- 修复了 `accordion.tsx` 中由于 Radix 联合类型报错导致的既有 TS 类型错误，使应用构建完全通畅。
- 完成了以 A 开头的 Shadcn 组件文档镜像补全及高保真模拟预览（Alert, Alert Dialog, Aspect Ratio, Avatar）。
- 完成了以 B 开头的 Shadcn 组件文档镜像补全及高保真模拟预览（Badge, Breadcrumb, Button Group）。
- 使用本地 CLI 在项目里实际安装了 10 个 C & D 组组件，并在 package.json 中自动集成了 Recharts、React-Day-Picker、Embla Carousel 等相关重依赖。
- 完成了以 C 和 D 开头的 14 个 Shadcn 官方组件的完整双语文档镜像及高保真/完整功能交互预览（Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Direction, Drawer, Dropdown Menu）。
- 完成了以 E 到 I 开头的 7 个 Shadcn 官方组件文档镜像补全及本地预览实现（Empty, Field, Hover Card, Input, Input Group, Input OTP, Item）。
- 实现自定义窗口交通灯（`traffic-lights.tsx`）并通过 IPC 接管关闭/最小化/最大化；`titleBarStyle: 'hiddenInset'` 保留，系统交通灯被自定义实现替代。
- 侧边栏和内容区顶栏高度统一为 `h-12`；侧边栏收起时将切换按钮移至左上角。
- 修复侧边栏 icon 模式下左右间距不对称问题（移除 `SidebarInset` 的 `peer-data-[state=collapsed]:ml-2`）。
- 修复交通灯 icon 悬浮触发范围（改用命名 `group/tl`，作用域精确到交通灯整体区域）。
- 验证 `npm run build` 通过。

## 重要上下文

当前仓库路径：

```txt
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

该仓库于 2026-06-15 按用户要求迁回 iCloud Drive 同步目录。已知风险：2026-06-11 曾在同步盘路径下遇到 Node toolchain binary 卡住；如果再次复现，优先迁回本地非同步目录后再继续开发。

`设计组件` 和 `基础规范` 都是开发期提效页面，不是终端用户产品功能。

真实产品能力仍未实现：本地扫描、元数据存储、转换流水线、图像处理、EPUB 生成、Kindle 投递和任务队列。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`。

## 下一步建议

1. 为导入、转换、投递和任务队列定义真实工作流。
2. 设计本地数据模型，再实现漫画扫描。
3. 明确转换流程由 Electron main、worker 还是独立服务模块执行。
4. 在实现任何本地文件访问或凭据相关能力前，重新评估 Electron sandbox 和 IPC 边界。

## 验证命令

```bash
npm run typecheck
npm run build
npm run dev
```
