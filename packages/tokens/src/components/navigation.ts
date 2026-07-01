/** Component tokens for Breadcrumb / Pagination / Steps (M3 Navigation). */
export const navigationTokens = {
  // Breadcrumb
  'breadcrumb-color': 'var(--cd-color-text-2)',
  'breadcrumb-color-active': 'var(--cd-color-text-0)',
  'breadcrumb-color-link': 'var(--cd-color-primary)',
  'breadcrumb-active-weight': 'var(--cd-font-weight-bold)', // 对齐 Semi 当前项字重 bold
  'breadcrumb-separator-color': 'var(--cd-color-text-2)', // 对齐 Semi 分割符 text-2（原 text-3）
  'breadcrumb-gap': 'var(--cd-spacing-tight)',
  'breadcrumb-font-size': 'var(--cd-font-size-regular)',
  // Pagination（对齐 Semi：选中态浅蓝底蓝字、无边框）
  'pagination-item-size': '32px',
  'pagination-item-radius': 'var(--cd-border-radius-small)', // 对齐 Semi 页码圆角（small 3px）
  'pagination-item-border': 'transparent', // 对齐 Semi 页码无边框（原 color-border）
  'pagination-item-bg-active': 'var(--cd-color-primary-light-default)', // 对齐 Semi 选中背景浅蓝（原 primary 实底）
  'pagination-item-color-active': 'var(--cd-color-primary)', // 对齐 Semi 选中文字蓝（原 text-inverse 白）
  'pagination-item-bg-hover': 'var(--cd-color-fill-0)',
  'pagination-gap': 'var(--cd-spacing-tight)',
  // Steps
  'steps-icon-size': '28px',
  'steps-icon-bg': 'var(--cd-color-text-2)', // 对齐 Semi 未到达图标背景 text-2（原 fill-1）
  'steps-icon-bg-process': 'var(--cd-color-primary)',
  'steps-icon-bg-finish': 'var(--cd-color-primary)',
  'steps-icon-bg-error': 'var(--cd-color-danger)',
  'steps-icon-color': 'var(--cd-color-text-inverse)', // 对齐 Semi 图标文本 white（未到达底色 text-2 上用白字）
  'steps-icon-color-active': 'var(--cd-color-text-inverse)',
  'steps-title-color': 'var(--cd-color-text-0)',
  'steps-desc-color': 'var(--cd-color-text-2)',
  'steps-line-color': 'var(--cd-color-fill-2)', // 对齐 Semi 未完成连接线 fill-2（原 border）
  'steps-line-color-finish': 'var(--cd-color-primary)',
} as const;
