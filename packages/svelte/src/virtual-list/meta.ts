/**
 * Machine-readable component metadata for AI/docs consumption.
 * VirtualList — see specs/components/show/VirtualList.spec.md
 */
export const meta = {
  name: 'VirtualList',
  category: 'show',
  description:
    '虚拟滚动列表底座（泛型）：仅渲染可视区 + overscan 缓冲区，O(1) 区间计算高性能渲染超长列表。基础子集为 fixed 定高 + vertical + 内部容器滚动。自身无视觉，行渲染由 renderItem 提供。',
  exports: ['VirtualList'],
  props: [
    { name: 'data', type: 'T[]', default: '[]', desc: '列表数据数组' },
    {
      name: 'getKey',
      type: '(item: T, index: number) => string | number',
      default: '(_, i) => i',
      desc: '行唯一标识，用于 each key',
    },
    { name: 'itemSize', type: 'number', default: '40', desc: '固定行高（px，fixed 定高）' },
    { name: 'overscan', type: 'number', default: '3', desc: '可视区上下缓冲行数，消除白屏' },
    {
      name: 'height',
      type: 'number | string',
      default: '400',
      desc: '视口高度；数字按 px，字符串/百分比时用 ResizeObserver 测量',
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
  slots: [{ name: 'renderItem', desc: '行渲染（item, index）' }],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      '视口 role=list，可见行 role=listitem',
      '行带 aria-setsize（总数）与 aria-posinset（1 基序号）',
      '滚动监听命令式 + rAF 节流，不读 render 期 DOM 几何',
    ],
  },
  tokens: ['--cd-virtual-list-bg', '--cd-virtual-list-scrollbar'],
  examples: [
    {
      title: '基础',
      code:
        '{#snippet row(item, i)}<div>{i}: {item.label}</div>{/snippet}\n<VirtualList data={rows} itemSize={48} height={400} renderItem={row} />',
    },
  ],
} as const;
