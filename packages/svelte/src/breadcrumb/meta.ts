/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Breadcrumb',
  category: 'navigation',
  description:
    '面包屑导航，展示当前页面在层级结构中的位置。支持数据驱动 routes 与声明式 Item 两种用法。',
  props: [
    {
      name: 'routes',
      type: 'BreadcrumbRoute[]',
      default: '[]',
      desc: '数据驱动的路由项，最后一项为当前页（aria-current=page）',
    },
    { name: 'separator', type: 'string', default: "'/'", desc: '分隔符文本' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式 Item 列表' },
    {
      name: 'onClick',
      type: '(route: BreadcrumbRoute, index: number) => void',
      default: 'undefined',
    },
  ],
  subComponents: [
    {
      name: 'BreadcrumbItem',
      props: [
        { name: 'href', type: 'string', default: 'undefined' },
        { name: 'class', type: 'string', default: "''" },
        { name: 'children', type: 'Snippet', default: 'undefined' },
        { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined' },
      ],
    },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Enter', 'Space'],
    notes: [
      'nav[aria-label] 包裹 ol 有序列表',
      '最后一项 aria-current=page，不可点击',
      '无 href 的中间项用 role=link + tabindex=0 + 键盘可激活',
      '分隔符 aria-hidden=true',
    ],
  },
  tokens: ['--cd-breadcrumb-*', '--cd-focus-ring', '--cd-font-size-*', '--cd-radius-1'],
} as const;
