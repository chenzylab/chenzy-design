/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'RangePicker',
  category: 'input',
  description:
    '日期范围选择器，单面板序列选择（点起始→点结束，自动排序、hover 预览区间），受控/非受控；显示与星期/月份均经 Intl.DateTimeFormat 本地化。',
  props: [
    { name: 'value', type: '[Date|null, Date|null] | null', default: 'undefined' },
    { name: 'defaultValue', type: '[Date|null, Date|null] | null', default: 'null' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'startPlaceholder', type: 'string', default: "'开始日期'" },
    { name: 'endPlaceholder', type: 'string', default: "'结束日期'" },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'status', type: "'default'|'warning'|'error'", default: "'default'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'true' },
    { name: 'disabledDate', type: '(date: Date) => boolean', default: 'undefined' },
    { name: 'weekStart', type: '0 | 1', default: '0' },
    { name: 'locale', type: 'string', default: "'zh-CN'" },
    { name: 'onChange', type: '(v: [Date|null,Date|null] | null) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'dialog',
    notes: [
      '触发器 button aria-haspopup=dialog、aria-expanded、aria-controls 指向面板',
      '面板 role=dialog；日期网格 role=grid，单元格 role=gridcell + aria-selected（端点）',
      '第一次点击设起始、第二次设结束并自动排序；hover 实时预览区间',
      '触发器 Enter/Space/↓ 打开、Esc 关闭',
    ],
  },
  tokens: ['--cd-date-picker-*', '--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
