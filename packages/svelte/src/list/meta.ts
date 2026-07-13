/**
 * Machine-readable component metadata for AI/docs consumption.
 * List — 严格对齐 Semi Design（@douyinfe/semi-ui/list）。
 */
export const meta = {
  name: 'List',
  category: 'show',
  description:
    '列表：数据驱动渲染（dataSource + renderItem）或声明式内嵌 <List.Item>，支持 header/footer（string 或 Snippet）、bordered 外框、split 分隔线、layout（vertical/horizontal）、grid 栅格（复用 Row/Col）、loading（复用 Spin）与空态（缺省 locale emptyText）。严格镜像 Semi List API。',
  exports: ['List', 'ListItem'],
  subComponents: ['List.Item'],
  props: [
    { name: 'bordered', type: 'boolean', default: 'false', desc: '是否显示外框' },
    { name: 'dataSource', type: 'T[]', default: 'undefined', desc: '列表数据源' },
    {
      name: 'renderItem',
      type: 'Snippet<[item: T, index: number]>',
      default: 'undefined',
      desc: '使用 dataSource 时自定义渲染列表项',
    },
    {
      name: 'emptyContent',
      type: 'string | Snippet',
      default: 'undefined',
      desc: '空列表展示内容，缺省回退 locale List.emptyText',
    },
    { name: 'footer', type: 'string | Snippet', default: 'undefined', desc: '列表底部' },
    { name: 'header', type: 'string | Snippet', default: 'undefined', desc: '列表头部' },
    {
      name: 'layout',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      desc: '列表布局方向',
    },
    { name: 'loadMore', type: 'Snippet', default: 'undefined', desc: '加载更多按钮区' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '加载态，列表体外包裹 Spin' },
    { name: 'size', type: "'small' | 'default' | 'large'", default: "'default'", desc: '列表尺寸' },
    { name: 'split', type: 'boolean', default: 'true', desc: '是否展示分割线' },
    {
      name: 'grid',
      type: 'ListGrid',
      default: 'undefined',
      desc: '栅格配置（复用 Row/Col）：gutter/align/justify/wrap → Row，span/offset/order/push/pull/flex/xs..xxl → Col',
    },
    { name: 'style', type: 'string', default: 'undefined', desc: '根容器行内样式' },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '列表项点击回调（下发给 Item 作为回退）' },
    { name: 'onRightClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '列表项右键回调（下发给 Item 作为回退）' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式用法：内嵌 <List.Item>' },
    { name: 'class', type: 'string', default: "''", desc: '根类名' },
  ],
  itemProps: [
    { name: 'header', type: 'string | Snippet', default: 'undefined', desc: '列表项头内容' },
    { name: 'main', type: 'string | Snippet', default: 'undefined', desc: '列表项主体内容' },
    { name: 'extra', type: 'string | Snippet', default: 'undefined', desc: '列表项附加内容（右侧）' },
    {
      name: 'align',
      type: "'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'",
      default: "'flex-start'",
      desc: 'header 与 main 的垂直对齐方式',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '项内主内容' },
    { name: 'style', type: 'string', default: 'undefined', desc: '行内样式' },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '点击回调（自带优先，否则回退 List.onClick）' },
    { name: 'onRightClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '右键回调（自带优先，否则回退 List.onRightClick）' },
    { name: 'onMouseEnter', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标移入' },
    { name: 'onMouseLeave', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标移出' },
    { name: 'class', type: 'string', default: "''", desc: '根类名' },
  ],
  capabilities: ['data-render', 'declarative-items', 'grid', 'horizontal-layout', 'load-more', 'loading-state', 'empty-state'],
  slots: [
    { name: 'renderItem', desc: '行渲染（item, index）' },
    { name: 'header', desc: '头部 Snippet（与 header string 二选一）' },
    { name: 'footer', desc: '底部 Snippet' },
    { name: 'emptyContent', desc: '空态 Snippet' },
    { name: 'loadMore', desc: '加载更多区域 Snippet' },
    { name: 'children', desc: '声明式 <List.Item> 子项' },
  ],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      'ul/li 原生列表语义（cd-list-items > cd-list-item）',
      'loading 由 Spin 包裹提供 role=status（aria-live=polite）',
      '空态文案缺省来自 locale List.emptyText',
    ],
  },
  tokens: [
    // 严格对齐 Semi list/variables.scss（16 个，名/值一比一）
    '--cd-color-list-default-border-default',
    '--cd-color-list-empty-text-default',
    '--cd-spacing-list-empty-paddingx',
    '--cd-spacing-list-empty-paddingy',
    '--cd-spacing-list-footer-paddingx',
    '--cd-spacing-list-footer-paddingy',
    '--cd-spacing-list-item-paddingx',
    '--cd-spacing-list-item-paddingy',
    '--cd-spacing-list-small-paddingx',
    '--cd-spacing-list-small-paddingy',
    '--cd-spacing-list-large-paddingx',
    '--cd-spacing-list-large-paddingy',
    '--cd-spacing-list-header-marginright',
    '--cd-spacing-list-header-marginleft',
    '--cd-spacing-list-extra-marginleft',
    '--cd-spacing-list-extra-marginright',
  ],
  examples: [
    {
      title: '基础',
      code:
        "{#snippet item(d)}<List.Item>{d}</List.Item>{/snippet}\n<List dataSource={data} renderItem={item} bordered header={'Header'} footer={'Footer'} />",
    },
    {
      title: '模板',
      code:
        '{#snippet item(d)}<List.Item header={avatar} main={title} extra={actions} />{/snippet}\n<List dataSource={data} renderItem={item} />',
    },
  ],
} as const;
