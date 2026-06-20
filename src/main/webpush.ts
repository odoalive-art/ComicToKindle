import { app, ipcMain, shell, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { getArtifactById } from './artifacts'

/**
 * Send to Kindle 网页推送层：在应用内打开 Amazon「Send to Kindle」网页通道，
 * 自动把转换产物喂进上传框，由用户在可见窗口里点最后的 Send（半自动）。
 *
 * 设计要点：
 *   - 网页通道单文件上限 200MB（远高于 SMTP 邮件附件），覆盖体积偏大的漫画卷。
 *   - 独立持久 session（partition: 'persist:amazon-stk'），Amazon 登录态长期保留，
 *     不污染主窗口、重启不丢登录。
 *   - STK 页面无持久 <input type=file>，点「选择文件」才即时创建并弹系统框。故用 CDP
 *     Page.setInterceptFileChooserDialog 拦截该选择框，fileChooserOpened 时用 setFileInputFiles
 *     按 backendNodeId 喂入文件——既绕过系统对话框，又适配「点击才创建 input」的页面。
 *   - 半自动：不自动点 Send，避免 Amazon 改版/跳验证时把文件误发或卡死。引导横幅注入网页顶部。
 *   - main 只回稳定结果码，文案由 renderer 按语言翻译。
 */

// 网页通道单文件上限（字节）
const MAX_WEB_PUSH_BYTES = 200 * 1024 * 1024

const DEFAULT_STK_URL = 'https://www.amazon.com/sendtokindle'

// Amazon 边缘网关会对非标准 UA（默认 UA 含 "ComicToKindle/Electron"）返回异常/拦截页，
// 伪装成桌面 Chrome 以正常加载与登录。
const DESKTOP_CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const settingsFile = (): string => join(app.getPath('userData'), 'settings.json')

async function readSettings(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(settingsFile(), 'utf-8'))
  } catch {
    return {}
  }
}

async function patchSettings(patch: Record<string, unknown>): Promise<void> {
  const current = await readSettings()
  await fs.writeFile(settingsFile(), JSON.stringify({ ...current, ...patch }, null, 2), 'utf-8')
}

async function getStkUrl(): Promise<string> {
  const settings = await readSettings()
  const wp = settings.webpush
  const url = wp && typeof wp === 'object' ? (wp as { url?: string }).url : undefined
  return url && /^https?:\/\//i.test(url) ? url : DEFAULT_STK_URL
}

/** main 只回稳定结果码：not-found | no-outputs | too-large | inject-failed | unknown */
export interface WebPushResult {
  success: boolean
  code?: string
  detail?: string
  /** 自动填充成功的文件名，便于 renderer 给出明确反馈 */
  injected?: string[]
}

// 复用单一推送窗口
let pushWindow: BrowserWindow | null = null

// 文件选择框拦截状态：已武装的窗口 + 待注入的文件路径。
// STK 页面点「选择文件」时才临时创建 input 并弹系统框，故改为拦截该选择框、把文件直接喂进去。
let interceptorInstalled = false
let pendingFiles: string[] | null = null

function getOrCreatePushWindow(): BrowserWindow {
  if (pushWindow && !pushWindow.isDestroyed()) {
    return pushWindow
  }
  pushWindow = new BrowserWindow({
    width: 980,
    height: 760,
    show: false,
    autoHideMenuBar: true,
    title: 'Send to Kindle',
    webPreferences: {
      partition: 'persist:amazon-stk',
      // 推送窗口加载的是 Amazon 外站，禁用 preload/Node 集成，纯净浏览环境
      sandbox: true,
      contextIsolation: true
    }
  })
  pushWindow.webContents.setUserAgent(DESKTOP_CHROME_UA)

  // 关闭确认：启用 Page 域后 Amazon 暂存文件触发的 beforeunload 会被 CDP 接管、不再弹给用户，
  // 表现为「点关闭没反应」。这里自己接管关闭：弹确认框，确认后 destroy（绕过 beforeunload）。
  let confirming = false
  pushWindow.on('close', (e) => {
    if (confirming || !pushWindow) return
    e.preventDefault()
    confirming = true
    dialog
      .showMessageBox(pushWindow, {
        type: 'question',
        buttons: ['取消', '关闭'],
        defaultId: 1,
        cancelId: 0,
        message: '关闭 Send to Kindle 窗口？',
        detail: '关闭不影响已点击 Send 发送的内容；尚未发送的文件不会被发送。'
      })
      .then(({ response }) => {
        confirming = false
        if (response === 1) pushWindow?.destroy()
      })
  })

  pushWindow.on('closed', () => {
    pushWindow = null
    interceptorInstalled = false
    pendingFiles = null
  })
  // 外站里的 target=_blank / 弹窗在本窗口同 session 打开，保持登录态
  pushWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: { partition: 'persist:amazon-stk', sandbox: true }
        }
      }
    }
    return { action: 'deny' }
  })
  return pushWindow
}

type ArmStatus = 'armed' | 'not-signed-in' | 'failed'

// Amazon 登录/验证页面（此时不该武装，先让用户登录）
function looksLikeSignIn(url: string): boolean {
  return /\/ap\/(signin|cvf|mfa)|\/signin|register/i.test(url)
}

/**
 * 往网页窗口顶部注入一条引导横幅——toast 在主窗口里看不到，引导得显示在用户正看着的网页上。
 * 样式沿用应用的 shadcn new-york / neutral token（foreground/border/muted-foreground/radius、
 * 成功色取 emerald），无 emoji。tone: 'info' 武装提示；'success' 填入成功后提示。
 */
function showBanner(
  win: BrowserWindow,
  lead: string,
  desc: string,
  tone: 'info' | 'success'
): void {
  const js = `(() => {
    const render = () => {
      if (!document.body) { return setTimeout(render, 200); }
      if (!document.getElementById('c2k-style')) {
        const s = document.createElement('style');
        s.id = 'c2k-style';
        s.textContent = [
          "#c2k-banner{position:fixed;top:0;left:0;right:0;z-index:2147483647;display:flex;align-items:center;gap:10px;padding:10px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.45;color:oklch(0.145 0 0);background:oklch(1 0 0);border-bottom:1px solid oklch(0.922 0 0);box-shadow:0 1px 3px oklch(0 0 0 / 0.06)}",
          "#c2k-banner .c2k-dot{flex:none;width:8px;height:8px;border-radius:9999px;background:oklch(0.205 0 0)}",
          "#c2k-banner[data-tone=success] .c2k-dot{background:oklch(0.696 0.17 162.48)}",
          "#c2k-banner .c2k-body{flex:1;min-width:0}",
          "#c2k-banner .c2k-lead{font-weight:600}",
          "#c2k-banner .c2k-desc{color:oklch(0.556 0 0)}",
          "#c2k-banner .c2k-close{flex:none;height:28px;padding:0 12px;border-radius:6px;border:1px solid oklch(0.922 0 0);background:transparent;color:oklch(0.145 0 0);font-size:12px;font-weight:500;cursor:pointer;transition:background .15s}",
          "#c2k-banner .c2k-close:hover{background:oklch(0.97 0 0)}"
        ].join('');
        document.head.appendChild(s);
      }
      let b = document.getElementById('c2k-banner');
      if (!b) {
        b = document.createElement('div');
        b.id = 'c2k-banner';
        b.innerHTML = '<span class="c2k-dot"></span><span class="c2k-body"><span class="c2k-lead"></span> <span class="c2k-desc"></span></span><button class="c2k-close">知道了</button>';
        b.querySelector('.c2k-close').onclick = () => b.remove();
        document.body.appendChild(b);
      }
      b.setAttribute('data-tone', ${JSON.stringify(tone)});
      b.querySelector('.c2k-lead').textContent = ${JSON.stringify(lead)};
      b.querySelector('.c2k-desc').textContent = ${JSON.stringify(desc)};
    };
    render();
  })()`
  win.webContents.executeJavaScript(js).catch(() => {
    /* 页面可能正在导航，忽略 */
  })
}

/**
 * 武装文件选择框拦截：STK 页面点「选择文件」时才即时创建 <input type=file> 并弹系统框，
 * 没有可预先注入的持久输入框。改用 CDP Page.setInterceptFileChooserDialog 拦截该选择框，
 * 用户一点「选择文件」，系统框不弹出、转而触发 Page.fileChooserOpened，我们把 EPUB 直接喂进去。
 *
 * 拦截器在窗口生命周期内常驻、只装一次；每次推送只更新待注入的文件 pendingFiles。
 */
const ARM_BANNER_LEAD = '自动填入已就绪'
const ARM_BANNER_DESC =
  '点页面中的「Add a file」按钮，已转换的文件会自动填入（不会弹出系统选择框），随后点 Send 发送到 Kindle。'

async function armFileChooser(win: BrowserWindow, filePaths: string[]): Promise<ArmStatus> {
  if (looksLikeSignIn(win.webContents.getURL())) return 'not-signed-in'

  pendingFiles = filePaths
  showBanner(win, ARM_BANNER_LEAD, ARM_BANNER_DESC, 'info')

  if (interceptorInstalled) return 'armed'

  const wc = win.webContents
  try {
    if (!wc.debugger.isAttached()) wc.debugger.attach('1.3')

    wc.debugger.on('message', (_e, method, params) => {
      // 启用 Page 域后 JS 对话框（alert/confirm/beforeunload）改走 CDP，不处理会卡住页面/关闭，
      // 一律放行（接受），避免「点关闭没反应」。
      if (method === 'Page.javascriptDialogOpening') {
        wc.debugger.sendCommand('Page.handleJavaScriptDialog', { accept: true }).catch(() => {})
        return
      }
      // 文件选择框打开 → 用 pendingFiles 填入对应的 input（按 backendNodeId）
      if (method !== 'Page.fileChooserOpened') return
      const backendNodeId = (params as { backendNodeId?: number }).backendNodeId
      if (!backendNodeId || !pendingFiles) return
      const files = pendingFiles
      pendingFiles = null
      const names = files.map((f) => f.split('/').pop())
      wc.debugger
        .sendCommand('DOM.setFileInputFiles', { files, backendNodeId })
        .then(() => {
          console.log('[webpush] 已注入文件:', names)
          showBanner(
            win,
            '已自动填入',
            `${names.join('、')}，确认后点 Amazon 的 Send 发送到 Kindle。`,
            'success'
          )
        })
        .catch((err) => console.log('[webpush] 注入失败:', err?.message ?? err))
    })

    await wc.debugger.sendCommand('Page.enable')
    await wc.debugger.sendCommand('DOM.enable')
    await wc.debugger.sendCommand('Page.setInterceptFileChooserDialog', { enabled: true })
    interceptorInstalled = true
    return 'armed'
  } catch (err) {
    console.log('[webpush] 武装拦截器失败:', (err as Error)?.message ?? err)
    return 'failed'
  }
}

/** 打开/导航推送窗口到 STK 页面并显示。仅当尚未在该站点时才导航，保住已就绪/已登录的页面。 */
async function showStkWindow(): Promise<BrowserWindow> {
  const win = getOrCreatePushWindow()
  const url = await getStkUrl()
  // 先显示窗口，再加载——即使加载/重定向出问题也不会留下隐藏的空窗口
  win.show()
  win.focus()
  const current = win.webContents.getURL()
  if (!current || !current.startsWith(new URL(url).origin)) {
    // loadURL 在「服务端 302 重定向到登录页」等情况下会 reject（ERR_ABORTED/ERR_FAILED），
    // 但导航其实仍在继续，吞掉异常即可，让页面自己渲染出来。
    await win.loadURL(url, { userAgent: DESKTOP_CHROME_UA }).catch(() => {
      /* 重定向/中断导致的 reject 不致命，页面会继续加载 */
    })
  }
  return win
}

// ---------- IPC ----------
export function setupWebPush(): void {
  ipcMain.handle('webpush:getUrl', async (): Promise<string> => getStkUrl())

  ipcMain.handle('webpush:setUrl', async (_e, url: string): Promise<void> => {
    const clean = typeof url === 'string' ? url.trim() : ''
    await patchSettings({ webpush: { url: clean || DEFAULT_STK_URL } })
  })

  // 不带文件打开网页（首次登录 / 管理已发送内容）
  ipcMain.handle('webpush:openBlank', async (): Promise<void> => {
    await showStkWindow()
  })

  ipcMain.handle('webpush:open', async (_e, artifactId: string): Promise<WebPushResult> => {
    const artifact = await getArtifactById(artifactId)
    if (!artifact) return { success: false, code: 'not-found' }
    if (artifact.outputs.length === 0) return { success: false, code: 'no-outputs' }

    // 校验文件存在 + 体积上限
    const filePaths: string[] = []
    const oversized: string[] = []
    for (const out of artifact.outputs) {
      try {
        const stat = await fs.stat(out.path)
        if (stat.size > MAX_WEB_PUSH_BYTES) oversized.push(out.fileName)
        else filePaths.push(out.path)
      } catch {
        /* 文件丢失，跳过 */
      }
    }

    if (filePaths.length === 0) {
      return {
        success: false,
        code: oversized.length > 0 ? 'too-large' : 'no-outputs',
        detail: oversized.join(', ')
      }
    }

    const win = await showStkWindow()
    const status = await armFileChooser(win, filePaths)
    const codeByStatus: Record<ArmStatus, string | undefined> = {
      armed: undefined,
      'not-signed-in': 'not-signed-in',
      failed: 'inject-failed'
    }
    return {
      success: status === 'armed',
      code: codeByStatus[status],
      detail: oversized.length > 0 ? `oversized: ${oversized.join(', ')}` : undefined,
      injected: status === 'armed' ? filePaths.map((p) => p.split(/[\\/]/).pop() ?? p) : undefined
    }
  })

  // 自动填充失败时的兜底：在 Finder 里定位文件，方便用户手动拖入网页
  ipcMain.handle('webpush:reveal', async (_e, artifactId: string): Promise<void> => {
    const artifact = await getArtifactById(artifactId)
    const first = artifact?.outputs[0]?.path
    if (first) shell.showItemInFolder(first)
  })
}
