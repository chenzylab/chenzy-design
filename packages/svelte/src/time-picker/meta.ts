/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TimePicker',
  category: 'input',
  description:
    '时间选择器，单选 type=time，HH:mm:ss 三列滚动选择，受控/非受控；展示经 Intl.DateTimeFormat 本地化。',
  props: [
    { name: 'value', type: 'Date | null', default: 'undefined' },
    { name: 'defaultValue', type: 'Date | null', default: 'null' },
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
    { name: 'onChange', type: '(v: Date | null) => void', default: 'undefined' },
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
    ],
  },
  i18nKeys: ['TimePicker.placeholder', 'TimePicker.now', 'TimePicker.confirm', 'TimePicker.clear', 'TimePicker.triggerLabel', 'TimePicker.hour', 'TimePicker.minute', 'TimePicker.second', 'TimePicker.am', 'TimePicker.pm'],
  tokens: ['--cd-time-picker-*', '--cd-date-picker-panel-*', '--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
