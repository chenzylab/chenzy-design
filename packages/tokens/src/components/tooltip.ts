/** Component tokens for Tooltip & Popover (M4 Show overlays). */
export const tooltipTokens = {
  // Tooltip
  'tooltip-bg-dark': 'var(--cd-color-text-0)',
  'tooltip-color-dark': 'var(--cd-color-text-inverse)',
  'tooltip-bg-light': 'var(--cd-color-bg-0)',
  'tooltip-color-light': 'var(--cd-color-text-0)',
  'tooltip-radius': 'var(--cd-radius-2)',
  'tooltip-padding': 'var(--cd-spacing-1) var(--cd-spacing-2)',
  'tooltip-font-size': 'var(--cd-font-size-1)',
  'tooltip-shadow': 'var(--cd-shadow-2)',
  'tooltip-z': 'var(--cd-z-tooltip)',
  'tooltip-arrow-size': '6px',
  // status：非 default 时的语义前缀图标色（背景仍沿用主题色，保证文字对比度）
  'tooltip-status-warning': 'var(--cd-color-warning)',
  'tooltip-status-error': 'var(--cd-color-danger)',
  // Popover
  'popover-bg': 'var(--cd-color-bg-0)',
  'popover-color': 'var(--cd-color-text-0)',
  'popover-radius': 'var(--cd-radius-3)',
  'popover-padding': 'var(--cd-spacing-3) var(--cd-spacing-4)',
  'popover-shadow': 'var(--cd-shadow-3)',
  'popover-z': 'var(--cd-z-popover)',
  'popover-title-color': 'var(--cd-color-text-0)',
  'popover-title-border': 'var(--cd-color-border)',
  'popover-arrow-size': '8px',
} as const;
