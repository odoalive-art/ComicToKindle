export type ShadcnComponent = {
  name: string
  slug: string
}

export type LocalizedText = string | { en: string; zh: string }

function translated(en: string, zh: string): LocalizedText {
  return { en, zh }
}

export type ShadcnDocBlock =
  | {
      type: 'paragraph'
      text: LocalizedText
    }
  | {
      type: 'code'
      language: string
      title?: LocalizedText
      code: string
    }
  | {
      type: 'preview'
      name: string
      styleName: string
      description?: LocalizedText
      direction?: string
    }
  | {
      type: 'steps'
      items: LocalizedText[]
    }
  | {
      type: 'composition'
      code: string
    }
  | {
      type: 'table'
      columns: LocalizedText[]
      rows: string[][]
    }
  | {
      type: 'callout'
      text: LocalizedText
    }
  | {
      type: 'link'
      label: LocalizedText
      href: string
    }

export type ShadcnDocSection = {
  title: LocalizedText
  blocks: ShadcnDocBlock[]
}

export type ShadcnComponentDoc = ShadcnComponent & {
  description: LocalizedText
  featured?: boolean
  mirrored: true
  sourcePath: string
  officialUrl: string
  installCommand: string
  manualDependencies?: string[]
  sections: ShadcnDocSection[]
}

export const shadcnComponents: ShadcnComponent[] = [
  { name: 'Accordion', slug: 'accordion' },
  { name: 'Alert', slug: 'alert' },
  { name: 'Alert Dialog', slug: 'alert-dialog' },
  { name: 'Aspect Ratio', slug: 'aspect-ratio' },
  { name: 'Avatar', slug: 'avatar' },
  { name: 'Badge', slug: 'badge' },
  { name: 'Breadcrumb', slug: 'breadcrumb' },
  { name: 'Button', slug: 'button' },
  { name: 'Button Group', slug: 'button-group' },
  { name: 'Calendar', slug: 'calendar' },
  { name: 'Card', slug: 'card' },
  { name: 'Carousel', slug: 'carousel' },
  { name: 'Chart', slug: 'chart' },
  { name: 'Checkbox', slug: 'checkbox' },
  { name: 'Collapsible', slug: 'collapsible' },
  { name: 'Combobox', slug: 'combobox' },
  { name: 'Command', slug: 'command' },
  { name: 'Context Menu', slug: 'context-menu' },
  { name: 'Data Table', slug: 'data-table' },
  { name: 'Date Picker', slug: 'date-picker' },
  { name: 'Dialog', slug: 'dialog' },
  { name: 'Direction', slug: 'direction' },
  { name: 'Drawer', slug: 'drawer' },
  { name: 'Dropdown Menu', slug: 'dropdown-menu' },
  { name: 'Empty', slug: 'empty' },
  { name: 'Field', slug: 'field' },
  { name: 'Hover Card', slug: 'hover-card' },
  { name: 'Input', slug: 'input' },
  { name: 'Input Group', slug: 'input-group' },
  { name: 'Input OTP', slug: 'input-otp' },
  { name: 'Item', slug: 'item' },
  { name: 'Kbd', slug: 'kbd' },
  { name: 'Label', slug: 'label' },
  { name: 'Menubar', slug: 'menubar' },
  { name: 'Native Select', slug: 'native-select' },
  { name: 'Navigation Menu', slug: 'navigation-menu' },
  { name: 'Pagination', slug: 'pagination' },
  { name: 'Popover', slug: 'popover' },
  { name: 'Progress', slug: 'progress' },
  { name: 'Radio Group', slug: 'radio-group' },
  { name: 'Resizable', slug: 'resizable' },
  { name: 'Scroll Area', slug: 'scroll-area' },
  { name: 'Select', slug: 'select' },
  { name: 'Separator', slug: 'separator' },
  { name: 'Sheet', slug: 'sheet' },
  { name: 'Sidebar', slug: 'sidebar' },
  { name: 'Skeleton', slug: 'skeleton' },
  { name: 'Slider', slug: 'slider' },
  { name: 'Sonner', slug: 'sonner' },
  { name: 'Spinner', slug: 'spinner' },
  { name: 'Switch', slug: 'switch' },
  { name: 'Table', slug: 'table' },
  { name: 'Tabs', slug: 'tabs' },
  { name: 'Textarea', slug: 'textarea' },
  { name: 'Toast', slug: 'toast' },
  { name: 'Toggle', slug: 'toggle' },
  { name: 'Toggle Group', slug: 'toggle-group' },
  { name: 'Tooltip', slug: 'tooltip' },
  { name: 'Typography', slug: 'typography' }
]

export const installedShadcnComponentSlugs = new Set([
  'accordion',
  'alert',
  'alert-dialog',
  'aspect-ratio',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'card',
  'dialog',
  'input',
  'progress',
  'scroll-area',
  'separator',
  'sheet',
  'sidebar',
  'skeleton',
  'sonner',
  'table',
  'tabs',
  'tooltip',
  'calendar',
  'carousel',
  'chart',
  'checkbox',
  'collapsible',
  'command',
  'combobox',
  'context-menu',
  'drawer',
  'dropdown-menu',
  'empty',
  'field',
  'input-group',
  'input-otp',
  'item',
  'kbd',
  'label',
  'menubar',
  'native-select',
  'navigation-menu',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'resizable',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'slider',
  'sonner',
  'spinner',
  'switch',
  'tabs',
  'textarea',
  'toggle',
  'toggle-group',
  'tooltip',
  'hover-card'
])

export const shadcnDocsSource = {
  repository: 'shadcn-ui/ui',
  ref: '1994caba0b2140d4d5aa765bb9d7d4412d6aaabb',
  license: 'MIT',
  docsRoot: 'apps/v4/content/docs/components/radix'
}

export const mirroredShadcnDocs: Record<string, ShadcnComponentDoc> = {
  accordion: {
    name: 'Accordion',
    slug: 'accordion',
    description: translated(
      'A vertically stacked set of interactive headings that each reveal a section of content.',
      '垂直堆叠的一组交互式标题，每个标题可展开显示对应内容区域。'
    ),
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/accordion.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/accordion',
    installCommand: 'npx shadcn@latest add accordion',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-demo',
            description: translated(
              'A vertically stacked set of interactive headings that each reveal a section of content.',
              '垂直堆叠的一组交互式标题，每个标题可展开显示对应内容区域。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add accordion'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Accordion,\n  AccordionContent,\n  AccordionItem,\n  AccordionTrigger,\n} from "@/components/ui/accordion"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Accordion type="single" collapsible defaultValue="item-1">\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Is it accessible?</AccordionTrigger>\n    <AccordionContent>\n      Yes. It adheres to the WAI-ARIA design pattern.\n    </AccordionContent>\n  </AccordionItem>\n</Accordion>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Accordion\n├── AccordionItem\n│   ├── AccordionTrigger\n│   └── AccordionContent\n└── AccordionItem\n    ├── AccordionTrigger\n    └── AccordionContent'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-basic',
            description: translated(
              'A basic accordion that shows one item at a time. The first item is open by default.',
              '基础手风琴，一次展示一个条目，默认展开第一个。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-multiple',
            description: translated(
              'Use `type="multiple"` to allow multiple items to be open at the same time.',
              '使用 `type="multiple"` 允许同时展开多个条目。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-disabled',
            description: translated(
              'Use the `disabled` prop on `AccordionItem` to disable individual items.',
              '在 `AccordionItem` 上使用 `disabled` prop 来禁用单个条目。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-borders',
            description: translated(
              'Add `border` to the `Accordion` and `border-b last:border-b-0` to the `AccordionItem` to add borders.',
              '为 `Accordion` 添加 `border` 类，为 `AccordionItem` 添加 `border-b last:border-b-0` 类来添加边框。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'accordion-card',
            description: translated(
              'Wrap the `Accordion` in a `Card` component for a card-style layout.',
              '将 `Accordion` 包裹在 `Card` 组件中以获得卡片式布局。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 [RTL configuration guide](/docs/rtl)。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'accordion-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              ['type', '"single" | "multiple"', '"single"'],
              ['collapsible', 'boolean', 'false'],
              ['defaultValue', 'string | string[]', '-'],
              ['disabled (AccordionItem)', 'boolean', 'false'],
              ['value (AccordionItem)', 'string', '-']
            ]
          },
          {
            type: 'link',
            label: translated(
              'Radix UI Accordion API Reference',
              'Radix UI Accordion API 参考'
            ),
            href: 'https://www.radix-ui.com/primitives/docs/components/accordion#api-reference'
          }
        ]
      }
    ]
  },
  alert: {
    name: 'Alert',
    slug: 'alert',
    description: translated(
      'Displays a callout for user attention.',
      '显示一个警告提示，以吸引用户的注意力。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/alert.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/alert',
    installCommand: 'npx shadcn@latest add alert',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add alert'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Alert>\n  <Terminal className="h-4 w-4" />\n  <AlertTitle>Heads up!</AlertTitle>\n  <AlertDescription>\n    You can add components to your app using the cli.\n  </AlertDescription>\n</Alert>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Alert\n├── AlertTitle\n└── AlertDescription'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-destructive',
            description: translated(
              'Use the `variant="destructive"` prop to display a destructive alert.',
              '使用 `variant="destructive"` 属性显示危险/破坏性的警告提示。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-action',
            description: translated(
              'Add action buttons to the alert for user interaction.',
              '在警告中添加操作按钮以供用户交互。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-custom-colors',
            description: translated(
              'Override the default color scheme with custom border and text colors.',
              '使用自定义边框和文本颜色覆盖默认配色方案。'
            )
          }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              ['variant', '"default" | "destructive"', '"default"']
            ]
          }
        ]
      }
    ]
  },
  'alert-dialog': {
    name: 'Alert Dialog',
    slug: 'alert-dialog',
    description: translated(
      'A modal dialog that interrupts the user with important content and expects a response.',
      '一个模态对话框，用重要的内容中断用户并期待其响应。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/alert-dialog.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/alert-dialog',
    installCommand: 'npx shadcn@latest add alert-dialog',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-dialog-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add alert-dialog'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  AlertDialog,\n  AlertDialogAction,\n  AlertDialogCancel,\n  AlertDialogContent,\n  AlertDialogDescription,\n  AlertDialogFooter,\n  AlertDialogHeader,\n  AlertDialogTitle,\n  AlertDialogTrigger,\n} from "@/components/ui/alert-dialog"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<AlertDialog>\n  <AlertDialogTrigger>Open</AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>\n      <AlertDialogDescription>\n        This action cannot be undone. This will permanently delete your account\n        and remove your data from our servers.\n      </AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction>Continue</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'AlertDialog\n├── AlertDialogTrigger\n└── AlertDialogContent\n    ├── AlertDialogHeader\n    │   ├── AlertDialogTitle\n    │   └── AlertDialogDescription\n    └── AlertDialogFooter\n        ├── AlertDialogCancel\n        └── AlertDialogAction'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-dialog-small',
            description: translated(
              'Use `size="sm"` on `AlertDialogContent` for a compact dialog.',
              '在 `AlertDialogContent` 上使用 `size="sm"` 获得紧凑对话框。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-dialog-media',
            description: translated(
              'Use `AlertDialogMedia` to add an icon or image to the dialog header.',
              '使用 `AlertDialogMedia` 在对话框头部添加图标或图像。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-dialog-small-media',
            description: translated(
              'Combine `size="sm"` with `AlertDialogMedia` for a compact media dialog.',
              '结合 `size="sm"` 和 `AlertDialogMedia` 获得紧凑的媒体对话框。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'alert-dialog-destructive',
            description: translated(
              'Use `variant="destructive"` on `AlertDialogAction` for destructive confirmations.',
              '在 `AlertDialogAction` 上使用 `variant="destructive"` 实现危险操作确认。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'alert-dialog-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'link',
            label: translated('Radix UI Alert Dialog API Reference', 'Radix UI Alert Dialog API 参考'),
            href: 'https://www.radix-ui.com/primitives/docs/components/alert-dialog#api-reference'
          }
        ]
      }
    ]
  },
  'aspect-ratio': {
    name: 'Aspect Ratio',
    slug: 'aspect-ratio',
    description: translated(
      'Displays content within a desired ratio.',
      '在指定的比例内显示内容。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/aspect-ratio.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/aspect-ratio',
    installCommand: 'npx shadcn@latest add aspect-ratio',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'aspect-ratio-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add aspect-ratio'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { AspectRatio } from "@/components/ui/aspect-ratio"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<div className="w-[450px]">\n  <AspectRatio ratio={16 / 9}>\n    <img src="..." alt="Image" className="rounded-md object-cover w-full h-full" />\n  </AspectRatio>\n</div>'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'aspect-ratio-square',
            description: translated(
              'Use `ratio={1/1}` for a square aspect ratio.',
              '使用 `ratio={1/1}` 获得正方形比例。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'aspect-ratio-portrait',
            description: translated(
              'Use `ratio={3/4}` for a portrait aspect ratio.',
              '使用 `ratio={3/4}` 获得纵向/肖像比例。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'aspect-ratio-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              ['ratio', 'number', '16 / 9']
            ]
          },
          {
            type: 'link',
            label: translated('Radix UI Aspect Ratio API Reference', 'Radix UI Aspect Ratio API 参考'),
            href: 'https://www.radix-ui.com/primitives/docs/components/aspect-ratio#api-reference'
          }
        ]
      }
    ]
  },
  avatar: {
    name: 'Avatar',
    slug: 'avatar',
    description: translated(
      'An image element with a fallback for representing the user.',
      '带有回退机制的头像图像元素，用于展示用户。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/avatar.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/avatar',
    installCommand: 'npx shadcn@latest add avatar',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add avatar'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Avatar>\n  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />\n  <AvatarFallback>CN</AvatarFallback>\n</Avatar>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Avatar\n├── AvatarImage\n└── AvatarFallback'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-badge',
            description: translated(
              'Use `AvatarBadge` to add a status indicator to the avatar.',
              '使用 `AvatarBadge` 为头像添加状态指示器。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-badge-icon',
            description: translated(
              'Use an icon inside `AvatarBadge` for richer status cues.',
              '在 `AvatarBadge` 内使用图标以展示更丰富的状态提示。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-group',
            description: translated(
              'Use `AvatarGroup` to stack multiple avatars with overlap.',
              '使用 `AvatarGroup` 将多个头像重叠堆叠展示。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-group-count',
            description: translated(
              'Use `AvatarGroupCount` to show the number of remaining avatars.',
              '使用 `AvatarGroupCount` 显示剩余头像数量。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-group-icon',
            description: translated(
              'Use an icon with `AvatarGroup` for a compact team indicator.',
              '使用图标配合 `AvatarGroup` 实现紧凑的团队指示器。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-sizes',
            description: translated(
              'Use the `size` prop to change the avatar size: `sm`, `default`, or `lg`.',
              '使用 `size` prop 改变头像尺寸：`sm`、`default` 或 `lg`。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'avatar-dropdown',
            description: translated(
              'Wrap an `Avatar` with `DropdownMenu` to create a user menu trigger.',
              '用 `DropdownMenu` 包裹 `Avatar` 创建用户菜单触发器。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'avatar-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'link',
            label: translated('Radix UI Avatar API Reference', 'Radix UI Avatar API 参考'),
            href: 'https://www.radix-ui.com/primitives/docs/components/avatar#api-reference'
          }
        ]
      }
    ]
  },
  badge: {
    name: 'Badge',
    slug: 'badge',
    description: translated(
      'Displays a badge or a component that looks like a badge.',
      '显示一个徽章，或一个视觉上像徽章的组件。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/badge.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/badge',
    installCommand: 'npx shadcn@latest add badge',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add badge'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { Badge } from "@/components/ui/badge"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Badge variant="outline">Badge</Badge>'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-secondary',
            description: translated('Secondary variant badge.', '次要变体徽章。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-outline',
            description: translated('Outline variant badge.', '轮廓/边框变体徽章。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-destructive',
            description: translated('Destructive variant badge.', '危险/破坏性变体徽章。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-ghost',
            description: translated('Ghost variant badge with no background or border.', '无背景和边框的幽灵变体徽章。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-icon',
            description: translated(
              'Use the `data-icon="inline-start"` or `data-icon="inline-end"` attribute for correct spacing.',
              '使用 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性获得正确间距。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-spinner',
            description: translated(
              'Render a `<Spinner />` component inside the badge for loading states.',
              '在 badge 内渲染 `<Spinner />` 组件展示加载状态。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-link',
            description: translated(
              'Use the `asChild` prop to render a link that looks like a badge.',
              '使用 `asChild` prop 渲染一个看起来像徽章的链接。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'badge-custom-colors',
            description: translated(
              'Override default colors with custom Tailwind classes.',
              '使用自定义 Tailwind 类覆盖默认颜色。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'badge-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              ['variant', '"default" | "secondary" | "outline" | "destructive" | "ghost" | "link"', '"default"'],
              ['asChild', 'boolean', 'false']
            ]
          }
        ]
      }
    ]
  },
  breadcrumb: {
    name: 'Breadcrumb',
    slug: 'breadcrumb',
    description: translated(
      'Displays the path to the current resource using a hierarchy of links.',
      '使用链接层级显示指向当前资源的路径。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/breadcrumb.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/breadcrumb',
    installCommand: 'npx shadcn@latest add breadcrumb',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'breadcrumb-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add breadcrumb'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Breadcrumb,\n  BreadcrumbItem,\n  BreadcrumbLink,\n  BreadcrumbList,\n  BreadcrumbPage,\n  BreadcrumbSeparator,\n} from "@/components/ui/breadcrumb"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/">Home</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/components">Components</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Breadcrumb\n└── BreadcrumbList\n    ├── BreadcrumbItem\n    │   └── BreadcrumbLink\n    ├── BreadcrumbSeparator\n    ├── BreadcrumbItem\n    │   └── BreadcrumbLink\n    ├── BreadcrumbSeparator\n    └── BreadcrumbItem\n        └── BreadcrumbPage'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'breadcrumb-custom-separator',
            description: translated('Use a custom component or icon as a separator.', '使用自定义组件或图标作为分隔符。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'breadcrumb-ellipsis',
            description: translated('Use the ellipsis component to show collapsed breadcrumb items.', '使用省略号组件来折叠部分层级。')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'breadcrumb-dropdown',
            description: translated(
              'Compose `BreadcrumbItem` with `DropdownMenu` for a hierarchical breadcrumb.',
              '将 `BreadcrumbItem` 与 `DropdownMenu` 组合实现层级面包屑。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'breadcrumb-link-component',
            description: translated(
              'Use the `asChild` prop on `BreadcrumbLink` for custom link components.',
              '在 `BreadcrumbLink` 上使用 `asChild` prop 实现自定义链接组件。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'breadcrumb-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  button: {
    name: 'Button',
    slug: 'button',
    description: translated(
      'Displays a button or a component that looks like a button.',
      '显示一个按钮，或一个视觉上像按钮的组件。'
    ),
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/button.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/button',
    installCommand: 'npx shadcn@latest add button',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'button-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add button'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { Button } from "@/components/ui/button"'
          },
          { type: 'code', language: 'tsx', code: '<Button variant="outline">Button</Button>' }
        ]
      },
      {
        title: translated('Cursor', '光标'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'Tailwind v4 switched from cursor: pointer to cursor: default for the button component. If you want to keep the cursor: pointer behavior, add the following CSS or enable it during setup with npx shadcn@latest init --pointer.',
              'Tailwind v4 将 button 组件的光标从 cursor: pointer 改为 cursor: default。如果你想保留 cursor: pointer 行为，可以添加下面的 CSS，或在初始化时使用 npx shadcn@latest init --pointer。'
            )
          },
          {
            type: 'code',
            language: 'css',
            title: 'globals.css',
            code: '@layer base {\n  button:not(:disabled),\n  [role="button"]:not(:disabled) {\n    cursor: pointer;\n  }\n}'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-size',
            description: translated(
              'Use the `size` prop to change the size of the button.',
              '使用 `size` prop 调整按钮尺寸。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-default',
            description: translated('Default', '默认')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-outline',
            description: translated('Outline', '描边')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-secondary',
            description: translated('Secondary', '次要')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-ghost',
            description: translated('Ghost', '幽灵')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-destructive',
            description: translated('Destructive', '危险')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-link',
            description: translated('Link', '链接')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-icon',
            description: translated('Icon', '图标')
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-with-icon',
            description: translated(
              'Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the icon for the correct spacing.',
              '记得为图标添加 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性，以获得正确间距。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-rounded',
            description: translated(
              'Use the `rounded-full` class to make the button rounded.',
              '使用 `rounded-full` 类让按钮变成圆角胶囊形。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-spinner',
            description: translated(
              'Render a `<Spinner />` component inside the button to show a loading state. Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the spinner for the correct spacing.',
              '在按钮内渲染 `<Spinner />` 组件来展示加载状态。记得为 spinner 添加 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性，以获得正确间距。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-demo',
            description: translated(
              'To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/radix/button-group) documentation for more details.',
              '要创建按钮组，请使用 `ButtonGroup` 组件。更多细节见 [Button Group](/docs/components/radix/button-group) 文档。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-aschild',
            description: translated(
              "You can use the `asChild` prop on `<Button />` to make another component look like a button. Here's an example of a link that looks like a button.",
              '你可以在 `<Button />` 上使用 `asChild` prop，让其他组件呈现为按钮样式。下面是一个看起来像按钮的链接示例。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 [RTL configuration guide](/docs/rtl)。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'button-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              [
                'variant',
                '"default" | "outline" | "ghost" | "destructive" | "secondary" | "link"',
                '"default"'
              ],
              [
                'size',
                '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
                '"default"'
              ],
              ['asChild', 'boolean', 'false']
            ]
          }
        ]
      }
    ]
  },
  'button-group': {
    name: 'Button Group',
    slug: 'button-group',
    description: translated(
      'Group a series of buttons together on a single line.',
      '将一系列按钮组合在同一行展示。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/button-group.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/button',
    installCommand: 'npx shadcn@latest add button-group',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-demo'
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add button-group'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Ensure Button component is installed: npx shadcn@latest add button',
                '确保已安装 Button 组件：npx shadcn@latest add button'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import { ButtonGroup } from "@/components/ui/button-group"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<ButtonGroup>\n  <Button variant="outline">Left</Button>\n  <Button variant="outline">Middle</Button>\n  <Button variant="outline">Right</Button>\n</ButtonGroup>'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-orientation',
            description: translated(
              'Use `orientation="vertical"` for vertical button groups.',
              '使用 `orientation="vertical"` 实现纵向按钮组。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-size',
            description: translated(
              'Different size variants for the button group.',
              '按钮组的不同尺寸变体。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-separator',
            description: translated(
              'Use `ButtonGroupSeparator` to divide button groups.',
              '使用 `ButtonGroupSeparator` 分隔按钮组。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-split',
            description: translated(
              'A split button group with separator and dropdown.',
              '带分隔符和下拉菜单的分裂按钮组。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-input',
            description: translated(
              'Combine `ButtonGroup` with an `Input` component.',
              '将 `ButtonGroup` 与 `Input` 组件组合。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-dropdown-menu',
            description: translated(
              'A split button with `DropdownMenu`.',
              '带 `DropdownMenu` 的分裂按钮。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'button-group-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  calendar: {
    name: 'Calendar',
    slug: 'calendar',
    description: translated('A date picker component or calendar component.', '日历及日期选择组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/calendar.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/calendar',
    installCommand: 'npx shadcn@latest add calendar',
    manualDependencies: ['react-day-picker', 'date-fns'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'calendar-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add calendar' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { Calendar } from "@/components/ui/calendar"' },
          { type: 'code', language: 'tsx', code: 'const [date, setDate] = useState<Date | undefined>(new Date())\n\n<Calendar\n  mode="single"\n  selected={date}\n  onSelect={setDate}\n  className="rounded-md border"\n/>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'calendar-range', description: translated('Use `mode="range"` to select a date range.', '使用 `mode="range"` 选择日期范围。') },
          { type: 'preview', styleName: 'radix-nova', name: 'calendar-dropdown', description: translated('Use `captionLayout="dropdown"` for month/year selectors.', '使用 `captionLayout="dropdown"` 获得月/年下拉选择器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'calendar-presets', description: translated('Add preset buttons for quick date selection.', '添加预设按钮以便快速选择日期。') },
          { type: 'preview', styleName: 'radix-nova', name: 'calendar-booked-dates', description: translated('Highlight booked or unavailable dates.', '高亮已预订或不可用的日期。') },
          { type: 'preview', styleName: 'radix-nova', name: 'calendar-custom-cells', description: translated('Customize individual day cell content.', '自定义单个日期单元格的内容。') }
        ]
      }
    ]
  },
  card: {
    name: 'Card',
    slug: 'card',
    description: translated('Displays a card with header, content, and footer.', '显示一个包含页头、内容和页脚的卡片。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/card.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/card',
    installCommand: 'npx shadcn@latest add card',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'card-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add card' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  Card,\n  CardContent,\n  CardDescription,\n  CardFooter,\n  CardHeader,\n  CardTitle,\n} from "@/components/ui/card"' },
          { type: 'code', language: 'tsx', code: '<Card>\n  <CardHeader>\n    <CardTitle>Card Title</CardTitle>\n    <CardDescription>Card Description</CardDescription>\n  </CardHeader>\n  <CardContent>\n    <p>Card Content</p>\n  </CardContent>\n  <CardFooter>\n    <p>Card Footer</p>\n  </CardFooter>\n</Card>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'card-size', description: translated('Use the `size` prop to change card dimensions.', '使用 `size` prop 改变卡片尺寸。') },
          { type: 'preview', styleName: 'radix-nova', name: 'card-spacing', description: translated('Adjust internal spacing with padding utilities.', '使用内边距工具类调整内部间距。') },
          { type: 'preview', styleName: 'radix-nova', name: 'card-image', description: translated('Add an image to the card for visual context.', '为卡片添加图像以提供视觉上下文。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'card-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  carousel: {
    name: 'Carousel',
    slug: 'carousel',
    description: translated('A carousel component with motion and swipe support.', '支持手势滑动与动画效果的轮播组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/carousel.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/carousel',
    installCommand: 'npx shadcn@latest add carousel',
    manualDependencies: ['embla-carousel-react'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'carousel-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add carousel' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  Carousel,\n  CarouselContent,\n  CarouselItem,\n  CarouselNext,\n  CarouselPrevious,\n} from "@/components/ui/carousel"' },
          { type: 'code', language: 'tsx', code: '<Carousel>\n  <CarouselContent>\n    <CarouselItem>...</CarouselItem>\n    <CarouselItem>...</CarouselItem>\n  </CarouselContent>\n  <CarouselPrevious />\n  <CarouselNext />\n</Carousel>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'carousel-sizes', description: translated('Use the `size` prop to change carousel dimensions.', '使用 `size` prop 改变轮播尺寸。') },
          { type: 'preview', styleName: 'radix-nova', name: 'carousel-spacing', description: translated('Adjust spacing between carousel items.', '调整轮播项之间的间距。') },
          { type: 'preview', styleName: 'radix-nova', name: 'carousel-orientation', description: translated('Use `orientation="vertical"` for a vertical carousel.', '使用 `orientation="vertical"` 实现纵向轮播。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'carousel-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  chart: {
    name: 'Chart',
    slug: 'chart',
    description: translated('Beautiful charts built using Recharts.', '使用 Recharts 构建的美观图表组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/chart.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/chart',
    installCommand: 'npx shadcn@latest add chart',
    manualDependencies: ['recharts'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'chart-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add chart' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { ChartContainer, ChartTooltip } from "@/components/ui/chart"' }
        ]
      }
    ]
  },
  checkbox: {
    name: 'Checkbox',
    slug: 'checkbox',
    description: translated('A control that allows the user to toggle between checked and unchecked states.', '允许用户在选中和未选中状态之间切换的控制组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/checkbox.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/checkbox',
    installCommand: 'npx shadcn@latest add checkbox',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'checkbox-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add checkbox' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { Checkbox } from "@/components/ui/checkbox"' },
          { type: 'code', language: 'tsx', code: '<div className="flex items-center space-x-2">\n  <Checkbox id="terms" />\n  <label htmlFor="terms">Accept terms and conditions</label>\n</div>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'checkbox-description', description: translated('Add a description below the checkbox label.', '在复选框标签下方添加描述文本。') },
          { type: 'preview', styleName: 'radix-nova', name: 'checkbox-disabled', description: translated('A disabled checkbox prevents user interaction.', '禁用的复选框阻止用户交互。') },
          { type: 'preview', styleName: 'radix-nova', name: 'checkbox-group', description: translated('Group multiple checkboxes together.', '将多个复选框组合在一起。') },
          { type: 'preview', styleName: 'radix-nova', name: 'checkbox-table', description: translated('Use checkboxes inside a table for row selection.', '在表格中使用复选框进行行选择。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'checkbox-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  collapsible: {
    name: 'Collapsible',
    slug: 'collapsible',
    description: translated('An interactive component which can be toggled between expanded and collapsed states.', '一个可在展开和折叠状态之间切换的交互式组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/collapsible.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/collapsible',
    installCommand: 'npx shadcn@latest add collapsible',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'collapsible-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add collapsible' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"' },
          { type: 'code', language: 'tsx', code: '<Collapsible>\n  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>\n  <CollapsibleContent>\n    Yes. Free for personal and commercial use. No attribution required.\n  </CollapsibleContent>\n</Collapsible>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'collapsible-settings-panel', description: translated('A settings panel with collapsible sections.', '带可折叠区域的设置面板。') },
          { type: 'preview', styleName: 'radix-nova', name: 'collapsible-file-tree', description: translated('A file tree using nested collapsible components.', '使用嵌套可折叠组件的文件树。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'collapsible-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  combobox: {
    name: 'Combobox',
    slug: 'combobox',
    description: translated('Autocomplete input and command selector.', '带有自动填充输入与命令选择器的组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/combobox.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/combobox',
    installCommand: 'npx shadcn@latest add combobox',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'combobox-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add combobox' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "@/components/ui/combobox"' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'combobox-multiple', description: translated('Allow selecting multiple values.', '允许选择多个值。') },
          { type: 'preview', styleName: 'radix-nova', name: 'combobox-clear-button', description: translated('Add a clear button to reset the selection.', '添加清除按钮以重置选择。') },
          { type: 'preview', styleName: 'radix-nova', name: 'combobox-groups', description: translated('Organize options into labeled groups.', '将选项组织到带标签的分组中。') },
          { type: 'preview', styleName: 'radix-nova', name: 'combobox-disabled', description: translated('Disable the combobox to prevent interaction.', '禁用组合框以阻止交互。') },
          { type: 'preview', styleName: 'radix-nova', name: 'combobox-popup', description: translated('Show the list as a popup overlay.', '以弹出覆盖层形式显示列表。') }
        ]
      }
    ]
  },
  command: {
    name: 'Command',
    slug: 'command',
    description: translated('A fast and extensible command menu.', '快速且可扩展的命令菜单组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/command.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/command',
    installCommand: 'npx shadcn@latest add command',
    manualDependencies: ['cmdk'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'command-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add command' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  Command,\n  CommandEmpty,\n  CommandGroup,\n  CommandInput,\n  CommandItem,\n  CommandList,\n  CommandSeparator,\n} from "@/components/ui/command"' },
          { type: 'code', language: 'tsx', code: '<Command>\n  <CommandInput placeholder="Type a command or search..." />\n  <CommandList>\n    <CommandEmpty>No results found.</CommandEmpty>\n    <CommandGroup heading="Suggestions">\n      <CommandItem>Calendar</CommandItem>\n      <CommandItem>Search Emoji</CommandItem>\n    </CommandGroup>\n  </CommandList>\n</Command>' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'command-shortcuts', description: translated('Display keyboard shortcuts alongside items.', '在项目旁显示键盘快捷键。') },
          { type: 'preview', styleName: 'radix-nova', name: 'command-groups', description: translated('Organize items into separated groups.', '将项目组织到分隔的分组中。') },
          { type: 'preview', styleName: 'radix-nova', name: 'command-scrollable', description: translated('Enable scrolling for long command lists.', '为长命令列表启用滚动。') }
        ]
      }
    ]
  },
  'context-menu': {
    name: 'Context Menu',
    slug: 'context-menu',
    description: translated('Displays a menu triggered by a right click.', '由右键点击触发的菜单组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/context-menu.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/context-menu',
    installCommand: 'npx shadcn@latest add context-menu',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'context-menu-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add context-menu' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  ContextMenu,\n  ContextMenuContent,\n  ContextMenuItem,\n  ContextMenuTrigger,\n} from "@/components/ui/context-menu"' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-submenu', description: translated('Nested submenus for hierarchical actions.', '嵌套子菜单，用于层级操作。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-shortcuts', description: translated('Display keyboard shortcuts in context menu items.', '在右键菜单项中显示键盘快捷键。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-groups', description: translated('Separate items into labeled groups.', '将项目分隔到带标签的分组中。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-icons', description: translated('Add icons to menu items for visual cues.', '为菜单项添加图标作为视觉提示。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-checkboxes', description: translated('Toggleable checkbox items in the menu.', '菜单中可切换的复选框项目。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-radio', description: translated('Radio group items for single selection.', '单选组项目，用于单项选择。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-destructive', description: translated('Destructive actions styled with danger colors.', '使用危险颜色样式的破坏性操作。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'context-menu-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  dialog: {
    name: 'Dialog',
    slug: 'dialog',
    description: translated(
      'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.',
      '覆盖在主窗口或另一个对话框窗口之上的窗口，并让下层内容不可交互。'
    ),
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/dialog.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/dialog',
    installCommand: 'npx shadcn@latest add dialog',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-demo',
            description: translated(
              'A dialog for editing profile details.',
              '用于编辑个人资料详情的对话框。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add dialog'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Dialog,\n  DialogContent,\n  DialogDescription,\n  DialogHeader,\n  DialogTitle,\n  DialogTrigger,\n} from "@/components/ui/dialog"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Dialog>\n  <DialogTrigger>Open</DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Are you absolutely sure?</DialogTitle>\n      <DialogDescription>\n        This action cannot be undone. This will permanently delete your account\n        and remove your data from our servers.\n      </DialogDescription>\n    </DialogHeader>\n  </DialogContent>\n</Dialog>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Dialog\n├── DialogTrigger\n└── DialogContent\n    ├── DialogHeader\n    │   ├── DialogTitle\n    │   └── DialogDescription\n    └── DialogFooter'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-close-button',
            description: translated(
              'Replace the default close control with your own button.',
              '用你自己的按钮替换默认关闭控件。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-no-close-button',
            description: translated(
              'Use showCloseButton={false} to hide the close button.',
              '使用 showCloseButton={false} 隐藏关闭按钮。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-sticky-footer',
            description: translated(
              'Keep actions visible while the content scrolls.',
              '内容滚动时保持操作按钮可见。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-scrollable-content',
            description: translated(
              'Long content can scroll while the header stays in view.',
              '长内容可以滚动，同时标题区域保持可见。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'dialog-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'link',
            label: translated('Radix UI Dialog API Reference', 'Radix UI Dialog API 参考'),
            href: 'https://www.radix-ui.com/docs/primitives/components/dialog#api-reference'
          }
        ]
      }
    ]
  },
  'data-table': {
    name: 'Data Table',
    slug: 'data-table',
    description: translated('A table component that supports sorting, filtering, and pagination.', '支持排序、过滤和分页的表格。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/data-table.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/data-table',
    installCommand: 'npm install @tanstack/react-table',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'data-table-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npm install @tanstack/react-table' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'paragraph', text: translated('Data Table is built using `@tanstack/react-table` combined with `<Table />` component.', 'Data Table 使用 `@tanstack/react-table` 配合 `<Table />` 组件构建。') }
        ]
      }
    ]
  },
  'date-picker': {
    name: 'Date Picker',
    slug: 'date-picker',
    description: translated('A date picker selector that allows selection of single or range dates.', '允许选择单个或范围日期的选择器。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/date-picker.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/date-picker',
    installCommand: 'npx shadcn@latest add popover calendar',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'date-picker-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add popover calendar' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'paragraph', text: translated('Date Picker is built combining `<Popover />` and `<Calendar />` components.', 'Date Picker 是组合 `<Popover />` 和 `<Calendar />` 组件构建的。') }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'date-picker-range', description: translated('Select a date range using two calendars.', '使用两个日历选择日期范围。') },
          { type: 'preview', styleName: 'radix-nova', name: 'date-picker-date-of-birth', description: translated('A date picker optimized for selecting birth dates.', '优化用于选择出生日期的日期选择器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'date-picker-input', description: translated('Open the picker from an input field.', '从输入框打开日期选择器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'date-picker-time', description: translated('Combine date and time selection.', '结合日期和时间选择。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'date-picker-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  direction: {
    name: 'Direction',
    slug: 'direction',
    description: translated('A wrapper that provides LTR/RTL direction support to children.', '为子组件提供文本方向切换支持的包装器。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/direction.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/direction',
    installCommand: 'npm install radix-ui',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'direction-demo' }]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { DirectionProvider } from "radix-ui"' }
        ]
      }
    ]
  },
  drawer: {
    name: 'Drawer',
    slug: 'drawer',
    description: translated('A drawer component that slides in from the edge of the screen.', '从屏幕边缘滑出的抽屉组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/drawer.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/drawer',
    installCommand: 'npx shadcn@latest add drawer',
    manualDependencies: ['vaul'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'drawer-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add drawer' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  Drawer,\n  DrawerClose,\n  DrawerContent,\n  DrawerDescription,\n  DrawerFooter,\n  DrawerHeader,\n  DrawerTitle,\n  DrawerTrigger,\n} from "@/components/ui/drawer"' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'drawer-scrollable', description: translated('A drawer with scrollable content.', '带可滚动内容的抽屉。') },
          { type: 'preview', styleName: 'radix-nova', name: 'drawer-directions', description: translated('Open the drawer from top, bottom, left, or right.', '从顶部、底部、左侧或右侧打开抽屉。') },
          { type: 'preview', styleName: 'radix-nova', name: 'drawer-responsive-dialog', description: translated('A responsive drawer that becomes a dialog on desktop.', '在桌面端变为对话框的响应式抽屉。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'drawer-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  'dropdown-menu': {
    name: 'Dropdown Menu',
    slug: 'dropdown-menu',
    description: translated('Displays a menu to the user, triggered by a button click.', '由按钮点击触发的下拉菜单。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/dropdown-menu.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/dropdown-menu',
    installCommand: 'npx shadcn@latest add dropdown-menu',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add dropdown-menu' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuLabel,\n  DropdownMenuSeparator,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu"' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-submenu', description: translated('Nested submenus for hierarchical actions.', '嵌套子菜单，用于层级操作。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-shortcuts', description: translated('Display keyboard shortcuts alongside menu items.', '在菜单项旁显示键盘快捷键。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-icons', description: translated('Add icons to menu items for visual scanning.', '为菜单项添加图标以便视觉扫描。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-checkboxes', description: translated('Toggleable checkbox items in the dropdown.', '下拉菜单中可切换的复选框项目。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-radio-group', description: translated('Radio group items for single selection.', '单选组项目，用于单项选择。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-destructive', description: translated('Destructive actions styled with danger colors.', '使用危险颜色样式的破坏性操作。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-avatar', description: translated('Use an avatar as the dropdown trigger.', '使用头像作为下拉菜单触发器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-complex', description: translated('A comprehensive dropdown with icons, shortcuts, and submenus.', '包含图标、快捷键和子菜单的综合下拉菜单。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'dropdown-menu-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  empty: {
    name: 'Empty',
    slug: 'empty',
    description: translated('Use the Empty component to display an empty state.', '使用 Empty 组件来展示空状态。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/empty.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/empty',
    installCommand: 'npx shadcn@latest add empty',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-demo',
            description: translated(
              'A centered empty state with title, description, and actions.',
              '居中展示标题、描述和操作按钮的空状态。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add empty' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Empty,\n  EmptyContent,\n  EmptyDescription,\n  EmptyHeader,\n  EmptyMedia,\n  EmptyTitle,\n} from "@/components/ui/empty"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Empty>\n  <EmptyHeader>\n    <EmptyMedia variant="icon">\n      <Icon />\n    </EmptyMedia>\n    <EmptyTitle>No data</EmptyTitle>\n    <EmptyDescription>No data found</EmptyDescription>\n  </EmptyHeader>\n  <EmptyContent>\n    <Button>Add data</Button>\n  </EmptyContent>\n</Empty>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Empty\n├── EmptyHeader\n│   ├── EmptyMedia\n│   ├── EmptyTitle\n│   └── EmptyDescription\n└── EmptyContent'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-outline',
            description: translated(
              'Use the `border` utility class to create an outline empty state.',
              '使用 `border` 工具类创建带描边的空状态。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-background',
            description: translated(
              'Use `bg-*` and `bg-gradient-*` utilities to add a background.',
              '使用 `bg-*` 和 `bg-gradient-*` 工具类添加背景。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-avatar',
            description: translated(
              'Use `EmptyMedia` to display an avatar in the empty state.',
              '使用 `EmptyMedia` 在空状态中显示头像。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-avatar-group',
            description: translated(
              'Use `EmptyMedia` to display an avatar group in the empty state.',
              '使用 `EmptyMedia` 在空状态中显示头像组。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'empty-input-group',
            description: translated(
              'Add an `InputGroup` component to the `EmptyContent`.',
              '在 `EmptyContent` 中添加 `InputGroup` 组件。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'empty-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  field: {
    name: 'Field',
    slug: 'field',
    description: translated(
      'Combine labels, controls, and help text to compose accessible form fields and grouped inputs.',
      '组合标签、控件和辅助文本，以构建可访问的表单字段与分组输入。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/field.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/field',
    installCommand: 'npx shadcn@latest add field',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'field-demo',
            description: translated(
              'A grouped payment field set with labels, descriptions, and actions.',
              '包含标签、描述和操作按钮的支付信息字段组。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add field' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Field,\n  FieldContent,\n  FieldDescription,\n  FieldError,\n  FieldGroup,\n  FieldLabel,\n  FieldLegend,\n  FieldSeparator,\n  FieldSet,\n  FieldTitle,\n} from "@/components/ui/field"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<FieldSet>\n  <FieldLegend>Profile</FieldLegend>\n  <FieldDescription>This appears on invoices and emails.</FieldDescription>\n  <FieldGroup>\n    <Field>\n      <FieldLabel htmlFor="name">Full name</FieldLabel>\n      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />\n      <FieldDescription>This appears on invoices and emails.</FieldDescription>\n    </Field>\n  </FieldGroup>\n</FieldSet>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'FieldSet\n├── FieldLegend\n├── FieldDescription\n└── FieldGroup\n    └── Field\n        ├── FieldLabel\n        ├── Control\n        ├── FieldDescription\n        └── FieldError'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'field-grouped',
            description: translated(
              'Use `FieldGroup` and `FieldSeparator` to compose multi-step forms.',
              '使用 `FieldGroup` 和 `FieldSeparator` 组织多段式表单。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'field-input', description: translated('A standard input field with label and description.', '带标签和描述的标准输入字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-textarea', description: translated('A textarea field with label and description.', '带标签和描述的文本区域字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-select', description: translated('A select field with label and description.', '带标签和描述的选择字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-checkbox', description: translated('A checkbox field with label and description.', '带标签和描述的复选框字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-switch', description: translated('A switch field with label and description.', '带标签和描述的开关字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-choice-card', description: translated('A choice card field for option selection.', '用于选项选择的卡片字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-fieldset', description: translated('A fieldset with multiple grouped fields.', '包含多个分组字段的字段集。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'field-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  'hover-card': {
    name: 'Hover Card',
    slug: 'hover-card',
    description: translated(
      'For sighted users to preview content available behind a link.',
      '让可见光标用户在链接背后快速预览内容。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/hover-card.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/hover-card',
    installCommand: 'npx shadcn@latest add hover-card',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'hover-card-demo',
            description: translated(
              'A basic hover card preview triggered from a simple button.',
              '由简单按钮触发的基础 Hover Card 预览。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add hover-card' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  HoverCard,\n  HoverCardContent,\n  HoverCardTrigger,\n} from "@/components/ui/hover-card"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<HoverCard>\n  <HoverCardTrigger>Hover</HoverCardTrigger>\n  <HoverCardContent>\n    The React Framework – created and maintained by @vercel.\n  </HoverCardContent>\n</HoverCard>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'HoverCard\n├── HoverCardTrigger\n└── HoverCardContent'
          }
        ]
      },
      {
        title: translated('Trigger Delays', '触发延迟'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'Use `openDelay` and `closeDelay` on the `HoverCard` to control when the card opens and closes.',
              '在 `HoverCard` 上使用 `openDelay` 和 `closeDelay` 来控制卡片的打开和关闭时机。'
            )
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<HoverCard openDelay={100} closeDelay={200}>\n  <HoverCardTrigger>Hover</HoverCardTrigger>\n  <HoverCardContent>Content</HoverCardContent>\n</HoverCard>'
          }
        ]
      },
      {
        title: translated('Positioning', '定位'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'Use the `side` and `align` props on `HoverCardContent` to control placement.',
              '使用 `HoverCardContent` 上的 `side` 和 `align` 属性来控制位置。'
            )
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<HoverCard>\n  <HoverCardTrigger>Hover</HoverCardTrigger>\n  <HoverCardContent side="top" align="start">\n    Content\n  </HoverCardContent>\n</HoverCard>'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'hover-card-delay',
            description: translated(
              'Use `openDelay` and `closeDelay` to control the hover delay.',
              '使用 `openDelay` 和 `closeDelay` 属性来控制悬停卡片的打开和关闭延迟。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'hover-card-sides',
            description: translated(
              'Preview the `left`, `top`, `bottom`, and `right` side placements.',
              '预览 `left`、`top`、`bottom` 和 `right` 四种停靠位置。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'hover-card-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  input: {
    name: 'Input',
    slug: 'input',
    description: translated(
      'A text input component for forms and user data entry with built-in styling and accessibility features.',
      '用于表单和用户数据录入的文本输入组件，内置样式与可访问性支持。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/input.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/input',
    installCommand: 'npx shadcn@latest add input',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'input-demo',
            description: translated(
              'A labeled input with helper description and action.',
              '带标签、辅助描述和操作按钮的输入框。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add input' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          { type: 'code', language: 'tsx', code: 'import { Input } from "@/components/ui/input"' },
          { type: 'code', language: 'tsx', code: '<Input />' }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'input-field', description: translated('Use `Field`, `FieldLabel`, and `FieldDescription` to compose a complete field.', '使用 `Field`、`FieldLabel` 和 `FieldDescription` 组合完整字段。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-disabled', description: translated('A disabled input keeps layout and semantics while blocking edits.', '禁用输入框在保留布局与语义的同时阻止编辑。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-invalid', description: translated('Show an invalid state with error styling.', '使用错误样式显示无效状态。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-file', description: translated('A file input styled consistently with the design system.', '与设计系统风格统一的文件输入。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-inline', description: translated('Inline inputs for seamless text editing.', '用于无缝文本编辑的行内输入。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-required', description: translated('Mark inputs as required with visual indicators.', '用视觉指示器标记必填输入。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-form', description: translated('A complete form with multiple input fields.', '包含多个输入字段的完整表单。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  'input-group': {
    name: 'Input Group',
    slug: 'input-group',
    description: translated('Add addons, buttons, and helper content to inputs.', '为输入框添加附加内容、按钮和辅助信息。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/input-group.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/input-group',
    installCommand: 'npx shadcn@latest add input-group',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'input-group-demo',
            description: translated(
              'A compact search input with inline addon.',
              '带行内附加区域的紧凑搜索输入框。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add input-group' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  InputGroup,\n  InputGroupAddon,\n  InputGroupButton,\n  InputGroupInput,\n  InputGroupText,\n  InputGroupTextarea,\n} from "@/components/ui/input-group"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<InputGroup>\n  <InputGroupInput placeholder="Search..." />\n  <InputGroupAddon>\n    <SearchIcon />\n  </InputGroupAddon>\n</InputGroup>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'InputGroup\n├── InputGroupInput or InputGroupTextarea\n├── InputGroupAddon\n├── InputGroupButton\n└── InputGroupText'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-button', description: translated('Mix button addons with text inputs for inline actions.', '把按钮型附加区域和文本输入组合在一起实现行内操作。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-textarea', description: translated('Use block-end addon positioning for textarea metadata.', '为 textarea 元信息使用 block-end 形式的附加区域。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-icon', description: translated('Add an icon to the input group for visual cues.', '为输入组添加图标作为视觉提示。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-spinner', description: translated('Add a loading spinner to the input group.', '为输入组添加加载旋转器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-kbd', description: translated('Display keyboard shortcuts inside the input group.', '在输入组中显示键盘快捷键。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-group-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  'input-otp': {
    name: 'Input OTP',
    slug: 'input-otp',
    description: translated(
      'Accessible one-time password component with copy-paste functionality.',
      '支持复制粘贴的一次性密码输入组件，并具备可访问性。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/input-otp.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/input-otp',
    installCommand: 'npx shadcn@latest add input-otp',
    manualDependencies: ['input-otp'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'input-otp-demo',
            description: translated(
              'A six-digit verification input with grouped slots.',
              '带分组槽位的六位验证码输入。'
            )
          }
        ]
      },
      {
        title: translated('About', '关于'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'Input OTP is built on top of `input-otp` by `@guilherme_rodz`.',
              'Input OTP 构建在 `input-otp` 之上，作者为 `@guilherme_rodz`。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add input-otp' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  InputOTP,\n  InputOTPGroup,\n  InputOTPSeparator,\n  InputOTPSlot,\n} from "@/components/ui/input-otp"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<InputOTP maxLength={6}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    <InputOTPSlot index={1} />\n    <InputOTPSlot index={2} />\n  </InputOTPGroup>\n  <InputOTPSeparator />\n  <InputOTPGroup>\n    <InputOTPSlot index={3} />\n    <InputOTPSlot index={4} />\n    <InputOTPSlot index={5} />\n  </InputOTPGroup>\n</InputOTP>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'InputOTP\n├── InputOTPGroup\n│   ├── InputOTPSlot\n│   ├── InputOTPSlot\n│   └── InputOTPSlot\n├── InputOTPSeparator\n└── InputOTPGroup\n    ├── InputOTPSlot\n    ├── InputOTPSlot\n    └── InputOTPSlot'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-separator', description: translated('Add separators between groups to reflect real verification code patterns.', '在分组之间加入分隔符，贴近真实验证码模式。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-disabled', description: translated('A disabled OTP input prevents user interaction.', '禁用的 OTP 输入阻止用户交互。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-controlled', description: translated('Control the OTP value programmatically.', '以编程方式控制 OTP 值。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-invalid', description: translated('Show an invalid state for the OTP input.', '显示 OTP 输入的无效状态。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-four-digits', description: translated('A four-digit OTP input for shorter codes.', '用于短验证码的四位 OTP 输入。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-form', description: translated('An OTP input inside a complete form.', '完整表单中的 OTP 输入。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'input-otp-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  item: {
    name: 'Item',
    slug: 'item',
    description: translated(
      'A versatile component for displaying content with media, title, description, and actions.',
      '用于展示媒体、标题、描述和操作区域的通用条目组件。'
    ),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/item.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/item',
    installCommand: 'npx shadcn@latest add item',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'item-demo',
            description: translated(
              'A flexible item row with media, content, and trailing action.',
              '包含媒体、内容区和尾部操作的灵活条目行。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          { type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add item' }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Item,\n  ItemActions,\n  ItemContent,\n  ItemDescription,\n  ItemMedia,\n  ItemTitle,\n} from "@/components/ui/item"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Item>\n  <ItemMedia variant="icon">\n    <Icon />\n  </ItemMedia>\n  <ItemContent>\n    <ItemTitle>Title</ItemTitle>\n    <ItemDescription>Description</ItemDescription>\n  </ItemContent>\n  <ItemActions>\n    <Button>Action</Button>\n  </ItemActions>\n</Item>'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'item-icon', description: translated('Use icon media and compact actions for status lists.', '在状态列表中使用图标媒体和紧凑操作。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-actions', description: translated('Group multiple action buttons on the trailing edge.', '在尾部区域组合多个操作按钮。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-avatar', description: translated('Use avatar media for user-related items.', '为与用户相关的条目使用头像媒体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-image', description: translated('Use image media for visual item previews.', '使用图像媒体进行可视化条目预览。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-group', description: translated('Group multiple items together in a container.', '将多个条目分组放在容器中。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-dropdown', description: translated('Add a dropdown menu to item actions.', '在条目操作中添加下拉菜单。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'item-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  kbd: {
    name: 'Kbd',
    slug: 'kbd',
    description: translated('A keyboard key component for displaying shortcuts.', '用于显示快捷键的键盘按键组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/kbd.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/kbd',
    installCommand: 'npx shadcn@latest add kbd',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'kbd-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add kbd' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Kbd } from "@/components/ui/kbd"' }, { type: 'code', language: 'tsx', code: '<Kbd>⌘</Kbd> + <Kbd>K</Kbd>' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'kbd-group', description: translated('Combine multiple Kbd components for complex shortcuts.', '组合多个 Kbd 组件显示复杂快捷键。') },
          { type: 'preview', styleName: 'radix-nova', name: 'kbd-button', description: translated('Use Kbd inside a Button component.', '在 Button 组件中使用 Kbd。') },
          { type: 'preview', styleName: 'radix-nova', name: 'kbd-input-group', description: translated('Use Kbd inside an InputGroup for search hints.', '在 InputGroup 中使用 Kbd 作为搜索提示。') }
        ]
      }
    ]
  },
  label: {
    name: 'Label',
    slug: 'label',
    description: translated('Renders an accessible label associated with a form control.', '渲染与表单控件关联的可访问标签。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/label.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/label',
    installCommand: 'npx shadcn@latest add label',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'label-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add label' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Label } from "@/components/ui/label"' }, { type: 'code', language: 'tsx', code: '<Label htmlFor="email">Your email address</Label>' }] }
    ]
  },
  menubar: {
    name: 'Menubar',
    slug: 'menubar',
    description: translated('A menubar component for document-centric applications.', '用于文档中心型应用的菜单栏组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/menubar.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/menubar',
    installCommand: 'npx shadcn@latest add menubar',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'menubar-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add menubar' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'menubar-checkbox', description: translated('Use menu checkbox items for toggleable options.', '使用菜单复选框项目实现可切换选项。') },
          { type: 'preview', styleName: 'radix-nova', name: 'menubar-radio', description: translated('Use menu radio items for single selection.', '使用菜单单选项目实现单项选择。') },
          { type: 'preview', styleName: 'radix-nova', name: 'menubar-submenu', description: translated('Use nested submenus for hierarchical navigation.', '使用嵌套子菜单实现层级导航。') },
          { type: 'preview', styleName: 'radix-nova', name: 'menubar-icons', description: translated('Add icons to menu items for visual scanning.', '为菜单项添加图标以便视觉扫描。') }
        ]
      }
    ]
  },
  'native-select': {
    name: 'Native Select',
    slug: 'native-select',
    description: translated('A styled native HTML select element.', '带样式的原生 HTML select 元素。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/native-select.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/native-select',
    installCommand: 'npx shadcn@latest add native-select',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'native-select-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add native-select' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { NativeSelect } from "@/components/ui/native-select"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'native-select-groups', description: translated('Use optgroup to group related options.', '使用 optgroup 对相关选项进行分组。') },
          { type: 'preview', styleName: 'radix-nova', name: 'native-select-disabled', description: translated('A disabled select prevents user interaction.', '禁用的选择框阻止用户交互。') },
          { type: 'preview', styleName: 'radix-nova', name: 'native-select-invalid', description: translated('Show an invalid state with error styling.', '使用错误样式显示无效状态。') }
        ]
      }
    ]
  },
  'navigation-menu': {
    name: 'Navigation Menu',
    slug: 'navigation-menu',
    description: translated('A navigation menu for site-wide navigation.', '站点级导航的导航菜单组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/navigation-menu.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/navigation-menu',
    installCommand: 'npx shadcn@latest add navigation-menu',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'navigation-menu-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add navigation-menu' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"' }] }
    ]
  },
  pagination: {
    name: 'Pagination',
    slug: 'pagination',
    description: translated('A pagination component for navigating between pages.', '用于页面间导航的分页组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/pagination.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/pagination',
    installCommand: 'npx shadcn@latest add pagination',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'pagination-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add pagination' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'pagination-simple', description: translated('A simple pagination with page numbers.', '带页码的简单分页。') },
          { type: 'preview', styleName: 'radix-nova', name: 'pagination-icons-only', description: translated('Icons-only pagination for compact layouts.', '紧凑布局的纯图标分页。') }
        ]
      }
    ]
  },
  popover: {
    name: 'Popover',
    slug: 'popover',
    description: translated('A popover component for displaying rich content in a portal.', '用于在门户中显示丰富内容的弹出框组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/popover.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/popover',
    installCommand: 'npx shadcn@latest add popover',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'popover-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add popover' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'popover-align', description: translated('Control popover alignment with the align prop.', '使用 align 属性控制弹出框对齐方式。') },
          { type: 'preview', styleName: 'radix-nova', name: 'popover-with-form', description: translated('Use a popover to contain a form.', '使用弹出框包含表单。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'popover-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  progress: {
    name: 'Progress',
    slug: 'progress',
    description: translated('A progress bar component for displaying completion status.', '显示完成状态的进度条组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/progress.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/progress',
    installCommand: 'npx shadcn@latest add progress',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'progress-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add progress' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Progress } from "@/components/ui/progress"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'progress-label', description: translated('Use a Field component to add a label to the progress bar.', '使用 Field 组件为进度条添加标签。') },
          { type: 'preview', styleName: 'radix-nova', name: 'progress-controlled', description: translated('A progress bar controlled by external state.', '由外部状态控制的进度条。') }
        ]
      }
    ]
  },
  table: {
    name: 'Table',
    slug: 'table',
    description: translated('A responsive table component.', '响应式表格组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/table.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/table',
    installCommand: 'npx shadcn@latest add table',
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'table-demo' }]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add table'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'code',
            language: 'tsx',
            code: 'import {\n  Table,\n  TableBody,\n  TableCaption,\n  TableCell,\n  TableHead,\n  TableHeader,\n  TableRow,\n} from "@/components/ui/table"'
          },
          {
            type: 'code',
            language: 'tsx',
            code: '<Table>\n  <TableCaption>A list of your recent invoices.</TableCaption>\n  <TableHeader>\n    <TableRow>\n      <TableHead className="w-[100px]">Invoice</TableHead>\n      <TableHead>Status</TableHead>\n      <TableHead>Method</TableHead>\n      <TableHead className="text-right">Amount</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell className="font-medium">INV001</TableCell>\n      <TableCell>Paid</TableCell>\n      <TableCell>Credit Card</TableCell>\n      <TableCell className="text-right">$250.00</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'Table\n├── TableCaption\n├── TableHeader\n│   └── TableRow\n│       ├── TableHead\n│       ├── TableHead\n│       ├── TableHead\n│       └── TableHead\n├── TableBody\n│   ├── TableRow\n│   │   ├── TableCell\n│   │   ├── TableCell\n│   │   ├── TableCell\n│   │   └── TableCell\n│   └── TableRow\n│       ├── TableCell\n│       ├── TableCell\n│       ├── TableCell\n│       └── TableCell\n└── TableFooter'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'table-footer',
            description: translated(
              'Use the TableFooter component to add a footer to the table.',
              '使用 TableFooter 组件为表格添加页脚。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'table-actions',
            description: translated(
              'A table showing actions for each row using a DropdownMenu component.',
              '使用 DropdownMenu 组件展示每行操作的表格。'
            )
          }
        ]
      },
      {
        title: translated('Data Table', '数据表格'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'You can use the Table component to build more complex data tables. Combine it with @tanstack/react-table to create tables with sorting, filtering and pagination.',
              '你可以使用 Table 组件构建更复杂的数据表格。结合 @tanstack/react-table 可以实现排序、筛选和分页。'
            )
          },
          {
            type: 'link',
            label: translated('Data Table documentation', 'Data Table 文档'),
            href: 'https://ui.shadcn.com/docs/components/data-table'
          },
          {
            type: 'link',
            label: translated('Tasks example', 'Tasks 示例'),
            href: 'https://ui.shadcn.com/examples/tasks'
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the RTL configuration guide.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'table-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  'radio-group': {
    name: 'Radio Group',
    slug: 'radio-group',
    description: translated('A set of checkable buttons known as radio buttons.', '一组可选的单选按钮。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/radio-group.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radio-group',
    installCommand: 'npx shadcn@latest add radio-group',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'radio-group-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add radio-group' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'radio-group-description', description: translated('Add a description to radio items.', '为单选项添加描述。') },
          { type: 'preview', styleName: 'radix-nova', name: 'radio-group-choice-card', description: translated('Use cards for radio selection.', '使用卡片形式进行单选。') },
          { type: 'preview', styleName: 'radix-nova', name: 'radio-group-disabled', description: translated('Disabled radio items prevent selection.', '禁用的单选项目阻止选择。') }
        ]
      }
    ]
  },
  resizable: {
    name: 'Resizable',
    slug: 'resizable',
    description: translated('A resizable panel component for split layouts.', '用于分栏布局的可调整大小面板组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/resizable.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/resizable',
    installCommand: 'npx shadcn@latest add resizable',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'resizable-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add resizable' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Resizable, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'resizable-vertical', description: translated('Vertical orientation for top/bottom panels.', '顶部/底部面板的纵向方向。') },
          { type: 'preview', styleName: 'radix-nova', name: 'resizable-handle', description: translated('Customize the resize handle appearance.', '自定义调整手柄的外观。') }
        ]
      }
    ]
  },
  'scroll-area': {
    name: 'Scroll Area',
    slug: 'scroll-area',
    description: translated('A scrollable container with custom scrollbar styling.', '带自定义滚动条样式的可滚动容器。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/scroll-area.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/scroll-area',
    installCommand: 'npx shadcn@latest add scroll-area',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'scroll-area-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add scroll-area' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { ScrollArea } from "@/components/ui/scroll-area"' }] }
    ]
  },
  select: {
    name: 'Select',
    slug: 'select',
    description: translated('A select component for choosing from a list of options.', '从选项列表中选择的选择组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/select.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/select',
    installCommand: 'npx shadcn@latest add select',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'select-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add select' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'select-groups', description: translated('Use SelectGroup and SelectLabel to organize items.', '使用 SelectGroup 和 SelectLabel 组织项目。') },
          { type: 'preview', styleName: 'radix-nova', name: 'select-scrollable', description: translated('A select with many items that scrolls.', '包含许多可滚动项目的选择框。') },
          { type: 'preview', styleName: 'radix-nova', name: 'select-disabled', description: translated('A disabled select prevents interaction.', '禁用的选择框阻止交互。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'select-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  separator: {
    name: 'Separator',
    slug: 'separator',
    description: translated('A visual separator between sections of content.', '内容区域之间的视觉分隔线。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/separator.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/separator',
    installCommand: 'npx shadcn@latest add separator',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'separator-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add separator' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Separator } from "@/components/ui/separator"' }, { type: 'code', language: 'tsx', code: '<Separator />' }] }
    ]
  },
  sheet: {
    name: 'Sheet',
    slug: 'sheet',
    description: translated('A panel that slides in from the edge of the screen.', '从屏幕边缘滑入的面板。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/sheet.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/sheet',
    installCommand: 'npx shadcn@latest add sheet',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'sheet-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add sheet' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'sheet-side', description: translated('Open the sheet from different sides.', '从不同方向打开 Sheet。') },
          { type: 'preview', styleName: 'radix-nova', name: 'sheet-no-close-button', description: translated('Hide the default close button.', '隐藏默认的关闭按钮。') }
        ]
      }
    ]
  },
  skeleton: {
    name: 'Skeleton',
    slug: 'skeleton',
    description: translated('A placeholder loading state component.', '占位加载状态组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/skeleton.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/skeleton',
    installCommand: 'npx shadcn@latest add skeleton',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'skeleton-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add skeleton' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Skeleton } from "@/components/ui/skeleton"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'skeleton-avatar', description: translated('Skeleton for avatar placeholders.', '用于头像占位的骨架屏。') },
          { type: 'preview', styleName: 'radix-nova', name: 'skeleton-card', description: translated('Skeleton for card placeholders.', '用于卡片占位的骨架屏。') },
          { type: 'preview', styleName: 'radix-nova', name: 'skeleton-text', description: translated('Skeleton for text placeholder lines.', '用于文本占位行的骨架屏。') },
          { type: 'preview', styleName: 'radix-nova', name: 'skeleton-form', description: translated('Skeleton for form placeholders.', '用于表单占位的骨架屏。') }
        ]
      }
    ]
  },
  slider: {
    name: 'Slider',
    slug: 'slider',
    description: translated('A slider component for selecting a value from a range.', '从范围内选择值的滑块组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/slider.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/slider',
    installCommand: 'npx shadcn@latest add slider',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'slider-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add slider' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Slider } from "@/components/ui/slider"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'slider-range', description: translated('A range slider for selecting a min/max.', '用于选择最小/最大值的范围滑块。') },
          { type: 'preview', styleName: 'radix-nova', name: 'slider-vertical', description: translated('A vertical orientation slider.', '纵向滑块。') },
          { type: 'preview', styleName: 'radix-nova', name: 'slider-disabled', description: translated('A disabled slider prevents interaction.', '禁用的滑块阻止交互。') }
        ]
      }
    ]
  },
  sonner: {
    name: 'Sonner',
    slug: 'sonner',
    description: translated('A toast notification component built on sonner.', '基于 sonner 构建的 toast 通知组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/sonner.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/sonner',
    installCommand: 'npx shadcn@latest add sonner',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'sonner-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add sonner' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { toast } from "sonner"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'sonner-types', description: translated('Different toast variants.', '不同的 toast 变体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'sonner-position', description: translated('Control toast position on screen.', '控制 toast 在屏幕上的位置。') }
        ]
      }
    ]
  },
  spinner: {
    name: 'Spinner',
    slug: 'spinner',
    description: translated('A loading spinner component for async operations.', '用于异步操作的加载旋转器组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/spinner.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/spinner',
    installCommand: 'npx shadcn@latest add spinner',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'spinner-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add spinner' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Spinner } from "@/components/ui/spinner"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'spinner-size', description: translated('Different spinner sizes.', '不同尺寸的旋转器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'spinner-button', description: translated('Spinner inside a button for loading state.', '按钮中的旋转器用于加载状态。') },
          { type: 'preview', styleName: 'radix-nova', name: 'spinner-badge', description: translated('Spinner inside a badge.', '徽章中的旋转器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'spinner-input-group', description: translated('Spinner in an input group.', '输入组中的旋转器。') }
        ]
      }
    ]
  },
  switch: {
    name: 'Switch',
    slug: 'switch',
    description: translated('A toggle switch component for binary options.', '用于二元选项的切换开关组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/switch.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/switch',
    installCommand: 'npx shadcn@latest add switch',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'switch-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add switch' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Switch } from "@/components/ui/switch"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'switch-description', description: translated('Add a description to the switch.', '为开关添加描述。') },
          { type: 'preview', styleName: 'radix-nova', name: 'switch-disabled', description: translated('A disabled switch prevents toggling.', '禁用的开关阻止切换。') },
          { type: 'preview', styleName: 'radix-nova', name: 'switch-size', description: translated('Different switch size variants.', '不同尺寸的开关变体。') }
        ]
      }
    ]
  },
  sidebar: {
    name: 'Sidebar',
    slug: 'sidebar',
    description: translated(
      'A composable, themeable and customizable sidebar component. Supports collapsible, floating, and inset variants with full RTL support.',
      '可组合、可主题化、可定制的侧边栏组件。支持可折叠、浮动和内嵌三种变体，具备完整的 RTL 支持。'
    ),
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/sidebar.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/sidebar',
    installCommand: 'npx shadcn@latest add sidebar',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: translated('Preview', '预览'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-demo',
            description: translated(
              'A basic sidebar with navigation items, header and footer.',
              '包含导航项、页头和页脚的基础侧边栏。'
            )
          }
        ]
      },
      {
        title: translated('Installation', '安装'),
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: translated('Command', '命令'),
            code: 'npx shadcn@latest add sidebar'
          },
          {
            type: 'steps',
            items: [
              translated(
                'Install the following dependencies: npm install radix-ui',
                '安装以下依赖：npm install radix-ui'
              ),
              translated(
                'Copy and paste the component source into your project.',
                '将组件源码复制并粘贴到你的项目中。'
              ),
              translated(
                'Update the import paths to match your project setup.',
                '按你的项目配置更新 import 路径。'
              )
            ]
          }
        ]
      },
      {
        title: translated('Usage', '用法'),
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'Wrap your layout with `SidebarProvider` and use `<AppSidebar />` alongside your main content. The `SidebarTrigger` component toggles the sidebar open/closed.',
              '使用 `SidebarProvider` 包裹你的布局，将 `<AppSidebar />` 与主内容并列使用。`SidebarTrigger` 组件用于切换侧边栏的开合状态。'
            )
          },
          {
            type: 'code',
            language: 'tsx',
            title: translated('Layout Setup', '布局设置'),
            code: 'import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"\nimport { AppSidebar } from "@/components/app-sidebar"\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <SidebarProvider>\n      <AppSidebar />\n      <main>\n        <SidebarTrigger />\n        {children}\n      </main>\n    </SidebarProvider>\n  )\n}'
          },
          {
            type: 'code',
            language: 'tsx',
            title: translated('AppSidebar Component', 'AppSidebar 组件'),
            code: 'import {\n  Sidebar,\n  SidebarContent,\n  SidebarFooter,\n  SidebarGroup,\n  SidebarHeader,\n} from "@/components/ui/sidebar"\n\nexport function AppSidebar() {\n  return (\n    <Sidebar>\n      <SidebarHeader />\n      <SidebarContent>\n        <SidebarGroup />\n      </SidebarContent>\n      <SidebarFooter />\n    </Sidebar>\n  )\n}'
          }
        ]
      },
      {
        title: translated('Composition', '组成'),
        blocks: [
          {
            type: 'composition',
            code: 'SidebarProvider\n├── Sidebar\n│   ├── SidebarHeader\n│   │   └── SidebarMenu\n│   │       └── SidebarMenuItem\n│   │           └── SidebarMenuButton\n│   ├── SidebarContent\n│   │   └── SidebarGroup\n│   │       ├── SidebarGroupLabel\n│   │       ├── SidebarGroupAction\n│   │       ├── SidebarGroupContent\n│   │       └── SidebarMenu\n│   │           ├── SidebarMenuItem\n│   │           │   ├── SidebarMenuButton\n│   │           │   ├── SidebarMenuAction\n│   │           │   ├── SidebarMenuBadge\n│   │           │   └── SidebarMenuSub\n│   │           │       └── SidebarMenuSubItem\n│   │           │           └── SidebarMenuSubButton\n│   │           └── SidebarMenuSkeleton\n│   ├── SidebarFooter\n│   │   └── SidebarMenu\n│   │       └── SidebarMenuItem\n│   │           └── SidebarMenuButton\n│   └── SidebarRail\n├── SidebarInset\n└── SidebarTrigger'
          }
        ]
      },
      {
        title: translated('Examples', '示例'),
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-header',
            description: translated(
              'A sidebar header with a workspace switcher using DropdownMenu.',
              '带有工作空间切换器（使用 DropdownMenu）的侧边栏页头。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-footer',
            description: translated(
              'A sidebar footer with a user menu showing account info.',
              '展示用户信息菜单的侧边栏页脚。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-collapsible',
            description: translated(
              'Collapsible sidebar groups using the Collapsible component.',
              '使用 Collapsible 组件实现的可折叠侧边栏分组。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-inset',
            description: translated(
              'Use `variant="inset"` with `SidebarInset` to wrap main content.',
              '使用 `variant="inset"` 配合 `SidebarInset` 包裹主内容区域。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-floating',
            description: translated(
              'Use `variant="floating"` for a floating sidebar with rounded corners.',
              '使用 `variant="floating"` 获得带圆角的浮动侧边栏。'
            )
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'sidebar-icon',
            description: translated(
              'Use `collapsible="icon"` to collapse the sidebar to icons only.',
              '使用 `collapsible="icon"` 将侧边栏折叠为仅图标显示。'
            )
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: translated(
              'To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl). Use `dir="rtl"` and `side="right"` for RTL layouts.',
              '如需启用 shadcn/ui 的 RTL 支持，请查看 [RTL configuration guide](/docs/rtl)。使用 `dir="rtl"` 和 `side="right"` 实现 RTL 布局。'
            )
          },
          { type: 'preview', styleName: 'radix-nova', name: 'sidebar-rtl', direction: 'rtl' }
        ]
      },
      {
        title: translated('API Reference', 'API 参考'),
        blocks: [
          {
            type: 'callout',
            text: translated(
              'SidebarProvider handles collapsible state and provides sidebar context. Sidebar is the main collapsible panel.',
              'SidebarProvider 管理折叠状态并向子组件提供侧边栏上下文。Sidebar 是主折叠面板。'
            )
          },
          {
            type: 'table',
            columns: [
              translated('Prop', '属性'),
              translated('Type', '类型'),
              translated('Default', '默认值')
            ],
            rows: [
              ['side', '"left" | "right"', '"left"'],
              ['variant', '"sidebar" | "floating" | "inset"', '"sidebar"'],
              ['collapsible', '"offcanvas" | "icon" | "none"', '"offcanvas"'],
              ['defaultOpen', 'boolean', 'true'],
              ['open', 'boolean', '-'],
              ['onOpenChange', '(open: boolean) => void', '-']
            ]
          },
          {
            type: 'paragraph',
            text: translated(
              'The `useSidebar` hook returns `{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`. Keyboard shortcut: `⌘+B` (Mac) / `Ctrl+B` (Windows).',
              '`useSidebar` hook 返回 `{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`。键盘快捷键：`⌘+B` (Mac) / `Ctrl+B` (Windows)。'
            )
          }
        ]
      }
    ]
  },
  tabs: {
    name: 'Tabs',
    slug: 'tabs',
    description: translated('A set of layered sections of content, displayed one at a time.', '一组分层的内容区域，每次显示一个。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/tabs.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/tabs',
    installCommand: 'npx shadcn@latest add tabs',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'tabs-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add tabs' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'tabs-line', description: translated('Use variant="line" for a line style.', '使用 variant="line" 获得线条样式。') },
          { type: 'preview', styleName: 'radix-nova', name: 'tabs-vertical', description: translated('Use orientation="vertical" for vertical tabs.', '使用 orientation="vertical" 获得纵向标签。') },
          { type: 'preview', styleName: 'radix-nova', name: 'tabs-disabled', description: translated('Disable individual tab triggers.', '禁用单个标签触发器。') },
          { type: 'preview', styleName: 'radix-nova', name: 'tabs-icons', description: translated('Add icons to tab triggers.', '为标签触发器添加图标。') }
        ]
      }
    ]
  },
  textarea: {
    name: 'Textarea',
    slug: 'textarea',
    description: translated('A multi-line text input component.', '多行文本输入组件。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/textarea.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/textarea',
    installCommand: 'npx shadcn@latest add textarea',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'textarea-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add textarea' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Textarea } from "@/components/ui/textarea"' }, { type: 'code', language: 'tsx', code: '<Textarea />' }] }
    ]
  },
  toggle: {
    name: 'Toggle',
    slug: 'toggle',
    description: translated('A two-state button that can be either on or off.', '一种开关式按钮，可以处于开或关两种状态。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/toggle.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/toggle',
    installCommand: 'npx shadcn@latest add toggle',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'toggle-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add toggle' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Toggle } from "@/components/ui/toggle"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-outline', description: translated('Outline variant of the toggle.', '开关按钮的描边变体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-with-text', description: translated('Toggle with an icon and text.', '带图标和文本的开关按钮。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-size', description: translated('Different size variants.', '不同尺寸的变体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-disabled', description: translated('Disabled toggle prevents interaction.', '禁用的开关按钮阻止交互。') }
        ]
      }
    ]
  },
  'toggle-group': {
    name: 'Toggle Group',
    slug: 'toggle-group',
    description: translated('A group of toggle buttons where one or multiple can be pressed.', '一组开关按钮，可以按下其中一个或多个。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/toggle-group.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/toggle-group',
    installCommand: 'npx shadcn@latest add toggle-group',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'toggle-group-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add toggle-group' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-group-outline', description: translated('Outline variant of the toggle group.', '开关按钮组的描边变体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-group-size', description: translated('Different size variants.', '不同尺寸的变体。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-group-vertical', description: translated('Vertical orientation.', '纵向布局。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-group-disabled', description: translated('Disabled toggle group prevents interaction.', '禁用的开关按钮组阻止交互。') }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          { type: 'paragraph', text: translated('To enable RTL support in shadcn/ui, see the RTL configuration guide.', '如需启用 shadcn/ui 的 RTL 支持，请查看 RTL configuration guide。') },
          { type: 'preview', styleName: 'radix-nova', name: 'toggle-group-rtl', direction: 'rtl' }
        ]
      }
    ]
  },
  tooltip: {
    name: 'Tooltip',
    slug: 'tooltip',
    description: translated('A popup that displays information related to an element on hover or focus.', '悬停或聚焦时显示与元素相关信息的弹出框。'),
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/tooltip.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/tooltip',
    installCommand: 'npx shadcn@latest add tooltip',
    sections: [
      { title: translated('Preview', '预览'), blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'tooltip-demo' }] },
      { title: translated('Installation', '安装'), blocks: [{ type: 'code', language: 'bash', title: translated('Command', '命令'), code: 'npx shadcn@latest add tooltip' }] },
      { title: translated('Usage', '用法'), blocks: [{ type: 'code', language: 'tsx', code: 'import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"' }] },
      {
        title: translated('Examples', '示例'),
        blocks: [
          { type: 'preview', styleName: 'radix-nova', name: 'tooltip-side', description: translated('Control tooltip positioning with the side prop.', '使用 side 属性控制 tooltip 定位。') },
          { type: 'preview', styleName: 'radix-nova', name: 'tooltip-with-keyboard-shortcut', description: translated('Show a keyboard shortcut in the tooltip.', '在 tooltip 中显示键盘快捷键。') },
          { type: 'preview', styleName: 'radix-nova', name: 'tooltip-disabled-button', description: translated('Tooltip on a disabled button.', '禁用按钮上的 tooltip。') }
        ]
      }
    ]
  }
}
