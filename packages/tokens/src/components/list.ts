/** Component tokens for List / Image / Highlight (M4 Show). */
export const listTokens = {
  // List
  'list-bg': 'var(--cd-color-bg-0)',
  'list-border': 'var(--cd-color-border)',
  'list-radius': 'var(--cd-border-radius-medium)',
  'list-item-padding': 'var(--cd-spacing-base-tight) var(--cd-spacing-base)',
  'list-item-padding-small': 'var(--cd-spacing-tight) var(--cd-spacing-base-tight)',
  'list-split-color': 'var(--cd-color-border)',
  'list-header-color': 'var(--cd-color-text-0)',
  'list-item-color': 'var(--cd-color-text-1)',
  // Image
  'image-bg': 'var(--cd-color-fill-0)',
  'image-radius': 'var(--cd-border-radius-medium)',
  'image-placeholder-color': 'var(--cd-color-text-3)',
  'image-mask-bg': 'rgba(0, 0, 0, 0.5)',
  'image-mask-color': 'var(--cd-color-text-inverse)',
  'image-preview-overlay': 'rgba(0, 0, 0, 0.7)',
  'image-preview-z': 'var(--cd-z-modal)',
  // Highlight
  'highlight-bg': 'var(--cd-color-warning)',
  'highlight-color': 'var(--cd-color-text-0)',
} as const;
