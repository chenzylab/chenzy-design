/**
 * Component tokens for Button. Default to Alias references via var().
 * Added incrementally as components are built (see component SPECs).
 */
export const buttonTokens = {
  'button-height-default': '32px',
  'button-height-small': '24px',
  'button-height-large': '40px',
  'button-padding-x': 'var(--cd-spacing-4)',
  'button-radius': 'var(--cd-radius-2)',
  'button-font-size': 'var(--cd-font-size-2)',
  'button-color-bg-primary': 'var(--cd-color-primary)',
  'button-color-text-primary': 'var(--cd-color-text-inverse)',
} as const;
