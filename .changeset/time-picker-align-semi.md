---
'@chenzy-design/svelte': major
'@chenzy-design/tokens': patch
---

feat(time-picker)!: 破坏性重写严格对齐 Semi（复用 ScrollList/ScrollItem + Input 触发器 + 删超集 + 双列 range）

以 Semi `semi-ui/timePicker/{TimePicker,Combobox,TimeInput}.tsx` 为唯一基准破坏性重写。**无向后兼容**。

**面板复用 ScrollList/ScrollItem**（最大项）：删自绘 `<ul><li>` + 自造 roving/scrollIntoView/colItemTabindex，改用 `<ScrollList>` 包 hour/minute/second/(ampm) 四个 `<ScrollItem mode="normal">`（镜像 Semi Combobox）。选择走 `onSelect` 回调；选中项带单位后缀 transform（时/分/秒）。

**range 双列并排**：删单列 tablist（起/止 tab 切换）+ footer 确定跳转，改左右两个 Combobox（ScrollList）并排（对齐 Semi `RANGE_PANEL_LISTS`），左列 begin / 右列 end，中间 border 分割，一次编辑两端。

**触发器 button → Input**：删只读 `<button>`，改复用 `<Input hideSuffix suffix={IconClock} role="combobox">`（镜像 Semi TimeInput），支持键入时间串（Enter/Blur 解析提交）。

**⚠️ 破坏性变更**：
- 删超集 prop：`range`（用 `type="timeRange"`）、`showNow`（连带 footer「此刻」按钮）、`showSecond`（改由 `format` 是否含 `ss` 驱动）、`clearable`（留 `showClear`）、`destroyOnClose`、`onClickOutSide`、面板「确定」按钮、range tablist。
- 改名：`dropdownClassName → popupClassName`、`dropdownStyle → popupStyle`、`status → validateStatus`。
- 默认值校准：`onChangeWithDateFirst` false→**true**、`focusOnOpen` true→**false**、`rangeSeparator` `'~'`→**`' ~ '`**、`format` 默认 undefined→**`'HH:mm:ss'`** 并以此驱动列显隐。
- 补缺失：`class`/`style`/`id`、`insetLabel`/`insetLabelId`、`clearText`、`validateStatus`、`aria-*` 组（labelledby/describedby/errormessage/invalid/required）。

**tokens**：TimePicker 面板消费回 Semi 对齐的 `--cd-width-time-picker-panel-list-*`（64/72px）与 `--cd-height-time-picker-panel-body`（252px），删自造 56/28px 短名的 TimePicker 侧消费（DatePicker/RangePicker 仍消费故保留定义）；面板列居中留白按 Semi 公式 `(panel_body - item) * 0.5` 重算（对齐 timePicker.scss，替代 ScrollList 默认 300px 视窗高）；删悬空 `--cd-height-time-picker-scrolllist-item`（改由 ScrollList 自身 `--cd-height-scroll-list-item` 驱动）。

**ScrollItem 补对齐**：normal 模式挂载/`selectedIndex` 变化时把选中项滚到居中（对齐 Semi `componentDidMount`/`componentDidUpdate` 的 `scrollToNode`，此前仅 wheel 模式有初始定位）。DatePicker 年/月列用 wheel 模式，不受影响。

**ScrollList**：`header`/`footer` 类型放宽接受显式 `undefined`（exactOptionalPropertyTypes 下透传 optional prop）。

**demos**：删 `show-now`/`destroy-on-close`/`prefix`（超集），range 改双列观感，补 `timeZone` demo；`size-status` 改用 `showClear`/`validateStatus`，`step-disabled` 改 `format="HH:mm"` 驱动秒列隐藏。
