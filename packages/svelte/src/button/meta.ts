/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Button',
  category: 'basic',
  description: '触发即时操作的按钮，最基础的交互原子。',
  props: [
    { name: 'type', type: "'primary'|'secondary'|'tertiary'|'warning'|'danger'", default: 'secondary' },
    { name: 'theme', type: "'solid'|'borderless'|'light'|'outline'", default: 'light' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'block', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'loading', type: 'boolean', default: 'false' },
    { name: 'colorful', type: 'boolean', default: 'false', desc: 'AI 多彩按钮：solid/light 主题下用品牌渐变背景' },
    { name: 'iconPosition', type: "'left'|'right'", default: 'left', desc: '图标相对文字位置' },
    { name: 'noHorizontalPadding', type: "boolean|'left'|'right'|('left'|'right')[]", default: 'false', desc: '仅 icon 时去单/双侧水平内距' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '仅图标按钮必填' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
    { name: 'contentClassName', type: 'string', default: 'undefined', desc: '内容区自定义类名' },
  ],
  events: [
    { name: 'onclick', payload: 'MouseEvent', desc: 'disabled/loading 时不触发' },
    { name: 'onmousedown', payload: 'MouseEvent', desc: '鼠标按下' },
    { name: 'onmouseenter', payload: 'MouseEvent', desc: '鼠标移入' },
    { name: 'onmouseleave', payload: 'MouseEvent', desc: '鼠标移出' },
  ],
  slots: [
    { name: 'children', desc: '按钮文本' },
    { name: 'icon', desc: '图标' },
  ],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'] },
  tokens: ['--cd-button-*'],
  examples: [{ title: '基础', code: '<Button type="primary">确定</Button>' }],
} as const;
