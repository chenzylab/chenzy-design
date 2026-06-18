# SPEC · Calendar
> 分类：show · 阶段：M4
> 对标 Semi：Calendar

## 1. 概述

Calendar 是一个面向"事件展示与排程"场景的日历组件，区别于 DatePicker 内嵌的轻量月历选择面板。它以整月、整周、单日为基本视图，将业务事件（会议、日程、值班、假期）按时间轴铺排在网格上，支持跨天事件、全天事件、时间段事件的可视化。

典型使用场景：
- 企业内排班/会议室预订系统的主视图
- SaaS 应用的日程管理（类 Google Calendar / Outlook 日历主面板）
- 数据看板中按日期聚合的事件热区展示

与 DatePicker 的边界划分：DatePicker 解决"选一个日期/范围作为表单值"，Calendar 解决"在时间网格上展示并交互一批事件"。两者底层可共享日期数学工具（`@chenzy-design/core` 的 date 子模块），但 API 与渲染完全独立。

四种视图：
- `month`：6 行 × 7 列日格网格，事件以条目形式叠放，超出显示 "+N more"。
- `week`：7 列时间轴（默认 00:00–24:00），全天事件单独置顶行。
- `day`：单列时间轴，列宽更大，重叠事件按列分组并排。
- `range`（可选）：自定义连续多日时间轴（如 4 日视图）。

核心受控量为当前展示锚点日期（`value`）与视图模式（`mode`），事件数据通过 `events` 传入。

## 2. 设计语义

- **网格优先**：Calendar 的视觉骨架是网格（日格或时间格），所有间距、分隔线、表头吸顶都基于 8px 基线栅格，由 token 控制行高与列宽。
- **当天高亮**：今日（today）使用 `--cd-color-primary` 弱化背景 + 强调日期数字，区别于普通日格。选中日（selected）用边框态而非填充态，避免与 today 混淆。
- **跨视图层级**：表头（星期/日期标尺）固定吸顶；时间刻度列固定吸左（week/day）；事件层在内容滚动区。三层 z-index 由 `--cd-calendar-z-*` 阶梯管理。
- **事件视觉语义**：
  - 时间段事件：实心色块，高度 = 时长，左侧 4px 强调条表示分类色。
  - 全天/跨天事件：圆角胶囊，横跨对应日格。
  - "更多"省略：超出日格容量时折叠为 `+N` 触发器，点击弹出 Popover 列出当日全部。
- **状态语义**：过去日期（past）文字降一级透明度；非本月日期（month 视图溢出格）用 `--cd-color-text-2`；禁用日期（disabledDate 命中）斜纹背景且不可交互。
- **运动**：视图/月份切换为水平/淡入位移（≤200ms），尊重 reduced-motion 时退化为无位移即时切换。

## 3. 分层实现

该组件有复杂的键盘网格导航、焦点管理、跨视图状态与实时公告需求，必须分层。

**`@chenzy-design/core` — `createCalendar`**
- 输出 headless 状态机与可访问性属性：当前锚点日、视图模式、网格矩阵（month: `Date[][]`，week/day: 时间槽 + 事件布局）、focusedDate、selectedDate。
- 事件布局算法（纯函数）：`layoutEvents(events, range, mode)` 计算时间轴事件的重叠分列（lane assignment）与 month 视图的堆叠行 + 溢出计数，与渲染框架无关，便于单测。
- 复用 core 原语：
  - `useRovingTabindex`：网格单元（日格/时间格）的 roving，方向键在二维网格移动焦点。
  - `useId`：生成 grid / columnheader / 事件节点 id，串联 `aria-labelledby` / `aria-describedby`。
  - `useLiveAnnouncer`：切换月份/视图时播报新范围（如 "2026 年 6 月"），方向键移动焦点时播报聚焦日期。
  - `useDismiss`：`+N more` Popover 的外点/Esc 关闭。
  - `useScrollLock`：仅在 `+N more` 以 modal Popover 形式打开时按需启用（默认非模态，不锁）。
- date 数学子模块（`@chenzy-design/core/date`）：`startOfWeek`/`addDays`/`isSameDay`/`getMonthMatrix`，受 `weekStartsOn` 与时区参数驱动，不依赖任何第三方库。

**`@chenzy-design/svelte` — `Calendar.svelte`**
- 消费 `createCalendar` store，渲染表头、网格、时间标尺、事件层、`+N more` Popover。
- 提供 slot 钩子供业务自定义日格/事件渲染。
- 虚拟化接入点（见性能节）：week/day 长事件列表与超大事件量时按视口裁剪。

纯展示降级：若仅需"只读月历缩略图"，可不接 core，但本组件默认全功能，故保留 core。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `Date` | `new Date()` | 当前展示锚点日期（受控）。配合 `on:change`。 |
| `defaultValue` | `Date` | `new Date()` | 非受控初始锚点日期。 |
| `mode` | `'month' \| 'week' \| 'day' \| 'range'` | `'month'` | 视图模式（受控）。配合 `on:modeChange`。 |
| `events` | `CalendarEvent[]` | `[]` | 事件数据。`{ key, start, end, allDay?, title, category?, color?, disabled? }`。 |
| `weekStartsOn` | `0\|1\|2\|3\|4\|5\|6` | 由 locale 决定 | 一周起始日（0=周日）。 |
| `displayValue` | `[Date, Date]` | — | range 模式下显式可视范围。 |
| `dayRange` | `[number, number]` | `[0, 24]` | week/day 时间轴起止小时。 |
| `markWeekend` | `boolean` | `true` | 是否弱化高亮周末列。 |
| `disabledDate` | `(date: Date) => boolean` | — | 禁用某些日期格交互。 |
| `minDate` / `maxDate` | `Date` | — | 可导航边界。 |
| `showCurrentTimeIndicator` | `boolean` | `true` | week/day 显示当前时间红线。 |
| `maxEventsPerDay` | `number` | `3` | month 视图每格最多展示条数，超出折叠为 `+N`。 |
| `scrollToTime` | `Date \| number` | 当前时刻 | week/day 初始滚动定位时刻。 |
| `timeZone` | `string` | 本地时区 | IANA 时区，影响所有日期换算。 |
| `locale` | `string` | 全局 locale | 覆盖语言/区域格式。 |
| `weekendDays` | `number[]` | `[0,6]` | 视为周末的日序。 |
| `loading` | `boolean` | `false` | 数据加载中遮罩。 |
| `virtual` | `boolean` | `false` | 大事件量启用事件层虚拟化。 |
| `class` / `style` | `string` | — | 透传根节点。 |

### Events

| Event | payload | 说明 |
|---|---|---|
| `on:change` | `{ value: Date }` | 锚点日期变化（翻页/跳转/today）。 |
| `on:modeChange` | `{ mode: CalendarMode }` | 视图模式切换。 |
| `on:dateClick` | `{ date: Date, nativeEvent }` | 点击空白日格/时间槽。 |
| `on:dateDblClick` | `{ date: Date }` | 双击空白槽（常用于新建事件入口）。 |
| `on:eventClick` | `{ event: CalendarEvent, nativeEvent }` | 点击事件块。 |
| `on:eventMouseEnter` / `on:eventMouseLeave` | `{ event }` | 事件 hover（用于 tooltip 联动）。 |
| `on:rangeChange` | `{ start: Date, end: Date }` | 可视范围变化（用于按需拉取事件）。 |
| `on:focusDateChange` | `{ date: Date }` | 键盘焦点格变化。 |
| `on:moreClick` | `{ date: Date, events: CalendarEvent[] }` | 点击 `+N more`。 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `header` | `{ value, mode, goPrev, goNext, goToday, setMode }` | 自定义顶部工具栏（替换默认导航 + 视图切换）。 |
| `dateCell` | `{ date, events, isToday, isOutside, disabled }` | 自定义 month 日格内容。 |
| `dateLabel` | `{ date, isToday }` | 仅自定义日格内的日期数字。 |
| `event` | `{ event, mode }` | 自定义事件块渲染。 |
| `timeGutter` | `{ hour, label }` | 自定义 week/day 左侧时间刻度。 |
| `allDayHeader` | `{ date, events }` | 自定义全天事件行。 |
| `more` | `{ date, count, events }` | 自定义 `+N more` 触发器。 |
| `empty` | — | 无事件占位（可选）。 |

## 5. 主题 / Token

组件仅消费 Alias/Component token，无写死值。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| `--cd-calendar-bg` | `--cd-color-bg-0` | 日历背景 |
| `--cd-calendar-border` | `--cd-color-border` | 网格分隔线 |
| `--cd-calendar-header-bg` | `--cd-color-bg-1` | 表头吸顶背景 |
| `--cd-calendar-text` | `--cd-color-text-0` | 主文字（日期数字） |
| `--cd-calendar-text-secondary` | `--cd-color-text-2` | 非本月/过去日期 |
| `--cd-calendar-today-bg` | `color-mix(--cd-color-primary 10%)` 经 Alias `--cd-color-primary-light-default` | 今日格背景 |
| `--cd-calendar-today-fg` | `--cd-color-primary` | 今日日期数字 |
| `--cd-calendar-selected-border` | `--cd-color-primary` | 选中日边框 |
| `--cd-calendar-weekend-bg` | `--cd-color-bg-1` | 周末列弱背景 |
| `--cd-calendar-event-default-bg` | `--cd-color-primary` | 默认事件块底色 |
| `--cd-calendar-event-fg` | `--cd-color-bg-0` | 事件块文字（反白） |
| `--cd-calendar-now-line` | `--cd-color-danger` | 当前时间红线 |
| `--cd-calendar-disabled-bg` | `--cd-color-fill-0` | 禁用日斜纹底 |
| `--cd-calendar-cell-min-h` | `96px`（应来自 Global spacing token `--cd-spacing-cell-*`） | month 日格最小高度 |
| `--cd-calendar-slot-h` | `48px`（Global） | week/day 单位小时高度 |
| `--cd-calendar-z-header` / `--cd-calendar-z-gutter` / `--cd-calendar-z-now` | 阶梯值 | 吸顶层级 |

暗色模式：所有引用均经 Alias 解析，切换 `data-theme="dark"` 时自动跟随，无需组件改动。事件分类色 `event.color` 由业务传入时需自检对比度（见 a11y）。

## 6. 无障碍

遵循 WAI-ARIA APG Grid 模式（日历网格按 `role="grid"` 实现）。

- **结构 role**：
  - month 网格根 `role="grid"`，`aria-labelledby` 指向月份标题；行 `role="row"`；表头星期 `role="columnheader"`；日格 `role="gridcell"`。
  - week/day 时间轴同样用 grid，时间刻度列 `role="rowheader"`。
  - 事件块 `role="button"`（可点击）或链接，`aria-label` 含标题+时间范围，`aria-describedby` 指向分类。
- **键盘交互**（roving tabindex，网格仅一个 Tab 停靠点）：
  - 方向键：上下移动跨周/跨小时，左右移动跨日/相邻槽。
  - `Home`/`End`：本周首/末日；`PageUp`/`PageDown`：上/下月；`Shift+PageUp/Down`：上/下年（month）。
  - `Enter`/`Space`：触发聚焦日格的 `dateClick`；聚焦事件时触发 `eventClick`。
  - `Esc`：关闭 `+N more` Popover 并回焦触发器。
  - 工具栏 `Tab` 顺序：上一页 / 今天 / 下一页 / 视图切换组（视图组用 `role="tablist"` 或 radiogroup）。
- **焦点管理**：翻页/切视图后焦点保留在等价单元（同 weekday 列对应日），无可对应时落到首日；`+N more` 用 `useDismiss`，关闭回焦。
- **实时公告**：`useLiveAnnouncer` 在范围变化时 polite 播报新范围标题；焦点移动播报完整可读日期（`Intl.DateTimeFormat` 长格式）。
- **对比度**：默认事件块文字/底色 ≥ 4.5:1；业务传 `event.color` 时运行时计算对比度，不足则自动切换文字明暗（black/white）以满足 AA。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用切换位移动画。
- **RTL**：`dir="rtl"` 下列序与方向键左右语义镜像；时间刻度列吸右；事件块强调条改右侧。

## 7. 国际化

- 所有用户可见文案零硬编码，走 i18n（key 前缀 `Calendar.`）。
- 日期/时间/月份/星期名一律用 `Intl.DateTimeFormat`，按 `locale` + `timeZone` 渲染；不自带语言包硬表。
- `weekStartsOn` 默认从 locale 推导（`Intl.Locale().weekInfo`，缺失时降级周一/周日规则）。
- 数字（`+N more` 的 N、年份）用 `Intl.NumberFormat`。

| i18n key | 默认（en） | 说明 |
|---|---|---|
| `Calendar.today` | "Today" | 回到今天按钮 |
| `Calendar.prev` | "Previous" | 上一页（aria-label） |
| `Calendar.next` | "Next" | 下一页（aria-label） |
| `Calendar.modeMonth` | "Month" | 视图切换 |
| `Calendar.modeWeek` | "Week" | 视图切换 |
| `Calendar.modeDay` | "Day" | 视图切换 |
| `Calendar.allDay` | "All day" | 全天事件行标题 |
| `Calendar.moreCount` | "+{count} more" | 溢出折叠（带参数复数） |
| `Calendar.morePopoverTitle` | "Events on {date}" | `+N` 弹层标题 |
| `Calendar.weekNumber` | "Wk {n}" | 周序号（可选列） |
| `Calendar.noEvents` | "No events" | 空态 |
| `Calendar.loading` | "Loading events…" | 加载态（aria） |
| `Calendar.eventTimeRange` | "{start} – {end}" | 事件 aria 时间范围 |
| `Calendar.gridLabel` | "Calendar, {range}" | grid 的 aria-label |

复数处理通过 `Intl.PluralRules` 区分 `moreCount` 的单复数。

## 8. 文案

遵循 content-guidelines：

- 按钮用动词或明确名词："Today" 而非 "Now"；视图切换用名词 "Month/Week/Day"。
- 句末省略号仅用于进行态（"Loading events…"）。
- 时间范围用 en-dash（–）连接，左右留空格。
- 空态友好中性："No events" 不加感叹号；可由业务通过 `empty` slot 增强引导（如 "Click a day to add an event"）。
- `+N more` 简洁不堆叠形容词。

**危险操作文案（单列）**：Calendar 本身不内置删除/不可逆操作。当业务在 `event` slot 或 `eventClick` 后接入删除时，删除确认文案不应由 Calendar 承担，须由业务用 Popconfirm/Modal 实现，并遵循危险文案规范：明确对象与后果（"Delete event "{title}"? This can't be undone."），主操作按钮用具体动词 "Delete"（danger 态），次按钮 "Cancel"。Calendar SPEC 仅声明边界，不提供内置危险文案 key。

## 9. 性能

| 项目 | 预算 / 目标 |
|---|---|
| gzip 体积（svelte 层） | ≤ 9 KB |
| gzip 体积（core `createCalendar` + date） | ≤ 6 KB |
| 首次渲染 month（≤200 事件） | ≤ 16ms（一帧内） |
| 翻月重渲染 | ≤ 1 帧；网格矩阵 memo 复用 |
| week/day 含 1000 事件 | 启用 `virtual` 后可见区 DOM ≤ 视口槽数 × lanes，滚动 60fps |
| 事件布局算法 `layoutEvents` | O(n log n)（按 start 排序后扫描分列） |
| `+N more` Popover | `destroyOnClose`，弹层内容惰性渲染 |

策略：
- 网格矩阵与 `layoutEvents` 结果按 `[range, events 引用]` memo，事件引用不变则跳过重算。
- week/day 时间轴超长（自定义 0–24 全展开）或事件量大时启用 `virtual`，仅渲染视口 ± 缓冲的小时槽与命中事件。
- month 视图通过 `maxEventsPerDay` 限制每格 DOM，溢出折叠，避免单格无界增长。
- 当前时间红线用单独 rAF 节流更新（每分钟），不触发全网格重渲。
- `destroyOnClose` 默认对 `+N more` Popover 生效；`loading` 遮罩与空态轻量。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Calendar'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Calendar'`。
- props/events/slots 的机器可读 schema（类型、默认、枚举、是否受控）。
- `controlledPairs`: `[{ value, event: 'change' }, { value: 'mode', event: 'modeChange' }]`。
- `a11yPattern: 'grid'`、`apgRef: 'grid'`。
- `coreFactory: 'createCalendar'`、`primitives: ['useRovingTabindex','useId','useLiveAnnouncer','useDismiss','useScrollLock']`。
- `i18nKeys`: 上表全部 key。
- `tokens`: 第 5 节 Component token 清单。
- `usageHints`: "事件展示用 Calendar；表单选日期用 DatePicker"；"大事件量开启 virtual"；"按 rangeChange 懒加载事件"。
- `examples`: month/week/day 各一最小可运行片段（供 AI 生成参考）。

## 11. 测试

- **单元（core）**：
  - `getMonthMatrix` / `startOfWeek` / `addDays` 在不同 `weekStartsOn`、跨月/跨年、闰年、DST 切换日的正确性。
  - `layoutEvents`：重叠分列、跨天事件切割、全天 vs 时间段分流、溢出计数。
  - `timeZone` 换算：同一 UTC 事件在不同时区落格正确。
- **组件（svelte + Testing Library）**：
  - 受控 `value`/`mode` 与对应 event 触发。
  - month 溢出折叠 → `+N more` → Popover 列全量 → Esc 回焦。
  - 翻月/切视图后焦点保留逻辑。
  - slot 覆盖渲染（dateCell/event/header）。
- **a11y**：jest-axe 零违规；键盘网格导航（方向键/Home/End/PageUp/Down）逐项断言；roving tabindex 单停靠点；公告内容断言（mock liveAnnouncer）；对比度自动反白逻辑（业务色注入）。
- **i18n**：切换 locale 后星期名/月份/复数 `+N more` 正确；RTL 镜像快照。
- **视觉回归**：month/week/day × light/dark × LTR/RTL 截图。
- **性能**：1000 事件 week 视图开/关 `virtual` 的 DOM 节点数与帧时基准。

## 12. 验收标准 Checklist

- [ ] 三视图（month/week/day）均可渲染，`mode`/`value` 受控且各自 event 正确触发。
- [ ] 事件布局正确：重叠分列、跨天、全天、溢出 `+N more` 折叠与弹层。
- [ ] today / selected / past / outside / disabled / weekend 视觉态齐全且取自 token。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸；暗色自动跟随。
- [ ] 类名 `cd-calendar` BEM 规范；API 命名符合全局约定（`value`+`change`、`open`+`openChange` 用于内部 Popover、size/status 不适用则不强加）。
- [ ] WAI-ARIA grid 模式：role/aria 完整，键盘导航全覆盖，roving 单 Tab 停靠点。
- [ ] 焦点管理：翻页/切视图焦点保留；`+N more` 用 useDismiss 关闭回焦。
- [ ] 实时公告范围与焦点日期；reduced-motion 与 RTL 处理到位。
- [ ] 文案零硬编码，全部 i18n key 落地；日期/数字经 `Intl`，复数经 `PluralRules`。
- [ ] 危险操作边界声明清晰（Calendar 不内置删除文案）。
- [ ] Perf Budget 达标：体积、首屏帧、`virtual` 大事件量 60fps、`destroyOnClose`。
- [ ] headless 逻辑在 core `createCalendar`，复用列出的原语；渲染在 svelte 层。
- [ ] 提供 `component.meta.ts`，字段完整且与实现一致。
- [ ] 单元/组件/a11y/i18n/视觉/性能测试齐全且通过。
