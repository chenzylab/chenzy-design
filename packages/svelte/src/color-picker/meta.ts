/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'ColorPicker',
  category: 'input',
  description:
    '颜色选择器：严格对齐 Semi。inline 直接渲染选色面板（saturation 方块 + hue 条 + alpha 条 + DataPart 输入区），usePopover 时包裹浮层。值为 Semi ColorValue 对象 { hsva, rgba, hex }，经 onChange 通信。',
  props: [
    { name: 'value', type: 'ColorValue', default: 'undefined', desc: '受控值（{ hsva, rgba, hex }，hsva 的 s/v 为 0-100）' },
    { name: 'defaultValue', type: 'ColorValue', default: '品牌绿 #39c5bb', desc: '非受控初始值（对齐 Semi defaultProps）' },
    { name: 'alpha', type: 'boolean', default: 'false', desc: '显示 alpha 透明度滑条与百分比输入' },
    { name: 'width', type: 'number', default: '280', desc: '面板宽度 px（对齐 Semi width）' },
    { name: 'height', type: 'number', default: '280', desc: 'saturation 方块高度 px（对齐 Semi height）' },
    { name: 'defaultFormat', type: "'hex'|'rgba'|'hsva'", default: "'hex'", desc: 'DataPart 输入区初始格式（不受控，对齐 Semi）' },
    { name: 'eyeDropper', type: 'boolean', default: 'true', desc: '支持 EyeDropper 时显示吸管按钮（降级隐藏）' },
    { name: 'usePopover', type: 'boolean', default: 'false', desc: '浮层模式：包裹 Popover，children 作触发器（对齐 Semi usePopover）' },
    { name: 'popoverProps', type: 'PopoverProps', default: 'undefined', desc: '透传内部 Popover 属性（仅 usePopover）' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '自定义触发器（仅 usePopover；缺省渲染默认色块，对齐 Semi children）' },
    { name: 'topSlot', type: 'Snippet', default: 'undefined', desc: '面板顶部 slot（对齐 Semi topSlot）' },
    { name: 'bottomSlot', type: 'Snippet', default: 'undefined', desc: '面板底部 slot（对齐 Semi bottomSlot）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名（对齐 Semi className）' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素内联样式（对齐 Semi style）' },
    { name: 'onChange', type: '(value: ColorValue) => void', default: 'undefined', desc: '值变化回调（回 ColorValue 对象）' },
  ],
  a11y: {
    role: 'slider',
    notes: [
      'saturation / hue / alpha 均为 role=slider，含 aria-label 与 aria-valuenow',
      'saturation / hue / alpha 支持方向键微调；Home/End 跳极值',
      'DataPart 复用 Input / InputNumber / Select / Button，各自携带 aria-label / 无障碍',
      'usePopover 时浮层由 Popover 承载（含 focus trap / dismiss / Esc）',
    ],
  },
  tokens: [
    // Semi 全量对齐（semi-foundation/colorPicker/variables.scss 20 个，均被组件真消费）
    '--cd-radius-color-picker-topleft',
    '--cd-radius-color-picker-topright',
    '--cd-radius-color-picker-bottomleft',
    '--cd-radius-color-picker-bottomright',
    '--cd-radius-color-picker-handle',
    '--cd-radius-color-picker-alphasliderinner',
    '--cd-radius-color-picker-demoblock',
    '--cd-radius-color-picker-defaulttrigger',
    '--cd-width-color-picker-handle-border',
    '--cd-width-color-picker-colorpickerinputnumber',
    '--cd-width-color-picker-formatselect',
    '--cd-width-color-picker-defaulttrigger',
    '--cd-color-color-picker-handle-border',
    '--cd-spacing-color-picker-inputnumbersuffix-horizontal',
    '--cd-spacing-color-picker-inputgroup-marginleft',
    '--cd-spacing-color-picker-popover-padding',
    '--cd-spacing-color-picker-inputnumbersuffix-vertical',
    '--cd-spacing-color-picker-slider-margintop',
    '--cd-spacing-color-picker-datapart-margintop',
    '--cd-font-color-picker-inputnumbersuffix-fontsize',
    // chenzy 补充消费段（Semi 靠 renderPicker 传入，无对应字面量 token）
    '--cd-color-picker-handle-size',
    '--cd-color-picker-handle-shadow',
    '--cd-color-picker-slider-height',
    // 跨组件共享语义 token
    '--cd-focus-ring',
  ],
} as const;
