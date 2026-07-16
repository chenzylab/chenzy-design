/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Checkbox',
  category: 'input',
  description: '多选框，可独立使用或置于 CheckboxGroup 中管理一组选项，支持半选态。',
  props: [
    { name: 'checked', type: 'boolean', default: 'undefined', desc: '受控选中；提供则为受控' },
    { name: 'defaultChecked', type: 'boolean', default: 'false', desc: '非受控初始选中' },
    { name: 'indeterminate', type: 'boolean', default: 'false', desc: '半选态（视觉横线）' },
    { name: 'value', type: 'string | number', default: 'undefined', desc: 'Group 内的标识值' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    {
      name: 'type',
      type: "'default'|'card'|'pureCard'",
      default: 'default',
      desc: '展示形态；card 带边框背景且整卡为命中区，pureCard 隐藏勾选框只留卡片。Group 透传，单项可覆盖',
    },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'extra', type: 'Snippet | string', default: 'undefined', desc: '辅助说明，支持富内容（对齐 Semi ReactNode），aria-describedby 关联' },
    { name: 'id', type: 'string', default: 'useId()' },
    { name: 'addonId', type: 'string', default: 'undefined', desc: '标签内容容器 id，经 aria-labelledby 关联为可访问名' },
    { name: 'extraId', type: 'string', default: 'undefined', desc: '辅助说明 id，未提供则由内部生成' },
    { name: 'preventScroll', type: 'boolean', default: 'undefined', desc: 'autoFocus 聚焦时是否阻止滚动（对齐 Semi）' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '无可见文本 label 时的可访问名' },
    { name: 'ariaInvalid', type: 'boolean', default: 'undefined', desc: '标记为无效（校验失败），对齐 Semi aria-invalid' },
    { name: 'role', type: 'string', default: 'undefined', desc: 'wrapper role（Group 内为 listitem）' },
    { name: 'onChange', type: '(e: CheckboxEvent) => void', default: 'undefined', desc: '对齐 Semi：回调收到事件对象，e.target.checked 为选中态' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '标签内容' },
  ],
  group: {
    name: 'CheckboxGroup',
    props: [
      { name: 'value', type: '(string|number)[]', default: 'undefined', desc: '受控选中集合' },
      { name: 'defaultValue', type: '(string|number)[]', default: '[]' },
      {
        name: 'options',
        type: 'Array<string|number|{label,value,disabled?,extra?}>',
        default: 'undefined',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      {
        name: 'type',
        type: "'default'|'card'|'pureCard'",
        default: 'default',
        desc: '统一展示形态透传子项',
      },
      { name: 'name', type: 'string', default: 'undefined' },
      { name: 'direction', type: "'horizontal'|'vertical'", default: 'vertical', desc: '组内布局方向（对齐 Semi 默认 vertical）' },
      { name: 'onChange', type: '(v: (string|number)[]) => void', default: 'undefined' },
      { name: 'children', type: 'Snippet', default: 'undefined' },
      { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '无可见标题时的可访问名（role=group）' },
      { name: 'ariaLabelledby', type: 'string', default: 'undefined', desc: '关联组可见标题 id（优先于 ariaLabel）' },
    ],
  },
  methods: [
    { name: 'focus()', desc: '命令式聚焦复选框（尊重 preventScroll），经组件实例调用（对齐 Semi）' },
    { name: 'blur()', desc: '命令式移除焦点（对齐 Semi）' },
  ],
  a11y: {
    role: 'checkbox',
    keyboard: ['Space'],
    notes: ['隐藏原生 input', 'indeterminate 用 DOM 属性', 'extra 经 aria-describedby 关联'],
  },
  tokens: ['--cd-checkbox-*', '--cd-focus-ring', '--cd-motion-*', '--cd-spacing-*'],
} as const;
