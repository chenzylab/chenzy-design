/** Component tokens for VirtualList & Carousel (M4 Show). */
export const virtualTokens = {
  // VirtualList
  'virtual-list-bg': 'var(--cd-color-bg-0)',
  'virtual-list-scrollbar': 'var(--cd-color-fill-1)',
  // Carousel
  'carousel-radius': 'var(--cd-border-radius-large)',
  // 半透明白/黑（透明度对齐 Semi light 指示器 .4 / dark 箭头 .5）
  'carousel-indicator-color': 'rgba(255, 255, 255, 0.4)',
  'carousel-indicator-color-active': 'rgba(255, 255, 255, 1)',
  'carousel-indicator-gap': 'var(--cd-spacing-tight)',
  'carousel-arrow-bg': 'rgba(0, 0, 0, 0.5)',
  'carousel-arrow-color': 'var(--cd-color-bg-0)',
  'carousel-arrow-size': '32px',
} as const;
