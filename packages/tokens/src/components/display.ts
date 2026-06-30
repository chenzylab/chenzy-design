/** Component tokens for Tag / Avatar / Badge / Card (M4 Show). */
export const displayTokens = {
  // Tag（对齐 Semi：default≡small=20px、large=24px，字号 small(12)、水平内边距 tight(8)、垂直 2/4px）
  'tag-height-default': '20px', // 对齐 Semi（24 → 20，default 与 small 同尺寸）
  'tag-height-small': '20px',
  'tag-height-large': '24px', // 对齐 Semi（28 → 24）
  'tag-padding-x': 'var(--cd-spacing-tight)',
  'tag-padding-y': '2px', // default/small 垂直内边距（Semi tag_small-paddingY）
  'tag-padding-y-large': '4px', // large 垂直内边距（Semi tag_large-paddingY）
  'tag-radius': 'var(--cd-border-radius-small)',
  'tag-font-size': 'var(--cd-font-size-small)',
  'tag-gap': 'var(--cd-spacing-extra-tight)',
  // Avatar
  'avatar-size-extra-small': '20px',
  'avatar-size-small': '28px',
  'avatar-size-default': '36px',
  'avatar-size-large': '44px',
  'avatar-size-extra-large': '56px',
  'avatar-bg': 'var(--cd-color-fill-1)',
  'avatar-color': 'var(--cd-color-text-1)',
  'avatar-radius': 'var(--cd-border-radius-medium)',
  // Badge
  'badge-size': '18px',
  'badge-size-small': '14px',
  'badge-dot-size': '8px',
  'badge-bg': 'var(--cd-color-danger)',
  'badge-color': 'var(--cd-color-text-inverse)',
  'badge-font-size': 'var(--cd-font-size-small)',
  // Card
  'card-bg': 'var(--cd-color-bg-0)',
  'card-border': 'var(--cd-color-border)',
  'card-radius': 'var(--cd-border-radius-large)',
  'card-padding': 'var(--cd-spacing-base)',
  'card-padding-small': 'var(--cd-spacing-base-tight)',
  'card-header-border': 'var(--cd-color-border)',
  'card-title-color': 'var(--cd-color-text-0)',
  'card-shadow': 'var(--cd-shadow-elevated)',
  'card-shadow-hover': 'var(--cd-shadow-elevated)',
} as const;
