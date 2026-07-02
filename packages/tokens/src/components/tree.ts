/** Component tokens for Cascader & TreeSelect (tree-based dropdowns). */
export const treeTokens = {
  'tree-node-height': '32px',
  'tree-node-padding-x': 'var(--cd-spacing-base-tight)',
  'tree-node-bg-hover': 'var(--cd-color-fill-0)',
  'tree-node-bg-active': 'var(--cd-color-fill-1)',
  'tree-node-color-selected': 'var(--cd-color-text-0)', // Semi 树选中态深字（bg primary-light-default 区分，同 Menu）
  'tree-indent': 'var(--cd-spacing-base)',
  'tree-expand-icon-color': 'var(--cd-color-text-2)',
  // standalone Tree component (M4 Show)
  'tree-node-height-small': '28px',
  'tree-node-height-large': '36px',
  'tree-node-color': 'var(--cd-color-text-0)',
  'tree-node-color-disabled': 'var(--cd-color-text-2)',
  'tree-node-bg-selected': 'var(--cd-color-primary-light-default)',
  'tree-search-highlight-bg': 'transparent', // Semi tree 高亮无背景（原 warning-light）
  'tree-search-highlight-color': 'var(--cd-color-primary)', // Semi tree 高亮文本 primary（原 warning）
  'tree-search-highlight-weight': 'var(--cd-font-weight-bold)', // Semi 高亮字重 bold
  'tree-focus-ring': 'var(--cd-color-primary)',
  'tree-border-color': 'var(--cd-color-border)',
  'tree-border-color-warning': 'var(--cd-color-warning)',
  'tree-border-color-error': 'var(--cd-color-danger)',
  // cascader-column-* 已迁移至 cascader.ts（归属更正确，值不变）
} as const;
