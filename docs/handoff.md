# 交接记录

## 快照

日期：2026-06-27
当前分支：feat/onboarding-delivery

已完成「首次启动引导」与「投递设置向导」的开发，并在 `npm run build` 和 `npm run typecheck` 中全部验证通过。

## 已完成

- **首启引导（Onboarding）**：
  - 新建 `src/renderer/src/onboarding/`，实现了自包含全屏欢迎、库包新建/打开、第一本漫画导入/拖拽预览及进度显示、投递配置等四大步骤。
  - 在 `App.tsx` 顶层添加 `first-run gate`（拦截 `localStorage.getItem('comic-to-kindle-onboarded') !== 'true'` 的未引导用户）。
- **投递向导（Delivery Wizard）**：
  - 新建 `src/renderer/src/delivery-wizard/`，实现了邮箱发件箱 SMTP 配置（提供 QQ/163/Gmail 邮箱模板快捷填充与专属应用授权码获取说明）。
  - 提供了亚马逊 Kindle 认可发件人白名单图文设置引导与 Kindle 电子邮箱配置。
  - 实现了基于 `window.api.deliver.testSMTP` 接口的连接自检测试。
  - 在 `App.tsx` 中的 `DeliverySettingsView` 顶栏增加「使用向导配置」按钮，点击通过 Dialog 弹窗展示该投递向导，并支持保存后自动刷新表单。
- **i18n 多语言**：
  - 在 `src/renderer/src/i18n.ts` 文件末尾独立追加 `onboardingText` 注释锚点区块（`// === lane-C onboarding ===`），提供中英双语文案，不破坏其他并行开发线。
- **验证与质量**：
  - `npm run typecheck` 类型检查零报错。
  - `npm run build` 打包编译（Main/Preload/Renderer）全部顺利通过。

## 未完成

- 无（本分支任务卡 C 内容已全部完成并闭环）。

## 重要文件

- [i18n.ts](file:///Users/linweiqiang/Desktop/ComicToKindle/src/renderer/src/i18n.ts) （末尾追加文案）
- [App.tsx](file:///Users/linweiqiang/Desktop/ComicToKindle/src/renderer/src/App.tsx) （挂载点和 Gate 拦截）
- [DeliveryWizardView.tsx](file:///Users/linweiqiang/Desktop/ComicToKindle/src/renderer/src/delivery-wizard/DeliveryWizardView.tsx) （投递向导核心组件）
- [OnboardingView.tsx](file:///Users/linweiqiang/Desktop/ComicToKindle/src/renderer/src/onboarding/OnboardingView.tsx) （首次启动引导核心组件）

## 验证

- `npm run typecheck` 通过。
- `npm run build` 通过。

## 注意事项

- 在 Onboarding 的第三步中，调用 `window.api.library.scanImport()` 在不传参数时会自动弹出 Electron 的原生文件/文件夹选择框，此处的逻辑已在主进程库的 `library:scanImport` 中进行了确认。
- `i18n.ts` 依然采取了与原 `uiText` 完全解耦的 `onboardingText` 方案，保障了分支合并阶段的零冲突。
