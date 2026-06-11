# 交接记录

## 快照

日期：2026-06-11

ComicToKindle 处于桌面应用基础阶段。技术底座已能运行和构建，renderer 已从默认占位屏变成侧边栏工作台。

## 已完成

- 初始化 Electron + Vite + React + TypeScript 应用。
- 安装 npm 依赖。
- 接入 Tailwind CSS 4。
- 手动配置 shadcn/ui。
- 生成基础 shadcn/ui 组件：
  - accordion
  - button
  - card
  - dialog
  - input
  - progress
  - scroll-area
  - separator
  - sheet
  - sidebar
  - skeleton
  - sonner
  - table
  - tabs
  - tooltip
- 配置 alias：
  - `@/*`
  - `@renderer/*`
- 搭建侧边栏应用壳。
- 新增漫画库占位工作区，使用静态示例数据展示未来库视图。
- 新增应用级深浅模式切换，影响整个 renderer 并持久化用户选择。
- 新增顶栏中英切换，影响应用壳、开发期页面和 shadcn 镜像文档阅读语言，并持久化用户选择。
- 新增开发期 `设计组件` 工作区：
  - 包含 shadcn/ui 组件索引。
  - 本地镜像 Accordion、Button、Dialog、Sidebar、Table 文档。
  - Accordion、Button、Sidebar 示例已贴近官方 Radix 页面。
  - Accordion、Button、Dialog、Sidebar、Table 文档支持中文阅读和英文原文切换。
  - 示例复制按钮复制英文示例名，不复制中文标题。
- 新增开发期 `基础规范` 工作区：
  - 颜色 token
  - 字体栈
  - 字号层级
  - 间距层级
- 新增 `src/renderer/src/data/design-tokens.ts`，让基础规范页读取统一的项目级规范数据源。
- 新增 `docs/agent-collaboration.md`，用于 Codex、Claude Code、Antigravity 接力开发时统一协作规则。
- 明确多 Agent 协作时中文优先，包含用户回复、项目文档、UI 文案、交接记录和 commit message。
- 补充 shadcn 设计组件梳理规则，明确官方来源、状态定义、字段要求、预览完成度和迁移流程。
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
