/**
 * Machine-readable component metadata for AI/docs consumption.
 * List — see specs/components/show/List.spec.md
 */
export const meta = {
  name: 'List',
  category: 'show',
  description:
    '列表：数据驱动渲染（dataSource + renderItem），支持 header/footer（string 或 Snippet）、bordered 外框、split 行间分隔线、loading 骨架/spinner 与空态（默认 Empty）。泛型组件。',
  exports: ['List', 'ListItem', 'ListMeta'],
  subComponents: ['List.Item', 'List.Item.Meta', 'List.Meta'],
  props: [
    { name: 'dataSource', type: 'T[]', default: '[]', desc: '列表数据数组' },
    {
      name: 'renderItem',
      type: 'Snippet<[item: T, index: number]>',
      default: 'undefined',
      desc: '行渲染 Snippet',
    },
    {
      name: 'rowKey',
      type: 'string|((item: T) => string|number)',
      default: "'key'",
      desc: '行唯一标识，用于 each key',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'", desc: '行内边距尺寸' },
    { name: 'bordered', type: 'boolean', default: 'false', desc: '外层边框 + 圆角' },
    { name: 'split', type: 'boolean', default: 'true', desc: '行间分隔线' },
    { name: 'header', type: 'string|Snippet', default: 'undefined', desc: '头部内容' },
    { name: 'footer', type: 'string|Snippet', default: 'undefined', desc: '底部内容' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '加载态，覆盖 body' },
    { name: 'loadingSkeleton', type: 'boolean', default: 'false', desc: 'loading 时用骨架行替代 spinner' },
    { name: 'skeletonCount', type: 'number', default: '3', desc: '骨架占位行数' },
    {
      name: 'emptyContent',
      type: 'string|Snippet',
      default: 'undefined',
      desc: '空数据展示内容，默认内置 Empty',
    },
    { name: 'grid', type: 'number | { column?: number; gutter?: number }', default: 'undefined', desc: '网格布局列数/间距' },
    { name: 'loadMore', type: 'Snippet', default: 'undefined', desc: '自定义底部加载区' },
    { name: 'onLoadMore', type: '() => void', default: 'undefined', desc: '内置加载更多按钮回调' },
    { name: 'loadingMore', type: 'boolean', default: 'false', desc: '内置按钮 loading 态' },
    { name: 'hasMore', type: 'boolean', default: 'false', desc: '是否还有更多数据' },
    { name: 'pagination', type: 'false | { pageSize?, current?, defaultCurrent?, onChange? }', default: 'undefined', desc: '分页（切片当页，与 loadMore 互斥优先）' },
    { name: 'virtualized', type: 'false | { itemSize?: number|"auto"; estimatedItemSize?: number; height: number|string; overscan?: number }', default: 'false', desc: '虚拟化：仅渲染视口内行，定高/动态测高，复用 core 区间数学（与 grid/pagination 互斥，优先生效）' },
    { name: 'selectable', type: "false | 'single' | 'multiple'", default: 'false', desc: '行可选模式：单选/多选（listbox/option 语义）' },
    { name: 'selectedKeys', type: '(string|number)[]', default: 'undefined', desc: '受控选中 key 集合（不回写，仅 onSelectionChange 回调）' },
    { name: 'defaultSelectedKeys', type: '(string|number)[]', default: '[]', desc: '非受控初始选中 key 集合' },
    { name: 'onSelectionChange', type: '(keys, { item, key, selected }) => void', default: 'undefined', desc: '选中态变更回调（受控/非受控均触发）' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式用法：内嵌 <List.Item>（不传 dataSource 时生效）' },
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
  ],
  capabilities: ['data-render', 'pagination', 'load-more', 'virtualized', 'grid', 'selectable', 'declarative-items', 'empty/loading-state'],
  methods: [
    { name: 'scrollToIndex', type: "(index: number, opts?: { align?: 'start'|'center'|'end' }) => void", desc: '虚拟化模式命令式滚动到指定索引项' },
  ],
  events: [
    { name: 'onSelectionChange', payload: '(keys, { item, key, selected })', desc: 'selectable 选中态变更' },
  ],
  slots: [
    { name: 'renderItem', desc: '行渲染（item, index）' },
    { name: 'header', desc: '头部 Snippet（与 header string 二选一）' },
    { name: 'footer', desc: '底部 Snippet' },
    { name: 'emptyContent', desc: '空态 Snippet' },
    { name: 'children', desc: '声明式 <List.Item> 子项（不传 dataSource 时）' },
  ],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      'ul/li 原生列表语义；selectable 时容器 role=listbox（multiple 加 aria-multiselectable），行 role=option + aria-selected',
      'selectable 行 tabindex=0，Space/Enter 切换选中；multiple 支持 shift 连选',
      'loading 时根容器 aria-busy=true',
      '骨架行 aria-hidden=true，spinner aria-hidden=true',
      '虚拟化行带 aria-setsize/aria-posinset',
    ],
  },
  tokens: [
    '--cd-list-bg',
    '--cd-list-border',
    '--cd-list-radius',
    '--cd-list-item-padding',
    '--cd-list-item-padding-small',
    '--cd-list-split-color',
    '--cd-list-header-color',
    '--cd-list-item-color',
    '--cd-border-radius-full',
    '--cd-border-radius-small',
    '--cd-color-primary',
  ],
  examples: [
    {
      title: '基础',
      code:
        '{#snippet item(d)}<span>{d.title}</span>{/snippet}\n<List dataSource={data} renderItem={item} bordered />',
    },
  ],
} as const;
