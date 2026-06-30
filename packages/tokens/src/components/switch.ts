/** Component tokens for Switch. See specs/components/input/Switch.spec.md. */
export const switchTokens = {
  'switch-height-default': '22px',
  'switch-height-small': '16px',
  'switch-height-large': '28px',
  'switch-width-default': '40px',
  'switch-width-small': '28px',
  'switch-width-large': '52px',
  'switch-bg-off': 'var(--cd-color-fill-0)', // 对齐 Semi 关闭态默认 fill-0（原 fill-1）
  'switch-bg-on': 'var(--cd-color-success)', // 对齐 Semi 开启态绿色 success（原 primary 蓝）
  'switch-knob-bg': 'var(--cd-color-bg-0)',
  'switch-radius': 'var(--cd-border-radius-full)',
} as const;
