# Semi 文档整页对齐 — 进度清单（TODO）

> 配合 `semi-doc-alignment-sop.md` 使用。**做完一个就在此勾选并写一行要点**，新会话读此文件即知进度，免重新排查。
> 判真基准：以 md frontmatter 是否有 `docMode: inline` 为准（`grep -l "docMode: inline" packages/docs/src/content/components/*.md`），别只信本文件——本文件可能滞后。
> 铁律见 SOP：demo 严格复刻 Semi（不简化、布局用本库 `<Space>`）、正文逐字抄 Semi 别顺手规整、API 表 `{}` 用反引号、**每个交互 demo 真机点击验证**（点了没反应先排 scrollY+dpr 坐标偏移，非组件 bug）。

## ✅ 已完成（22，判真：`grep -l "docMode: inline"` = 22）

- [x] form（标杆）
- [x] input（含 TextArea/InputGroup）
- [x] button
- [x] typography
- [x] anchor
- [x] highlight
- [x] checkbox
- [x] radio
- [x] switch
- [x] divider
- [x] space
- [x] grid
- [x] floatbutton
- [x] jsonviewer
- [x] tag — TagGroup/SplitTagGroup 合一页；demo 布局改用 `<Space>`；SplitTagGroup 4 组合并回单 demo（删 13）；close/onTagClose/showPopover 真机验证过
- [x] tooltip — 9 demo 整页 inline 对齐 Semi（注意事项 children 类型/位置 12 方位/指向元素中心/触发时机 5 类/condition/覆盖样式/getPopupContainer/搭配 Popconfirm/仅超出展示）。React→Svelte 映射：forwardRef children→本库以包裹 span 承载事件故任意渲染真实 DOM 的组件皆可（新增 `_child-component.svelte`）；触发时机 demo 复刻 Semi getPopupContainer 局部容器 + custom trigger RadioGroup 受控。API 表逐 prop 核 Tooltip.svelte（补 afterClose/class/closeOnEsc/preventScroll/wrapperClassName/prefixCls 本库措辞，spacing/margin/content Snippet 用反引号包 `{}`）。**设计变量章节由页面自动补渲染 DesignTokenTable，md 里不写 `<DesignToken/>`**（否则 SSR 无该组件）。补齐 TypographyBase popover 分支透传 class/style/maxWidth（原只 Tooltip 分支有）。真机验证：hover（DOM/自定义组件均弹「semi design」箭头指向）✓、click（「hi bytedance」弹出）✓、custom 受控显示✓、condition 开弹/关不弹✓、页面渲染 + TOC 收集 + 无 SSR 500 ✓。三包 typecheck 全绿、floating/Tooltip/Popover/Popconfirm/Select 测试 40 passed。**修复浮层整体偏低贴触发器真 bug**见 [[floating-position-uses-animation-scaled-rect-too-close]]：use-floating 首次定位用了 enter zoom 动画 scale<1 时的 getBoundingClientRect 缩小高度(28.8 而非 36)且不重算致浮层下移贴住触发器(间距 0.5px 非 8px)；改用 offsetWidth/Height 布局尺寸传 core popupRect→精确 8px 对齐 Semi（影响所有共用 use-floating 的浮层组件）。⚠️ 多 dev 同跑一 repo 互刷（杀掉遗留 5200 只留自起 dev）；首次编译瞬态 500 重试即 200；后台标签 CSS 动画冻结致 JS 读 rect 全乱，判真值用 screenshot 激活前台 + use-floating 加 console.log。
- [x] popover — 9 demo 整页 inline 严格复刻 Semi（注意事项 children 类型/基本使用/12方位/受控 custom/condition/showArrow/arrowPointAtCenter/setColor(arrowStyle+style)/initialFocus）。demo 用 Empty+IllustrationSuccess 复刻 Semi content 卡片（复用 empty imageSlot/darkModeImageSlot）；setColor 用本库 `--cd-color-blue-4` palette token 复刻 Semi `rgba(var(--semi-blue-4),1)`。**补齐三处跨浮层组件（Tooltip/Popover/Popconfirm 全受益）能力**：①**onEscKeyDown**：dismiss.ts onDismiss 回调补 event 第二参；Tooltip 加 onEscKeyDown prop，Esc 监听门控改 `closeOnEsc || !!onEscKeyDown`（回调独立于关闭），Popover/Popconfirm 透传 + meta 补录。②**ArrowUp/Down 键盘移焦**（对齐 Semi `_handleTriggerArrowUp/DownKeydown`）：`onTriggerKeydown` 删 `if(!isDialog)return` guard，ArrowDown→浮层首个可交互元素、ArrowUp→末个，对所有 trigger 生效（hover/focus 的 tooltip 同样支持）；触发器 span onkeydown 由 `isDialog?…:undefined` 改为始终绑定。Enter/Space 打开仍仅 dialog。③**initialFocusRef 内层查找**：绑定节点自身不可聚焦（如包裹 Input 的 span）时聚焦其内部首个可聚焦元素（对齐 Semi ref 绑组件时聚焦真实 input），Popover/Popconfirm 同步。⚠️ **测试踩坑**：ArrowDown 键盘移焦测试用 `userEvent.keyboard('{ArrowDown}')` 会触发浏览器默认滚动把焦点弹出测试 iframe→改 `trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles,cancelable}))` 直达触发器冒泡至 span onkeydown，断言 `defaultPrevented===true`（handler 命中 preventDefault）+ 同步读 `document.activeElement`（勿 expect.poll，默认滚动会在 poll 期间再弹焦点）。真机验证：注意事项三 children hover 弹 Empty 卡片✓、受控 RadioGroup 切换✓、showArrow 双 path 小三角✓、initialFocus 焦点落 input（span 内层查找生效，activeElement=INPUT[placeholder=focus here]）✓、搭配链接锚点 `#搭配-popover-或-popconfirm-使用` 跳转到位（scroll-padding-top 让开顶栏）✓、TOC 13 项全收✓、无 SSR 500。三包 typecheck 全绿（Tooltip.svelte noUncheckedIndexedAccess 需 `const target=…;if(target)` 不能 `list[i].focus()`）、tooltip/popover/popconfirm/dismiss/floating 42 测试通过（新增 2 kbd）、lint 0 warning、体积 popover 3.01<3.3/tooltip 4.69<5/popconfirm 2.97<3.2。
- [x] timeline — 8 demo 严格对齐 Semi（basic/type/custom/left/center/alternate/right/datasource）；onClick(2.2.0) demo 保留为「可点击节点」章节、aria-label demo 放进 Accessibility 章节；源码/meta 原本已对齐 Semi 无需改；真机验证 onClick 联动 + aria-label DOM 挂载 + 10 实例全渲染
- [x] popconfirm — 4 Semi demo(基本/类型搭配/延时关闭/初始化焦点)+2 本库补充(关闭按钮/箭头)；封装链改述 Popover(非 Semi 的 Tooltip)；⚠️ **API 表 union 类型踩坑**：`Snippet<[{ initialFocusRef }]>` 的裸 `{}` 让 mdsvex 当 Svelte 表达式→SSR 500(typecheck 假绿真机才暴露)；修法=整型包反引号(反引号内 `{}<>` 全字面)，union 的 `|` 不能进反引号(会当列分隔)→拆成 `A`\|`B` 两段；真机验证 保存→确定→Toast 成功链
- [x] toast（见优先批 A 详注）
- [x] notification（见优先批 A 详注）
- [x] table（PR #604 + #605 已合并 2026-07-22）— 全库最大页：34 demo 整页 inline 严格复刻 Semi（含 _data.ts 共享数据）+ API 全表(Table/Column/rowSelection/Expandable/scroll/pagination)。**补全大量 Semi 缺失 API**：showSortTip(+Tooltip)、sortIcon/filterIcon、renderFilterDropdown(+RenderFilterDropdownProps)、renderFilterDropdownItem、filterDropdownProps.showTick(+FilterDropdownHost)、onHeaderCell、defaultFilteredValue、filterChildrenRecord/sortChildrenRecord、colSpan、resize、ellipsis.showTitle、title 支持 Snippet(含 filter/sorter/selection 物料透传)、sorter 第三参 sortOrder、fixed:true 归一化；rowSelection.checkRelation/clickRow/hidden/disabled/renderCell；表级 resizable(+onResize 事件)/expandAllRows/emptySnippet/onRow 拖拽事件(RowAttrs)；pagination.currentPage/total/position/formatPageText/onPageChange(受控不本地分页)；filterConfirmMode='confirm'。**视觉逐 demo 真机 getComputedStyle 逐值对齐**：①表头 39→38px(新增 .cd-table-operate-wrapper flex 消 inline descender)②行选择框原生 input→Checkbox/Radio 组件(16×20，选择列 52→48px；Checkbox/Radio 补 tabindex prop 供 grid roving)③表头固定列 z-index 102→101、固定列阴影按横滚 scroll-position-left/right 显隐④完全自定义渲染表头 38→41px(title 物料透传摆放 selection 全选框)。⚠️ **字体差异按分层改**见 [[align-semi-fix-at-correct-layer]]：全站不清爽→docs 层(app.css/layout 改 Inter 栈+antialiased)；Input `font: inherit` 继承表头 weight 600 变粗→组件层(Input.svelte 改 font-family/size/line-height:inherit 不含 weight，走 UA 默认 400，实测在 Semi th 插裸 input 得 Inter/400 印证)。42 Table 测试+26 Input 测试通过、体积门禁 20.99KB<21KB。踩坑：md 表格裸 `{}`/泛型 `<>` 断 SSR 见 [[inline-md-table-braces-angles-break-ssr]]；demo `$effect(()=>loadMore())` 追踪函数内响应式读取致 effect_update_depth 循环，加 inited guard；真机验证坐标漂移见 [[real-click-coord-drift-use-ref-not-coords]]。
  **PR #605 深化（2026-07-22）**：①**拖拽排序**自建复刻 dnd-kit 思路的 `sortable` primitive(core 纯几何 arrayMove/computeTargetIndex/computeItemTransforms + createSortable 控制器 + svelte use:sortable action)——拖拽只叠 CSS transform 不碰 DOM、松手 arrayMove 更新一次 data，避开 svelte-dnd-action 抢 tbody DOM 致丢行 见 [[svelte-dnd-action-conflicts-with-wrapped-table-render]]②**组合式 `<Column>`** 对齐 Semi Table.Column 双写法(context 多级收集器树 + version 冒泡根 Table $state，rest props 收全字段，与配置式 columns 并存) 见 [[table-composable-column-context-collection]]；03-jsx-render 改组合式、新增 17b 嵌套表头合并 demo③**分组默认折叠**对齐 Semi(仅 defaultExpandAllGroupRows===true 才展开，缺省折叠) 见 [[table-tree-needs-explicit-tree-and-row-key]]④**受控动态表格**补全 4→14 开关+分页控件位置(固定表头/隐藏表头/标题/底部/固定列/选择/加载/无数据/排序/过滤/行展开/展开所有/边框/伸缩)⑤**固定表头**真 bug 修复(sticky 被 th position:relative 因特异性覆盖，改 .cd-table-thead.cd-table-thead-sticky>… 提特异性)⑥固定列列宽用 scroll.x='150%'+仅首列 width、表头合并无 scroll.x 补 inline-size:100% 防右侧留白。**dark 系统性修复**：⑦分组/斑马纹背景白底白字=token 用固定原始 grey-0(不反转)，改语义 alias tertiary-light-default(dark 正确变深) 见 [[dark-mode-grey-0-fixed-vs-semi-reversed]]⑧docs 正文 dark 不切换=presetTypography --un-prose-* 硬编码，重绑 --cd-color-* token；docs dark 以 [data-theme]+token 为准非 unocss dark: 见 [[docs-dark-theme-is-data-theme-not-unocss-dark]]⑨TOC 锚点被 60px 顶栏遮挡→html scroll-padding-top:80px。CI 全绿 --admin 合并

---

## ⏳ 待办（49）

### 优先批 A：源码近期已破坏性对齐 Semi（文档对齐风险小，优先做）
> 依据 MEMORY.md 记忆，这些组件源码已对齐 Semi，文档 demo 能力大概率齐备。
> toast / notification / table / popover 已完成，移至上方「已完成」区。

- [ ] sidesheet — 无 focus-trap 非 Modal 同构（已删 Drawer）见 [sidesheet-no-focustrap]
- [ ] userguide — 已对齐（复用 Popover/Modal）见 [userguide-semi-aligned]
- [ ] modal — SideSheet 相关已处理，核对 Modal 本体

### 优先批 B：基础/展示类（相对独立，无复杂交互）
- [ ] icon — ⚠️ 全库唯一裸渲染 demo 绕过 DemoBox not-prose，见 [icon-raw-demo-bypasses]
- [ ] iconbutton
- [ ] badge
- [ ] avatar — token 短名断链风险 见 [avatar-token-short-name]
- [ ] card
- [ ] descriptions
- [ ] empty
- [ ] image — 懒加载 src 声明式 见 [svelte-lazyload-src]；SkeletonImage 消费 见 [skeleton-atoms]
- [ ] skeleton — 原子 prop 被 Image 消费 见 [skeleton-atoms]
- [ ] spin
- [ ] progress
- [ ] rating
- [ ] banner
- [ ] collapse
- [ ] carousel
- [ ] list
- [ ] overflowlist
- [ ] scrolllist — cycled 对齐 Semi 份数+环绕平移 见 [scrolllist-cycled]
- [ ] virtuallist

### 优先批 C：导航类
- [ ] breadcrumb
- [ ] dropdown
- [ ] steps — 数组 API vs 组合式子组件 见 [array-api-vs-composable]
- [ ] tabs — 改名 value→activeKey 已完成，核对消费方 见 [tabs-rename-consumer]
- [ ] pagination
- [ ] nav
- [ ] backtop

### 优先批 D：输入类（交互复杂，验证成本高，放后面）
- [ ] pincode — demos 目录曾缺失，注意补齐
- [ ] inputnumber
- [ ] slider
- [ ] rating（已在 B）
- [ ] select — 补 style/class 缺口 见 SOP
- [ ] autocomplete
- [ ] cascader
- [ ] taginput — 连字符 token 归属整名 见 [hyphenated-component-token]
- [ ] treeselect
- [ ] transfer
- [ ] tree
- [ ] upload — 标杆 DoD 组件
- [ ] datepicker — 已对齐 Semi，核对 demo（RangeValue/status/showSecond 类型坑）见 [push-needs-recursive-typecheck]
- [ ] timepicker
- [ ] colorpicker
- [ ] calendar — core 定位丢自定义字段/月视图两层 见 [calendar-core-positioning] [calendar-month-view]

### 优先批 E：Provider / 工具类（可能无 demo 或结构特殊，最后处理）
- [ ] layout — Svelte5 Set/Map mutation 非响应式 见 [svelte5-plain-set-map]
- [ ] configprovider
- [ ] localeprovider — 文档站顶层套 LocaleProvider 见 [docs-page-align-semi]
- [ ] resizeobserver
- [ ] hotkeys — 修饰键名必须大写 见 [hotkeys-modifier-keys-capitalized]
- [ ] lottie — 无静态方法改具名导出 见 [svelte-no-static-method]

---

## 收尾（全部 71 完成后，独立一次做，勿中途碰）
见 SOP「关于 docMode（收尾清理）」：反转 +page.svelte 默认走 inline、删 meta 驱动双 tab 分支、逐个 md 删 docMode 行、评估旧 demos.ts/meta API 渲染去留、根级 typecheck + 全页抽验。

## 英文 md
每个中文 md 完成后，`<name>.en.md` 英文整份**后补**（SOP：先全量中文，英文最后统一做）。当前均未做。
