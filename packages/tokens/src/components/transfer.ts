/** Component tokens for Transfer & Upload. See specs/components/input/Transfer.spec.md. */
export const transferTokens = {
  'transfer-panel-width': '200px',
  'transfer-panel-height': '240px',
  'transfer-panel-border': 'var(--cd-color-border)',
  'transfer-panel-radius': 'var(--cd-border-radius-medium)',
  'transfer-panel-header-bg': 'var(--cd-color-fill-0)',
  'transfer-item-height': '32px',
  'transfer-item-bg-hover': 'var(--cd-color-fill-0)',
  'transfer-gap': 'var(--cd-spacing-base-tight)',
  'upload-dragger-border': 'var(--cd-color-border)',
  'upload-dragger-border-active': 'var(--cd-color-primary)',
  'upload-dragger-bg': 'var(--cd-color-fill-0)',
  'upload-dragger-radius': 'var(--cd-border-radius-medium)',
  'upload-item-bg-hover': 'var(--cd-color-fill-0)',
  'upload-item-color-error': 'var(--cd-color-danger)',
  // 组件级 status 校验态边框色（区别于 file.status 上传进度态）。
  'upload-border-warning': 'var(--cd-color-warning)',
  'upload-border-error': 'var(--cd-color-danger)',
} as const;
