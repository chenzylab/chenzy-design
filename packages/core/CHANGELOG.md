# @chenzy-design/core

## 0.4.1

## 0.4.0

### Minor Changes

- b681334: AIChatDialogue 全场景对齐 Semi：补齐引用（references）与自定义渲染会话框（dialogueRenderConfig）两块能力，并将 docs demo 补全至 Semi 官方全部场景。

  组件新增能力：

  - **引用 references**：`AIDialogueMessage` 增显式 `references` 字段；新增 `showReference` prop（仅 user 消息生效）+ `onReferenceClick` 回调；DialogueBox 在内容下方渲染引用区，支持文本引用（两行裁剪）与文件引用（带图标），全走 alias token。补 `AIChatDialogue.references` locale（zh/en）。
  - **自定义渲染会话框 dialogueRenderConfig**（对齐 Semi 最新 `dialogueRenderConfig`，非旧 `chatBoxRenderConfig`）：新增 `render-config.ts` 定义 `DialogueRenderConfig`（`renderDialogueAvatar` / `renderDialogueTitle` / `renderDialogueContent` / `renderDialogueAction` + 整块 `renderFullDialogue`）。DialogueBox 将头像/标题/内容/操作四区块抽为 `default*` snippet，各区块可覆盖或整块替换，`default*` 节点可复用。类型从 svelte 主 index 导出（并补 `ContentItem` 原名）。

  docs demo 补齐（4 → 12），按 Semi 官方顺序排列：消息状态、引用、选择、提示、自定义渲染提示、自定义渲染会话框、自定义渲染消息、流式数据转换（`streamingResponseToMessage` 逐块增量归约驱动）。`meta.ts` 与 spec §4 同步新增 props/events/slots。

- af1fe99: 新增 Collapsible 折叠容器原语（对标 Semi 2.101.0，全量核实时补齐的漏判组件）。对任意 children 做高度折叠/展开过渡，无触发器 UI（aria-expanded 由使用方提供），是 Collapse 手风琴的底层能力，作为独立原语暴露以支持 keepDOM / lazyRender / collapseHeight 等精细控制。

  - 默认（collapseHeight=0）用 CSS grid `0fr↔1fr` 自适应折叠——无 JS 测量、无布局抖动（复用 Collapse 方案）；collapseHeight>0（「展开更多」部分折叠）时改用显式高度过渡 + rAF 去抖的 JS 测高（reCalcKey / ResizeObserver 触发重测，写读分离规避 effect 循环）。
  - props：isOpen / duration / motion / keepDOM / lazyRender / collapseHeight / collapseHeightAdaptive / fade / reCalcKey / id / onMotionEnd / class / style / children。
  - core headless：`collapsibleShouldRender`（keepDOM × lazyRender × isOpen × collapseHeight 组合派生）+ `collapsibleCollapsedHeight`（自适应折叠高度）。
  - a11y：完全折叠且不可见时内容 `aria-hidden`；prefers-reduced-motion 移除过渡。
  - tokens：`--cd-collapsible-motion-duration` / `--cd-collapsible-motion-ease`。

- 6ce31d0: feat(color-picker)!: 破坏性重写严格对齐 Semi（值改 ColorValue 对象 + 复用六件套 + token 去死中间层）

  破坏性重写 ColorPicker 严格对齐 Semi Design，无向后兼容。

  **值契约**：`value` / `defaultValue` / `onChange` 从 hex 字符串改为 Semi `ColorValue`
  对象 `{ hsva, rgba, hex }`（`hsva` 的 `s`/`v` 为 0-100）。`defaultValue` 默认改为
  Semi 品牌绿 `#39c5bb` 对象；`defaultFormat` 枚举 `hex|rgb|hsv|hsl` → `hex|rgba|hsva`。
  core 新增 `color-value.ts`（三态互转 + 输入串格式化/解析，镜像 Semi convert 语义）。

  **复用组件六件套**：DataPart 复用本库 Popover / Input / InputNumber(alpha% suffix +
  hideButtons) / Select / InputGroup / Button(吸管)，替换原生自造浮层 / dismiss /
  focus-trap / 原生 `<input>`/`<select>`/`<button>`。`usePopover` 时包裹 Popover，
  `children` 缺省渲染默认色块 trigger。

  **删超集**：`open`/`defaultOpen`/`onOpenChange`、`presets`、`size`、`status`、
  `disabled`、`outputUppercase`、`format`/`showFormatToggle`/`onFormatChange`、`inline`
  （改 `usePopover`）、`recentColors`/`recentMax`、`ariaLabel`。
  **补缺失**：`popoverProps`、`class`、`width`/`height`、topSlot/bottomSlot。

  **token**：20 个 Semi token 全部改为组件真消费（非对称圆角、InputNumber/Select 宽、
  间距、demoblock/alphaSliderInner 圆角、popover padding、把手边框），删除原 20+ 死中间层。

  **demos**：删 presets/states/format/BasicDemo（4 例），保留/改写 basic/alpha/eyeDropper/
  slots/custom-trigger/controlled（均改 ColorValue 对象受控）。

- e4a6c5c: 新增 DragMove 通用拖拽移动组件（other，对标 Semi 2.101.0 并做 a11y 增强）。包裹单个子元素使其可被拖拽在页面/约束区内自由移动（与 Resizable 改尺寸正交，DragMove 改位置）。core 沉淀第二个通用拖拽原语 `createDragMove`（继 createResizeDrag 之后）：pointerdown 记录起点 → document 绑 mouse/touch move/up → 计算 clamp 到 constrainer 的 top/left → customMove 或写 style.top/left → up 解绑 + 卸载兜底（命令式几何，红线 #3，不用响应式读几何），设计以能替换 Modal 可拖拽标题栏 / Cropper 画布拖拽为目标（后续收敛）。约束区支持 `'parent'`/自定义 DOM/无约束；`allowMove` 谓词拦截；`allowInputDrag` 控制是否从 input/textarea 发起（默认 false，避免干扰文本选择）；鼠标/触摸事件全透传。超越 Semi：可选 `keyboard` 把手键盘可达（tabindex + 方向键移动 + i18n aria-label），触摸 `touch-action:none`。新增 `--cd-dragmove-cursor` component token（默认 move）与 locale key `DragMove.handleAriaLabel`（zh「拖动」/ en「Drag to move」）。
- 7ab4b65: 新增 HotKeys 快捷键组件（对标 Semi 2.101.0）。声明一组键盘组合、绑定全局/局部 keydown 监听、命中触发回调，并渲染语义化 `<kbd>` 键位提示。core headless 提供 Keys 常量枚举、keyToCode、isValidHotKeys 校验、matchHotKeys（修饰键精确匹配 + 普通键用 event.code 物理键位）。修复 Semi 未生效的 mergeMetaCtrl —— 真正实现跨平台合并 Cmd/Ctrl。a11y 增强（超越 Semi 的 span）：`<kbd>` 语义、`+` 分隔符 aria-hidden、aria-keyshortcuts、键位文本可选中。支持 preventDefault 拦截浏览器默认行为、content/render 自定义提示、getListenerTarget 局部监听。
- a602da2: Layout：破坏性重写严格对齐 Semi（纯布局容器，无背景/尺寸样式，无组件 token，无折叠功能）。

  - **组件**：Layout / Header / Footer / Content 仅保留 `class` / `style` / `aria-label` / `role`（Layout 另有 `hasSider`）；DOM 与 class 对齐 Semi（`cd-layout` / `cd-layout-has-sider` / `cd-layout-header` / `-footer` / `-content` / `-sider` / `-sider-children`），补齐 box-sizing 与 has-sider 行内 `overflow-x:hidden`、RTL `direction`。
  - **Sider**：破坏性移除 `collapsed` / `defaultCollapsed` / `collapsible` / `width` / `collapsedWidth` / `reverseArrow` / `placement` / `onCollapse` / `trigger` / `zeroWidthTriggerStyle` 及折叠动画、零宽触发块。只保留 Semi 的 `breakpoint`（数组）/ `onBreakpoint(screen, matched)` / `class` / `style` / `aria-label` / `role`；内联对齐 Semi 的 responsiveMap（xs 为 max-width，其余 min-width）+ matchMedia 监听。DOM 为 `<aside><div class="cd-layout-sider-children">`。
  - **tokens**：删除全部 `--cd-layout-*` 组件 token（Semi 无 variables.scss，Layout 不附带任何样式），移除 tokens 注册。
  - **core**：删除 `createSider` 状态机（`packages/core/src/sider.ts` 及导出）——Semi 无此逻辑。
  - **locale**：删除 Semi 没有的 `Sider` 文案键；新增对齐 Semi 的 `Navigation.collapseText` / `Navigation.expandText`，`Nav.Footer` 折叠按钮文案改用之。
  - **demos**：重写为 Semi 的 8 例（三行 / 左侧栏 / 右侧栏 / 侧边栏 / 响应式 / 顶部导航 / 顶部导航-侧边 / 侧边导航），移除依赖已删功能的 8 个自造 demo。
  - meta / content 全量对齐新 API。

- aee0462: 新增 PinCode 分格验证码输入组件（对标 Semi 2.101.0）。支持四种字符校验格式（number/mixed/RegExp/函数）、跨格键盘导航、整串粘贴自动分发、受控/非受控、输入法组合态过滤。a11y 增强：分组语义 role=group、每格位次 aria-label、autoComplete=one-time-code OTP 自动填充。
- 2a55974: Resizable：补齐对齐 Semi 的组件缺口（单体 bounds / snap / snapGap），并新增本库独有的分栏双击折叠；docs demo 全场景覆盖（5 → 16，超过 Semi 13 场景）。

  组件新增能力：

  - **单体 `boundElement`**（对齐 Semi）：`'parent' | 'window' | HTMLElement`，拖拽时限制伸缩框不超出边界元素。core `createResizeDrag` 加 `getBoundMax`（svelte 层在 drag start 读 DOM 算可用最大宽高，core 保持 DOM-free）。
  - **单体 `snap` / `snapGap`**（对齐 Semi）：吸附到指定像素尺寸数组，`snapGap` 控制吸附生效间隙（0=总吸附到最近目标）。core 新增 `snapToPoints`，与既有 `grid` 步长吸附共存。
  - **分栏 `ResizeHandler collapsible`**（本库独有增强，Semi 无内建折叠）：双击把手折叠/展开左（上）侧面板，折叠时记住原百分比并腾给邻居、再次双击恢复，总和守恒。ResizeGroup context 加 `toggleCollapse`。

  docs demo 补齐（5 → 16），对齐 Semi 13 场景 + 展示独有能力：拖拽回调、八方向把手、受控尺寸、键盘无障碍（独有）、自定义把手、多面板/锁定把手、嵌套分栏、动态方向、吸附、边界约束、双击折叠。meta 同步新增 props。core 新增 3 项单元测试（snapToPoints / snap 集成 / bounds 集成），共 21 项全通过。

- e2bd5f7: 新增 Resizable 可伸缩组件族（对标 Semi Resizable，单体逻辑参考 re-resizable v6.10.0，分栏几何对齐 Semi ResizeGroupFoundation）。

  - **core 拖拽原语**：`createResizeDrag`（全库首个下沉 core 的通用单次拖拽生命周期——pointerdown 记录起始尺寸+指针坐标 → document 命令式绑 pointermove/pointerup → move 内按轴 clamp min/max + grid 吸附 + scale/ratio/lockAspectRatio 修正 → up/destroy 解绑兜底，绝不用响应式 attachment 读几何）；`computeGroupResize`（分栏相邻两项联动一增一减、总和守恒、越界 clamp 后另一项=两项和−clamp 项；judgeConstraint/adjustNewSize/getOffset 补偿 padding/border）。设计以覆盖 Table 列宽拖拽场景为验收基准。
  - **svelte 组件**：`Resizable`（单体，8 向可选把手 + enable 子集 + 受控/非受控 + 锁比例/网格/缩放）、`ResizeGroup/ResizeItem/ResizeHandler`（分栏，context 声明式注册用普通数组簿记避免 effect 循环，首帧测量延后纳入 cleanup）。
  - **a11y 增强（超越 Semi 的裸 div）**：把手 `role="separator"` + aria-orientation + aria-value\* + i18n aria-label + 键盘 ←→/↑↓（调尺寸）/Home/End（到 min/max）+ RTL 镜像 + 命中区 ≥24px。
  - token（把手命中区/线色/hover/focus/间隙）、locale（Resizable.handleAriaLabel zh「调整大小」/en「Resize」）、meta（relatedTo Table/SideBar）。

- 01b9b4d: 新增 7 个富媒体组件（对标 Semi Design Plus 族，底层选型从 semi-foundation 源码坐实）：

  - **CodeHighlight**：代码语法高亮，底层 prismjs（297 语言、行号、可关默认主题）。
  - **MarkdownRender**：Markdown 渲染，unified 管线（remark-parse + remark-gfm + remark-rehype → hast，Svelte 递归渲染），`components` 可注册 Svelte 组件覆盖元素 / 当自定义标签；代码块默认接 CodeHighlight。unified 生态动态 import。
  - **VideoPlayer**：视频播放器，纯原生 `<video>` 自建控件（倍速 / 清晰度 / 线路 / 章节标记 / 画中画 / 镜像 / 全屏 / 字幕），零第三方媒体库。
  - **AudioPlayer**：音频播放器，纯原生 `<audio>`，支持单曲 / 列表 / 封面标题，零第三方媒体库。
  - **JsonViewer**：JSON 展示 / 编辑，引 `@douyinfe/semi-json-viewer-core` 框架无关内核（虚拟化大数据、搜索替换、自定义渲染规则、格式化），内核动态 import 不进主 bundle。
  - **Chat**：AI / 普通会话容器，消息流 + SSE 流式 + 附件上传（复用 Upload）+ 角色配置 + 提示区 + 丰富的 render snippet；内容复用 MarkdownRender。
  - **Cropper**：图片裁切，纯原生 DOM/canvas 几何引擎（8 角点 resize / 拖拽 / 缩放 / 旋转 / aspectRatio 约束 / rect·round·roundRect 形状 / getCropperCanvas 取结果），零第三方。

  均含 Component Token（暗色）、i18n、组件 meta、a11y、size-limit 体积门禁与文档站 demo。所有对 Semi 的偏离已在各组件 spec §与 `specs/00-foundation/rich-media-gap-tracker.md` 登记。

- 7243000: SideBar P3：新增 SideBarMcpConfigure MCP 工具配置面板（对标 Semi sideBar/mcpConfigure）。外层复用 SideBarContainer（继承并透传全部 Container props，`title` 默认走 i18n `SideBar.mcpTitle`）；内部顶部显示已启用计数（`已启用 N/总数`）+ 搜索框（复用本库 Input，前缀放大镜 + `aria-label`），下方并列渲染内置（`options`）/ 自定义（`customOptions`）双列表（Semi 用 radio 二选一切换，本库改并列双列表更直观）。每项：前置图标（`string` 按图片 URL / `Snippet` 自定义）+ `label` + `desc` + 动作按钮（内置 `configure=true` 显示配置 / 自定义显示编辑，`aria-label` 含工具名走 i18n）+ 启用开关（复用本库 Switch，原生 `role="switch"` + `aria-checked`，`disabled` 预设项锁定 + `title` tooltip）。搜索支持自定义 `filter(input, option)` 谓词（默认 label/value 大小写不敏感包含匹配）；启用变化经 headless `toggleMcpOptionActive` 产出「下一份数组 + custom 标记」上抛 `onStatusChange`，绝不回写 prop（受控红线）。自定义组为空显示添加入口（`onAddClick`），无搜索结果显示提示。

  core 新增框架无关纯函数 `filterMcpOptions` / `toggleMcpOptionActive` / `countActiveMcpOptions` 与类型 `McpOptionCore`。新增 `--cd-sidebar-mcp-*` component token 与 `SideBar.mcp*` locale（含修 Semi 硬编码「请输入」的 `mcpSearchPlaceholder`）。

- 84b6975: 新增 SideBar（AI 侧边信息栏套件，show/AI，对标 Semi Sidebar）P0+P1 阶段。P0 SideBarContainer 为可伸缩浮层壳：贴视口右侧（RTL 贴左），`role="dialog"` + `aria-labelledby`(title)，打开移焦 + focus-trap 焦点捕获/归还 + Esc 关闭，堆叠 z-index 复用 modal/z-stack 计数器（与 Modal/SideSheet 统一层栈，后开者在上）；resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core `createResizeDrag`（axis:'x' 单轴 + clamp minWidth/maxWidth），把手 `role="separator"` + `aria-orientation="vertical"` + `aria-valuenow` + 键盘 ←→/Home/End（与 Resizable 同套 a11y，不重造拖拽几何）；motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。P1 SideBar 主壳按 mode 路由：main 渲染顶部 Options 图标 tab 组（`role="tablist"` + roving tabindex + 键盘，name 作无障碍名）+ renderMainContent(activeKey)；detail 渲染 renderDetailHeader + 返回按钮（onBackWard 可异步，await 期间禁用防重触发）+ renderDetailContent(mode)。core 新增纯函数 `parseSideBarWidth` / `clampSideBarWidth`。新增 `--cd-sidebar-*` component token 与 locale key `SideBar.close` / `SideBar.back`。detail 里 code/file 具体渲染与 Annotation/MCPConfigure 留待 P2~P5 接续。
- e6202aa: Typography 全面对齐 Semi：补 Numeral 子组件 + Text/Paragraph/Link 缺的 prop，demo 从 3 补到 11 全场景。

  - **Numeral 子组件**（对齐 Semi，此前完全缺失）：`Typography.Numeral` 遍历 children 文本节点，按 `rule`（text/numbers/bytes-decimal/bytes-binary/percentages/exponential）+ `precision` + `truncate`（ceil/floor/round）+ 自定义 `parser` 格式化其中的数字。格式化引擎 `formatNumeral` 沉淀在 `@chenzy-design/core`（框架无关，13 项单元测试全过）。
  - **补缺的 prop**：Text/Paragraph/Link 加 `italic`（斜体）；Text/Link 加 `icon`（前置图标 Snippet，链接下无下划线）；Paragraph 加 `spacing`（`'normal'`/`'extended'` 行距）。新增 `--cd-typography-spacing-extended` token。
  - **demo 全场景**（3 → 11）：新增链接、文本大小、斜体与图标、可复制、省略（单行/多行/tooltip/后缀）、展开收起、可编辑、数值格式化，覆盖 Semi 全部场景 + 本库已有的 copyable/ellipsis/editable 强能力。meta 同步新增子组件与 props。

- 046dc34: UserGuide 用户引导破坏性重写，严格对齐 Semi userGuide（DOM / token / API / demo 全量对齐，无向后兼容）。popup 模式复用本库 Popover（`trigger="custom"`）贴气泡讲解 + svg mask 挖洞 spotlight 遮罩逐个高亮目标（四块透明矩形让高亮区可交互，目标不在视口时 scrollIntoView）；modal 模式复用本库 Modal（header/footer=null、centered、bodyStyle padding:0）图文引导（cover 封面 + 圆点指示器）。core headless `createUserGuide` 步进状态机对齐 Semi foundation：current 受控/非受控、handlePrev/handleNext/handleSkip 回调去重、末步 handleNext 触发 finish、visible false→true 重置 current=0 并锁 body 滚动（补偿滚动条宽、getPopupContainer 时跳过）、spotlight padding 三层覆盖（step>props>默认5）。指示器 popup 为纯文本 `n/total`（对齐 Semi 无 i18n），modal 为圆点。移除自造的、Semi 无的能力：focus-trap / inert / Esc / 箭头键 / role=dialog 契约 / live-announcer / stepIndicator i18n key。tokens 逐条镜像 Semi `variables.scss`（名 / 值 / 作用 DOM 对齐），移除 Semi 无的中间变量。position 支持 Semi 14 方位。demo 补齐至 8 个对齐 Semi（基本 / 主题 / 弹出位置 / 高亮区域大小 / 定制按钮 / 受控 / 弹窗式 / 无遮罩）。onFinish/onSkip 不自动关闭，使用方置 visible=false。

### Patch Changes

- 408a806: feat(backtop): 全面对齐 Semi BackTop（行为/tokens/样式）

  以 Semi `semi-foundation/backtop` 源码为唯一基准逐项核对对齐：

  - core：阈值判定 `isAboveThreshold` 由 `>=` 改为 `>`（严格大于，对齐 Semi `scrollTop > visibilityHeight`，边界处不显），单测同步。
  - svelte：默认偏移对齐 Semi `$spacing-backtop-*`——`bottom` 40→50、`right` 40→100；样式补齐 Semi 的 `box-sizing:border-box` / `overflow:hidden` / `text-align:center`；`--cd-backtop-offset-*` 的 CSS fallback 同步为 50px/100px。
  - tokens：`backtop-z` 由写死 `900` 改为消费 `var(--cd-z-affix)`（=10，对齐 Semi `$z-backtop: 10`，与 Affix 同层）；孤儿 token `--cd-backtop-border` 此前定义却从未消费，改由 `border` 真正吃它，去掉写死的 `transparent`；token 文件头注释重写为准确的 Semi 映射说明。
  - 我们相对 Semi 的超集能力（受控 `visible` / `announceOnArrive` / 三尺寸 / 选择器 target / icon·children 双插槽 / `onVisibleChange`·`onScrollEnd` / RTL / reduced-motion）保留补全，其余视觉 token 为 Semi 靠 IconButton 提供、chenzy 圆形壳所必需，均回退 alias、无写死、无 Semi 不存在的语义中间变量。

- f8e51b8: feat(banner): 破坏性重写严格对齐 Semi（DOM/tokens/API/demo 全量对齐）

  以 Semi `semi-ui/banner` + `semi-foundation/banner` 源码为唯一基准破坏性重写，移除全部 Semi 没有的自造能力，无向后兼容。

  **移除的自造能力**：
  - `resolveBannerRole` / `dynamic` / role·aria-live 推断 → 改为 Semi 固定 `role="alert"`；删除 `@chenzy-design/core` 的 `banner.ts`（`resolveBannerRole`/`BannerType`/`BannerRoleProps`）及其导出与单测。
  - `closeOnEsc` / `animation` / slide 关闭过渡 / `onAfterClose` / `onOpenChange` / 受控 `open`·`defaultOpen` / `action` 插槽 / `ariaLabel`。
  - 自造 SVG 语义图标 → 改用已对齐 Semi 的 `IconInfoCircle`/`IconTickCircle`/`IconAlertTriangle`/`IconAlertCircle`（`size="large"`）；关闭按钮改用已对齐 Semi 的 `IconButton`（`theme=borderless size=small type=tertiary` + `IconClose`）；标题/描述改用已对齐 Semi 的 `Typography.Title`(heading=5)/`Typography.Paragraph`。
  - `full` 模式左侧 accent 竖条（Semi 无此概念）。

  **DOM 结构对齐 Semi**：`div.cd-banner.cd-banner-{type}.cd-banner-full|in-container[.cd-banner-bordered] > .cd-banner-content-wrapper > (.cd-banner-content > .cd-banner-icon + .cd-banner-content-body(Title + Paragraph)) + .cd-banner-close`，`children` 渲染于平级 `.cd-banner-extra`。

  **tokens 对齐**：移除全部 Semi 没有的自造中间消费层（`--cd-banner-radius`/`-accent`/`-motion`/`-close-*`/`-info-bg` 等约 30 个），仅保留 Semi `variables.scss` 的 22 个变量（名值一一对应），组件样式直连消费。样式逐条镜像 Semi `banner.scss` + `rtl.scss`。

  **API（对齐 Semi）**：`type` / `fullMode` / `bordered` / `title` / `description` / `icon`(Snippet|null) / `closeIcon`(Snippet|null) / `children` / `onClose` / `class` / `style`；本库 Snippet 化补充 `titleSnippet` / `descriptionSnippet`（对齐 Semi title/description 传 ReactNode）。

  **demo（对齐 Semi 机制、场景不少于 Semi）**：5 个 —— 基本用法（显隐切换 + onClose）、不同类型、非全屏模式（bordered + Link）、自定义内容（children→extra）、自定义图标（补全 Semi 官方未展示的 icon/closeIcon 自定义）。

  **关联修复**：`@chenzy-design/locale` 三份文件移除无消费方的 `Banner.info/success/warning/danger` 键（保留 `closeButtonAriaLabel`）；docs content 与 component-briefs 简介同步为新实现。

## 0.3.1

### Patch Changes

- db168b0: 将 core/icons/locale 纳入 fixed 版本组，与 tokens/svelte/unocss-preset 版本统一（锁步 lockstep）。此后 6 个发布包始终保持同一版本号。

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。
