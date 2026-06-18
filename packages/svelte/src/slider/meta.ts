/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Slider',
  category: 'input',
  description: '在连续/离散区间内选值的滑块，支持单值与 range、刻度、垂直方向与全键盘操作。',
  props: [
    { name: 'value', type: 'number | [number, number]', default: 'undefined', desc: '受控值；range 时为二元组' },
    { name: 'defaultValue', type: 'number | [number, number]', default: 'min / [min,min]', desc: '非受控初始值' },
    { name: 'min', type: 'number', default: '0' },
    { name: 'max', type: 'number', default: '100' },
    { name: 'step', type: 'number | null', default: '1', desc: 'null 时仅停靠 marks 键' },
    { name: 'range', type: 'boolean', default: 'false', desc: '双滑块区间模式' },
    { name: 'marks', type: 'Record<number, string>', default: 'undefined', desc: '刻度标记' },
    { name: 'included', type: 'boolean', default: 'true', desc: '是否填充已选轨道段' },
    { name: 'vertical', type: 'boolean', default: 'false' },
    { name: 'height', type: 'number', default: '200', desc: '垂直模式高度（px）' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: number | [number, number]) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'slider',
    keyboard: ['ArrowUp/Right', 'ArrowDown/Left', 'PageUp', 'PageDown', 'Home', 'End'],
    notes: [
      '根容器 role=group，每个手柄 role=slider + tabindex=0',
      '手柄 aria-valuemin/valuemax/valuenow/aria-orientation',
      'range 模式两手柄不交叉（越过自动交换）',
      '拖拽命令式：pointerdown 读一次 rail rect，document 监听 pointermove/up',
      'disabled→aria-disabled，手柄 tabindex=-1',
    ],
  },
  tokens: ['--cd-slider-*', '--cd-color-text-3', '--cd-spacing-*', '--cd-radius-full', '--cd-shadow-1', '--cd-focus-ring', '--cd-motion-*'],
} as const;
