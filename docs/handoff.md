# 交接记录

## 快照

日期：2026-06-13

ComicToKindle 处于桌面应用基础阶段。已微调侧边栏导航，并支持 macOS 内嵌交通灯及拖拽机制。

## 已完成

- 初始化 Electron + Vite + React + TypeScript 应用。
- 安装 npm 依赖。
- 接入 Tailwind CSS 4。
- 手动配置 shadcn/ui。
- 生成基础 shadcn/ui 组件。
- 搭建侧边栏应用壳，去掉原侧边栏 Header 顶栏。
- 将侧边栏分组“工作区”重命名为“漫画库”，将其第一项“漫画库”重命名为“所有漫画”。
- 将“设计组件”重命名为“Shadcn 组件”。
- 在侧边栏新增“应用组件”菜单，直接复用 `DesignComponentsView` 的两栏文档预览布局，仅列出当前项目已正式安装并使用的 15 个基础 UI 组件。
- 配置 macOS 无标题栏内嵌交通灯样式（`titleBarStyle: 'hiddenInset'`），在侧边栏顶部和主头部设置了安全高度并支持窗口拖动（`-webkit-app-region: drag`），同时屏蔽了各交互子元素的拖动。
- 修复了 `accordion.tsx` 中由于 Radix 联合类型报错导致的既有 TS 类型错误，使应用构建完全通畅。
- 验证 `npm run build` 通过。

## 重要上下文

仓库应保持在本地非同步盘路径：

```txt
/Users/linweiqiang/Desktop/ComicToKindle
```

旧 iCloud Drive 路径下曾出现 Node toolchain binary 卡住问题，不要把项目移回同步盘后继续开发。

`设计组件` 和 `基础规范` 都是开发期提效页面，便于搭建 UI 时选择组件和 token。它们不是终端用户产品功能。

真实产品能力仍未实现：本地扫描、元数据存储、转换流水线、图像处理、EPUB 生成、Kindle 投递和任务队列都还只是规划边界。

Codex、Claude Code、Antigravity 接力开发前应先读 `docs/agent-collaboration.md`，并按其中的中文优先、验证、文档同步和交接格式收尾。

中英切换只影响阅读语言。代码、命令、API、prop、className、路径、组件名、示例名和复制值保持英文源值。

## 下一步建议

1. 为导入、转换、投递和任务队列定义真实工作流。
2. 设计本地数据模型，再实现漫画扫描。
3. 明确转换流程由 Electron main、worker 还是独立服务模块执行。
4. 将 `设计组件` 镜像能力抽成可复用模块，便于未来新应用复用。
5. 在实现任何本地文件访问或凭据相关能力前，重新评估 Electron sandbox 和 IPC 边界。

## 验证命令

```bash
npm run typecheck
npm run build
npm run dev
```
