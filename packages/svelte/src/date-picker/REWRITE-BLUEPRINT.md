# DatePicker 从零重写蓝图（严格对齐 Semi · foundation 分层）

> 会话接续用。用户决策：从零新写、foundation 分层（.svelte.ts rune）、直接覆盖旧实现（git 已留档 feat/datepicker-align-semi）、严格对齐 Semi（DOM/token 名值公式/样式/图标/a11y、依赖组件复用、无需向后兼容、无需 spec）。
> 差异地图：`/private/tmp/.../scratchpad/dp-align-audit.md`（六维度完整勘察）。

## 已完成
- 基线提交（分支 feat/datepicker-align-semi）：文档 inline 21 demo + 4 能力补全 + dateTime 视图切换（可用状态，未从零重写）。
- worktree ../chenzy-dp-align（分支 feat/datepicker-strict-align）
- `constants.ts` 已建：class 名严格镜像 Semi（cd-datepicker-*）+ TYPE_SET/format token/PanelType。

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
