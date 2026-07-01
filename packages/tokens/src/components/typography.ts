/** Component tokens for Typography. See specs/components/basic/Typography.spec.md. */
export const typographyTokens = {
  'typography-color': 'var(--cd-color-text-0)',
  'typography-color-secondary': 'var(--cd-color-text-1)',
  'typography-color-tertiary': 'var(--cd-color-text-2)',
  'typography-color-quaternary': 'var(--cd-color-text-3)', // Semi $color-typography_quaternary
  'typography-color-link': 'var(--cd-color-primary)',
  'typography-color-link-hover': 'var(--cd-color-primary-hover)',
  'typography-mark-bg': 'var(--cd-color-primary-light-default)', // Semi $color-typography_mark-bg（原 warning 橙）
  'typography-code-bg': 'var(--cd-color-fill-1)',
  'typography-code-color': 'var(--cd-color-text-2)', // Semi $color-typography_code-text
  'typography-code-font-size': 'var(--cd-font-size-small)',
  'typography-font-size-small': 'var(--cd-font-size-small)',
  'typography-font-size-default': 'var(--cd-font-size-regular)',
  'typography-font-size-large': 'var(--cd-font-size-header-6)',
} as const;
