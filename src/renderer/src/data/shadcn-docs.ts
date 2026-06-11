export type ShadcnComponent = {
  name: string
  slug: string
}

export type ShadcnDocBlock =
  | {
      type: 'paragraph'
      text: string
    }
  | {
      type: 'code'
      language: string
      title?: string
      code: string
    }
  | {
      type: 'preview'
      name: string
      styleName: string
      description?: string
      direction?: string
    }
  | {
      type: 'steps'
      items: string[]
    }
  | {
      type: 'composition'
      code: string
    }
  | {
      type: 'table'
      columns: string[]
      rows: string[][]
    }
  | {
      type: 'callout'
      text: string
    }
  | {
      type: 'link'
      label: string
      href: string
    }

export type ShadcnDocSection = {
  title: string
  blocks: ShadcnDocBlock[]
}

export type ShadcnComponentDoc = ShadcnComponent & {
  description: string
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
  'button',
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
  'tooltip'
])

export const shadcnDocsSource = {
  repository: 'shadcn-ui/ui',
  ref: '1994caba0b2140d4d5aa765bb9d7d4412d6aaabb',
  license: 'MIT',
  docsRoot: 'apps/v4/content/docs/components/radix'
}

export const mirroredShadcnDocs: Record<string, ShadcnComponentDoc> = {
  button: {
    name: 'Button',
    slug: 'button',
    description: 'Displays a button or a component that looks like a button.',
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/button.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/button',
    installCommand: 'npx shadcn@latest add button',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: 'Preview',
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'button-demo' }]
      },
      {
        title: 'Installation',
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: 'Command',
            code: 'npx shadcn@latest add button'
          },
          {
            type: 'steps',
            items: [
              'Install the following dependencies: npm install radix-ui',
              'Copy and paste the component source into your project.',
              'Update the import paths to match your project setup.'
            ]
          }
        ]
      },
      {
        title: 'Usage',
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
        title: 'Cursor',
        blocks: [
          {
            type: 'paragraph',
            text: 'Tailwind v4 switched from cursor: pointer to cursor: default for the button component. If you want to keep the cursor: pointer behavior, add the following CSS or enable it during setup with npx shadcn@latest init --pointer.'
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
        title: 'Examples',
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-size',
            description: 'Use the `size` prop to change the size of the button.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-default',
            description: 'Default'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-outline',
            description: 'Outline'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-secondary',
            description: 'Secondary'
          },
          { type: 'preview', styleName: 'radix-nova', name: 'button-ghost', description: 'Ghost' },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-destructive',
            description: 'Destructive'
          },
          { type: 'preview', styleName: 'radix-nova', name: 'button-link', description: 'Link' },
          { type: 'preview', styleName: 'radix-nova', name: 'button-icon', description: 'Icon' },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-with-icon',
            description:
              'Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the icon for the correct spacing.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-rounded',
            description: 'Use the `rounded-full` class to make the button rounded.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-spinner',
            description:
              'Render a `<Spinner />` component inside the button to show a loading state. Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the spinner for the correct spacing.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-group-demo',
            description:
              'To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/radix/button-group) documentation for more details.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'button-aschild',
            description:
              "You can use the `asChild` prop on `<Button />` to make another component look like a button. Here's an example of a link that looks like a button."
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: 'To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).'
          },
          { type: 'preview', styleName: 'radix-nova', name: 'button-rtl', direction: 'rtl' }
        ]
      },
      {
        title: 'API Reference',
        blocks: [
          {
            type: 'table',
            columns: ['Prop', 'Type', 'Default'],
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
  dialog: {
    name: 'Dialog',
    slug: 'dialog',
    description:
      'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.',
    featured: true,
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/dialog.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/dialog',
    installCommand: 'npx shadcn@latest add dialog',
    manualDependencies: ['radix-ui'],
    sections: [
      {
        title: 'Preview',
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-demo',
            description: 'A dialog for editing profile details.'
          }
        ]
      },
      {
        title: 'Installation',
        blocks: [
          {
            type: 'code',
            language: 'bash',
            title: 'Command',
            code: 'npx shadcn@latest add dialog'
          },
          {
            type: 'steps',
            items: [
              'Install the following dependencies: npm install radix-ui',
              'Copy and paste the component source into your project.',
              'Update the import paths to match your project setup.'
            ]
          }
        ]
      },
      {
        title: 'Usage',
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
        title: 'Composition',
        blocks: [
          {
            type: 'composition',
            code: 'Dialog\n├── DialogTrigger\n└── DialogContent\n    ├── DialogHeader\n    │   ├── DialogTitle\n    │   └── DialogDescription\n    └── DialogFooter'
          }
        ]
      },
      {
        title: 'Examples',
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-close-button',
            description: 'Replace the default close control with your own button.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-no-close-button',
            description: 'Use showCloseButton={false} to hide the close button.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-sticky-footer',
            description: 'Keep actions visible while the content scrolls.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'dialog-scrollable-content',
            description: 'Long content can scroll while the header stays in view.'
          }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: 'To enable RTL support in shadcn/ui, see the RTL configuration guide.'
          },
          { type: 'preview', styleName: 'radix-nova', name: 'dialog-rtl', direction: 'rtl' }
        ]
      },
      {
        title: 'API Reference',
        blocks: [
          {
            type: 'link',
            label: 'Radix UI Dialog API Reference',
            href: 'https://www.radix-ui.com/docs/primitives/components/dialog#api-reference'
          }
        ]
      }
    ]
  },
  table: {
    name: 'Table',
    slug: 'table',
    description: 'A responsive table component.',
    mirrored: true,
    sourcePath: 'apps/v4/content/docs/components/radix/table.mdx',
    officialUrl: 'https://ui.shadcn.com/docs/components/radix/table',
    installCommand: 'npx shadcn@latest add table',
    sections: [
      {
        title: 'Preview',
        blocks: [{ type: 'preview', styleName: 'radix-nova', name: 'table-demo' }]
      },
      {
        title: 'Installation',
        blocks: [
          { type: 'code', language: 'bash', title: 'Command', code: 'npx shadcn@latest add table' },
          {
            type: 'steps',
            items: [
              'Copy and paste the component source into your project.',
              'Update the import paths to match your project setup.'
            ]
          }
        ]
      },
      {
        title: 'Usage',
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
        title: 'Composition',
        blocks: [
          {
            type: 'composition',
            code: 'Table\n├── TableCaption\n├── TableHeader\n│   └── TableRow\n│       ├── TableHead\n│       ├── TableHead\n│       ├── TableHead\n│       └── TableHead\n├── TableBody\n│   ├── TableRow\n│   │   ├── TableCell\n│   │   ├── TableCell\n│   │   ├── TableCell\n│   │   └── TableCell\n│   └── TableRow\n│       ├── TableCell\n│       ├── TableCell\n│       ├── TableCell\n│       └── TableCell\n└── TableFooter'
          }
        ]
      },
      {
        title: 'Examples',
        blocks: [
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'table-footer',
            description: 'Use the TableFooter component to add a footer to the table.'
          },
          {
            type: 'preview',
            styleName: 'radix-nova',
            name: 'table-actions',
            description: 'A table showing actions for each row using a DropdownMenu component.'
          }
        ]
      },
      {
        title: 'Data Table',
        blocks: [
          {
            type: 'paragraph',
            text: 'You can use the Table component to build more complex data tables. Combine it with @tanstack/react-table to create tables with sorting, filtering and pagination.'
          },
          {
            type: 'link',
            label: 'Data Table documentation',
            href: 'https://ui.shadcn.com/docs/components/data-table'
          },
          { type: 'link', label: 'Tasks example', href: 'https://ui.shadcn.com/examples/tasks' }
        ]
      },
      {
        title: 'RTL',
        blocks: [
          {
            type: 'paragraph',
            text: 'To enable RTL support in shadcn/ui, see the RTL configuration guide.'
          },
          { type: 'preview', styleName: 'radix-nova', name: 'table-rtl', direction: 'rtl' }
        ]
      }
    ]
  }
}
