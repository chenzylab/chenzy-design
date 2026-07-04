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
  ['divider', '{ Divider }', '1.55 KB'],
  ['grid', '{ Row, Col }', '2.25 KB'],
  ['icon', '{ Icon }', '1.45 KB'],
  ['layout', '{ LayoutHeader, LayoutFooter, LayoutContent, LayoutSider }', '3.1 KB'],
  ['space', '{ Space }', '1.2 KB'],
  ['typography', '{ Title, Text, Paragraph, Link }', '6.5 KB'],
  // feedback
  ['banner', '{ Banner }', '3.3 KB'],
  ['drawer', '{ Drawer }', '4.5 KB'],
  ['modal', '{ modal }', '5.85 KB'],
  ['notification', '{ notification }', '5.5 KB'],
  ['popconfirm', '{ Popconfirm }', '4.8 KB'],
  ['progress', '{ Progress }', '3.8 KB'],
  ['side-sheet', '{ SideSheet }', '4.5 KB'],
  ['skeleton', '{ Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonAvatar, SkeletonImage, SkeletonButton }', '3.5 KB'],
  ['spin', '{ Spin }', '2.6 KB'],
  ['toast', '{ Toast }', '4.5 KB'],
  // input
  ['autocomplete', '{ AutoComplete }', '5.8 KB'],
  ['cascader', '{ Cascader }', '10.6 KB'],
  ['checkbox', '{ Checkbox, CheckboxGroup }', '3.5 KB'],
  ['color-picker', '{ ColorPicker }', '7.5 KB'],
  ['date-picker', '{ DatePicker, RangePicker }', '18 KB'],
  ['form', '{ FormField, FormInput, FieldArray }', '6.15 KB'],
  ['input', '{ Input }', '4.3 KB'],
  ['input-number', '{ InputNumber }', '4.25 KB'],
  ['radio', '{ Radio, RadioGroup }', '4.1 KB'],
  ['rating', '{ Rating }', '3.65 KB'],
  ['select', '{ Select }', '9 KB'],
  ['slider', '{ Slider }', '5.5 KB'],
  ['switch', '{ Switch }', '2.7 KB'],
  ['tag-input', '{ TagInput }', '4.25 KB'],
  ['textarea', '{ TextArea }', '3.75 KB'],
  ['time-picker', '{ TimePicker }', '7.75 KB'],
  ['transfer', '{ Transfer }', '10.9 KB'],
  ['tree-select', '{ TreeSelect }', '10.6 KB'],
  ['upload', '{ Upload }', '7.4 KB'],
  // navigation
  ['anchor', '{ Anchor }', '3.5 KB'],
  ['breadcrumb', '{ BreadcrumbItem }', '4 KB'],
  ['dropdown', '{ Dropdown }', '7.85 KB'],
  ['menu', '{ Menu }', '8.4 KB'],
  ['pagination', '{ Pagination }', '3.8 KB'],
  ['steps', '{ Steps }', '3.5 KB'],
  ['tabs', '{ TabPane }', '6.95 KB'],
  // other
  ['back-top', '{ BackTop }', '2.65 KB'],
  ['config-provider', '{ ConfigProvider }', '1.7 KB'],
  ['locale-provider', '{ LocaleProvider }', '1.0 KB'],
  ['lottie-icon', '{ LottieIcon }', '2.5 KB'],
  ['resize-observer', '{ ResizeObserver }', '1.2 KB'],
  // show
  ['avatar', '{ AvatarGroup }', '4.95 KB'],
  ['badge', '{ Badge }', '2.5 KB'],
  ['calendar', '{ Calendar }', '9 KB'],
  ['card', '{ Card }', '3.0 KB'],
  ['carousel', '{ Carousel }', '5.5 KB'],
  ['collapse', '{ CollapsePanelComponent }', '4.4 KB'],
  ['descriptions', '{ DescriptionsItem }', '2.8 KB'],
  ['empty', '{ Empty }', '2.55 KB'],
  ['highlight', '{ Highlight }', '1.45 KB'],
  ['image', '{ ImagePreviewGroup }', '6 KB'],
  ['list', '{ ListItem, ListMeta }', '8.95 KB'],
  ['overflow-list', '{ OverflowList }', '3.2 KB'],
  ['popover', '{ Popover }', '4.75 KB'],
  ['scroll-list', '{ ScrollList }', '5.75 KB'],
  ['table', '{ Table }', '16.7 KB'],
  ['tag', '{ Tag }', '3 KB'],
  ['timeline', '{ TimelineItem }', '5.4 KB'],
  ['tooltip', '{ Tooltip }', '3.5 KB'],
  ['tree', '{ Tree }', '9 KB'],
  ['virtual-list', '{ VirtualList }', '2.65 KB'],
  // show · 富媒体（P0-P2）—— 预算按实测 +~15% 校准（见各 spec §9）。
  // code-highlight 含 prismjs core；markdown-render 的 unified/remark 与
  // json-viewer 的内核均为动态 import，不计入组件壳（json-viewer ignore 内核）。
  ['code-highlight', '{ CodeHighlight }', '11 KB'],
  ['markdown-render', '{ MarkdownRender }', '3.5 KB'],
  ['video-player', '{ VideoPlayer }', '9 KB'],
  ['audio-player', '{ AudioPlayer }', '5 KB'],
  ['json-viewer', '{ JsonViewer }', '4 KB'],
  ['chat', '{ Chat }', '8.5 KB'],
];

// JsonViewer 的内核 @douyinfe/semi-json-viewer-core 是「动态 import」惰性加载
// （见 JsonViewer.svelte，spec §9 要求内核不进主 bundle），故 size-limit 度量
// 组件壳时把内核 ignore —— 与「svelte 运行时不计入」同口径。内核体积单独在
// spec §9 记录（gzip ~51KB，懒加载）。
const perComponentIgnore = {
  'json-viewer': [...ignore, '@douyinfe/semi-json-viewer-core'],
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
