/**
 * Machine-readable component metadata for AI/docs consumption.
 * Aggregated metadata for the Layout family (root + Header/Sider/Content/Footer).
 * 对齐 Semi：纯布局容器，不附带背景/尺寸样式，无组件 token。
 */
export const meta = {
  name: 'Layout',
  category: 'basic',
  description:
    '页面级布局骨架：Layout 根容器 + Header / Sider / Content / Footer 子组件。纯布局容器，不附带背景/尺寸样式，按需自定义。',
  subComponents: [
    {
      name: 'Layout',
      element: 'section',
      note: 'Layout.Header / Layout.Footer / Layout.Content 与 Layout API 相同。',
      props: [
        { name: 'class', type: 'string', default: "''", desc: '根元素自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
        {
          name: 'hasSider',
          type: 'boolean',
          default: 'undefined',
          desc: '表示子元素里有 Sider，一般不用指定；可用于 SSR 避免样式闪动',
        },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
        { name: 'role', type: 'string', default: 'undefined', desc: '可访问性 role' },
      ],
    },
    {
      name: 'Layout.Header',
      element: 'header',
      props: [
        { name: 'class', type: 'string', default: "''", desc: '根元素自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
        { name: 'role', type: 'string', default: 'undefined', desc: '可访问性 role' },
      ],
    },
    {
      name: 'Layout.Footer',
      element: 'footer',
      props: [
        { name: 'class', type: 'string', default: "''", desc: '根元素自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
        { name: 'role', type: 'string', default: 'undefined', desc: '可访问性 role' },
      ],
    },
    {
      name: 'Layout.Content',
      element: 'main',
      props: [
        { name: 'class', type: 'string', default: "''", desc: '根元素自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
        { name: 'role', type: 'string', default: 'undefined', desc: '可访问性 role（覆盖默认 main 语义）' },
      ],
    },
    {
      name: 'Layout.Sider',
      element: 'aside',
      props: [
        {
          name: 'breakpoint',
          type: "('xs'|'sm'|'md'|'lg'|'xl'|'xxl')[]",
          default: 'undefined',
          desc: '触发响应式布局的断点数组',
        },
        {
          name: 'onBreakpoint',
          type: '(screen, matched: boolean) => void',
          default: 'undefined',
          desc: '触发响应式布局断点时的回调',
        },
        { name: 'class', type: 'string', default: "''", desc: '根元素自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签，描述该 Sider 作用' },
        { name: 'role', type: 'string', default: 'undefined', desc: '可访问性 role' },
      ],
    },
  ],
  events: [
    {
      name: 'onBreakpoint',
      desc: 'Sider 命中 / 解除响应式断点时触发，(screen, matched)',
    },
  ],
  slots: [{ name: 'children', desc: '各子组件内容' }],
  a11y: {
    hasRole: false,
    focusable: false,
    note: 'landmark 语义：Header→header，Content→main，Footer→footer，Sider→aside；Sider 可传 aria-label 描述作用。',
  },
  // 对齐 Semi：Layout 无组件 token（无 variables.scss），不附带背景/尺寸样式。
  tokens: [],
  responsiveMap: {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
  },
  aiHints: [
    'Layout 只负责布局，不附带背景/文本/宽高样式，配色与尺寸靠 style / class 自定义。',
    'SSR/首屏含侧边栏时显式传 hasSider，避免 column→row 闪动。',
    '需要响应式回调时给 Sider 传 breakpoint + onBreakpoint。',
    'Layout.Header / Layout.Sider 等命名空间用法与具名 LayoutHeader 等价。',
  ],
  examples: [
    {
      title: '经典后台布局',
      code: '<Layout><Layout.Sider>侧栏</Layout.Sider><Layout><Layout.Header>页头</Layout.Header><Layout.Content>内容</Layout.Content><Layout.Footer>页脚</Layout.Footer></Layout></Layout>',
    },
  ],
} as const;
