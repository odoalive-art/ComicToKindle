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
// 本轮武装是否已触发到文件选择框——自动点击的成功判定挂在这个真实事件上，而非「点到没点到」
let armedChooserFired = false
// 是否有已填入但（可能）未发送的文件——决定关窗时要不要弹确认。
// 注入成功置 true；页面整页导航（多半已发完走开）或关窗清 false。点 Send 是否发完无法从主进程拿到干净信号，
// 故偏保守：宁可多问一次，不漏掉「填了没发就关」。
let hasStagedFiles = false

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
  // 确认框用注入式组件库风格（与横幅/蒙层一致），注入失败再回退原生弹窗。
  let confirming = false
  pushWindow.on('close', (e) => {
    if (confirming || !pushWindow) return
    // 没有已填入的文件（纯登录/浏览）→ 直接关，不打扰
    if (!hasStagedFiles) return
    e.preventDefault()
    confirming = true
    confirmClose(pushWindow).then((ok) => {
      confirming = false
      if (ok) pushWindow?.destroy()
    })
  })

  pushWindow.on('closed', () => {
    pushWindow = null
    interceptorInstalled = false
    pendingFiles = null
    hasStagedFiles = false
  })
  // 整页导航（reload / 跳转，多半是发完走开或重新登录）→ 清掉暂存标志。
  // SPA 内部路由走 did-navigate-in-page，不会误清，所以填了文件不点 Send 仍会被记住。
  pushWindow.webContents.on('did-navigate', () => {
    hasStagedFiles = false
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
 * 全屏黑色蒙层 + 进度提示——自动点击上传按钮期间挡住人为操作，显示「正在上传…」。
 * 蒙层在主文档顶层（position:fixed inset:0），覆盖整页含 iframe；JS 触发的 click 不受其影响。
 */
function showOverlay(win: BrowserWindow, text: string): void {
  const js = `(() => {
    const ensure = () => {
      if (!document.body) { return setTimeout(ensure, 100); }
      if (!document.getElementById('c2k-ostyle')) {
        const s = document.createElement('style');
        s.id = 'c2k-ostyle';
        s.textContent = [
          "#c2k-overlay{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:oklch(0 0 0 / 0.55);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}",
          "#c2k-overlay .c2k-card{display:flex;align-items:center;gap:12px;padding:16px 22px;border-radius:8px;background:oklch(1 0 0);box-shadow:0 10px 40px oklch(0 0 0 / 0.3);font-size:14px;line-height:1.4;color:oklch(0.145 0 0)}",
          "#c2k-overlay .c2k-spin{flex:none;width:18px;height:18px;border-radius:9999px;border:2px solid oklch(0.922 0 0);border-top-color:oklch(0.205 0 0);animation:c2k-spin .7s linear infinite}",
          "#c2k-overlay[data-done='1'] .c2k-spin{border:none;animation:none;background:oklch(0.696 0.17 162.48);-webkit-mask:no-repeat center/12px url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\\")}",
          "@keyframes c2k-spin{to{transform:rotate(360deg)}}"
        ].join('');
        document.head.appendChild(s);
      }
      let o = document.getElementById('c2k-overlay');
      if (!o) {
        o = document.createElement('div');
        o.id = 'c2k-overlay';
        o.innerHTML = '<div class="c2k-card"><span class="c2k-spin"></span><span class="c2k-otext"></span></div>';
        document.body.appendChild(o);
      }
      o.removeAttribute('data-done');
      o.querySelector('.c2k-otext').textContent = ${JSON.stringify(text)};
    };
    ensure();
  })()`
  win.webContents.executeJavaScript(js).catch(() => {})
}

/** 蒙层切到完成态（对勾 + 文案），短暂停留后淡出，把窗口交还给用户去点 Send。 */
function finishOverlay(win: BrowserWindow, text: string): void {
  const js = `(() => {
    const o = document.getElementById('c2k-overlay');
    if (!o) return;
    o.setAttribute('data-done', '1');
    const t = o.querySelector('.c2k-otext');
    if (t) t.textContent = ${JSON.stringify(text)};
    setTimeout(() => { o.style.transition = 'opacity .25s'; o.style.opacity = '0'; setTimeout(() => o.remove(), 300); }, 800);
  })()`
  win.webContents.executeJavaScript(js).catch(() => {})
}

function hideOverlay(win: BrowserWindow): void {
  win.webContents
    .executeJavaScript(
      `(() => { const o = document.getElementById('c2k-overlay'); if (o) o.remove(); })()`
    )
    .catch(() => {})
}

const CLOSE_CONFIRM_TITLE = '关闭 Send to Kindle 窗口？'
const CLOSE_CONFIRM_DESC = '尚未点 Send 的文件不会发送。'

// 注入式确认框：与横幅/蒙层同款 design token（border/foreground/muted-foreground/primary、radius 8px），
// 无 emoji。返回一个 Promise，按钮点击/Esc/点背景把选择（true=关闭 / false=取消）resolve 回主进程，
// 不需要 IPC（executeJavaScript 会等待页面里的 Promise 落定）。
function closeConfirmScript(): string {
  return `(() => new Promise((resolve) => {
    if (!document.body) { throw new Error('no body'); }
    const ID = 'c2k-confirm';
    const prev = document.getElementById(ID); if (prev) prev.remove();
    if (!document.getElementById('c2k-cf-style')) {
      const s = document.createElement('style'); s.id = 'c2k-cf-style';
      s.textContent = [
        "#c2k-confirm{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:oklch(0 0 0 / 0.5);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}",
        "#c2k-confirm .c2k-cf-card{width:min(420px,calc(100vw - 48px));background:oklch(1 0 0);border:1px solid oklch(0.922 0 0);border-radius:8px;box-shadow:0 10px 40px oklch(0 0 0 / 0.3);padding:20px}",
        "#c2k-confirm .c2k-cf-title{font-size:15px;font-weight:600;color:oklch(0.145 0 0)}",
        "#c2k-confirm .c2k-cf-desc{margin-top:6px;font-size:13px;line-height:1.5;color:oklch(0.556 0 0)}",
        "#c2k-confirm .c2k-cf-actions{margin-top:18px;display:flex;justify-content:flex-end;gap:8px}",
        "#c2k-confirm .c2k-cf-btn{height:34px;padding:0 16px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:background .15s,opacity .15s;border:1px solid transparent}",
        "#c2k-confirm .c2k-cf-cancel{background:transparent;border-color:oklch(0.922 0 0);color:oklch(0.145 0 0)}",
        "#c2k-confirm .c2k-cf-cancel:hover{background:oklch(0.97 0 0)}",
        "#c2k-confirm .c2k-cf-ok{background:oklch(0.205 0 0);color:oklch(0.985 0 0)}",
        "#c2k-confirm .c2k-cf-ok:hover{opacity:.9}"
      ].join('');
      document.head.appendChild(s);
    }
    const wrap = document.createElement('div'); wrap.id = ID;
    const card = document.createElement('div'); card.className = 'c2k-cf-card';
    card.setAttribute('role', 'alertdialog'); card.setAttribute('aria-modal', 'true');
    const t = document.createElement('div'); t.className = 'c2k-cf-title'; t.textContent = ${JSON.stringify(CLOSE_CONFIRM_TITLE)};
    const d = document.createElement('div'); d.className = 'c2k-cf-desc'; d.textContent = ${JSON.stringify(CLOSE_CONFIRM_DESC)};
    const acts = document.createElement('div'); acts.className = 'c2k-cf-actions';
    const cancel = document.createElement('button'); cancel.className = 'c2k-cf-btn c2k-cf-cancel'; cancel.textContent = '取消';
    const ok = document.createElement('button'); ok.className = 'c2k-cf-btn c2k-cf-ok'; ok.textContent = '关闭';
    acts.appendChild(cancel); acts.appendChild(ok);
    card.appendChild(t); card.appendChild(d); card.appendChild(acts);
    wrap.appendChild(card); document.body.appendChild(wrap);
    const onKey = (e) => { if (e.key === 'Escape') finish(false); };
    const finish = (v) => { document.removeEventListener('keydown', onKey); wrap.remove(); resolve(v); };
    cancel.onclick = () => finish(false);
    ok.onclick = () => finish(true);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) finish(false); });
    document.addEventListener('keydown', onKey);
    ok.focus();
  }))()`
}

async function confirmClose(win: BrowserWindow): Promise<boolean> {
  try {
    return Boolean(await win.webContents.executeJavaScript(closeConfirmScript(), true))
  } catch {
    // 注入失败（页面正在导航、无 body 等）→ 回退原生系统弹窗，保证关窗始终可确认
    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['取消', '关闭'],
      defaultId: 1,
      cancelId: 0,
      message: CLOSE_CONFIRM_TITLE,
      detail: CLOSE_CONFIRM_DESC
    })
    return response === 1
  }
}

/**
 * 探测页面状态（可选顺带点击上传入口）：
 *   - 找上传控件（add a file / select file / 选择文件…），排除「Sign in」字样；找到即（可选）点击。
 *   - 上传入口只点 button/[role=button]/label，避开 <a> 以免误触发导航。
 *   - 同时报告是否出现「Sign in」、是否已登录（页面含 sign out / 账户等），及可见候选元素文本（诊断用）。
 * 返回值经 frame.executeJavaScript 序列化回主进程。
 */
function probeScript(doClick: boolean): string {
  return `(() => {
    const vis = (el) => el.getClientRects && el.getClientRects().length > 0;
    const txt = (el) => (((el.getAttribute && el.getAttribute('aria-label')) || '') + ' ' + (el.textContent || '')).replace(/\\s+/g, ' ').trim();
    const upRe = /add a file|add file|select.*file|choose.*file|browse|drag.*drop|drop.*here|选择文件|添加文件|上传/i;
    const signRe = /\\bsign[ -]?in\\b|登录/i;
    const nodes = Array.from(document.querySelectorAll("button,[role=button],label,a,[class*=upload i],[class*=drop i]"));
    let clicked = false, hasUploader = false, hasSignin = false;
    const cand = [];
    for (const e of nodes) {
      if (!vis(e)) continue;
      const t = txt(e);
      if (t && cand.length < 30) cand.push(e.tagName + '|' + t.slice(0, 48));
      if (signRe.test(t)) hasSignin = true;
      if (upRe.test(t) && !signRe.test(t)) {
        hasUploader = true;
        ${doClick ? "const tgt = e.closest('button,[role=button],label'); if (!clicked && tgt) { try { tgt.click(); clicked = true; } catch (_) {} }" : ''}
      }
    }
    const body = (document.body && document.body.innerText) || '';
    const loggedIn = /sign out|your account|hello,|你好|退出|账户/i.test(body);
    return { clicked, hasUploader, hasSignin, loggedIn, cand };
  })()`
}

interface ProbeResult {
  clicked: boolean
  hasUploader: boolean
  hasSignin: boolean
  loggedIn: boolean
  cand: string[]
}

// 逐 frame 跑探测脚本并合并（STK 上传组件可能在 iframe，主文档 executeJavaScript 够不到）
async function probeFrames(win: BrowserWindow, doClick: boolean): Promise<ProbeResult> {
  const script = probeScript(doClick)
  const merged: ProbeResult = {
    clicked: false,
    hasUploader: false,
    hasSignin: false,
    loggedIn: false,
    cand: []
  }
  let frames: Electron.WebFrameMain[] = []
  try {
    frames = win.webContents.mainFrame?.framesInSubtree ?? []
  } catch {
    frames = []
  }
  for (const f of frames) {
    try {
      const r = (await f.executeJavaScript(script, true)) as ProbeResult | undefined
      if (r) {
        merged.clicked ||= r.clicked
        merged.hasUploader ||= r.hasUploader
        merged.hasSignin ||= r.hasSignin
        merged.loggedIn ||= r.loggedIn
        if (Array.isArray(r.cand)) merged.cand.push(...r.cand)
      }
    } catch {
      /* frame 可能已销毁/跨域，忽略 */
    }
    if (armedChooserFired) break
  }
  return merged
}

type ReadyStatus = 'ready' | 'need-login' | 'unknown'

/**
 * 确保上传控件就绪。Amazon STK 是 SPA，首次进入常出现「已登录、但上传区仍显示 Sign in」的水合滞后——
 * 此时 reload 一次即可刷出真正的上传控件（reload 必须在装 CDP 拦截器之前，否则
 * setInterceptFileChooserDialog 会被导航清掉）。
 *
 * 「是否真的没登录」只认 URL（looksLikeSignIn）：真没登录时 Amazon 会重定向到 /ap/signin。
 * 页面正文的「已登录」启发式不可靠（顶栏账户 chrome 的水合比上传区慢，会把「水合滞后」误判成「没登录」），
 * 故 URL 还停在 STK 站、只是上传区是 Sign in 时，一律按水合滞后处理：reload 后继续等上传控件。
 */
async function ensureUploaderReady(win: BrowserWindow, allowReload: boolean): Promise<ReadyStatus> {
  let reloaded = false
  const deadline = Date.now() + 9000
  while (Date.now() < deadline) {
    // 真正的登录页（URL 判定，最可靠）→ 让用户登录
    if (looksLikeSignIn(win.webContents.getURL())) return 'need-login'
    const p = await probeFrames(win, false)
    if (p.hasUploader) return 'ready'
    // 在 STK 站但还没出上传控件（多半上传区显示 Sign in）→ 水合滞后，reload 一次刷新。
    // 走 loadStkAndWait（带退避重试 + 等加载完成）而非裸 reload()，否则代理抖动（ERR_TUNNEL 等）会把这次刷新打成白屏。
    if (allowReload && !reloaded && p.hasSignin) {
      reloaded = true
      const reloadUrl = win.webContents.getURL() || DEFAULT_STK_URL
      await loadStkAndWait(win, reloadUrl)
      await new Promise((r) => setTimeout(r, 600))
      showOverlay(win, '正在准备上传…')
      continue
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return 'unknown'
}

/**
 * 反复点击上传入口，直到真实的 fileChooserOpened 触发（armedChooserFired）或超时 ~6 秒。
 * 成功判定挂在事件上而非点击返回值，对选择器精度更宽容。超时则把可见候选元素打到主进程日志便于调参。
 */
async function clickUploadUntilChooser(win: BrowserWindow): Promise<boolean> {
  const deadline = Date.now() + 6000
  let lastCand: string[] = []
  while (Date.now() < deadline) {
    if (armedChooserFired) return true
    const p = await probeFrames(win, true)
    if (p.cand.length) lastCand = p.cand
    if (armedChooserFired) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  if (!armedChooserFired) {
    console.log('[webpush] 自动点击未触发文件框，可见候选元素:', JSON.stringify(lastCand))
  }
  return armedChooserFired
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
  armedChooserFired = false
  const names = filePaths.map((f) => f.split(/[\\/]/).pop() ?? f)
  const wc = win.webContents

  showOverlay(win, `正在上传 ${names.join('、')}…`)

  // 装拦截器之前先确保上传控件就绪（必要时 reload 一次解决登录态水合滞后）。
  // 仅首次武装允许 reload——此后拦截器已装，reload 会把它清掉。
  const ready = await ensureUploaderReady(win, !interceptorInstalled)
  if (ready === 'need-login') {
    hideOverlay(win)
    return 'not-signed-in'
  }

  try {
    // 拦截器在窗口生命周期内只装一次；后续推送只更新 pendingFiles 并重新自动点击。
    if (!interceptorInstalled) {
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
        armedChooserFired = true
        const backendNodeId = (params as { backendNodeId?: number }).backendNodeId
        if (!backendNodeId || !pendingFiles) return
        const files = pendingFiles
        pendingFiles = null
        const injectedNames = files.map((f) => f.split(/[\\/]/).pop())
        wc.debugger
          .sendCommand('DOM.setFileInputFiles', { files, backendNodeId })
          .then(() => {
            console.log('[webpush] 已注入文件:', injectedNames)
            hasStagedFiles = true
            finishOverlay(win, '已填入，点 Send 发送到 Kindle')
            showBanner(
              win,
              '已自动填入',
              `${injectedNames.join('、')}，确认后点 Amazon 的 Send 发送到 Kindle。`,
              'success'
            )
          })
          .catch((err) => {
            hideOverlay(win)
            console.log('[webpush] 注入失败:', err?.message ?? err)
          })
      })

      await wc.debugger.sendCommand('Page.enable')
      await wc.debugger.sendCommand('DOM.enable')
      await wc.debugger.sendCommand('Page.setInterceptFileChooserDialog', { enabled: true })
      interceptorInstalled = true
    }

    // 全自动：蒙层挡住人为操作 + 程序点击上传按钮，触发文件框后由上面的 handler 喂入。
    showOverlay(win, `正在上传 ${names.join('、')}…`)
    const clicked = await clickUploadUntilChooser(win)
    if (!clicked) {
      // 没找到/点不动上传按钮（Amazon 改版等）——撤蒙层，退回半自动：引导用户自己点。
      hideOverlay(win)
      showBanner(win, ARM_BANNER_LEAD, ARM_BANNER_DESC, 'info')
    }
    return 'armed'
  } catch (err) {
    hideOverlay(win)
    console.log('[webpush] 武装拦截器失败:', (err as Error)?.message ?? err)
    return 'failed'
  }
}

/**
 * 加载 STK 页面，等到真正加载完成（did-finish-load）才 resolve；失败（非 ERR_ABORTED）则退避重试。
 * 关键：把「加载」做成可等待的，调用方等它完成再开始自动化，避免自动化在白屏/加载中抢跑、与重试互相打架
 * （首次冷加载 Amazon 会重定向、偶发 ERR_FAILED，干净环境下退避重试通常能救回）。
 */
function loadStkAndWait(win: BrowserWindow, url: string): Promise<void> {
  return new Promise((resolve) => {
    const wc = win.webContents
    let attempts = 0
    let settled = false
    const cleanup = (): void => {
      wc.removeListener('did-finish-load', onOk)
      wc.removeListener('did-fail-load', onFail)
    }
    const finish = (): void => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }
    const onOk = (): void => finish()
    const onFail = (
      _e: unknown,
      code: number,
      desc: string,
      _validatedURL: string,
      isMainFrame: boolean
    ): void => {
      if (!isMainFrame || code === -3) return // ERR_ABORTED(-3) 是重定向/主动中断，正常
      if (attempts >= 3) {
        console.log(`[webpush] 加载失败(${code} ${desc})，已达重试上限，放弃`)
        finish()
        return
      }
      attempts++
      const delay = 700 * attempts // 退避：0.7s / 1.4s / 2.1s
      console.log(`[webpush] 加载失败(${code} ${desc})，第 ${attempts} 次重试（延时 ${delay}ms）`)
      setTimeout(() => {
        if (!settled && !win.isDestroyed()) {
          wc.loadURL(url, { userAgent: DESKTOP_CHROME_UA }).catch(() => {})
        }
      }, delay)
    }
    wc.on('did-finish-load', onOk)
    wc.on('did-fail-load', onFail)
    setTimeout(finish, 25000) // 兜底超时，别永远等
    wc.loadURL(url, { userAgent: DESKTOP_CHROME_UA }).catch(() => {
      /* reject 交给 did-fail-load 处理 */
    })
  })
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
    // 等页面真正加载完成再返回，调用方（armFileChooser）据此在加载好之后才开始自动化
    await loadStkAndWait(win, url)
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
