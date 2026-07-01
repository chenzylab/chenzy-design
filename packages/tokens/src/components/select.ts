/** Component tokens for Select & AutoComplete. See specs/components/input/Select.spec.md. */
export const selectTokens = {
  'select-height-default': 'var(--cd-control-height-default)',
  'select-height-small': 'var(--cd-control-height-small)',
  'select-height-large': 'var(--cd-control-height-large)',
  'select-padding-x': 'var(--cd-spacing-base-tight)',
  // 对齐 Semi 填充式：默认灰底(fill-0) + 无边框，hover fill-1，聚焦 fill-0 + focus-border
  'select-border': 'transparent', // Semi $color-select-border-default（原 color-border）
  'select-border-active': 'var(--cd-color-focus-border)', // Semi $color-select-border-active（原 primary）
  'select-border-error': 'var(--cd-color-danger)',
  'select-radius': 'var(--cd-border-radius-small)', // 对齐 Semi 选择器输入框圆角（small 3px）
  'select-bg': 'var(--cd-color-fill-0)', // Semi $color-select-bg-default（原 bg-0）
  'select-bg-hover': 'var(--cd-color-fill-1)', // Semi $color-select-bg-hover
  'select-font-size': 'var(--cd-font-size-regular)',
  'select-dropdown-bg': 'var(--cd-color-bg-0)',
  'select-dropdown-shadow': 'var(--cd-shadow-elevated)',
  'select-dropdown-radius': 'var(--cd-border-radius-medium)',
  'select-dropdown-z': 'var(--cd-z-dropdown)',
  'select-option-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base-tight)',
  'select-option-bg-hover': 'var(--cd-color-fill-0)',
  'select-option-bg-active': 'var(--cd-color-fill-1)',
  'select-option-color-selected': 'var(--cd-color-primary)',
} as const;
