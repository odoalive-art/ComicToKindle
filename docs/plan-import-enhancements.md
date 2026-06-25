# 工单：导入增强（目标部选择 + 外部拖拽导入）

> 状态：**待开工**（规格已定，待实现）。体例同 `docs/plan-eagle-library.md`。
> 分支建议：`feat/import-enhancements`（自 `main` 或合并 PR #2 后开）。语言：中文优先。
> 拍板日期：2026-06-25。

## 背景

当前导入只有一条路径：顶栏「导入卷册」按钮 → 原生文件选择框 → 扫描候选 → 预览弹窗（`EntityListDialog`，含跳过数 + 「导入后删源」勾选）→ 复制成桶，**全部进「散卷（ungrouped）」**。

两个体验缺口：

1. 导入完只能落到散卷，想归到某个部还得再手动多选 → 移入部，多一步。
2. 没有外部拖拽：必须点按钮走文件框，不能从 Finder/桌面直接拖文件夹/压缩包进来。

本工单解决这两点。**两者共用同一套扫描 → 预览 → 导入管线**，只是入口与落点不同。

---

## 功能 A：导入时选目标部 / 新建部

### 已拍板的设计决策
- **粒度：统一选一个目标**——本次导入的所有候选卷册落到同一个目标（不做逐卷可选）。
- 目标三选一：**散卷（默认，保持现状）** / 某个已有部 / 新建部。

### 交互
- 在导入预览弹窗（`EntityListDialog`，App.tsx 约 3131；状态 `importReq`）里加一个「目标」选择控件：
  - 一个下拉/选择器：选项 = `散卷` + 顶层各「部」列表 + `＋ 新建部…`。
  - 选「新建部」时，就地展开一个部名输入框（作者可留空，复用 `seriesMeta` 的命名习惯；首版可只要部名）。
  - 默认选中「散卷」，不破坏现有默认行为。
- 确认导入时把目标一并带上。

### 技术方案（推荐：后置组合，main 零改动）
`importBooks` 现在 `manifest.ungrouped.push(id)`。**不改 main**，在 `confirmImport`（App.tsx 约 2199）里后置组合现有 IPC：
1. `const ids = await window.api.library.importBooks(candidates, { deleteSourceAfter })`（仍先入散卷）。
2. 按目标分支：
   - 散卷：什么都不做。
   - 已有部：`await window.api.library.assignBooks(ids, targetSeriesId)`。
   - 新建部：`await window.api.library.createSeries(newTitle, null, ids)`（`createSeries(title, author, bookIds)` 已支持直接带 bookIds）。
3. 然后照常 `loadSeries(root)`。

> 备选方案（更原子但要改 main）：给 `ImportOptions` 加 `targetSeriesId?: string|null`，`runImport` 直接 push 到对应 series 节点而非 ungrouped；新建部仍由 renderer 先 `createSeries(title,null,[])` 拿 id。**首版用后置组合即可**，除非实测发现「先入散卷再移」会让书架闪一下中间态——若闪，再升级为原子方案。

### 验收（功能 A）
- [ ] 导入弹窗能选「散卷 / 已有部 / 新建部」，默认散卷。
- [ ] 选已有部：导入后这些卷册出现在该部下，散卷区没有残留。
- [ ] 选新建部：导入后新部存在且含这些卷册，部名 = 输入值。
- [ ] 选散卷：行为与现状一致。
- [ ] 目标部选择对「导入后删源」「字节级进度条」无影响（仍各自正常）。
- [ ] 用 `stat` 确认：归属只改 manifest，桶内 `images/`、`source.*` 内容 mtime 不变，bookId 桶路径稳定。

---

## 功能 B：外部拖拽导入

### 设计决策（推荐，待质检时确认）
- **拖放区域：整个库内容区**（网格 + 空状态都接收）。Eagle 式整窗体验；首版不做侧栏树投放（托管库无文件夹树）。
- 拖进来后**复用现有扫描 → 预览弹窗**，即和按钮导入走同一条路（自然继承目标部选择 + 删源勾选）。

### 关键技术坑点 ⚠️
- **Electron 已移除 `File.path`**。renderer 的 `drop` 事件拿到的 `File` 对象**没有** `.path`。必须用 **`webUtils.getPathForFile(file)`** 取真实磁盘路径：
  - 在 `src/preload/index.ts` 暴露：`getPathForFile: (file: File) => webUtils.getPathForFile(file)`（从 `electron` 导入 `webUtils`）。
  - 这是本功能最容易踩的点，务必先验证能拿到路径再往下做。
- `dragover` 必须 `preventDefault()`，否则 `drop` 不触发。

### 技术方案
1. **preload**：新增 `getPathForFile(file)`（见上），写进 `index.d.ts`。
2. **main**：扩展 `library:scanImport` 接受 `string | string[]`——数组时按现有 dialog 分支的合并逻辑（library.ts 约 1425-1431）循环 `scanImportSource` 并合并 `candidates/skipped`。当前签名只接受单个 `srcRoot`。
3. **renderer**：
   - 给库内容区容器加 `onDragOver`（preventDefault + 显示拖拽高亮遮罩）、`onDragLeave`、`onDrop`。
   - `onDrop`：`[...e.dataTransfer.files].map(f => window.api.library.getPathForFile(f))` 收集路径 → `await window.api.library.scanImport(paths)` → `setImportReq({ scan, ... })` 打开既有预览弹窗。
   - 拖拽视觉：拖入时整块加虚线边框 + 半透明遮罩 + 文案「拖放到此处导入」。
4. **冲突检查**：文件视图已移除，库网格当前**无**内部卡片拖拽移动，故外部拖拽与内部拖拽无冲突（实现时再 grep 确认无残留 draggable）。

### 验收（功能 B）
- [ ] 从 Finder 拖一个图片文件夹进库内容区 → 弹出预览弹窗，候选正确。
- [ ] 拖压缩包 / PDF / 图片型 EPUB → 同样识别为候选。
- [ ] 一次拖**多个**文件/文件夹 → 候选合并、跳过项合并正确。
- [ ] 拖入非漫画杂物 → 计入「跳过」，不报错、不入库。
- [ ] 拖拽时有清晰的视觉反馈（高亮/遮罩/文案）；松手后反馈消失。
- [ ] 拖拽导入与按钮导入落到同一个预览弹窗，目标部选择 + 删源勾选都可用。
- [ ] `webUtils.getPathForFile` 在打包后的 dmg 里也能拿到路径（不只 dev）。

---

## 共同约束
- 不恢复本地文件夹整理 / 文件视图 / 拖拽移动**用户文件**的旧方向；整理只写 manifest。
- 导入仍走托管库桶模型，源文件除非显式勾「导入后删源」否则不动。
- 库默认不落在 iCloud/CloudDocs 路径。

## 回头质检清单（计划作者复查用）
- [ ] 功能 A、B 各自「验收」项全过。
- [ ] `npm run typecheck` + `npm run build` 通过。
- [ ] 新增/改动若涉及 main/preload（B 必然涉及），交付时提醒**完全重启 `npm run dev`** 再测（见记忆 feedback-restart-dev-on-ipc）。
- [ ] 真机 /verify：A 三种目标 + B 单/多路径拖拽，各跑一遍。
- [ ] 文档同步：`docs/roadmap.md`、`docs/release-notes.md`、`docs/handoff.md`、`AGENTS.md` 更新；本工单标记完成。
- [ ] 记忆 `project-status.md` backlog 勾销对应项。
