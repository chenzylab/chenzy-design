/**
 * Machine-readable component metadata for AI/docs consumption.
 * Icon 严格对齐 Semi @douyinfe/semi-icons 基类（复用 @chenzy-design/icons）：
 * font-size 驱动尺寸，无独立组件 token（图标尺寸走 font-size 档位，颜色随 currentColor）。
 */
export const meta = {
  name: 'Icon',
  category: 'basic',
  description: '统一尺寸、颜色、对齐的矢量图标容器，纯展示原语（对齐 Semi Icon 基类）。',
  props: [
    {
      name: 'svg',
      type: 'string | Snippet',
      default: 'undefined',
      desc: 'SVG 字符串（{@html} 渲染，来源须可信）或自定义图标 Snippet（对齐 Semi svg）',
    },
    {
      name: 'size',
      type: "'inherit'|'extra-small'|'small'|'default'|'large'|'extra-large'",
      default: "'default'",
      desc: 'font-size 驱动尺寸：extra-small(8)/small(12)/default(16)/large(20)/extra-large(24)；inherit 继承上下文字号',
    },
    { name: 'spin', type: 'boolean', default: 'false', desc: '持续旋转，受 reduced-motion 抑制' },
    { name: 'rotate', type: 'number', default: 'undefined', desc: '静态旋转角度（deg）；仅安全整数生效' },
    {
      name: 'type',
      type: 'string',
      default: 'undefined',
      desc: '图标语义类型，映射到 aria-label 与 cd-icon-{type} 类（对齐 Semi）',
    },
    { name: 'fill', type: 'string', default: 'undefined', desc: '覆盖填充色（对齐 Semi fill；用于双色/多色图标改色）' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'style', type: 'string', default: "''", desc: '透传到根元素的内联样式' },
  ],
  events: [],
  slots: [{ name: 'children', desc: '自定义图标内容（svg 未传时的备选插槽）' }],
  a11y: { role: 'img', ariaLabelFrom: 'type', reducedMotion: true },
  // 无独立组件 token：尺寸走 font-size 档位（8/12/16/20/24），颜色随 CSS color / currentColor。
  tokens: [],
  examples: [{ title: '加载中', code: '<Icon spin svg={loadingSvg} />' }],
} as const;
