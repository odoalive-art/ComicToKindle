import type { ConvertOptions, ConvertResult, PreviewPageResult } from './convert'

/**
 * 主进程 ↔ 转换子进程（utilityProcess）之间的消息协议。
 *
 * 所有 payload 必须是结构化可克隆的纯数据（不含函数）——回调（onProgress/onLog/
 * checkCancelled）在两侧各自重建，通过下面的消息类型在进程间传递。
 */

// 子进程转换入参（ConvertParams 去掉回调，仅保留纯数据）
export interface ConvertJobInput {
  imagePaths: string[]
  outputDir: string
  title: string
  author?: string
  options?: ConvertOptions
}

// 主进程 → 子进程
export type HostToWorker =
  | { type: 'convert'; id: string; input: ConvertJobInput }
  | { type: 'preview'; id: string; srcPath: string; pageIndex: number; options?: ConvertOptions }
  | { type: 'renderPdf'; id: string; filePath: string; dir: string }
  | { type: 'cancel'; id: string }

// 子进程 → 主进程
export type WorkerToHost =
  | { type: 'progress'; id: string; percent: number; message: string }
  | { type: 'log'; id: string; message: string }
  | { type: 'done'; id: string; result: ConvertResult }
  | { type: 'previewResult'; id: string; result: PreviewPageResult }
  | { type: 'pdfRendered'; id: string; relImages: string[] }
  | { type: 'error'; id: string; message: string }
