# SPEC · Pagination
> 分类：navigation · 阶段：M3
> 对标 Semi：Pagination

## 1. 概述

Pagination（分页器）用于在数据量较大、无法一次性展示时，将内容切分为多页并提供页间导航。它解决三类核心问题：

- 让用户感知数据规模（总条数 / 总页数）与当前所处位置；
- 提供高效的页间跳转（上一页 / 下一页 / 直接点击页码 / 输入跳页）；
- 控制每页展示密度（每页条数切换 pageSize）。

典型场景：表格底部分页、列表分页、搜索结果分页、卡片流分页。

形态分三类：
- **default（完整模式）**：页码按钮 + 上/下一页 + 省略号折叠，适合桌面端宽容器；
- **small（紧凑模式）**：按钮尺寸与间距收紧，省略号阈值更激进，用于密集表格；
- **simple（简洁模式）**：仅 `上一页 / 当前页 / 总页数 / 下一页`，并以 "第 X / Y 页" 文案为主，适合移动端与窄容器，**total 文案是该模式的核心信息载体，i18n 权重最高**。

附加能力：跳页输入框（`showQuickJumper`）、每页条数选择（`showSizeChanger`）、总数展示（`showTotal`）。Pagination 本身不持有数据，只负责发出页变化意图，数据切片由调用方完成。

边界与非目标：不内置数据请求/缓存；不内置无限滚动（属 InfiniteScroll 组件）；超大页数（如百万级页码）依赖省略号 + 跳页，不渲染全部页码。

## 2. 设计语义

- **当前页（active）**：使用 `--cd-color-primary` 实底/描边强调，承载 `aria-current="page"`，是视觉与语义的唯一焦点。
- **可点击页码（rest）**：文本色 `--cd-color-text-0`，hover 提升至 `--cd-color-fill-0` 背景，体现可操作性。
- **禁用边界（disabled）**：首页时"上一页"、末页时"下一页"降为 `--cd-color-text-2` 且不可聚焦激活，但保留占位避免布局抖动。
- **省略号（ellipsis / jumper）**：静态展示 `…`；hover 时可变为快进/快退（`«/»` 跳 5 页）以暗示批量跳转能力。
- **节奏**：页码项尺寸随 size 三档（small 24 / default 32 / large 40，单位 px），item 间距用 token 控制，保证点击热区 ≥ 24×24（small 例外说明见 a11y）。
- **simple 模式语义**：弱化"页码网格"概念，强化"位置/总量"文本，留白更多，移动端单手可达。
- **对齐**：分页项基线对齐，showTotal 与 sizeChanger 与页码区垂直居中。
- 所有颜色、间距、圆角只消费 Alias / Component token，禁止字面量。

## 3. 分层实现

Pagination 含分页算法、键盘导航、跳页解析、a11y 通告，属"有交互逻辑"组件，采用 core + svelte 分层。

**@chenzy-design/core · `createPagination`**
- 输入归一化：`total / pageSize / currentPage` → 计算 `pageCount = max(1, ceil(total/pageSize))`，钳制 currentPage ∈ [1, pageCount]。
- 页码序列生成：基于 `siblingCount` / `boundaryCount` 计算可见页码与省略号占位（产出 `(number | 'ellipsis-prev' | 'ellipsis-next')[]`），simple 模式跳过序列只输出位置信息。
- 受控/非受控：支持 `currentPage`(受控) 与 `defaultCurrentPage`(非受控)，内部 state 经 `useId` 关联跳页输入与 label。
- 复用原语：
  - `useRovingTabindex`：页码列表 roving，方向键在页码项间移动焦点，仅 active/聚焦项 tabindex=0。
  - `useLiveAnnouncer`：页码或 pageSize 变更时通告"第 X 页，共 Y 页 / 已显示第 A-B 条，共 N 条"。
  - `useId`：跳页输入、sizeChanger、showTotal 的 label 关联。
- 输出 actions/getters：`getRootProps / getItemProps(page) / getPrevProps / getNextProps / getJumperProps / setPage / next / prev / setPageSize`。
- 跳页解析：解析输入（去空格、非数字过滤、钳制范围），回车或 blur 提交。
- 不依赖：`useFocusTrap / useScrollLock / useDismiss`（无浮层，sizeChanger 弹层由内部 Select 自带，不在本 core 内重复实现）。

**@chenzy-design/svelte · `Pagination.svelte`**
- 消费 core 的 props getter 渲染 `<nav>` + `<ul>/<li>`；sizeChanger 内部复用 `Select` 组件，jumper 复用 `InputNumber`。
- 透传 size/status，绑定 CSS 变量与 BEM 类，处理 simple 分支渲染。
- SSR 友好：序列计算纯函数，无 window 依赖；reduced-motion 下移除 hover/active 过渡。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `total` | `number` | `0` | 数据总条数（驱动 pageCount 计算）。 |
| `currentPage` | `number` | — | 当前页码（受控）；与 `on:change` 配合。 |
| `defaultCurrentPage` | `number` | `1` | 默认页码（非受控）。 |
| `pageSize` | `number` | — | 每页条数（受控）。 |
| `defaultPageSize` | `number` | `10` | 默认每页条数（非受控）。 |
| `pageSizeOpts` | `number[]` | `[10, 20, 50, 100]` | 每页条数可选项。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸档位。 |
| `mode` | `'default' \| 'simple'` | `'default'` | 形态：完整 / 简洁。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 跳页输入校验态（如越界输入提示）。 |
| `showSizeChanger` | `boolean` | `false` | 是否展示每页条数选择器。 |
| `showQuickJumper` | `boolean` | `false` | 是否展示跳页输入框。 |
| `showTotal` | `boolean \| ((total, range) => string)` | `false` | 是否/如何展示总数文案。 |
| `hideOnSinglePage` | `boolean` | `false` | 仅一页时是否隐藏整个分页器。 |
| `siblingCount` | `number` | `1` | 当前页两侧保留的页码数。 |
| `boundaryCount` | `number` | `1` | 首尾固定显示的页码数。 |
| `disabled` | `boolean` | `false` | 整体禁用。 |
| `popoverPosition` | `'top' \| 'bottom'` | `'bottom'` | sizeChanger 弹层位置（透传 Select）。 |

### Events

| 名称 | payload | 说明 |
|---|---|---|
| `on:change` | `{ currentPage: number, pageSize: number }` | 页码或每页条数变化（统一出口，便于一次性触发数据请求）。 |
| `on:pageChange` | `number` | 仅页码变化时触发（细粒度）。 |
| `on:pageSizeChange` | `number` | 仅每页条数变化时触发；变更后内部会重算并可能回退 currentPage。 |
| `on:jump` | `{ value: number, valid: boolean }` | 跳页输入提交，valid=false 表示越界被钳制。 |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `total` | `{ total, range: [start, end] }` | 自定义总数文案区（覆盖 showTotal 默认渲染）。 |
| `prev` | `{ disabled }` | 自定义"上一页"内容（图标/文案）。 |
| `next` | `{ disabled }` | 自定义"下一页"内容。 |
| `item` | `{ page, active }` | 自定义单个页码渲染。 |
| `jumper` | `{ value, jump }` | 自定义跳页区。 |

## 5. 主题 / Token 表

组件级 token 一律回退到 Alias，禁止字面量。

| Component Token | 回退 Alias | 用途 |
|---|---|---|
| `--cd-pagination-item-size` | `32px`（default 档；small `24px` / large `40px`） | 页码项宽高（最小热区） |
| `--cd-pagination-item-gap` | `--cd-spacing-2` | 页码项间距 |
| `--cd-pagination-item-radius` | `--cd-radius-medium` | 页码项圆角 |
| `--cd-pagination-item-color` | `--cd-color-text-0` | 普通页码文本色 |
| `--cd-pagination-item-color-hover` | `--cd-color-text-0` | hover 文本色 |
| `--cd-pagination-item-bg-hover` | `--cd-color-fill-0` | hover 背景 |
| `--cd-pagination-item-bg-active` | `--cd-color-primary` | 当前页背景 |
| `--cd-pagination-item-color-active` | `--cd-color-bg-0` | 当前页文本色（保证与 primary 对比） |
| `--cd-pagination-item-color-disabled` | `--cd-color-text-2` | 禁用/边界态文本色 |
| `--cd-pagination-ellipsis-color` | `--cd-color-text-2` | 省略号色 |
| `--cd-pagination-total-color` | `--cd-color-text-1` | showTotal 文案色 |
| `--cd-pagination-jumper-width` | `50px` | 跳页输入框宽度 |
| `--cd-pagination-item-color-jump-active` | `--cd-color-primary` | 快进/快退 hover 高亮 |
| `--cd-pagination-focus-ring` | `--cd-color-primary` | 焦点环颜色（外描边） |

暗色主题：仅切换 Alias 层（`--cd-color-*` 暗色集），组件层零改动。对比度见第 6 节。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG 无专用 pagination 模式，采用导航地标 + 链接/按钮语义。

**结构与 role**
- 根容器 `<nav role="navigation" aria-label={i18n('Pagination.ariaLabel')}>`（默认"分页导航"），避免多个分页器地标重名时补充上下文 label。
- 页码列表 `<ul>`，每项 `<li>`；页码项为 `<button>`（非链接路由场景）或 `<a>`（带 href 时），当前页加 `aria-current="page"`。
- "上一页/下一页"用 `<button>`，分别 `aria-label="Pagination.prevAria" / "Pagination.nextAria"`，边界态加 `aria-disabled="true"` + `disabled`。
- 省略号项 `aria-hidden="true"`；当其承担快进/快退交互时，改为 `<button aria-label="Pagination.jumpNextAria">`。
- 跳页输入 `<input type="text" inputmode="numeric">` 关联 `<label>`（`useId`），sizeChanger 复用 Select 自带 a11y。

**键盘交互**
| 按键 | 行为 |
|---|---|
| `Tab` | 进入分页器，焦点落在 roving 当前项（active 页码）。 |
| `←/→` | 在页码项之间移动焦点（roving，不立即翻页）。 |
| `Home / End` | 焦点移到第一/最后一个可见页码项。 |
| `Enter / Space` | 激活当前聚焦项（翻页 / 触发快进快退）。 |
| 跳页框内 `Enter` | 提交跳页。 |

**焦点管理**
- 翻页后焦点保留在被激活的页码项；若该项因序列重排消失（如跳到末页），焦点回退到新 active 项。
- 不使用 focus trap（非浮层）。

**通告（useLiveAnnouncer，polite）**
- 翻页："第 X 页，共 Y 页"；
- 启用 showTotal 时附带"显示第 A-B 条，共 N 条"；
- pageSize 变更："每页 N 条，第 X 页"。

**对比度 / 动效 / RTL**
- active 项 `--cd-color-bg-0` on `--cd-color-primary` 需 ≥ 4.5:1（正文）；禁用态 text-2 仅作非必要信息，配 `aria-disabled` 不靠颜色单独传达状态。
- 焦点环对比度 ≥ 3:1（对相邻色）。
- `prefers-reduced-motion: reduce` 时移除 hover/active 过渡与快进图标变换动画。
- RTL：页码顺序与"上一页/下一页"图标方向整体镜像（`«`↔`»`），←/→ 键义随书写方向反转。
- small 档 24px 低于 24×24 目标，需在文档标注：仅在信息密集场景使用，且 hover/focus 区域可扩展 padding 至 ≥24px 命中区。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；total 文案为 simple 模式核心，需支持复数与变量插值。日期无关，数字用 `Intl.NumberFormat` 本地化（千分位）。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `Pagination.ariaLabel` | 分页导航 | nav 地标 label |
| `Pagination.prev` | 上一页 | 上一页文案/aria |
| `Pagination.next` | 下一页 | 下一页文案/aria |
| `Pagination.prevAria` | 上一页 | 屏幕阅读器专用 |
| `Pagination.nextAria` | 下一页 | 屏幕阅读器专用 |
| `Pagination.page` | 第 {page} 页 | 页码项 aria-label |
| `Pagination.currentPageAria` | 第 {page} 页，共 {count} 页 | 当前页通告 |
| `Pagination.jumpNextAria` | 向后 5 页 | 快进 aria |
| `Pagination.jumpPrevAria` | 向前 5 页 | 快退 aria |
| `Pagination.total` | 共 {total} 条 | showTotal 默认文案（数字经 Intl 格式化） |
| `Pagination.totalRange` | 第 {start}-{end} 条 / 共 {total} 条 | showTotal range 形式 |
| `Pagination.simpleTotal` | 第 {current} / {count} 页 | **simple 模式核心位置文案** |
| `Pagination.quickJumperLabel` | 跳至 | 跳页输入前缀/label |
| `Pagination.quickJumperSuffix` | 页 | 跳页输入后缀 |
| `Pagination.pageSizeLabel` | 每页条数 | sizeChanger label |
| `Pagination.pageSizeOption` | {size} 条/页 | sizeChanger 选项 |
| `Pagination.outOfRange` | 页码超出范围 | 跳页越界提示（status=error） |

- 复数：`total / simpleTotal` 通过 ICU/复数规则适配 en（"{total, plural, one {# item} other {# items}}"）。
- RTL 语言的范围连字符与变量顺序由翻译资源决定，不在代码中拼接。

## 8. 文案

遵循 content-guidelines：

- 简短、动作明确："上一页/下一页"用动作短语，不用"前进/后退"等歧义词。
- 数字统一经 Intl 格式化（如 `1,234`），避免裸大数。
- simple 模式 `第 X / Y 页` 是信息密度最高处，保持 "当前/总数" 一致语序，禁止省略总数。
- showTotal 范围文案使用 "第 A-B 条 / 共 N 条"，A-B 反映真实切片（末页可能不足 pageSize）。
- 越界跳页提示中性、可纠正："页码超出范围"，不指责用户。

**危险操作文案**：Pagination 不含破坏性/不可逆操作，无需危险态文案；切换 pageSize 不删除数据，仅以通告告知"列表已重新计算，当前回到第 1 页（或保持就近页）"，措辞为提示而非警告。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| core gzip | ≤ 2.0 KB | 纯算法 + 原语引用，无渲染 |
| svelte gzip（不含 Select/InputNumber） | ≤ 3.0 KB | 基础分页渲染 |
| svelte gzip（含 sizeChanger + jumper） | ≤ 3.8 KB | 复用现有 Select/InputNumber，按需引入 |
| 首次渲染（100 页，default） | ≤ 1ms | 省略号折叠后实际 DOM 节点 ≤ ~11 项 |
| 翻页重算 + patch | ≤ 0.5ms | 序列纯函数 memo，仅 diff 变更项 |

性能策略：
- **不渲染全部页码**：恒用省略号折叠，可见项数 = `boundaryCount*2 + siblingCount*2 + active + 2 省略号`，与 total 无关 → 百万页仍 O(1) 节点。
- **序列 memo**：`(total,pageSize,currentPage,siblingCount,boundaryCount)` 不变则复用上次序列，避免无谓重算。
- **无需虚拟化**：折叠机制已使 DOM 恒定，不引入虚拟列表。
- **惰性子组件**：sizeChanger/jumper 仅在对应 prop 开启时引入与渲染（动态 import 友好），关闭时零成本。
- **无 destroyOnClose 概念**（无浮层主体）；sizeChanger 弹层销毁策略由内部 Select 负责。
- simple 模式渲染节点最少（≤6），移动端首选。

## 10. AI 元数据

提供 `component.meta.ts`，供 AI / 低代码消费：

- `name: 'Pagination'`，`category: 'navigation'`，`stage: 'M3'`，`semiEquivalent: 'Pagination'`。
- `tags: ['分页','pagination','翻页','跳页','pageSize','simple']`。
- `props` 反射上表（类型、默认、枚举值、是否受控、a11y 影响）。
- `events`：change / pageChange / pageSizeChange / jump 的 payload schema。
- `slots`：total/prev/next/item/jumper 及作用域参数。
- `i18nKeys`：全部 `Pagination.*` key 与默认值，标注 `simpleTotal/total` 为高频可定制项。
- `recipes`：常见组合（表格底部 default+showTotal+showSizeChanger；移动端 simple；搜索结果 default+showQuickJumper）。
- `a11y`：role/aria/键盘映射摘要，供 AI 生成无障碍正确的用法。
- `antiPatterns`：勿用 Pagination 实现无限滚动；勿在 total 未知时硬填 0 导致 pageCount 误算。

## 11. 测试

**core 单测（@chenzy-design/core）**
- pageCount 计算：total=0 → 1 页；非整除向上取整；total<pageSize。
- currentPage 钳制：越界（<1 / >pageCount）被钳制。
- 序列生成：siblingCount/boundaryCount 各组合下省略号位置正确；首/中/尾三态；小页数不出省略号。
- 跳页解析：非数字过滤、空输入、越界钳制、合法提交。
- pageSize 变更后 currentPage 重算（就近/回 1 策略）。
- 受控 vs 非受控行为隔离。

**svelte 组件测试**
- 渲染快照：default / small / large / simple 四态。
- 交互：点击页码 / 上下一页 / 边界禁用不触发 / 跳页回车 / sizeChanger 切换。
- 事件 payload：change 统一出口、细粒度事件触发次数正确。
- slot 覆盖：total/item/jumper 自定义生效。

**a11y 测试（axe + 键盘）**
- nav 地标与 aria-label；active 项 aria-current；边界 aria-disabled。
- roving tabindex：Tab 落点、←/→/Home/End 焦点流。
- LiveAnnouncer：翻页 / pageSize 变更通告文本正确。
- 对比度断言（active/disabled/focus ring）。

**i18n 测试**
- zh/en 切换文案；复数规则（en items 单复数）；Intl 千分位；simple total 插值；越界提示。
- RTL 镜像：顺序与 prev/next 图标方向、←/→ 键义反转。

**视觉回归**：四档尺寸 × 三态（normal/hover/active）× LTR/RTL × light/dark 快照。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/core`（`createPagination`）与 `@chenzy-design/svelte` 分层落地，纯算法在 core。
- [ ] 复用原语：useRovingTabindex / useLiveAnnouncer / useId，未重复造轮子。
- [ ] 所有样式仅消费 `--cd-` Alias/Component token，无字面量颜色/间距硬编码。
- [ ] 类名 BEM-like：`cd-pagination` / `cd-pagination__item` / `cd-pagination--simple` 等。
- [ ] API 遵循约定：受控 `currentPage/pageSize`，统一 `on:change`，size 三档，status 三态。
- [ ] 省略号折叠：可见节点数与 total 解耦，百万页 O(1) DOM。
- [ ] simple 模式 total 文案完整（current/count），且 i18n 可定制。
- [ ] a11y：nav 地标 + aria-current + roving + 键盘（←/→/Home/End/Enter）+ aria-disabled 边界，axe 0 violations。
- [ ] LiveAnnouncer 在翻页与 pageSize 变更时正确通告。
- [ ] i18n：零硬编码，全部 `Pagination.*` key 落地；数字经 Intl；en 复数正确。
- [ ] RTL 与 dark 主题正确镜像/换色，reduced-motion 关闭过渡。
- [ ] Perf Budget 达标：core ≤2KB、基础 svelte ≤3KB gzip；翻页重算 ≤0.5ms。
- [ ] sizeChanger / jumper 惰性引入，关闭时零成本。
- [ ] `hideOnSinglePage`、`disabled` 行为正确。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/i18nKeys/recipes/a11y/antiPatterns。
- [ ] 单测 / 组件 / a11y / i18n / 视觉回归全部通过。
