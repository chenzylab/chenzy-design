# SPEC · DatePicker
> 分类：input · 阶段：M2
> 对标 Semi：DatePicker

## 1. 概述

DatePicker 是一个日期/时间选择组件，通过输入框触发浮层日历面板，支持键盘输入与面板交互双通道选择。它是 chenzy-design 中 i18n 负担最重的组件之一：面板的周首日、月份/星期名、日期/时间格式、时区均依赖 locale。

核心能力（对标 Semi DatePicker）：
- `type` 多形态：`date` | `dateTime` | `dateRange` | `dateTimeRange` | `month` | `year` | `monthRange`。
- 范围选择（双面板 + hover 预览区间高亮）。
- 时间选择联动（内嵌 TimePicker，含 12/24 小时制）。
- 受控/非受控值，支持快捷选项（presets，如「今天」「最近 7 天」）。
- 禁用日期 `disabledDate`、禁用时间 `disabledTime`、最大可选范围 `maxRange`。
- 多面板数量 `presetPosition`、面板渲染插槽自定义。
- 输入框可直接键入，按 format 解析校验，解析失败回退或显示 `error` 态。
- 周首日由 locale 决定（中文周一起，部分英语区周日起），可被 `weekStartsOn` 覆盖。

典型使用：表单日期字段、范围筛选器、预约/排期时间点选择。

## 2. 设计语义

- **结构语义**：触发器（Input 形态，左侧/无前缀图标，右侧日历图标 + 清除按钮）+ 浮层（Panel：头部导航 ← 年月切换 →，主体 weeks 网格，可选 footer presets + 时间列 + 确认按钮）。范围模式为左右双 Panel。
- **状态语义**：default / hover / focus（输入框聚焦呈 `--cd-color-primary` 描边）/ disabled / 三态校验 `status: default|warning|error`。日期格位状态：今天（today，外环标记）、选中（selected，实心 primary）、范围内（in-range，浅底）、范围端点（range-start/range-end）、悬停预览（hover-range）、禁用（disabled，降低不透明度且禁点击）、非本月（adjacent，弱化文本）。
- **尺寸**：`small|default|large` 仅影响触发器高度与字号；面板格位尺寸固定以保证可点击区域 ≥ 28×28，符合触控目标。
- **动效**：浮层 fade + scale(0.96→1) 96ms，月份切换网格水平位移过渡 160ms。`prefers-reduced-motion` 下全部退化为即时显隐/切换。
- **RTL**：面板整体镜像，导航箭头方向语义反转（← 指向「下一组」），范围左右面板顺序交换；日期数字本身不镜像。

## 3. 分层实现

属于强交互 + 键盘 + a11y 复合控件，逻辑下沉 core，渲染留 svelte。

- **@chenzy-design/core · `createDatePicker`**
  - 维护：`open`、`value`、`inputValue`（输入框文本草稿）、`panelDate`（当前可见年月）、`hoverDate`（范围预览）、`activeRange`（range 模式正在选起点还是终点）。
  - 日期内核：基于轻量日期工具（自研 ~2KB 或可插拔 dayjs 适配器），提供 add/diff/startOf/format/parse；所有 locale 元数据（weekStartsOn、月名、星期名）由注入的 `locale` 提供，core 不内置文案。
  - 复用原语：`useDismiss`（点击外部/Esc 关闭）、`useFocusTrap`（面板内 Tab 循环）、`useRovingTabindex`（日期网格方向键导航，roving tabindex 仅一个格位可 Tab 聚焦）、`useScrollLock`（移动端全屏面板时）、`useLiveAnnouncer`（朗读聚焦日期与选择结果）、`useId`（关联 label/grid/aria-activedescendant）。
  - 纯函数导出：`parseInput`、`isInRange`、`getVisibleWeeks(panelDate, weekStartsOn)`、`clampToDisabled`。
- **@chenzy-design/svelte · `DatePicker.svelte`**
  - 绑定 store，渲染触发器 Input、浮层（经 Portal/Popover 原语定位，flip/shift 防溢出）、Panel 子组件（DatePanel / TimeColumn / Presets）。
  - 负责 CSS 类、过渡、slot 透传、`destroyOnClose` 时卸载面板 DOM。
- 纯展示子件（DateCell）可省 core。

## 4. API

> 说明：单点选择（`type=date|dateTime|month|year`）由 `DatePicker` 提供；日期区间选择（`type=dateRange|dateTimeRange|monthRange`）由配套的 **`RangePicker`** 提供（双面板），其 API 见下文「RangePicker」小节，权威元数据见 `packages/svelte/src/date-picker/range-meta.ts`。下表为 `DatePicker`（单点）Props，权威元数据见 `packages/svelte/src/date-picker/meta.ts`。

### Props（DatePicker）

> 本表由 `packages/svelte/src/date-picker/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'date'\|'dateRange'\|'year'\|'month'\|'monthRange'\|'dateTime'\|'dateTimeRange'` | `'date'` | 对齐 Semi TYPE_SET：单组件靠 type 承载 7 种形态（含 3 range） |
| value | `Date \| Date[] \| [Date\|null, Date\|null] \| null` | `undefined` | 单选 Date；multiple 为 Date[]；range 为 [start,end] 元组 |
| defaultValue | `Date \| Date[] \| [Date\|null, Date\|null] \| null` | `null` |  |
| open | `boolean` | `undefined` |  |
| defaultOpen | `boolean` | `false` |  |
| placeholder | `string` | `'请选择日期'` |  |
| size | `'small'\|'default'\|'large'` | `'default'` |  |
| validateStatus | `'default'\|'warning'\|'error'` | `'default'` | 校验态（对齐 Semi validateStatus） |
| disabled | `boolean` | `false` |  |
| disabledDate | `(date: Date, options?: { rangeStart: string; rangeEnd: string; rangeInputFocus: "rangeStart" \| "rangeEnd" \| false }) => boolean` | `undefined` |  |
| disabledTime | `(date: Date) => { disabledHours?: () => number[]; disabledMinutes?: (hour: number) => number[]; disabledSeconds?: (hour: number, minute: number) => number[] }` | `undefined` |  |
| presets | `Array<PresetType \| (() => PresetType)>` | `[]` | 快捷选项（对齐 Semi）：每项 { text, start, end }，start/end 支持 Date/时间戳/日期串或返回它们的函数 |
| locale | `Partial<Locale['DatePicker']>` | `undefined` | 局部覆盖 DatePicker 文案（对齐 Semi locale）：只给要改的字段，未给的回退 LocaleProvider |
| localeCode | `string` | `undefined` | 覆盖 BCP 47 语言代码（对齐 Semi localeCode）：驱动月份/星期的 Intl 本地化；未传回退 LocaleProvider |
| dateFnsLocale | `import('date-fns').Locale` | `undefined` | date-fns locale（对齐 Semi dateFnsLocale）：驱动日期解析/格式化的本地化 |
| startDateOffset | `(date: Date) => Date` | `undefined` | 单击范围选择（周选择）：与 endDateOffset 同提供，单击某日即选定 [startDateOffset(clicked), endDateOffset(clicked)]；仅 dateRange/dateTimeRange |
| endDateOffset | `(date: Date) => Date` | `undefined` | 单击范围选择的结束偏移 |
| syncSwitchMonth | `boolean` | `false` | range 双面板同步翻月（对齐 Semi） |
| rangeSeparatorNode | `Snippet \| string` | `undefined` | range 起止输入框之间的自定义分隔节点 |
| timePickerOpts | `{ showSecond?: boolean; use12Hours?: boolean }` | `undefined` | 透传给内部时间列的配置（对齐 Semi timePickerOpts） |
| defaultPickerValue | `Date \| Date[]` | `undefined` | 面板初始定位日期（非受控，不改选中值）；仅无选中值时 seed 面板游标显示的月/年 |
| timeZone | `string` | `undefined` | 按 IANA 时区显示（仅格式化层注入 Intl { timeZone }；不做完整跨时区值转换，底层 Date 绝对时刻不变） |
| format | `string` | `undefined` |  |
| onChange | `(value: Date \| Date[] \| [Date\|null, Date\|null] \| null, dateString: string) => void` | `undefined` | 值变化回调；第二参 dateString 为格式化字符串（range 用 rangeSeparator 连接），参数顺序由 onChangeWithDateFirst 控制 |
| onOpenChange | `(open: boolean) => void` | `undefined` |  |
| onPanelChange | `(date: Date \| Date[], dateString: string \| string[]) => void` | `undefined` | 面板年/月切换回调（对齐 Semi） |
| onPresetClick | `(item: Preset, e?: MouseEvent) => void` | `undefined` | 点击快捷选项（对齐 Semi (item, e)） |
| onClear | `(e: MouseEvent) => void` | `undefined` | 点清除按钮回调 |
| onConfirm | `(value, dateString: string) => void` | `undefined` | needConfirm 时点确认（对齐 Semi） |
| onFocus | `(e: FocusEvent) => void` | `undefined` |  |
| onBlur | `(e: FocusEvent) => void` | `undefined` |  |
| insetLabel | `string \| Snippet` | `undefined` | 内嵌标签：浮入触发器左侧的常驻标签（纯展示，不影响值/解析） |
| insetLabelId | `string` | `undefined` | insetLabel 的 id，经 aria-labelledby 关联触发器 combobox（仅 insetLabel 存在时生效） |
| rangeSeparator | `string` | `' ~ '` | 范围日期分隔符（对齐 Semi DEFAULT_SEPARATOR_RANGE） |
| autoSwitchDate | `boolean` | `true` | 年月滚轮（PANEL_YAM）里选完年/月后自动切回日期网格视图（仅 type=date/dateTime） |
| autoAdjustOverflow | `boolean` | `true` | 浮层自动调整位置防溢出 |
| insetInput | `boolean` | `false` | 在面板顶部内嵌可编辑输入框（仅 type=date/dateTime）：date 一个日期框，dateTime 日期框+时间框；与面板选择双向同步，键入解析复用 formatDate/parseDateString |
| position | `string` | `'bottomLeft'` | 浮层弹出位置 |
| spacing | `number` | `undefined` | 触发器与浮层间距 |
| getPopupContainer | `() => HTMLElement` | `undefined` | 浮层挂载容器 |
| weekStartsOn | `0\|1\|2\|3\|4\|5\|6` | `0` | 一周起始日（0=周日 … 6=周六） |
| onCancel | `(value, dateString: string) => void` | `undefined` | needConfirm 时点取消（对齐 Semi） |
| onChangeWithDateFirst | `boolean` | `true` | true→onChange(value, dateString)（默认，value-first）；false→onChange(dateString, value) |
| onClickOutSide | `() => void` | `undefined` | 点击外部关闭时触发 |
| borderless | `boolean` | `false` | 无边框模式 |
| density | `'default' \| 'compact'` | `'default'` | compact 时面板更紧凑 |
| prefix | `Snippet \| string` | `undefined` | 触发器前缀内容，渲染在 input 左侧 |
| clearIcon | `Snippet` | `undefined` | 自定义清除按钮图标 |
| showClear | `boolean` | `true` | 是否显示清除按钮（对齐 Semi 单一 showClear） |
| inputReadOnly | `boolean` | `false` | 输入框 readonly 属性 |
| inputStyle | `CSSProperties \| string` | `undefined` | 输入框内联样式 |
| autoFocus | `boolean` | `false` | 挂载时自动聚焦 |
| dropdownClassName | `string` | `undefined` | 下拉浮层 className |
| dropdownStyle | `CSSProperties \| string` | `undefined` | 下拉浮层样式 |
| dropdownMargin | `number \| { x?: number; y?: number }` | `undefined` | 浮层溢出冗余值 |
| zIndex | `number` | `1030` | 浮层 z-index |
| motion | `boolean` | `true` | 面板展开动画，false 时添加 cd-date-picker-no-motion |
| preventScroll | `boolean` | `false` | 聚焦时阻止滚动 |
| stopPropagation | `boolean` | `true` | 阻止浮层点击事件冒泡 |
| topSlot | `Snippet` | `undefined` | 面板顶部额外区域 |
| bottomSlot | `Snippet` | `undefined` | 面板底部额外区域 |
| leftSlot | `Snippet` | `undefined` | 面板左侧额外区域 |
| rightSlot | `Snippet` | `undefined` | 面板右侧额外区域 |
| multiple | `boolean` | `false` | 多选（仅 type='date'），value 变为 Date[] |
| max | `number` | `undefined` | multiple=true 时最多选择数量 |
| startYear | `number` | `undefined` | 年份滚轮最小年 |
| endYear | `number` | `undefined` | 年份滚轮最大年 |
| renderDate | `Snippet<[{ day: number; fullDate: string }]>` | `undefined` | 自定义日期单元格内容 |
| renderFullDate | `Snippet<[{ day: number; fullDate: string; dayStatus: DayStatus }]>` | `undefined` | 完全自定义日期格子 |
| triggerRender | `Snippet<[{ value: Date \| Date[] \| [Date\|null, Date\|null] \| null; placeholder: string }]>` | `undefined` | 完全自定义触发器 |
| hideDisabledOptions | `boolean` | `false` | 隐藏禁止的时间选项 |
| disabledTimePicker | `boolean` | `false` | 禁止时间选择 |
| needConfirm | `boolean` | `undefined` | 需点击确认才写入（dateTimeRange 默认 true，其它默认 false，对齐 Semi） |
| presetPosition | `'left'\|'right'\|'top'\|'bottom'` | `'bottom'` | 快捷选项列表位置 |
| yearAndMonthOpts | `{ yearCyclic?: boolean; monthCyclic?: boolean } \| Record<string, unknown>` | `undefined` | 透传给年月 ScrollList 的参数 |
| class | `string` | `''` | 根节点自定义类名（对齐 Semi className） |
| style | `string` | `undefined` | 根节点内联样式 |

### Methods

通过组件实例（`bind:this`）调用（对齐 Semi）：

| 方法 | 说明 |
|---|---|
| `open()` | 手动展开面板 |
| `close()` | 手动关闭面板 |
| `focus()` | 聚焦触发器（尊重 preventScroll） |
| `blur()` | 触发器失焦 |

### Slots
| Slot | 作用域参数 | 说明 |
|---|---|---|
| `trigger` | `{ value, dateString, open }` | 自定义触发器（替换默认 Input） |
| `prefix` | — | 输入框前缀 |
| `dateCell` | `{ date, inRange, selected, today, disabled }` | 自定义单个日期格内容 |
| `header` | `{ panelDate, locale }` | 自定义面板头部 |
| `footer` | `{ close }` | 面板底部追加内容 |
| `presets` | `{ apply }` | 自定义快捷选项区 |
| `clearIcon` / `suffixIcon` | — | 自定义清除/日历图标 |

### RangePicker

日期区间选择由独立组件 `RangePicker` 提供（双面板：两个月并排，右面板 = 左面板 +1，点起始 → 点结束自动排序、起止可跨面板、hover 跨面板预览区间）。权威元数据见 `packages/svelte/src/date-picker/range-meta.ts`。以下仅列与 DatePicker 不同或 RangePicker 特有的 Props（其余浮层/校验/locale 类 prop 语义同上）。

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'dateRange'\|'dateTimeRange'\|'monthRange'` | `'dateRange'` | dateRange 纯日期范围 / dateTimeRange 带时间范围 / monthRange 月份范围（双月份面板选起止月） |
| `value` | `[Date\|null, Date\|null] \| null` | — | 受控区间值 |
| `defaultValue` | `[Date\|null, Date\|null] \| null` | `null` | 非受控初始区间 |
| `startPlaceholder` | `string` | `'开始日期'` | 起始占位 |
| `endPlaceholder` | `string` | `'结束日期'` | 结束占位 |
| `maxRange`（**已删除**，Semi 无此 prop 且本库零实现） | `number` | — | 范围最大跨度（天），超出置灰禁用（monthRange 不适用） |
| `needConfirm` | `boolean` | — | 需点确认才提交（dateTimeRange 默认 true，dateRange 默认 false） |
| `startDateOffset` | `(date: Date) => Date` | — | 单击范围选择（如周选择）：与 `endDateOffset` 同时提供后，单击某日即选定 `[startDateOffset(clicked), endDateOffset(clicked)]`，一步完成；仅 dateRange/dateTimeRange 生效 |
| `endDateOffset` | `(date: Date) => Date` | — | 单击范围选择的结束偏移；与 `startDateOffset` 同时提供才生效 |
| `presets` | `{ label: string; value: [Date, Date] \| (() => [Date, Date]) }[]` | — | 快捷区间列表：点击直接选定整段 `[start, end]`（自动排序）；needConfirm 时进 pending 缓冲否则直接提交并关面板 |
| `presetPosition` | `'left'\|'right'\|'top'\|'bottom'` | `'bottom'` | 快捷区间列表位置 |
| `weekStartsOn` | `0 \| 1` | `0` | 一周起始日 |
| `position` | `string` | `'bottomLeft'` | 浮层弹出位置 |
| `autoAdjustOverflow` | `boolean` | `true` | 浮层自动调整位置防溢出 |
| `spacing` | `number` | — | 触发器与浮层间距（px） |
| `getPopupContainer` | `() => HTMLElement` | — | 浮层挂载容器 |
| `dropdownMargin` | `number \| { x?: number; y?: number }` | — | 浮层相对触发器的额外偏移 |
| `class` | `string` | `''` | 根节点自定义类名（对齐 Semi className） |
| `style` | `string` | — | 根节点内联样式 |
| `onChange` | `(v: [Date\|null,Date\|null] \| null) => void` | — | 区间值变更 |
| `onConfirm` / `onCancel` | `(e: { value }) => void` | — | 点击确认 / 取消按钮（needConfirm） |
| `onPresetClick` | `(e: { preset }) => void` | — | 点击快捷区间选项 |

其余共享 prop：`open`/`defaultOpen`/`size`/`status`/`disabled`/`clearable`/`disabledDate`/`disabledTime`/`disabledTimePicker`/`hideDisabledOptions`/`showSecond`/`locale`/`ariaLabel`/`onOpenChange`/`onPanelChange`/`onClear`/`onFocus`/`onBlur`（语义同 DatePicker）。

**RangePicker Methods**（`bind:this`）：

| 方法 | 说明 |
|---|---|
| `open()` | 手动展开面板 |
| `close()` | 手动关闭面板 |
| `focus(focusType?: 'rangeStart'\|'rangeEnd')` | 聚焦触发器（单触发器结构下 focusType 退化为聚焦整体，签名对齐 Semi） |
| `blur()` | 触发器失焦 |

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-datepicker-trigger-height-sm/default/lg` | `--cd-size-control-*` | 触发器高度 |
| `--cd-datepicker-bg` | `--cd-color-bg-0` | 触发器/面板底色 |
| `--cd-datepicker-border` | `--cd-color-border` | 触发器边框 |
| `--cd-datepicker-border-focus` | `--cd-color-primary` | 聚焦描边 |
| `--cd-datepicker-text` | `--cd-color-text-0` | 已选文本 |
| `--cd-datepicker-placeholder` | `--cd-color-text-2` | 占位文本 |
| `--cd-datepicker-panel-shadow` | `--cd-shadow-elevated` | 浮层阴影 |
| `--cd-datepicker-cell-size` | `28px`（经 `--cd-size-base`） | 日期格尺寸 |
| `--cd-datepicker-cell-radius` | `--cd-radius-sm` | 日期格圆角 |
| `--cd-datepicker-cell-hover-bg` | `--cd-color-fill-1` | 格位 hover 底 |
| `--cd-datepicker-cell-selected-bg` | `--cd-color-primary` | 选中实心底 |
| `--cd-datepicker-cell-selected-text` | `--cd-color-text-inverse` | 选中文本 |
| `--cd-datepicker-cell-inrange-bg` | `--cd-color-primary-light` | 范围内浅底 |
| `--cd-datepicker-cell-today-ring` | `--cd-color-primary` | 今日标记环 |
| `--cd-datepicker-cell-disabled-text` | `--cd-color-text-3` | 禁用日期文本 |
| `--cd-datepicker-adjacent-text` | `--cd-color-text-3` | 非本月日期 |
| `--cd-datepicker-border-warning` | `--cd-color-warning` | warning 态描边 |
| `--cd-datepicker-border-error` | `--cd-color-danger` | error 态描边 |
| `--cd-datepicker-nav-icon` | `--cd-color-text-2` | 头部导航箭头 |

暗色模式通过 Alias 自动切换，组件层无需额外定义。范围底色与选中底色须满足端点文本对比度 AA。

## 6. 无障碍（WCAG 2.1 AA，遵循 WAI-ARIA APG「Date Picker Dialog」）

- **触发器**：`<input role="combobox" aria-haspopup="dialog" aria-expanded aria-controls={panelId}>`，关联 `aria-labelledby`/`aria-describedby`（表单错误时指向错误文案）。`status=error` 时 `aria-invalid="true"`。
- **浮层**：`role="dialog" aria-modal="false" aria-label`（i18n「选择日期」）。
- **日历网格**：`role="grid"`，每行 `role="row"`，日期格 `role="gridcell"` + `<button>`；表头星期 `role="columnheader" aria-label`（完整星期名）。当前聚焦格用 `aria-selected` 标记选中，网格容器 `aria-activedescendant` 指向聚焦格 id。
- **键盘交互**（网格内，roving tabindex）：
  - 方向键移动一天/上下移动一周；`Home`/`End` 跳本周首/末；`PageUp`/`PageDown` 上/下月；`Shift+PageUp/Down` 上/下年。
  - `Enter`/`Space` 选中聚焦日期；range 模式首次选起点、再次选终点。
  - `Esc` 关闭面板并返回焦点至触发器；`Tab` 在面板内循环（useFocusTrap，但 modal=false 允许 Tab 到面板按钮）。
- **焦点管理**：打开面板焦点移至「今天或已选日期」格；关闭后焦点回触发器。
- **朗读**（useLiveAnnouncer，polite）：聚焦移动播报完整日期（`Intl.DateTimeFormat` 长格式）；选择完成播报结果；范围选择播报「起始 X，结束 Y，共 N 天」。
- **对比度**：选中态文本/底 ≥ 4.5:1；in-range 浅底上的文本 ≥ 4.5:1；today 环 ≥ 3:1（非文本）；focus ring ≥ 3:1。
- **reduced-motion**：禁用所有过渡（见 §2）。
- **RTL**：`dir` 继承；网格列序与导航语义按 §2 镜像；`aria-activedescendant` 逻辑不变。

## 7. 国际化

- 所有用户可见文案零硬编码，集中于 `DatePickerLocale`，可由 ConfigProvider 注入或 `locale` 覆盖。
- 日期/时间/数字一律经 `Intl.DateTimeFormat` / `Intl.NumberFormat`，按 `timeZone` 渲染。
- 周首日：默认由 locale 推导（`Intl.Locale.weekInfo.firstDay`，回退表），可被 `weekStartsOn` 覆盖。
- 月名/星期名：由 `Intl.DateTimeFormat(locale,{month:'long'/'short'})` 与 weekday 生成，不内置字符串表。
- 解析手动输入：按当前 `format` 与 locale 分隔符容错解析。
- RTL：`ar`、`he` 等自动镜像。

i18n keys：

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `DatePicker.placeholder.date` | 请选择日期 |
| `DatePicker.placeholder.dateTime` | 请选择日期及时间 |
| `DatePicker.placeholder.dateRange` | ['开始日期', '结束日期'] |
| `DatePicker.placeholder.dateTimeRange` | ['开始日期', '结束日期'] |
| `DatePicker.placeholder.monthRange` | ['开始月份', '结束月份'] |
| `DatePicker.today` | 今天 |
| `DatePicker.clear` | 清除 |
| `DatePicker.prevMonth` | 上个月 |
| `DatePicker.nextMonth` | 下个月 |
| `DatePicker.prevYear` | 上一年 |
| `DatePicker.nextYear` | 下一年 |
| `DatePicker.prevDecade` | 上十年 |
| `DatePicker.nextDecade` | 下十年 |
| `DatePicker.triggerLabel` | 选择日期 |
| `DatePicker.startPlaceholder` | 开始日期 |
| `DatePicker.endPlaceholder` | 结束日期 |
| `DatePicker.rangeTriggerLabel` | 选择日期范围 |
| `DatePicker.switchYearMonth` | 快速选择年月 |
| `DatePicker.backToDate` | 返回 |
| `DatePicker.yearColumnLabel` | 年份 |
| `DatePicker.monthColumnLabel` | 月份 |
| `DatePicker.selectDate` | 选择日期 |
| `DatePicker.selectTime` | 选择时间 |
| `DatePicker.monthText` | ${year}年 ${month} |
| `DatePicker.localeFormatToken.FORMAT_SWITCH_DATE` | yyyy-MM-dd |
| `DatePicker.months.1` | 1月 |
| `DatePicker.months.2` | 2月 |
| `DatePicker.months.3` | 3月 |
| `DatePicker.months.4` | 4月 |
| `DatePicker.months.5` | 5月 |
| `DatePicker.months.6` | 6月 |
| `DatePicker.months.7` | 7月 |
| `DatePicker.months.8` | 8月 |
| `DatePicker.months.9` | 9月 |
| `DatePicker.months.10` | 10月 |
| `DatePicker.months.11` | 11月 |
| `DatePicker.months.12` | 12月 |
| `DatePicker.fullMonths.1` | 1 |
| `DatePicker.fullMonths.2` | 2 |
| `DatePicker.fullMonths.3` | 3 |
| `DatePicker.fullMonths.4` | 4 |
| `DatePicker.fullMonths.5` | 5 |
| `DatePicker.fullMonths.6` | 6 |
| `DatePicker.fullMonths.7` | 7 |
| `DatePicker.fullMonths.8` | 8 |
| `DatePicker.fullMonths.9` | 9 |
| `DatePicker.fullMonths.10` | 10 |
| `DatePicker.fullMonths.11` | 11 |
| `DatePicker.fullMonths.12` | 12 |
| `DatePicker.weeks.Mon` | 一 |
| `DatePicker.weeks.Tue` | 二 |
| `DatePicker.weeks.Wed` | 三 |
| `DatePicker.weeks.Thu` | 四 |
| `DatePicker.weeks.Fri` | 五 |
| `DatePicker.weeks.Sat` | 六 |
| `DatePicker.weeks.Sun` | 日 |
| `DatePicker.footer.confirm` | 确定 |
| `DatePicker.footer.cancel` | 取消 |
| `DatePicker.presets` | 快捷选择 |

## 8. 文案

- 遵循 content-guidelines：占位简短具引导性（「请选择日期」而非「日期」）；按钮用动词（「确认」「此刻」「今天」）。
- 错误文案具体可行动：解析失败 →「日期格式有误，请按 yyyy-MM-dd 输入」；超范围 →「最多可选择 7 天」。
- 不在文案中拼接日期字符串，统一用 Intl 模板占位符。
- **危险操作**：DatePicker 本身无破坏性操作；`clear` 仅清空当前字段、可重新选择，属低风险，故不弹二次确认，仅提供清除按钮 aria-label。若宿主表单将清除视为重要操作，由表单层处理确认，组件不内置。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip（DatePicker+RangePicker 含 core，size-limit 口径） | ≤ 22 KB | 含触发器+面板+时间列+年月滚轮(PANEL_YAM)+dateTimeRange/monthRange+insetInput+use:floating 浮层引擎+RangePicker presets+命令式 Methods（实测 19.33 KB）|
| core `createDatePicker` gzip | ≤ 5 KB | 含 roving/dismiss/focus-trap 复用引用 |
| 内置日期工具 gzip | ≤ 2 KB | 或外接 dayjs 适配器（不计入默认包） |
| 首次打开面板 | ≤ 16 ms | 单面板 6 周网格 ≈ 42 格 |
| 月份切换重渲染 | ≤ 8 ms | 仅 diff 网格区 |
| 方向键导航单步 | ≤ 4 ms | roving tabindex，不整网格重绘 |

- 不需虚拟化（网格固定 ≈42 格，年/月视图 ≈12 格）。
- 惰性渲染：`destroyOnClose` 关闭时卸载面板与时间列 DOM；时间列默认折叠，切换到时间页才渲染。
- 范围双面板共享日期工具实例，避免重复计算 weekInfo。
- `disabledDate` 调用结果按 panelDate 缓存，避免每次悬停重算整网格。

## 10. AI 元数据

提供 `component.meta.ts`，导出：
- `name`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'DatePicker'`。
- `props`/`events`/`slots` 的机器可读 schema（类型、默认值、枚举、是否受控）。
- `a11yRoles: ['combobox','dialog','grid','gridcell','columnheader']`、`keyboardMap`（方向键/Enter/Esc/PageUp 等）。
- `i18nKeys`（§7 列表）、`tokens`（§5 列表）。
- `recommendedUsage` / `antiPatterns`（如「不要用 DatePicker 做纯时间选择，应用 TimePicker」）。
- `examples`：date / dateRange / dateTime / presets 四组最小可用片段。

## 11. 测试

- **单元（core 纯函数）**：`parseInput` 多 locale/format、`getVisibleWeeks` 各 `weekStartsOn`、`isInRange`、`clampToDisabled`、`maxRange` 边界。
- **交互（Testing Library）**：键入解析→change、面板选择、范围两次点击、hover 预览高亮、presets 应用、clear、showConfirm 流程。
- **键盘**：方向键/Home/End/PageUp/PageDown/Shift+Page/Enter/Esc 全覆盖，roving tabindex 仅一格可聚焦断言。
- **a11y**：axe 无违规；`aria-activedescendant`、`aria-expanded`、`role=grid` 结构断言；焦点开/关回流断言。
- **i18n**：`zh-CN`(周一)/`en-US`(周日)/`ar`(RTL) 周首日、月名、格式快照；timeZone 渲染断言。
- **视觉回归**：三尺寸 × 三状态 × 明暗 × 范围/单选 截图；reduced-motion 快照。
- **性能**：月份切换与导航单步基准不超 §9 预算。

## 12. 验收标准 checklist

- [ ] 支持 `type` 全部 7 种形态，range 为双面板带 hover 预览。
- [ ] `value`+`on:change`、`open`+`on:openChange` 一致性 API 实现。
- [ ] `size` 三档、`status` 三态、`disabled`、`clearable` 行为正确。
- [ ] 周首日由 locale 推导且可被 `weekStartsOn` 覆盖；月名/星期名经 Intl 生成。
- [ ] 日期/时间/时区全部经 `Intl` + `timeZone` 渲染，无硬编码格式。
- [ ] 手动键入解析容错，失败触发 `on:parseError` 且 `aria-invalid`。
- [ ] WAI-ARIA APG 键盘交互全覆盖，焦点开/关正确回流。
- [ ] role/aria-* 齐备，axe 零违规，对比度达 AA，roving tabindex 正确。
- [ ] reduced-motion 与 RTL 镜像生效。
- [ ] 全部可见文案走 i18n key（§7），危险/错误文案符合 content-guidelines。
- [ ] headless 逻辑在 core `createDatePicker`，复用 useDismiss/useFocusTrap/useRovingTabindex/useScrollLock/useLiveAnnouncer/useId。
- [ ] Token 仅消费 Alias/Component 级 `--cd-datepicker-*`，无写死值。
- [ ] 满足 §9 Perf Budget；`destroyOnClose`/时间列惰性渲染生效。
- [ ] 提供 `component.meta.ts`，schema 与实现一致。

## 13. range 重开语义（曾误记为 Bug，已核实对齐 Semi）

`type='dateTimeRange'` + `triggerRender` 场景下「已有完整区间 → 关闭 → 重开 → 点日期」
的行为，曾被记为已知问题。逐条核对 Semi 源码 + 真机复验后确认**本库已与 Semi 一致**：

| 环节 | Semi 实现 | 本库 |
|---|---|---|
| 关闭面板 | `resetInnerSelectedStates` → `resetFocus()` → `setRangeInputFocus(false)` | 同（DatePicker.svelte 关闭分支） |
| triggerRender 打开 | `handleTriggerWrapperClick`：`_isRangeType() && !rangeInputFocus` 时 `setRangeInputFocus('rangeStart')` | 同（`openPanel` 带同样守卫） |
| 点新起点晚于原终点 | `handleRangeSelected`：`isBefore(rangeEnd, rangeStart)` → 清 `rangeEnd`、**不 notify**，等待再选终点 | 同 |
| 点新起点早于原终点 | 只改起点、保留终点 | 同 |

**真机实测**（`2026-07-08 ~ 2026-08-12` 起）：
- 点左面板 8 号（早于终点）→ `07-08 ~ 08-12`，终点保留 ✅
- 点右面板 20 号（晚于终点）→ 触发器暂不变（区间不完整不提交）、面板起点已切到 `08-20` ✅
- 再点 25 号补终点 → `08-20 ~ 08-25` 提交 ✅

即「点一下没反应」是**区间重开中的中间态**，Semi 同样如此，不是缺陷。

**本轮真正修掉的三处**（见 commit `ba5ebb11`）：
1. `isAnotherPanelHasOpened` 写死 → 改为按端查 `focusRecords`（Semi `datePicker.tsx:610`）；
2. 缺 `_autoAdjustMonth` → 补「左>右交换、同月右+1」（Semi `monthsGridFoundation.ts:785`）；
3. `focusRecords` 延时写入未撤销 → 关面板 `clearTimeout`。

修前重开会出现「两面板同月 + 各 19 格被禁 + 点哪都无效」，修后实测重开
禁用数 0、面板月份 `2026-07`/`2026-08` 正确。
