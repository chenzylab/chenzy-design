/**
 * Machine-readable component metadata for AI/docs consumption.
 * OverflowList — see specs/components/show/OverflowList.spec.md
 */
export const meta = {
  name: 'OverflowList',
  category: 'show',
  description:
    '溢出列表：collapse 折叠模式把溢出项收纳进 +N 折叠节点（collapseFrom 决定从尾 end / 头 start 折叠），或 scroll 滚动模式不折叠改为可滚动容器；direction 支持 horizontal 横向 / vertical 纵向。ResizeObserver 命令式测量 + requestAnimationFrame 合批 + hysteresis 滞后防抖动，复用 @chenzy-design/core 收纳算法（computeOverflowPartition）。命令式方法（forceMeasure / scrollTo）延后。',
  exports: ['OverflowList'],
  props: [
    { name: 'items', type: 'T[]', default: '[]', desc: '数据驱动的列表项' },
    {
      name: 'size',
      type: "'small'|'default'|'large'",
      default: "'default'",
      desc: '影响 gap（small 4 / default 8 / large 12 px）',
    },
    {
      name: 'mode',
      type: "'collapse'|'scroll'",
      default: "'collapse'",
      desc: 'collapse 折叠溢出项为 +N（默认）；scroll 不折叠，可见层沿主轴可滚动',
    },
    {
      name: 'direction',
      type: "'horizontal'|'vertical'",
      default: "'horizontal'",
      desc: '主轴方向：横向（测项宽 + clientWidth）/ 纵向（测项高 + clientHeight，根容器需有高度约束）',
    },
    {
      name: 'collapseFrom',
      type: "'end'|'start'",
      default: "'end'",
      desc: 'collapse 模式下从尾部（end）还是头部（start）折叠；start 时折叠节点渲染在头部，尾部项保持可见',
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
    {
      title: 'start 头部折叠（保留尾部最新项）',
      code: '<OverflowList {items} collapseFrom="start">{#snippet item({ item })}<Tag>{item}</Tag>{/snippet}</OverflowList>',
    },
    {
      title: 'scroll 滚动模式（不折叠）',
      code: '<OverflowList {items} mode="scroll">{#snippet item({ item })}<Tag>{item}</Tag>{/snippet}</OverflowList>',
    },
    {
      title: 'vertical 纵向（容器需有高度）',
      code: '<div style="height:200px"><OverflowList {items} direction="vertical">{#snippet item({ item })}<Tag>{item}</Tag>{/snippet}</OverflowList></div>',
    },
  ],
} as const;
