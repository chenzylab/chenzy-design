/** Component tokens for Banner (M5 Feedback). 回退 Alias，禁写死。 */
export const bannerTokens = {
  'banner-radius': 'var(--cd-border-radius-small)', // 对齐 Semi（medium 6 → small 3）
  'banner-padding-y': 'var(--cd-spacing-base-tight)',
  'banner-padding-x': 'var(--cd-spacing-base-tight)', // 对齐 Semi（base 16 → base-tight 12，两轴同）
  'banner-gap': 'var(--cd-spacing-base-tight)',
  'banner-icon-size': '20px',
  'banner-title-color': 'var(--cd-color-text-0)',
  'banner-desc-color': 'var(--cd-color-text-1)',
  'banner-title-size': 'var(--cd-font-size-regular)',
  'banner-desc-size': 'var(--cd-font-size-small)',
  'banner-accent-width': '4px',
  // 四语义色对齐 Semi：bg 用各自 *-light-default alias，accent/text 用对应语义色
  'banner-info-bg': 'var(--cd-color-info-light-default)', // 对齐 Semi info（原 primary-light-default）
  'banner-info-accent': 'var(--cd-color-info)',
  'banner-success-bg': 'var(--cd-color-success-light-default)', // 对齐 Semi（原 color-mix）
  'banner-success-accent': 'var(--cd-color-success)',
  'banner-warning-bg': 'var(--cd-color-warning-light-default)',
  'banner-warning-accent': 'var(--cd-color-warning)',
  'banner-danger-bg': 'var(--cd-color-danger-light-default)', // 对齐 Semi（原 color-mix）
  'banner-danger-accent': 'var(--cd-color-danger)',
  'banner-close-color': 'var(--cd-color-text-2)',
  'banner-close-hover-bg': 'var(--cd-color-fill-1)',
  'banner-motion-duration': 'var(--cd-motion-duration-fast)',
} as const;
