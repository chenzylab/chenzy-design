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
  // colorful（AI 多彩）：蓝 → 紫 双色渐变（对齐 Semi AI 风格，冷色调，无粉）
  'button-colorful-from': '#4d6bff',
  'button-colorful-via': '#7b5cff',
  'button-colorful-to': '#a64dff',
} as const;
