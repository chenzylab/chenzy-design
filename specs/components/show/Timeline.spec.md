# SPEC · Timeline
> 分类：show · 阶段：M4
> 对标 Semi：Timeline

## 1. 概述

Timeline（时间轴）用于按时间顺序、流程顺序或步骤顺序，垂直/水平地展示一组有序事件。每个事件由轴线、节点（dot）、时间标签与内容构成。典型场景：操作日志、订单物流轨迹、版本变更记录、审批流程、活动里程碑。

核心能力：
- 节点状态语义：default / ongoing（进行中）/ success / warning / error，映射到节点颜色与图标。
- 自定义节点：通过 `dot` slot / prop 替换默认圆点（如头像、序号、图标）。
- 交替布局（alternate）：内容左右交替分布于轴线两侧，适合时间轴展示。
- 左/右对齐（left / right）：内容固定在轴线一侧。
- 水平模式（horizontal）：节点沿横向排列，适合步骤/进度可视化。
- 数据驱动（`dataSource`）或声明式子组件（`Timeline.Item`）两种用法。

与 Steps 的区别：Timeline 强调"时间/事件流水线"，节点数量动态、内容长度不一、可无限追加；Steps 强调"固定步骤的当前进度"。与 List 的区别：Timeline 强制带连续轴线与节点视觉。

非目标：不内置分页/虚拟滚动开关默认开启（超长列表由使用方包裹虚拟列表或开启 `virtualized`），不内置数据请求。

## 2. 设计语义

- 轴线（tail）：1px 连续竖线/横线，使用 `--cd-color-border`，连接相邻节点，首节点上方与末节点下方不绘制（或绘制半段，由 mode 决定）。
- 节点（dot）：默认外径 12px 实心圆，环宽 2px。状态色：
  - default → `--cd-color-border` 强调态 / 文本中性
  - ongoing → `--cd-color-primary`（常配合 spin 动效）
  - success → 成功色
  - warning → `--cd-color-warning`
  - error → `--cd-color-danger`
- 节点与轴线对齐：节点圆心落在轴线上；自定义 dot（如图标 16px / 头像 24px）时轴线居中穿过其几何中心。
- 间距：节点垂直节奏（item gap）默认 `--cd-spacing-loose`（约 20px），内容与节点水平间隙 12px；时间标签（time）与正文之间 4px。
- 内容层级：time 使用 `--cd-color-text-2`（次要），title 使用 `--cd-color-text-0`，正文 `--cd-color-text-1`。
- alternate 模式：奇偶项分列轴线两侧，轴线居中；time 可置于内容对侧。
- 动效：ongoing 节点呼吸/旋转动画时长 ≤ 1.4s 循环；reduced-motion 下停用动画，仅保留静态主色。
- 状态优先于颜色：所有状态同时通过图标 + 文本（aria）传达，不单靠颜色（满足色盲可达）。

## 3. 分层实现

Timeline 以展示为主，但"交替布局测量、水平滚动定位、可选虚拟化、节点焦点漫游（当 item 可点击/可展开时）"含交互逻辑，故采用轻量分层：

- `@chenzy-design/core` — `createTimeline(options)`：
  - 规整化数据：将 `dataSource` 或声明式 items 归并为统一内部模型（id、status、dot、time、payload、position）。
  - 计算每个 item 的布局位置（alternate 下的 left/right 归属、水平模式下的索引）。
  - 复用原语：`useId`（生成 item id 与 aria 关联）；`useRovingTabindex`（当 `interactive`/可点击项启用，方向键在节点间移动焦点，横向模式用 Left/Right，纵向用 Up/Down）；`useLiveAnnouncer`（追加新事件时对屏幕阅读器播报，如实时日志流）。
  - 不依赖 useFocusTrap/useScrollLock/useDismiss（无浮层、无锁滚动）；ResizeObserver 封装用于 horizontal 模式溢出检测（轻量内置，非原语）。
- `@chenzy-design/svelte` — `Timeline` + `Timeline.Item`：
  - 渲染轴线、节点、内容；消费 core 输出的归一模型与 roving 状态。
  - 纯静态、不可交互（无 onItemClick、无虚拟化）时可绕过 core 的 roving 部分，core 退化为纯数据归一函数，渲染零运行时交互开销。

设计原则：默认零交互即"几乎纯展示"；仅在开启交互能力时引入键盘/焦点逻辑。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `mode` | `'left' \| 'right' \| 'alternate' \| 'center'` | `'left'` | 内容相对轴线的对齐/分布方式；`alternate` 左右交替，`center` 居中两侧。 |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 时间轴方向。 |
| `dataSource` | `TimelineItemData[]` | `[]` | 数据驱动用法；与声明式 `Timeline.Item` 二选一，二者并存时声明式优先。 |
| `reverse` | `boolean` | `false` | 是否倒序渲染（最新在顶部）。 |
| `pending` | `boolean \| string \| Snippet` | `false` | 末尾追加"进行中/加载中"幽灵节点；为 string/snippet 时作为其内容。 |
| `pendingDot` | `Snippet` | — | 自定义 pending 节点的 dot。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 控制节点尺寸与节奏间距。 |
| `interactive` | `boolean` | `false` | 启用键盘漫游与节点聚焦/点击（开启后注入 a11y 交互逻辑）。 |
| `virtualized` | `boolean \| { itemHeight: number; height: number }` | `false` | 超长列表虚拟化（仅 vertical 支持）。 |
| `lineStyle` | `'solid' \| 'dashed'` | `'solid'` | 轴线样式。 |
| `class` | `string` | — | 根节点自定义类名。 |

`TimelineItemData` / `Timeline.Item` Props：

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `string \| number` | 自动生成 | 唯一键，用于 `{#each}` key 与 aria 关联。 |
| `status` | `'default' \| 'ongoing' \| 'success' \| 'warning' \| 'error'` | `'default'` | 节点语义状态（决定色/默认图标）。 |
| `color` | `string` | — | 覆盖节点颜色（须传 token 引用，如 `var(--cd-color-primary)`，禁写死十六进制）。 |
| `time` | `string \| Date` | — | 时间标签；`Date` 经 `Intl.DateTimeFormat` 格式化。 |
| `title` | `string \| Snippet` | — | 节点标题。 |
| `dot` | `Snippet` | — | 自定义节点（图标/头像/序号），覆盖默认圆点。 |
| `position` | `'left' \| 'right'` | — | 在 `alternate`/`center` 下强制该项所在侧，覆盖自动交替。 |
| `clickable` | `boolean` | 继承 `interactive` | 该项是否可聚焦/点击。 |

### Events

| 事件 | 载荷 (`event.detail`) | 触发时机 |
|---|---|---|
| `on:itemClick` | `{ id: string \| number; index: number; data: TimelineItemData; nativeEvent: MouseEvent \| KeyboardEvent }` | `interactive`/`clickable` 项被点击或在聚焦时按 Enter/Space。 |
| `on:itemFocus` | `{ id; index }` | 节点通过键盘漫游或 Tab 获得焦点。 |
| `on:reachEnd` | `{ }` | 虚拟化模式滚动到末尾（用于无限追加/加载更多）。 |

说明：Timeline 无受控显隐，故不涉及 `value/on:change`、`open/on:openChange`；保持事件命名小驼峰、与库一致性约定（输出动作语义）一致。

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 放置 `Timeline.Item` 子组件（声明式用法）。 |
| `dot` (Item) | `{ status; index }` | 覆盖单个节点视觉。 |
| `content` (Item) | `{ data; index }` | 自定义项正文（标题之外的富内容）。 |
| `pending` | — | 自定义末尾进行中节点的内容。 |
| `pendingDot` | — | 自定义末尾进行中节点的 dot（如旋转 spinner）。 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component token，禁止写死值。Component token 默认值引用 Alias。

| Component Token | 默认引用 (Alias/Global) | 用途 |
|---|---|---|
| `--cd-timeline-tail-color` | `--cd-color-border` | 轴线颜色 |
| `--cd-timeline-tail-width` | `1px` (Global `--cd-border-width-1`) | 轴线粗细 |
| `--cd-timeline-dot-size` | `12px` | 默认节点直径（default 尺寸） |
| `--cd-timeline-dot-ring-width` | `2px` | 节点环宽 |
| `--cd-timeline-dot-color-default` | `--cd-color-text-2` | default 节点色 |
| `--cd-timeline-dot-color-ongoing` | `--cd-color-primary` | ongoing 节点色 |
| `--cd-timeline-dot-color-success` | `--cd-color-success` | success 节点色 |
| `--cd-timeline-dot-color-warning` | `--cd-color-warning` | warning 节点色 |
| `--cd-timeline-dot-color-error` | `--cd-color-danger` | error 节点色 |
| `--cd-timeline-item-gap` | `--cd-spacing-loose` | 相邻节点间距（节奏） |
| `--cd-timeline-content-gap` | `--cd-spacing-base` | 节点与内容水平间隙 |
| `--cd-timeline-time-color` | `--cd-color-text-2` | 时间标签色 |
| `--cd-timeline-title-color` | `--cd-color-text-0` | 标题色 |
| `--cd-timeline-content-color` | `--cd-color-text-1` | 正文色 |
| `--cd-timeline-item-hover-bg` | `--cd-color-fill-0` | interactive 项 hover 背景 |
| `--cd-timeline-focus-ring` | `--cd-color-primary` | 聚焦描边色 |

尺寸映射：small → dot 8px / gap 紧凑；large → dot 16px。暗色主题通过 Alias 自动切换，组件层无需额外定义。

## 6. 无障碍（WCAG 2.1 AA）

参考 WAI-ARIA APG —— 纯展示时按 list 语义；可交互时按可聚焦列表项处理。

- 角色：根容器 `role="list"`（纯展示）；每个 item `role="listitem"`。`interactive` 时，可点击项加 `role="button"`（或包裹 `<button>`）+ `tabindex`，由 `useRovingTabindex` 管理（聚焦项 `tabindex=0`，其余 `-1`）。
- 状态语义不靠颜色：节点状态附 `aria-label`，i18n key 如 `Timeline.status.error`，并附状态图标（图标 `aria-hidden`，文本由 aria-label 承载）。
- 时间：time 文本用 `<time datetime="ISO">` 元素，`datetime` 为 ISO 8601，可见文本为本地化格式。
- 键盘交互（仅 `interactive`）：
  - vertical：`ArrowUp/ArrowDown` 在节点间移动焦点；`Home/End` 跳首/末。
  - horizontal：`ArrowLeft/ArrowRight`（RTL 下镜像）。
  - `Enter`/`Space`：触发 `itemClick`。
- 焦点管理：聚焦项显示 `--cd-timeline-focus-ring` 描边（≥2px、对比度达标），不依赖 outline:none 后无替代。
- 实时流：pending/追加新事件时经 `useLiveAnnouncer`（`aria-live="polite"`）播报，避免打断。
- 对比度：文本与背景 ≥ 4.5:1；节点状态色与背景 ≥ 3:1（非文本图形）。
- reduced-motion：`prefers-reduced-motion: reduce` 下停用 ongoing 旋转/呼吸动画。
- RTL：`[dir=rtl]` 下 left/right 互换、horizontal 顺序与方向键镜像、轴线侧自动翻转。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n key。
- 日期：`time` 为 `Date` 时用 `Intl.DateTimeFormat(locale, options)`；数字用 `Intl.NumberFormat`。`<time datetime>` 始终输出 ISO（非本地化）。
- i18n key 列表：

| key | 默认（zh-CN / en） | 用途 |
|---|---|---|
| `Timeline.pending` | 进行中… / In progress… | 默认 pending 文案 |
| `Timeline.status.default` | 默认 / Default | 节点状态 aria |
| `Timeline.status.ongoing` | 进行中 / Ongoing | 节点状态 aria |
| `Timeline.status.success` | 成功 / Success | 节点状态 aria |
| `Timeline.status.warning` | 警告 / Warning | 节点状态 aria |
| `Timeline.status.error` | 错误 / Error | 节点状态 aria |
| `Timeline.loadMore` | 加载更多 / Load more | 虚拟化 reachEnd 提示 |
| `Timeline.empty` | 暂无记录 / No records | 空数据占位 |

## 8. 文案

遵循 content-guidelines：
- time 标签简洁，使用本地化相对/绝对时间，不混用格式。
- title 用名词短语或动作过去式（如"提交了订单"），保持事件流的一致时态。
- 状态文案中性、客观，避免主观评价。
- pending 文案表达"持续进行"，用省略号或现在进行时（"同步中…"）。

危险操作文案（单列）：Timeline 本身为展示组件，不发起危险操作；若某 item 的内容内嵌危险动作（如"撤销发布"按钮），该按钮文案须由使用方遵循危险操作规范（明确动词 + 对象 + 后果，如"永久删除该版本"），并使用 `--cd-color-danger`，二次确认由外部 Modal/Popconfirm 承担，Timeline 不内置确认逻辑。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 说明 |
|---|---|
| gzip 体积（svelte 渲染层） | ≤ 5.4 KB |
| gzip 体积（core 归一+roving，按需） | ≤ 1.8 KB（纯展示用法可 tree-shake 掉 roving） |
| 首次渲染（100 项，vertical） | < 16ms（单帧内） |
| 虚拟化（10k 项，`virtualized`） | 仅渲染可视窗口 + overscan，DOM 节点 ≤ 30 |
| alternate 布局测量 | 纯 CSS（flex/grid）实现，避免 JS 测量回流 |
| ongoing 动画 | 仅 CSS transform/opacity（合成层），不触发 layout |

性能策略：
- 默认不虚拟化；`virtualized` 显式开启（仅 vertical），配合 `on:reachEnd` 做无限加载。
- 无 `destroyOnClose` 概念（无浮层）。
- horizontal 溢出用单个 ResizeObserver，不逐项监听。
- 静态用法零运行时 JS（纯 CSS 轴线/节点）。

## 10. AI 元数据

提供 `component.meta.ts`（`Timeline.meta.ts`），供 AI 代码生成与设计工具消费，内容包含：
- `name`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Timeline'`。
- `props`/`events`/`slots` 的机器可读 schema（类型、枚举、默认值、是否必填）。
- `tokens`：组件 token 清单与默认引用（同第 5 节）。
- `a11y`：role 矩阵、键盘映射表、是否复合控件。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：典型用法片段（基础、alternate、自定义 dot、horizontal、pending、虚拟化）。
- `antiPatterns`：如"勿用 Timeline 替代 Steps 表达固定进度"、"勿在 item 内写死颜色"。

## 11. 测试

- 单元（core）：数据归一（dataSource ↔ 声明式合并、reverse、position 自动交替/强制覆盖）；roving tabindex 方向键/Home/End 行为（vertical & horizontal & RTL 镜像）。
- 组件渲染：各 mode（left/right/alternate/center）DOM 结构与轴线侧；各 status 节点色/图标/aria-label；自定义 dot/content slot 生效；pending 节点渲染。
- 交互：`interactive` 下点击与 Enter/Space 触发 `itemClick`、`itemFocus`；虚拟化滚动触发 `reachEnd`，可视 DOM 数量受限。
- a11y：axe 无违规；role=list/listitem；`<time datetime>` 合法 ISO；reduced-motion 媒体查询下无动画类。
- i18n：切换 locale 后 time 经 Intl 正确格式化、状态 aria 文案随之切换；无硬编码字符串扫描通过。
- 视觉回归：四种 mode × 三种 size × 暗色/亮色 × RTL 快照。
- 性能：100 项渲染帧时间、10k 项虚拟化 DOM 节点计数断言。

## 12. 验收标准 Checklist

- [ ] 支持 left / right / alternate / center 四种 mode，且 alternate 纯 CSS 实现无 JS 测量回流。
- [ ] 支持 vertical / horizontal 两个方向，horizontal 溢出处理正确。
- [ ] 支持 dataSource 与声明式 `Timeline.Item` 两种用法，二者并存时声明式优先。
- [ ] 五种 status 节点正确呈现色 + 图标 + aria-label，状态不单靠颜色传达。
- [ ] 自定义 `dot` / `content` slot、`pending` / `pendingDot` 生效。
- [ ] `reverse`、`position` 强制侧、`color`（token 引用）、`lineStyle` 行为正确。
- [ ] `interactive` 下键盘漫游（Arrow/Home/End，RTL 镜像）、焦点环、Enter/Space 触发 `itemClick` 全部可用。
- [ ] `virtualized`（仅 vertical）可视 DOM ≤ 30，`on:reachEnd` 正确触发。
- [ ] 所有可见文案走 i18n key，日期经 Intl 格式化，`<time datetime>` 输出合法 ISO。
- [ ] 组件仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸；暗色主题自动适配。
- [ ] `prefers-reduced-motion` 下停用 ongoing 动画；对比度文本 ≥4.5:1、图形 ≥3:1。
- [ ] 提供 `Timeline.meta.ts`，schema/tokens/a11y/i18nKeys/examples/antiPatterns 完整。
- [ ] 纯展示用法可 tree-shake 掉 core roving 逻辑，gzip 体积达标（svelte ≤5.4KB）。
- [ ] axe a11y 自动化测试 0 违规；单元/组件/视觉回归测试通过。
