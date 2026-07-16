/**
 * Machine-readable component metadata for AI/docs consumption.
 * IconButton 严格对齐 Semi iconButton：带图标的 Button 薄封装，icon/children/ariaLabel 均可选。
 */
export const meta = {
  name: 'IconButton',
  category: 'basic',
  description: '带图标的 Button 薄封装（对齐 Semi iconButton）：icon 与 children(文字) 均可选，icon-only 只是无文字的分支。',
  stage: 'M1',
  semiEquivalent: 'IconButton',
  /** IconButton = Button 的薄封装（复用全部 Button 组装逻辑与 token）。 */
  relatedTo: 'Button',
  props: [
    { name: 'icon', type: 'Snippet', default: 'undefined', desc: '图标内容（可选）' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '文字内容（可选）；提供后非纯图标' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问名（透传到 aria-label）；纯图标按钮建议提供' },
    { name: 'type', type: "'primary'|'secondary'|'tertiary'|'warning'|'danger'", default: 'primary', desc: '语义类型' },
    { name: 'theme', type: "'solid'|'borderless'|'light'|'outline'", default: 'light', desc: '视觉变体' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default', desc: '尺寸三档' },
    { name: 'iconPosition', type: "'left'|'right'", default: 'left', desc: '图标相对文字位置（透传给 Button）' },
    { name: 'iconSize', type: "'inherit'|'extra-small'|'small'|'default'|'large'|'extra-large'", default: 'undefined', desc: '图标尺寸（作用在图标元素上，对齐 Semi）' },
    { name: 'iconStyle', type: 'string', default: 'undefined', desc: '图标内联样式（作用在图标元素上，对齐 Semi）' },
    { name: 'circle', type: 'boolean', default: 'false', desc: '圆形按钮（复用 Button circle）' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '加载态（spin 图标替换）' },
    { name: 'colorful', type: 'boolean', default: 'false', desc: 'AI 多彩' },
    { name: 'block', type: 'boolean', default: 'false', desc: '撑满容器宽度' },
    { name: 'noHorizontalPadding', type: "boolean|'left'|'right'|('left'|'right')[]", default: 'false', desc: '去水平内边距（仅 icon 时有效）' },
    { name: 'htmlType', type: "'button'|'submit'|'reset'", default: 'button', desc: '原生 type' },
    { name: 'contentClassName', type: 'string', default: 'undefined', desc: '内容区自定义类名（透传给 Button）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
  ],
  events: [
    { name: 'onclick', payload: 'MouseEvent', desc: 'disabled/loading 时不触发' },
    { name: 'onmousedown', payload: 'MouseEvent', desc: '鼠标按下' },
    { name: 'onmouseenter', payload: 'MouseEvent', desc: '鼠标移入' },
    { name: 'onmouseleave', payload: 'MouseEvent', desc: '鼠标移出' },
  ],
  slots: [
    { name: 'icon', desc: '图标内容（也可用 icon prop）' },
    { name: 'children', desc: '文字内容（提供后非纯图标）' },
  ],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], recommendedName: 'aria-label' },
  tokens: ['--cd-button-*'],
  doNot: ['纯图标按钮建议提供 ariaLabel（否则屏幕阅读器无可访问名）。'],
  examples: [
    { title: '基础图标按钮', code: '<IconButton icon={editIcon} ariaLabel="编辑" />' },
    { title: '图标+文字', code: '<IconButton icon={plusIcon}>新增</IconButton>' },
    { title: '圆形', code: '<IconButton circle icon={plusIcon} ariaLabel="新增" />' },
  ],
} as const;
