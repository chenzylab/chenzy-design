/** Component tokens for Popconfirm (M5 Feedback). 回退 Alias，禁写死。 */
export const popconfirmTokens = {
  'popconfirm-bg': 'var(--cd-color-bg-0)',
  'popconfirm-color-text': 'var(--cd-color-text-0)',
  'popconfirm-color-text-secondary': 'var(--cd-color-text-2)', // 对齐 Semi body 文字 text-2（原 text-1）
  'popconfirm-border': 'var(--cd-color-border)',
  'popconfirm-shadow': 'var(--cd-shadow-elevated)',
  'popconfirm-radius': 'var(--cd-border-radius-medium)',
  'popconfirm-padding': 'var(--cd-spacing-loose)', // 对齐 Semi（base 16 → loose 24，Semi top 24/bottom 20）
  'popconfirm-icon-color-danger': 'var(--cd-color-danger)',
  'popconfirm-icon-color-warning': 'var(--cd-color-warning)',
  'popconfirm-icon-color-info': 'var(--cd-color-warning)', // 对齐 Semi 警示图标 warning（原 primary）
  'popconfirm-title-color': 'var(--cd-color-text-0)',
  'popconfirm-title-size': 'var(--cd-font-size-regular)',
  'popconfirm-title-weight': 'var(--cd-font-weight-bold)', // 对齐 Semi header 标题字重 bold
  'popconfirm-content-size': 'var(--cd-font-size-small)',
  'popconfirm-max-width': '400px', // 对齐 Semi（280 → 400）
  'popconfirm-z': '1000',
  'popconfirm-gap-footer': 'var(--cd-spacing-tight)',
  'popconfirm-arrow-size': '8px',
  'popconfirm-motion-duration': 'var(--cd-motion-duration-fast)',
  'popconfirm-motion-easing': 'var(--cd-motion-ease-standard)',
} as const;
