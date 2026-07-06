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

### Props
| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'date'\|'dateTime'\|'dateRange'\|'dateTimeRange'\|'month'\|'year'\|'monthRange'` | `'date'` | 选择形态 |
| `value` | `Date \| [Date,Date] \| null` | `null` | 受控值（range 为元组） |
| `defaultValue` | `Date \| [Date,Date] \| null` | `null` | 非受控初始值 |
| `defaultPickerValue` | `Date \| Date[]` | — | 面板初始定位日期（非受控，不改选中值）；仅无选中值时 seed 面板首次显示的月/年 |
| `open` | `boolean` | — | 受控浮层显隐 |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐 |
| `format` | `string` | 由 type+locale 推导 | 显示/解析格式（如 `yyyy-MM-dd HH:mm`） |
| `placeholder` | `string \| [string,string]` | i18n 默认 | 占位文案 |
| `size` | `'small'\|'default'\|'large'` | `'default'` | 触发器尺寸 |
| `status` | `'default'\|'warning'\|'error'` | `'default'` | 校验态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `clearable` | `boolean` | `true` | 显示清除按钮 |
| `disabledDate` | `(date: Date, opts:{rangeStart?:Date}) => boolean` | — | 禁用日期判定 |
| `disabledTime` | `(date: Date) => { hours?:()=>number[]; minutes?:(h)=>number[]; seconds?:(h,m)=>number[] }` | — | 禁用时间 |
| `maxRange` | `number \| string` | — | 范围最大跨度（如 `7d`），超出禁用 |
| `weekStartsOn` | `0\|1\|2\|3\|4\|5\|6` | locale 决定 | 覆盖周首日 |
| `presets` | `Array<{text:string; start:Date; end?:Date}>` | — | 快捷选项 |
| `presetPosition` | `'left'\|'top'\|'right'\|'bottom'` | `'bottom'` | 快捷选项位置 |
| `showConfirm` | `boolean` | type 含 time 时 `true` | 是否需点确认才提交 |
| `locale` | `DatePickerLocale` | 全局 ConfigProvider | locale 元数据与文案 |
| `timeZone` | `string` | 系统 | IANA 时区标识（当前实现：仅显示格式化层注入 `Intl { timeZone }`，不做完整跨时区值转换，底层 `Date` 绝对时刻不变） |
| `inputReadOnly` | `boolean` | `false` | 禁止手动键入 |
| `getPopupContainer` | `() => HTMLElement` | `body` | 浮层挂载容器 |
| `destroyOnClose` | `boolean` | `false` | 关闭时卸载面板 DOM |
| `motion` | `boolean` | `true` | 是否启用动效 |

### Events
| 事件 | payload | 说明 |
|---|---|---|
| `on:change` | `{ value: Date\|[Date,Date]\|null; dateString: string\|[string,string] }` | 值变更（提交后） |
| `on:openChange` | `{ open: boolean }` | 浮层显隐变化 |
| `on:input` | `{ text: string }` | 输入框键入草稿 |
| `on:parseError` | `{ text: string }` | 手动键入解析失败 |
| `on:panelChange` | `{ panelDate: Date }` | 可见年月切换 |
| `on:presetClick` | `{ preset }` | 点击快捷选项 |
| `on:clear` | `{}` | 点击清除 |
| `on:confirm` | `{ value }` | 点击确认按钮 |
| `on:focus` / `on:blur` | `FocusEvent` | 触发器焦点 |

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
| key | 含义 |
|---|---|
| `DatePicker.placeholder` | 单日期占位 |
| `DatePicker.rangePlaceholderStart` | 范围起始占位 |
| `DatePicker.rangePlaceholderEnd` | 范围结束占位 |
| `DatePicker.dialogLabel` | 浮层 aria-label「选择日期」 |
| `DatePicker.now` | 「此刻」按钮 |
| `DatePicker.today` | 「今天」 |
| `DatePicker.confirm` | 确认按钮 |
| `DatePicker.clear` | 清除按钮 aria-label |
| `DatePicker.selectTime` | 切换到时间选择 |
| `DatePicker.selectDate` | 切换回日期选择 |
| `DatePicker.prevMonth` / `nextMonth` | 导航箭头 aria-label |
| `DatePicker.prevYear` / `nextYear` | 年导航 aria-label |
| `DatePicker.parseError` | 输入解析失败提示 |
| `DatePicker.maxRangeExceeded` | 超出最大跨度提示 |
| `DatePicker.rangeAnnounce` | 范围结果朗读模板（含 {start}{end}{days}） |

## 8. 文案

- 遵循 content-guidelines：占位简短具引导性（「请选择日期」而非「日期」）；按钮用动词（「确认」「此刻」「今天」）。
- 错误文案具体可行动：解析失败 →「日期格式有误，请按 yyyy-MM-dd 输入」；超范围 →「最多可选择 7 天」。
- 不在文案中拼接日期字符串，统一用 Intl 模板占位符。
- **危险操作**：DatePicker 本身无破坏性操作；`clear` 仅清空当前字段、可重新选择，属低风险，故不弹二次确认，仅提供清除按钮 aria-label。若宿主表单将清除视为重要操作，由表单层处理确认，组件不内置。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip（DatePicker+RangePicker 含 core，size-limit 口径） | ≤ 18 KB | 含触发器+面板+时间列+年月滚轮(PANEL_YAM)+dateTimeRange/monthRange+insetInput（实测 17.43 KB）|
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
