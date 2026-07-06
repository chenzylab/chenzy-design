/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Input',
  category: 'input',
  description: '单行文本录入框，支持前后缀、清除、计数、密码显隐与 IME。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'showCount', type: 'boolean', default: 'false' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'type', type: "'text'|'password'", default: 'text' },
    { name: 'prefix', type: 'Snippet', default: 'undefined' },
    { name: 'suffix', type: 'Snippet', default: 'undefined' },
    { name: 'addonBefore', type: 'Snippet | string', default: 'undefined', desc: '前置标签（在 input 框外左侧，如 "https://"）' },
    { name: 'addonAfter', type: 'Snippet | string', default: 'undefined', desc: '后置标签（在 input 框外右侧，如 ".com"）' },
    { name: 'borderless', type: 'boolean', default: 'false', desc: '无边框模式' },
    {
      name: 'getValueLength',
      type: '(value: string) => number',
      default: 'undefined',
      desc: '自定义字符计数函数，替代默认 value.length（用于 showCount 与 maxLength 校验）',
    },
    { name: 'hideSuffix', type: 'boolean', default: 'false', desc: '有值时隐藏 suffix' },
    { name: 'preventScroll', type: 'boolean', default: 'false', desc: '调用 focus() 时传入 { preventScroll }' },
    { name: 'autoFocus', type: 'boolean', default: 'false', desc: '组件挂载时自动聚焦' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'id', type: 'string', default: 'undefined', desc: '透传到原生 <input id>，供 <label for> 精确关联' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'ariaDescribedby', type: 'string', default: 'undefined', desc: '透传到 aria-describedby，关联说明/错误文本' },
    { name: 'ariaRequired', type: 'boolean', default: 'undefined', desc: '必填语义（Form.Field required 透传）：输出 aria-required' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onInput', type: '(v: string) => void', default: 'undefined' },
    { name: 'onClear', type: '() => void', default: 'undefined' },
    { name: 'onEnterPress', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '回车按下（spec on:enterPress）' },
    { name: 'onEnter', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '已废弃，改用 onEnterPress' },
    { name: 'onFocus', type: '(e: FocusEvent) => void', default: 'undefined' },
    { name: 'onBlur', type: '(e: FocusEvent) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'textbox',
    notes: ['原生 input', 'error 时 aria-invalid', '密码切换 aria-pressed', '清除按钮 aria-label'],
  },
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;

/**
 * InputGroup — see specs/components/input/InputGroup.spec.md
 * 把多个输入类控件无缝拼接为一组：相邻边框合并、首尾圆角、统一 size/disabled（context 回退透传）。
 */
export const inputGroupMeta = {
  name: 'InputGroup',
  category: 'input',
  relatedTo: 'Input',
  semiEquivalent: 'InputGroup',
  description:
    '输入组合容器：将多个输入类控件（Input/Select/DatePicker 等）拼接为一体（相邻边框合并、首尾圆角），统一 size/disabled 经 context 回退透传（控件显式 prop 优先），可选整组 label。',
  exports: ['InputGroup'],
  props: [
    { name: 'size', type: "'small'|'default'|'large'", default: 'undefined', desc: '整组尺寸，回退透传子控件（子控件显式 size 优先）' },
    { name: 'disabled', type: 'boolean', default: 'undefined', desc: '整组禁用，回退透传子控件（子控件显式 disabled 优先）' },
    { name: 'label', type: 'string', default: 'undefined', desc: '整组标签，关联 aria-labelledby' },
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
    notes: ['组容器 role=group', '有 label 时经 useId 关联 aria-labelledby', '各子控件保留自身 a11y'],
  },
  tokens: ['--cd-inputgroup-border', '--cd-inputgroup-radius', '--cd-inputgroup-label-gap'],
} as const;
