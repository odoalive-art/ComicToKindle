# Agent 协作规则

本文是 ComicToKindle 在 Codex、Claude Code、Antigravity 等多 agent 接力开发时的共同协作协议。目标是让不同工具看到同一套项目事实、边界和交接格式，避免重复踩坑或互相覆盖。

## 共同入口

每个 agent 开始工作前先读：

```txt
AGENTS.md
README.md
docs/architecture.md
docs/operator-runbook.md
docs/handoff.md
```

如果任务涉及 UI、设计组件或基础规范，还要读：

```txt
src/renderer/src/data/design-tokens.ts
src/renderer/src/data/shadcn-docs.ts
src/renderer/src/assets/main.css
```

## 语言原则

中文优先是本项目的默认协作规则：

- 面向用户的回复默认使用中文。
- 项目文档、交接记录、运行手册、注释说明和任务记录默认使用中文。
- UI 文案默认使用中文，除非明确是在镜像英文官方文档或保留代码/API 原文。
- commit message 优先使用简短中文；技术名词、包名、模块名可保留英文。
- 技术名词、命令、路径、包名、API 名称保持原文，不强行翻译。
- 只有用户明确要求英文或第三方接口必须英文时，才切换语言。

## 工作区与路径

当前项目路径：

```txt
/Users/linweiqiang/Library/Mobile Documents/com~apple~CloudDocs/Dev/Projects/ComicToKindle
```

当前仓库位于 iCloud Drive 同步目录，这是 2026-06-15 按用户要求手动迁回的结果。2026-06-11 曾在同步盘路径下遇到 Node toolchain binary 卡住；如果再次复现，优先把项目迁回本地非同步目录后再继续开发。

## 角色边界

所有 agent 都遵守同一套边界：

- 不把尚未实现的产品能力写成已有功能。
- 不绕过 `components.json`、`src/renderer/src/components/ui/` 和现有 shadcn/ui 模式。
- 不擅自改动 unrelated 文件或回滚他人改动。
- 不在未确认的情况下执行破坏性 git 操作，例如 `reset --hard`、强推或大范围 checkout。
- 未经用户明确授权，绝不擅自执行 `git commit` 或 `git push` 提交及推送操作，必须先询问用户并获得口头/文字确认。
- 不把开发期页面 `设计组件`、`基础规范` 描述成终端用户功能。

## 交接前检查

每个 agent 结束一个阶段前至少执行：

```bash
git status --short
npm run build
```

如果只做文档变更且未碰代码，可以说明未运行 build 的原因。涉及 renderer、shadcn、token、主题或 Electron 配置时，必须运行 `npm run build`。

文档和代码中不要留下易腐相对时间。可用：

```bash
RELATIVE_TIME_PATTERN="今""天|昨""天|刚""刚|最""近|上""周|to""day|yester""day|recent""ly"
grep -RInE "$RELATIVE_TIME_PATTERN" README.md AGENTS.md docs src 2>/dev/null
```

UI 文案里确实需要“新导入”这类状态概念时，优先用稳定标签，不写会随日期变化的词。

## 文档同步规则

代码改动后同步对应文档：

- 改运行命令、端口、安装方式：更新 `README.md` 和 `docs/operator-runbook.md`。
- 改架构、数据流、存储、IPC、主题/token：更新 `docs/architecture.md`。
- 改 agent 需要知道的项目事实、路径、红线：更新 `AGENTS.md`。
- 完成一个阶段、可交给其他 agent 继续：更新 `docs/handoff.md`。
- 新增面向外部或下游使用的流程：新增或更新 `docs/` 下的专题文档。

项目文档、交接记录和运行手册默认使用中文，除非用户明确要求其他语言。

## UI 和设计系统规则

- 优先使用 shadcn/ui 组件和现有 `src/renderer/src/components/ui/` 组件。
- 颜色主题运行时以 `src/renderer/src/assets/main.css` 的 CSS variables 和 `@theme inline` 为准。
- 基础规范页的数据源是 `src/renderer/src/data/design-tokens.ts`。
- 应用代码继续使用 Tailwind/shadcn 语义类，例如 `bg-background`、`text-muted-foreground`、`gap-4`、`p-6`。
- 不要为了严谨而把每个 Tailwind 类都改成 JS token 引用。token 数据源用于规范展示和统一语义，不替代 Tailwind utility。
- 顶栏深浅模式切换通过 `document.documentElement` 的 `.dark` class 驱动整个 renderer。

## shadcn 设计组件梳理规则

`设计组件` 是开发期提效页面，数据源位于：

```txt
src/renderer/src/data/shadcn-docs.ts
```

它的目标是做一份可离线查看、可复用到新项目的 shadcn/ui 官方组件镜像和选型手册，不是终端用户功能。

权威来源：

- 官方组件页：`https://ui.shadcn.com/docs/components`
- 官方 Radix 组件路径：`https://ui.shadcn.com/docs/components/radix/<slug>`
- 本地镜像源码参考：`shadcn-ui/ui` 仓库的 `apps/v4/content/docs/components/radix`
- 本地 source ref、license、docs root 记录在 `shadcnDocsSource`。

状态必须分清：

- `索引中`：组件存在于 `shadcnComponents`，代表本地选型列表知道这个组件。
- `已镜像`：组件存在于 `mirroredShadcnDocs`，代表官方文档内容已整理到本地。
- `已安装`：slug 存在于 `installedShadcnComponentSlugs`，且 `src/renderer/src/components/ui/` 下有对应本地组件。

梳理单个组件时，优先保留这些字段：

- `name` 和 `slug`
- 官方描述 `description`
- 官方源码路径 `sourcePath`
- 官方文档地址 `officialUrl`
- 安装命令 `installCommand`
- 手动依赖或补充依赖 `manualDependencies`
- 文档段落 `sections`

迁移流程：

1. 先确认官方 Radix 文档路径和 `shadcnDocsSource.ref`。
2. 按官方页面结构整理 `Preview`、`Installation`、`Usage`、`Examples`、`RTL`、`API Reference` 等段落。
3. 把官方 `ComponentPreview` 映射成本地可运行预览；能直接用现有 shadcn 组件就直接用。
4. 官方文案尽量贴近原意；命令、API、路径和包名保持原文。
5. 只有真实安装了本地组件时，才更新 `installedShadcnComponentSlugs`。
6. 涉及 renderer、组件、token 或主题时，最后运行 `npm run build`。

预览完成度分三级记录和判断：

- `完整预览`：本地依赖齐全，交互和视觉尽量贴近官方示例。
- `近似预览`：用现有组件或轻量替代实现主要视觉和状态。
- `占位预览`：暂未镜像或依赖过重时保留明确占位，不伪装成完整实现。

双语规则：

- 组件文档可以提供中文阅读版本，但英文官方原文必须保留在数据结构中。
- 代码、命令、API、prop、className、包名、路径、组件名和示例名不翻译。
- 复制按钮复制英文源值，例如 `button-with-icon`，不要复制中文标题。
- 中文翻译采用开发者可读表达，优先准确和清晰，不做逐字硬译。

新增预览依赖时要克制：不要为了单个示例引入重依赖；如果依赖会影响包体、构建或运行边界，先征求用户确认。

组件梳理优先级：

1. 已安装且当前界面会高频使用的组件。
2. 表单、布局、导航、反馈类基础组件。
3. 复杂组合组件和需要额外依赖的组件。
4. 低频展示类组件。

## Git 规则

推荐节奏：

```bash
git status --short
npm run build
git add <本次相关文件>
git commit -m "<简短动词短语>"
```

提交信息优先使用简短中文，例如：

```txt
新增设计工作区和 token
更新协作规则
实现漫画导入壳
```

不要把未审查的大块生成产物、缓存、`out/`、`.npm-cache` 作为功能提交的一部分。

## 交接格式

交接给下一个 agent 时使用这个格式：

```txt
当前状态：
- ...

已完成：
- ...

未完成：
- ...

重要文件：
- ...

验证：
- npm run build 通过 / 未运行，原因是 ...

注意事项：
- ...
```

如果有未提交改动，明确列出哪些文件是本轮改动、哪些可能是用户或其他 agent 的改动。

## 冲突处理

遇到冲突时按这个顺序处理：

1. 先读 `git status --short` 和相关文件 diff。
2. 判断改动是否属于当前任务。
3. 对不属于当前任务的改动保持原样。
4. 如果同一文件内有他人改动，围绕现有内容增量修改，不整文件重写。
5. 只有在无法判断或会覆盖用户工作时，才暂停并询问用户。

## Agent 差异提示

- Codex：优先用 `rg`、`apply_patch`、`npm run build`，最终说明改动和验证结果。
- Claude Code：同样遵守本文件和 `AGENTS.md`；交接前更新 `docs/handoff.md`。
- Antigravity：如果使用图形化或多步骤编辑，结束前仍以 `git status --short`、文档同步和构建验证为准。

工具不同，但项目事实、提交边界和交接标准一致。
