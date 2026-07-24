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
- 待做（完整不简化）：TimePanel + Switch(dateTime 日期/时间切换) + InsetInput（先 inputFoundation）+ MonthsGrid 双面板容器 + 把 YearAndMonth/TimePanel 接入 DatePickerNext 面板。

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
