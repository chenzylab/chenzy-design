# DatePicker 从零重写蓝图（严格对齐 Semi · foundation 分层）

> 会话接续用。用户决策：从零新写、foundation 分层（.svelte.ts rune）、直接覆盖旧实现（git 已留档 feat/datepicker-align-semi）、严格对齐 Semi（DOM/token 名值公式/样式/图标/a11y、依赖组件复用、无需向后兼容、无需 spec）。
> 差异地图：`/private/tmp/.../scratchpad/dp-align-audit.md`（六维度完整勘察）。

## 已完成
- 基线提交（分支 feat/datepicker-align-semi）：文档 inline 21 demo + 4 能力补全 + dateTime 视图切换（可用状态，未从零重写）。
- worktree ../chenzy-dp-align（分支 feat/datepicker-strict-align）
- `constants.ts` 已建：class 名严格镜像 Semi（cd-datepicker-*）+ TYPE_SET/format token/PanelType（formatToken 已转 Semi 小写 yyyy-MM-dd）。
- **里程碑1（commit 3b9d8631）**：core 时区层照搬 Semi date-fns-extra.ts（+date-fns/date-fns-tz，删自造纯偏移）；date-picker-foundation.svelte.ts 值模型对齐 Semi（parseWithTimezone/disposeCallbackArgs/_notifyChange，方法名逐一对齐）；跨文件响应式实测打通。见记忆 datepicker-timezone-must-copy-semi-date-fns-tz。
- **里程碑2**：Month.svelte（日格双层 .day>.day-main、19 状态 class、role=grid/gridcell 逐格 tabindex、renderDate/renderFullDate snippet）+ Navigation.svelte（复用 IconButton/Button、bimonth visibility 保位）+ month-foundation.svelte.ts（getMonthTable/getDayStatus 三段合成）+ _utils（getMonthTable/getDayOfWeek/isBefore/isAfter/isBetween/isSameDay/isString 照搬 Semi，svelte 包装 date-fns）+ locale weeks 键。测试 Month 6 + Navigation 3 全绿。
  - ⚠️ 遗留（不阻塞）：Icon 基座 aria-hidden=true 时仍输出 role=img aria-label=图标名（被 aria-hidden 遮蔽，axe 不报，与 Semi 主图标一致）；更干净应在 aria-hidden 时省略 role/aria-label，属图标组件独立优化。
- **里程碑3**：DateInput.svelte（复用 Input，单输入分支，suffix=Calendar/CalendarClock）+ DatePickerNext.svelte（主装配：外层 div.PREFIX > Popover(custom) > combobox wrapper > DateInput；面板 div.PREFIX[x-type]>-container>div>(Navigation+Month)；值模型走 foundation；pickerCursor 本地翻月）。基本 date 单面板可用，测试 DatePickerNext 4（defaultOpen 面板/点日期 onChange/受控回显/combobox）全绿。
  - **依赖组件偏差修正（用户令：以后有偏差都改，不绕过）**：Tooltip/Popover custom 模式原强加 role=button/aria-haspopup/expanded（偏差）；对齐 Semi「trigger=custom 不 wrap span、语义归使用方」→ custom 时触发器纯透传（isDialog && !isCustom 才加）。Popconfirm 测试拆 click（有 disclosure 语义）/custom（纯透传）两分支。
  - **真机验证时机**：里程碑3 功能已由 vitest dom 测试真实覆盖（testing-library 真实 mount+click）；视觉真机验证放到阶段3 样式对齐后（现无样式真机点击验不到视觉，记忆：对齐视觉必须实测 Semi DOM）。
  - **旧 DatePicker.svelte 替换时机**：DatePickerNext 用新文件名避免砸掉旧文件导致 demos 全红；阶段5 收尾时整体替换 index 导出 + 删旧文件（用户令直接覆盖，git 留档）。

## ⚠️ 铁律：不做功能缩水的简化（用户拍板 2026-07-25）
里程碑只做**排序**（先独立组件、后耦合组件），绝不做**功能缩水**。判据：后续能补全→可现阶段先不做（排序）；否则必须现在就完整做。
- 排序（可）：Footer/QuickControl 先于 YearAndMonth；DatePickerNext 里程碑3 先 date 单面板，range/dateTime/双面板**后续必补**（已记待补，非缩水）。
- 缩水（禁）：YearAndMonth 不许砍 monthRange 双面板 left/right + autoSelectMonth disabled 逻辑；InsetInput 不许做残缺版（先建 inputFoundation 再完整做）；每个组件做就照搬 Semi 全部逻辑。
- **待补清单（后续里程碑必须补全，否则即缩水）**：DatePickerNext 的 range/dateTime/monthRange/multiple/inset/preset 装配；YearAndMonth 双面板+autoSelect；TimePanel；Switch(dateTime 日期/时间切换)；InsetInput(依赖 inputFoundation)；MonthsGrid 双面板容器；needConfirm/handleConfirm/handleCancel 流。

## 里程碑4a（已完成）
- locale 补 DatePicker.footer.{confirm,cancel} + presets（zh/en/interface）。
- Footer.svelte（复用 Button，cancel borderless + confirm solid，disabledConfirm）+ 测试 3。
- QuickControl.svelte（复用 Button+Typography.Text ellipsis，presetPosition/type 全套 class，top/bottom 无 header，空不渲染）+ 测试 4。
- foundation 加 PresetType/PresetsType/BaseValueType（对齐 Semi）。
## 里程碑4b（进行中）
- ✅ YearAndMonth：year-month-foundation.svelte.ts（完整照搬 Semi：selectYear/selectMonth/autoSelectMonth，含 monthRange left/right + disabled 自动选月，无缩水）+ _utils getYears/getYearAndMonth（照搬）+ YearAndMonth.svelte（header 返回 IconButton + ScrollList 双列 year/month，month 单面板/monthRange 双面板，复用 ScrollList/ScrollItem，locale months/fullMonths）+ 测试 6（含 monthRange 4 列、disabled 年、选月回调 currentMonth.left 更新）。
- ✅ 根治 Icon aria-hidden 装饰化（用户令：有偏差都改）：Icon 基座 aria-hidden 时省略 role=img/aria-label（对齐 Semi 装饰图标不被 AT 读，消除 axe role-img-alt）；IconButton 尺寸包裹 Icon 加 aria-hidden（语义由按钮 ariaLabel/children 承载）。全库 1829 测试通过（唯一失败 theme-cli 是 worktree tokens 未 build 环境问题，非本改动）。
- ✅ Switch：Switch.svelte（对齐 Semi monthsGrid.renderSwitch：div.-switch > date/time 两段 role=button，
  -switch-date-active 随 isTimePickerOpen，density 控图标，disabledTimePicker）+ 测试 4。
  - 坑：Switch 曾误用 core formatDate（大写 YYYY token）+ Semi 小写 formatToken → 输出 'yyyy-01-dd'；
    改用 core localeFormat（date-fns，小写 token）。新组件其余无此误用（旧 DatePicker.svelte 用大写 token 正确）。
  - Semi renderSwitch 的 div[role=button] 无 tabindex（逐字对齐 Semi，svelte-ignore a11y_interactive_supports_focus）。
- 待做（完整不简化，依赖顺序）：**先做 TimePicker 全面对齐（任务#18，拆出时间列面板组件）→ 再做 DatePicker TimePanel 复用之**
  （Semi TimePanel 复用 TimePicker 的 Combobox 时间列；本库 TimePicker 未拆分，按「引用组件先对齐 Semi」须先拆）。
  然后 InsetInput（先 inputFoundation）+ MonthsGrid 双面板容器 + 把 YearAndMonth/Switch/TimePanel 接入 DatePickerNext。

## 里程碑5（进行中）：months-grid-foundation.svelte.ts —— range 状态机中枢
- ✅ 第一批（照搬 Semi，测试 8 全绿）：state(selected/rangeStart/End/hoverDay/offsetRange/monthLeft/Right) +
  handleDayClick 分派 + handleDateSelected(单选/multiple/max) + handleRangeSelected(range 焦点流转/reset/offset/dateTime 合并) +
  handleDayHover(hover+offset 预览) + _isNeedSwap + 导航(prevMonth/nextMonth/prevYear/nextYear/handleSwitchMonthOrYear/
  handleSyncChangeMonths 双面板同步/handleYearOrMonthChange) + 面板切换(showYearPicker/showTimePicker/showDatePanel) +
  toYearMonth + getValidDateFormat/getValidTimeFormat + _utils(isValidDate/getFullDateOffset 照搬)。
  - 坑：$state(Set) 的 .add/.delete mutation 不响应 → selected 整体重赋值（记忆 svelte5-plain-set-map-mutation）。
  - rangeInputFocus 是 prop 非 foundation state（对齐 Semi），getter 返回 p().rangeInputFocus。
- ✅ 第二批（MonthsGrid.svelte 装配，测试 5 全绿）：单面板(date/dateTime) renderPanel(wrap>Navigation+Month)
  + yam 叠加层(点月标题→YearAndMonth 滚轮，toYearMonth/showDatePanel) + Switch(dateTime) + hover/offset 透传 Month。
  Navigation monthText 走 locale.months 模板。消费 months-grid-foundation 状态机。
- ✅ 第三批（range 双面板 + DatePickerNext 接入，测试全绿）：
  - MonthsGrid range 双面板并排(-month-grid-left/-right，Navigation panelType+shouldBimonthSwitch，初始月错开)+ 测试 8。
  - DatePickerNext 面板换成 MonthsGrid（替换里程碑3 简化 pickerCursor）：主组件现由真状态机驱动（年月切换/翻月/hover 全活），selected 受控透传、onSelectedChange 联动值模型 foundation。
  - 修 renderWithLocale 类型：component 入参放宽为 Component<any>（AnyPropsComponent），清掉 date-picker 有必填 prop 组件测试的 20 个潜伏类型 error（里程碑2 起潜伏，之前 typecheck 过滤太窄漏了 —— 教训：typecheck 要根级递归全量看，勿只过滤源文件）。svelte 包非 dist typecheck error 归零。
- ✅ 第四批（受控 range value 反解，测试全绿）：DatePickerNext 补 range 支持 —— currentRange 反解成
  rangeStart/End 字符串传 MonthsGrid（受控回显 selected-start/end）、rangeInputFocus 本地流转 + setRangeInputFocus
  透传 foundation、onSelectedChange range 分支调 handleRangeSelectedChange（两端完整才关面板）、Props.value/onChange 放宽 RangeValue。
  MonthsGrid 接线 rangeInputFocus/setRangeInputFocus/isAnotherPanelHasOpened 到状态机。
  DatePicker date/dateTime/dateRange 三主类型端到端跑通（真状态机驱动）。测试 DatePickerNext 6（含 dateRange 双面板/受控反解/点两日期 onChange 抛 string[]）。
- ✅ 第五批（year/month/monthRange type 接入，测试全绿）：DatePickerNext 面板按 typeIsYearOrMonth 分派 ——
  month/year/monthRange 走 YearAndMonth 滚轮(noBackBtn+monthCycled)非日历；currentYear/Month 从 value 反解({left,right})、
  handleYMSelectedChange(对齐 Semi：month=new Date(y,m-1)→handleSelectedChange；monthRange=[left,right]→handleRangeSelectedChange)。
  测试 DatePickerNext 9（month 走 yam 无 grid / 选年月 onChange Date 首日 / monthRange 双列 4 滚轮）。
  **DatePicker 五主类型全端到端：date/dateTime/dateRange/month/monthRange（year 亦走 yam 分支）。核心交互内核已完整。**
- ✅ 第六批（TimePicker 拆分 Combobox + dateTime 时间列接入，测试全绿）：
  - TimePicker 拆分（#18 正式启动，规则同 DatePicker：foundation 分层 + 照搬 Semi）：
    time-picker/combobox-foundation.svelte.ts（照搬 Semi ComboxFoundation：formatOption/generateOptions/initData(show*+options)/
    disabledHours(use12Hours 调整)/getDisplayDateFromTimeStamp/getValidFormat，方法名对齐）+ Combobox.svelte（对应 Semi Combobox.tsx：
    ScrollList>ScrollItem×(ampm?/hour/minute/second)，onItemChange 照搬 Semi，onChange 抛 {isAM,value,timeStampValue}）。测试 Combobox 6。
  - months-grid-foundation 补 handleTimeChange（照搬 Semi，dateTime 单面板：合并 showDate 年月日+新时分秒→handleDateSelected）。
  - MonthsGrid tpk 叠加层复用 Combobox（isTimePickerOpen 时显示时间列）。dateTime 时间列端到端跑通（Switch→tpk→选时→onSelectedChange）。测试 MonthsGrid +3。
- ✅ 第七批（TimePicker 内部改用 Combobox，#18 拆分闭环）：TimePicker 删内联时间列逻辑
  （hourList/minuteList/secondList/ampmList/makeSelectHandler/pad2/indexOfValue ~95 行）→ 复用 Combobox
  （单选 1 个 / range 2 个），onComboboxChange 转 commit。TimePicker 809→714 行，消除重复。
  测试 TimePicker a11y 12 + disabledTime 1 + kbd 1 全绿（改用 Combobox 无破坏）。
  坑：列 class 对齐 Semi 从 BEM `__panel-list-hour` 改为 `-list-hour`（测试同步）。
- ✅ 第八批（逻辑内核收尾，测试全绿）：
  - calcDisabledTime（照搬 Semi）：dateTime 以 showDate、dateTimeRange 以 [rangeStart(,rangeEnd)] 为 cbDate 调 disabledTime→
    时间列 disabledHours/Minutes/Seconds，接入 MonthsGrid tpk Combobox。测试 +1。
  - maxWeekNum：range 双面板两月表周行数取 max 传 Month weeksRowNum，WEEKS 高度对齐避免不齐。测试 +1。
  - dateTimeRange 时间联动（_updateTimeInDateRange 照搬 Semi）：两端选定后改某端时间列→更新该端时间+swap 检查。测试 +1。
  **DatePicker 交互内核完整无缺口。全 date-picker+time-picker 84 测试全绿，typecheck 非 dist error 归零。**
- ✅ 第九批（preset/presetPosition 接入，测试全绿）：DatePickerNext 补 presets/presetPosition/onPresetClick +
  handlePresetClick（照搬 Semi：start/end 可为函数/string/number/Date→Date，single 用 start、range 用 [start,end]）。
  面板按 presetPosition 渲染 QuickControl（top/bottom 在主体上下、left/right 在 container 内左右，monthRange 不支持 preset 对齐 Semi）。
  测试 DatePickerNext +3（bottom 点 preset onChange/left class/dateRange preset string[]）。
- 待补：insetInput（面板内输入框，依赖 inputFoundation 数据模型 insetInputValue，独立子任务，非核心）。剩样式(阶段3，让功能真机可视)。

## （原）下一里程碑（5）入口备忘 —— range 状态机中枢
> 这是全项目最硬的核心（Semi monthsGridFoundation.ts 977 行），值得一个专注 turn 逐方法照搬核对，勿疲劳半推。
> DatePickerNext 里程碑3 用的是简化 pickerCursor；接入此 foundation 后 dateRange/hover 预览/offset 周选/双面板才真正活起来。
- 源：`~/i/semi-design/packages/semi-foundation/datePicker/monthsGridFoundation.ts`（977 行）。
- 已读过的核心方法（行号）：handleDayClick(597,按 type 分派)、handleDateSelected(611,单选 selected Set+multiple/max)、handleRangeSelected(674,rangeStart/End+rangeInputFocus 流转+offset+dateTime 合并)、_isNeedSwap(761)、handleDayHover(770,hover 预览态)、calcDisabledTime(210)、_mergeDateAndTime(659)。
- 还需读：handleDayHover 全文(770+)、prevMonth/nextMonth/prevYear/nextYear、showYearPicker/showTimePicker/showDatePanel、toYearMonth、maxWeekNum/currentPanelHeight 计算、_getPanelDetail/_updatePanelDetail、getValidDateFormat/getValidTimeFormat、state 初始化(monthLeft/monthRight={showDate,pickerDate,isTimePickerOpen,isYearPickerOpen})。
- rune 化：createMonthsGridState(getProps)；state 用 $state（selected:Set / rangeStart/End:string / hoverDay:string / monthLeft/Right:面板态 / rangeInputFocus）；adapter 的 notify* → 直接回调 props.onChange/onPanelChange。
- 接入：DatePickerNext 面板改用 MonthsGrid.svelte（renderMonth 双面板 wrap + yam/tpk 叠加层 + Switch），MonthsGrid 消费此 foundation。renderMonth 装配已读（monthsGrid.tsx:331-401，wrap div>Navigation+Month，yam/tpk 开时 wrap visibility:hidden 绝对定位）。
- ⚠️ 依赖顺序：TimePanel 仍须先做 TimePicker 拆分（#18，本库 TimePicker 809 行面板逻辑未拆成独立子组件，Semi TimePanel 复用 Combobox 时间列）。MonthsGrid 的 tpk 层接入 TimePanel 在此之后。

## 目标文件树（对齐 Semi foundation/view 分层）
foundation（.svelte.ts / .ts，逻辑层，对应 Semi *Foundation.ts）：
- `constants.ts` ✅ ← Semi constants.ts
- `date-picker-foundation.svelte.ts` ← foundation.ts(1379)：值模型(受控/非受控 value/open)、格式化(Intl+core formatDate/parseDateString)、时区(zonedWallTime)、onChange(dateFirst)、命令式 open/close/focus/blur
- `months-grid-foundation.svelte.ts` ← monthsGridFoundation.ts(977)：range 状态机(rangeInputFocus/pendingRange/hoverDay/offsetPreview)、disabledDate options、maxRange、周选择 offset、dayStatus 计算
- `input-foundation.ts` ← inputFoundation.ts(335)：输入解析(parseInput/parseInputLoose/multiple)，纯函数
- `year-month-foundation.ts` ← yearAndMonthFoundation.ts(168)：年月滚轮
view（.svelte，对应 Semi *.tsx）：
- `DatePicker.svelte` ← datePicker.tsx(主组件，复用 Popover 包面板)
- `DateInput.svelte` ← dateInput.tsx(触发器，复用 Input；range 双 Input+separator)
- `MonthsGrid.svelte` ← monthsGrid.tsx(双面板容器 + yam/tpk 绝对定位叠加层 + switch)
- `Month.svelte` ← month.tsx(单月 grid：day 双层 .day>.day-main，role=gridcell tabindex 逐格，20 个 day 状态 class)
- `Navigation.svelte` ← navigation.tsx(复用 IconButton 5 键)
- `YearAndMonth.svelte` ← yearAndMonth.tsx(ScrollList 滚轮，返回条在顶部 -yearmonth-header)
- `Footer.svelte` ← footer.tsx(仅 needConfirm，cancel+confirm，无 today)
- `QuickControl.svelte` ← quickControl.tsx(grid 多列 2/3/5)
- `InsetInput.svelte` ← insetInput.tsx(复用 Input，range 4 Input+separator)
- `index.ts` / `meta.ts`

## foundation rune 模式（本库先例 modal/use-modal.svelte.ts）
工厂函数接 `() => props` getter，内部 $state/$derived 读 getter() 响应 props 变化，getter 暴露响应式值：
```ts
export function createDatePickerState(getProps: () => DPProps) {
  const isValueControlled = $derived(getProps().value !== undefined);
  let innerValue = $state(...);
  const current = $derived(isValueControlled ? getProps().value : innerValue);
  ...
  return { get current(){return current}, setValue, ... };
}
```
⚠️ 技术验证点（里程碑1必打通）：.svelte.ts 里 $derived 依赖 getProps() 是否跨文件响应式。先建最小骨架 + 一个 .svelte 消费验证。
⚠️ 耦合：setValue 依赖 formatSingle 依赖 triggerFormat/effectiveTimeZone/format——值模型+格式化+range 状态机三块要一起搬（~500 行），不能只搬值模型。

## 逻辑移植源（旧 DatePicker.svelte <script> 130+ 状态/方法，已验证正确，直接搬不重造）
值模型 455-565、range 状态机 616-700、格式化 708-775、inset 820-918、网格 920-1035、导航 1039-1101、yam 1105-1187（行号见旧文件）。逻辑正确（本会话补全+真机验证过 disabledDate options/renderFullDate dayStatus/disabledTime panelType/timePickerOpts cycled）。

## 关键对齐点（来自差异地图）
- day cell 双层：.day(36外框)+.day-main(32内层)；in-range 内层拉宽36消隙成连续条；range 端点仅外侧半圆角。
- today：浅底 fill-0 + 主色 + font-weight:bold（非旧的下划线）。
- hover 预览 7 层 class：inRangeHover/hoverDay/selectedRange-hover/hoverday_range/around-single + offsetrange。
- 月/年面板走 ScrollList 滚轮覆盖层（position:absolute），非 3 列 grid。
- yam/tpk 面板内绝对定位叠加层（非文档流兄弟块）。
- 触发器复用 Input、面板复用 Popover、导航/清除复用 IconButton。
- 去 a11y 超集：role=dialog/aria-modal、role=group×4、aria-activedescendant×7、aria-haspopup/expanded/controls。天格改 role=gridcell tabindex=0 逐格 Tab（非 activedescendant）。
- weekday：height 36+font-weight:bold+border-bottom 分隔线。
- footer：text-align right+无顶边框+仅 needConfirm 渲染+无 today 按钮。
- token 全量 220（date-picker.ts）：命名 datepicker→date-picker、公式派生算字面量、compact+warning/error 链全补。

## 里程碑（每个一会话可交付+可验证+可提交）
1. constants ✅ + foundation rune 骨架（值模型+格式化+range 状态机搬入 date-picker-foundation/months-grid-foundation，最小 .svelte 验证跨文件响应式）+ 单测
2. Month.svelte(day 双层)+Navigation.svelte(IconButton) 对照 Semi
3. DateInput.svelte(复用 Input)+主 DatePicker.svelte(复用 Popover)，渲染基本 date 类型真机验证
4. YearAndMonth 滚轮+TimePanel+Footer+Switch+QuickControl+InsetInput
5. 220 token + 1814 样式全量对齐 + 真机逐 demo 验证 + 三包 typecheck + 测试 + 门禁
