/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 * 严格对齐 Semi Design（semi-ui/input）：props / DOM / token 全部镜像 Semi。
 */
export const meta = {
  name: 'Input',
  category: 'input',
  semiEquivalent: 'Input',
  description: '单行文本录入框，支持前后缀、前后置标签、清除、计数、密码显隐与 IME。严格对齐 Semi。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'showClear', type: 'boolean', default: 'false', desc: '有内容且 hover/focus 时展示清除按钮（对齐 Semi showClear）' },
    { name: 'showCount', type: 'boolean', default: 'false', desc: '显示字符计数' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'validateStatus', type: "'default'|'warning'|'error'|'success'", default: "'default'", desc: '校验状态，仅影响展示样式（对齐 Semi validateStatus；success 合法但无特殊样式）' },
    { name: 'mode', type: "'password'", default: 'undefined', desc: '输入框模式，password 启用密码显隐按钮（对齐 Semi mode）' },
    { name: 'type', type: 'string', default: "'text'", desc: '原生 input type，透传（对齐 Semi type，可为 number/email/search 等）' },
    { name: 'prefix', type: 'Snippet', default: 'undefined', desc: '前缀标签（输入框内左侧）' },
    { name: 'suffix', type: 'Snippet', default: 'undefined', desc: '后缀标签（输入框内右侧）' },
    { name: 'insetLabel', type: 'Snippet | string', default: 'undefined', desc: '内嵌标签（与 prefix 同槽，对齐 Semi insetLabel）' },
    { name: 'insetLabelId', type: 'string', default: 'undefined', desc: '内嵌标签容器 id（对齐 Semi insetLabelId）' },
    { name: 'clearIcon', type: 'Snippet', default: 'undefined', desc: '自定义清除图标（showClear 有值时替换默认图标，对齐 Semi）' },
    { name: 'addonBefore', type: 'Snippet | string', default: 'undefined', desc: '前置标签（如 "https://"）' },
    { name: 'addonAfter', type: 'Snippet | string', default: 'undefined', desc: '后置标签（如 ".com"）' },
    { name: 'borderless', type: 'boolean', default: 'false', desc: '无边框模式（对齐 Semi borderless）' },
    { name: 'getValueLength', type: '(value: string) => number', default: 'undefined', desc: '自定义字符计数函数，替代默认长度（用于 showCount 与 maxLength 校验）' },
    { name: 'hideSuffix', type: 'boolean', default: 'false', desc: '清除按钮与后缀并存时隐藏后缀（对齐 Semi hideSuffix）' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根容器内联样式（对齐 Semi style）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根容器自定义类名（对齐 Semi className）' },
    { name: 'inputStyle', type: 'string', default: 'undefined', desc: 'input 元素内联样式（对齐 Semi inputStyle）' },
    { name: 'preventScroll', type: 'boolean', default: 'false', desc: '调用 focus() 时传入 { preventScroll }（对齐 Semi）' },
    { name: 'autoFocus', type: 'boolean', default: 'false', desc: '组件挂载时自动聚焦（对齐 Semi）' },
    { name: 'composition', type: 'boolean', default: 'false', desc: '输入法模式：开启后 IME 未确认期间不触发 onChange，确认后触发一次（对齐 Semi）' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'id', type: 'string', default: 'undefined', desc: '透传到原生 <input id>，供 <label for> 精确关联' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'ariaLabelledby', type: 'string', default: 'undefined', desc: '对齐 Semi aria-labelledby' },
    { name: 'ariaDescribedby', type: 'string', default: 'undefined', desc: '关联说明/错误文本' },
    { name: 'ariaErrormessage', type: 'string', default: 'undefined', desc: '对齐 Semi aria-errormessage' },
    { name: 'ariaRequired', type: 'boolean', default: 'undefined', desc: '必填语义（Form.Field required 透传）：输出 aria-required' },
    { name: 'onChange', type: '(value: string, e: Event) => void', default: 'undefined', desc: '内容变化（对齐 Semi：第二参为原生事件）' },
    { name: 'onInput', type: '(value: string, e: Event) => void', default: 'undefined' },
    { name: 'onClear', type: '(e: MouseEvent) => void', default: 'undefined', desc: '点击清除按钮（对齐 Semi：透传鼠标事件）' },
    { name: 'onEnterPress', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '回车按下（composition 中不触发）' },
    { name: 'onFocus', type: '(e: FocusEvent) => void', default: 'undefined' },
    { name: 'onBlur', type: '(e: FocusEvent) => void', default: 'undefined' },
    { name: 'onKeyDown', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '透传原生 keydown（对齐 Semi）' },
    { name: 'onKeyUp', type: '(e: KeyboardEvent) => void', default: 'undefined' },
    { name: 'onKeyPress', type: '(e: KeyboardEvent) => void', default: 'undefined' },
    { name: 'onCompositionStart', type: '(e: CompositionEvent) => void', default: 'undefined' },
    { name: 'onCompositionEnd', type: '(e: CompositionEvent) => void', default: 'undefined' },
    { name: 'onCompositionUpdate', type: '(e: CompositionEvent) => void', default: 'undefined' },
  ],
  methods: [
    { name: 'focus()', desc: '命令式聚焦输入框（尊重 preventScroll，对齐 Semi）' },
    { name: 'blur()', desc: '命令式移除焦点（对齐 Semi）' },
  ],
  a11y: {
    role: 'textbox',
    notes: ['原生 input', 'error 时 aria-invalid', '密码切换 aria-pressed', '清除按钮 aria-label'],
  },
  tokens: ['--cd-color-input-*', '--cd-height-input-*', '--cd-radius-input-wrapper', '--cd-spacing-input-*'],
} as const;

/**
 * InputGroup — 严格对齐 Semi（semi-ui/input/inputGroup.tsx）。
 * 单层 span role=group：相邻控件圆角合并 + ::after 分隔线；统一 size/disabled 经 context 回退透传。
 */
export const inputGroupMeta = {
  name: 'InputGroup',
  category: 'input',
  relatedTo: 'Input',
  semiEquivalent: 'InputGroup',
  description:
    '输入组合容器：将多个输入类控件（Input/Select/DatePicker 等）拼接为一体（相邻圆角合并 + 分隔线），统一 size/disabled 经 context 回退透传（控件显式 prop 优先），可选组 label。',
  exports: ['InputGroup'],
  props: [
    { name: 'size', type: "'small'|'default'|'large'", default: 'undefined', desc: '整组尺寸，回退透传子控件（子控件显式 size 优先）' },
    { name: 'disabled', type: 'boolean', default: 'undefined', desc: '整组禁用，回退透传子控件（子控件显式 disabled 优先）' },
    { name: 'label', type: '{ text?: string; name?: string; required?: boolean; width?: number|string }', default: 'undefined', desc: '整组标签（对齐 Semi LabelProps 子集）' },
    { name: 'labelPosition', type: "'top'|'left'", default: "'top'", desc: '标签位置' },
    { name: 'onFocus', type: '(e: FocusEvent) => void', default: 'undefined', desc: '组级聚焦（子控件 focusin 冒泡）' },
    { name: 'onBlur', type: '(e: FocusEvent) => void', default: 'undefined', desc: '组级失焦（子控件 focusout 冒泡）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '子输入控件' },
  ],
  events: [
    { name: 'onFocus', desc: '组内控件获得焦点' },
    { name: 'onBlur', desc: '组内控件失去焦点' },
  ],
  slots: [{ name: 'children', desc: '子输入控件（Input/Select/DatePicker 等）' }],
  a11y: {
    role: 'group',
    notes: ['单层 span role=group（对齐 Semi）', '有 label 时 label[for] 关联 group[id]', '各子控件保留自身 a11y'],
  },
  tokens: ['--cd-color-input-group-border-default', '--cd-width-input-group-pseudo-border', '--cd-radius-input-wrapper'],
} as const;
