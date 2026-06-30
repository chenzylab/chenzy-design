/** Component tokens for Switch. See specs/components/input/Switch.spec.md. */
export const switchTokens = {
  'switch-height-default': '24px', // 对齐 Semi（22 → 24）
  'switch-height-small': '16px',
  'switch-height-large': '32px', // 对齐 Semi（28 → 32）
  'switch-width-default': '40px',
  'switch-width-small': '26px', // 对齐 Semi（28 → 26）
  'switch-width-large': '54px', // 对齐 Semi（52 → 54）
  'switch-bg-off': 'var(--cd-color-fill-0)', // 对齐 Semi 关闭态默认 fill-0（原 fill-1）
  'switch-bg-on': 'var(--cd-color-success)', // 对齐 Semi 开启态绿色 success（原 primary 蓝）
  'switch-knob-bg': 'var(--cd-color-bg-0)',
  'switch-radius': 'var(--cd-border-radius-full)',
} as const;
