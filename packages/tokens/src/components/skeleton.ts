/** Component tokens for Skeleton (M5 Feedback). 回退 Alias，禁写死。 */
export const skeletonTokens = {
  'skeleton-color-bg': 'var(--cd-color-fill-0)',
  'skeleton-color-highlight': 'var(--cd-color-fill-1)',
  'skeleton-radius': 'var(--cd-border-radius-small)', // 对齐 Semi（medium 6 → small 3）
  'skeleton-radius-pill': 'var(--cd-border-radius-full)',
  'skeleton-gap': 'var(--cd-spacing-base-tight)',
  'skeleton-title-height': '16px',
  'skeleton-paragraph-height': '16px', // 对齐 Semi 段落骨架高度（14 → 16）
  'skeleton-anim-duration': '1.4s',
  'skeleton-anim-timing': 'var(--cd-motion-ease-standard)',
} as const;
