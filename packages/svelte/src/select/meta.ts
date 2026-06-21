/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Select',
  category: 'input',
  description: '下拉选择器，支持单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。',
  props: [
    { name: 'value', type: 'string|number|(string|number)[]', default: 'undefined' },
    { name: 'defaultValue', type: 'string|number|(string|number)[]', default: 'undefined' },
    { name: 'options', type: 'OptionData[] | OptionGroup[]', default: '[]', desc: '选项；含 { label, options:[] } 即分组' },
    { name: 'multiple', type: 'boolean', default: 'false' },
    { name: 'filter', type: 'boolean', default: 'false' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'placeholder', type: 'string', default: "'请选择'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'maxTagCount', type: 'number', default: '0', desc: '多选 tag 超出折叠为 +N（0=不折叠）' },
    { name: 'maxTagTextLength', type: 'number', default: 'undefined', desc: '单个 Tag 文本最大长度，超出截断为「前缀…」，完整文本经 title 查看' },
    { name: 'allowCreate', type: 'boolean', default: 'false', desc: 'filter 无匹配时可创建新选项' },
    { name: 'onSearch', type: '(query: string) => void', default: 'undefined', desc: '远程搜索（防抖回调，外部更新 options）' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '远程加载中（显示 spinner）' },
    { name: 'searchDebounce', type: 'number', default: '300', desc: 'onSearch 防抖毫秒' },
    { name: 'virtualized', type: 'boolean', default: 'false', desc: '选项虚拟化：大数据下拉只渲染视口内 option（仅非分组生效，分组时回退全量）' },
    { name: 'optionHeight', type: 'number', default: '32', desc: '虚拟化选项行高（px），需与样式实际行高一致' },
    { name: 'maxHeight', type: 'number', default: '256', desc: '下拉最大高度（px）；虚拟化时同时作为视口高度' },
    { name: 'onChange', type: '(v: string|number|(string|number)[]) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'combobox',
    notes: [
      'combobox + listbox + option ARIA 模式',
      'aria-activedescendant 指向高亮项',
      '选中项 aria-selected；多选 aria-multiselectable',
      '键盘：↑↓ 移动、Enter 选中、Esc 关闭',
    ],
  },
  tokens: ['--cd-select-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
