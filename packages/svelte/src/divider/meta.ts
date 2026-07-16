/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Divider.spec.md.
 */
export const meta = {
  name: 'Divider',
  category: 'basic',
  description: '分隔线，用于在视觉上分割内容区块，纯展示。严格对齐 Semi Design。',
  props: [
    { name: 'align', type: "'left'|'center'|'right'", default: "'center'", desc: '水平带内容时内容的对齐位置' },
    { name: 'margin', type: 'string|number', default: 'undefined', desc: '主轴外边距，number→px；vertical 作用于左右，horizontal 作用于上下' },
    { name: 'dashed', type: 'boolean', default: 'false', desc: '是否为虚线' },
    { name: 'layout', type: "'horizontal'|'vertical'", default: "'horizontal'", desc: '分割线方向' },
    { name: 'class', type: 'string', default: "''", desc: '附加类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '内联样式，优先级高于组件默认 margin' },
  ],
  events: [],
  slots: [{ name: 'children', desc: '水平分割线嵌入的文字/图标内容（vertical 忽略）' }],
  tokens: [
    '--cd-spacing-divider-horizontal-marginleft',
    '--cd-spacing-divider-horizontal-marginright',
    '--cd-spacing-divider-horizontal-margintop',
    '--cd-spacing-divider-horizontal-marginbottom',
    '--cd-spacing-divider-vertical-marginleft',
    '--cd-spacing-divider-vertical-marginright',
    '--cd-spacing-divider-vertical-margintop',
    '--cd-spacing-divider-vertical-marginbottom',
    '--cd-spacing-divider-inner-text-paddingleft',
    '--cd-spacing-divider-inner-text-paddingright',
    '--cd-spacing-divider-inner-text-paddingtop',
    '--cd-spacing-divider-inner-text-paddingbottom',
    '--cd-width-divider-inner-text-left-line',
    '--cd-width-divider-inner-text-right-line',
    '--cd-width-divider-border',
    '--cd-height-divider-vertical',
    '--cd-color-divider-border-color',
    '--cd-color-divider-text-default',
    '--cd-font-divider-text-weight',
  ],
  examples: [{ title: '带文字', code: '<Divider>章节</Divider>' }],
} as const;
