/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'RangePicker',
  category: 'input',
  description:
    '日期范围选择器，双面板（两个月并排，右面板=左面板+1）序列选择（点起始→点结束，自动排序、起止可跨面板、hover 跨面板预览区间），受控/非受控；显示与星期/月份均经 Intl.DateTimeFormat 本地化。',
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
    { name: 'maxRange', type: 'number', default: 'undefined' },
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
      '面板 role=dialog；左右各一 role=grid（aria-label 为各自月份），单元格 role=gridcell + aria-selected（端点）',
      '双面板并排显示相邻两月：最左「上一月」、最右「下一月」整体翻页；第一次点击设起始、第二次设结束并自动排序，起止可跨面板；hover 跨面板实时预览区间',
      'maxRange：选定起始后，离起点超过 maxRange 天的日期 aria-disabled 置灰、点击/hover 无效（daysBetween 纯函数判定）',
      '触发器 Enter/Space/↓ 打开、Esc 关闭',
    ],
  },
  tokens: ['--cd-date-picker-*', '--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
