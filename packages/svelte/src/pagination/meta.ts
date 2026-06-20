/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Pagination',
  category: 'navigation',
  description:
    '分页器，用于切换大量数据的页码。支持 default 与 simple 两种模式，页码使用 Intl.NumberFormat 本地化。越界的当前页/每页条数与快速跳页输入均会被钳制到有效范围（纯函数实现，受控 prop 仅经 onChange 上报）。',
  props: [
    { name: 'total', type: 'number', default: '0', desc: '数据总条数' },
    { name: 'currentPage', type: 'number', default: 'undefined', desc: '受控当前页（越界自动钳制显示，不回写）' },
    { name: 'defaultCurrentPage', type: 'number', default: '1' },
    { name: 'pageSize', type: 'number', default: 'undefined', desc: '受控每页条数；非法或不在 pageSizeOptions 内时回退 defaultPageSize' },
    { name: 'defaultPageSize', type: 'number', default: '10', desc: '非受控每页条数初始值' },
    { name: 'pageSizeOptions', type: 'number[]', default: '[10,20,50,100]', desc: 'size changer 选项' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'mode', type: "'default'|'simple'", default: 'default' },
    { name: 'showTotal', type: 'boolean', default: 'false', desc: '显示总条数文案' },
    { name: 'showSizeChanger', type: 'boolean', default: 'false', desc: '显示每页条数选择器' },
    { name: 'showQuickJumper', type: 'boolean', default: 'false', desc: '显示快速跳页输入（越界静默钳制，非数字忽略）' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'locale', type: 'string', default: "'zh-CN'", desc: '数字本地化区域' },
    { name: 'onChange', type: '(page: number, pageSize: number) => void', default: 'undefined' },
    { name: 'onPageSizeChange', type: '(pageSize: number) => void', default: 'undefined' },
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
