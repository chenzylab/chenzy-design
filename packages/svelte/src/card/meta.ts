/**
 * Machine-readable component metadata for AI/docs consumption.
 * Card — see specs/components/show/Card.spec.md
 */
export const meta = {
  name: 'Card',
  category: 'show',
  description:
    '卡片容器：cover(出血) → header(title + extra) → body(children，loading 时骨架占位) → actions(底部等分操作)；bordered/shadow/hoverable 控制视觉，title 为 string 时 aria-labelledby 关联。',
  exports: ['Card'],
  props: [
    { name: 'title', type: 'string|Snippet', default: 'undefined', desc: '标题；string 时关联 aria-labelledby' },
    { name: 'extra', type: 'Snippet', default: 'undefined', desc: 'header 右侧内容' },
    { name: 'cover', type: 'Snippet', default: 'undefined', desc: '顶部出血封面' },
    { name: 'actions', type: 'Snippet', default: 'undefined', desc: '底部等分操作区' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'bordered', type: 'boolean', default: 'true' },
    {
      name: 'shadow',
      type: "'never'|'hover'|'always'",
      default: "'never'",
      desc: 'hover 时悬停抬升',
    },
    { name: 'hoverable', type: 'boolean', default: 'false', desc: '悬停阴影，同 shadow=hover 视觉' },
    { name: 'loading', type: 'boolean', default: 'false', desc: 'body 显示骨架占位' },
    { name: 'loadingRows', type: 'number', default: '3', desc: '骨架行数' },
    { name: 'headerStyle', type: 'string', default: 'undefined', desc: 'header 区内联样式透传' },
    { name: 'bodyStyle', type: 'string', default: 'undefined', desc: 'body 区内联样式透传' },
    { name: 'headerLine', type: 'boolean', default: 'true', desc: 'header 与 body 间分隔线' },
    { name: 'footerLine', type: 'boolean', default: 'true', desc: 'actions 区上方分隔线' },
    {
      name: 'clickable',
      type: 'boolean',
      default: 'false',
      desc: '整卡可点击：role=button + 键盘/点击激活，合并 hoverable 视觉',
    },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '仅 clickable 时生效，禁用点击与 hover' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
    {
      name: 'onClick',
      type: '(e: MouseEvent | KeyboardEvent) => void',
      default: 'undefined',
      desc: 'clickable 时点击/键盘激活回调；disabled 不触发',
    },
    { name: 'onMouseenter', type: '(e: MouseEvent) => void', default: 'undefined' },
    { name: 'onMouseleave', type: '(e: MouseEvent) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '卡片正文' },
  ],
  events: [
    { name: 'onClick', desc: 'clickable 整卡点击或键盘激活（Enter/Space）' },
    { name: 'onMouseenter', desc: '指针进入卡片' },
    { name: 'onMouseleave', desc: '指针离开卡片' },
  ],
  slots: [
    { name: 'title', desc: '标题(string 或 Snippet)' },
    { name: 'extra', desc: 'header 右侧' },
    { name: 'cover', desc: '封面' },
    { name: 'actions', desc: '底部操作' },
    { name: 'children', desc: '正文' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '有 title 时根 role=region；string title 经 useId 关联 aria-labelledby；骨架 aria-hidden。clickable 时根 role=button + tabindex，Enter/Space 激活，disabled 时 aria-disabled + tabindex=-1。',
  },
  tokens: [
    '--cd-card-bg',
    '--cd-card-border',
    '--cd-card-radius',
    '--cd-card-padding',
    '--cd-card-padding-small',
    '--cd-card-header-border',
    '--cd-card-title-color',
    '--cd-card-title-weight',
    '--cd-card-title-size',
    '--cd-card-desc-color',
    '--cd-card-body-color',
    '--cd-card-shadow',
    '--cd-card-shadow-hover',
  ],
  responsive: false,
  examples: [
    { title: '基础', code: '<Card title="标题">内容</Card>' },
    { title: '悬浮', code: '<Card hoverable title="卡片">内容</Card>' },
    { title: '加载', code: '<Card loading loadingRows={3} />' },
  ],
} as const;

/**
 * CardGroup — see specs/components/show/CardGroup.spec.md
 * 把多个 Card 以网格方式成组排布，统一间距。纯 CSS 布局，无运行时。
 */
export const cardGroupMeta = {
  name: 'CardGroup',
  category: 'show',
  relatedTo: 'Card',
  semiEquivalent: 'CardGroup',
  description:
    '卡片组容器：将多个 Card 以网格（type=grid）成组排布，spacing 统一间距（number=水平/垂直一致；[x,y]=分别指定）。纯 CSS grid，无运行时。',
  exports: ['CardGroup'],
  props: [
    {
      name: 'spacing',
      type: 'number | number[]',
      default: 'undefined',
      desc: '卡片间距；number 统一，[x,y] 分别指定水平/垂直（默认回退 --cd-cardgroup-spacing）',
    },
    { name: 'type', type: "'grid'", default: "'grid'", desc: '排布类型（当前仅 grid）' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '组语义标签（aria-label）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '子 Card' },
  ],
  slots: [{ name: 'children', desc: '子 Card' }],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '根 role=group + 可选 aria-label；卡片本身 a11y 由 Card 提供。',
  },
  tokens: ['--cd-cardgroup-spacing', '--cd-cardgroup-min-column'],
  responsive: true,
  examples: [
    { title: '网格', code: '<CardGroup><Card title="A" /><Card title="B" /></CardGroup>' },
    { title: '自定义间距', code: '<CardGroup spacing={24}><Card title="A" /><Card title="B" /></CardGroup>' },
  ],
} as const;
