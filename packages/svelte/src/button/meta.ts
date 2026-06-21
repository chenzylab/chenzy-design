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
    { name: 'iconPosition', type: "'left'|'right'", default: 'left', desc: '图标相对文字位置' },
    { name: 'href', type: 'string', default: 'undefined', desc: '提供则渲染为链接' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '仅图标按钮必填' },
  ],
  events: [{ name: 'onclick', payload: 'MouseEvent', desc: 'disabled/loading 时不触发' }],
  slots: [
    { name: 'children', desc: '按钮文本' },
    { name: 'icon', desc: '图标' },
  ],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'] },
  tokens: ['--cd-button-*'],
  examples: [{ title: '基础', code: '<Button type="primary">确定</Button>' }],
} as const;
