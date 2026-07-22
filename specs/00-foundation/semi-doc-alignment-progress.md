# Semi 文档整页对齐 — 进度清单（TODO）

> 配合 `semi-doc-alignment-sop.md` 使用。**做完一个就在此勾选并写一行要点**，新会话读此文件即知进度，免重新排查。
> 判真基准：以 md frontmatter 是否有 `docMode: inline` 为准（`grep -l "docMode: inline" packages/docs/src/content/components/*.md`），别只信本文件——本文件可能滞后。
> 铁律见 SOP：demo 严格复刻 Semi（不简化、布局用本库 `<Space>`）、正文逐字抄 Semi 别顺手规整、API 表 `{}` 用反引号、**每个交互 demo 真机点击验证**（点了没反应先排 scrollY+dpr 坐标偏移，非组件 bug）。

## ✅ 已完成（18）

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

---

## ⏳ 待办（54）

### 优先批 A：源码近期已破坏性对齐 Semi（文档对齐风险小，优先做）
> 依据 MEMORY.md 记忆，这些组件源码已对齐 Semi，文档 demo 能力大概率齐备。

- [x] toast — 文档整页 inline 对齐 Semi（11 demo：普通/其他类型/多色/链接/延时/手动关闭/更新/销毁所有/useToast/factory/更多选项，布局裸 div→`<Space>`；API 参考 + Options + Config 三表 + 文案规范）。⚠️ **真机验证连带修出存量组件 bug**：Toast 的移除（自动到期/手动关闭/destroyAll）全部失效——根因 `out:fly` duration 因 `prefersReducedMotion.current` 求值为 0 时节点不 unmount。**破坏性改用 CSS 动画 + 两段式移除对齐 Semi**：core 加 `leaving` 标记 + `finalizeRemove`（remove 只标记触发 hide keyframe，animationend 后真删），ToastContainer 去 fly/flip 改 `cd-toast-animation-show/hide` keyframe + `onanimationend`→finalizeRemove（enter 守卫 `if(leaving)` 防误删）。见 [[toast-remove-broken-out-fly-duration-zero]] [[toast-two-phase-css-animation-align-semi]]。真机验证：录制保持前台见证弹出→3s→自动消失、开3条→destroyAll 全清（后台标签 CSS 动画被浏览器冻结致 animationend 不触发是验证假象，非 bug）
- [ ] notification — 已对齐（theme normal/light、useNotification 返 [api,holderStore]）见 [notification-semi-rewrite]
- [ ] table — 已补齐 API（表头合并/onRow/useFullRender 等）；表头 tr 必带 cd-table-row 基类 见 [table-api-gaps]
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
