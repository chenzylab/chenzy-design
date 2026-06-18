/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Icon.spec.md.
 */
export const meta = {
  name: 'Icon',
  category: 'basic',
  description: '统一尺寸、颜色、对齐的矢量图标容器，纯展示原语。',
  props: [
    {
      name: 'size',
      type: "'extra-small'|'small'|'default'|'large'|'extra-large'|number",
      default: "'default'",
      desc: '尺寸枚举映射到 token，数字直接作为 px',
    },
    { name: 'spin', type: 'boolean', default: 'false', desc: '持续旋转，受 reduced-motion 抑制' },
    { name: 'rotate', type: 'number', default: '0', desc: '静态旋转角度（deg）' },
    { name: 'status', type: "'default'|'warning'|'error'|'success'|'info'", default: "'default'" },
    { name: 'color', type: 'string', default: 'undefined', desc: '显式覆盖颜色，优先级高于 status' },
    { name: 'label', type: 'string', default: 'undefined', desc: '语义图标可访问名称；提供后 role=img' },
    { name: 'class', type: 'string', default: "''" },
  ],
  events: [],
  slots: [{ name: 'children', desc: '自定义图标内容（SVG）' }],
  a11y: { role: 'img-when-labeled', decorativeDefault: true, reducedMotion: true },
  tokens: ['--cd-icon-size-*', '--cd-icon-color', '--cd-icon-color-*', '--cd-icon-spin-*'],
  examples: [{ title: '加载中', code: '<Icon spin status="info">{@render svg()}</Icon>' }],
} as const;
