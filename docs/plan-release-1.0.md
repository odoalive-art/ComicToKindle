# CTK 1.0 正式发布 · 多线并行实施计划

本文是 ComicToKindle 从内测（`0.1.0-beta.2`）走向 **开源社区正式发布（1.0）** 的实施计划与多 agent 任务分派单。供 Claude Code、Codex、Antigravity(Gemini) 接力时按线领取任务。

协作总规则见 `docs/agent-collaboration.md`；本文件只补充本轮的「发布策略定案 + 分线任务卡 + 合并质检关」。

## 发布策略定案（2026-06-27）

- **渠道**：仅 GitHub Releases，开源社区发布，**不上架 App Store**。
- **签名/更新**：走 **自签证书（self-signed，免费）+ electron-updater/Squirrel.Mac 自动更新**。
  - 自签证书可满足 Squirrel.Mac「新旧版本同一签名身份」校验，**「点更新→重启→完成」能跑通,零成本**。
  - 代价：首次安装每台机器一次性 Gatekeeper 警告（用户「仍要打开」放行一次，之后经 app 内更新替换的新版不再弹）。
- **Developer ID 公证**：列为 **可选后续项**。买 Apple 开发者账号($99/年)后叠加公证即可去掉首次警告，**更新代码无需改动**。本轮不阻塞发布。
- **语言**：**中英双语**，面向更广受众。

## 阶段划分

- **P0.0 基线前置（串行，先做）**：把 `feat/convert-workbench` 真机 `npm run dev` 实跑验证并合入 `main`，给所有线一个干净基座。负责：Claude。
- **Phase 1（三线并行）**：发布管线 / 转换稳定性 / 引导与投递向导。
- **Phase 2（Phase 1 合并后）**：全局视觉与交互一致性扫一遍 + 发布站点 + changelog/roadmap 渲染。放最后做，避免改一遍返工。

## 分支与归属

| 线 | 分支 | 负责 agent | **独占文件范围（硬边界）** |
|---|---|---|---|
| **A · 发布管线** | `feat/release-pipeline` | Claude | `electron-builder.yml`、`scripts/**`、`.github/**`、`package.json`、`src/main/index.ts`(仅更新检查接线) |
| **B · 转换稳定性 + 自动投递** | `feat/convert-stability` | Codex | `src/main/{convert,document,archive,artifacts,deliver,queue,webpush}.ts` |
| **C · 引导与投递向导** | `feat/onboarding-delivery` | Gemini | 新建 `src/renderer/src/onboarding/**`、`src/renderer/src/delivery-wizard/**`；`App.tsx`(仅挂载点) |

三条分支从**同一个 base commit**（P0.0 落定的 convert-workbench tip + 本计划）切出，base 在 Phase 1 期间**冻结**。

## 分支协作铁律（防冲突 + 防掉链子）

1. **分支归属唯一**：一条分支只有一个 agent 写。任何人不在别人分支上提交，不回滚他人改动。
2. **文件归属是硬边界**：按上表，**不许跨界改不属于自己的文件**。确需动他人文件时**停下**，在 `docs/handoff.md` 记一条「需跨界改 X，原因 Y」，交 Claude 协调，不擅自改。
3. **`i18n.ts` 追加协议**：公共热文件。只在文件末尾自己的区块（用注释锚点 `// === lane-B convert ===` / `// === lane-C onboarding ===` 圈起）**追加**条目；**不动他人区块、不重排、不改既有 key**。Claude 合并时统一对齐去重。
4. **`package.json` 依赖协议**：只有 A 线改版本号/脚本。B/C 如需新增依赖，**不自行 `npm install`**，在 handoff 申报包名+用途，由 A 线统一加，避免 lockfile 冲突。
5. **`App.tsx` 协议**：只有 C 线碰，且**仅加挂载点 / first-run gate**，不重构既有结构、不顺手改无关行。
6. **base 冻结**：Phase 1 期间不往 base 加东西（P0.0 已含全部基线）。需要的公共改动走 Claude，合并后再统一 rebase。
7. **交接节奏**：每个 agent 每阶段结束按 `agent-collaboration.md` 交接格式更新 `docs/handoff.md`，写清**本轮动了哪些文件**、`npm run build` 是否通过。
8. **合并归 Claude**：所有分支**不自行合 main**。合并顺序 A→B→C→`i18n.ts` 对齐，每步 `npm run build` 绿了再下一步。
9. **git 红线照旧**：`commit` / `push` / `merge` 都需用户授权；不做 `reset --hard`、强推、大范围 checkout。

---

## 任务卡 A · 发布管线（Claude）

**目标**：开源社区可一键下载、能自动更新的 macOS 发布包。

1. **自签证书 + 自动更新最小验证（先做，验真再铺开）**
   - 生成/约定一张稳定自签代码签名证书；`electron-builder.yml` 的 `mac.identity` 指向它。
   - 重开自动更新所需产物：当前为 dmg-only（`mac.target: dmg`、关掉了 `latest-mac.yml`/zip/blockmap）。自动更新需要 zip target + `latest-mac.yml`。
   - 接 `electron-updater`，provider 设为 GitHub。
   - **关键验证**：签两个版本号不同的包，跑一次真实「检查到新版→下载→重启完成」，确认自签证书下 Squirrel.Mac 升级链通。不通则记录失败现象再调。
2. **应用内更新 UI 接线**：`src/main/index.ts` 接 electron-updater 事件，renderer 弹「发现新版本→更新→重启」。文案走 i18n 双语。
3. **GitHub Actions 出包流水线**：tag 触发 → 构建 + 自签 → 上传 dmg + zip + `latest-mac.yml` 到 Release。
4. **可选后续（不阻塞）**：预留 Developer ID 公证开关（`@electron/notarize`，凭据走 env/secret），账号到位后启用。
5. **文档**：更新 `docs/operator-runbook.md`（发布与自动更新流程）、`README.md`（下载与首次打开放行说明）。

**需要用户提供**：无（自签免费）。若决定上公证，再要 Apple 账号 + 证书 + 公证密码。

## 任务卡 B · 转换稳定性 + 自动投递（Codex）

**目标**：转换/来源链路在异常输入下不静默失败、有明确提示与恢复路径。

1. **大 PDF**：渲染耗时与进度反馈、超大页/特殊字体兼容、失败明确提示。
2. **异常输入**：损坏图、空卷、加密包失败路径，给可理解报错与恢复路径（不静默吞错）。
3. **EPUB 边界**：纯文本/重排 EPUB 无可用图片时给明确「不支持」提示，而非空白。
4. **转换后自动投递**（roadmap 计划项）：设置页加可选开关，转换完成后按设置自动进 SMTP 或网页推送；保留手动确认与失败重试路径。
5. **`webpush.ts` 去硬编码中文**：当前注入网页的引导/蒙层文案硬编码中文，改为走 i18n 双语（文案条目追加到 `i18n.ts` 对应区块）。

**红线**：只动 `src/main/` 内上述文件 + `i18n.ts` 追加区块；不碰 renderer 组件结构、不碰发布配置。

## 任务卡 C · 引导与投递向导（Gemini）

**目标**：陌生用户首次打开能被一步步带到「装好库→导入第一本→成功投递」。

1. **首启引导流程**（新建 `src/renderer/src/onboarding/`，自包含）：欢迎 → 建/选库包 → 导入第一本 → 投递走通；`App.tsx` 只加一个 first-run gate（读 settings 标记，surgical 改动）。
2. **投递设置向导**（新建 `src/renderer/src/delivery-wizard/`，发布成败关键）：分步引导
   - SMTP：如何获取 app-specific password（区分常见邮箱）；
   - Amazon：如何把发件邮箱加进 Kindle「已认可发件人」白名单；
   - 走通一次自检/测试发送。
3. **双语**：所有新文案中英双语，追加到 `i18n.ts` 对应区块；复用现有 shadcn/ui 组件与 `bg-background` 等语义类。

**红线**：UI 用现有 shadcn 组件，遵守 `agent-collaboration.md` 的左右布局防溢出规则；对 `App.tsx` 只加挂载点，不大改既有结构。

---

## 合并与质检（Claude）

**合并顺序**（冲突从小到大）：A（build，独立）→ B（main 独占）→ C（renderer 新文件）→ 最后做 `i18n.ts` 对齐去重。

**质检关（全过才合）**：
- `npm run typecheck` / `npm run build` / `npm run pack:doctor`
- 真机 `npm run dev` 跑通
- handoff 里那 4 项托管库交互回归
- B 线转换边界用例实测
- 自签发布包真机开箱 + 一次真实自动更新升级

**冲突避免约定**：
- 任意两条线不碰同一文件（i18n.ts 例外，按区块追加）。
- App.tsx 只有 C 线动，且仅挂载点级改动。
- 各线交接按 `agent-collaboration.md` 的交接格式写进 `docs/handoff.md`。

## Phase 2（Phase 1 合并后）

- 全局视觉/交互一致性扫一遍：空/加载/错误态统一、明暗主题、动效、图标线宽收敛。
- 发布站点 + changelog/roadmap 渲染（`docs/release-notes.md`、`docs/roadmap.md` 已是可渲染源，差个壳）。
