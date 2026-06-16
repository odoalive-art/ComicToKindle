# Shadcn 组件梳理与预览规范

本文是 ComicToKindle 项目中“Shadcn 组件”看板 of 开发期规范文档。为了保证后续多 Agent 接力及人工开发时，组件镜像与 Live 预览的质量一致、功能完备、视觉高端，特沉淀此标准。

---

## 一、 核心目标与原则

1. **案例百分百对齐 (100% Example Alignment)**：任何在 Shadcn 官方组件文档中展示的核心变体或典型案例（Examples），在本地镜像中**必须**拥有对应的镜像记录与 Live 预览，严禁出现“官方有此示例但本地漏写”的情况。
2. **真实组件优先 (Real Components Priority)**：凡是可以通过 Shadcn CLI 安装 of 官方组件，**必须**使用 CLI 下载并安装到项目中进行渲染（Complete Preview），禁止使用 raw HTML/CSS 静态仿真，除非该组件不是官方的标准 CLI 组件。
3. **真实交互与状态 (Interactive States)**：所有已安装组件的 Live 预览必须是有生命力的。必须使用 React hooks（如 `useState` 等）管理组件内部交互（如：下拉菜单可弹起/关闭、Dialog 弹框可交互操作、OTP 输入框支持键盘真实输入与粘贴），拒绝死板的静态样式。
4. **视觉质感高端 (Premium Aesthetics)**：
   - 使用系统预设的语义化 Tailwind/shadcn 变量（如 `bg-background`、`border-input`、`text-muted-foreground` 等），确保完美适配 dark mode。
   - 包含平滑的动画效果（如过渡 transitions、缩放 scale 等）。
   - 图片占位必须使用高清晰度、艺术感的视觉资源（如 Unsplash 优质插图），拒绝劣质灰色块。

---

## 二、 命名冲突与图标规避原则 (Name Collision & Icon Aliasing)

在引入组件与第三方图标库时，必须极力规避重名导致的渲染混乱：
1. **别名机制强制化**：当本地 UI 组件名称（如 `Calendar`、`Dialog`、`Table`）与 Lucide 等图标库中的图标发生名称冲突时，**禁止**在同一代码文件中直接混用。
2. **别名导入规范**：
   - **错误示范**：`import { Calendar } from '@/components/ui/calendar'` 与 `import { Calendar } from 'lucide-react'` 冲突，导致图标标签 `<Calendar />` 误渲染成一整个庞大的日历面板。
   - **正确示范**：图标导入必须起别名进行隔离，如 `import { Calendar as CalendarIcon } from 'lucide-react'`。并在渲染图标时使用 `<CalendarIcon className="size-4" />`。
3. **质检审查红线**：质检员必须审核所有图标调用，确保无复杂交互 UI 被误塞入微型图标框中。

---

## 三、 官方案例深度提取与审查标准 (Examples Extraction Standard)

开发与质检人员必须严格执行“官方案例深度提取”流程，避免由于“只看了主 Demo”而遗漏官方文档中的其他隐藏变体。

### 1. 案例扫描流程 (Scan Checklist)
在梳理组件时，必须访问官方文档页面（`https://ui.shadcn.com/docs/components/<slug>`）或 `shadcn-ui/ui` 仓库对应的 MDX 源码：
*   **不仅关注主 Preview**：必须向下滚动页面，扫描所有在 **Examples** 目录及其他子标题下展示的独立 `<ComponentPreview>` 块。
*   **提取以下变体类型**：
    *   **基础变体 (Basic Variants)**：如 Button 的 Default, Destructive, Outline, Secondary, Ghost, Link。
    *   **修饰变体 (Modifier Variants)**：如带图标的组件（With Icon）、带有加载动画的组件（Loading / Spinner）。
    *   **尺寸变体 (Sizes)**：展示不同宽度/高度/间距等级的组件集合。
    *   **复合逻辑变体 (Compound Layouts/Actions)**：如 Avatar Group（头像群组）、Dropdown 嵌套触发（如头像作为下拉菜单触发器）。
*   **完整登记**：上述提取到的每一个独立变体预览，都必须在 [shadcn-docs.ts](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/data/shadcn-docs.ts) 的 `mirroredShadcnDocs` 中的 `sections` 里以 `{ type: 'preview', name: '<example-slug>' }` 结构进行逐一注册，并在 [App.tsx](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/App.tsx) 中实现独立的分支渲染渲染。

### 2. 禁止的“拼盘简化”行为
*   **严禁**将官方多个截然不同的独立案例（如 `Avatar Basic`, `Avatar Group`, `Avatar Sizes`）擅自合并成一个单一预览容器展示。每个官方案例在左侧的 Examples 菜单/文档树中**必须对应独立的预览区块与复制代码块**，以方便后续开发直接复用。

---

## 四、 组件状态定义与判定

每个组件在梳理时，必须分清以下三种状态，并在 [shadcn-docs.ts](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/data/shadcn-docs.ts) 中准确标记：

| 状态 | 判定标准 | 对应的配置修改 |
| :--- | :--- | :--- |
| **索引中** | 组件存在于 `shadcnComponents` 数组。 | 仅在列表展示，无详细文档。 |
| **已镜像** | 详细文档内容已导入，且配置 `mirrored: true`。 | 必须完整补充 `sections`，且对齐官方所有的主要案例。 |
| **已安装** | 在 `src/renderer/src/components/ui/` 下有该 `.tsx` 文件。 | 将 slug 写入 `installedShadcnComponentSlugs`。 |

---

## 五、 数据结构规范 (Metadata Schema)

在 `mirroredShadcnDocs` 中添加组件数据时，必须保证包含以下核心 sections：

### 1. 结构大纲
*   **Preview**：默认展示示例（如 `<Component>-demo`）。
*   **Installation**：包含 CLI 命令（`npx shadcn@latest add <slug>`）及可能的手动安装步骤（Steps）。
*   **Usage**：标准导入语句 and 最基础 of TSX 调用示例（Fenced Code Block）。
*   **Examples**（关键）：列出官方文档中具有代表性的其他变体，每个变体作为一个 `preview` block 注册（例如：`badge-secondary`）。
*   **API Reference**：属性表格或直通官方 Radix API 的外链（Link Block）。

### 2. 双语翻译守则
*   组件文档说明（`description`）及步骤（`steps`）提供中英双语，使用 `translated(en, zh)`。
*   **严禁翻译**：代码、命令、API、props 字段、className、包名、路径、组件名和示例名。
*   复制按钮点击时，仅能复制英文源值，防止中文乱码 and 编译错误。

---

## 六、 预览完成度标准 (Preview Quality Standards)

在 [App.tsx](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/App.tsx) 中编写 Live 预览时，需根据组件的安装状态，按以下三个级别进行高保真呈现：

```mermaid
graph TD
    A[确定组件状态] -->|已安装| B[完整功能预览 Complete Preview]
    A -->|未安装| C[近似高保真预览 Approximate Preview]
    A -->|未镜像| D[占位预览 Fallback Preview]
    
    B --> B1[导入本地 UI 组件, 采用 React Hooks 实现完全动态的交互 and 状态变更]
    C --> C1[使用 Tailwind v4 结合已装组件如 Dialog 深度仿真, 保证动效 and 布局质感]
    D --> D1[展示统一的"预览未本地实现"虚线框卡片]
```

### 1. 完整功能预览 (Complete Preview)
*   **适用范围**：已安装的组件（如 `Button`、`Accordion`、`Calendar`、`DropdownMenu`、`InputOTP` 等）。
*   **质量要求**：
    *   直接引用 `@/components/ui/<component>` 真实组件。
    *   必须使用 React 状态（`useState` 等）使交互 100% 可动（例如：下拉菜单能弹出点击，手风琴能折叠并伴随动画）。
    *   键盘及焦点交互正常，不应阻断系统默认快捷键。

### 2. 近似高保真预览 (Approximate Preview)
*   *仅用于官方提供但本地尚未安装的底层/非主流组件，或非官方 CLI 导出的复合布局模式*。
*   **质量要求**：
    *   通过标准 Tailwind v4 等效还原其布局、边框及配色，从视觉上做到和真实组件 100% 相同。
    *   如需弹出框或气泡，优先使用已安装的 `Dialog` / `Popover` 微调样式进行模拟，保证点击弹出效果。
    *   如需背景图，使用 Unsplash 高质量高对比度图片链接（宽度保持 `800px` 内），拒绝简陋死板的灰色块。

### 3. 占位预览 (Fallback Preview)
*   *仅用于未镜像的组件*。由 `ShadcnComponentPreview` 统一使用带虚线边框的 fallback 卡片兜底，严禁在已镜像组件中留白或出现损坏图块。

---

## 七、 质检员标准与验证流程 (QA Verification Protocol)

质检员（或质检 Agent）必须遵循以下协议对执行结果进行判定，不达标的提交一律拦截：

1.  **官方案例完整性比对 (Examples Check)**：
    *   质检员需通过搜索引擎、本地文档缓存或网络请求抓取对应组件的官方 MDX 文档或页面。
    *   **比对列表**：逐项检查官方 Examples 下的每个 heading/ComponentPreview，与本地 [shadcn-docs.ts](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/data/shadcn-docs.ts) 中注册的 `sections` 列表是否在数量和 Slug 命名上 100% 一致。
    *   **多预览分支检查**：检查 [App.tsx](file:///Users/linweiqiang/Library/Mobile%20Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle/src/renderer/src/App.tsx) 中是否有针对上述每一个案例 Slug 的条件渲染（分支代码），严禁出现配置了Examples 但预览回退到 default 兜底或报错的情况。
2.  **双语校验**：
    *   验证切换顶栏的“中文/EN”按钮时，文档描述和组件预览标题是否能流畅自适应。
3.  **零报错编译**：
    *   必须运行本地打包命令：
        ```bash
        npm run build
        ```
    *   构建退出状态必须为 0，且终端不能输出由于未引用变量（TS6133）或属性定义错误（TS2322）导致的警告或错误。
4.  **交互及暗色模式审查**：
    *   通过控制台主题切换（`.dark`），检查所有 Examples 预览中的文本与背景色是否符合暗色模式规范，不得出现由于硬编码颜色类导致的文字“看不见”现象。
