import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// 列表里的一条：图标 + 主文案 +（可选）次文案 +（可选）尾部操作（如「恢复」按钮）。
export interface EntityListItem {
  key: string
  icon?: React.ElementType
  primary: React.ReactNode
  primaryTitle?: string // hover 完整名（主文案 truncate 时用）
  secondary?: React.ReactNode
  action?: React.ReactNode
}

// 底部按钮：loading 时前置 spinner 并保留文案；顺序即桌面端从左到右的视觉顺序。
export interface EntityListAction {
  label: React.ReactNode
  onClick: () => void
  variant?: React.ComponentProps<typeof Button>['variant']
  disabled?: boolean
  loading?: boolean
}

export interface EntityListDialogProps {
  open: boolean
  onClose: () => void
  /** 进行中：锁定遮罩/Esc 关闭，避免操作期间误关 */
  busy?: boolean
  title: React.ReactNode
  description?: React.ReactNode
  items: EntityListItem[]
  /** items 为空且提供该文案时，列表区改为虚线占位提示 */
  emptyText?: React.ReactNode
  /** 滚动区高度类，默认固定 h-72；如需「按内容到顶」可传 max-h-72 */
  scrollClassName?: string
  /** 列表与底部按钮之间的附加模块（如导入弹窗的「导入后删除源文件」勾选） */
  children?: React.ReactNode
  actions: EntityListAction[]
}

/**
 * 实体清单弹窗：标题 + 描述 + 可滚动条目列表 + 可选附加模块 + 底部按钮组。
 * 导入卷册、回收站等「列一批东西再做批量操作」的弹窗共用此组件，各信息模块均可配置。
 */
export function EntityListDialog({
  open,
  onClose,
  busy = false,
  title,
  description,
  items,
  emptyText,
  scrollClassName,
  children,
  actions
}: EntityListDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(o) => (!o && !busy ? onClose() : undefined)}>
      <DialogContent className="max-w-[calc(100vw-2rem)] min-w-0 overflow-hidden sm:max-w-md">
        <DialogHeader className="min-w-0">
          <DialogTitle className="min-w-0 truncate pr-8">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="min-w-0 text-pretty break-words pr-8">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {items.length === 0 && emptyText ? (
          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <div
            className={cn(
              'w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-md border',
              scrollClassName ?? 'h-72'
            )}
          >
            <div className="w-full min-w-0 divide-y">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.key} className="flex w-full min-w-0 items-center gap-2 px-3 py-2">
                    {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium" title={item.primaryTitle}>
                        {item.primary}
                      </div>
                      {item.secondary ? (
                        <div className="truncate text-xs text-muted-foreground">
                          {item.secondary}
                        </div>
                      ) : null}
                    </div>
                    {item.action ? (
                      <div className="ml-2 flex shrink-0 justify-end">{item.action}</div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {children}

        <DialogFooter className="min-w-0 flex-wrap">
          {actions.map((action, i) => (
            <Button
              key={i}
              type="button"
              variant={action.variant}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
