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
- [x] timeline — 8 demo 严格对齐 Semi（basic/type/custom/left/center/alternate/right/datasource）；onClick(2.2.0) demo 保留为「可点击节点」章节、aria-label demo 放进 Accessibility 章节；源码/meta 原本已对齐 Semi 无需改；真机验证 onClick 联动 + aria-label DOM 挂载 + 10 实例全渲染
- [x] popconfirm — 4 Semi demo(基本/类型搭配/延时关闭/初始化焦点)+2 本库补充(关闭按钮/箭头)；封装链改述 Popover(非 Semi 的 Tooltip)；⚠️ **API 表 union 类型踩坑**：`Snippet<[{ initialFocusRef }]>` 的裸 `{}` 让 mdsvex 当 Svelte 表达式→SSR 500(typecheck 假绿真机才暴露)；修法=整型包反引号(反引号内 `{}<>` 全字面)，union 的 `|` 不能进反引号(会当列分隔)→拆成 `A`\|`B` 两段；真机验证 保存→确定→Toast 成功链
- [x] toast（见优先批 A 详注）
- [x] notification（见优先批 A 详注）
- [x] table（PR #604 已合并 2026-07-22）— 全库最大页：34 demo 整页 inline 严格复刻 Semi（含 _data.ts 共享数据）+ API 全表(Table/Column/rowSelection/Expandable/scroll/pagination)。**补全大量 Semi 缺失 API**：showSortTip(+Tooltip)、sortIcon/filterIcon、renderFilterDropdown(+RenderFilterDropdownProps)、renderFilterDropdownItem、filterDropdownProps.showTick(+FilterDropdownHost)、onHeaderCell、defaultFilteredValue、filterChildrenRecord/sortChildrenRecord、colSpan、resize、ellipsis.showTitle、title 支持 Snippet(含 filter/sorter/selection 物料透传)、sorter 第三参 sortOrder、fixed:true 归一化；rowSelection.checkRelation/clickRow/hidden/disabled/renderCell；表级 resizable(+onResize 事件)/expandAllRows/emptySnippet/onRow 拖拽事件(RowAttrs)；pagination.currentPage/total/position/formatPageText/onPageChange(受控不本地分页)；filterConfirmMode='confirm'。**视觉逐 demo 真机 getComputedStyle 逐值对齐**：①表头 39→38px(新增 .cd-table-operate-wrapper flex 消 inline descender)②行选择框原生 input→Checkbox/Radio 组件(16×20，选择列 52→48px；Checkbox/Radio 补 tabindex prop 供 grid roving)③表头固定列 z-index 102→101、固定列阴影按横滚 scroll-position-left/right 显隐④完全自定义渲染表头 38→41px(title 物料透传摆放 selection 全选框)。⚠️ **字体差异按分层改**见 [[align-semi-fix-at-correct-layer]]：全站不清爽→docs 层(app.css/layout 改 Inter 栈+antialiased)；Input `font: inherit` 继承表头 weight 600 变粗→组件层(Input.svelte 改 font-family/size/line-height:inherit 不含 weight，走 UA 默认 400，实测在 Semi th 插裸 input 得 Inter/400 印证)。42 Table 测试+26 Input 测试通过、体积门禁 20.99KB<21KB。踩坑：md 表格裸 `{}`/泛型 `<>` 断 SSR 见 [[inline-md-table-braces-angles-break-ssr]]；demo `$effect(()=>loadMore())` 追踪函数内响应式读取致 effect_update_depth 循环，加 inited guard；真机验证坐标漂移见 [[real-click-coord-drift-use-ref-not-coords]]

---

## ⏳ 待办（50）

### 优先批 A：源码近期已破坏性对齐 Semi（文档对齐风险小，优先做）
> 依据 MEMORY.md 记忆，这些组件源码已对齐 Semi，文档 demo 能力大概率齐备。
> toast / notification / table 已完成，移至上方「已完成」区。

- [ ] tooltip — 浮层继承链底层（Popover←Tooltip）见 [overlay-inheritance-chain]
- [ ] popover — 浮层继承链中层（封装 Tooltip）
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
