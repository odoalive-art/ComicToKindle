export type DesignTokenItem = {
  name: string
  token: string
  value: string
  className?: string
  sample?: string
  usage: string
}

export const designTokens = {
  colors: [
    {
      name: 'Background',
      token: '--background',
      value: 'oklch theme value',
      className: 'bg-background',
      sample: 'var(--background)',
      usage: '应用主画布、页面底色和大面积内容区。'
    },
    {
      name: 'Foreground',
      token: '--foreground',
      value: 'oklch theme value',
      className: 'text-foreground',
      sample: 'var(--foreground)',
      usage: '默认正文、一级标题和高优先级信息。'
    },
    {
      name: 'Primary',
      token: '--primary',
      value: 'oklch theme value',
      className: 'bg-primary text-primary-foreground',
      sample: 'var(--primary)',
      usage: '主操作按钮、当前品牌强信号和关键状态。'
    },
    {
      name: 'Secondary',
      token: '--secondary',
      value: 'oklch theme value',
      className: 'bg-secondary text-secondary-foreground',
      sample: 'var(--secondary)',
      usage: '次级按钮、轻量背景和低干扰承载面。'
    },
    {
      name: 'Muted',
      token: '--muted',
      value: 'oklch theme value',
      className: 'bg-muted text-muted-foreground',
      sample: 'var(--muted)',
      usage: '分组背景、表格弱底色、辅助信息容器。'
    },
    {
      name: 'Accent',
      token: '--accent',
      value: 'oklch theme value',
      className: 'bg-accent text-accent-foreground',
      sample: 'var(--accent)',
      usage: '悬停、选中行、临时强调和交互反馈。'
    },
    {
      name: 'Destructive',
      token: '--destructive',
      value: 'oklch theme value',
      className: 'bg-destructive',
      sample: 'var(--destructive)',
      usage: '删除、危险操作和不可逆提示。'
    },
    {
      name: 'Border',
      token: '--border',
      value: 'oklch theme value',
      className: 'border',
      sample: 'var(--border)',
      usage: '分隔线、输入框边界和卡片轮廓。'
    }
  ],
  font: {
    name: 'Sans',
    token: 'font-sans',
    value:
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif',
    usage: '全局应用字体栈，定义在 renderer body 上。'
  },
  typeScale: [
    {
      name: 'Caption',
      token: 'type.caption',
      value: '12px / 16px',
      className: 'text-xs',
      usage: '状态、徽标、表格辅助信息。'
    },
    {
      name: 'Body Small',
      token: 'type.body-sm',
      value: '14px / 20px',
      className: 'text-sm',
      usage: '正文、表格、列表项。'
    },
    {
      name: 'Body',
      token: 'type.body',
      value: '16px / 24px',
      className: 'text-base',
      usage: '长正文和输入内容。'
    },
    {
      name: 'Section',
      token: 'type.section',
      value: '18px / 28px',
      className: 'text-lg',
      usage: '分区标题。'
    },
    {
      name: 'Panel Title',
      token: 'type.panel-title',
      value: '20px / 28px',
      className: 'text-xl',
      usage: '面板或详情页标题。'
    },
    {
      name: 'Page Title',
      token: 'type.page-title',
      value: '24px / 32px',
      className: 'text-2xl',
      usage: '工作区页面主标题。'
    }
  ],
  spacing: [
    { name: '1', token: 'space.1', value: '4px', className: 'gap-1 / p-1', usage: '图标和短标签的贴近关系。' },
    { name: '2', token: 'space.2', value: '8px', className: 'gap-2 / p-2', usage: '按钮内部、列表项内部。' },
    { name: '3', token: 'space.3', value: '12px', className: 'gap-3 / p-3', usage: '紧凑工具栏和小面板。' },
    { name: '4', token: 'space.4', value: '16px', className: 'gap-4 / p-4', usage: '移动端页面边距、常规内容间距。' },
    { name: '5', token: 'space.5', value: '20px', className: 'gap-5', usage: '桌面页面分栏与区块间距。' },
    { name: '6', token: 'space.6', value: '24px', className: 'p-6', usage: '桌面页面边距、宽松面板。' },
    { name: '8', token: 'space.8', value: '32px', className: 'gap-8', usage: '文档区块或大分组之间。' }
  ],
  radius: [
    { name: 'Small', token: '--radius-sm', value: 'calc(var(--radius) - 4px)', className: 'rounded-sm', usage: '小控件和紧凑标签。' },
    { name: 'Medium', token: '--radius-md', value: 'calc(var(--radius) - 2px)', className: 'rounded-md', usage: '按钮、输入框和列表项。' },
    { name: 'Large', token: '--radius-lg', value: 'var(--radius)', className: 'rounded-lg', usage: '卡片、预览框和主要容器。' },
    { name: 'Extra Large', token: '--radius-xl', value: 'calc(var(--radius) + 4px)', className: 'rounded-xl', usage: '需要更柔和边界的大面板。' }
  ],
  layout: [
    { name: 'Mobile Page Padding', token: 'layout.page.mobile', value: '16px', className: 'p-4', usage: '移动端主内容边距。' },
    { name: 'Desktop Page Padding', token: 'layout.page.desktop', value: '24px', className: 'lg:p-6', usage: '桌面主内容边距。' },
    { name: 'Content Max Width', token: 'layout.content.max', value: '80rem', className: 'max-w-7xl', usage: '常规工作区最大内容宽度。' },
    { name: 'Component Sidebar', token: 'layout.components.sidebar', value: '280px', className: 'lg:grid-cols-[280px_minmax(0,1fr)]', usage: '设计组件页左侧索引宽度。' }
  ]
} as const
