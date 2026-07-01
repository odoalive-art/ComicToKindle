import React, { useEffect, useState, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { uiText, type LanguageMode } from '@/i18n'
import type { Artifact } from '@/lib/types'
import { type ConvertOptionsState, loadConvertOptions } from '@/lib/convert-options'

// ---------- 转换活动（队列）：上提到 App 层，跨视图保活 ----------
// 持久化到 userData/queue.json（main 端 queue.ts），重启后恢复；converting 回退为 queued 整卷重跑。
// 'interrupted'：上次会话被强制退出时未完成的任务，重启后不自动跑、等用户确认继续
export type ConvertJobStatus = 'queued' | 'converting' | 'interrupted' | 'failed'
export interface ConvertJob {
  id: string
  sourceVolumePath: string
  seriesPathName: string // 部文件夹名，IPC 用作 seriesName / 输出目录名
  title: string // 书名（漫画名 + 卷册合一）
  author: string | null
  status: ConvertJobStatus
  percent: number
  error?: string
  // 入队时冻结的转换选项快照：设置页后续变更不影响已排队任务
  options?: ConvertOptionsState
  enqueuedAt?: string
}
export interface ConvertEnqueueInput {
  sourceVolumePath: string
  seriesPathName: string
  title: string
  author: string | null
}
export interface ConvertActivity {
  jobs: ConvertJob[]
  artifacts: Artifact[]
  activeCount: number
  interruptedCount: number
  convertedPaths: Set<string>
  jobByPath: Map<string, ConvertJob>
  enqueue: (input: ConvertEnqueueInput) => void
  retry: (id: string) => void
  dismiss: (id: string) => void
  cancel: (job: ConvertJob) => void
  clearAll: () => void
  refreshArtifacts: () => Promise<void>
}

export function useConvertActivity(locale: LanguageMode): ConvertActivity {
  const text = uiText[locale]
  const [jobs, setJobs] = useState<ConvertJob[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  // 持久化 hydration 完成前不写盘，避免空 state 覆盖磁盘上的旧队列
  const [hydrated, setHydrated] = useState(false)
  const runningRef = useRef(false)
  // 已取消任务的 id：用于在转换 promise 落定时静默处理（不标失败、不弹 toast）
  const cancelledIdsRef = useRef<Set<string>>(new Set())

  const refreshArtifacts = React.useCallback(async () => {
    try {
      setArtifacts(await window.api.artifacts.list())
    } catch {
      /* 清单读取失败时静默 */
    }
  }, [])

  useEffect(() => {
    refreshArtifacts()
  }, [refreshArtifacts])

  // 启动时从 main 拉回上次会话的队列；main 已把未完成任务标为 'interrupted'（不自动跑）。
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const loaded = (await window.api.queue.load()) as ConvertJob[]
        if (active && Array.isArray(loaded)) setJobs(loaded)
      } catch {
        /* 读盘失败 → 视作空队列 */
      } finally {
        if (active) setHydrated(true)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // 结构 signature：只看 id/status/error；percent 改变（高频）不触发写盘。
  const lastSigRef = useRef<string | null>(null)
  useEffect(() => {
    if (!hydrated) return
    const sig = jobs.map((j) => `${j.id}:${j.status}:${j.error ?? ''}`).join('|')
    if (sig === lastSigRef.current) return
    lastSigRef.current = sig
    void window.api.queue.save(jobs)
  }, [jobs, hydrated])

  // 进度订阅：更新对应 converting 任务的百分比
  useEffect(() => {
    return window.api.convert.onProgress(({ sourceVolumePath, percent }) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.sourceVolumePath === sourceVolumePath && j.status === 'converting'
            ? { ...j, percent }
            : j
        )
      )
    })
  }, [])

  // 顺序处理队列：空闲且有排队任务时启动下一个
  useEffect(() => {
    if (runningRef.current) return
    const next = jobs.find((j) => j.status === 'queued')
    if (!next) return
    runningRef.current = true
    setJobs((prev) =>
      prev.map((j) => (j.id === next.id ? { ...j, status: 'converting', percent: 0 } : j))
    )
    window.api.convert
      .volume({
        sourceVolumePath: next.sourceVolumePath,
        seriesName: next.seriesPathName,
        title: next.title,
        author: next.author,
        // 入队时快照过 options 就用它；持久化恢复的旧 job 无快照时回退到当前设置
        options: next.options ?? loadConvertOptions()
      })
      .then(async () => {
        await refreshArtifacts()
        setJobs((prev) => prev.filter((j) => j.id !== next.id))
        if (!cancelledIdsRef.current.delete(next.id)) toast.success(text.convert.done(next.title))
      })
      .catch((err) => {
        // 用户取消的任务已从列表移除，静默处理
        if (cancelledIdsRef.current.delete(next.id)) return
        setJobs((prev) =>
          prev.map((j) => (j.id === next.id ? { ...j, status: 'failed', error: `${err}` } : j))
        )
        toast.error(`${text.convert.failed(next.title)} — ${err}`)
      })
      .finally(() => {
        runningRef.current = false
      })
  }, [jobs, refreshArtifacts, text])

  const enqueue = React.useCallback((input: ConvertEnqueueInput) => {
    setJobs((prev) => {
      if (prev.some((j) => j.sourceVolumePath === input.sourceVolumePath)) return prev
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          status: 'queued',
          percent: 0,
          // 入队时冻结当前转换设置，免得设置页一改就影响已排队任务
          options: loadConvertOptions(),
          enqueuedAt: new Date().toISOString(),
          ...input
        }
      ]
    })
  }, [])

  const retry = React.useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'queued', percent: 0, error: undefined } : j))
    )
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  // 取消某个任务：进行中的请求 main 中止，并从列表移除（静默）
  const cancel = React.useCallback((job: ConvertJob) => {
    cancelledIdsRef.current.add(job.id)
    if (job.status === 'converting') void window.api.convert.cancel(job.sourceVolumePath)
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
  }, [])

  // 清空：取消进行中的那卷 + 清掉全部排队/失败/中断
  const clearAll = React.useCallback(() => {
    setJobs((prev) => {
      prev.forEach((j) => {
        cancelledIdsRef.current.add(j.id)
        if (j.status === 'converting') void window.api.convert.cancel(j.sourceVolumePath)
      })
      return []
    })
  }, [])

  // 中断任务「继续」：标回 queued，调度器随即接手
  const resumeAll = React.useCallback(() => {
    setJobs((prev) =>
      prev.map((j) =>
        j.status === 'interrupted' ? { ...j, status: 'queued', percent: 0, error: undefined } : j
      )
    )
  }, [])

  // 中断任务「不继续」：从队列移除
  const discardInterrupted = React.useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== 'interrupted'))
  }, [])

  // 启动后若有被中断的任务，弹一次 toast 让用户选「继续 / 不继续」（只弹一次）
  const interruptedPromptRef = useRef(false)
  useEffect(() => {
    if (!hydrated || interruptedPromptRef.current) return
    const n = jobs.filter((j) => j.status === 'interrupted').length
    if (n === 0) return
    interruptedPromptRef.current = true
    toast.warning(text.activity.interruptedToast(n), {
      duration: Infinity,
      action: { label: text.activity.interruptedResume, onClick: () => resumeAll() },
      cancel: { label: text.activity.interruptedDiscard, onClick: () => discardInterrupted() }
    })
  }, [hydrated, jobs, text, resumeAll, discardInterrupted])

  const convertedPaths = useMemo(
    () => new Set(artifacts.map((a) => a.sourceVolumePath)),
    [artifacts]
  )
  const jobByPath = useMemo(() => {
    const m = new Map<string, ConvertJob>()
    jobs.forEach((j) => m.set(j.sourceVolumePath, j))
    return m
  }, [jobs])
  const activeCount = useMemo(
    () => jobs.filter((j) => j.status === 'queued' || j.status === 'converting').length,
    [jobs]
  )
  const interruptedCount = useMemo(
    () => jobs.filter((j) => j.status === 'interrupted').length,
    [jobs]
  )

  return {
    jobs,
    artifacts,
    activeCount,
    interruptedCount,
    convertedPaths,
    jobByPath,
    enqueue,
    retry,
    dismiss,
    cancel,
    clearAll,
    refreshArtifacts
  }
}
