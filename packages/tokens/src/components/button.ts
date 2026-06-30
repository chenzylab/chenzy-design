/**
 * Component tokens for Button. Default to Alias references via var().
 * Added incrementally as components are built (see component SPECs).
 */
export const buttonTokens = {
  'button-height-default': 'var(--cd-control-height-default)',
  'button-height-small': 'var(--cd-control-height-small)',
  'button-height-large': 'var(--cd-control-height-large)',
  // padding-x 对齐 Semi：default/small=12px(base-tight)、large=16px(base)
  'button-padding-x': 'var(--cd-spacing-base-tight)',
  'button-padding-x-large': 'var(--cd-spacing-base)',
  'button-radius': 'var(--cd-border-radius-small)', // 对齐 Semi（原 medium 6px → small 3px）
  'button-font-size': 'var(--cd-font-size-regular)',
  'button-color-bg-primary': 'var(--cd-color-primary)',
  'button-color-text-primary': 'var(--cd-color-text-inverse)',
  // ButtonGroup：组内分隔线颜色（相邻按钮共享边框时的细分隔）
  'button-group-divider': 'var(--cd-color-border)',
  // colorful（AI 多彩）：蓝 → 紫 双色渐变（对齐 Semi AI 风格，冷色调，无粉）
  'button-colorful-from': '#4d6bff',
  'button-colorful-via': '#7b5cff',
  'button-colorful-to': '#a64dff',
} as const;
