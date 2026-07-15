/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'IconButton',
  category: 'basic',
  description: '纯图标按钮：等价于 Button 传 icon 且无文字，但强制 ariaLabel 必填以保证可访问名。',
  stage: 'M1',
  semiEquivalent: 'Button (icon-only)',
  /** IconButton = Button icon-only 的便捷封装（复用全部 Button 逻辑与 token）。 */
  relatedTo: 'Button',
  props: [
    { name: 'icon', type: 'Snippet', default: 'undefined', desc: '必填。图标内容。' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '必填。可访问名；dev 缺失时 console.warn。' },
    { name: 'type', type: "'primary'|'secondary'|'tertiary'|'warning'|'danger'", default: 'primary', desc: '语义类型' },
    { name: 'theme', type: "'solid'|'borderless'|'light'|'outline'", default: 'light', desc: '视觉变体' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default', desc: '尺寸三档' },
    { name: 'iconPosition', type: "'left'|'right'", default: 'left', desc: '图标相对文字位置（透传给 Button）' },
    { name: 'circle', type: 'boolean', default: 'false', desc: '圆形按钮（复用 Button circle）' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '加载态（spin 图标替换）' },
    { name: 'colorful', type: 'boolean', default: 'false', desc: 'AI 多彩' },
    { name: 'noHorizontalPadding', type: "boolean|'left'|'right'|('left'|'right')[]", default: 'false', desc: '去水平内边距' },
    { name: 'htmlType', type: "'button'|'submit'|'reset'", default: 'button', desc: '原生 type' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
  ],
  events: [
    { name: 'onclick', payload: 'MouseEvent', desc: 'disabled/loading 时不触发' },
    { name: 'onmousedown', payload: 'MouseEvent', desc: '鼠标按下' },
    { name: 'onmouseenter', payload: 'MouseEvent', desc: '鼠标移入' },
    { name: 'onmouseleave', payload: 'MouseEvent', desc: '鼠标移出' },
  ],
  slots: [{ name: 'icon', desc: '图标内容（也可用 icon prop）' }],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], requiredName: 'aria-label' },
  tokens: ['--cd-button-*'],
  doNot: [
    '不要漏 ariaLabel（无可访问名，屏幕阅读器无法读出）。',
    '不要用它承载图标+文字（那用 Button，icon + children）。',
  ],
  examples: [
    { title: '基础图标按钮', code: '<IconButton icon={editIcon} ariaLabel="编辑" />' },
    { title: '圆形', code: '<IconButton circle icon={plusIcon} ariaLabel="新增" />' },
    { title: '危险操作', code: '<IconButton type="danger" icon={trashIcon} ariaLabel="删除" />' },
  ],
} as const;
