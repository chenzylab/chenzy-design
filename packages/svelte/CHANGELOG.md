# @chenzy-design/svelte

## 0.3.1

### Patch Changes

- Updated dependencies [db168b0]
  - @chenzy-design/core@0.3.1
  - @chenzy-design/locale@0.3.1
  - @chenzy-design/tokens@0.3.1

## 0.3.0

### Minor Changes

- 24dc533: 补全表单/展示组件的 API props（对齐 Semi，基于最新 main 重做 batch9）：

  - **Checkbox**：`addonId` / `extraId` / `preventScroll`
  - **Radio**：`addonId` / `addonClassName` / `addonStyle` / `autoFocus` / `extraId` / `mode`('advanced') / `style` / `onMouseEnter` / `onMouseLeave` / `ariaLabel` / `preventScroll`
  - **Rating**：`style` / `onBlur` / `onFocus` / `onKeyDown` / `preventScroll`
  - **Slider**：`showBoundary` / `showArrow` / `showMarkLabel` / `tooltipOnMark` / `handleDot`(自定义手柄圆点) / `onMouseUp` / `ariaValuetext`
  - **ColorPicker**：`topSlot` / `bottomSlot` / `style` / `height` / `width` / `usePopover`(等价 !inline)

  均为新增可选 props，向后兼容；各组件 meta.ts 已补 props 表。971 单元 + 6 视觉全绿，无回归。

- 46a4e9d: Button / ButtonGroup / SplitButtonGroup API 对齐 Semi：

  新增（透传能力）：

  - Button：`class`、`style`、`contentClassName`、`noHorizontalPadding`（`boolean|'left'|'right'|('left'|'right')[]`，仅 icon 时去单/双侧水平内距），以及 `onmousedown`/`onmouseenter`/`onmouseleave` 事件。
  - ButtonGroup：`colorful`（经 context 透传给组内 Button）、`class`、`style`。
  - SplitButtonGroup：`class`、`style`、`ariaLabel`。

  破坏性变更：

  - **移除 Button 的 `href`**。链接式跳转统一改用 `Typography.Link`（对齐 Semi，Semi Button 亦无 href）。原 `<Button href>` 渲染的 `<a role=button>` 分支一并移除。迁移：`<Button href="...">x</Button>` → `<Typography.Link href="...">x</Typography.Link>`。

- 8d2d292: 新增 ButtonGroup / SplitButtonGroup 组件，并为 Button 增加 `colorful` prop（AI 多彩按钮）。ButtonGroup 横向拼接多个 Button 并经 context 透传组级 type/theme/size/disabled 默认（不破坏 Button 现有 API，单按钮显式 prop 仍优先）；SplitButtonGroup 左侧主操作 + 右侧箭头按钮触发下拉（复用 Dropdown 的 items API）；colorful 在 solid/light 主题下用品牌渐变背景营造 AI 风格。
- 91d3443: Button：纯图标按钮（仅传 `icon`、无文字内容）自动收成正方形（宽=高、去水平内距），对所有 type/theme/size 生效，无需手动调样式。

  colorful 语义收紧：所有 theme 均支持，`type` 仅 `primary`/`tertiary` 有意义，其余 type 在 colorful 下自动回退为 `primary`。spec §4 补全 `colorful` / `ariaLabel` 并说明纯图标规则。

- 49205ea: Layout 家族 API 对齐 Semi：

  - Layout / Header / Content / Footer / Sider 全部新增 `style`（透传内联样式，叠加在派生样式之后可覆盖）、`ariaLabel`、`role`（可访问性透传，对齐 Semi ≥2.3.0）。
  - Sider 新增 `onBreakpoint(matched, breakpoint)` 回调（headless createSider 早已支持，此前未在组件层暴露），命中响应式断点时触发。

- 6da6ee2: 新增 Nav（Navigation）组件，对齐 Semi Navigation：

  - 独立公开组件 `Nav` + `Nav.Header` + `Nav.Footer`，字段对齐 Semi（itemKey/text/icon/items）。
  - 支持 vertical/horizontal 模式、子导航、logo 头部、底部 collapseButton（仅 vertical），以及 selectedKeys/openKeys/isCollapsed 的受控与非受控 + onSelect/onOpenChange/onCollapseChange 回调。
  - 实现策略：对外是独立组件，内部委托本库 Menu（purpose=navigation）渲染导航体，复用其选中/展开/折叠/键盘/a11y 逻辑，仅新增 Header/Footer 容器与折叠联动。
  - 折叠按钮 aria-label 复用 locale 包 Sider.expand/collapse。
  - MVP 范围；limitIndent / toggleIconPosition / subNavMotion / renderWrapper / Nav.Item 声明式写法等留待后续。

- afddd7d: 补齐 Nav 剩余 TODO，对齐 Semi Navigation 交互能力：

  - **Menu** 新增：项级 `onClick`/`onMouseEnter`/`onMouseLeave`（MenuItemNode）、`expandIcon`（自定义展开箭头 Snippet）、`motion`（子菜单展开动画开关，默认 true）。
  - **Nav** 新增并透传：`onClick`（点任意项，载荷 NavKey）、`expandIcon`、`subNavMotion`；NavItemDef 加 `onClick`/`onMouseEnter`/`onMouseLeave` 映射到 Menu 项级回调。
  - **Nav.Item** 声明式新增 `onClick`/`onMouseEnter`/`onMouseLeave`。
  - 同步 meta/spec，补测试（onClick/项级 onClick/subNavMotion 类）。

  刻意舍弃（最边角、Menu 不支持 per-Sub 浮层配置）：Nav.Sub 的 `dropdownProps`/`dropdownStyle`/`maxHeight`、Nav.Item 的 `indent`/`level`——用 Nav 级 `getPopupContainer`/`subNavOpen|CloseDelay` 与 `limitIndent`/`inlineIndent` 替代。

- 5f1e0ef: 补齐 Nav 的 MVP TODO + a11y 测试：

  - **Menu** 新增 `limitIndent`（默认 true，仅一级缩进；false 逐级缩进）与 `toggleIconPosition`（'left'|'right'，inline 子菜单箭头位置）。
  - **Nav** 透传 Menu 已有能力：`inlineIndent` / `limitIndent` / `toggleIconPosition` / `subNavOpenDelay` / `subNavCloseDelay` / `getPopupContainer` / `renderWrapper`。
  - **Nav.Item / Nav.Sub** 声明式写法：JSX 式 `<Nav.Item>` / `<Nav.Sub>` 子组件声明导航树（与 items 二选一）。子项经 context 注册进普通数组、挂载后异步 bump 单个 $state revision 触发一次重建——规避 Svelte 5 声明式收集的 effect 自循环。
  - 新增 `Nav.a11y.test.ts`（axe 0 violations：vertical/horizontal/折叠/带链接/header）+ 声明式收集渲染测试。
  - 同步 meta / spec。仅 `subNavMotion` 仍留 TODO（Menu 无 motion 开关，动画走 CSS + prefers-reduced-motion）。

### Patch Changes

- 725c430: 补全 Button 组件元数据（components.json）：Button props 补回缺失的 `htmlType`、`icon`，并新增 `subComponents` 描述 ButtonGroup 与 SplitButtonGroup 的 props，使 AI/docs 消费方能拿到三个组件的完整 API。
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

- f29eff5: Button colorful 配色微调：去掉粉色，改为蓝→紫双色渐变（更贴近 Semi AI 风格冷色调）；补全各 theme 的 hover 态——solid hover 渐变加深 + 阴影抬升，light/borderless/outline hover 浅色底加深。
- cedf032: Button `colorful` 改为蓝→紫→粉三段多彩渐变（对齐 Semi AI 风格），并补全 outline/borderless 主题下的 colorful 样式（此前仅 solid/light 生效）。
- 01cbb44: 修复 Button `loading` 态：此前只禁用点击并设 `aria-busy`，**未渲染任何加载指示器**（按钮看起来和普通态一样）。现在 loading 时在文字前显示一个旋转的加载图标（优先于用户传入的 icon），`prefers-reduced-motion` 下不旋转。
- 71d0e4b: 修复 Button 的 `theme` 渲染：`solid` / `light` / `borderless` 三个 theme 此前无样式，全部退回 `type` 的实心填充（看起来和 solid 一样），只有 `outline` 不同。重构为「`type` 提供色相、`theme` 决定填充方式」的正交矩阵（对齐 Semi）：solid=实心色+反色字、light=浅色调底+色字、borderless=透明+色字、outline=透明+色边框+色字，并补各 theme 的 hover/active 态。
- 6bf534c: Typography.Link 的 underline 变体改为对齐 Semi：平时无下划线，hover 时才出现（仅作用于 link，非链接的 underline 文本仍常显下划线）。
- 9101129: 修复 Menu/Nav 折叠（inlineCollapsed）态样式：折叠项被 Tooltip 包裹，其触发器默认 inline-block 会收缩到图标宽度（16px），导致选中背景与点击区只剩一小块、图标左偏不居中；且折叠 Menu 固定 48px 宽未撑满更宽的 Sider/Nav 折叠轨。修复后折叠项撑满整条图标轨、图标居中、选中背景填满，点击热区也覆盖整轨。
- e6f2022: Menu/Nav 配色方案对齐 Semi Navigation：

  - **Nav 容器默认透明**（`--cd-nav-bg: transparent`、`--cd-nav-color: inherit`），跟随 Layout.Header/Sider 容器背景，消除「Nav 自带背景块与 Header 撞色不协调」。
  - **水平导航选中态对齐 Semi**：选中项无背景块、仅底部 2px 下划线指示；默认项文字 `text-2`、hover 文字 `text-1`（背景透明）、选中文字 `text-0`。去掉原先沿用垂直菜单的「左竖条 + 背景块」导致的方格感。
  - **垂直导航选中态对齐 Semi**：选中背景改为浅蓝 `primary-light-default`（原为灰 `fill-0`）+ 蓝色指示条 + 蓝图标。
  - **补全缺失的 alias token `--cd-color-primary-light-default`**（light `#eaf5ff`、dark `rgba(84,169,255,0.2)`）。此前 Menu/Table/Tree/Calendar/Banner 均引用该 token 但它从未定义，导致选中浅蓝背景失效（解析为 transparent）；现一并修复。

- 6d217b9: 修复水平导航（顶部 Nav）选中下划线错位：下划线原贴在 item 底部（`inset-block-end:0`），而菜单底部还有 1px 边框，导致蓝色下划线浮在灰边框上方 1px、看着断开错位。改为 `inset-block-end:-1px` 压在底边框上对齐成一条线，并左右内缩到 item 内边距、加圆角端点，使下划线对齐文字内容区，更精致干净。
- 7df3b3d: 修复 Dropdown 浮层定位与 SplitButtonGroup 下拉为空两处缺陷：

  - Dropdown 进场动画的 keyframe 设置了 `transform: translateY(...)`，会覆盖 `use:floating` 写入 inline style 的定位 `translate(x,y)`（CSS animation 优先级高于 inline style），导致 click 触发的浮层飘到容器左上角。动画改为仅淡入 opacity，位移交由 floating 独占。
  - SplitButtonGroup 在 Dropdown 标签体内放置 `{#if menu}` 内容，即便 menu 未传也会被 Svelte 收集成 children snippet 覆盖 items 渲染分支，使下拉菜单为空。改为按 menu 是否存在分叉传递。

- e8d4ef0: 修复 Sider 受控折叠 toggle 卡死：受控模式（collapsed + onCollapse）下，headless createSider 在构造时捕获了初始 collapsed 值，其 current() 始终返回陈旧值，导致默认/自定义触发器反复点击只会折叠、无法再展开。改为在 Sider 层用 live 的 collapsedState 计算翻转目标（受控走 setCollapsed、非受控仍走 headless toggle）。补受控 toggle 往返回归测试。
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

- 064382b: 颜色语义层 1:1 对齐 Semi design tokens（以本地 Semi 源码 semi-theme-default/scss/global.scss 为准），light + dark 两套：

  - **状态色补全四档 + 浅版三态**：primary/secondary/tertiary/success/warning/danger/info 各补 `hover`/`active`/`disabled` 与浅版 `light-default`/`light-hover`/`light-active`。
  - **secondary 改为 light-blue 青蓝**（对齐 Semi，原为中性灰；该 alias 无组件依赖灰色行为）；tertiary 改为 grey-5 三态。
  - **新增 disabled-text/border/bg/fill、shadow、nav-bg、overlay-bg、bg-4、bg-inverse、focus-border、link-hover/active/visited**。
  - **修复 dangling token**：`danger-light-default`/`warning-light-default`/`link-hover`/`bg-inverse` 此前被组件引用但从未定义（同 #356 的 primary-light-default 问题，解析为 transparent），现补齐。
  - Popover OK 按钮 hover 从未定义的 `--cd-color-primary-6` 改用 `--cd-color-primary-hover`。

  未纳入（无组件消费、避免膨胀）：data-_（vchart 数据色板）、ai-_、highlight、default-\*。全量 971 测试 + contrast-check + typecheck 通过，Banner/Layout/Table 实测无回归。

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

- Updated dependencies [0a3d18d]
- Updated dependencies [5558646]
- Updated dependencies [1076cac]
- Updated dependencies [8014c02]
- Updated dependencies [ce740ec]
- Updated dependencies [414acdb]
- Updated dependencies [784b315]
- Updated dependencies [e6f2022]
- Updated dependencies [6437ae5]
- Updated dependencies [f09285d]
- Updated dependencies [6ce9a71]
- Updated dependencies [b1f5f30]
- Updated dependencies [6d3a6e6]
- Updated dependencies [064382b]
- Updated dependencies [9780bf7]
- Updated dependencies [2560973]
- Updated dependencies [79aff09]
  - @chenzy-design/tokens@0.3.0

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。
- 66c1fa1: 发布包不再包含测试与夹具产物：svelte-package 会把 src 下的 `*.test.*` / `*Fixture.svelte` / `test-utils/` / `*.bench.*` 一并编译进 dist（0.2.0 误含 529 个此类文件）。新增 `clean-dist.mjs` 在打包后清理，显著减小包体积。
- 66c1fa1: 修复 Badge 组件 dev 模式下 mount 时的 TDZ 运行时错误（`prevDisplayCount` 在 `displayCount` 声明前用 `$state(displayCount)` 预读，触发 `Cannot access 'displayCount' before initialization`）。改为 `undefined` 起始，由首个 effect seed。视觉回归测试发现。
- Updated dependencies [56a53aa]
  - @chenzy-design/core@0.2.1
  - @chenzy-design/locale@0.2.1
  - @chenzy-design/tokens@0.2.1

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。

### Patch Changes

- f1f8c54: 修复 npm 安装后消费方 dev 模式因 `.svelte.ts` 内 TS 语法报 `js_parse_error`：`exports` 与 `svelte` 字段从指向未编译的 `src/index.ts` 改为指向已编译（类型已剥离）的 `dist/index.js`，并从发布文件中移除 `src`（包体积 6.2MB → ~0.9MB）。
- Updated dependencies [cacdfdc]
  - @chenzy-design/core@0.2.0
  - @chenzy-design/locale@0.2.0
  - @chenzy-design/tokens@0.2.0
