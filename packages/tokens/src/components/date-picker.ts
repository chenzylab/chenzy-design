/** Component tokens for DatePicker & TimePicker. See specs/components/input/DatePicker.spec.md. */
export const datePickerTokens = {
  'date-picker-panel-bg': 'var(--cd-color-bg-0)',
  'date-picker-panel-shadow': 'var(--cd-shadow-elevated)',
  'date-picker-panel-radius': 'var(--cd-border-radius-large)',
  'date-picker-panel-z': 'var(--cd-z-popover)',
  'date-picker-cell-size': '32px',
  'date-picker-cell-radius': 'var(--cd-border-radius-small)', // Semi 日期格圆角 small（原 medium）
  'date-picker-cell-bg-hover': 'var(--cd-color-fill-0)',
  'date-picker-cell-bg-selected': 'var(--cd-color-primary)',
  'date-picker-cell-color-selected': 'var(--cd-color-text-inverse)',
  'date-picker-cell-color-muted': 'var(--cd-color-text-3)',
  'date-picker-footer-bg': 'var(--cd-color-fill-0)', // Semi $color-datepicker_footer-bg-default
  'date-picker-quick-color': 'var(--cd-color-primary)', // Semi 快捷操作按钮文字 primary
  'date-picker-header-color': 'var(--cd-color-text-0)',
  'date-picker-weekday-color': 'var(--cd-color-text-2)',
  // time-col-width / time-item-height 孤儿项已删：组件实际消费的是 --cd-time-picker-time-*
  // （前缀不一致导致此前是无 fallback 悬空 bug，已由 time-picker.ts 定义修复）。
} as const;
