# SPEC · VirtualList
> 分类：show · 阶段：M4
> 对标 Semi：List（virtualized）/ VirtualList 底座

## 1. 概述

`VirtualList` 是一个虚拟滚动列表底座（headless 优先），用于在仅渲染可视区 + 缓冲区的前提下高性能渲染超长列表（万级～百万级数据）。它不规定行的视觉样式，只负责：测量视口、计算可见区间、维护滚动偏移、回收 DOM 节点、暴露滚动 API。`List`、`Table`（虚拟模式）、`Select`/`Cascader` 的下拉、`Tree` 等上层组件均复用本底座。

核心能力：
- 定高模式（fixed）：行高已知，O(1) 区间计算，零测量开销。
- 不定高模式（dynamic）：行高未知/可变，基于「估算高度 + ResizeObserver 实测回填 + 偏移修正」的增量测量。
- 横向虚拟化（horizontal）：行/列方向可切换。
- 缓冲区 overscan、滚动到指定 index/key/offset、对齐方式（start/center/end/auto/smart）。
- 滚动状态事件（scroll、可见区间变化、触底）。
- 与窗口滚动或内部容器滚动两种宿主。

非目标：本组件不做数据获取/分页（交由上层 `List`/`InfiniteScroll`），不做选择/键盘导航语义（交由上层复合控件）。

适用场景：长 feed、日志查看器、大数据下拉、聊天消息流、文件树。不适用：行数较少（< 2×视口）时直接渲染更划算，强制虚拟化反而增加抖动风险。

## 2. 设计语义

- **底座而非视觉组件**：自身无颜色/边框/间距视觉，仅有「滚动容器 + 撑高占位 + 绝对/平移定位的可见行」三层结构。所有视觉来自调用方传入的行渲染。
- **可视区 + overscan**：渲染范围 = `[startIndex - overscan, endIndex + overscan]`，overscan 用于消除快速滚动时的白屏，默认上下各 3 行。
- **定高 vs 不定高的取舍**：定高滚动条精确、可瞬时 `scrollToIndex`；不定高需估算总高，滚动条在测量回填前会有轻微跳动，组件通过「锚点行 + 偏移补偿」把跳动控制在锚点之外（视口内行不抖）。
- **平滑性**：滚动采用 `transform: translateY()` 定位行而非改变 `top`，避免重排；测量回填使用批处理（rAF 合并），避免逐行 layout thrash。
- **reduced-motion**：`scrollToIndex` 的平滑滚动（`behavior: 'smooth'`）在 `prefers-reduced-motion: reduce` 下降级为瞬时跳转。
- **RTL**：横向虚拟化时，`direction: rtl` 下偏移基于 `scrollLeft` 的浏览器符号差异做归一化（统一为逻辑起点为 0、向行末递增）。
- **空态/加载态**：自身不渲染空态，暴露 `empty` slot 由上层填充，保持底座纯净。

## 3. 分层实现

有滚动计算、测量、a11y live 区间播报逻辑，采用 core + svelte 分层。

**@chenzy-design/core · `createVirtualList`**
- 输入：`count`、`getItemSize(index)`（定高时为常量函数）、`estimateSize`、`overscan`、`horizontal`、`scrollMargin`、`getScrollElement`。
- 输出 store：`virtualItems`（`{ index, key, start, size, lane }[]`）、`totalSize`、`range`（start/end index）、`scrollOffset`、`isScrolling`。
- 方法：`scrollToIndex(index, { align, behavior })`、`scrollToOffset`、`measureElement(node)`（不定高回填）、`getVirtualItems()`、`update()`。
- 复用原语：
  - `useId`：生成 `aria-controls`/`id` 关联。
  - `useLiveAnnouncer`：可选播报「显示第 X–Y 项，共 N 项」（屏幕阅读器辅助）。
  - 自有原语 `useResizeObserver`（不定高测量）、`useRafBatch`（合并测量写回）、`useScrollParent`（解析滚动宿主）。
  - 不强依赖 useFocusTrap/useDismiss/useScrollLock（非浮层）；若作为下拉内容由上层浮层负责锁滚。

**@chenzy-design/svelte · `<VirtualList>`**
- 订阅 store，渲染三层 DOM：外层 viewport（`overflow:auto`，绑定 scroll/resize）→ inner spacer（`height: totalSize`）→ 可见行（`position:absolute; transform`）。
- 不定高：每行通过 `use:measure` action 挂 ResizeObserver，尺寸变化经 `useRafBatch` 回填 core 并补偿锚点偏移。
- 暴露 `item` slot（`let:item let:index`）、`bind:this` 上的 imperative 方法（`scrollToIndex` 等）。
- SSR：首屏渲染 `initialRect`/`ssrItemCount` 指定的占位行，hydration 后接管测量。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| data | `T[]` | `[]` | 列表数据源（也可只传 `count` 做无数据模式） |
| count | `number` | `data.length` | 总条目数；与远程/惰性数据配合时显式指定 |
| getKey | `(item: T, index: number) => string \| number` | `(_, i) => i` | 行唯一 key，影响复用与测量缓存正确性，强烈建议提供稳定 key |
| mode | `'fixed' \| 'dynamic'` | `'fixed'` | 定高 / 不定高 |
| itemSize | `number \| ((index: number) => number)` | `40` | `fixed` 模式行高（px）；函数形式支持已知变高 |
| estimateSize | `number` | `40` | `dynamic` 模式估算行高，用于首屏总高估算 |
| overscan | `number` | `3` | 可视区外预渲染行数（上下/左右各） |
| horizontal | `boolean` | `false` | 横向虚拟化 |
| height | `number \| string` | `'100%'` | viewport 高度（横向时为宽度无关，仍取容器尺寸） |
| scrollTarget | `'self' \| 'window' \| HTMLElement` | `'self'` | 滚动宿主：内部容器 / 窗口 / 指定元素 |
| scrollMargin | `number` | `0` | 当滚动宿主为 window/外层时，列表距宿主顶部的偏移修正 |
| paddingStart | `number` | `0` | 列表起始内边距（计入总高，不被回收） |
| paddingEnd | `number` | `0` | 列表末尾内边距 |
| initialScrollOffset | `number` | `0` | 初始滚动偏移（px） |
| initialIndex | `number` | `-` | 初始定位到的 index（优先于 offset） |
| stickyIndices | `number[]` | `[]` | 需吸附置顶的行索引（如分组头） |
| reachThreshold | `number` | `0` | 距底部多少 px 触发 `reachEnd`（用于上层无限加载） |
| destroyOnHidden | `boolean` | `true` | 不可见行从 DOM 移除（false 时仅隐藏，保留状态） |
| ssrItemCount | `number` | `0` | SSR/首屏预渲染的占位行数 |
| ariaLabel | `string` | `-` | 列表无障碍名称 |
| announceRange | `boolean` | `false` | 是否通过 live region 播报可见区间 |

### Events

| 事件 | payload | 说明 |
|---|---|---|
| on:scroll | `{ offset: number; direction: 'forward' \| 'backward'; isScrolling: boolean }` | 滚动时触发（rAF 节流） |
| on:rangeChange | `{ startIndex: number; endIndex: number; visibleStart: number; visibleEnd: number }` | 可见/渲染区间变化（含 overscan 与不含 overscan 各一对） |
| on:reachEnd | `{ index: number }` | 滚动到距底 `reachThreshold` 内，供上层加载更多 |
| on:reachStart | `{ index: number }` | 滚动到顶部阈值内 |
| on:measure | `{ index: number; size: number }` | 不定高模式某行实测尺寸回填后触发 |
| on:visibilityChange | `{ visible: boolean }` | viewport 进入/离开视口（window 宿主下，配合 IntersectionObserver） |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| item | `let:item let:index let:key let:measure` | 行渲染（必需）；`dynamic` 模式需把 `use:measure` 挂到行根节点 |
| empty | — | `count === 0` 时渲染 |
| sticky | `let:index let:item` | 自定义吸附行渲染（默认复用 `item`） |
| header | — | 列表头部（计入 `paddingStart`，不回收） |
| footer | — | 列表尾部（如加载更多 spinner） |

### Imperative（`bind:this`）

| 方法 | 签名 | 说明 |
|---|---|---|
| scrollToIndex | `(index, opts?: { align?: 'start'\|'center'\|'end'\|'auto'\|'smart'; behavior?: 'auto'\|'smooth' }) => void` | 滚动到指定行 |
| scrollToOffset | `(offset: number, opts?) => void` | 滚动到像素偏移 |
| scrollToKey | `(key, opts?) => void` | 按 key 滚动 |
| getVirtualItems | `() => VirtualItem[]` | 当前渲染行快照 |
| measure | `() => void` | 强制重测（数据/容器尺寸外部变更后） |

## 5. 主题 / Token

底座视觉极少，仅滚动容器与可选滚动条样式消费 Token；行视觉由调用方负责，组件不写死任何颜色/尺寸值。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| `--cd-virtuallist-bg` | `var(--cd-color-bg-0)` | viewport 背景 |
| `--cd-virtuallist-scrollbar-size` | `8px`（引用 Global `--cd-size-scrollbar`） | 自定义滚动条粗细 |
| `--cd-virtuallist-scrollbar-thumb` | `var(--cd-color-fill-2)` | 滚动条滑块色 |
| `--cd-virtuallist-scrollbar-thumb-hover` | `var(--cd-color-fill-3)` | 滑块 hover |
| `--cd-virtuallist-scrollbar-track` | `transparent` | 滚动条轨道 |
| `--cd-virtuallist-sticky-shadow` | `var(--cd-shadow-1)` | 吸附行投影（区分浮起） |
| `--cd-virtuallist-sticky-bg` | `var(--cd-color-bg-0)` | 吸附行背景（避免穿透） |

约定：组件 CSS 仅引用 `--cd-virtuallist-*` 与 Alias，禁止出现原子色值/魔数（`8px` 滚动条以 Global token 兜底）。深色模式由 Alias 自动切换，无需组件干预。

## 6. 无障碍（WCAG 2.1 AA）

虚拟列表的核心无障碍难点：DOM 中只有部分行，屏幕阅读器与「Ctrl+F 页内查找」均只能感知已渲染节点。

- **role**：viewport 默认不强加列表语义（底座中立）；当上层用作列表时，由上层在 viewport 上设 `role="list"`/`role="listbox"`/`role="grid"`，行设对应 `role="listitem"`/`option`/`row`。本组件透传 `role` 与 `aria-*` 属性到 viewport。
- **总数告知**：在每个渲染行上输出 `aria-setsize={count}` 与 `aria-posinset={index + 1}`，使 AT 即便只见可见行也能播报「第 12 项，共 10000 项」。这是虚拟列表必须项。
- **live region**：`announceRange` 开启时，经 `useLiveAnnouncer`（`aria-live="polite"`）在停止滚动后播报「显示第 X 至 Y 项，共 N 项」，文案走 i18n，避免滚动中高频打断。
- **键盘**：底座本身不接管方向键（避免与上层语义冲突）；viewport `tabindex` 由上层决定。`PageUp/PageDown/Home/End` 由浏览器原生滚动处理，组件保证滚动后区间正确重算。当上层提供 roving tabindex（复用 core `useRovingTabindex`）时，VirtualList 暴露 `scrollToIndex(focusedIndex, { align: 'auto' })` 钩子，确保「键盘移动到的行始终被滚入视口并真实渲染」（焦点行不可被回收 → 焦点行强制纳入渲染范围）。
- **焦点不丢失**：被回收的行若含焦点会丢焦。组件对「当前含焦点的 index」永久保留渲染（`keepFocusedMounted`），直到焦点离开。
- **查找/朗读限制**：在文档中说明虚拟化会限制浏览器原生查找；对需全文可搜索的场景建议上层提供「关闭虚拟化」逃生舱（`mode` 外的 `virtual={false}` 由上层 List 提供）。
- **对比度**：自定义滚动条滑块对轨道/背景需 ≥ 3:1（非文本图形对比），`--cd-color-fill-2` 已满足。
- **reduced-motion**：smooth 滚动降级为瞬时（见 §2）。
- **RTL**：横向模式 `dir` 透传并归一化 scrollLeft。

## 7. 国际化

用户可见文案仅来自 live 播报与默认空/底部加载提示（若上层未覆盖）。全部走 i18n，无硬编码。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `VirtualList.announceRange` | `显示第 {start} 至 {end} 项，共 {total} 项` | 可见区间播报，`{start}{end}{total}` 用 `Intl.NumberFormat` 本地化 |
| `VirtualList.reachEnd` | `已到底部` | 触底（供上层默认 footer 使用，可选） |
| `VirtualList.empty` | `暂无数据` | 默认空态（建议上层覆盖） |
| `VirtualList.loading` | `加载中…` | 默认底部加载（可选） |

- 数字（项数）一律用 `Intl.NumberFormat(locale)` 格式化，避免千分位硬编码。
- RTL locale 下 viewport `dir` 跟随，播报文案方向由 AT 处理。
- 无日期场景；若行内含日期由调用方用 `Intl.DateTimeFormat` 处理。

## 8. 文案

- 遵循 content-guidelines：底座文案极简、陈述式、无标点堆叠（`加载中…` 用单个省略号字符 `…` 而非 `...`）。
- 播报文案保持「数据 + 总量」结构，便于用户定位，不使用「正在为您…」等冗余客套。
- 空态默认「暂无数据」，鼓励上层替换为带场景动作的引导（如「暂无消息，去关注感兴趣的人」）。

**危险操作文案**：本组件无破坏性/不可逆操作，无危险文案。（行内删除等危险动作由调用方在 `item` slot 内自行实现并遵循危险文案规范。）

## 9. 性能（Perf Budget）

性能是本组件存在的理由，预算从严。

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（core） | ≤ 4.5 KB | 区间计算 + 不定高测量 + 滚动 API |
| gzip 体积（svelte 封装） | ≤ 2 KB | 三层 DOM + slot 转发 + measure action |
| 首屏渲染节点数 | 视口行数 + 2×overscan | 与 `count` 无关，万级数据首屏 ≤ ~30 节点 |
| 滚动帧 | 60fps（帧预算 ≤ 16ms），P95 无掉帧 | transform 定位 + rAF 节流 scroll；定高模式区间计算 O(1) |
| 不定高测量 | 单帧测量回填 ≤ 1 次 layout | ResizeObserver + `useRafBatch` 合并写回，禁止逐行同步读高 |
| scrollToIndex（定高） | O(1)、< 1ms | 直接偏移计算 |
| scrollToIndex（不定高，未测量区） | 估算跳转 + 落地后 1 次校正 | 二分定位已测量前缀和 |
| 内存 | 测量缓存 O(已滚过的行)，可设上限 | key 化缓存，`getKey` 稳定时复用 |

关键策略：
- **虚拟化**：核心机制，仅渲染可视 + overscan。
- **惰性渲染**：`destroyOnHidden`（默认 true）回收离屏行 DOM；false 仅用于需保留行内状态（如表单/媒体播放）的小列表。
- **前缀和 + 二分**：不定高总高与 index↔offset 互查用前缀和数组（增量更新）+ 二分查找，避免线性扫描。
- **transform 定位**：避免 `top` 触发布局；`will-change: transform` 仅在滚动中开启，停止后移除以省内存。
- **滚动节流**：scroll 事件 rAF 合并；`isScrolling` 在停止 150ms 后置 false，可供上层在滚动中降级（如暂停图片解码）。
- **建议**：`count` < 2× 视口行数时上层应关闭虚拟化（避免占位/测量开销大于收益）。

## 10. AI 元数据

提供 `component.meta.ts`（供 AI 生成/检索与文档自动化）。

```ts
// component.meta.ts
export default {
  name: 'VirtualList',
  category: 'show',
  stage: 'M4',
  semiEquivalent: 'List(virtualized)',
  headless: true,        // core: createVirtualList
  status: 'none',        // 无 status 语义
  a11yPattern: 'list-base (role 由上层指定, aria-setsize/posinset 透出)',
  capabilities: ['fixed-height', 'dynamic-height', 'horizontal', 'sticky', 'window-scroll', 'scroll-to', 'overscan'],
  notVirtualizableHint: 'count < 2x viewport → 建议关闭虚拟化',
  keyApis: ['data', 'mode', 'itemSize', 'estimateSize', 'overscan', 'scrollToIndex'],
  events: ['scroll', 'rangeChange', 'reachEnd', 'reachStart', 'measure'],
  slots: ['item', 'empty', 'sticky', 'header', 'footer'],
  imperative: ['scrollToIndex', 'scrollToOffset', 'scrollToKey', 'getVirtualItems', 'measure'],
  perfBudgetKb: { core: 4.5, svelte: 2 },
  dependsOnCore: ['useId', 'useLiveAnnouncer', 'useResizeObserver', 'useRafBatch', 'useScrollParent'],
  usedBy: ['List', 'Table', 'Select', 'Cascader', 'Tree'],
  i18nKeys: ['VirtualList.announceRange', 'VirtualList.reachEnd', 'VirtualList.empty', 'VirtualList.loading'],
} as const;
```

## 11. 测试

- **单元（core，无 DOM 依赖）**：
  - 定高区间计算：给定 `count/itemSize/scrollOffset/overscan`，断言 `range` 与 `virtualItems.start`。
  - 前缀和 + 二分：随机不定高数组，offset↔index 互查正确性（含边界 0、末尾、超界）。
  - `scrollToIndex` 各 `align`（start/center/end/auto/smart）目标 offset 计算。
  - paddingStart/End、scrollMargin、stickyIndices 对偏移的影响。
- **测量回填（jsdom + 模拟 ResizeObserver）**：行高变化触发回填，锚点偏移补偿后视口内行 `start` 不抖；批处理合并验证（N 次变化 ≤ 1 次写回）。
- **组件（Svelte Testing Library）**：
  - 万级数据首屏渲染节点数 = 视口 + 2×overscan。
  - 滚动后 `rangeChange`/`reachEnd` 事件 payload 正确。
  - `destroyOnHidden` true/false 的 DOM 增删。
  - 焦点行不被回收（聚焦 → 滚出 → 仍在 DOM）。
  - SSR：`ssrItemCount` 占位渲染 + hydration 接管无 mismatch。
- **a11y（axe + 手动）**：渲染行含 `aria-setsize`/`aria-posinset`；`announceRange` 播报文案与 polite live region；reduced-motion 下 smooth 降级。
- **视觉/交互回归（Playwright）**：快速滚动无白屏（overscan 生效）、横向虚拟化、RTL scrollLeft 归一化、sticky 行吸附与投影。
- **性能基准（benchmark）**：100k 行滚动 60fps（帧时长直方图 P95 ≤ 16ms）、scrollToIndex 定高 < 1ms。

## 12. 验收标准 checklist

- [ ] core `createVirtualList` 与 svelte 封装分层，纯计算逻辑无 DOM 依赖、可独立单测。
- [ ] 定高模式区间计算 O(1)，万级数据首屏节点数 = 视口 + 2×overscan。
- [ ] 不定高模式：估算→实测回填→锚点偏移补偿，视口内行不抖；前缀和 + 二分实现 index↔offset 互查。
- [ ] 横向虚拟化、window/self/指定元素三种滚动宿主、sticky 行均可用。
- [ ] `scrollToIndex/scrollToOffset/scrollToKey` 五种 align 行为正确；reduced-motion 下 smooth 降级瞬时。
- [ ] 渲染行透出 `aria-setsize`/`aria-posinset`；role 透传由上层指定；焦点行不被回收。
- [ ] `announceRange` 经 live region polite 播报，文案走 i18n，数字用 Intl.NumberFormat。
- [ ] 所有可见文案零硬编码，i18n key 齐全（announceRange/reachEnd/empty/loading）。
- [ ] CSS 仅消费 `--cd-virtuallist-*` 与 Alias token，无写死色值/魔数；深色模式自动适配。
- [ ] RTL 下横向 scrollLeft 归一化正确。
- [ ] Perf Budget 达标：core ≤ 4.5KB / svelte ≤ 2KB gzip；100k 行滚动 P95 ≤ 16ms。
- [ ] scroll/rangeChange/reachEnd/reachStart/measure 事件 payload 与文档一致，scroll 经 rAF 节流。
- [ ] `destroyOnHidden` 默认 true 回收离屏 DOM；false 保留行状态。
- [ ] SSR `ssrItemCount` 占位 + hydration 接管无 mismatch。
- [ ] 提供 `component.meta.ts`，字段完整且与实现一致。
- [ ] 单元 / 测量 / 组件 / a11y(axe) / 性能基准测试全部通过。
