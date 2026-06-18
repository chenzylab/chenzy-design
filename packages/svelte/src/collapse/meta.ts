/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Collapse',
  category: 'show',
  description:
    '折叠面板，分组承载内容、按需展开。支持数据驱动 panels、受控 activeKey、accordion 手风琴、展开动画、箭头位置与边框。',
  props: [
    { name: 'panels', type: 'CollapsePanel[]', default: '[]', desc: '面板头部数据' },
    {
      name: 'activeKey',
      type: 'string|string[]',
      default: 'undefined',
      desc: '受控展开键，仅 onChange 不回写',
    },
    { name: 'defaultActiveKey', type: 'string|string[]', default: 'undefined' },
    { name: 'accordion', type: 'boolean', default: 'false', desc: '手风琴模式，仅展开一个' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'expandIconPosition', type: "'left'|'right'", default: 'right' },
    { name: 'bordered', type: 'boolean', default: 'true' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '展开动画开关' },
    { name: 'onChange', type: '(keys: string[]) => void', default: 'undefined' },
    {
      name: 'children',
      type: 'Snippet<[{ key: string }]>',
      default: 'undefined',
      desc: '按 key 渲染面板内容',
    },
  ],
  a11y: {
    role: 'region',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      '面板头为原生 button，aria-expanded 标记展开态',
      'button aria-controls 指向内容 region，region aria-labelledby 指回头部',
      '折叠时内容区 hidden 移出可达性树',
      '箭头 aria-hidden=true',
    ],
  },
  tokens: [
    '--cd-collapse-*',
    '--cd-focus-ring',
    '--cd-radius-1',
    '--cd-spacing-2',
    '--cd-motion-ease-standard',
    '--cd-color-text-3',
  ],
} as const;
