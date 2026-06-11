# 运行手册

本文覆盖当前基础阶段的安装、开发和验证流程。

## 仓库位置

当前工作区路径：

```txt
/Users/linweiqiang/Desktop/ComicToKindle
```

不要使用旧 iCloud Drive 路径。2026-06-11 项目迁出同步盘路径，是因为 `esbuild` 和 Node `.bin` shim 在同步目录下执行卡住。

## 安装

```bash
npm install
```

如果 npm 报告 `~/.npm` 下存在 root-owned cache 文件，可以临时使用项目内缓存：

```bash
npm_config_cache=.npm-cache npm install
```

保持 `.npm-cache` 不入库。

## 开发冒烟

```bash
npm run dev
```

预期结果：

- Electron main process 构建成功。
- preload script 构建成功。
- renderer dev server 默认从 `http://localhost:5173/` 启动；如果端口被占用，Vite 会顺延到下一个端口。
- Electron 窗口打开当前工作台 UI。
- 侧边栏包含 `漫画库`、`设计组件`、`基础规范` 等工作区。
- 顶栏深浅模式按钮可以切换整个 renderer 的主题。

使用 `Ctrl+C` 停止 dev 进程。

## 构建验证

```bash
npm run build
```

预期结果：

- node 和 web TypeScript 检查通过。
- electron-vite 构建 `out/main`、`out/preload` 和 `out/renderer`。

## 打包

```bash
npm run build:mac
npm run build:win
npm run build:linux
```

这些脚本会先运行 `npm run build`，再调用 electron-builder 生成目标平台产物。

## 常用检查

```bash
npm run typecheck
npm run lint
npm run format
git status --short
```

`npm run build` 是当前 UI 系统和应用壳变更后的主验证命令。发布分支前可再运行 `npm run lint` 和 `npm run format`。

## 环境变量

当前没有应用专属环境变量。

如果后续新增转换器路径、Kindle 邮箱设置、Send to Kindle 自动化开关或模型位置，需要同步更新本文和 `AGENTS.md`。

## 已知工具链说明

- 仓库应放在 iCloud Drive、Dropbox 等同步目录之外。
- shadcn CLI 无法自动把该 Electron Vite 项目识别为标准 Vite app，因此项目通过 `components.json` 手动配置 shadcn。
- `设计组件` 和 `基础规范` 是开发期提效页面，不代表已实现终端用户功能。
- `npm run build` 是当前验证设置是否正确的事实来源。
