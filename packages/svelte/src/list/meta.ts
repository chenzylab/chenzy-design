/**
 * Machine-readable component metadata for AI/docs consumption.
 * List — see specs/components/show/List.spec.md
 */
export const meta = {
  name: 'List',
  category: 'show',
  description:
    '列表：数据驱动渲染（dataSource + renderItem），支持 header/footer（string 或 Snippet）、bordered 外框、split 行间分隔线、loading 骨架/spinner 与空态（默认 Empty）。泛型组件。',
  exports: ['List'],
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
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
  ],
  events: [],
  slots: [
    { name: 'renderItem', desc: '行渲染（item, index）' },
    { name: 'header', desc: '头部 Snippet（与 header string 二选一）' },
    { name: 'footer', desc: '底部 Snippet' },
    { name: 'emptyContent', desc: '空态 Snippet' },
  ],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      'ul/li 原生列表语义',
      'loading 时根容器 aria-busy=true',
      '骨架行 aria-hidden=true，spinner aria-hidden=true',
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
    '--cd-radius-full',
    '--cd-radius-small',
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
