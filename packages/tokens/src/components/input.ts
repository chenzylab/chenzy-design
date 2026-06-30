/** Component tokens for Input. See specs/components/input/Input.spec.md. */
export const inputTokens = {
  'input-height-default': 'var(--cd-control-height-default)',
  'input-height-small': 'var(--cd-control-height-small)',
  'input-height-large': 'var(--cd-control-height-large)',
  'input-padding-x': 'var(--cd-spacing-base-tight)',
  'input-border': 'var(--cd-color-border)',
  'input-radius': 'var(--cd-border-radius-small)', // 对齐 Semi（原 medium 6px → small 3px）
  'input-color-bg': 'var(--cd-color-bg-0)',
  'input-color-text': 'var(--cd-color-text-0)',
  'input-color-placeholder': 'var(--cd-color-text-3)',
  'input-border-active': 'var(--cd-color-primary)',
  'input-border-warning': 'var(--cd-color-warning)',
  'input-border-error': 'var(--cd-color-danger)',
  'input-font-size': 'var(--cd-font-size-regular)',
} as const;
