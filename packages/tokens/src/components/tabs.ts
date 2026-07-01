/** Component tokens for Tabs & Dropdown (M3 Navigation). */
export const tabsTokens = {
  // Tabs（对齐 Semi 线条式：默认 text-2、选中 text-0 深字，标示线 ink 才是 primary）
  'tabs-tab-color': 'var(--cd-color-text-2)',
  'tabs-tab-color-active': 'var(--cd-color-text-0)',
  'tabs-tab-color-disabled': 'var(--cd-color-text-3)',
  'tabs-tab-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base)',
  'tabs-tab-font-size': 'var(--cd-font-size-regular)',
  'tabs-ink-color': 'var(--cd-color-primary)',
  'tabs-ink-height': '2px',
  'tabs-bar-border': 'var(--cd-color-border)',
  'tabs-card-bg': 'var(--cd-color-fill-0)',
  'tabs-card-bg-active': 'var(--cd-color-bg-0)',
  'tabs-card-radius': 'var(--cd-border-radius-small)', // 对齐 Semi 卡片式页签圆角（small 3px）
  // type=button（分段按钮组）
  'tabs-button-bg': 'var(--cd-color-fill-0)',
  'tabs-button-bg-hover': 'var(--cd-color-fill-1)',
  'tabs-button-bg-active': 'var(--cd-color-primary)',
  'tabs-button-color-active': 'var(--cd-color-white, #fff)',
  'tabs-button-gap': '2px',
  'tabs-button-pad': '2px',
  // Dropdown
  'dropdown-bg': 'var(--cd-color-bg-0)',
  'dropdown-shadow': 'var(--cd-shadow-elevated)',
  'dropdown-radius': 'var(--cd-border-radius-medium)',
  'dropdown-z': 'var(--cd-z-dropdown)',
  'dropdown-min-width': '120px',
  'dropdown-item-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base)', // 对齐 Semi 菜单项 X 内边距（base-tight 12 → base 16）
  'dropdown-item-bg-hover': 'var(--cd-color-fill-0)',
  'dropdown-item-color-disabled': 'var(--cd-color-text-3)',
} as const;
