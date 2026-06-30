/**
 * UnoCSS theme object — exposes tokens to atomic utilities so utility classes
 * and components share the same variables. Consumed by @chenzy-design/unocss-preset.
 */
export const theme = {
  colors: {
    primary: 'var(--cd-color-primary)',
    success: 'var(--cd-color-success)',
    warning: 'var(--cd-color-warning)',
    danger: 'var(--cd-color-danger)',
    'text-0': 'var(--cd-color-text-0)',
    'text-1': 'var(--cd-color-text-1)',
    'text-2': 'var(--cd-color-text-2)',
    'bg-0': 'var(--cd-color-bg-0)',
    'bg-1': 'var(--cd-color-bg-1)',
    'bg-2': 'var(--cd-color-bg-2)',
    border: 'var(--cd-color-border)',
  },
  borderRadius: {
    sm: 'var(--cd-border-radius-small)',
    DEFAULT: 'var(--cd-border-radius-medium)',
    lg: 'var(--cd-border-radius-large)',
    full: 'var(--cd-border-radius-full)',
  },
  spacing: {
    1: 'var(--cd-spacing-extra-tight)',
    2: 'var(--cd-spacing-tight)',
    3: 'var(--cd-spacing-base-tight)',
    4: 'var(--cd-spacing-base)',
    6: 'var(--cd-spacing-loose)',
  },
} as const;
