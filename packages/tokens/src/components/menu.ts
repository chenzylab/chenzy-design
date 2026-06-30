/** Component tokens for Menu & Anchor (M3 Navigation). */
export const menuTokens = {
  // Menu
  'menu-bg': 'var(--cd-color-bg-0)',
  'menu-item-height': '40px',
  'menu-item-padding': 'var(--cd-spacing-3)',
  'menu-item-color': 'var(--cd-color-text-1)',
  'menu-item-color-selected': 'var(--cd-color-primary)',
  'menu-item-color-disabled': 'var(--cd-color-text-3)',
  'menu-item-bg-hover': 'var(--cd-color-fill-0)',
  // 选中态浅蓝块（对齐 Semi itemL1_selected-bg = primary-light-default，与 Table/Tree 选中行一致）
  'menu-item-bg-selected': 'var(--cd-color-primary-light-default)',
  'menu-item-indicator': 'var(--cd-color-primary)',
  'menu-submenu-arrow-color': 'var(--cd-color-text-2)',
  // Anchor
  'anchor-link-color': 'var(--cd-color-text-2)',
  'anchor-link-color-active': 'var(--cd-color-primary)',
  'anchor-link-padding': 'var(--cd-spacing-1) var(--cd-spacing-3)',
  'anchor-rail-color': 'var(--cd-color-border)',
  'anchor-ink-color': 'var(--cd-color-primary)',
  'anchor-ink-width': '2px',
} as const;
