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
  // ButtonGroup：组内分隔线颜色（相邻按钮共享边框时的细分隔）
  'button-group-divider': 'var(--cd-color-border)',
  // colorful（AI 多彩）：实心渐变背景的两端色，由品牌主色到蓝/紫
  'button-colorful-from': 'var(--cd-color-primary)',
  'button-colorful-to': 'var(--cd-color-blue-4, #4f46e5)',
} as const;
