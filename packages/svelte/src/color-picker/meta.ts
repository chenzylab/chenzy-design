/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'ColorPicker',
  category: 'input',
  description:
    '颜色选择器：trigger 触发浮层面板（或 inline 内联），含 saturation 方块 + hue 条 + alpha 条 + 可切换格式（hex/rgb/hsv/hsl）的输入 + presets，对外以 hex 字符串通信。',
  props: [
    { name: 'value', type: 'string', default: 'undefined' },
    { name: 'defaultValue', type: 'string', default: "'#000000'" },
    { name: 'alpha', type: 'boolean', default: 'true' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'presets', type: 'string[]', default: '[]' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default', desc: '校验态，仅影响 trigger / inline 面板边框色' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'outputUppercase', type: 'boolean', default: 'true' },
    { name: 'format', type: "'hex'|'rgb'|'hsv'|'hsl'", default: 'undefined', desc: '受控：面板内显示/编辑的颜色格式（对外 onChange 仍为 hex）' },
    { name: 'defaultFormat', type: "'hex'|'rgb'|'hsv'|'hsl'", default: "'hex'", desc: '非受控初始格式' },
    { name: 'showFormatToggle', type: 'boolean', default: 'true', desc: '面板内显示格式切换下拉' },
    { name: 'inline', type: 'boolean', default: 'false', desc: '内联渲染面板，不使用 trigger 浮层' },
    { name: 'usePopover', type: 'boolean', default: 'false', desc: '等价于 !inline，显式启用 trigger 浮层（覆盖 inline）' },
    { name: 'topSlot', type: 'Snippet', default: 'undefined', desc: '面板顶部 slot' },
    { name: 'bottomSlot', type: 'Snippet', default: 'undefined', desc: '面板底部 slot' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素内联样式' },
    { name: 'height', type: 'number', default: '280', desc: '面板高度 px' },
    { name: 'width', type: 'number', default: '280', desc: '面板宽度 px' },
    { name: 'eyeDropper', type: 'boolean', default: 'true', desc: '支持 EyeDropper 时显示吸管按钮（降级隐藏）' },
    { name: 'recentColors', type: 'boolean', default: 'false', desc: '显示最近使用颜色行' },
    { name: 'recentMax', type: 'number', default: '8', desc: '最近颜色上限' },
    { name: 'onChange', type: '(hex: string) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'onFormatChange', type: "(format: 'hex'|'rgb'|'hsv'|'hsl') => void", default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'dialog',
    notes: [
      'trigger 含 aria-haspopup=dialog / aria-expanded',
      '浮层 role=dialog，打开经 useFocusTrap 陷入焦点、关闭归还 trigger',
      'saturation / hue / alpha handle 为 role=slider，含 aria-label 与 aria-valuenow',
      'hue / alpha / saturation 支持方向键微调；Home/End 跳极值；RTL 下水平方向键语义镜像',
      'presets 为 role=listbox + role=option，方向键漫游、Enter/Space 选中、Home/End 首末',
      'hex 输入含 label 与 aria-label',
      '格式切换为 select，含 aria-label',
      'Esc 与外部点击经 useDismiss 关闭浮层（inline 模式无浮层不挂 dismiss）',
    ],
  },
  tokens: ['--cd-color-picker-*', '--cd-focus-ring', '--cd-input-*', '--cd-color-*'],
} as const;
