import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerComicScheme, setupLibrary } from './library'
import { setupArchive } from './archive'
import { setupArtifacts } from './artifacts'
import { setupQueue } from './queue'
import { setupDelivery } from './deliver'
import { setupWebPush } from './webpush'

// 自定义 comic:// 协议必须在 app ready 之前注册
registerComicScheme()

const BG_DARK = '#09090b'
const BG_LIGHT = '#ffffff'

function themeBg(): string {
  return nativeTheme.shouldUseDarkColors ? BG_DARK : BG_LIGHT
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: themeBg(),
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (process.platform === 'darwin') {
      mainWindow.setWindowButtonVisibility(false)
    }
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 漫画库数据层：comic:// 协议 + 扫描/选择目录 IPC
  setupLibrary()

  // 压缩包来源：解压/解锁 IPC（CBZ/ZIP/CBR/7z）
  setupArchive()

  // 转换产物清单 + 转换 IPC
  setupArtifacts()

  // 转换队列持久化：启动恢复 + 孤儿 tmp 清扫 + queue:load/save IPC
  setupQueue()

  // Kindle 投递：SMTP 配置 + 发送 IPC
  setupDelivery()

  // Send to Kindle 网页推送：内嵌网页通道 + 自动填文件 IPC
  setupWebPush()

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('set-background-color', (event, color: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.setBackgroundColor(color)
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 关窗即退出应用（含 macOS）。本应用是单窗口工具、无托盘/后台监控界面，
// 关窗保活没有意义；且转换队列持久化模型依赖「关窗 == 进程重启」这一前提
// （重启时 setupQueue 把未完成任务标为 interrupted 等用户确认）。
// 若 macOS 沿用默认「关窗不退」，Cmd+W 后 main 仍在后台跑转换，重开窗口会产生
// 孤儿转换 + 重复入队，故这里统一退出。
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
