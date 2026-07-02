/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TimePicker',
  category: 'input',
  description:
    '时间选择器，单选 type=time，HH:mm:ss 三列滚动选择，受控/非受控；展示经 Intl.DateTimeFormat 本地化。支持 type=timeRange 范围选择、format 字符串控制列、value 字符串入参。',
  props: [
    {
      name: 'value',
      type: 'Date | string | [Date|string|null, Date|string|null] | null',
      default: 'undefined',
    },
    {
      name: 'defaultValue',
      type: 'Date | string | [Date|string|null, Date|string|null] | null',
      default: 'null',
    },
    { name: 'type', type: "'time'|'timeRange'", default: "'time'" },
    { name: 'range', type: 'boolean', default: 'false' },
    { name: 'format', type: 'string', default: 'undefined' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: "'请选择时间'" },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'status', type: "'default'|'warning'|'error'", default: "'default'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'true' },
    { name: 'hourStep', type: 'number', default: '1' },
    { name: 'minuteStep', type: 'number', default: '1' },
    { name: 'secondStep', type: 'number', default: '1' },
    { name: 'showSecond', type: 'boolean', default: 'true' },
    { name: 'use12Hours', type: 'boolean', default: 'false' },
    { name: 'disabledHours', type: '() => number[]', default: 'undefined' },
    { name: 'disabledMinutes', type: '(hour: number) => number[]', default: 'undefined' },
    { name: 'disabledSeconds', type: '(hour: number, minute: number) => number[]', default: 'undefined' },
    { name: 'hideDisabledOptions', type: 'boolean', default: 'false' },
    { name: 'locale', type: 'string', default: "'zh-CN'" },
    {
      name: 'onChange',
      type: '(v: (Date|null) | [Date|null, Date|null]) => void',
      default: 'undefined',
    },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'dialog',
    notes: [
      '触发器 button aria-haspopup=dialog、aria-expanded、aria-controls 指向面板',
      '面板 role=dialog；每列 role=listbox，项 role=option + aria-selected',
      '禁用项 aria-disabled=true 且不可点击/键选；hideDisabledOptions 时从列移除',
      '触发器 Enter/Space/↓ 打开；Esc 关闭；选项 Enter/Space 选择',
      '12h 制额外 AM/PM 列；文案经 locale TimePicker.am/pm',
      '打开时各列命令式 scrollIntoView 到选中项',
      'timeRange 模式：面板顶部 role=tablist 起止切换；确定从起跳到止',
      'format 字符串经 core parseFormatSpec 决定显示列与 12h（覆盖 showSecond/use12Hours）',
    ],
  },
  i18nKeys: ['TimePicker.placeholder', 'TimePicker.now', 'TimePicker.confirm', 'TimePicker.clear', 'TimePicker.triggerLabel', 'TimePicker.hour', 'TimePicker.minute', 'TimePicker.second', 'TimePicker.am', 'TimePicker.pm', 'TimePicker.rangeStart', 'TimePicker.rangeEnd'],
  // 全量对齐 Semi timePicker/variables.scss 的组件 token（面板分割线/描边/列宽/项高/圆角/阴影）。
  // 触发输入框复用 Input（--cd-input-* / --cd-height-input-*）、面板容器与单元格复用 DatePicker
  // （--cd-date-picker-panel-* / --cd-date-picker-cell-*），滚动列项高复用 ScrollList（--cd-scrolllist-item-height）。
  tokens: [
    '--cd-color-time-picker-range-picker-panel-split-border',
    '--cd-color-time-picker-range-panel-border',
    '--cd-width-time-picker-range-panel-border',
    '--cd-height-time-picker-panel-body',
    '--cd-height-time-picker-scrolllist-item',
    '--cd-width-time-picker-panel-list-ampm',
    '--cd-width-time-picker-panel-list-hour',
    '--cd-width-time-picker-panel-list-minute',
    '--cd-width-time-picker-panel-list-second',
    '--cd-width-time-picker-range-panel-scrolllist-body-border',
    '--cd-spacing-time-picker-range-panel-scrolllist-header-body-padding',
    '--cd-radius-time-picker-range-panel',
    '--cd-radius-time-picker-input',
    '--cd-shadow-time-picker-range-panel',
    '--cd-time-picker-time-col-width',
    '--cd-time-picker-time-item-height',
    '--cd-date-picker-panel-*',
    '--cd-date-picker-cell-*',
    '--cd-input-*',
    '--cd-focus-ring',
    '--cd-motion-*',
  ],
} as const;
