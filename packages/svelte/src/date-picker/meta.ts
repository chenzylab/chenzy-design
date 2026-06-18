/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'DatePicker',
  category: 'input',
  description:
    '日期选择器，单选 type=date 日历面板，受控/非受控；显示与星期/月份均经 Intl.DateTimeFormat 本地化。',
  props: [
    { name: 'value', type: 'Date | null', default: 'undefined' },
    { name: 'defaultValue', type: 'Date | null', default: 'null' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: "'请选择日期'" },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'status', type: "'default'|'warning'|'error'", default: "'default'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'true' },
    { name: 'disabledDate', type: '(date: Date) => boolean', default: 'undefined' },
    { name: 'weekStart', type: '0 | 1', default: '0' },
    { name: 'locale', type: 'string', default: "'zh-CN'" },
    { name: 'onChange', type: '(v: Date | null) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'dialog',
    notes: [
      '触发器 button aria-haspopup=dialog、aria-expanded、aria-controls 指向面板',
      '面板 role=dialog；日期网格 role=grid，单元格 role=gridcell + aria-selected',
      '触发器 Enter/Space/↓ 打开；面板内方向键移动高亮日、Enter 选中、Esc 关闭',
      'roving tabindex：仅高亮日可聚焦',
    ],
  },
  tokens: ['--cd-date-picker-*', '--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
