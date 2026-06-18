/**
 * Machine-readable component metadata for AI/docs consumption.
 * OverflowList — see specs/components/show/OverflowList.spec.md
 */
export const meta = {
  name: 'OverflowList',
  category: 'show',
  description:
    '溢出折叠列表：容器放不下时把尾部溢出项收纳进 +N 折叠节点。ResizeObserver 命令式测量 + requestAnimationFrame 合批 + hysteresis 滞后防抖动，复用 @chenzy-design/core 收纳算法。本子集为 collapse 折叠模式 + end 方向；scroll 模式 / vertical 纵向 / start 方向折叠 / 命令式方法均延后。',
  exports: ['OverflowList'],
  props: [
    { name: 'items', type: 'T[]', default: '[]', desc: '数据驱动的列表项' },
    {
      name: 'size',
      type: "'small'|'default'|'large'",
      default: "'default'",
      desc: '影响 gap（small 4 / default 8 / large 12 px）',
    },
    { name: 'gap', type: 'number', default: 'undefined', desc: '显式覆盖项间距（px）' },
    {
      name: 'minVisibleItems',
      type: 'number',
      default: '0',
      desc: '永不折叠到少于该数量的可见项',
    },
    {
      name: 'alwaysVisibleIndexes',
      type: 'number[]',
      default: '[]',
      desc: '永不被折叠的项索引',
    },
    {
      name: 'threshold',
      type: 'number',
      default: '8',
      desc: 'hysteresis 滞后阈值（px），抑制边界宽度抖动',
    },
    {
      name: 'item',
      type: 'Snippet<[{ item: T; index: number }]>',
      default: 'undefined',
      desc: '渲染单个可见项',
    },
    {
      name: 'overflow',
      type: 'Snippet<[{ overflowItems: T[]; overflowCount: number }]>',
      default: 'undefined',
      desc: '自定义折叠节点；缺省渲染 +N 按钮',
    },
    {
      name: 'onOverflowChange',
      type: '(info: { overflowCount: number; visibleCount: number; overflowItems: T[] }) => void',
      default: 'undefined',
      desc: '收纳结果变化时通知（去重，仅真实变化触发）',
    },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '容器无障碍标签' },
    { name: 'class', type: 'string', default: "''", desc: '附加根类名' },
  ],
  events: [
    {
      name: 'onOverflowChange',
      desc: '可见数 / 溢出数变化时回调，携带 overflowItems',
    },
  ],
  slots: [
    { name: 'item', desc: '单个可见项渲染模板' },
    { name: 'overflow', desc: '自定义 +N 折叠节点' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '根容器 role=group 透明保留子项语义；折叠节点为 button + aria-label「显示其余 N 项」；离屏测量层 aria-hidden 且不进 Tab 序（tabindex=-1）；被折叠项随之移出 Tab 序。',
  },
  tokens: [
    '--cd-overflow-list-gap',
    '--cd-overflow-list-gap-small',
    '--cd-overflow-list-gap-large',
    '--cd-overflow-list-overflow-color',
    '--cd-overflow-list-overflow-color-hover',
    '--cd-overflow-list-overflow-bg',
    '--cd-overflow-list-overflow-bg-hover',
    '--cd-overflow-list-overflow-radius',
    '--cd-overflow-list-focus-ring',
  ],
  responsive: true,
  examples: [
    {
      title: '基础工具栏收纳',
      code: '<OverflowList items={tags}>{#snippet item({ item })}<Tag>{item}</Tag>{/snippet}</OverflowList>',
    },
    {
      title: '自定义折叠节点',
      code: '<OverflowList {items}>\n  {#snippet item({ item })}<Tag>{item}</Tag>{/snippet}\n  {#snippet overflow({ overflowCount })}<Dropdown>更多 {overflowCount}</Dropdown>{/snippet}\n</OverflowList>',
    },
  ],
} as const;
