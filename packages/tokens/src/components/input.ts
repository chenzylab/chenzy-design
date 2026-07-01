/** Component tokens for Input. See specs/components/input/Input.spec.md. */
export const inputTokens = {
  'input-height-default': 'var(--cd-control-height-default)',
  'input-height-small': 'var(--cd-control-height-small)',
  'input-height-large': 'var(--cd-control-height-large)',
  'input-padding-x': 'var(--cd-spacing-base-tight)',
  // 对齐 Semi 填充式：默认灰底(fill-0) + 无边框，hover fill-1，聚焦 fill-0 + 蓝边框
  'input-border': 'transparent', // 对齐 Semi 默认无边框（原 color-border）
  'input-radius': 'var(--cd-border-radius-small)', // 对齐 Semi（原 medium 6px → small 3px）
  'input-color-bg': 'var(--cd-color-fill-0)', // 对齐 Semi 默认灰底（原 bg-0 白）
  'input-bg-hover': 'var(--cd-color-fill-1)', // 对齐 Semi 悬浮态
  'input-color-text': 'var(--cd-color-text-0)',
  'input-color-placeholder': 'var(--cd-color-text-3)',
  'input-border-active': 'var(--cd-color-focus-border)', // 对齐 Semi 聚焦边框 focus-border（原 primary）
  'input-border-warning': 'var(--cd-color-warning)',
  'input-border-error': 'var(--cd-color-danger)',
  'input-font-size': 'var(--cd-font-size-regular)',
  // InputNumber 步进器按钮（对齐 Semi inputNumber：实底 bg-2 按钮 + 描边 + small 圆角）
  'input-number-step-width': '14px', // Semi width-inputNumber_button
  'input-number-step-bg': 'var(--cd-color-bg-2)', // Semi button-bg-default
  'input-number-step-bg-hover': 'var(--cd-color-fill-0)', // Semi button-bg-hover
  'input-number-step-bg-active': 'var(--cd-color-fill-1)', // Semi button-bg-active
  'input-number-step-bg-disabled': 'var(--cd-color-fill-0)', // Semi button-bg-disabled（disabled-fill 近似）
  'input-number-step-color': 'var(--cd-color-text-2)', // Semi button-text-default
  'input-number-step-color-disabled': 'var(--cd-color-text-3)', // Semi button-text-disabled
  'input-number-step-border': 'var(--cd-color-border)', // Semi button-border-default
  'input-number-step-radius': 'var(--cd-border-radius-small)', // Semi radius-inputNumber
} as const;
