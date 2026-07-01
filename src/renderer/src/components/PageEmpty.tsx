import React from 'react'

export interface PageEmptyProps {
  icon?: React.ElementType
  title?: string
  label?: string
  actions?: React.ReactNode
}

// 全 app 统一的空状态组件：裸图标风格（淡灰、无底框）。
// icon / title / label / actions 均可选，按需组合：纯占位页只给 icon+label，
// 引导页可叠加 title 与 actions（按钮区）。
export function PageEmpty({
  icon: Icon,
  title,
  label,
  actions
}: PageEmptyProps): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      {Icon ? (
        <Icon className="size-10 text-muted-foreground opacity-30" strokeWidth={1.75} />
      ) : null}
      {title || label ? (
        <div className="flex flex-col gap-1">
          {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
          {label ? <p className="text-xs text-muted-foreground">{label}</p> : null}
        </div>
      ) : null}
      {actions ? <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  )
}
export default PageEmpty
