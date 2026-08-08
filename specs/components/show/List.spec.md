# SPEC · List
> 分类：show · 阶段：M4
> 对标 Semi：List

## 1. 概述

List（列表）用于承载一组同构的结构化数据，以纵向（或横向网格）方式逐项呈现。相较于 Table 的多列强结构，List 更适合"卡片化/富内容行"的场景：消息流、设置项、用户列表、Feed、搜索结果。

核心能力：
- 数据驱动渲染（`dataSource` + `renderItem`）或纯 slot 插槽渲染（`List.Item` 子项）。
- 子项标准化结构 `List.Item`（main 内容区）与 `List.Item.Meta`（avatar + title + description 三段式）。
- 加载态（`loading` 骨架/spinner）、空态（`emptyContent`）、错误态。
- 分页（集成 Pagination）与「加载更多」（loadMore footer）两种增量模式。
- 大数据虚拟化（`virtualized`）：仅渲染可视区行，支持定高与动态测高。
- 横向网格布局（`grid`：列数、间距、响应式断点）。
- 可选交互：行可点击/可选中（`selectable` 单选/多选）、键盘导航。

非目标：复杂多列表头排序筛选（用 Table）；树形层级（用 Tree）；拖拽排序（用 List + 外部 dnd 原语组合，本组件不内建）。

## 2. 设计语义

- 行（Item）默认无边框分隔，可通过 `bordered` 开启卡片外框、`split` 控制行间分隔线。
- 行高随内容自适应；`Meta` 三段式遵循垂直节律：title 用 `--cd-color-text-0`，description 用 `--cd-color-text-2`，avatar 与文本基线对齐。
- header / footer 作为列表的语义边界，与 body 用分隔线区隔；loadMore 居中置于 footer。
- 尺寸 `small|default|large` 仅影响行内边距与 Meta 间距，不改变字号层级。
- 状态语义：loading 覆盖整个 body（首屏）或仅 footer（增量加载）；空态居中展示 illustration + 文案；selectable 选中行使用 `--cd-color-primary-light-default` 作为背景强调。
- 动效：行 hover 背景过渡 120ms；虚拟化滚动不加入位移动画；遵循 `prefers-reduced-motion` 时关闭 hover 过渡。

## 3. 分层实现

List 主体是数据渲染容器，纯展示部分（Item/Meta/Header/Footer/grid）无需 core。但虚拟化、可选中、键盘导航属于有状态/交互逻辑，下沉到 core。

`@chenzy-design/core` — `createList`（仅在 `virtualized` 或 `selectable` 启用时实例化）：
- 虚拟化引擎 `createVirtualizer`：维护 scrollTop、可视区间 [startIndex, endIndex]、overscan、定高（itemSize 数值）/ 动态测高（ResizeObserver 缓存每行高度 + 二分定位）、总高度与偏移量计算。
- 选中状态机：`selectedKeys` 受控/非受控、单选/多选、shift 连选、`onSelectionChange`。
- 键盘导航：复用 `useRovingTabindex` 在行间移动焦点；Home/End/PageUp/PageDown 与虚拟区间联动滚动。
- `useId`：为 header/footer 关联生成 id。
- 复用 `useLiveAnnouncer`：加载更多/分页切换后播报"已加载第 X–Y 项，共 N 项"。

`@chenzy-design/svelte` — `List.svelte` / `ListItem.svelte` / `ListItemMeta.svelte`：
- 订阅 createList store，渲染可视行（虚拟化时用 absolute 定位 + translateY 偏移，外层撑总高度）。
- 集成 `Pagination`（M2）与 `Spinner`/`Skeleton`（M1）、`Empty`（M3）。
- 非虚拟化、非选中时退化为纯 `{#each}` 渲染，零 core 依赖、零运行时状态。

不复用：`useFocusTrap`/`useDismiss`/`useScrollLock`（List 非浮层，无需）。

## 4. API

### Props

> 本表由 `packages/svelte/src/list/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| bordered | `boolean` | `false` | 是否显示外框 |
| dataSource | `T[]` | `undefined` | 列表数据源 |
| renderItem | `Snippet<[item: T, index: number]>` | `undefined` | 使用 dataSource 时自定义渲染列表项 |
| emptyContent | `string \| Snippet` | `undefined` | 空列表展示内容，缺省回退 locale List.emptyText |
| footer | `string \| Snippet` | `undefined` | 列表底部 |
| header | `string \| Snippet` | `undefined` | 列表头部 |
| layout | `'vertical' \| 'horizontal'` | `'vertical'` | 列表布局方向 |
| loadMore | `Snippet` | `undefined` | 加载更多按钮区 |
| loading | `boolean` | `false` | 加载态，列表体外包裹 Spin |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 列表尺寸 |
| split | `boolean` | `true` | 是否展示分割线 |
| grid | `ListGrid` | `undefined` | 栅格配置（复用 Row/Col）：gutter/align/justify/wrap → Row，span/offset/order/push/pull/flex/xs..xxl → Col |
| style | `string` | `undefined` | 根容器行内样式 |
| onClick | `(e: MouseEvent) => void` | `undefined` | 列表项点击回调（下发给 Item 作为回退） |
| onRightClick | `(e: MouseEvent) => void` | `undefined` | 列表项右键回调（下发给 Item 作为回退） |
| children | `Snippet` | `undefined` | 声明式用法：内嵌 <List.Item> |
| class | `string` | `''` | 根类名 |

**子组件**：``

`GridConfig`: `{ columns?: number; gutter?: number | [number, number]; xs?, sm?, md?, lg?, xl?, xxl?: number }`
`VirtualConfig`: `{ itemSize?: number | ((i) => number); height: number | string; overscan?: number; onScroll?: (e) => void }`

### Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

### Slots

| Slot | props | 说明 |
|---|---|---|
| `default` | — | 直接放置 `List.Item` 子项（非 dataSource 模式） |
| `item` | `{ item, index }` | 等价 renderItem 的插槽形式 |
| `header` | — | 头部，覆盖 `header` prop |
| `footer` | — | 底部，覆盖 `footer` prop |
| `empty` | — | 空态自定义 |
| `loadMore` | `{ loading }` | 加载更多区域自定义 |

子组件 Slots：
- `List.Item`：`default`（主内容）、`extra`（右侧附加区，如缩略图）、`actions`（底部操作按钮组）。
- `List.Item.Meta`：`avatar`、`title`、`description`，或对应同名 props。

## 5. 主题 / Token

仅消费 Alias / Component 层，禁止写死值。

| Component Token | 取值（Alias 引用） | 用途 |
|---|---|---|
| `--cd-list-bg` | `--cd-color-bg-0` | 列表背景 |
| `--cd-list-border-color` | `--cd-color-border` | 外框 / 分隔线颜色 |
| `--cd-list-border-radius` | `--cd-radius-default` | bordered 圆角 |
| `--cd-list-item-padding-y` | `--cd-spacing-3`（default） | 行垂直内边距 |
| `--cd-list-item-padding-x` | `--cd-spacing-4` | 行水平内边距 |
| `--cd-list-item-padding-y-small` | `--cd-spacing-2` | small 尺寸 |
| `--cd-list-item-padding-y-large` | `--cd-spacing-4` | large 尺寸 |
| `--cd-list-item-hover-bg` | `--cd-color-fill-0` | 行 hover 背景 |
| `--cd-list-item-selected-bg` | `--cd-color-primary-light-default` | 选中行背景 |
| `--cd-list-item-selected-text` | `--cd-color-primary` | 选中行强调文本 |
| `--cd-list-meta-title-color` | `--cd-color-text-0` | Meta 标题 |
| `--cd-list-meta-desc-color` | `--cd-color-text-2` | Meta 描述 |
| `--cd-list-meta-gap` | `--cd-spacing-3` | avatar 与文本间距 |
| `--cd-list-header-color` | `--cd-color-text-1` | header/footer 文本 |
| `--cd-list-empty-color` | `--cd-color-text-2` | 空态文案 |
| `--cd-list-error-color` | `--cd-color-danger` | 错误态文本 |
| `--cd-list-transition` | `120ms var(--cd-ease-standard)` | hover 过渡（reduced-motion 时置 0） |

暗色模式：全部经 Alias 自动切换，组件层不单独定义暗色值。RTL 下 padding-x 与 Meta gap 自动镜像（用逻辑属性 `padding-inline` / `margin-inline-start`）。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG。语义角色按场景区分：

- 纯展示列表：容器 `role="list"`，行 `role="listitem"`；不抢焦点。
- 可选中列表（selectable）：容器 `role="listbox"`（multiple 时 `aria-multiselectable="true"`），行 `role="option"` + `aria-selected`。遵循 Listbox APG。
- header/footer 通过 `aria-labelledby` / `aria-describedby` 关联容器（id 由 `useId` 生成）。

键盘交互（selectable 或可点击行启用 roving tabindex）：

| 按键 | 行为 |
|---|---|
| `Tab` | 焦点进入列表，落在 roving 当前项（其余项 `tabindex=-1`） |
| `↑ / ↓` | 上/下移动焦点行（虚拟化时同步滚动） |
| `Home / End` | 跳至首/末项 |
| `PageUp / PageDown` | 翻一屏 |
| `Space / Enter` | 切换当前行选中态 / 触发 rowClick |
| `Shift + ↑↓` | multiple 模式连续选择 |

焦点管理：分页/加载更多后焦点保持在触发器；虚拟化滚动后被回收的行若持有焦点，焦点移交到最近可视行。
对比度：文本与背景 ≥ 4.5:1；选中背景上的强调文本须复核 ≥ 4.5:1；分隔线非信息性，无对比度要求。
reduced-motion：关闭 hover 过渡与任何滚动平滑。
RTL：使用逻辑属性，箭头键语义不随方向反转（↑↓ 为纵向，不受影响）。
LiveAnnouncer：加载更多/分页/选中数量变化时 polite 播报。

## 7. 国际化

用户可见文案零硬编码，经 i18n 注入；数字（计数、页码）用 `Intl.NumberFormat`。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `List.emptyText` | 暂无数据 |

Pagination 相关文案由 Pagination 组件自身 i18n 提供，List 不重复定义。

## 8. 文案

遵循 content-guidelines：

- 空态：用陈述句说明现状并给出下一步引导，如「暂无数据」而非「没有任何东西」；可在 `emptyContent` 补充操作引导（「点击右上角新建」）。
- 加载更多：常态「加载更多」，无更多数据「没有更多了」（中性、不带感叹号）。
- 错误态：说明 + 可恢复动作，「加载失败，请重试」+「重试」按钮，不暴露技术堆栈。
- 选中计数：「已选 N 项」，N=0 时不展示该提示。

危险操作文案（单列）：
- List 本身不内建删除等危险动作；若业务在 `List.Item` 的 `actions` 中放置删除按钮，删除文案须遵循危险操作规范：动词明确（「删除」非「移除/清理」），二次确认描述影响与不可逆性（「删除后无法恢复，确认删除该项？」），确认按钮使用 danger 语义色。此类确认应交由 Popconfirm/Modal 承载，List 不弹层。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte，基础展示） | ≤ 4 KB |
| gzip 体积（含虚拟化 + 选中 core） | ≤ 8.95 KB（虚拟化逻辑按需动态导入） |
| 首屏渲染（100 行，非虚拟化） | < 16ms（单帧内） |
| 虚拟化滚动（10k 行，定高） | 稳定 60fps；DOM 节点数 ≈ 可视行 + 2×overscan |
| 动态测高（10k 行） | 首次测高摊销 O(n)，定位 O(log n)（二分）；ResizeObserver 复用单实例 |
| 选中切换（multiple, 1k 选中） | O(1) 单行更新，使用 Set 存储 selectedKeys |
| 内存 | 虚拟化下仅缓存高度数组（number[]），不缓存 DOM |

策略：
- `virtualized` 启用时虚拟化模块动态 import，未用不进主包。
- 非虚拟化大数据建议改用 `pagination` 或 `loadMore`，文档明确告警阈值（>200 行建议虚拟化）。
- `destroyOnClose` 不适用（非浮层）；行卸载即销毁，不保留隐藏 DOM。
- `renderItem` 结果不做深 memo，建议调用方保持引用稳定。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'List'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'List'`。
- `capabilities: ['data-render', 'pagination', 'load-more', 'virtualized', 'grid', 'selectable', 'empty/loading/error-state']`。
- `props` / `events` / `slots` 结构化 schema（类型、默认值、枚举、必填、互斥关系：`pagination` ⊻ `loadMore`，`virtualized` 需 `rowKey`）。
- `subComponents: ['List.Item', 'List.Item.Meta']`。
- `a11yRoles: { display: 'list/listitem', selectable: 'listbox/option' }`。
- `i18nKeys`（见第 7 节）、`tokens`（见第 5 节）。
- `whenToUse` / `whenNotToUse`（vs Table / Tree / Descriptions）供 AI 选型。
- `examples`：基础列表、Meta 三段式、加载更多、分页、虚拟化 10k、网格、可多选。

## 11. 测试

- 单元（core）：虚拟化区间计算（边界 0 项 / 单项 / overscan 溢出）、定高与动态测高定位、选中状态机（单/多/shift 连选/受控同步）、二分定位正确性。
- 组件渲染：dataSource vs slot 两种渲染路径一致；size/bordered/split 类名快照；loading（spinner/skeleton/skeletonCount）、empty、error 三态。
- 交互：键盘导航（↑↓/Home/End/PageUp/PageDown/Space/Enter/Shift）、行点击事件、reachBottom 阈值触发、loadMore/pagination 互斥告警。
- a11y：jest-axe 零违规；role 切换（list↔listbox）；aria-selected/aria-multiselectable 正确；roving tabindex 仅一项可聚焦；reduced-motion 媒体查询下无过渡。
- i18n：全部 key 有 zh-CN/en-US 翻译；计数与页码经 Intl 格式化；缺失 key 回退检测。
- 性能：10k 行虚拟化滚动帧率基准（Playwright + tracing）；DOM 节点数断言 ≤ 可视+overscan。
- 视觉回归：基础/Meta/网格/选中/暗色/RTL 截图快照。

## 12. 验收标准 checklist

- [ ] Props/Events/Slots 与本 SPEC 一致，受控 `value + on:change`、分页 `on:pageChange` 命名符合全局约定。
- [ ] `pagination` 与 `loadMore` 互斥，并发设置时 dev 警告。
- [ ] 虚拟化支持定高与动态测高，10k 行稳定 60fps，DOM 节点数受控。
- [ ] 虚拟化逻辑按需动态导入，基础展示 gzip ≤ 4KB。
- [ ] selectable 单/多选、shift 连选、受控/非受控均正确，使用 Set 存储。
- [ ] loading（spinner/skeleton）、empty、error 三态完整，文案经 i18n。
- [ ] 纯展示用 list/listitem，selectable 用 listbox/option，jest-axe 零违规。
- [ ] 键盘交互全集实现，roving tabindex 正确，焦点在分页/滚动后稳妥处理。
- [ ] 所有可见文案走 i18n，计数/页码用 Intl，无硬编码。
- [ ] 仅消费 Alias/Component Token，无写死颜色/间距，暗色与 RTL（逻辑属性）正确。
- [ ] reduced-motion 下关闭 hover/滚动过渡。
- [ ] 危险操作（行内删除）走 Popconfirm/Modal 二次确认，文案符合危险操作规范。
- [ ] 提供 component.meta.ts，含 capabilities/props/events/slots/互斥约束/选型说明。
- [ ] 单元/组件/交互/a11y/i18n/性能/视觉回归测试齐备且通过。
