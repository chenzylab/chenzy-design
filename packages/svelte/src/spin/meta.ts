/**
 * Machine-readable component metadata for AI/docs consumption.
 * Spin — see specs/components/feedback/Spin.spec.md
 */
export const meta = {
  name: 'Spin',
  category: 'feedback',
  description:
    '加载指示器：inline / wrapper / fullscreen 三形态；delay 去抖 + minShowTime 最短显示（复用 @chenzy-design/core createSpinController）；role=status + aria-live=polite 公布加载，wrapper 内容 aria-busy；reduced-motion 下旋转退化为呼吸。spinning 受控不回写，显隐变化仅触发 onShow/onHide。',
  exports: ['Spin'],
  props: [
    { name: 'spinning', type: 'boolean', default: 'true', desc: '是否加载态；受控不回写' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'tip', type: 'string', default: "''", desc: '指示器下方文案，空则不渲染' },
    { name: 'delay', type: 'number', default: '0', desc: '延迟显示 ms（去抖）' },
    { name: 'minShowTime', type: 'number', default: '0', desc: '最短显示 ms' },
    { name: 'fullscreen', type: 'boolean', default: 'false', desc: '全屏固定覆盖' },
    { name: 'wrapperClassName', type: 'string', default: "''", desc: 'wrapper 外层自定义类' },
    { name: 'ariaLabel', type: 'string', default: "'加载中'", desc: '无 tip 时的可访问名' },
    {
      name: 'indicator',
      type: 'Snippet<[{ size }]>',
      default: 'undefined',
      desc: '自定义指示器',
    },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '提供则进入 wrapper 模式包裹内容',
    },
    { name: 'onShow', type: '() => void', default: 'undefined', desc: 'effective false→true' },
    { name: 'onHide', type: '() => void', default: 'undefined', desc: 'effective true→false' },
  ],
  events: [
    { name: 'onShow', desc: '有效显示态由 false 变 true（delay 后真正显示时触发）' },
    { name: 'onHide', desc: '有效显示态由 true 变 false（满足 minShowTime 后隐藏时触发）' },
  ],
  slots: [
    { name: 'children', desc: 'wrapper 模式下被遮罩包裹的内容' },
    { name: 'indicator', desc: '自定义指示器（接收 { size }）' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: 'role=status + aria-live=polite（隐式 aria-atomic）公布加载；无 tip 时 aria-label，有 tip 时 tip 文本即可访问名；wrapper 内容 effectiveSpinning 时 aria-busy=true 并 inert 阻断交互；内置 SVG aria-hidden；不捕获焦点；reduced-motion 旋转退化为 opacity 呼吸。',
  },
  tokens: [
    // Semi 全量对齐（spin/variables.scss）
    '--cd-color-spin-bg',
    '--cd-width-spin-large',
    '--cd-width-spin-middle',
    '--cd-width-spin-small',
    '--cd-opacity-spin-children',
    // chenzy-design 补充（组件消费）
    '--cd-spin-color',
    '--cd-spin-track-color',
    '--cd-spin-size-small',
    '--cd-spin-size-default',
    '--cd-spin-size-large',
    '--cd-spin-duration',
    '--cd-spin-duration-reduced',
    '--cd-spin-tip-gap',
    '--cd-spin-tip-color',
    '--cd-spin-tip-font-size',
    '--cd-spin-mask-bg',
    '--cd-spin-z',
    '--cd-spin-z-fullscreen',
    '--cd-spin-fade-duration',
  ],
  responsive: false,
  examples: [
    { title: 'inline', code: '<Spin spinning />' },
    {
      title: 'wrapper 包裹卡片',
      code: '<Spin spinning={loading}>\n  <Card>内容</Card>\n</Spin>',
    },
    { title: '带 tip', code: '<Spin spinning tip="加载中…" />' },
  ],
} as const;
