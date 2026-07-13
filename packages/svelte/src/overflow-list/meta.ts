/**
 * Machine-readable component metadata for AI/docs consumption.
 * OverflowList — 严格镜像 Semi Design OverflowList。
 */
export const meta = {
  name: 'OverflowList',
  category: 'show',
  description:
    '溢出折叠列表，严格镜像 Semi OverflowList。行为组件：展示列表并自适应展示尽可能多的项目，因过长而溢出的项折叠为一个元素，容器 resize 时重新计算可见项。renderMode="collapse"（默认）用 ResizeObserver 累加各项宽度找折叠点，溢出项收纳进 overflowRenderer 返回的节点，collapseFrom 决定从尾（end）/头（start）折叠，minVisibleItems 保底可见数；renderMode="scroll" 不折叠，可见层为可横向滚动容器，用 IntersectionObserver 观测各项，threshold 控制阈值，onIntersect/onVisibleStateChange 上报可见状态。渲染函数以 Svelte Snippet 形式提供（visibleItemRenderer/overflowRenderer）。',
  exports: ['OverflowList'],
  props: [
    { name: 'items', type: 'T[]', default: '[]', desc: '数据驱动的渲染项；scroll 模式要求每项含 key（或提供 itemKey）' },
    {
      name: 'renderMode',
      type: "'collapse'|'scroll'",
      default: "'collapse'",
      desc: '渲染模式：collapse 折叠（默认）/ scroll 滚动',
    },
    {
      name: 'collapseFrom',
      type: "'start'|'end'",
      default: "'end'",
      desc: 'collapse 模式折叠方向：end 尾部（默认）/ start 头部',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      default: '0',
      desc: 'collapse 模式最小可见项数目',
    },
    {
      name: 'threshold',
      type: 'number',
      default: '0.75',
      desc: 'scroll 模式触发溢出回调的 IntersectionObserver 阈值',
    },
    {
      name: 'itemKey',
      type: 'string|number|((item: T) => string|number)',
      default: 'undefined',
      desc: '取项 key：字段名或函数；缺省取 item.key',
    },
    {
      name: 'visibleItemRenderer',
      type: 'Snippet<[item: T, index: number]>',
      default: 'undefined',
      desc: '可见项渲染模板（对齐 Semi visibleItemRenderer）',
    },
    {
      name: 'overflowRenderer',
      type: 'Snippet<[overflowItems: T[]]>',
      default: 'undefined',
      desc: '溢出项渲染模板（对齐 Semi overflowRenderer）。collapse 收全部溢出项；scroll 分别收 [头部溢出, 尾部溢出] 二次调用渲染在两端',
    },
    {
      name: 'onOverflow',
      type: '(overflowItems: T[]) => void',
      default: 'undefined',
      desc: 'collapse 模式溢出项变化回调（去重）',
    },
    {
      name: 'onIntersect',
      type: '(res: Record<string, IntersectionObserverEntry>) => void',
      default: 'undefined',
      desc: 'scroll 模式相交状态回调',
    },
    {
      name: 'onVisibleStateChange',
      type: '(visibleState: Map<string, boolean>) => void',
      default: 'undefined',
      desc: 'scroll 模式可见状态变化回调',
    },
    {
      name: 'wrapperClass',
      type: 'string',
      default: "''",
      desc: 'scroll 模式滚动 wrapper 类名（对齐 Semi wrapperClassName）',
    },
    {
      name: 'wrapperStyle',
      type: 'string',
      default: "''",
      desc: 'scroll 模式滚动 wrapper 内联样式（对齐 Semi wrapperStyle）',
    },
    { name: 'style', type: 'string', default: "''", desc: '根节点内联样式' },
    { name: 'class', type: 'string', default: "''", desc: '根节点附加类名' },
  ],
  events: [
    { name: 'onOverflow', desc: 'collapse 模式溢出项变化时回调，携带 overflowItems' },
    { name: 'onIntersect', desc: 'scroll 模式各项相交状态回调，携带 { key: IntersectionObserverEntry }' },
    { name: 'onVisibleStateChange', desc: 'scroll 模式可见状态 Map 变化回调' },
  ],
  methods: [],
  slots: [
    { name: 'visibleItemRenderer', desc: '单个可见项渲染模板（item, index）' },
    { name: 'overflowRenderer', desc: '溢出节点渲染模板（overflowItems）' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '行为组件，不注入语义角色（对齐 Semi）；DOM 结构 cd-overflow-list > cd-overflow-list-item / cd-overflow-list-overflow / cd-overflow-list-scroll-wrapper；可见/溢出/焦点语义由 visibleItemRenderer/overflowRenderer 提供的宿主内容决定。',
  },
  tokens: [],
  responsive: true,
  examples: [
    {
      title: '折叠模式（默认）',
      code: '<OverflowList {items}>\n  {#snippet visibleItemRenderer(item)}<Tag color="blue">{item.key}</Tag>{/snippet}\n  {#snippet overflowRenderer(rest)}{#if rest.length}<Tag>+{rest.length}</Tag>{/if}{/snippet}\n</OverflowList>',
    },
    {
      title: '折叠方向 collapseFrom="start"',
      code: '<OverflowList {items} collapseFrom="start">\n  {#snippet visibleItemRenderer(item)}<Tag>{item.key}</Tag>{/snippet}\n  {#snippet overflowRenderer(rest)}{#if rest.length}<Tag>+{rest.length}</Tag>{/if}{/snippet}\n</OverflowList>',
    },
    {
      title: '最小展示数目 minVisibleItems',
      code: '<OverflowList {items} minVisibleItems={3}>…</OverflowList>',
    },
    {
      title: '滚动模式 renderMode="scroll"',
      code: '<OverflowList {items} renderMode="scroll">\n  {#snippet visibleItemRenderer(item)}<Tag>{item.key}</Tag>{/snippet}\n  {#snippet overflowRenderer(rest)}{#each rest as it}<Tag>{it.key}</Tag>{/each}{/snippet}\n</OverflowList>',
    },
  ],
} as const;
