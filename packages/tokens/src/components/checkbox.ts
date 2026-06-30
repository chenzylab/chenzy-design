/** Component tokens for Checkbox. See specs/components/input/Checkbox.spec.md. */
export const checkboxTokens = {
  'checkbox-size-default': '16px',
  'checkbox-size-small': '14px',
  'checkbox-size-large': '18px',
  'checkbox-radius': 'var(--cd-border-radius-small)',
  'checkbox-border': 'var(--cd-color-text-3)', // 对齐 Semi 默认描边 text-3（原 color-border）
  'checkbox-border-hover': 'var(--cd-color-focus-border)', // 对齐 Semi 悬浮描边 focus-border
  'checkbox-bg': 'transparent', // 对齐 Semi 默认背景 transparent（原 bg-0）
  'checkbox-bg-hover': 'var(--cd-color-fill-0)', // 对齐 Semi 悬浮背景 fill-0
  'checkbox-bg-checked': 'var(--cd-color-primary)',
  'checkbox-border-checked': 'var(--cd-color-primary)',
  'checkbox-mark-color': 'var(--cd-color-text-inverse)',
  'checkbox-label-gap': 'var(--cd-spacing-tight)',
  // card / pureCard 形态
  'checkbox-card-padding': 'var(--cd-spacing-base-tight) var(--cd-spacing-base)',
  'checkbox-card-radius': 'var(--cd-border-radius-medium)',
  'checkbox-card-bg': 'var(--cd-color-bg-0)',
  'checkbox-card-bg-hover': 'var(--cd-color-fill-0)', // 对齐 Semi 卡片悬浮 fill-0（原 bg-1）
  'checkbox-card-bg-checked': 'var(--cd-color-primary-light-default)', // 对齐 Semi 卡片选中 primary-light-default
  'checkbox-card-border': 'var(--cd-color-border)',
  'checkbox-card-border-checked': 'var(--cd-color-primary)',
} as const;
