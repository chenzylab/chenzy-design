/** Component tokens for Radio. See specs/components/input/Radio.spec.md. */
export const radioTokens = {
  'radio-size-default': '16px',
  'radio-size-small': '14px',
  'radio-size-large': '18px',
  'radio-border': 'var(--cd-color-text-3)', // 对齐 Semi 默认描边 text-3（原 color-border）
  'radio-border-hover': 'var(--cd-color-focus-border)', // 对齐 Semi 悬浮描边 focus-border
  'radio-bg': 'transparent', // 对齐 Semi 默认背景 transparent（原 bg-0）
  'radio-bg-hover': 'var(--cd-color-fill-0)', // 对齐 Semi 悬浮背景 fill-0
  'radio-color-checked': 'var(--cd-color-primary)',
  'radio-dot-color': 'var(--cd-color-bg-0)',
  'radio-color-warning': 'var(--cd-color-warning)',
  'radio-color-error': 'var(--cd-color-danger)',
  'radio-label-gap': 'var(--cd-spacing-tight)',
  // button 型分段按钮高度（三档）
  'radio-button-height': 'var(--cd-control-height-default, 32px)',
  'radio-button-height-small': 'var(--cd-control-height-small, 24px)',
  'radio-button-height-large': 'var(--cd-control-height-large, 40px)',
  // card 型圆角与选中边框
  'radio-card-radius': 'var(--cd-border-radius-medium)',
  'radio-card-border-checked': 'var(--cd-color-primary)',
} as const;
