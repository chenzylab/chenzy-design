import esbuildSvelte from 'esbuild-svelte';

// ---------------------------------------------------------------------------
// chenzy-design 体积门禁（size-limit）
//
// 背景：`@sveltejs/package` 产出的 dist 里 `.svelte` 是「源码」（未预编译），
// size-limit 默认的 esbuild 不认 `.svelte`。这里通过 modifyEsbuildConfig 注入
// esbuild-svelte 插件，让 esbuild 能在打包前编译 .svelte。
//
// 测量口径 = 仅「svelte 渲染层」（对应各组件 spec §9 把 svelte / core / locale /
// icons 分开列预算）：把 svelte 运行时与跨包层 external/ignore，不计入组件体积。
// 数字 = 真实 bundle（minify）后的 gzip 体积，与 spec §9 的 gzip 预算同口径。
//
// limit 来源：69(实际 68) 个组件 spec 的 §9，取「svelte 渲染层」那条 ≤ N KB。
// ---------------------------------------------------------------------------

// 把「兄弟组件」（dist/<otherDir>/...）标为 external 的 esbuild 插件。
// 单组件 entry 是 dist/<dir>/index.js；任何 `../xxx/` 相对导入都跨出了本组件
// 目录，属于其它 chenzy-design/svelte 组件（如 List 引 Button/Pagination/Empty）。
// spec §9 的渲染层预算明确「不含共享依赖（Button/Popover/Checkbox…）」，故这些
// 兄弟组件不计入本组件体积；`./` 同目录子组件仍正常打入。
const externalizeSiblings = {
  name: 'externalize-sibling-components',
  setup(build) {
    build.onResolve({ filter: /^\.\.\// }, (args) => ({ path: args.path, external: true }));
  },
};

const modifyEsbuildConfig = (config) => {
  config.plugins = [
    esbuildSvelte({ compilerOptions: { dev: false } }),
    externalizeSiblings,
    ...(config.plugins ?? []),
  ];
  // 解析 svelte 的 browser/client 构建（而非 server），保证运行时体积口径准确。
  config.conditions = ['browser', 'default'];
  config.mainFields = ['svelte', 'browser', 'module', 'main'];
  return config;
};

// 渲染层口径：svelte 运行时与下列跨包层均不计入组件自身体积。
const ignore = [
  'svelte',
  'svelte/internal',
  'svelte/internal/client',
  'svelte/internal/disclose-version',
  '@chenzy-design/core',
  '@chenzy-design/locale',
  '@chenzy-design/icons',
];

// [dir, importNames, limit] —— importNames 为 dist/<dir>/index.js 的具名导出。
// 取该组件的主渲染组件（含子组件时取代表/全部，与 spec 预算口径一致）。
const components = [
  // basic
  ['button', '{ Button }', '4 KB'],
  ['iconbutton', '{ IconButton }', '0.6 KB'],
  // 徽章几何定位 + Group 胶囊工具条（bg/shadow/item 横排）后实测 2.94 KB，预算按 +15% buffer 校准。
  ['float-button', '{ FloatButton, FloatButtonGroup }', '3.4 KB'],
  ['divider', '{ Divider }', '1.55 KB'],
  ['grid', '{ Row, Col }', '2.25 KB'],
  ['icon', '{ Icon }', '1.45 KB'],
  ['layout', '{ LayoutHeader, LayoutFooter, LayoutContent, LayoutSider }', '3.1 KB'],
  ['space', '{ Space }', '1.2 KB'],
  // 扩 editable 对齐 Ant（editIcon/enterIcon/tooltip/trigger + enter svg + 编辑态 CSS）后实测 7.89 KB，预算按 +15% buffer 校准。
  ['typography', '{ Title, Text, Paragraph, Link, Numeral }', '9 KB'],
  // feedback
  ['banner', '{ Banner }', '3.3 KB'],
  ['modal', '{ modal }', '6.2 KB'],
  ['notification', '{ notification }', '5.5 KB'],
  ['popconfirm', '{ Popconfirm }', '4.8 KB'],
  ['progress', '{ Progress }', '3.8 KB'],
  ['side-sheet', '{ SideSheet }', '4.5 KB'],
  ['feedback', '{ Feedback }', '3.5 KB'],
  ['skeleton', '{ Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonAvatar, SkeletonImage, SkeletonButton }', '3.5 KB'],
  ['spin', '{ Spin }', '2.6 KB'],
  ['toast', '{ Toast }', '4.5 KB'],
  // input
  ['autocomplete', '{ AutoComplete }', '5.8 KB'],
  ['cascader', '{ Cascader }', '10.6 KB'],
  ['checkbox', '{ Checkbox, CheckboxGroup }', '3.5 KB'],
  ['color-picker', '{ ColorPicker }', '7.5 KB'],
  ['date-picker', '{ DatePicker, RangePicker }', '22 KB'],
  ['form', '{ FormField, FormInput, FieldArray }', '10 KB'],
  ['input', '{ Input, InputGroup }', '5.5 KB'],
  ['input-number', '{ InputNumber }', '5 KB'],
  ['pincode', '{ PinCode }', '3.5 KB'],
  ['radio', '{ Radio, RadioGroup }', '4.1 KB'],
  ['rating', '{ Rating }', '3.65 KB'],
  ['select', '{ Select }', '10 KB'],
  ['slider', '{ Slider }', '5.5 KB'],
  ['switch', '{ Switch }', '2.7 KB'],
  ['tag-input', '{ TagInput }', '6.25 KB'],
  ['textarea', '{ TextArea }', '3.75 KB'],
  ['time-picker', '{ TimePicker }', '7.75 KB'],
  ['transfer', '{ Transfer }', '10.9 KB'],
  ['tree-select', '{ TreeSelect }', '12 KB'],
  ['upload', '{ Upload }', '13 KB'],
  // navigation
  ['anchor', '{ Anchor }', '4.5 KB'],
  // 4 KB → 4.8 KB：全面对齐 Semi 引入的真实新功能（ellipsisPos:'middle' JS 二分截断 +
  // ResizeObserver、IconMore 折叠图标、showTooltip 对象化、链接三态、字符串 route 归一化）。
  // 实测 baseline 3460 B → 4620 B，纯功能增长；同类导航组件 anchor 4.5 / pagination 3.8 / tabs 7.3。
  ['breadcrumb', '{ BreadcrumbItem }', '4.8 KB'],
  ['dropdown', '{ Dropdown }', '7.85 KB'],
  ['menu', '{ Menu }', '8.4 KB'],
  // 3.46 KB → 4.82 KB：全面对齐 Semi 引入的真实新功能（hoverShowPageSelect Popover 集成、
  // pageSizeOpts 动态选项 + Select size-changer、quickJumper、preventPageChangeOnPageSizeChange
  // 换页重算策略、showTotal 页数化）。纯功能增长；同类导航组件 anchor 4.5 / breadcrumb 4.8 / tabs 7.3。
  ['pagination', '{ Pagination }', '5.1 KB'],
  // 3.46 KB → 4.18 KB：全面对齐 Semi 引入的真实新功能（fill/basic/nav 三型完整样式与
  // 各自配色语义、finish/error/warning 三个内联状态 SVG 图标、每步独立 icon/status、
  // hasLine 连接线开关）。纯功能增长；同类导航组件 anchor 4.5 / breadcrumb 4.8 / pagination 5.1 / tabs 7.3。
  ['steps', '{ Steps }', '4.5 KB'],
  // 7.3 KB → 8 KB：全面对齐 Semi 引入的真实新功能（slash 型、left 垂直位置、
  // collapsible 滚动折叠含 auto 自动溢出检测、more 收纳下拉、closable 可关闭、
  // renderArrow/renderTabBar 自定义、动态增删）。实测 baseline 7.75 KB，纯功能增长。
  ['tabs', '{ TabPane }', '8 KB'],
  // other
  ['back-top', '{ BackTop }', '2.65 KB'],
  ['hotkeys', '{ HotKeys }', '1.85 KB'],
  ['config-provider', '{ ConfigProvider }', '1.7 KB'],
  ['locale-provider', '{ LocaleProvider }', '1.0 KB'],
  ['lottie-icon', '{ LottieIcon }', '2.5 KB'],
  ['resize-observer', '{ ResizeObserver }', '1.2 KB'],
  ['resizable', '{ Resizable, ResizeGroup, ResizeItem, ResizeHandler }', '6 KB'],
  ['drag-move', '{ DragMove }', '2 KB'],
  // show
  // 全面对齐 Semi 后功能显著增长（7 档尺寸+字号、topSlot 渐变 SVG、bottomSlot 圆/方多档、
  // contentMotion 动效、JS scale 自适应、group 各档 border/margin），按实测 6.7 KB +8% 校准。
  ['avatar', '{ AvatarGroup }', '7.3 KB'],
  ['badge', '{ Badge }', '2.5 KB'],
  ['calendar', '{ Calendar }', '9 KB'],
  ['card', '{ Card, CardGroup }', '3.7 KB'],
  ['carousel', '{ Carousel }', '5.5 KB'],
  ['collapse', '{ CollapsePanelComponent }', '4.4 KB'],
  ['collapsible', '{ Collapsible }', '2 KB'],
  ['descriptions', '{ DescriptionsItem }', '2.8 KB'],
  ['empty', '{ Empty }', '2.55 KB'],
  ['highlight', '{ Highlight }', '1.45 KB'],
  ['image', '{ Image, ImagePreview }', '13 KB'],
  ['list', '{ List, ListItem }', '3.5 KB'],
  ['overflow-list', '{ OverflowList }', '3.2 KB'],
  ['popover', '{ Popover }', '4.75 KB'],
  ['scroll-list', '{ ScrollList }', '5.75 KB'],
  // 对齐 Semi 破坏性重写 + 补全 API（onCell 行列合并、column.children 表头合并、RTL、图标组件化）后实测 17.07 KB，预算按小幅 headroom 校准。
  ['table', '{ Table }', '17.4 KB'],
  ['tag', '{ Tag, TagGroup, SplitTagGroup }', '5 KB'],
  ['timeline', '{ TimelineItem }', '5.4 KB'],
  ['tooltip', '{ Tooltip }', '4.6 KB'],
  ['tree', '{ Tree }', '11 KB'],
  ['user-guide', '{ UserGuide }', '5.5 KB'],
  ['virtual-list', '{ VirtualList }', '2.65 KB'],
  // show · 富媒体（P0-P2）—— 预算按实测 +~15% 校准（见各 spec §9）。
  // code-highlight 含 prismjs core；markdown-render 的 unified/remark 与
  // json-viewer 的内核均为动态 import，不计入组件壳（json-viewer ignore 内核）。
  ['code-highlight', '{ CodeHighlight }', '16 KB'],
  ['markdown-render', '{ MarkdownRender }', '3.5 KB'],
  ['video-player', '{ VideoPlayer }', '9 KB'],
  ['audio-player', '{ AudioPlayer }', '5 KB'],
  ['json-viewer', '{ JsonViewer }', '4 KB'],
  ['chat', '{ Chat }', '8.5 KB'],
  ['cropper', '{ Cropper }', '4 KB'],
  // 引用区（references）+ dialogueRenderConfig 四区块 snippet 结构后实测 6.71 KB，预算按 +15% buffer 校准。
  ['ai-chat-dialogue', '{ AIChatDialogue }', '7.7 KB'],
  // SideBar P0+P1+P2+P4（Container 浮层壳 + 主壳 mode 路由 + Options + Annotation 引用溯源
  // + CodeContent 代码/JSON 预览）；spec §9 各阶段增量。Annotation/CodeContent 复用
  // Collapse；CodeContent 的 CodeHighlight(prismjs) 静态入壳计入、JsonViewer 内核动态
  // import（下方 ignore）。度量含各自壳；预算按实测校准（P3/P5 后续阶段各自增量）。
  ['sidebar', '{ SideBar, SideBarContainer, SideBarAnnotation, SideBarCodeContent, SideBarMcpConfigure, SideBarFileContent }', '20 KB'],
  // AIChatInput 的 tiptap 内核（@tiptap/core+starter-kit+extensions，gzip ~126KB）
  // 是「动态 import」惰性加载（见 AIChatInput.svelte，spec §0 要求内核不进主 bundle），
  // 故度量组件壳时 ignore 内核。内核体积单独在 spec §0 记录。
  // 预算按实测 +~15% 校准：阶段1 2.9→阶段2 4.57→阶段3 6.08→阶段4 6.47→阶段5 6.48→
  // select-slot 6.82→input-slot(全功能光标 plugin ~400 行)+Mcp 9.81KB。
  // tiptap 内核/pm/svelte-tiptap 第三方均 per-component ignore；本组件自己的懒加载代码
  // （input-slot-plugins 等本地相对 import）size-limit 的 esbuild 会内联进 entry 度量，
  // 属组件功能成本正当计入。
  ['ai-chat-input', '{ AIChatInput }', '12 KB'],
];

// JsonViewer 的内核 @douyinfe/semi-json-viewer-core 是「动态 import」惰性加载
// （见 JsonViewer.svelte，spec §9 要求内核不进主 bundle），故 size-limit 度量
// 组件壳时把内核 ignore —— 与「svelte 运行时不计入」同口径。内核体积单独在
// spec §9 记录（gzip ~51KB，懒加载）。
const perComponentIgnore = {
  'json-viewer': [...ignore, '@douyinfe/semi-json-viewer-core'],
  // SideBar CodeContent（并入 sidebar 条目）复用 JsonViewer，其内核动态 import 惰性加载，度量壳时 ignore。
  // FileContent（P5）的 tiptap v3 内核 + 3 官方扩展 + svelte-tiptap 全程动态 import（不进主 bundle，
  // 对齐 AIChatInput），度量壳时同样 ignore（内核体积单独在 spec §9 记录）。
  'sidebar': [
    ...ignore,
    '@douyinfe/semi-json-viewer-core',
    '@tiptap/core',
    '@tiptap/pm',
    '@tiptap/starter-kit',
    '@tiptap/extension-text-style',
    '@tiptap/extension-image',
    '@tiptap/extension-text-align',
    'svelte-tiptap',
  ],
  'ai-chat-input': [
    ...ignore,
    '@tiptap/core',
    '@tiptap/pm',
    '@tiptap/starter-kit',
    '@tiptap/extensions',
    'svelte-tiptap',
  ],
};

export default components.map(([dir, imports, limit]) => ({
  name: dir,
  path: `packages/svelte/dist/${dir}/index.js`,
  import: imports,
  limit,
  gzip: true,
  ignore: perComponentIgnore[dir] ?? ignore,
  modifyEsbuildConfig,
}));
