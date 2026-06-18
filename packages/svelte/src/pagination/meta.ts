/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Pagination',
  category: 'navigation',
  description:
    '分页器，用于切换大量数据的页码。支持 default 与 simple 两种模式，页码使用 Intl.NumberFormat 本地化。',
  props: [
    { name: 'total', type: 'number', default: '0', desc: '数据总条数' },
    { name: 'currentPage', type: 'number', default: 'undefined', desc: '受控当前页' },
    { name: 'defaultCurrentPage', type: 'number', default: '1' },
    { name: 'pageSize', type: 'number', default: '10', desc: '每页条数（本轮固定，仅用于算页数）' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'mode', type: "'default'|'simple'", default: 'default' },
    { name: 'showTotal', type: 'boolean', default: 'false', desc: '显示总条数文案' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'locale', type: 'string', default: "'zh-CN'", desc: '数字本地化区域' },
    { name: 'onChange', type: '(page: number) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      'nav[aria-label] 包裹',
      '页码为原生 button，当前页 aria-current=page',
      '上一页/下一页在边界禁用',
      '省略号 aria-hidden=true 不可交互',
    ],
  },
  tokens: ['--cd-pagination-*', '--cd-focus-ring', '--cd-color-text-0', '--cd-spacing-*', '--cd-motion-*'],
} as const;
