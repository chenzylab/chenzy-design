/** Component tokens for Rating. See specs/components/input/Rating.spec.md. */
export const ratingTokens = {
  'rating-size-default': '20px',
  'rating-size-small': '16px',
  'rating-size-large': '24px',
  'rating-gap': 'var(--cd-spacing-extra-tight)',
  // 镜像 Semi $color-rating-icon-default = yellow-5（亮金黄，非 warning 橙）
  'rating-color-active': 'var(--cd-color-rating-icon-default)',
  'rating-color-inactive': 'var(--cd-color-fill-0)', // Semi $color-rating-bg-default（原 fill-1）
} as const;
