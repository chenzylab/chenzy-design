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
  ['button', '{ Button }', '2.5 KB'],
  ['divider', '{ Divider }', '0.6 KB'],
  ['grid', '{ Row, Col }', '1.8 KB'],
  ['icon', '{ Icon }', '1.2 KB'],
  ['layout', '{ LayoutHeader, LayoutFooter, LayoutContent, LayoutSider }', '2.5 KB'],
  ['space', '{ Space }', '1.2 KB'],
  ['typography', '{ Title, Text, Paragraph, Link }', '2.5 KB'],
  // feedback
  ['banner', '{ Banner }', '2.5 KB'],
  ['drawer', '{ Drawer }', '4.5 KB'],
  ['modal', '{ modal }', '5 KB'],
  ['notification', '{ notification }', '4.5 KB'],
  ['popconfirm', '{ Popconfirm }', '2.0 KB'],
  ['progress', '{ Progress }', '2.2 KB'],
  ['side-sheet', '{ SideSheet }', '4.5 KB'],
  ['skeleton', '{ Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonAvatar, SkeletonImage, SkeletonButton }', '3.5 KB'],
  ['spin', '{ Spin }', '1.6 KB'],
  ['toast', '{ Toast }', '4.5 KB'],
  // input
  ['autocomplete', '{ AutoComplete }', '4.5 KB'],
  ['cascader', '{ Cascader }', '7.5 KB'],
  ['checkbox', '{ Checkbox, CheckboxGroup }', '3.5 KB'],
  ['color-picker', '{ ColorPicker }', '7.5 KB'],
  ['date-picker', '{ DatePicker, RangePicker }', '9 KB'],
  ['form', '{ FormField, FormInput, FieldArray }', '3.5 KB'],
  ['input', '{ Input }', '3.5 KB'],
  ['input-number', '{ InputNumber }', '3.5 KB'],
  ['radio', '{ Radio, RadioGroup }', '2.2 KB'],
  ['rating', '{ Rating }', '2.2 KB'],
  ['select', '{ Select }', '9 KB'],
  ['slider', '{ Slider }', '3.5 KB'],
  ['switch', '{ Switch }', '1.6 KB'],
  ['tag-input', '{ TagInput }', '3.5 KB'],
  ['textarea', '{ TextArea }', '3.0 KB'],
  ['time-picker', '{ TimePicker }', '4.5 KB'],
  ['transfer', '{ Transfer }', '6.5 KB'],
  ['tree-select', '{ TreeSelect }', '9 KB'],
  ['upload', '{ Upload }', '6 KB'],
  // navigation
  ['anchor', '{ Anchor }', '3.5 KB'],
  ['breadcrumb', '{ BreadcrumbItem }', '2.5 KB'],
  ['dropdown', '{ Dropdown }', '5 KB'],
  ['menu', '{ Menu }', '6 KB'],
  ['pagination', '{ Pagination }', '3.0 KB'],
  ['steps', '{ Steps }', '3.5 KB'],
  ['tabs', '{ TabPane }', '5 KB'],
  // other
  ['back-top', '{ BackTop }', '1.5 KB'],
  ['config-provider', '{ ConfigProvider }', '1.2 KB'],
  ['locale-provider', '{ LocaleProvider }', '1.0 KB'],
  ['lottie-icon', '{ LottieIcon }', '2.5 KB'],
  ['resize-observer', '{ ResizeObserver }', '0.8 KB'],
  // show
  ['avatar', '{ AvatarGroup }', '2.0 KB'],
  ['badge', '{ Badge }', '1.6 KB'],
  ['calendar', '{ Calendar }', '9 KB'],
  ['card', '{ Card }', '3.0 KB'],
  ['carousel', '{ Carousel }', '5.5 KB'],
  ['collapse', '{ CollapsePanelComponent }', '3.5 KB'],
  ['descriptions', '{ DescriptionsItem }', '2.2 KB'],
  ['empty', '{ Empty }', '1.5 KB'],
  ['highlight', '{ Highlight }', '1.2 KB'],
  ['image', '{ ImagePreviewGroup }', '2.5 KB'],
  ['list', '{ ListItem, ListMeta }', '4 KB'],
  ['overflow-list', '{ OverflowList }', '3.2 KB'],
  ['popover', '{ Popover }', '3.5 KB'],
  ['scroll-list', '{ ScrollList }', '4.5 KB'],
  ['table', '{ Table }', '14 KB'],
  ['tag', '{ Tag }', '1.2 KB'],
  ['timeline', '{ TimelineItem }', '3.5 KB'],
  ['tooltip', '{ Tooltip }', '3.5 KB'],
  ['tree', '{ Tree }', '9 KB'],
  ['virtual-list', '{ VirtualList }', '2 KB'],
];

export default components.map(([dir, imports, limit]) => ({
  name: dir,
  path: `packages/svelte/dist/${dir}/index.js`,
  import: imports,
  limit,
  gzip: true,
  ignore,
  modifyEsbuildConfig,
}));
