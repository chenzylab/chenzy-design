/** Component tokens for Radio. See specs/components/input/Radio.spec.md. */
export const radioTokens = {
  'radio-size-default': '16px',
  'radio-size-small': '14px',
  'radio-size-large': '18px',
  'radio-border': 'var(--cd-color-border)',
  'radio-bg': 'var(--cd-color-bg-0)',
  'radio-color-checked': 'var(--cd-color-primary)',
  'radio-dot-color': 'var(--cd-color-bg-0)',
  'radio-color-warning': 'var(--cd-color-warning)',
  'radio-color-error': 'var(--cd-color-danger)',
  'radio-label-gap': 'var(--cd-spacing-2)',
  // button 型分段按钮高度（三档）
  'radio-button-height': 'var(--cd-control-height-default, 32px)',
  'radio-button-height-small': 'var(--cd-control-height-small, 24px)',
  'radio-button-height-large': 'var(--cd-control-height-large, 40px)',
  // card 型圆角与选中边框
  'radio-card-radius': 'var(--cd-radius-medium, var(--cd-radius-2))',
  'radio-card-border-checked': 'var(--cd-color-primary)',
} as const;
