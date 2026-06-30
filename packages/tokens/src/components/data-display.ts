/** Component tokens for Empty / Descriptions / Collapse / Timeline (M4 Show). */
export const dataDisplayTokens = {
  // Empty
  'empty-image-color': 'var(--cd-color-fill-1)',
  'empty-title-color': 'var(--cd-color-text-1)',
  'empty-desc-color': 'var(--cd-color-text-2)',
  'empty-gap': 'var(--cd-spacing-base-tight)',
  // Descriptions
  'descriptions-label-color': 'var(--cd-color-text-2)',
  'descriptions-value-color': 'var(--cd-color-text-0)',
  'descriptions-border': 'var(--cd-color-border)',
  'descriptions-label-bg': 'var(--cd-color-fill-0)',
  'descriptions-cell-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base-tight)',
  'descriptions-row-gap': 'var(--cd-spacing-base-tight)',
  // Collapse（对齐 Semi：header 字重 bold、header padding tight、content padding base）
  'collapse-header-padding': 'var(--cd-spacing-tight)', // 对齐 Semi header padding 8（原 12/16）
  'collapse-header-color': 'var(--cd-color-text-0)',
  'collapse-header-weight': 'var(--cd-font-weight-bold)', // 对齐 Semi 标题字重 bold
  'collapse-header-bg-hover': 'var(--cd-color-fill-0)',
  'collapse-header-bg-active': 'var(--cd-color-fill-1)', // 对齐 Semi header 按下背景
  'collapse-content-padding':
    'var(--cd-spacing-extra-tight) var(--cd-spacing-base) var(--cd-spacing-tight)', // 对齐 Semi content padding（top 4 / x 16 / bottom 8）
  'collapse-content-color': 'var(--cd-color-text-1)',
  'collapse-border': 'var(--cd-color-border)',
  'collapse-arrow-color': 'var(--cd-color-text-2)',
  'collapse-motion-duration': 'var(--cd-motion-duration-mid)',
  // Timeline
  'timeline-dot-size': '10px',
  'timeline-dot-color': 'var(--cd-color-primary)',
  'timeline-line-color': 'var(--cd-color-border)',
  'timeline-content-color': 'var(--cd-color-text-0)',
  'timeline-time-color': 'var(--cd-color-text-2)',
  'timeline-gap': 'var(--cd-spacing-base)',
} as const;
