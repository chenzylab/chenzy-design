/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Divider.spec.md.
 */
export const meta = {
  name: 'Divider',
  category: 'basic',
  description: '分隔线，用于在视觉上分割内容区块，纯展示。',
  props: [
    { name: 'layout', type: "'horizontal'|'vertical'", default: "'horizontal'" },
    { name: 'dashed', type: 'boolean', default: 'false' },
    { name: 'align', type: "'left'|'center'|'right'", default: "'center'", desc: '横向带文字时的文字位置' },
    { name: 'margin', type: 'string|number', default: 'undefined', desc: '覆盖主轴外边距，number→px' },
    { name: 'thickness', type: 'number', default: '1', desc: '线宽（px）' },
    { name: 'plain', type: 'boolean', default: 'true', desc: 'false 时文字加粗' },
    { name: 'class', type: 'string', default: "''" },
  ],
  events: [],
  slots: [{ name: 'children', desc: '横向分隔线中间/侧边文字（vertical 忽略）' }],
  a11y: { role: 'separator', orientation: 'aria-orientation for vertical' },
  tokens: ['--cd-divider-color', '--cd-divider-thickness', '--cd-divider-spacing', '--cd-divider-text-*'],
  examples: [{ title: '带文字', code: '<Divider>章节</Divider>' }],
} as const;
