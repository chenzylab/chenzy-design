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
  'upload-dragger-border-active': 'var(--cd-color-primary)', // Semi 拖拽区 hover 描边 primary
  'upload-dragger-bg': 'var(--cd-color-tertiary-light-default)', // Semi $color-upload_drag_area-bg（原 fill-0）
  'upload-dragger-bg-active': 'var(--cd-color-primary-light-default)', // Semi 拖拽区 hover 背景 primary-light-default
  'upload-dragger-radius': 'var(--cd-border-radius-medium)',
  'upload-item-bg-hover': 'var(--cd-color-fill-1)', // Semi $color-upload_card-bg-hover（原 fill-0 → fill-1）
  'upload-item-color-error': 'var(--cd-color-danger)',
  // 组件级 status 校验态边框色（区别于 file.status 上传进度态）。
  'upload-border-warning': 'var(--cd-color-warning)',
  'upload-border-error': 'var(--cd-color-danger)',
} as const;
