# Semi 文档整页对齐 — 进度清单（TODO）

> 配合 `semi-doc-alignment-sop.md` 使用。**做完一个就在此勾选并写一行要点**，新会话读此文件即知进度，免重新排查。
> 判真基准：以 md frontmatter 是否有 `docMode: inline` 为准（`grep -l "docMode: inline" packages/docs/src/content/components/*.md`），别只信本文件——本文件可能滞后。
> 铁律见 SOP：demo 严格复刻 Semi（不简化、布局用本库 `<Space>`）、正文逐字抄 Semi 别顺手规整、API 表 `{}` 用反引号、**每个交互 demo 真机点击验证**（点了没反应先排 scrollY+dpr 坐标偏移，非组件 bug）。

## ✅ 已完成（28 = 27 inline + 1 特殊处理：iconbutton 删页；判真：`grep -l "docMode: inline"` = 27）

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
- [x] sidesheet — 6 demo 整页 inline 严格复刻 Semi（基本/自定义位置/自定义尺寸/可操作外部区域(mask=false)/渲染在指定容器(popup)/自定义内容区域）+ API 全表 + Accessibility + FAQ。源码早已破坏性对齐 Semi（无 focus-trap 非 Modal 同构，已删 Drawer 见 [[sidesheet-no-focustrap-not-modal-isomorphic]]），文档层无需改组件。**06-content demo 复刻 Semi 完整表单**：Form.DatePicker(type=dateTime)+两组横向 RadioGroup+Banner(warning/无icon/bordered)+多选 Select+footer(重置/提交)——为此给 **FormDatePicker 补 type/style 透传、FormSelect 补 style 透传**（原缺，demo 传 type='dateTime'/style='width:272px' 会被吞）。**closeIcon={null} 语义对齐**：Semi `iconType = closeIcon || <IconClose/>`，故 `closeIcon={null}` **仍显示**默认 IconClose（按钮由 closable 控制，默认 true）——本库一致，勿误判为 bug。设计变量章节由页面自动补渲染 DesignTokenTable，md 里**不写** `<DesignToken/>`；正文/表格所有 `mask={false}`/`width={900}` 裸花括号全用反引号包。真机验证（**关键：必前台激活标签**，后台标签 CSS 动画冻结致离场 animationend 不 fire、面板 DOM 残留看似「关不掉」实为假象 见 [[real-click-coord-drift-use-ref-not-coords]]）：基本右滑+X 关闭✓、自定义位置 left 方向+遮罩关闭✓、自定义内容 Form/Banner/Select/footer 全渲染✓、渲染在指定容器 popup 局部渲染(wrapper cd-sidesheet-popup、遮罩只盖容器、width=220)✓、TOC 全收+无 SSR 500✓。svelte/docs typecheck 0 err、side-sheet+form 77 测试通过、体积 side-sheet 3.81<4.5/form 13.89<14。
- [x] userguide — 8 demo 整页 inline 严格复刻 Semi（基本用法/主题 primary/12 方位+showArrow/spotlightPadding(step 级覆盖 15)/定制按钮(nextButtonProps children、prev borderless、finishText「我知道啦！」)/受控 current+onChange/弹窗式 modal(封面+圆点指示器+Text strong 描述)/无遮罩）。React `document.querySelector` target→本库 `bind:this` 包裹 span + `target: () => el` 函数形式（正文「基本用法」补一句映射说明）。demo 布局手写 flex div 改 `<Space>`、Switch `checked` 改 `defaultChecked`（受控无回写点不动）、03-position 删自加居中包装严格复刻。**修复 spotlight 步进滞后一步真 bug**：原实现把整个测量放 rAF，标签被遮挡（CDP/后台）时 rAF 冻结→步进后 spotlight 停留上一步矩形；核对 Semi updateSpotlightRect 实为**同步取 rect 仅 setState 进 rAF**，改打开/步进同步 measure + scroll/resize 保留 rAF 去抖（组件注释同步更正）。真机逐 demo 验证：基本 3 步全链+完成关闭+body 滚动锁释放✓、primary 蓝底白字箭头同色✓、top/right/hideArrow✓、padding 10/15 逐值验证（spot=target±padding 精确）✓、Next/Prev/我知道啦！✓、受控回写步进✓、modal 三步封面切换+圆点高亮+跳过末步隐藏✓、无遮罩背景全亮✓。API 全表逐 prop 核 UserGuide.svelte（含本库 class/style、finishText 默认 i18n '完成'、spotlightPadding 默认 5、zIndex 1030）+Steps.Step 表+Accessibility+FAQ。⚠️ 真机验证「点了没反应/spot 不动」先查 `document.hidden`——CDP 会话标签常为 hidden，rAF 冻结是假象；用 osascript 激活标签再验。dom 8 测试通过、三包 typecheck 0 err、lint 0 warning、体积 4.68<5.5KB。
  **附带修复浮层 hover 闪烁真 bug**（Tooltip/Popover/Popconfirm 三件套全受益，与 sidesheet 无关，验证 popover 时用户报「下边缘一直闪」发现）见 [[overlay-hover-flicker-when-popup-covers-trigger]]：hover 浮层 flip 后仍覆盖触发器→鼠标进浮层=离触发器 span→pointerleave 关→复现闪；浮层 portal 到 body 却没绑 hover。对齐 Semi `portalEventSet={...triggerEventSet}` 给浮层 div 补 onpointerenter/leave 复用触发器 handler。tooltip 体积 4.69→4.73<5。
- [x] icon — 整页 inline 严格对齐 Semi（图标列表页首区块+基础使用/旋转/尺寸/颜色/双色图标/多色按钮/自定义图标+API 表+Accessibility 含 aria-label demo）。demo 逐字复刻 Semi（基础使用只 1 个 IconHome、尺寸每行 marginBottom 4、双/多色 marginRight 10、自定义图标复刻黄圆脸 CustomIcon svg→`{#snippet}` 传 `svg={snippet}`）；旧自创 demo 01-04 删除；Semi svgr 章节→本库措辞「使用 SVG 字符串作为图标源」（Vite `?raw`）；UnoCSS preset-icons 保留为「本库补充」章节（docs 站真实基建）。inline 模式下图标列表在 md 里裸嵌 `<div class="not-prose"><IconList/></div>`（记忆 icon-raw-demo-bypasses 的「遇到再修」时机）。**修复 17 个 AI 多彩图标（Level2/3+AILoading）缺 Icon 基座包装真 bug**：原为独立 svg 组件（gen-ai-icons.mjs 产物），`size/spin/rotate` 被 rest 到 svg 上静默无效、无 role=img/aria-label；对齐 Semi convertIcon 改 codegen 模板包 `<Icon type=… {...rest}>`（fill 仍由 svg 内消费），重跑 codegen 17 个 + rebuild icons dist。真机量得双色 demo size=extra-large 现为真 24px（修复前 16px）。图标列表 cell 补 `size="extra-large"`（原 glyph font-size:24 被 cd-icon-default 16px 压制从未生效）。消费方 button/tag/floatbutton AI 图标页真机抽验无回归。⚠️ `mask-type` 属性 svelte SVG 类型不认→改 `style="mask-type: alpha"`。真机验证：4 tab 切换/搜索 arrow 过滤/点击 cell 复制（pbpaste 得 IconStar）/尺寸 5 档 8-24px/双色 role=img+marginRight 10px/自定义 rotate matrix(-1,0,0,-1)/aria-label 覆盖/spin 动画/设计变量表 5 token 自动渲染 ✓。三包 typecheck 0 err、46 测试通过、lint 0 warning、体积门禁全过。
- [x] modal — 12 demo 整页 inline 严格复刻 Semi（基本/底部撑满 footerFill/点遮罩不可关/自定义按钮文字/自定义按钮属性/自定义头尾 header·footer=null/自定义样式 centered·bodyStyle/完全自定义 header={null}+List/全屏 fullScreen/命令式 6 型/Hooks useModal 继承 context/可拖拽 modalRender+DragMove）。源码早已破坏性对齐 Semi（.cd-modal-fixed>mask+wrap>modal>content DOM 全镜像、命令式工厂+useModal+ModalContextHolder），文档层主要补 API 缺口。**补齐 4 处 Semi 缺失能力**：①**onOk/onCancel 返回 Promise 时对应按钮 loading**（对齐 Semi onOKReturnPromiseStatus/onCancelReturnPromiseStatus，非受控 resolve 后关闭、reject 保持打开）——Modal.svelte ok()/cancel() 加 isPromise 分支 + okPending/cancelPending state 驱动 footer Button loading；ConfirmModal 补 cancelLoading 分支。②**preventScroll**（对齐 Semi，作用于组件内 focus）——core focus-trap.ts 加 preventScroll option，activate/deactivate 的 `.focus({preventScroll})` 全透传；Modal 透传 `useFocusTrap(el,{preventScroll})`。③**title 支持 Snippet**（对齐 Semi ReactNode，原仅 string）——默认头部 `{#if typeof title==='function'}{@render title()}`。④**命令式 config 全字段**（height/closable/confirmLoading/footerFill/mask/maskClosable/maskStyle/bodyStyle/style/class/modalContentClass，原仅少数）。**ConfirmModal 关键重构**：icon/title 从「自定义 header 整体替换」改为「走 Modal 默认头部通道（icon prop + title Snippet）」——原 header snippet 替换整个头部会**丢失 closable 关闭叉**（默认头部才含 closer），改后 confirm 弹窗右上角关闭叉正常渲染 + 命令式默认走 Modal 默认值（width 448/不居中/closable·maskClosable=true，删原 420/centered·closable=false 覆盖）。**core focus-trap 顺带对齐 Semi modalDialogFocus**：activate 前焦点已在容器内（内容 autofocus 元素已生效）则不抢焦点。⚠️ **onOk/onCancel 返回类型放宽为 `() => unknown`**：`void | Promise<unknown>` 的 union 会让 `() => (x=false)` 简写箭头（返回赋值表达式值）在 TS 报错。真机验证：基本 Modal 弹出+确定关闭✓、命令式 confirm（蓝问号图标+**关闭叉**+缩进内容+Cancel/OK）✓、命令式 custom（sendSvg 纸飞机图标+solid OK 单按钮）✓、Hooks useModal 继承 LocaleProvider context（按钮显示英文 **Cancel/OK** 而非中文）✓、TOC 17 项全收+设计变量章节自动补渲染+`#modalmethod` 锚点+无 SSR 500✓。三包 typecheck 0 err、focus-trap+modal 全测试通过（全库 201 文件 1840 passed）、lint 0 warning（残留 4 warning/1 error 均 mcp 包既有非本次）、体积 modal 6.2→6.4KB（实测 6.3，补 Promise loading/preventScroll/命令式全字段增长）。**用户复审揪出两轮疏漏**：①**12 个 demo 骨架未逐字复刻 Semi**（内联箭头→具名 showDialog/handleOk/handleCancel/handleAfterClose、prop 顺序、02 丢 afterClose/closeOnEsc、08 data 改用 title 猜图标 vs Semi data 带 icon 字段）——逐 demo 对齐 Semi 源码，08 恢复用本库已有 IconSemiLogo/IconVigoLogo（Semi/Vigo/Semi 顺序）+split={false}+标题逐字「Semi Design New Features」。②**footer 按钮颜色+间距真 bug** 见 [[modal-footer-button-class-is-cd-button-not-cd-btn]]：取消按钮缺 type=tertiary（成默认 primary 灰底块）、确认缺 theme=solid（成浅蓝非实心）；间距选择器误写 `.cd-btn`（本库 Button class 是 `cd-button`）致 margin-left 静默失效 gap 只 4px；修 type/theme/block=footerFill + 选择器改 .cd-button，真机量确认 marginLeft 12px、取消 rgba(255,255,255,.12) 无边框、确认 rgb(84,169,255) 实心。教训：demo 骨架要逐字比对 Semi 源码非只补 API；`:global()` 选中 Button 的样式先真机核 className。

---

## ⏳ 待办（45）

### 优先批 A：源码近期已破坏性对齐 Semi（文档对齐风险小，优先做）
> 依据 MEMORY.md 记忆，这些组件源码已对齐 Semi，文档 demo 能力大概率齐备。
> toast / notification / table / popover / sidesheet / userguide / modal 已完成，移至上方「已完成」区。

（本批全部完成）

### 优先批 B：基础/展示类（相对独立，无复杂交互）
- [x] iconbutton — **不做 inline，改为删独立文档页对齐 Semi**（2026-07-23，用户拍板）：核对 Semi 源码发现 IconButton 在 `semi-ui/index.ts:38` 公开导出但**无文档页**（文档里的「图标按钮」只是 Button 页一个 demo 章节，本库 button.md 05-icon 已覆盖）；本库组件层早已严格对齐（薄封装、meta 无 category 不进 components.json/侧边栏，`/components/iconbutton` 路由本就 404 死页）。故组件/导出/六个内部消费方（Modal/Banner/BackTop/Notification/SideSheet/Toast 关闭按钮）**全保留不动**，删 `iconbutton.md` + `demos/icon-button/`(9 demo+demos.ts) + component-dir/component-names-zh/component-briefs 三处映射条目。五包 typecheck 0 err、IconButton dom 12 测试通过、真机 curl：iconbutton 404 / button·backtop 200。
- [x] badge — 6 demo 整页 inline 严格复刻 Semi（基本用法/显示最大值/徽标位置/徽标样式 theme+type/独立使用）。React→Svelte 映射：count 为 ReactNode→`number|string|Snippet`（自定义节点用 `{#snippet count()}`，01 用本库具名 IconLock 复刻 Semi `<IconLock/>` 主色）；Avatar style 走本库 style prop（字符串）。theme/type demo 逐字复刻 Semi 的 `<div style="display:flex">` + bgStyle padding 布局（非套 Space，因 Semi 原样有 inverted 背景色块 padding），基本/溢出/位置/独立用 `<Space vertical>`。API 表逐 prop 核 Badge.svelte（本库 class/countClass/style，`${overflowCount}+` 花括号用反引号）+ 本库措辞 Accessibility + 文案规范。组件源码早已对齐 Semi（DOM/class/type×theme 语义色/RTL 全镜像），文档层无需改组件。真机验证（激活前台标签，避免 hidden 冻结）：基本 BM=5/YL dot/XZ 锁图标主色/WF NEW✓、theme solid·light·inverted✓、type 5 色+dot✓、position 四角✓、独立 count/NEW/10+/dot 文字状态列表✓、API 表 + 设计变量表(color/height/other/radius/spacing/width) 自动渲染 + TOC 全收 + 无 SSR 500✓。docs typecheck 0 err、badge dom 3 + visual 1 测试通过、lint 0 warning、体积门禁通过。
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
