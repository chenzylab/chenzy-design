/**
 * Machine-readable component metadata for AI/docs consumption.
 * MarkdownRender — 对标 Semi Design MarkdownRender，用 unified 管线（remark/rehype）替代 MDX。
 */
export const meta = {
  name: 'MarkdownRender',
  category: 'plus',
  description:
    'Markdown 渲染组件（严格对齐 Semi markdownRender，用 unified 管线替代 MDX）：remark-parse + 条件 remark-gfm + remark-rehype + 透传 remark/rehype 插件把 raw 编译成 hast，再由 Svelte 递归渲染。默认组件映射对齐 Semi 11 键：h1-h6→Typography.Title（cd-markdown-render-component-header）、p→Typography.Paragraph（-component-p）、a→Typography.Text link、img→div.-component-image>Image+alt、table→Table、行内 code→span.-simple-code、围栏代码块→CodeHighlight(lineNumber)。标题字号/行高/颜色由 Typography 承担（Semi 亦然），组件只补 Semi 定义的 margin/simpleCode/image 样式（20 token 镜像 Semi variables.scss）。支持 components 覆盖；默认剥离 raw HTML（对齐 Semi format=md，保留需自传 rehype-raw 自负 XSS）。不支持 md 正文里任意 JSX 表达式求值（Semi format=mdx 深度能力，Svelte 无 jsx-runtime，运行时模型硬不兼容）。',
  exports: ['MarkdownRender', 'defaultComponents'],
  props: [
    { name: 'raw', type: 'string', default: "''", desc: 'Markdown 源码' },
    {
      name: 'components',
      type: 'Record<string, Component | string>',
      default: 'undefined',
      desc: '元素覆盖 / 自定义标签注册；浅合并覆盖 defaultComponents（值为 string 时别名到另一原生标签）',
    },
    {
      name: 'format',
      type: "'md'",
      default: "'md'",
      desc: '仅支持 md（unified 管线）；mdx 不支持（Svelte 无 JSX runtime）',
    },
    {
      name: 'remarkGfm',
      type: 'boolean',
      default: 'true',
      desc: '启用 GitHub Flavored Markdown（表格 / 任务列表 / 删除线 / 自动链接）',
    },
    {
      name: 'remarkPlugins',
      type: 'UnifiedPluginEntry[]',
      default: 'undefined',
      desc: '透传 remark 插件（mdast 阶段），支持 plugin 或 [plugin, options] 元组',
    },
    {
      name: 'rehypePlugins',
      type: 'UnifiedPluginEntry[]',
      default: 'undefined',
      desc: '透传 rehype 插件（hast 阶段）；传 rehype-raw 可保留 raw HTML（自负 XSS）',
    },
    { name: 'class', type: 'string', default: "''", desc: '根容器附加类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根容器内联样式' },
  ],
  events: [],
  slots: [],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '渲染语义化 HTML（标题 / 列表 / 表格 / 链接等）保留原生可访问性；外链自动补 rel=noopener noreferrer + target=_blank；默认剥离 raw HTML 规避注入；图片 alt 由 Markdown 源码 `![alt](url)` 提供。',
  },
  // 默认覆盖元素（对齐 Semi SemiMarkdownComponents 11 键）；其余标签走原生渲染，可由使用方 components 注册。
  overridableTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'table', 'code', 'pre'],
  // token 严格镜像 Semi variables.scss（20 条）；排版由 Typography 承担，无自造 h*-size/quote/table/hr 等。
  tokens: [
    '--cd-markdown-render-image-margin-left',
    '--cd-markdown-render-image-margin-right',
    '--cd-markdown-render-image-margin-top',
    '--cd-markdown-render-image-margin-bottom',
    '--cd-markdown-render-image-max-width',
    '--cd-markdown-render-image-max-height',
    '--cd-markdown-render-image-alt-margin-top',
    '--cd-markdown-render-image-alt-color',
    '--cd-markdown-render-header1-margin-top',
    '--cd-markdown-render-header1-margin-bottom',
    '--cd-markdown-render-header2-margin-top',
    '--cd-markdown-render-header2-margin-bottom',
    '--cd-markdown-render-header3-margin-top',
    '--cd-markdown-render-header3-margin-bottom',
    '--cd-markdown-render-header4-margin-top',
    '--cd-markdown-render-header4-margin-bottom',
    '--cd-markdown-render-header5-margin-top',
    '--cd-markdown-render-header5-margin-bottom',
    '--cd-markdown-render-simple-code-bg',
    '--cd-markdown-render-simple-code-text',
    '--cd-markdown-render-list-color',
  ],
  responsive: false,
  examples: [
    {
      title: '基础渲染',
      code: '<MarkdownRender raw={`# 标题\\n\\n正文 **加粗** 与 [链接](https://example.com)。`} />',
    },
    {
      title: 'GFM 表格 / 任务列表',
      code: '<MarkdownRender raw={`| a | b |\\n| - | - |\\n| 1 | 2 |\\n\\n- [x] done\\n- [ ] todo`} />',
    },
    {
      title: '覆盖 h1 为自定义 Svelte 组件',
      code: '<MarkdownRender raw="# 你好" components={{ h1: MyHeading }} />',
    },
    {
      title: '注册自定义标签（配合 remark 插件产出的节点）',
      code: '<MarkdownRender raw={md} components={{ callout: Callout }} remarkPlugins={[myDirectivePlugin]} />',
    },
    {
      title: '保留 raw HTML（自负 XSS）',
      code: "import rehypeRaw from 'rehype-raw';\n<MarkdownRender raw={htmlMd} rehypePlugins={[rehypeRaw]} />",
    },
    {
      title: '关闭 GFM',
      code: '<MarkdownRender raw={md} remarkGfm={false} />',
    },
  ],
} as const;
