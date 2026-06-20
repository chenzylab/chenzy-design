/**
 * Machine-readable component metadata for AI/docs consumption.
 * VirtualList — see specs/components/show/VirtualList.spec.md
 */
export const meta = {
  name: 'VirtualList',
  category: 'show',
  description:
    "虚拟滚动列表底座（泛型）：仅渲染可视区 + overscan 缓冲区高性能渲染超长列表。fixed 定高 O(1) 区间；dynamic 不定高（itemSize='auto'）用 estimatedItemSize 估算 + ResizeObserver 实测回填高度表，前缀和修正偏移/区间并做滚动偏移补偿。支持 vertical/horizontal（horizontal 仅 fixed 定宽，dynamic 退化为按 estimatedItemSize 的定宽）。提供 scrollToIndex 命令式跳转 API。内部容器滚动。自身无视觉，行渲染由 renderItem 提供。",
  exports: ['VirtualList'],
  props: [
    { name: 'data', type: 'T[]', default: '[]', desc: '列表数据数组' },
    {
      name: 'getKey',
      type: '(item: T, index: number) => string | number',
      default: '(_, i) => i',
      desc: '行唯一标识，用于 each key',
    },
    {
      name: 'itemSize',
      type: "number | 'auto'",
      default: '40',
      desc: "固定行高（px，fixed 定高）；传 'auto' 启用 dynamic 不定高测量",
    },
    {
      name: 'estimatedItemSize',
      type: 'number',
      default: '40',
      desc: 'dynamic 模式初始估算行高（px），用于首屏占位与总高估算',
    },
    { name: 'overscan', type: 'number', default: '3', desc: '可视区上下缓冲行数，消除白屏' },
    {
      name: 'height',
      type: 'number | string',
      default: '400',
      desc: '视口主轴尺寸（vertical 为高度、horizontal 为宽度）；数字按 px，字符串/百分比时用 ResizeObserver 测量',
    },
    {
      name: 'horizontal',
      type: 'boolean',
      default: 'false',
      desc: '横向虚拟化：沿 x 轴排列、itemSize 作列宽、读/写 scrollLeft（仅支持 fixed 定宽）',
    },
    {
      name: 'renderItem',
      type: 'Snippet<[item: T, index: number]>',
      default: 'required',
      desc: '行渲染 Snippet（必填）',
    },
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
  ],
  events: [],
  methods: [
    {
      name: 'scrollToIndex',
      type: "(index: number, opts?: { align?: 'start' | 'center' | 'end' }) => void",
      desc: '命令式滚动到指定索引项（bind:this 后调用）。align 默认 start；horizontal 时写 scrollLeft。index 自动 clamp。',
    },
  ],
  slots: [{ name: 'renderItem', desc: '行渲染（item, index）' }],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      '视口 role=list，可见行 role=listitem',
      '行带 aria-setsize（总数）与 aria-posinset（1 基序号）',
      '滚动监听命令式 + rAF 节流，不读 render 期 DOM 几何',
      'dynamic 行高用 ResizeObserver 命令式实测，cleanup 时 disconnect',
      'scrollToIndex 为命令式 DOM 写（scrollTop/scrollLeft），放导出函数，不在 render 期',
    ],
  },
  tokens: ['--cd-virtual-list-bg', '--cd-virtual-list-scrollbar'],
  examples: [
    {
      title: '基础',
      code:
        '{#snippet row(item, i)}<div>{i}: {item.label}</div>{/snippet}\n<VirtualList data={rows} itemSize={48} height={400} renderItem={row} />',
    },
    {
      title: 'dynamic 不定高',
      code:
        "{#snippet row(item, i)}<div>{item.text}</div>{/snippet}\n<VirtualList data={rows} itemSize=\"auto\" estimatedItemSize={48} height={300} renderItem={row} />",
    },
    {
      title: 'horizontal 横向',
      code:
        '{#snippet col(item, i)}<div style="width:100%">{i}</div>{/snippet}\n<VirtualList data={rows} horizontal itemSize={120} height={400} renderItem={col} />',
    },
    {
      title: 'scrollToIndex 命令式跳转',
      code:
        "let vl;\n<button onclick={() => vl.scrollToIndex(500, { align: 'center' })}>跳到第 500 项</button>\n<VirtualList bind:this={vl} data={rows} itemSize={36} renderItem={row} />",
    },
  ],
} as const;
