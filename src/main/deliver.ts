import { app, ipcMain, safeStorage } from 'electron'
import { join, basename } from 'path'
import { promises as fs } from 'fs'
import nodemailer from 'nodemailer'
import { getArtifactById, registerAutoDeliveryHandler, setArtifactStatus } from './artifacts'

/**
 * Kindle 投递层：SMTP 配置存储 + 发送转换产物到 Kindle 邮箱。
 *
 * 设计要点：
 *   - 移植自原型 quirky-planck/sender.js（nodemailer），仅取投递技术实现。
 *   - 配置存 userData/settings.json 的 `delivery` 字段；密码用 Electron safeStorage（系统钥匙串）加密，
 *     绝不明文落盘、也绝不回传 renderer。
 *   - 投递从归档视图手动触发，可重发；成功后把 artifact.status 置为 'delivered'。
 *   - 无线投递发 EPUB，亚马逊云端自行转码上架。
 */

export interface DeliveryConfigInput {
  host: string
  port: number
  user: string
  kindleEmail: string
  password?: string // 留空表示沿用已存密码
  autoDeliveryEnabled?: boolean
  autoDeliveryChannel?: AutoDeliveryChannel
}

export interface DeliveryConfigPublic {
  host: string
  port: number
  user: string
  kindleEmail: string
  hasPassword: boolean
  autoDeliveryEnabled: boolean
  autoDeliveryChannel: AutoDeliveryChannel
}

export type AutoDeliveryChannel = 'smtp' | 'webpush'

export interface AutoDeliveryResult extends DeliveryResult {
  attempted: boolean
  channel?: AutoDeliveryChannel
}

interface StoredDelivery {
  host?: string
  port?: number
  user?: string
  kindleEmail?: string
  passEncrypted?: string // base64(safeStorage.encryptString) 或明文回退
  passPlain?: string // safeStorage 不可用时的明文回退
  autoDeliveryEnabled?: boolean
  autoDeliveryChannel?: AutoDeliveryChannel
}

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

async function readDelivery(): Promise<StoredDelivery> {
  const settings = await readSettings()
  const d = settings.delivery
  return d && typeof d === 'object' ? (d as StoredDelivery) : {}
}

function encryptPassword(password: string): Pick<StoredDelivery, 'passEncrypted' | 'passPlain'> {
  if (safeStorage.isEncryptionAvailable()) {
    return {
      passEncrypted: safeStorage.encryptString(password).toString('base64'),
      passPlain: undefined
    }
  }
  // 系统钥匙串不可用时回退明文（极少见，如部分 Linux 无 keyring）
  return { passEncrypted: undefined, passPlain: password }
}

function decryptPassword(stored: StoredDelivery): string | null {
  if (stored.passEncrypted && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(stored.passEncrypted, 'base64'))
    } catch {
      return null
    }
  }
  return stored.passPlain ?? null
}

function hasPassword(stored: StoredDelivery): boolean {
  return Boolean(stored.passEncrypted || stored.passPlain)
}

/**
 * 投递结果：main 进程只回稳定错误码 + 原始细节，文案由 renderer 按语言翻译。
 * code 取值：missing-fields | auth-failed | connection-failed | not-configured | not-found | unknown
 */
export interface DeliveryResult {
  success: boolean
  code?: string
  detail?: string
}

function classifyError(err: unknown): { code: string; detail: string } {
  const e = err as { message?: string; code?: string; responseCode?: number }
  const detail = e?.message || String(err)
  const msg = detail.toLowerCase()
  const errCode = e?.code || ''
  const responseCode = e?.responseCode

  // 认证失败：SMTP 535/534、EAUTH，或常见登录失败措辞
  if (
    errCode === 'EAUTH' ||
    responseCode === 535 ||
    responseCode === 534 ||
    msg.includes('login fail') ||
    msg.includes('authentication failed') ||
    msg.includes('username and password not accepted') ||
    msg.includes('password is incorrect') ||
    msg.includes('invalid login')
  ) {
    return { code: 'auth-failed', detail }
  }
  // 连接失败：socket/DNS/超时类
  if (
    ['ESOCKET', 'ECONNECTION', 'ETIMEDOUT', 'EDNS', 'ENOTFOUND', 'ECONNREFUSED'].includes(
      errCode
    ) ||
    msg.includes('timeout') ||
    msg.includes('getaddrinfo') ||
    msg.includes('econnrefused')
  ) {
    return { code: 'connection-failed', detail }
  }
  return { code: 'unknown', detail }
}

function makeTransport(cfg: {
  host: string
  port: number
  user: string
  pass: string
}): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10000
  })
}

const deliveryInFlight = new Map<string, Promise<DeliveryResult>>()
let webPushAutoHandler: (
  artifactId: string,
  locale: 'zh' | 'en'
) => Promise<DeliveryResult> = async () => ({ success: false, code: 'webpush-not-ready' })

export function registerWebPushAutoHandler(handler: typeof webPushAutoHandler): void {
  webPushAutoHandler = handler
}

async function sendArtifact(artifactId: string): Promise<DeliveryResult> {
  const existing = deliveryInFlight.get(artifactId)
  if (existing) return existing

  const operation = (async (): Promise<DeliveryResult> => {
    const artifact = await getArtifactById(artifactId)
    if (!artifact) return { success: false, code: 'not-found' }

    const stored = await readDelivery()
    const pass = decryptPassword(stored)
    if (!stored.host || !stored.user || !pass || !stored.kindleEmail) {
      return { success: false, code: 'not-configured' }
    }

    const transporter = makeTransport({
      host: stored.host,
      port: stored.port ?? 465,
      user: stored.user,
      pass
    })

    try {
      for (const out of artifact.outputs) {
        await fs.access(out.path)
        const fileName = basename(out.path)
        await transporter.sendMail({
          from: stored.user,
          to: stored.kindleEmail,
          subject: `Kindle Manga: ${out.volTitle}`,
          text: `Converted manga volume: ${fileName}. Sent by ComicToKindle.`,
          attachments: [{ filename: fileName, path: out.path }]
        })
      }
      await setArtifactStatus(artifactId, 'delivered')
      return { success: true }
    } catch (err) {
      await setArtifactStatus(artifactId, 'failed')
      const result = classifyError(err)
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return { success: false, code: 'missing-output', detail: result.detail }
      }
      return { success: false, ...result }
    }
  })().finally(() => deliveryInFlight.delete(artifactId))

  deliveryInFlight.set(artifactId, operation)
  return operation
}

/**
 * 转换完成后的可选自动投递入口。SMTP 会直接发送；网页通道只自动打开并填入文件，
 * 最后的 Send 仍由用户确认。失败只更新产物状态，不回滚已经成功的转换，归档页可手动重试。
 */
export async function autoDeliverArtifact(
  artifactId: string,
  locale: 'zh' | 'en' = 'zh'
): Promise<AutoDeliveryResult> {
  const stored = await readDelivery()
  if (!stored.autoDeliveryEnabled) return { attempted: false, success: true }

  const channel = stored.autoDeliveryChannel ?? 'smtp'
  if (channel === 'webpush') {
    const result = await webPushAutoHandler(artifactId, locale)
    if (!result.success) await setArtifactStatus(artifactId, 'failed')
    return { attempted: true, channel, ...result }
  }

  const result = await sendArtifact(artifactId)
  return { attempted: true, channel, ...result }
}

// ---------- IPC ----------
export function setupDelivery(): void {
  registerAutoDeliveryHandler(autoDeliverArtifact)

  ipcMain.handle('deliver:getConfig', async (): Promise<DeliveryConfigPublic> => {
    const d = await readDelivery()
    return {
      host: d.host ?? '',
      port: d.port ?? 465,
      user: d.user ?? '',
      kindleEmail: d.kindleEmail ?? '',
      hasPassword: hasPassword(d),
      autoDeliveryEnabled: d.autoDeliveryEnabled ?? false,
      autoDeliveryChannel: d.autoDeliveryChannel ?? 'smtp'
    }
  })

  ipcMain.handle('deliver:saveConfig', async (_event, cfg: DeliveryConfigInput): Promise<void> => {
    const prev = await readDelivery()
    const next: StoredDelivery = {
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      kindleEmail: cfg.kindleEmail,
      passEncrypted: prev.passEncrypted,
      passPlain: prev.passPlain,
      autoDeliveryEnabled: cfg.autoDeliveryEnabled ?? prev.autoDeliveryEnabled ?? false,
      autoDeliveryChannel: cfg.autoDeliveryChannel ?? prev.autoDeliveryChannel ?? 'smtp'
    }
    // 仅当填写了新密码时才更新
    if (cfg.password) {
      Object.assign(next, encryptPassword(cfg.password))
    }
    await patchSettings({ delivery: next })
  })

  ipcMain.handle(
    'deliver:testSMTP',
    async (
      _event,
      cfg: { host: string; port: number; user: string; password?: string }
    ): Promise<DeliveryResult> => {
      const stored = await readDelivery()
      const pass = cfg.password || decryptPassword(stored) || ''
      if (!cfg.host || !cfg.user || !pass) {
        return { success: false, code: 'missing-fields' }
      }
      try {
        const transporter = makeTransport({ host: cfg.host, port: cfg.port, user: cfg.user, pass })
        await transporter.verify()
        return { success: true }
      } catch (err) {
        return { success: false, ...classifyError(err) }
      }
    }
  )

  ipcMain.handle('deliver:send', async (_event, artifactId: string): Promise<DeliveryResult> => {
    return sendArtifact(artifactId)
  })
}
