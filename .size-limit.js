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
  // 委托方向对齐 Semi index.tsx→IconButton（Button 变薄派发器，图标装配/loading 渐变/colorful fill
  // 注入/RTL 镜像全部移到 IconButton，单一逻辑源）后实测 3.81 KB，预算按 +15% buffer 校准。
  ['button', '{ Button }', '4.4 KB'],
  // 承接原 Button 内嵌的图标装配逻辑（loading 渐变 SVG + colorful multipleColor/twoColor fill 注入
  // + icon-only/content RTL 镜像 CSS）后实测 3.05 KB，预算按 +15% buffer 校准。
  ['iconbutton', '{ IconButton }', '3.55 KB'],
  // 破坏性对齐 Semi 重写（纯 div+onClick、删 button/a/dev warn/focus/a11y/自定义 shape）瘦身，实测 2.06 KB，预算按 +20% buffer 校准。
  ['float-button', '{ FloatButton, FloatButtonGroup }', '2.5 KB'],
  ['divider', '{ Divider }', '1.55 KB'],
  // Col 破坏性重写为 Semi float 机制（float:left+width%，取代 flex-basis+max-width）+ 补 .cd-rtl 物理属性 RTL 覆盖（float:right、offset margin-right，24×7 新增选择器）后实测 7.23 KB，预算按 +15% buffer 校准。
  ['grid', '{ Row, Col }', '8.3 KB'],
  ['icon', '{ Icon }', '1.45 KB'],
  // 破坏性对齐 Semi 移除折叠/sticky/padding/token 后瘦身，实测 1.71 KB，预算按 +15% buffer 校准。
  ['layout', '{ LayoutHeader, LayoutFooter, LayoutContent, LayoutSider }', '2 KB'],
  ['space', '{ Space }', '1.2 KB'],
  // 破坏性对齐 Semi（移除独立 Link/editable/italic、单横线 class）后实测 6.72 KB，预算按 +~15% buffer 校准。
  ['typography', '{ Title, Text, Paragraph, Numeral }', '8 KB'],
  // feedback
  ['banner', '{ Banner }', '3.3 KB'],
  // modal：6.2→6.4 对齐 Semi 补 onOk/onCancel Promise loading、preventScroll、命令式 config 全字段（实测 6.29）
  //        →6.5 接 cdGlobal 全局默认 props（12 个 prop 走 resolveDefault，实测 6.41）
  ['modal', '{ modal }', '6.5 KB'],
  ['notification', '{ notification }', '5.5 KB'],
  // 浮层三件套对齐 Semi 破坏性重写后箭头定位职责回归 Tooltip 基座：Tooltip 内联 12 方位
  // x-placement CSS（+40%），Popover/Popconfirm 移除重复箭头 CSS 与中间变量层而下降。
  // 预算按各自实测 +15% buffer 重新校准（popconfirm 4.44→2.73 KB 实测）。
  ['popconfirm', '{ Popconfirm }', '3.2 KB'],
  ['progress', '{ Progress }', '3.8 KB'],
  ['side-sheet', '{ SideSheet }', '4.5 KB'],
  ['feedback', '{ Feedback }', '3.5 KB'],
  ['skeleton', '{ Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonAvatar, SkeletonImage, SkeletonButton }', '3.5 KB'],
  ['spin', '{ Spin }', '2.6 KB'],
  ['toast', '{ Toast }', '4.5 KB'],
  // input
  ['autocomplete', '{ AutoComplete }', '5.8 KB'],
  // 对齐 Semi 的功能补齐带来必要体积增长（无异常第三方依赖，已 grep 反证只依赖本库+svelte）。
  // 预算按实测校准 + 少量余量：cascader 10.63 / checkbox 3.8 / radio 4.63 / textarea 4.77 KB。
  // radio 破坏性重写严格对齐 Semi（全类型原生 input + IconRadio + 全套 card/button token class），
  // 实测 4.63 KB（含 IconRadio SVG），无异常第三方依赖，预算曾校准至 4.7 KB。
  // 2026-07-31 补 RTL 镜像（direction + buttonRadioGroup 内边距换边）后实测 4.71 KB，
  // 属对齐 Semi rtl.scss 的真实功能增长，预算上调至 4.8 KB。
  // cascader：10.8→11 接 cdGlobal 全局默认 props（24 个 prop 走 resolveDefault，实测 10.85）
  // 2026-08-04 逐 demo 真机对齐 Semi 一轮修复（loadData 重构为 Semi 同构、拆出
  // Item.svelte 承载面板渲染、triggerRender onClear 事件透传、filterRender 虚拟化
  // 字号/padding/gap 对齐等真实功能/bug 修复，非无谓膨胀），实测 13.15 KB，预算随之上调。
  ['cascader', '{ Cascader }', '13.3 KB'],
  ['checkbox', '{ Checkbox, CheckboxGroup }', '4 KB'],
  ['color-picker', '{ ColorPicker }', '7.5 KB'],
  // DatePicker 从零重写并严格对齐 Semi（7 type + range 双框触发器 + dateTime + 手输解析 +
  // multiple/max + needConfirm+Footer + preset + inset + 触发器/面板定制 + 四向 slot + 时区），
  // 替换旧版后实测 30.14 KB。预算按实测校准（含少量余量），旧 22 KB 是早期不完整实现的基线。
  // 深度对齐（density=compact、placeholder 按 type 分派、locale 覆盖、命令式方法、
  // needConfirm 暂存层、insetInput 覆盖型浮层 leftTopOver）后实测 32.22 KB，预算提到 33 KB。
  // 再补 range 状态机对齐（focusRecords 越界禁用、两端时间各自独立、
  // isAnotherPanelHasOpened 按端判定、_autoAdjustMonth 同月错开）后实测 33.07 KB → 34 KB。
  ['date-picker', '{ DatePicker }', '34 KB'],
  // 批C-E 引入 async-validator（gzip ~5-6KB 校验引擎）+ lodash-es get/set/toPath（真数组路径）。
  // 破坏性重写严格对齐 Semi（Field 复用 FormLabel、a11y 契约 labelledById/errorMessageId、
  // error/warning 合并、扁平 class）后实测 13.65 KB。预算按实测校准，含少量余量。
  ['form', '{ FormField, FormInput, FieldArray }', '14 KB'],
  // TextArea 迁入 input/ 目录、与 Input/InputGroup 同为 input 条目导出（对齐 Semi 目录结构，
  // 原独立 textarea 条目随目录迁移移除）。三者共享 input.scss token/locale，合并测量。
  // autosize 测量改用隐藏克隆节点（对齐 Semi calculateNodeHeight.ts，修复原生 rows 属性
  // 污染 scrollHeight 测量导致 minRows 收缩失效的 bug）后实测 9.06 KB，预算 +微量 buffer 校准。
  ['input', '{ Input, InputGroup, TextArea }', '9.2 KB'],
  ['input-number', '{ InputNumber }', '5 KB'],
  ['pincode', '{ PinCode }', '3.5 KB'],
  ['radio', '{ Radio, RadioGroup }', '4.8 KB'],
  ['rating', '{ Rating }', '4 KB'],
  ['select', '{ Select }', '10 KB'],
  ['slider', '{ Slider }', '5.5 KB'],
  ['switch', '{ Switch }', '2.7 KB'],
  ['tag-input', '{ TagInput }', '6.25 KB'],
  // 8→8.6 KB：文档整页对齐轮次拆出 time-picker-foundation + constants（对齐 Semi
  // semi-foundation/timePicker/{foundation,constants}.ts 的文件分层），并补齐 use12Hours 默认
  // format 分派 / panelHeader·panelFooter 数组 / disabledTime 传 dates 数组等 Semi 能力，
  // 实测 8.33 KB，按实测校准留余量（对齐 memory perf-budgets-calibrated-from-real-measurement）。
  ['time-picker', '{ TimePicker }', '8.6 KB'],
  ['transfer', '{ Transfer }', '10.9 KB'],
  ['tree-select', '{ TreeSelect }', '12 KB'],
  // 13 KB → 14 KB：破坏性重写严格对齐 Semi，FileCard 拆分后按 Semi「组件调用组件」
  // 引入 Button/Spin/Progress(circle)/Typography.Text/Tooltip（替代原裸元素），实测 13.35 KB。
  ['upload', '{ Upload }', '14 KB'],
  // navigation
  ['anchor', '{ Anchor }', '4.5 KB'],
  // 4 KB → 4.8 KB：全面对齐 Semi 引入的真实新功能（ellipsisPos:'middle' JS 二分截断 +
  // ResizeObserver、IconMore 折叠图标、showTooltip 对象化、链接三态、字符串 route 归一化）。
  // 实测 baseline 3460 B → 4620 B，纯功能增长；同类导航组件 anchor 4.5 / pagination 3.8 / tabs 7.3。
  // 4.8 KB → 5 KB：声明式 <Breadcrumb.Item> 补齐 maxItemCount 折叠能力（原先只有 routes
  // 数据驱动分支支持，组合式分支被标注为「Svelte Snippet 不可切片」绕过）。实现为 context
  // 注册式：子项上报序号 → 父级算出折叠区间 → 被折叠项自身不渲染 + 「…」点击展开。
  // 实测 4.9 KB（净增 102 B），预算按实测校准留余量。
  ['breadcrumb', '{ BreadcrumbItem }', '5 KB'],
  ['dropdown', '{ Dropdown }', '7.85 KB'],
  // 3.46 KB → 4.82 KB：全面对齐 Semi 引入的真实新功能（hoverShowPageSelect Popover 集成、
  // pageSizeOpts 动态选项 + Select size-changer、quickJumper、preventPageChangeOnPageSizeChange
  // 换页重算策略、showTotal 页数化）。纯功能增长；同类导航组件 anchor 4.5 / breadcrumb 4.8 / tabs 7.3。
  ['pagination', '{ Pagination }', '5.1 KB'],
  // 4.5 KB → 6 KB：破坏性重写为组合式 API（<Steps><Steps.Step/></Steps>，对齐 Semi/本库 Timeline/Tabs），
  // 新增独立 Step 子组件 + context 收集 + DOM class 层级镜像 Semi（三型 container/left/content/title/
  // title-text/description/icon/number-icon 全套选择器）+ nav 型 IconChevronRight 分隔图标。
  // 实测 baseline 5.57 KB，纯架构/功能增长；同类导航组件 anchor 4.5 / breadcrumb 4.8 / pagination 5.1 / tabs 7.3。
  ['steps', '{ Steps }', '6 KB'],
  // 7.3 KB → 8 KB：全面对齐 Semi 引入的真实新功能（slash 型、left 垂直位置、
  // collapsible 滚动折叠含 auto 自动溢出检测、more 收纳下拉、closable 可关闭、
  // renderArrow/renderTabBar 自定义、动态增删）。实测 baseline 7.75 KB，纯功能增长。
  ['tabs', '{ TabPane }', '8 KB'],
  // other
  ['back-top', '{ BackTop }', '1.7 KB'],
  ['hotkeys', '{ HotKeys }', '1.85 KB'],
  ['config-provider', '{ ConfigProvider }', '1.7 KB'],
  ['locale-provider', '{ LocaleProvider }', '1.0 KB'],
  // 内置 lottie-web（对齐 Semi）：动态 import 的 lottie-web(svg renderer) 计入入口总量，
  // 实测 77.6 KB gzip，绝大部分是 lottie-web 本身。按实测 +3% 余量校准到 80 KB。
  ['lottie', '{ Lottie }', '80 KB'],
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
  // 箭头定位 CSS 迁回 Tooltip 后 4.11→2.82 KB 实测；预算按 +15% buffer 校准（见浮层三件套注）。
  ['popover', '{ Popover }', '3.3 KB'],
  ['scroll-list', '{ ScrollList }', '5.75 KB'],
  // 对齐 Semi 破坏性重写 + 补全 API（onCell 行列合并、column.children 表头合并、useFullRender、onRow 事件、根 class/style、components tag 覆盖、getVirtualizedListRef、scrollToFirstRowOnChange、RTL、图标组件化）后实测 17.92 KB。
  // 二次补齐 Semi 文档全量 API（showSortTip+Tooltip、sortIcon/filterIcon、renderFilterDropdown/renderFilterDropdownItem+FilterDropdownHost、onHeaderCell、filterConfirmMode confirm 模式、defaultFilteredValue、filterChildrenRecord/sortChildrenRecord 树形过滤排序、rowSelection.checkRelation/clickRow/hidden/renderCell、pagination.currentPage/total/position/formatPageText、Table 级 resizable+onResize 事件、expandAllRows、emptySnippet、onRow 拖拽事件）后实测 20.44 KB。
  // 三次视觉对齐修（scroll.x 用 width 修列宽撑大致 tooltip 失效、bordered 伸缩列手柄透明）后实测 21.01 KB，预算按小幅 headroom 校准。
  // 补组合式 <Column>（context 收集树，对齐 Semi Table.Column 双写法）后实测 21.79 KB。
  ['table', '{ Table }', '22 KB'],
  ['tag', '{ Tag, TagGroup, SplitTagGroup }', '5 KB'],
  ['timeline', '{ TimelineItem }', '5.4 KB'],
  // 对齐 Semi 破坏性重写：单 path 箭头 + .cd-tooltip-wrapper[x-placement] 12 方位定位 CSS
  // 全部内联进基座（原 3.07 KB → 4.2 KB 实测）；预算按 +15% buffer 校准（见浮层三件套注）。
  ['tooltip', '{ Tooltip }', '5 KB'],
  ['tree', '{ Tree }', '11 KB'],
  ['user-guide', '{ UserGuide }', '5.5 KB'],
  ['virtual-list', '{ VirtualList }', '2.65 KB'],
  // show · 富媒体（P0-P2）—— 预算按实测 +~15% 校准（见各 spec §9）。
  // code-highlight 含 prismjs core；markdown-render 的 unified/remark 与
  // json-viewer 的内核均为动态 import，不计入组件壳（json-viewer ignore 内核）。
  ['code-highlight', '{ CodeHighlight }', '16 KB'],
  // 严格对齐 Semi 文件结构（h1~h6/a/img/p/table/code 单文件拆分，非 pre 键改为 code 键
  // 统一处理行内+围栏代码块）后实测 3.69 KB，预算按实测 +~10% 校准。
  ['markdown-render', '{ MarkdownRender }', '4 KB'],
  ['video-player', '{ VideoPlayer }', '9 KB'],
  // 破坏性对齐 Semi 后复用 Button/Dropdown/Popover/Tooltip/Image + 具名图标 + 自建 AudioSlider，
  // 功能显著增长（单行布局/Popover 音量面板/Dropdown 5 档倍速/40 token）。按实测 5.13KB +7% 校准。
  ['audio-player', '{ AudioPlayer }', '5.5 KB'],
  // 补齐 renderTooltip（hoverNode/renderHoverNode 事件桥接）+ autoWrap 场景 ResizeObserver
  // 响应式重排 + value 变化重建实例三个行为对齐 Semi 后，实测 4.14 KB，预算按实测 +buffer 校准。
  ['json-viewer', '{ JsonViewer }', '4.3 KB'],
  // chat 严格对齐 Semi 后含 CodeHighlight（代码块 topSlot 深色高亮，prismjs 静态入壳）
  // + Avatar/Button/TextArea/Upload + chatBox 拆分子组件，实测 9.96 KB，预算 +~5% 校准。
  // 补齐 Semi attachment.tsx 独立文件（Attachment/FileAttachment/ImageAttachment，
  // InputBox 已选附件预览 clear/progress/fail 三态 + Progress 组件依赖）后实测 11.36 KB，预算按 +~5% buffer 校准。
  // 操作区角色显隐（showFeedback/complete/showReset 对齐 Semi render() 条件渲染）+
  // Toast 局部 Hook 定位修复 + Tooltip custom trigger 盒模型修复后实测 12.11 KB，预算按 +~5% buffer 校准。
  ['chat', '{ Chat }', '12.5 KB'],
  ['cropper', '{ Cropper }', '4 KB'],
  // 引用区（references）+ dialogueRenderConfig 四区块 snippet 结构后实测 6.71 KB，预算按 +15% buffer 校准。
  // 7.7 → 10.5 KB：补齐 Semi 有而本库完全没有的两个内容类型后实测 9.57 KB（纯功能增长，
  // 已 grep 反证未引入第三方依赖；Collapsible/CodeHighlight 走 `../` 属兄弟组件被 externalize 不计入）：
  //   · steps（Semi widgets/contentItem/dialogueStep.tsx）：可折叠步骤 + action 列表；
  //   · code（Semi widgets/contentItem/code.tsx）：语言标签栏 + 复制按钮的代码块覆盖。
  // 10.5 → 12 KB：再按 Semi widgets/ 拆出 reasoning / action / annotation 三个 widget，
  // 实测 11.2 KB。同样是纯功能增长（Semi 有本库缺的部分）：
  //   · reasoning 补 -wrapper 外框 + 三段 header + 两态文案 + status 决定默认展开；
  //   · action 从裸 emoji 换成复用 Button 的具名图标，并补剪贴板/Toast/删除确认 Modal；
  //   · annotation 从「一排药丸」改成 Semi 的头像组折叠摘要（复用 AvatarGroup）。
  // Button/Dropdown/Modal/Toast/AvatarGroup/Collapsible 均走 `../` 属兄弟组件被 externalize 不计入。
  // 12 → 13 KB：再拆出 file 卡片（Semi dialogueContent.tsx 的 FileAttachment），实测 12.41 KB。
  // 同样是补 Semi 有本库缺的部分：<a> 跳转 + 6 类底色图标框 + 「类型 大小」第二行 + 引用入口。
  // 13 → 13.5 KB：第二遍对齐补两处 Semi 有本库缺的，实测 13.06 KB。
  //   · DialogueHint：Semi 的 chat/hint 与 aiChatDialogue/dialogueHint 是两个不同组件
  //     （前缀/图标/prop 名/selecting 态都不同），本库原来直接复用了 chat 那个；
  //   · DialogueBox 补 container 层 + continueSend，多选框从裸 input 换成复用 Checkbox。
  // Checkbox 走 `../` 属兄弟组件被 externalize 不计入，增量主要来自 DialogueHint 自身。
  // 13.5 → 14 KB：内容区补齐 Semi dialogueContent.tsx 的分层与状态，实测 13.6 KB。
  //   · -content-wrapper > -content-failed + -content-inner 两层；
  //   · 失败态改成 IconAlertCircle 图标（本库原来是一行自造 locale 文案）；
  //   · loading 从裸文字换成 Semi 的三个弹跳圆点 + 文案（含 keyframes）。
  // 14 → 14.5 KB：引用区补齐 Semi renderReferenceIcon 的五类映射，实测 14.3 KB。
  // 增量来自 IconWord/Pdf/Excel/Code/Video 五个具名图标 + 扩展名分派分支
  // （原来只有一个 IconFile 通用图标）。
  // 14.5 → 14 KB：工具调用块按 Semi ToolCallWidget 收敛成扁平 div（删掉本库自造的
  // 折叠面板 + 10 个子类名 + 4 个 locale 键），实测 13.57 KB。
  ['ai-chat-dialogue', '{ AIChatDialogue }', '14 KB'],
  // SideBar P0+P1+P2+P4（Container 浮层壳 + 主壳 mode 路由 + Options + Annotation 引用溯源
  // + CodeContent 代码/JSON 预览）；spec §9 各阶段增量。Annotation/CodeContent 复用
  // Collapse；CodeContent 的 CodeHighlight(prismjs) 静态入壳计入、JsonViewer 内核动态
  // import（下方 ignore）。度量含各自壳；预算按实测校准（P3/P5 后续阶段各自增量）。
  ['sidebar', '{ SideBar, SideBarContainer, SideBarAnnotation, SideBarCodeContent, SideBarMCPConfigure, SideBarFileContent }', '20 KB'],
  // AIChatInput 的 tiptap 内核（@tiptap/core+starter-kit+extensions，gzip ~126KB）
  // 是「动态 import」惰性加载（见 AIChatInput.svelte，spec §0 要求内核不进主 bundle），
  // 故度量组件壳时 ignore 内核。内核体积单独在 spec §0 记录。
  // 预算按实测 +~15% 校准：阶段1 2.9→阶段2 4.57→阶段3 6.08→阶段4 6.47→阶段5 6.48→
  // select-slot 6.82→input-slot(全功能光标 plugin ~400 行)+Mcp 9.81KB。
  // tiptap 内核/pm/svelte-tiptap 第三方均 per-component ignore；本组件自己的懒加载代码
  // （input-slot-plugins 等本地相对 import）size-limit 的 esbuild 会内联进 entry 度量，
  // 属组件功能成本正当计入。
  // 12 → 14.5 KB：对齐 Semi 补齐附件区真实能力后实测 13.61 KB（纯功能增长，已 grep 反证
  // 未引入任何第三方依赖，Progress 走 `../progress/` 属兄弟组件被 externalize 不计入）：
  //   · 附件卡片从自造 chip 重写为 Semi 的 224×36 双行卡片（图标/缩略图 + name + `类型 大小`）；
  //   · 补 Semi horizontalScroller.tsx 整个组件（ResizeObserver + 左右滚动按钮 + smooth scrollBy）；
  //   · 技能/建议项按 Semi 拆成独立子组件（各自带 scoped 样式，比内联多一份组件壳）。
  // 14.5 → 15.5 KB：三个浮层（建议/技能/模版）改由 Popover 承载后实测 14.7 KB
  //   （Popover 走 `../popover/` 属兄弟组件被 externalize 不计入，增量是本组件自身的
  //    浮层装配 + dropdownMatchTriggerWidth 的 ResizeObserver + rePosKey 重定位）。
  // 预算按实测 +~5% 余量校准（对齐 perf-budgets-calibrated-from-real-measurement）。
  ['ai-chat-input', '{ AIChatInput }', '15.5 KB'],
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
