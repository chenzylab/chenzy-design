/** Component tokens for Modal (M5 Feedback). 回退 Alias，禁写死。 */
export const modalTokens = {
  'modal-radius': 'var(--cd-border-radius-large)',
  'modal-bg': 'var(--cd-color-bg-0)',
  'modal-shadow': 'var(--cd-shadow-elevated)',
  'modal-mask-bg': 'var(--cd-color-overlay-bg)', // 对齐 Semi overlay-bg（rgba(22,22,26,.6)）
  'modal-padding': 'var(--cd-spacing-loose)',
  'modal-header-gap': 'var(--cd-spacing-base-tight)',
  'modal-footer-gap': 'var(--cd-spacing-tight)',
  'modal-title-color': 'var(--cd-color-text-0)',
  'modal-title-size': 'var(--cd-font-size-regular)', // 对齐 Semi（header-6 16px → regular 14px）
  'modal-title-weight': 'var(--cd-font-weight-bold)', // 对齐 Semi 标题字重 bold
  'modal-body-color': 'var(--cd-color-text-1)',
  'modal-close-color': 'var(--cd-color-text-2)',
  'modal-close-hover-bg': 'var(--cd-color-fill-1)',
  'modal-z': 'var(--cd-z-modal)',
  'modal-motion-duration': 'var(--cd-motion-duration-mid)',
} as const;
