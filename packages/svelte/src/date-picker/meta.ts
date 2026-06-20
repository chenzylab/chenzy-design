/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'DatePicker',
  category: 'input',
  description:
    '日期选择器，type=date 日历面板 / type=dateTime 日期+时间（复用 TimePicker 时分秒列）/ type=month 月份面板 / type=year 年份面板，受控/非受控；显示与星期/月份/年份均经 Intl.DateTimeFormat 本地化。',
  props: [
    { name: 'type', type: "'date'|'dateTime'|'month'|'year'", default: "'date'" },
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
    { name: 'showSecond', type: 'boolean', default: 'true' },
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
      'type=dateTime：时/分/秒列 role=listbox + option，选日期不关面板，点确定关闭',
      'type=month：12 个月格，头部显示年份 + 左右切年；点月份选中并关闭',
      'type=year：一页 12 年（一十年 + 前后各 1 占位），头部显示十年范围 + 左右切十年；点年份选中并关闭',
    ],
  },
  tokens: ['--cd-date-picker-*', '--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
