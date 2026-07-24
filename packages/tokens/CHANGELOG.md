# @chenzy-design/tokens

## 0.4.2

### Patch Changes

- 3dec738: fix(json-viewer): 严格对齐 Semi — DOM 结构/盒模型/搜索栏/token 公式

  以 Semi 真实 DevTools DOM + jsonViewer.scss 源码为基准对齐：

  - **盒模型**：height + padding(12px 0) 落在内核挂载层（对齐 Semi `.semi-json-viewer-background`），
    外层 relative div 无 padding/overflow，搜索栏浮层可溢出编辑器完整显示（此前 overflow:hidden 裁掉替换行）
  - **搜索栏 DOM 结构**：一比一重写为 Semi `search-bar-container > search-bar(Input + ul.search-options + ButtonGroup + close) + replace-bar(Input + replace + replaceAll)`
  - **搜索按钮**：改用 Button(theme=light type=primary)（浅灰底方块 + 蓝图标 + 32×32）
  - **焦点**：输入后 refocus 搜索框（对齐 Semi `searchInputRef.focus()`），可连续输入
  - **class 命名**：全改连字符（`cd-json-viewer-search-bar-*`），去 BEM `__`
  - **SearchControls**：补全对齐 Semi 全字段（showSearchBar/onToggleSearchBar/onSearch/onPrevSearch/onNextSearch/onReplace/onReplaceAll）
  - **样式全走 token 公式**：padding/gap/bg/border/radius/search-options 色改用 `--cd-*-json-viewer-*` token
    （tokens 新增 4 个 search-options-item 色 token，对齐 Semi text-2/default/primary/primary-light-default）

## 0.4.1

## 0.4.0

### Minor Changes

- 0c724b5: feat: 全库图标引用对齐 Semi + Upload 破坏性重写

  - **Icon**：删自造实现，复用 `@chenzy-design/icons` 已对齐基类（font-size 驱动尺寸 8/12/16/20/24、`cd-icon-spinning`、恒 role=img、fill/type/inherit）；移除 Semi 无的 `status`/`color` prop 与孤儿 token `--cd-icon-*`。
  - **IconButton**：去掉自造的 icon/ariaLabel 必填约束与 dev warn，三者可选；补齐 Semi 的 iconPosition/iconSize/iconStyle/noHorizontalPadding 等 props；新增「图标+文字」「iconPosition」demo。
  - **消费方图标引用对齐 Semi**：约 30 个组件（Select/Cascader/TreeSelect/Tree/Transfer/Input/InputNumber/TextArea/TagInput/DatePicker/RangePicker/TimePicker/Tabs/BackTop/Breadcrumb/Nav/Carousel/Collapse/Form/Steps/Checkbox/Rating/ColorPicker/JsonViewer/Typography 等）约 70 处手写功能性 svg 改为 `@chenzy-design/icons` 具名图标；image/upload 内部及 descriptions/breadcrumb/divider demo 同步；upload/tag-input 字面字形（×/↻/!）改具名图标。Semi 也手写的（tooltip/popover TriangleArrow、fileCard ErrorSvg/ReplaceSvg/DirectorySvg）保持手写；纯几何/插画（spin/progress/illustrations）保留。
  - **Upload 破坏性重写**：listType 改 `list`(默认)/`picture`/`none`；受控 prop 改 `fileList`/`defaultFileList`；`draggable`/`name`/`data`/`validateStatus`(+success) 对齐 Semi；删自造 `size`/`concurrency`；回调签名展开对齐 Semi（onSuccess/onError/onProgress/beforeUpload/beforeCrop）；拆独立 `FileCard.svelte`（renderPic/renderFile 双分支，引入 Button/Spin/Progress(circle)/Typography.Text/Tooltip）；DOM class 由 BEM `cd-upload__*` 全改 Semi 连字符 `cd-upload-*` 体系；补 ErrorSvg/DirectorySvg 手写图形；补 7 个 demo 场景（prompt/directory/pic-size/after-upload/before-upload/custom-drag-area/min-max-size）；4 个内部消费方（sidebar/chat/ai-chat-input/form）适配。
  - **locale**：补 Upload 3 键（selectedFiles/fail/illegalSize）。
  - **tokens**：删 icon 孤儿 token；upload placeholder-bg 由 fill-2 近似改 grey-3 精确对齐 Semi。

- cd037df: feat(button): token 值全面对齐 Semi + 引入 white/black 基元

  - button：component token 逐项对齐 Semi 真实值（用 resolve-final.mjs 解析 dist 最终字面量核对，非拍脑袋估计），Button/ButtonGroup/SplitButtonGroup 消费同步更新，meta 补齐。
  - tokens：新增 `--cd-color-white` / `--cd-color-black` 基元（rgba，对齐 Semi `$white`/`$black`）；删除自造的 `color-text-inverse`，全站白字/黑字统一收敛到 white/black 基元。
  - 连带收敛：avatar/badge/tag/upload/carousel/cascader/popover/checkbox/radio/slider/steps/switch/date-picker/video-player 等多组件的 token 消费改吃 white/black 基元，去除散落的 inverse 别名。
  - 对比度：contrast-check 同步更新受影响的配对断言。

- bfa7aff: 新增 CardGroup + InputGroup 两个子组件（对标 Semi 2.101.0，导出符号级核对时补齐的漏判子组件）。

  - **CardGroup**（`Card.Group` / 独立 `CardGroup`）：把多个 Card 以 CSS grid 网格成组排布，`spacing` 统一间距（number=水平/垂直一致；[x,y]=分别指定）。纯渲染无 core，`role=group` + 可选 `aria-label`。tokens：`--cd-cardgroup-spacing` / `--cd-cardgroup-min-column`。
  - **InputGroup**（`InputGroup`）：把多个输入类控件（Input/Select/DatePicker 等）无缝拼接为一组——相邻边框合并、首尾圆角、`size`/`disabled` 经 context 回退透传（子控件显式 prop 始终优先，不破坏各控件 API），可选整组 `label`（`aria-labelledby` 关联）+ `labelPosition` + 组级 `onFocus`/`onBlur`（focusin/focusout 冒泡）。控件区 `role=group`。tokens：`--cd-inputgroup-border` / `--cd-inputgroup-radius` / `--cd-inputgroup-label-gap`。
  - Input 支持读取 InputGroup 组级默认（`getInputGroupContext`）：`size`/`disabled` 未显式设置时回退组级值。

- 6fa1c0e: Collapse 全面对齐 Semi Design（DOM / API / tokens / demo 场景全镜像，无向后兼容）。

  - **DOM 对齐 Semi**：Header 由原生 `<button>`+`role=heading` 包裹改为 `<div role="button" tabindex=0>`（`aria-expanded`/`aria-disabled`/`aria-owns`）；string header 用 `.cd-collapse-header-right` 承载 extra + icon；content 用 `Collapsible` 原语折叠（`.cd-collapse-content` > `.cd-collapse-content-wrapper`，`aria-hidden` 随展开切换）；`.cd-collapse-item` 用 `border-bottom` 分隔；图标改为 expandIcon(IconChevronDown，收起) / collapseIcon(IconChevronUp，展开) 两图标切换而非旋转。
  - **API 纯对齐 Semi**：移除扩展 `panels` 数据驱动 / `size` / `bordered` / `headingLevel` / `onExpand` / `onCollapse` / `onHeaderClick` / roving tabindex 与 ↑↓ 漫游；补齐 `clickHeaderToExpand` / `collapseIcon` / `Panel.reCalcKey` / `Panel.onMotionEnd` / `onChange(activeKey, e)` 带事件；`keepDOM` 默认改为 `false`（对齐 Semi）。
  - **Tokens**：移除 Semi 没有的 10 个中间变量 `--cd-collapse-*`，组件直接消费 20 个原始层 `--cd-*-collapse-*`（值 / 名逐条对齐 Semi collapse/variables.scss）。
  - 关联组件 `Collapsible` 的 `reCalcKey` / `onMotionEnd` 类型补 `| undefined`（`exactOptionalPropertyTypes`）。
  - Demo 补至 8 个（基本 / 手风琴 / 禁用 / 隐藏图标 / 自定义图标 / extra / 箭头位置 / 仅点击箭头展开），覆盖并超出 Semi 官方场景。
  - **连带适配消费方 SideBar**：`SideBarCodeContent` / `SideBarFileContent` 的展开（全屏）按钮从 `Collapse.Panel` 的 `extra` 槽移入 `head` 内自渲染（新 Collapse 仅 string header 渲染 extra，对齐 Semi），点击 `stopPropagation` 不误触折叠；两者设 `keepDOM` 保留内容 DOM；`onChange` 适配新签名 `(activeKey, e)`。

- af1fe99: 新增 Collapsible 折叠容器原语（对标 Semi 2.101.0，全量核实时补齐的漏判组件）。对任意 children 做高度折叠/展开过渡，无触发器 UI（aria-expanded 由使用方提供），是 Collapse 手风琴的底层能力，作为独立原语暴露以支持 keepDOM / lazyRender / collapseHeight 等精细控制。

  - 默认（collapseHeight=0）用 CSS grid `0fr↔1fr` 自适应折叠——无 JS 测量、无布局抖动（复用 Collapse 方案）；collapseHeight>0（「展开更多」部分折叠）时改用显式高度过渡 + rAF 去抖的 JS 测高（reCalcKey / ResizeObserver 触发重测，写读分离规避 effect 循环）。
  - props：isOpen / duration / motion / keepDOM / lazyRender / collapseHeight / collapseHeightAdaptive / fade / reCalcKey / id / onMotionEnd / class / style / children。
  - core headless：`collapsibleShouldRender`（keepDOM × lazyRender × isOpen × collapseHeight 组合派生）+ `collapsibleCollapsedHeight`（自适应折叠高度）。
  - a11y：完全折叠且不可见时内容 `aria-hidden`；prefers-reduced-motion 移除过渡。
  - tokens：`--cd-collapsible-motion-duration` / `--cd-collapsible-motion-ease`。

- e4a6c5c: 新增 DragMove 通用拖拽移动组件（other，对标 Semi 2.101.0 并做 a11y 增强）。包裹单个子元素使其可被拖拽在页面/约束区内自由移动（与 Resizable 改尺寸正交，DragMove 改位置）。core 沉淀第二个通用拖拽原语 `createDragMove`（继 createResizeDrag 之后）：pointerdown 记录起点 → document 绑 mouse/touch move/up → 计算 clamp 到 constrainer 的 top/left → customMove 或写 style.top/left → up 解绑 + 卸载兜底（命令式几何，红线 #3，不用响应式读几何），设计以能替换 Modal 可拖拽标题栏 / Cropper 画布拖拽为目标（后续收敛）。约束区支持 `'parent'`/自定义 DOM/无约束；`allowMove` 谓词拦截；`allowInputDrag` 控制是否从 input/textarea 发起（默认 false，避免干扰文本选择）；鼠标/触摸事件全透传。超越 Semi：可选 `keyboard` 把手键盘可达（tabindex + 方向键移动 + i18n aria-label），触摸 `touch-action:none`。新增 `--cd-dragmove-cursor` component token（默认 move）与 locale key `DragMove.handleAriaLabel`（zh「拖动」/ en「Drag to move」）。
- e7c9cd7: 新增 Feedback 用户反馈弹窗（对标 Semi 2.101.0，全量核实时发现的漏判组件——Semi 正式 `export { Feedback }`）。以 Modal 或 SideSheet 形态收集结构化用户反馈，纯组合本库现成组件。

  - svelte：`Feedback.svelte` 按 `mode`（modal→Modal / popup→SideSheet）复用外壳，按 `type`（text→TextArea / emoji→自建 radiogroup 表情行 / radio→RadioGroup / checkbox→CheckboxGroup / custom→renderContent slot）渲染内容；外壳的 focus-trap / inert / Esc / 锁滚直接复用。
  - props：mode / type / value（FeedbackValue = string | string[] | EmojiResult）/ onValueChange / options / textAreaProps / renderContent / content / onOk（异步 await 期间外壳 loading）/ onCancel / afterClose / emojis + 透传外壳（open / title / width / placement / onOpenChange）。value 归一化内联（逻辑简单，未建 core）。
  - a11y：emoji 评分 `role="radiogroup"` + 每 emoji `role="radio"` + aria-label（表情语义走 i18n）+ 方向键 roving 选择（对齐 Rating 键盘范式）；提交 loading 时按钮 aria-busy；外壳 dialog / focus-trap / Esc 复用 Modal / SideSheet。
  - tokens：`--cd-feedback-emoji-size` / `--cd-feedback-emoji-gap` / `--cd-feedback-emoji-active-scale` / `--cd-feedback-content-gap`。
  - locale：`Feedback.{submit,cancel,placeholder,ratingLabel,emojiVeryBad/Bad/Neutral/Good/VeryGood}`（zh_CN / en_US）。

- afd5848: FloatButton：修徽章位置 + Group 椭圆，并将 Group 补齐为 Semi 胶囊工具条。

  - **徽章位置**（bug）：此前 Badge 只包裹 icon 小框，徽章相对 icon 定位而非整个按钮，浮在按钮外偏上。现让 Badge 包裹层撑满按钮，并用 Semi 的几何公式将徽章定位到圆形边缘切点（`偏移 = 0.29 × 0.5 × 按钮宽`，按 size 三档分别计算；square 用 `0.29 × 圆角半径`），徽章正确咬合在按钮右上角。
  - **Group 椭圆**（bug）：Group 里 icon-only 项此前误传空 children snippet，触发 FloatButton 的 `with-content`（宽度撑开），配合 round 的 50% 圆角渲染成椭圆。现仅在有 content 时才传 children；并给 round + with-content 用胶囊圆角（`border-radius-full`）而非 50%，避免宽矩形上变椭圆。
  - **Group 胶囊工具条**（对齐 Semi）：`FloatButtonGroup` 由「纵向独立圆按钮」改为 Semi 形态——一个背景圆角条内横排（或竖排）多个「图标 + 文字」项（bg + shadow + padding + gap，item 有 padding/hover 背景/圆角）。新增 `direction` prop（`'horizontal'`（默认）/`'vertical'`）。新增 11 个 Group 相关 component token。demo 06 更新为胶囊工具条演示。

- af50bfe: FloatButton：`shape="round"` 改为正圆对齐 Semi，并新增自定义圆角能力。

  - **round 正圆**：`floatbutton-radius-round` token 由 `border-radius-large`（12px 圆角矩形）改为 `border-radius-circle`（50% 正圆），对齐 Semi 及 icon-only 悬浮按钮惯例。此前 round 只有 12px 圆角、视觉上「没有圆形」。
  - **自定义圆角**（本库相较 Semi 额外提供）：`shape` 类型扩展为 `'round' | 'square' | string`，接受任意 CSS border-radius 字符串（如 `'8px'`、`'30%'`）直接作为圆角，在正圆与方形之间自由过渡。`round`/`square` 仍走语义预设 class + token，自定义值走 inline `border-radius`。
  - docs demo：修正「形状与尺寸」的描述/aria（此前把 12px 圆角误标为「圆角」，现明确 round=正圆）；修「href 链接」demo 源码里 `&lt;a&gt;` HTML 实体显示问题与示例链接（原硬编码指向 Semi 官网，改为本库仓库）；新增「自定义圆角」demo 演示 round/square/8px/30%。

- c203124: FloatButton / FloatButtonGroup 破坏性重写，严格对齐 Semi Design（无向后兼容）。

  - **DOM 对齐**：改为 Semi 的纯 `div + onClick`（外层 div 带 size+shape class，body 带 shape+size(+colorful?+disabled?) class），Group 为 `div` 容器 + `div.item[data-value]` 事件委托直接读 `e.target.dataset.value` 回传。href 靠 JS 跳转（`_blank` → `window.open`，否则 `location.href`）。
  - **移除自造 API**：`ariaLabel`、`children`（文字内容）、自定义 shape 字符串、Group 的 `direction`、item 的独立 `disabled/ariaLabel`；移除 `<button>/<a>` 语义化、focus-ring、reduced-motion、dev warn。
  - **Token 值/DOM 对齐 Semi**：尺寸修正 24/32/40、z=1000、square 圆角 8px、位置 24px；配色 bg=fill-0、text=primary、disabled 用 disabled-bg/text；Group item bg-hover/active=fill-1/fill-2、补字号 14/行高 20/字重 400。移除中间变量 `colorful-gradient`/`focus-ring`/`motion-duration`/`disabled-opacity`/`border`。
  - **新增 AI 色板 alias**：`--cd-color-ai-general/-hover/-active`（明暗双主题，镜像 Semi `--semi-color-ai-general` general-5/6/7 的 `linear-gradient(278deg, 4 色标)`），colorful 直接消费之。
  - **移除 locale key** `FloatButton.groupAriaLabel`（Group 不再有 aria-label）。
  - Demo 按 Semi 机制重组为 7 个（基础/尺寸/形状/href/colorful/带徽章/Group），覆盖 Semi 全部场景。

- 57d5e82: 新增 FloatButton + FloatButtonGroup 悬浮操作按钮（basic，对标 Semi 2.101.0 并做 a11y 增强）。悬浮固定在视口的可操作入口：无 href 渲染 `<button type="button">`，有 href 渲染 `<a href target rel>`（`_blank` 自动补 `rel="noopener noreferrer"`），天然键盘可达；icon-only 必须 `ariaLabel`（dev 缺失 warn）。支持 shape(round/square)、size(small/default/large)、colorful AI 渐变、可选包裹 Badge。定位靠 style 逻辑属性（inset-inline-end/inset-block-end），RTL 友好。FloatButtonGroup 平铺容器（role="group"）遍历 items 渲染并事件委托回传 value。新增 `--cd-floatbutton-*` component token 与 locale key `FloatButton.groupAriaLabel`。
- a602da2: Grid（Row/Col）：破坏性重写严格对齐 Semi Design（float 布局机制 + type prop）。

  - Row：新增 `type?: 'flex'`。缺省渲染 `cd-row`（display:block + clearfix ::before/::after），`type="flex"` 渲染 `cd-row-flex`（display:flex）并激活 `cd-row-flex-{justify}` / `cd-row-flex-{align}`。移除 `wrap` prop；`align` 收窄为 top/middle/bottom，`justify` 收窄为 start/end/center/space-between/space-around（删 baseline/stretch/space-evenly）。gutter 改为 Semi 真实四向负 margin（水平 marginLeft/Right、垂直 marginTop/Bottom），移除 `--cd-grid-gutter-x/y` CSS 变量与 row-gap。新增 `style` prop（追加在 gutter margin 之后可覆盖）。保留 screens 状态机（复用 core registerMediaQuery/defaultResponsiveMap）+ getGutter 从大到小降级。
  - Col：布局机制从 flex-basis + max-width 改为 Semi float（`float:left` + `width%`；push→left、pull→right、offset→margin-left、order→order）。四向 gutter padding（补齐垂直 padding-top/bottom 抵消 Row 垂直负 margin）。移除 `flex` prop，新增 `style` prop。补 `.cd-rtl` RTL 覆盖（float:right、offset margin-right）。断点 xs 无 @media、sm/md/lg/xl/xxl 包 @media，col-0 系列 display:none。百分比与断点值（576/768/992/1200/1600）逐字镜像 Semi。
  - tokens：删除 Semi 无的中间 token（grid-columns、grid-gutter-x、grid-gutter-y）；组件走 float + 内联样式，无运行时 CSS 变量消费。保留 width-grid-screen-\* + width-grid-columns + width-grid-gutter 作为设计变量表。
  - demo：justify/align/order demo 加 `type="flex"`；gutter demo 补响应式对象示例；删除依赖已删 prop 的 09-flex-fill（Col flex）与 10-nowrap（Row wrap）。
  - DOM / class 名 / CSS 值逐字对齐 Semi（cd-row / cd-row-flex / cd-row-flex-center / cd-col / cd-col-8 / cd-col-md-12 等）。

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

- 6b11fb5: feat(sidebar): SideBar Annotation 引用溯源（P2）

  新增 `SideBarAnnotation`——AI 侧边信息栏的参考来源/引用溯源折叠列表：外层复用
  `SideBarContainer` 浮层壳（透传全部 Container props，`title` 默认走 i18n），内部用
  `Collapse` 渲染 `info` 分组（每组一个折叠面板，`aria-expanded` 由 Collapse 落实），
  展开区渲染 video（封面/时长/播放态，`duration` 走 locale 数值格式化为 mm:ss）/text
  （站点 logo/名称/引用序号）卡片。可点击卡片（`url` 或 `onClick`）用原生 `<button>`
  （键盘 Enter/Space + focus 环 + 时长/序号本地化可访问文本），`renderItem` 可整条覆盖。
  新增 `--cd-sidebar-annotation-*` token 与 `SideBar` locale（annotationTitle/annotationEmpty/
  videoDuration/citationOrder）。

- 4a46919: SideBar P4：新增 SideBarCodeContent 代码/JSON 预览折叠列表（对标 Semi sideBar/widget/code）。Collapse 折叠列表，每项一个 CodeItem，按 `isJson` 分流：`true` 用 JsonViewer 渲染 content（内核动态 import 惰性加载），`false` 用 CodeHighlight 按 `language` 语法高亮；透传 `jsonViewerProps` / `codeHighlightProps`。折叠头显示图标 + `name` + 全屏展开按钮，点击展开按钮走 `onExpand(e, code, 'code')` 不触发折叠。受控 `activeKey`（不回写，仅 `onChange` 通知，内部兜底非受控）。a11y：折叠头 `aria-expanded` 由 Collapse.Panel 提供，展开按钮 `aria-label` 走 i18n（新增 `SideBar.expand`）。新增 `--cd-sidebar-code-*` component token。
- da59fd4: feat(sidebar): FileContent 富文本查看/编辑列表（P5）

  SideBar 套件 P5 阶段：新增 `SideBarFileContent` 富文本折叠列表 + `SideBarFileItem` 单编辑器。
  基于 tiptap v3，默认扩展集对齐 Semi：StarterKit（link openOnClick:false）+ TextStyleKit + Image
  - TextAlign(types:['heading','paragraph']) + 自研 SelectionMark + 自研 ImageUploadNode（用
    svelte-tiptap NodeViewRenderer 内嵌本库 Upload，支持 getUploadImageSrc），末尾拼接使用方 extensions。
    `editable` 控制查看/编辑（编辑态渲染格式工具栏），`content` 为初始 HTML，`onContentChange`
    回调 editor.getHTML()。tiptap 内核 + 3 官方扩展（@tiptap/extension-text-style /
    extension-image / extension-text-align）+ svelte-tiptap 全程动态 import，不进主 bundle。

- 7243000: SideBar P3：新增 SideBarMcpConfigure MCP 工具配置面板（对标 Semi sideBar/mcpConfigure）。外层复用 SideBarContainer（继承并透传全部 Container props，`title` 默认走 i18n `SideBar.mcpTitle`）；内部顶部显示已启用计数（`已启用 N/总数`）+ 搜索框（复用本库 Input，前缀放大镜 + `aria-label`），下方并列渲染内置（`options`）/ 自定义（`customOptions`）双列表（Semi 用 radio 二选一切换，本库改并列双列表更直观）。每项：前置图标（`string` 按图片 URL / `Snippet` 自定义）+ `label` + `desc` + 动作按钮（内置 `configure=true` 显示配置 / 自定义显示编辑，`aria-label` 含工具名走 i18n）+ 启用开关（复用本库 Switch，原生 `role="switch"` + `aria-checked`，`disabled` 预设项锁定 + `title` tooltip）。搜索支持自定义 `filter(input, option)` 谓词（默认 label/value 大小写不敏感包含匹配）；启用变化经 headless `toggleMcpOptionActive` 产出「下一份数组 + custom 标记」上抛 `onStatusChange`，绝不回写 prop（受控红线）。自定义组为空显示添加入口（`onAddClick`），无搜索结果显示提示。

  core 新增框架无关纯函数 `filterMcpOptions` / `toggleMcpOptionActive` / `countActiveMcpOptions` 与类型 `McpOptionCore`。新增 `--cd-sidebar-mcp-*` component token 与 `SideBar.mcp*` locale（含修 Semi 硬编码「请输入」的 `mcpSearchPlaceholder`）。

- 84b6975: 新增 SideBar（AI 侧边信息栏套件，show/AI，对标 Semi Sidebar）P0+P1 阶段。P0 SideBarContainer 为可伸缩浮层壳：贴视口右侧（RTL 贴左），`role="dialog"` + `aria-labelledby`(title)，打开移焦 + focus-trap 焦点捕获/归还 + Esc 关闭，堆叠 z-index 复用 modal/z-stack 计数器（与 Modal/SideSheet 统一层栈，后开者在上）；resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core `createResizeDrag`（axis:'x' 单轴 + clamp minWidth/maxWidth），把手 `role="separator"` + `aria-orientation="vertical"` + `aria-valuenow` + 键盘 ←→/Home/End（与 Resizable 同套 a11y，不重造拖拽几何）；motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。P1 SideBar 主壳按 mode 路由：main 渲染顶部 Options 图标 tab 组（`role="tablist"` + roving tabindex + 键盘，name 作无障碍名）+ renderMainContent(activeKey)；detail 渲染 renderDetailHeader + 返回按钮（onBackWard 可异步，await 期间禁用防重触发）+ renderDetailContent(mode)。core 新增纯函数 `parseSideBarWidth` / `clampSideBarWidth`。新增 `--cd-sidebar-*` component token 与 locale key `SideBar.close` / `SideBar.back`。detail 里 code/file 具体渲染与 Annotation/MCPConfigure 留待 P2~P5 接续。
- e96d53d: Space：破坏性重写严格对齐 Semi（无向后兼容）。

  - **组件**：破坏性移除超集 `block` / `tag` / `role` / `ariaLabel`，根元素恒 `<div>`，props 仅保留 Semi 的 `vertical` / `spacing` / `align` / `wrap` / `class` / `style` / `children`。
  - **DOM/样式**：gap 与 align 改为 class 驱动（不再用 inline style），完整镜像 Semi scss —— `cd-space` + `cd-space-vertical` / `-horizontal` + `cd-space-align-{center|start|end|baseline}` + `cd-space-wrap` + `cd-space-{tight|medium|loose}-horizontal` / `-vertical`；仅 number / 数组中的 number 元素走 inline `column-gap` / `row-gap`。补齐 `...rest` 透传（对齐 Semi getDataAttr 的 data-\* 透传）与 RTL `direction`。
  - **tokens**：删除多余中间变量 `--cd-space-tight` / `-medium` / `-loose`，仅保留对齐 Semi variables.scss 的 3 个 `--cd-spacing-space-tight` / `-medium` / `-loose`。
  - **CardGroup（消费方先对齐 Semi）**：不再向 Space 传 `block` / `align` / `role` / `ariaLabel`（Semi CardGroup 亦不传），并移除 CardGroup 自身的 `ariaLabel` prop；grid 布局靠 `.cd-card-group--grid` scss + Space inline-flex/wrap。
  - **demos**：对齐 Semi 5 例（基本用法 / 对齐方式 / 间距尺寸含 array / 间距方向 / 设置换行），移除依赖已删超集能力的自造 demo。
  - meta / spec / content 全量对齐新 API。

- 47f42ee: feat(tag): 新增 TagGroup 与 SplitTagGroup 两个 Tag 子组件（深度对标 Semi 2.101.0 导出符号级核对补齐）

  - TagGroup：一组 Tag 成组渲染，`tagList` 数据驱动或 `children`；超过 `maxTagCount` 折叠剩余为「+N」标签，`showPopover` 时 hover 在 Popover 弹层展示被折叠项。透传 `size`/`avatarShape`，支持 `restCount`/`onTagClose`/`onPlusNMouseEnter`/`popoverProps`。复用本库 Tag/Popover。
  - SplitTagGroup：连接式标签组，首子前缘圆角、末子后缘圆角、中间合并边，形成分段控件外观（纯 CSS 装饰）；`ariaLabel` 组可访问名。
  - a11y：两者 `role="group"`；TagGroup +N 带 `aria-label`（i18n `TagGroup.restTagsAriaLabel`，含 {count}），弹层复用 Popover 键盘/Esc；SplitTagGroup 组容器 `aria-label`。
  - tokens：新增 `--cd-taggroup-gap`、`--cd-splittaggroup-divider-width`、`--cd-splittaggroup-divider-color`。
  - locale：新增 `TagGroup.restTagsAriaLabel`（zh/en）。

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

- 53e38ca: feat(breadcrumb): 全面对齐 Semi Breadcrumb（字段/API/moreType/截断/tokens）

  以 Semi `semi-foundation/breadcrumb` + `semi-ui/breadcrumb` 源码为基准逐项对齐（无向后兼容）：

  - **Route 字段**：`BreadcrumbRoute` 由 `{label, href}` 重构为 Semi 的 `{name, path, href, icon}`；`routes` 元素支持纯字符串（归一化为 `{name}`，对齐 Semi genRoutes）。所有 demo/测试同步 `label→name`。
  - **moreType**：枚举由自造的 `'tooltip'|'popover'` 改为 Semi 的 `'default'|'popover'`，默认 `'default'`（点击三点图标就地展开）；`'popover'` 悬浮弹出可点击折叠项菜单。移除 `'tooltip'` 值。
  - **默认值**：`maxItemCount` `0→4`（对齐 Semi）。
  - **showTooltip 对象化**：由 `boolean` 扩展为 `boolean | { width, ellipsisPos, opts }`，默认 `{ width: 150, ellipsisPos: 'end' }`（对齐 Semi showToolTipProps）。**真正实现 `ellipsisPos: 'middle'` 中间截断**（JS action 二分裁剪为「头…尾」+ ResizeObserver 响应尺寸；完整名经 Tooltip 展示、`aria-label` 保留可访问名）。
  - **折叠图标**：折叠触发器由文本 `…` 改为 IconMore 风格三点 SVG（对齐 Semi IconMore）。
  - **新增 API**：`ariaLabel`（覆盖 i18n，对齐 Semi aria-label）、`style`（根节点内联样式）。
  - **tokens 修复**：链接色由单一 `breadcrumb-color-link`（语义错位，指向 hover 蓝）拆为三态 `link`(常态灰 text-2) / `link-hover`(链接蓝) / `link-active`(深蓝)，对齐 Semi item 常态灰 → hover 蓝 → active 深蓝；新增 `breadcrumb-restitem-color`（折叠项文字色，对齐 Semi restItem）。样式补齐 Semi `.semi-breadcrumb { overflow: hidden }`。
  - **文档**：新增 06-tooltip demo（截断 + width + end/middle 省略）；05-collapse 移除 tooltip 场景、改为 default/popover。

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

- 3d42e1d: fix(nav): 侧边导航 header 左内边距对齐 Semi（logo 与折叠态图标居中对齐）

  **问题**：`NavHeader` 无论 vertical/horizontal 都复用顶部导航的 `padding-left: 24px`（`navigation-horizontal-paddingleft`），导致侧边态 logo 左缘比菜单图标右偏 12px。

  **修复（对齐 Semi）**：Semi 侧边 header 有专属 `paddingLeft`，按公式派生使 logo 在折叠态容器内居中。

  - 新增 token（镜像 Semi 变量，保留 `calc()` 公式派生而非落魔数）：
    - `height-navigation-header-logo-collapsed`（36px）
    - `spacing-navigation-vertical-header-paddingleft` = `calc((折叠容器宽 − 折叠水平内边距×2 − 描边 − Logo 折叠尺寸) / 2)`
    - `spacing-navigation-vertical-header-paddingright`（tight/8px）、`...-collapsed-paddingleft`（同公式）、`...-collapsed-paddingright`（0）
  - `NavHeader` 新增 `mode` prop，CSS 按 `--vertical/--horizontal/--collapsed` 分派内边距；顶部导航仍 24px，侧边用专属值。
  - `Nav` 向 `NavHeader` 透传 `mode`。

  逐像素对齐 Semi 官网：header padding-left = 3.5px，logo 左缘比菜单图标左 8px（Semi 原生设计，以折叠态图标居中为基准），展开/折叠两态一致。

- 46dab20: feat(time-picker)!: 破坏性重写严格对齐 Semi（复用 ScrollList/ScrollItem + Input 触发器 + 删超集 + 双列 range）

  以 Semi `semi-ui/timePicker/{TimePicker,Combobox,TimeInput}.tsx` 为唯一基准破坏性重写。**无向后兼容**。

  **面板复用 ScrollList/ScrollItem**（最大项）：删自绘 `<ul><li>` + 自造 roving/scrollIntoView/colItemTabindex，改用 `<ScrollList>` 包 hour/minute/second/(ampm) 四个 `<ScrollItem mode="normal">`（镜像 Semi Combobox）。选择走 `onSelect` 回调；选中项带单位后缀 transform（时/分/秒）。

  **range 双列并排**：删单列 tablist（起/止 tab 切换）+ footer 确定跳转，改左右两个 Combobox（ScrollList）并排（对齐 Semi `RANGE_PANEL_LISTS`），左列 begin / 右列 end，中间 border 分割，一次编辑两端。

  **触发器 button → Input**：删只读 `<button>`，改复用 `<Input hideSuffix suffix={IconClock} role="combobox">`（镜像 Semi TimeInput），支持键入时间串（Enter/Blur 解析提交）。

  **⚠️ 破坏性变更**：
  - 删超集 prop：`range`（用 `type="timeRange"`）、`showNow`（连带 footer「此刻」按钮）、`showSecond`（改由 `format` 是否含 `ss` 驱动）、`clearable`（留 `showClear`）、`destroyOnClose`、`onClickOutSide`、面板「确定」按钮、range tablist。
  - 改名：`dropdownClassName → popupClassName`、`dropdownStyle → popupStyle`、`status → validateStatus`。
  - 默认值校准：`onChangeWithDateFirst` false→**true**、`focusOnOpen` true→**false**、`rangeSeparator` `'~'`→**`' ~ '`**、`format` 默认 undefined→**`'HH:mm:ss'`** 并以此驱动列显隐。
  - 补缺失：`class`/`style`/`id`、`insetLabel`/`insetLabelId`、`clearText`、`validateStatus`、`aria-*` 组（labelledby/describedby/errormessage/invalid/required）。

  **tokens**：TimePicker 面板消费回 Semi 对齐的 `--cd-width-time-picker-panel-list-*`（64/72px）与 `--cd-height-time-picker-panel-body`（252px），删自造 56/28px 短名的 TimePicker 侧消费（DatePicker/RangePicker 仍消费故保留定义）；面板列居中留白按 Semi 公式 `(panel_body - item) * 0.5` 重算（对齐 timePicker.scss，替代 ScrollList 默认 300px 视窗高）；删悬空 `--cd-height-time-picker-scrolllist-item`（改由 ScrollList 自身 `--cd-height-scroll-list-item` 驱动）。

  **ScrollItem 补对齐**：normal 模式挂载/`selectedIndex` 变化时把选中项滚到居中（对齐 Semi `componentDidMount`/`componentDidUpdate` 的 `scrollToNode`，此前仅 wheel 模式有初始定位）。DatePicker 年/月列用 wheel 模式，不受影响。

  **ScrollList**：`header`/`footer` 类型放宽接受显式 `undefined`（exactOptionalPropertyTypes 下透传 optional prop）。

  **demos**：删 `show-now`/`destroy-on-close`/`prefix`（超集），range 改双列观感，补 `timeZone` demo；`size-status` 改用 `showClear`/`validateStatus`，`step-disabled` 改 `format="HH:mm"` 驱动秒列隐藏。

## 0.3.1

## 0.3.0

### Minor Changes

- 414acdb: 补全语义色 token：新增 --cd-color-secondary（强中性深灰）与 --cd-color-tertiary（弱中性浅灰），light/dark 各一套，与 Button --btn-hue 同源。此前这两个变量未定义，引用会静默回退。

  Button 文档新增「关于类型字体色值」节（对齐 Semi）：说明每种 type 对应的 --cd-color-\* 语义变量，并用 demo 把主要/次要/第三/警告/危险按对应变量上色。

- 6d3a6e6: 颜色值对齐 Semi design tokens（以 Semi 开源仓库 semi-theme-default/scss/global.scss 为准）：

  - **浅色背景 bg-1/2/3 改为纯白 `#fff`**（原为实色灰阶 grey-0/1/2）。对齐 Semi「浅色 4 层背景全白、层级靠 border/fill 半透明叠加区分」的设计哲学，消除顶栏/卡片等处突兀的灰带。
  - **border 改为半透明 `rgba(28,31,35,0.08)`**（Semi `rgba(grey-9,.08)`，原为实色 grey-1），更淡更柔和。
  - **新增 `fill-2`**（浅 `rgba(46,50,56,.13)` / 暗 `rgba(255,255,255,.2)`，对齐 Semi 激活态填充）。
  - **暗色校正**：bg-2 `#2e3238`→`#35363c`、bg-3 `#41464c`→`#43444a`、border 改半透明 `rgba(255,255,255,.08)`、fill 改 `rgba(white,.12/.16/.2)`，与 Semi 暗色一致。

  此前 fill-0/1、text-0~3、primary 已对齐 Semi；本次补齐 bg/border/fill-2 的偏差。全量 971 测试通过、contrast-check 通过、Layout/Table 等组件实测无回归（白底 + border 区分，观感更贴 Semi）。

- 064382b: 颜色语义层 1:1 对齐 Semi design tokens（以本地 Semi 源码 semi-theme-default/scss/global.scss 为准），light + dark 两套：

  - **状态色补全四档 + 浅版三态**：primary/secondary/tertiary/success/warning/danger/info 各补 `hover`/`active`/`disabled` 与浅版 `light-default`/`light-hover`/`light-active`。
  - **secondary 改为 light-blue 青蓝**（对齐 Semi，原为中性灰；该 alias 无组件依赖灰色行为）；tertiary 改为 grey-5 三态。
  - **新增 disabled-text/border/bg/fill、shadow、nav-bg、overlay-bg、bg-4、bg-inverse、focus-border、link-hover/active/visited**。
  - **修复 dangling token**：`danger-light-default`/`warning-light-default`/`link-hover`/`bg-inverse` 此前被组件引用但从未定义（同 #356 的 primary-light-default 问题，解析为 transparent），现补齐。
  - Popover OK 按钮 hover 从未定义的 `--cd-color-primary-6` 改用 `--cd-color-primary-hover`。

  未纳入（无组件消费、避免膨胀）：data-_（vchart 数据色板）、ai-_、highlight、default-\*。全量 971 测试 + contrast-check + typecheck 通过，Banner/Layout/Table 实测无回归。

- 9780bf7: 对齐 Semi tokens（第 1 步·纯新增，不破坏）：

  - **spacing** 补 `none`(0) / `super-tight`(2px)。
  - **font-size** 补 `18` / `28`（对齐 Semi header-5/header-2）。
  - **font-weight** 补 `light`(200)。
  - **radius** 补 `circle`(50%) / `extra-small`(3px)。
  - **shadow** 新增 `elevated`（`0 0 1px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.1)`，对齐 Semi `$shadow-elevated`）。
  - **新增 foundation 尺寸全局 token**：`control-height-small/default/large`(24/32/40)、`width-icon-extra-small…extra-large`(8/12/16/20/24)、`border-thickness`(0)/`border-thickness-control`(1px)。Radio 的 `--cd-control-height-*` 悬空引用现已激活（修正为 small/default/large 命名）。
  - **z-index 对齐 Semi 值**：tooltip 1070→1060、toast 1080→1010，补 notification(1010)/table-fixed(101)/image-preview(1070)/drag(2000)。

  本步骤只增不改名、不删旧 token，零破坏（旧名仍在）。后续步骤再做语义重命名与旧档清理。

- 2560973: 对齐 Semi tokens（第 3 步·清理旧档，**破坏性**）：

  - **shadow**：删除 `shadow-1/2/3` 三档，统一为 Semi 的 `shadow-elevated`（`0 0 1px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.1)`）。所有提升层级面（modal/tooltip/popover/card/drawer/toast/select/date-picker 浮层等）改用 `shadow-elevated`。
  - **line-height**：删除无单位 `tight/normal/loose`，改为对齐 Semi `_font.scss` 的 font-size↔line-height 像素绑定：`line-height-small/regular/header-1~6 = 16/20/22/24/28/32/40/44`。无组件直接消费旧名。

  `font-weight-medium`(500) 暂保留（Semi 无 500，但我们 14 组件用作 UI 强调，刻意保留）。tokens 升 major（删旧 token 名）。977 测试（含 6 视觉基线零偏移）通过；浏览器实测 card/modal 等浮层用新 elevated 阴影。

- 79aff09: 对齐 Semi tokens（第 2 步·语义重命名，**破坏性**）：全局 scale token 改用 Semi 语义名（值不变）。

  迁移映射：
  - **spacing**：`spacing-1/2/3/4/5/6/8/10` → `spacing-extra-tight/tight/base-tight/base/base-loose/loose/extra-loose/super-loose`（`spacing-12` 保留，Semi 无 48px 档）。
  - **font-size**：`font-size-1/2/3/4/5/6` → `font-size-small/regular/header-6/header-4/header-3/header-1`。
  - **radius**：`radius-1/2/3/full` → `border-radius-small/medium/large/full`。
  - **font-weight**：`font-weight-semibold` → `font-weight-bold`（值同 600）。

  全库 717 处 `var(--cd-...)` 引用经 codemod 同步替换；uno-theme.ts、docs token 分类器与 tokens-detail.json 一并更新。值零变化，6 个视觉回归基线零像素偏移。消费方若直接引用旧 `--cd-spacing-1` 等需按映射改名。

### Patch Changes

- 0a3d18d: 收尾核查·对齐 Semi 剩余偏差 + 清理旧 token 名：

  - **Select**：选项选中态文字 primary→text-0（Semi option_main-text=text-0，靠背景高亮区分选中）；拆出 select-option-check-color(primary) 给对勾图标单独用。
  - **Tree**：搜索高亮文本 warning(橙)→primary + 去背景(transparent) + 字重 bold（对齐 Semi tree hightlight-text=primary）。
  - **旧 token 名清理**：--cd-radius-small→--cd-border-radius-small（list meta）、--cd-radius-default→--cd-border-radius-small（OverflowList）、--cd-font-size-0→--cd-font-size-small（DatePicker）——早期语义重命名遗漏残留（旧名不存在，靠 fallback）。

  均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。

- 5558646: 逐组件样式对齐 Semi（第 1 批·核心控件）：

  - **Button**：圆角 6px→3px（border-radius-small）、字重 medium(500)→bold(600)、padding-x 按尺寸分档（default/small=12px、large=16px）、全尺寸字号统一 regular(14)，对齐 Semi Button variables。
  - **Input / Select / Tabs(卡片式) / Pagination(页码)**：控件圆角 6px→3px，对齐 Semi（Semi 表单控件/页签/页码用 border-radius-small）。
  - 控件高度 token 统一引用全局 `--cd-control-height-*`。

  面板类（dropdown/modal/table/toast/tooltip 等）保持 medium(6px)，本就对齐 Semi。Button 视觉回归基线已重生。

- 1076cac: 逐组件样式对齐 Semi（第 2 批·反馈/展示/导航）：

  - **Modal**：标题字号 header-6(16)→regular(14)、新增标题字重 token（bold 600）、遮罩 `rgba(0,0,0,.45)`→`--cd-color-overlay-bg`（rgba(22,22,26,.6)，对齐 Semi overlay-bg）、`modal-z` 字面量 1000→引用 `--cd-z-modal`。
  - **Menu**：菜单项高度 40px→36px（对齐 Semi navigation_item_base）、新增 `menu-item-radius`（border-radius-small），选中态高亮块带圆角。选中态配色对齐 Semi——文字 primary→text-0（深色）、新增 `menu-item-icon-color-selected`（图标/对勾保持 primary）、**移除垂直态左侧指示条**（靠蓝底+蓝图标区分）、**移除水平态底部下划线**（Semi 顶部导航选中态仅靠文字 text-2→text-0 深浅区分，无下划线）。删除不再被消费的 `menu-item-indicator` token。
  - **Dropdown**：菜单项水平内边距 base-tight(12)→base(16)，对齐 Semi 下拉菜单项内边距。
  - **Table**：默认行单元格垂直内边距 base-tight(12)→base(16)，对齐 Semi 默认尺寸 tbody 单元格。
  - **Tooltip**：内边距 4/8→8/12（spacing tight/base-tight）、字号 small(12)→regular(14)，对齐 Semi tooltip。
  - **Popover**：圆角 large(12)→medium(6)，对齐 Semi 气泡卡片圆角。
  - **Notification**：圆角 large(12)→medium(6)，标题字重 token 化（新增 `notification-title-weight` = bold）。
  - **Toast**：水平内边距 base(16)→tight(8)、文本字重 token 化（新增 `toast-font-weight` = bold），对齐 Semi toast。
  - **Tag**：尺寸档对齐 Semi（`TAG_SIZE=['default','small','large']`，default≡small=20px、large=24px）——default 高度 24→20、large 高度 28→24；新增垂直内边距 token（`tag-padding-y`=2px、`tag-padding-y-large`=4px）。字号 small(12)、水平内边距 tight(8)、圆角 small(3) 本就一致。**注意：default Tag 默认高度由 24px 变 20px**（视觉更紧凑，API 不变）。Tag 视觉基线已重生。
  - **Switch**：**开启态背景 primary(蓝)→success(绿)**、关闭态 fill-1→fill-0，对齐 Semi（Semi switch 开启全主题用 success 系）。**注意：开关开启色由蓝变绿**。尺寸全对齐 Semi——default 高 22→24、small 宽 28→26、large 54×52→54×32（滑块/位移由 track 宽高自适应跟随）。Switch 视觉基线已重生。
  - **InputNumber 步进器**：从扁平透明改为 Semi 实底按钮——新增步进器 token（宽 14px、背景 bg-2、描边 color-border、图标 text-2、small 圆角、hover fill-0/active fill-1），按钮间 1px 缝、右侧 4px 外边距，对齐 Semi inputNumber 步进器。
  - **Card**：圆角 large(12)→medium(6)、内边距 base(16)→base-loose(20)、标题字重/字号 token 化（bold/header-6），新增描述(text-2)/正文(text-1)颜色 token，对齐 Semi card。
  - **Avatar**：尺寸档对齐 Semi（xs 20→24、small 28→32、default 36→40、large 44→72、xl 56→128，新增 medium=48 档）；新增 `avatar-border`(bg-1)；方形圆角 medium→small（圆形默认走 --circle 规则不变）。Avatar 视觉基线已重生。
  - **Collapse**：标题字重 token 化（新增 `collapse-header-weight`=bold）、header 内边距 12/16→tight(8)、content 内边距对齐 Semi（top 4/x 16/bottom 8）、新增 header 按下背景 fill-1。
  - **Progress**：**默认进度色 primary(蓝)→success(绿)**、水平条高度 default 8→4、large 12→6，对齐 Semi progress。**注意：默认进度条由蓝变绿**。
  - **Checkbox**：默认描边 color-border→text-3（更明显）、默认背景 bg-0→transparent；新增未选中悬浮态（描边 focus-border、背景 fill-0）；卡片悬浮 bg-1→fill-0、新增卡片选中背景 primary-light-default。
  - **Radio**：默认描边 color-border→text-3、默认背景 bg-0→transparent；新增未选中悬浮态（描边 focus-border、背景 fill-0）；修正 card-radius 旧 token 名 `--cd-radius-medium`→`--cd-border-radius-medium`。

  均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线（Tag 基线未变，证明未误伤）；971 单元/DOM + 6 视觉用例全绿，Tooltip 浮层浏览器人工核验。

- 8014c02: 表单控件对齐 Semi 填充式样式（逐条按 Semi variables 值对齐）：

  - **Input**：默认背景 bg-0→fill-0、边框 color-border→transparent、聚焦边框 primary→focus-border、新增 hover 背景 fill-1、聚焦回 fill-0、disabled 用 disabled-fill。Semi 表单控件是填充式（灰底无边框，聚焦才显蓝边），本次对齐。
  - **Select**：同 Input 填充式对齐（bg fill-0、border transparent、focus focus-border、hover fill-1）。
  - **Cascader / TreeSelect**：复用 Select token（已对齐），补触发器 hover/focus/展开态填充式 CSS。
  - **TagInput**：复用 Input token（已对齐），补填充式 CSS；顺带修复背景引用了不存在的 `--cd-input-bg`（应为 `--cd-input-color-bg`）的 bug。
  - **Upload**：拖拽区背景 fill-0→tertiary-light-default、hover 背景 primary-light-default、文件卡片 hover fill-0→fill-1，对齐 Semi upload。

  均为按 Semi 源码 variables 逐条对齐值（不同则改、相同不动），无写死。Input 视觉基线已重生；971 单元 + 6 视觉全绿、perf 通过；Select 填充式浏览器实测（bg rgba(46,50,56,.05) / border transparent）。

- ce740ec: 逐组件样式对齐 Semi（数据录入·面板/表单）：

  - **DatePicker**：日期格圆角 medium(6)→small(3)、新增 footer 背景 fill-0（对齐 Semi 确认 footer）、新增快捷操作按钮色 token(primary)。触发器复用 Input 填充式 token（已对齐）。
  - **Form**：可选标记/extra 文字色 text-2→tertiary，对齐 Semi form label optional/extra。
  - **TimePicker**：复用 DatePicker token（面板/输入圆角已对齐）。
  - **AutoComplete**：复用 Select 选项 token（已对齐）。
  - **Transfer**：核对圆角 medium、条目 hover fill-0、文字层级 text-0/1/2 已对齐，无需改。

  均按 Semi 源码 variables 逐条对齐值（不同则改、相同不动），无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，DatePicker 面板浏览器实测（日期格 radius 3px / footer fill-0 / 填充式触发器）。

- 784b315: 逐组件样式对齐 Semi（反馈类）：

  - **Skeleton**：圆角 medium(6)→small(3)、段落骨架高度 14→16。
  - **Empty**：描述文字 text-2→text-1、新增标题字重 token（bold）。
  - **Popconfirm**：正文文字 text-1→text-2、内边距 base(16)→loose(24)、警示图标 primary→warning、最大宽度 280→400、标题字重 token 化(bold)。
  - **Banner**：圆角 medium(6)→small(3)、水平内边距 base(16)→base-tight(12)；四语义色背景改用正式 `*-light-default` alias——info 由 primary-light-default 改 info-light-default、success/danger 由 color-mix 改对应 alias。
  - **Spin**：核对已对齐（primary 色、14/20/32 尺寸、track fill-1），无需改。

  均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿，Banner 四语义色浏览器实测（info #eaf5ff / success #ecf7ec / danger #fef2ed）。

- e6f2022: Menu/Nav 配色方案对齐 Semi Navigation：

  - **Nav 容器默认透明**（`--cd-nav-bg: transparent`、`--cd-nav-color: inherit`），跟随 Layout.Header/Sider 容器背景，消除「Nav 自带背景块与 Header 撞色不协调」。
  - **水平导航选中态对齐 Semi**：选中项无背景块、仅底部 2px 下划线指示；默认项文字 `text-2`、hover 文字 `text-1`（背景透明）、选中文字 `text-0`。去掉原先沿用垂直菜单的「左竖条 + 背景块」导致的方格感。
  - **垂直导航选中态对齐 Semi**：选中背景改为浅蓝 `primary-light-default`（原为灰 `fill-0`）+ 蓝色指示条 + 蓝图标。
  - **补全缺失的 alias token `--cd-color-primary-light-default`**（light `#eaf5ff`、dark `rgba(84,169,255,0.2)`）。此前 Menu/Table/Tree/Calendar/Banner 均引用该 token 但它从未定义，导致选中浅蓝背景失效（解析为 transparent）；现一并修复。

- 6437ae5: 逐组件样式对齐 Semi（展示/交互）：

  - **Rating**：星色 warning(橙)→**yellow-5(金黄 #fac800)**——镜像 Semi 两层结构：palette 补 `yellow-5`（对应 `--semi-yellow-5`）+ alias 补 `color-rating-icon-default`（对应 Semi `$color-rating-icon-default`），亮 #fac800/暗 #fdde43；未填色 fill-1→fill-0。
  - **Tree**：选中态文字 primary→text-0（bg primary-light-default 区分，同 Menu 逻辑）。
  - **Calendar**：今日标识 primary-light-default+primary → primary 实底+bg-1 浅字（对齐 Semi $color-calendar-bg-active/text-active）。
  - **Image**：圆角 medium(6)→small(3)（Semi $radius-image）。
  - **Carousel**：指示器/箭头半透明度对齐 Semi（light 指示器 .5→.4、dark 箭头 .4→.5）。
  - **List**：核对边框/文字层级已对齐，无需改。

  均按 Semi 源码逐条对齐值（不同则改、相同不动）。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，Rating 金黄星色浏览器实测（#fac800）。

- f09285d: 逐组件样式对齐 Semi（展示/排版）：

  - **Typography**：mark 高亮背景 warning(橙)→primary-light-default(浅蓝，对齐 Semi mark-bg）；新增 quaternary 文字色(text-3)、code 文字色(text-2) token。
  - **Space**：medium 间距 base-tight(12)→base(16)、loose base(16)→loose(24)，对齐 Semi space-medium/loose。
  - **Descriptions**：新增双行显示 value 字重 bold token（对齐 Semi descriptions value fontWeight）。
  - **ScrollList / Divider / OverflowList**：核对已对齐（或纯布局无样式 token），无需改。

  均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。

- 6ce9a71: 逐组件样式对齐 Semi（导航/工具）：

  - **Tabs**：线条式页签默认文字 text-1→text-2、选中文字 primary→text-0（深字，标示线保持 primary），对齐 Semi 线条式配色。
  - **Highlight**：镜像 Semi highlight/highlight-bg——背景 warning(橙)→黄底（亮 yellow-4/暗 yellow-2）、文字 text-0→黑(亮)/白(暗)、字重 token 化(bold)；alias 补 color-highlight/color-highlight-bg。顺带修旧 token 名 --cd-radius-small → --cd-border-radius-small。
  - **Backtop**：无样式 variables，无需改。

  均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。

- b1f5f30: 逐组件样式对齐 Semi（导航类）：

  - **Breadcrumb**：分割符 text-3→text-2、当前项字重 token 化(bold)。
  - **Pagination**：选中态由「蓝实底白字」改为「浅蓝底(primary-light-default)蓝字」、页码去边框，对齐 Semi。
  - **Steps**：未到达图标背景 fill-1→text-2（配白字）、未完成连接线 border→fill-2。
  - **Anchor**：选中链接文字 primary→text-0（滑轨 ink 仍 primary），对齐 Semi。
  - **Timeline**：连线颜色 border→text-3。

  均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，Pagination 选中态浏览器实测（bg #eaf5ff 蓝字 #0064fa）。

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。
