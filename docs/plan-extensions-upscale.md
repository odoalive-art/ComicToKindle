# 工单：扩展功能 · AI 放大 / 高清化（阅读时增强）

> 状态：**已拍板，待实现**。体例同 `docs/plan-import-enhancements.md` / `plan-eagle-library.md`。
> 分支建议：`feat/extensions-upscale`（自 `main` 切；本期三条线同 base）。语言：中文优先，新文案中英双语。
> 拍板日期：2026-06-27。
> 协作总规则见 `docs/agent-collaboration.md`、`docs/plan-release-1.0.md` 的「分支协作铁律」。

## 范围与边界（本期只做 A）

- **只做「阅读时增强」**：放大只影响**应用内阅读**看到的画面。
- **明确不做**：不改发去 Kindle 的 EPUB、不碰转换流水线（`convert*.ts`）。「转换时把放大烤进 Kindle 产物」是后续单独一期（暂记为 **B 期**，不在本工单）。
- 引擎为本地原生二进制，离线可跑；不依赖联网/云服务。

## 背景与关键接入点

阅读器只通过一个自定义协议 `comic://?p=<绝对路径>` 加载页面（`src/main/library.ts` 的 `protocol.handle('comic')`，约 1317 行）。**所有源格式**（图片目录 / CBZ·ZIP·CBR·RAR·7z / PDF / 图片型 EPUB）在阅读时都已被规整成磁盘上的图片文件再经此协议读出。

→ 因此放大**只需挂在 `comic://` 这一个咽喉点**：对所有格式天然生效，阅读器渲染逻辑几乎不动。

已具备的有利条件：

- `src/renderer/src/App.tsx` 阅读器已有「下一页隐藏 `<img>` 预加载」（约 1024 行）。增强开启时让预加载 URL 带上 `enhance=1`，**预取即免费复用**，无需额外预取 IPC。
- 已有 utility process / worker 模式可复用：`pdf-render.ts`、`convert-host.ts`、`convert-worker.ts`、`convert-ipc.ts`。放大引擎照此跑在独立进程，不卡 main/renderer。
- 设置已有统一存储：`userData/settings.json`（`deliver.ts` / `archive.ts` 的 `readSettings/writeSettings` 模式，字段如 `delivery`、`archivePasswords`）。本期加 `upscale` 字段。
- 缓存根已有先例：`userData/extracted/<hash>`（archive.ts）、`userData/documents/`。本期加 `userData/upscaled/<key>`。
- 「扩展功能」页目前是 `PageEmpty` 占位（App.tsx 约 308，`activeView === 'extensions'`），正是为本功能预留的壳。

## 已拍板的设计决策

| 决策点 | 定案 |
|---|---|
| 引擎 | `waifu2x-ncnn-vulkan`（anime/cunet 模型），GPU 经 Vulkan/Metal 加速。Real-ESRGAN-anime 作为后续可选模型，本期不做 |
| 二进制分发 | **随包 bundle** 默认模型，开箱即用、离线可跑（代价 +几十 MB） |
| 运行位置 | 独立 utility process，复用现有进程模式 |
| 接入点 | `comic://` 协议加 `enhance=1` 分支；增强参数（模型/倍率/降噪）从 `settings.json` 读，URL 只带开关 |
| 无 GPU | 检测能力；无 GPU 时**默认不自动增强**并明确提示，可手动开（CPU 慢） |
| 依赖归属 | 二进制/模型/打包配置一律走 **A 线（发布管线）** 统一加，B/C 不自行装依赖 |

**默认参数（可在扩展页调，先给合理默认）**：模型 `cunet`、倍率 `2x`、降噪 `中（level 1）`、缓存上限 `2 GB`。

---

## 契约（三条线先对齐，便于并行）

1. **增强 URL**：`comic://?p=<path>&enhance=1`。增强参数不进 URL——handler 读 `settings.json > upscale` 的 `model/scale/denoise`，使缓存 key 与设置一致，reader 只管加不加 `enhance=1`。
2. **`settings.json > upscale`**：
   ```jsonc
   {
     "enabled": false,            // 阅读时是否默认增强
     "model": "cunet",            // 模型
     "scale": 2,                  // 1 | 2
     "denoise": 1,                // -1..3
     "cacheLimitMB": 2048
   }
   ```
3. **缓存 key**：`sha1(源图内容hash + model + scale + denoise)` → `userData/upscaled/<key>.png`。源图变了或参数变了自然 miss。
4. **IPC（B 提供，C 调用）**：
   - `upscale:getConfig` / `upscale:setConfig(partial)`
   - `upscale:status` → `{ engineReady: boolean, gpu: 'available'|'cpu-only'|'none', model: string }`
   - `upscale:clearCache` → 清 `userData/upscaled/`，返回释放字节数
   - `upscale:cacheSize` → 当前缓存占用字节
5. **能力上报**：`upscale:status.gpu` 供 C 在扩展页/开关旁提示与降级。

---

## 任务卡 A · 依赖与打包（Claude）

**目标**：让放大二进制 + 模型在 dev 和打包后的 dmg 里都能被 main 找到并执行。

1. 选定并引入 `waifu2x-ncnn-vulkan`（macOS arm64 二进制 + cunet 模型）作为依赖；二进制 + 模型放 `resources/`（或 npm 包，按体积/许可证择优）。
2. `electron-builder.yml`：把二进制/模型加入 `files` 与 `asarUnpack`（参考现有 `node_modules/7zip-bin/**`、`sharp/**` 的 unpack 写法——原生可执行/`.bin` 不能进 asar）。
3. 约定一个**资源路径解析规则**（dev 指向 `resources/`，打包指向 `process.resourcesPath` 下的 unpack 目录），写进文档交 B 在 main 里用；A 只负责「放得对、解得出」，不写调用逻辑。
4. `scripts/pack-doctor.mjs`：加防回归检查——二进制存在、可执行位、模型文件齐全。
5. 体积/许可证记录：在 `docs/operator-runbook.md` 记一笔随包体积增量与 waifu2x 许可证（MIT/相应模型许可）。

**红线**：只动 `electron-builder.yml`、`scripts/**`、`package.json`(依赖)、`resources/**`、相关文档。不写 main/renderer 业务逻辑。

## 任务卡 B · main 放大引擎（Codex）

**目标**：`comic://?...&enhance=1` 进来，吐出增强后的图，带缓存与降级，不卡进程。

1. **新建 `src/main/upscale.ts`**：
   - 启动/复用一个 utility process 跑 waifu2x 二进制（按 A 约定的路径解析）。
   - `enhance(srcAbsPath) → Promise<enhancedAbsPath>`：先查缓存（契约 §3）命中即返回；miss 则跑引擎写缓存再返回。同一 key 的并发请求合并（参考 `artifacts.ts` SMTP 并发合并写法）。
   - 串行/小并发队列，避免一次喷太多页把 GPU/CPU 打满。
2. **`comic://` 接 `enhance` 分支**（`library.ts` 协议 handler，**surgical 追加**，不重排既有逻辑）：`enhance=1` 且 `settings.upscale.enabled` 时，先 `await upscale.enhance(p)` 再 stream 增强图；引擎不可用/失败时**回退原图**（绝不让页面读不出）。仅对图片放行，PDF/缩略图请求不增强。
3. **能力检测 + 降级**：探测 GPU（Vulkan/Metal 可用性）；`upscale:status` 如实上报 `available|cpu-only|none`。无 GPU 时不主动跑（除非用户在设置里显式开）。
4. **缓存治理**：`userData/upscaled/`；`cacheLimitMB` 超限按 LRU/创建时间清理；`clearCache`/`cacheSize` IPC。
5. **settings**：`upscale:getConfig/setConfig`，沿用 `readSettings/writeSettings`；默认值见契约 §2。
6. **i18n**：引擎层若有面向用户的错误串，文案条目按 `// === lane-B convert ===` 锚点**追加**到 `i18n.ts`，不动他人区块。

**红线**：`src/main/upscale.ts`(新) + `library.ts` 协议 handler 的 enhance 追加 + settings 读写 + 对应 IPC + preload 透传。不碰转换流水线、不碰 renderer 组件、不碰打包配置、不自行装依赖（需要的二进制向 A 申报）。

## 任务卡 C · 阅读器开关 + 扩展页（Gemini）

**目标**：阅读时一键开/关增强，准实时不卡顿；扩展页能配模型/倍率/降噪/缓存。

1. **阅读器增强开关**：在阅读器顶栏（现有方向/单双页切换旁，App.tsx 约 882–893 区）加一个「高清/增强」开关。开启时把页面 URL 映射为带 `&enhance=1`（派生 `displayPages = enhance ? pages.map(addEnhance) : pages`，单页/双页/预加载隐藏 `<img>` 共用，预取自动复用）。
2. **准实时 UX**：
   - **当前页**：先以原图 `comic://?p=...` 秒显，另起一个 `&enhance=1` 加载，**ready 后 swap src** 换成增强图；swap 前角落显示轻量「增强中」态。
   - **预取页**：直接请求 `&enhance=1`（隐藏 `<img>`）暖缓存。
   - 缓存命中（重读/已暖）即时无感。
3. **扩展功能页**（填充 `activeView === 'extensions'` 占位，建议新建 `src/renderer/src/extensions/`）：
   - 引擎状态（`upscale:status`：GPU 可用/仅 CPU/不可用 → 对应提示与是否建议开启）。
   - 模型选择、倍率（1x/2x）、降噪档、阅读默认是否增强（写 `upscale:setConfig`）。
   - 缓存占用显示 + 「清理缓存」（`cacheSize`/`clearCache`）。
   - 无 GPU 时显式提示「CPU 较慢，建议关闭或仅按需」。
4. **双语**：所有新文案中英双语，按 `// === lane-C onboarding ===`（或新增 `// === lane-C upscale ===`）锚点追加 `i18n.ts`，复用现有 shadcn 组件与语义类。

**红线**：UI 用现有 shadcn 组件，遵守左右布局防溢出规则；改 `App.tsx` 限阅读器开关 + 扩展页挂载/实现，不大改既有结构。`i18n.ts` 只在自己锚点区块追加。

---

## 合并与质检（Claude）

**合并顺序**（冲突从小到大）：A（打包/依赖，独立）→ B（main + library.ts enhance 追加）→ C（renderer 新文件/阅读器）→ 最后 `i18n.ts` 对齐去重。每步 `npm run typecheck && npm run build` 绿了再下一步。

**质检关（全过才合）**：

- `npm run typecheck` / `npm run build` / `npm run pack:doctor`
- 真机 `npm run dev`：四种源格式（图片目录 / 压缩包 / PDF / 图片型 EPUB）各开增强读一遍——确认对所有格式生效。
- 准实时体感：顺序翻页基本无感（原图秒显 + 增强 swap + 预取）；重读/回看命中缓存即时。
- 降级：无 GPU 机器（或禁用 GPU）增强不卡死、有提示、可关。
- 关闭增强后行为与现状完全一致（URL 不带 `enhance`，零回归）。
- 缓存上限：超限会清理；「清理缓存」可用；`userData/upscaled/` 不无限涨。
- 打包后 dmg 内二进制可执行、模型可加载（不只 dev）。
- 涉及 main/preload（B 必然涉及）→ 交付提醒**完全重启 `npm run dev`** 再测。

**冲突避免**：`comic://` handler 只有 B 动（surgical 追加）；`App.tsx` 只有 C 动；`i18n.ts` 按锚点追加；`package.json`/打包只有 A 动。

## 回头质检清单（计划作者复查用）

- [ ] A/B/C 各自任务卡功能点全实现。
- [ ] 上面「质检关」全过。
- [ ] 文档同步：`docs/roadmap.md`（「图像增强」从探索中→正在打磨/已上线对应项）、`docs/release-notes.md`、`docs/handoff.md`、`AGENTS.md`、`operator-runbook.md`（体积/许可证/缓存路径）。
- [ ] 本工单标记「已实现，待真机质检」→ 通过后标完成。
- [ ] 记忆同步（项目状态 backlog 勾销「waifu2x 待接入扩展页」）。
