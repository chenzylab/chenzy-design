/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Rating',
  category: 'input',
  description: '评分组件，支持半星、hover 预览、点击清零与键盘操作，遵循 APG Slider 模式。',
  props: [
    { name: 'value', type: 'number', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'number', default: '0', desc: '非受控初始值' },
    { name: 'count', type: 'number', default: '5', desc: '图标总数' },
    { name: 'allowHalf', type: 'boolean', default: 'false', desc: '允许半星（步进 0.5）' },
    { name: 'allowClear', type: 'boolean', default: 'true', desc: '点击当前值清零' },
    { name: 'character', type: 'string | Snippet<[{index,state,value}]>', default: 'undefined', desc: '自定义字符/图标；不传则默认星形' },
    { name: 'size', type: "'small'|'default'|'large'|number", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'tooltips', type: 'string[]', default: 'undefined', desc: '逐项提示文案（native title），长度应等于 count' },
    { name: 'autoFocus', type: 'boolean', default: 'false', desc: '挂载时聚焦' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'id', type: 'string', default: '自动生成', desc: '根元素 id，关联 aria' },
    { name: 'ariaLabel', type: 'string', default: 'i18n 默认', desc: '无可视标签时的辅助名' },
    { name: 'onChange', type: '(v: number) => void', default: 'undefined' },
    { name: 'onHoverChange', type: '(v: number) => void', default: 'undefined', desc: '悬停预览值变化；移出时为当前 value' },
  ],
  i18nKeys: ['Rating.ariaLabel', 'Rating.valueText', 'Rating.cleared', 'Rating.unrated'],
  a11y: {
    role: 'slider',
    keyboard: ['ArrowRight/Up', 'ArrowLeft/Down', 'Home', 'End', 'Delete', 'Backspace'],
    notes: [
      'role=slider + aria-valuenow/valuemin/valuemax/valuetext',
      'hover 预览为纯本地状态，不影响受控值',
      'allowHalf 时按指针落在星左/右半决定 .5',
      'disabled→aria-disabled，readonly→aria-readonly，error→aria-invalid',
    ],
  },
  tokens: ['--cd-rating-*', '--cd-color-warning', '--cd-color-danger', '--cd-focus-ring', '--cd-motion-*'],
} as const;
