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
  // Avatar（尺寸/圆角对齐 Semi：圆形默认 + Semi 档位）
  'avatar-size-extra-small': '24px', // Semi extra_small（原 20）
  'avatar-size-small': '32px', // Semi small（原 28）
  'avatar-size-default': '40px', // Semi default（原 36）
  'avatar-size-medium': '48px', // Semi medium（新增档）
  'avatar-size-large': '72px', // Semi large（原 44）
  'avatar-size-extra-large': '128px', // Semi extra_large（原 56）
  'avatar-bg': 'var(--cd-color-fill-1)',
  'avatar-color': 'var(--cd-color-text-1)',
  'avatar-border': 'var(--cd-color-bg-1)', // Semi avatar 描边
  'avatar-radius': 'var(--cd-border-radius-small)', // 方形 avatar 圆角（对齐 Semi square：small；圆形由 --circle 规则用 full）
  // Badge
  'badge-size': '18px',
  'badge-size-small': '14px',
  'badge-dot-size': '8px',
  'badge-bg': 'var(--cd-color-danger)',
  'badge-color': 'var(--cd-color-text-inverse)',
  'badge-font-size': 'var(--cd-font-size-small)',
  // Card（对齐 Semi：radius medium、padding base-loose、title 字重 bold）
  'card-bg': 'var(--cd-color-bg-0)',
  'card-border': 'var(--cd-color-border)',
  'card-radius': 'var(--cd-border-radius-medium)', // 对齐 Semi（large 12 → medium 6）
  'card-padding': 'var(--cd-spacing-base-loose)', // 对齐 Semi（base 16 → base-loose 20）
  'card-padding-small': 'var(--cd-spacing-base-tight)',
  'card-header-border': 'var(--cd-color-border)',
  'card-title-color': 'var(--cd-color-text-0)',
  'card-title-weight': 'var(--cd-font-weight-bold)', // 对齐 Semi 标题字重 bold(700)
  'card-title-size': 'var(--cd-font-size-header-6)', // 对齐 Semi 标题字号 16
  'card-desc-color': 'var(--cd-color-text-2)', // 对齐 Semi 描述文字
  'card-body-color': 'var(--cd-color-text-1)', // 对齐 Semi 正文文字
  'card-shadow': 'var(--cd-shadow-elevated)',
  'card-shadow-hover': 'var(--cd-shadow-elevated)',
} as const;
