import { app, dialog, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

// 自动更新（electron-updater / Squirrel.Mac）
//
// 发布策略：GitHub 开源发布 + 自签证书。自签证书让 Squirrel.Mac 的「新旧版本
// 同一签名身份」校验通过，从而「检查到新版 → 下载 → 重启完成」可跑通；首次安装
// 仍有一次性 Gatekeeper 警告（用户放行一次后，经 app 内更新替换的新版不再弹）。
//
// feed 走 GitHub Releases（electron-builder.yml 的 publish: github 生成
// latest-mac.yml）。本模块只负责检查/下载/提示，UI 暂用主进程原生对话框；
// 后续可改成 renderer 内的更新提示（仍由 A 线 src/main 接线）。

let started = false

export function setupAutoUpdate(): void {
  // 仅在打包后的生产版本生效：dev 下无签名、无 feed，跳过。
  // 调试 feed 时可设 CTK_FORCE_UPDATE_CHECK=1 + 提供 dev-app-update.yml。
  const forceDev = process.env.CTK_FORCE_UPDATE_CHECK === '1'
  if (!app.isPackaged && !forceDev) return
  if (started) return
  started = true

  if (forceDev) autoUpdater.forceDevUpdateConfig = true

  // 自动下载新版；安装放到用户明确点「立即重启更新」时做，避免本应用
  // 「关窗即退出」模型下，关窗时悄悄触发更新让用户意外。
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.logger = {
    info: (m: unknown) => console.log('[updater]', m),
    warn: (m: unknown) => console.warn('[updater]', m),
    error: (m: unknown) => console.error('[updater]', m),
    debug: () => {}
  }

  autoUpdater.on('error', (err) => {
    console.error('[updater] error', err == null ? 'unknown' : (err.stack || err).toString())
  })

  autoUpdater.on('checking-for-update', () => console.log('[updater] checking…'))
  autoUpdater.on('update-available', (info) =>
    console.log('[updater] update available:', info.version)
  )
  autoUpdater.on('update-not-available', () => console.log('[updater] up to date'))
  autoUpdater.on('download-progress', (p) =>
    console.log(`[updater] downloading ${Math.round(p.percent)}%`)
  )

  autoUpdater.on('update-downloaded', async (info) => {
    const win = BrowserWindow.getAllWindows()[0]
    const opts: Electron.MessageBoxOptions = {
      type: 'info',
      buttons: ['立即重启更新', '稍后'],
      defaultId: 0,
      cancelId: 1,
      title: '发现新版本',
      message: `ComicToKindle ${info.version} 已下载完成`,
      detail: '重启应用即可完成更新。'
    }
    const result = win
      ? await dialog.showMessageBox(win, opts)
      : await dialog.showMessageBox(opts)
    if (result.response === 0) {
      // 退出并安装；isSilent=false 显示安装进度，isForceRunAfter=true 安装后重启
      autoUpdater.quitAndInstall(false, true)
    }
  })

  // 启动后稍候再检查，避免与初始化（缓存清理/扫描）抢资源。
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((e) => console.error('[updater] check failed', e))
  }, 3000)
}
