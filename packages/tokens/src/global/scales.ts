/**
 * Global non-color scales — spacing, radius, typography, shadow, motion, z-index.
 * Atomic values only. Consume via Alias / Component tokens.
 */
export const spacing = {
  // PR1 additive: align Semi $spacing-none / $spacing-super-tight（重命名留 PR2）
  none: '0',
  'super-tight': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
} as const;

export const radius = {
  '1': '3px',
  '2': '6px',
  '3': '12px',
  full: '9999px',
  // PR1 additive: align Semi $border-radius-circle / extra-small（重命名留 PR2）
  circle: '50%',
  'extra-small': '3px',
} as const;

export const fontSize = {
  '1': '12px',
  '2': '14px',
  '3': '16px',
  '4': '20px',
  '5': '24px',
  '6': '32px',
  // PR1 additive: align Semi header-5(18) / header-2(28)（重命名留 PR2）
  '18': '18px',
  '28': '28px',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  // PR1 additive: align Semi $font-weight-light（重命名留 PR2）
  light: '200',
} as const;

export const lineHeight = {
  tight: '1.3',
  normal: '1.5',
  loose: '1.7',
} as const;

export const shadow = {
  '1': '0 1px 2px rgba(0,0,0,.08)',
  '2': '0 4px 12px rgba(0,0,0,.12)',
  '3': '0 8px 24px rgba(0,0,0,.16)',
  // PR1 additive: align Semi $shadow-elevated（toast/modal/popover 提升层级）
  elevated: '0 0 1px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.1)',
} as const;

export const motion = {
  'duration-fast': '120ms',
  'duration-mid': '200ms',
  'duration-slow': '320ms',
  'ease-standard': 'cubic-bezier(.4,0,.2,1)',
} as const;

export const zIndex = {
  affix: '10',
  sticky: '900',
  // 对齐 Semi z-index 层级值
  'table-fixed': '101',
  modal: '1000',
  'modal-mask': '1000',
  toast: '1010', // 对齐 Semi（原 1080）
  notification: '1010',
  popover: '1030',
  dropdown: '1050',
  tooltip: '1060', // 对齐 Semi（原 1070）
  'image-preview': '1070',
  drag: '2000', // transfer/tagInput 拖拽中元素
} as const;

/**
 * Foundation 尺寸常量（对齐 Semi variables.scss：$height-control-* / $width-icon-* / $border-thickness-*）。
 * 控件高度供 button/input/select 等消费（PR1 引入全局 token，组件迁移见后续）。
 */
export const sizing = {
  'control-height-small': '24px',
  'control-height-default': '32px',
  'control-height-large': '40px',
  'width-icon-extra-small': '8px',
  'width-icon-small': '12px',
  'width-icon-medium': '16px',
  'width-icon-large': '20px',
  'width-icon-extra-large': '24px',
  'border-thickness': '0',
  'border-thickness-control': '1px',
} as const;

/** Responsive breakpoints (min-width). Emitted as CSS vars AND used as build-time
 *  constants for media queries (CSS @media cannot use var()). See Grid/Layout specs. */
export const breakpoint = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
} as const;
