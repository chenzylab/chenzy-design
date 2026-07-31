---
title: DatePicker 日期选择器
name: datepicker
category: input
brief: 日期选择器用于帮助用户选择一个符合要求的、格式化的日期（时间）或日期（时间）范围。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/date-picker/01-basic.svelte';
  import basicSrc from '../../demos/date-picker/01-basic.svelte?raw';
  import Density from '../../demos/date-picker/02-density.svelte';
  import densitySrc from '../../demos/date-picker/02-density.svelte?raw';
  import Multiple from '../../demos/date-picker/03-multiple.svelte';
  import multipleSrc from '../../demos/date-picker/03-multiple.svelte?raw';
  import DateTime from '../../demos/date-picker/04-datetime.svelte';
  import dateTimeSrc from '../../demos/date-picker/04-datetime.svelte?raw';
  import Range from '../../demos/date-picker/05-range.svelte';
  import rangeSrc from '../../demos/date-picker/05-range.svelte?raw';
  import DateTimeRange from '../../demos/date-picker/06-datetime-range.svelte';
  import dateTimeRangeSrc from '../../demos/date-picker/06-datetime-range.svelte?raw';
  import InsetInput from '../../demos/date-picker/07-inset-input.svelte';
  import insetInputSrc from '../../demos/date-picker/07-inset-input.svelte?raw';
  import SyncSwitchMonth from '../../demos/date-picker/08-sync-switch-month.svelte';
  import syncSwitchMonthSrc from '../../demos/date-picker/08-sync-switch-month.svelte?raw';
  import PanelChange from '../../demos/date-picker/09-panel-change.svelte';
  import panelChangeSrc from '../../demos/date-picker/09-panel-change.svelte?raw';
  import WeekSelect from '../../demos/date-picker/10-week-select.svelte';
  import weekSelectSrc from '../../demos/date-picker/10-week-select.svelte?raw';
  import Month from '../../demos/date-picker/11-month.svelte';
  import monthSrc from '../../demos/date-picker/11-month.svelte?raw';
  import MonthRange from '../../demos/date-picker/12-month-range.svelte';
  import monthRangeSrc from '../../demos/date-picker/12-month-range.svelte?raw';
  import NeedConfirm from '../../demos/date-picker/13-need-confirm.svelte';
  import needConfirmSrc from '../../demos/date-picker/13-need-confirm.svelte?raw';
  import Presets from '../../demos/date-picker/14-presets.svelte';
  import presetsSrc from '../../demos/date-picker/14-presets.svelte?raw';
  import Slots from '../../demos/date-picker/15-slots.svelte';
  import slotsSrc from '../../demos/date-picker/15-slots.svelte?raw';
  import Disabled from '../../demos/date-picker/16-disabled.svelte';
  import disabledSrc from '../../demos/date-picker/16-disabled.svelte?raw';
  import DisabledPart from '../../demos/date-picker/17-disabled-part.svelte';
  import disabledPartSrc from '../../demos/date-picker/17-disabled-part.svelte?raw';
  import DisabledDynamic from '../../demos/date-picker/17-disabled-dynamic.svelte';
  import disabledDynamicSrc from '../../demos/date-picker/17-disabled-dynamic.svelte?raw';
  import DisabledFocus from '../../demos/date-picker/17-disabled-focus.svelte';
  import disabledFocusSrc from '../../demos/date-picker/17-disabled-focus.svelte?raw';
  import Format from '../../demos/date-picker/18-format.svelte';
  import formatSrc from '../../demos/date-picker/18-format.svelte?raw';
  import TriggerRender from '../../demos/date-picker/19-trigger-render.svelte';
  import triggerRenderSrc from '../../demos/date-picker/19-trigger-render.svelte?raw';
  import TriggerRenderRange from '../../demos/date-picker/19-trigger-render-range.svelte';
  import triggerRenderRangeSrc from '../../demos/date-picker/19-trigger-render-range.svelte?raw';
  import RenderDate from '../../demos/date-picker/20-render-date.svelte';
  import renderDateSrc from '../../demos/date-picker/20-render-date.svelte?raw';
  import RenderFullDate from '../../demos/date-picker/21-render-full-date.svelte';
  import renderFullDateSrc from '../../demos/date-picker/21-render-full-date.svelte?raw';
  import Methods from '../../demos/date-picker/22-methods.svelte';
  import methodsSrc from '../../demos/date-picker/22-methods.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { DatePicker } from '@chenzy-design/svelte';
```

### 基本使用

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 小尺寸

使用 `density` 可以控制日期面板的尺寸，`compact` 为小尺寸，`default` 为默认尺寸。

<DemoBox code={densitySrc}><Density /></DemoBox>

### 多个日期选择

将 `multiple` 设为 `true`，可以多选日期。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 日期与时间选择

将 `type` 设定为 `dateTime`，可以选择日期时间。

内部时间列的默认模式为 `normal`（点击选中），若想应用无限滚动的滚轮效果，可以通过 `timePickerOpts` 传入 `scrollItemProps: { mode: 'wheel', cycled: true }` 开启。

<DemoBox code={dateTimeSrc}><DateTime /></DemoBox>

### 日期范围选择

将 `type` 设定为 `dateRange`，可以选择日期范围。

<Notice type="primary" title="注意事项">

type=dateRange 或 dateTimeRange 时，只有开始日期和结束日期都被选择后才会触发 onChange。

</Notice>

<DemoBox code={rangeSrc}><Range /></DemoBox>

### 日期范围时间选择

将 `type` 设定为 `dateTimeRange`，可以选择日期时间范围。当未传入 `defaultValue` 或 `value` 时，底部面板默认时间为当前时间。如果你有特殊需求（如指定默认时分秒），可以通过 `defaultPickerValue` 指定。

<DemoBox code={dateTimeRangeSrc}><DateTimeRange /></DemoBox>

### 内嵌输入框

使用 `insetInput` 可以控制日期面板是否展示内嵌输入框，默认为 `false`。内嵌输入框适用于以下场景：

- 日期时间选择，可以直接通过内嵌输入框单独修改时间，无须通过滚轮选择时间。
- 自定义触发器时 + 范围选择，使用内嵌输入框可以单独对开始和结束日期进行修改。

`insetInput` 开启后包括以下功能：

- 点击触发器后，面板默认在原有位置弹出。你可以通过 `position` 自定义弹出位置。
- 点击内嵌日期输入框，面板切换到日期选择；点击内嵌时间输入框，面板切换到时间选择。
- 和外部的输入框一致，如果输入了非法日期，面板关闭后日期会回到之前的合法日期。

<Notice type="primary" title="注意事项">

注意，开启后会对组件做一些调整和限制：

1. 触发器样式：未打开面板时触发器只读，打开时触发器禁用。
2. 面板样式：type 包括 time 时，隐藏底部的切换按钮。
3. 开启 `insetInput` 后 `format` 只支持 `dateFormat[ timeFormat]` 格式，使用其他格式会影响内嵌输入框 placeholder 和触发器文本的展示。

</Notice>

<DemoBox code={insetInputSrc}><InsetInput /></DemoBox>

### 同步切换双面板月份

在范围选择的场景中，开启 `syncSwitchMonth` 则允许双面板同步切换，默认为 `false`。

> Note：点击年份按钮也会同步切换两个面板，从滚轮里面切换年月不会同步切换面板，这保证了用户选择非固定间隔月份的能力。

<DemoBox code={syncSwitchMonthSrc}><SyncSwitchMonth /></DemoBox>

### 切换面板日期的回调

`onPanelChange` 回调函数会在面板的月份或年份切换改变时被调用。

<DemoBox code={panelChangeSrc}><PanelChange /></DemoBox>

### 周选择

`dateRange` 搭配 `startDateOffset` 和 `endDateOffset` 可以进行单击范围选择，如周选择、双周选择。二者提供任一即可启用，缺失的一端以点击日本身作为该端。

<DemoBox code={weekSelectSrc}><WeekSelect /></DemoBox>

### 年月选择

将 `type` 设定为 `month`，可以进行年月选择。

<DemoBox code={monthSrc}><Month /></DemoBox>

### 年月范围选择

将 `type` 设定为 `monthRange`，可以进行年月范围选择。暂不支持小尺寸与快捷面板。

<DemoBox code={monthRangeSrc}><MonthRange /></DemoBox>

### 确认日期时间选择

对于“日期时间”（type="dateTime"）或“日期时间范围”（type="dateTimeRange"）的选择，可以进行确认后才将值写入输入框内，你可以通过传递 `needConfirm=true` 来开启这种行为。

同时支持“确认”（`onConfirm`）和“取消”（`onCancel`）两个按钮的点击回调。下面这个例子绑定了 `onChange`、`onConfirm`、`onCancel` 三种回调，你可以打开控制台查看打印信息的区别。

> 注意：开启确认选择时，需要点击取消按钮关闭面板，点击空白区域不再关闭面板。

<DemoBox code={needConfirmSrc}><NeedConfirm /></DemoBox>

### 带有快捷方式的日期时间选择

通过 `presets` 设定快捷日期选择。

<DemoBox code={presetsSrc}><Presets /></DemoBox>

### 渲染顶部/底部额外区域

通过 `topSlot` 和 `bottomSlot` 可以自定义渲染顶部和底部额外区域；通过 `leftSlot` 和 `rightSlot` 可以自定义渲染左侧和右侧额外区域。本库这些插槽均为 Snippet。

<DemoBox code={slotsSrc}><Slots /></DemoBox>

### 禁用日期选择

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 禁用部分日期或时间

传入 `disabledDate` 可以禁用指定日期，传入 `disabledTime` 可以禁用指定时间，配合 `defaultPickerValue` 可以指定面板打开时所处的年月。

`disabledDate` 接受的入参为当前日期与 `options`，返回一个 `boolean` 值。range 类型下 `options` 携带 `{ rangeStart, rangeEnd, rangeInputFocus }`（日期串 + 当前聚焦端），可据此实现动态禁用——例如「禁止选择早于已选起点的日期」。`disabledTime` 接受的入参为当前日期与面板类型 `panelType`，返回一个对象，将会透传给 TimePicker 组件。

<Notice type="primary" title="注意事项">

当你使用 `timeZone` 时，第一个参数为你选择的时区下时间（与 onChange 的第一个返回值类似）。

</Notice>

<DemoBox code={disabledPartSrc}><DisabledPart /></DemoBox>

在 type 包含 range 时，可以根据当前选择动态禁止日期。`disabledDate` 的第二个参数 `options` 中携带 `` `rangeStart` ``、`` `rangeEnd` ``（已选起止的 `` `YYYY-MM-DD` `` 串）与 `` `rangeInputFocus` ``。

<DemoBox code={disabledDynamicSrc}><DisabledDynamic /></DemoBox>

范围选择时，可以根据 focus 状态禁用日期。focus 状态通过 `options` 中的 `rangeInputFocus` 参数传递。

<DemoBox code={disabledFocusSrc}><DisabledFocus /></DemoBox>

### 自定义显示格式

可以通过 `format` 自定义显示格式。本库格式化 token 使用大写形态（`YYYY`/`MM`/`DD`/`HH`/`mm`/`ss`）。

<DemoBox code={formatSrc}><Format /></DemoBox>

### 自定义触发器

默认情况下我们使用 `Input` 组件作为 `DatePicker` 组件的触发器，通过传递 `triggerRender` 你可以自定义这个触发器（本库为 Snippet，参数为 `` `{ value, placeholder }` ``）。

自定义触发器是对触发器的完全自定义，默认的清除按钮将不生效，如果你需要清除功能，请自定义一个清除按钮。

<DemoBox code={triggerRenderSrc}><TriggerRender /></DemoBox>

<Notice type="primary" title="注意事项">

范围选择时，面板打开后默认选择的日期为开始日期，选择后会切到结束日期选择。面板关闭后焦点会重置。

我们建议提供一个清除按钮，当你给 DatePicker 传入空值时，DatePicker 内部也会重置焦点。这样用户可以在清除后重新选择日期范围。

</Notice>

<DemoBox code={triggerRenderRangeSrc}><TriggerRenderRange /></DemoBox>

### 自定义日期显示内容

`renderDate` 为 Snippet，参数为 `` `{ day, fullDate }` ``，用于自定义日期内容。

- `day`：当前日。如 `13`。
- `fullDate`：当前日的完整日期。如 `2020-08-13`。

<DemoBox code={renderDateSrc}><RenderDate /></DemoBox>

### 自定义日期格子渲染

`renderFullDate` 为 Snippet，参数为 `` `{ day, fullDate, dayStatus }` ``，用于自定义日期格子的渲染内容。

`dayStatus` 表示当前格子的状态，包括的 `key` 有：

```md
type DayStatus = {
    isToday?: boolean; // 当前日
    isSelected?: boolean; // 被选中
    isDisabled?: boolean; // 被禁用
    isInMonth?: boolean; // 属于当前展示月
    isSelectedStart?: boolean; // 选中开始
    isSelectedEnd?: boolean; // 选中结束
    isInRange?: boolean; // 范围选中日期内
    isHover?: boolean; // 日期在选择项和 hover 日期之间
    isOffsetRangeStart?: boolean; // 周选择开始
    isOffsetRangeEnd?: boolean; // 周选择结束
    isHoverInOffsetRange?: boolean; // hover 在周选择内
};
```

<DemoBox code={renderFullDateSrc}><RenderFullDate /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoAdjustOverflow | 浮层被遮挡时是否自动调整方向 | boolean | true |
| autoFocus | 自动获取焦点 | boolean | false |
| autoSwitchDate | 通过年月滚轮更改年/月后自动切回日期网格视图 | boolean | true |
| borderless | 无边框模式 | boolean | false |
| bottomSlot | 渲染底部额外区域 | Snippet | - |
| class | 根节点类名 | string | - |
| clearIcon | 自定义清除按钮图标，`showClear` 为 true 时有效 | Snippet | - |
| defaultOpen | 面板默认显示或隐藏 | boolean | false |
| defaultPickerValue | 默认面板日期（仅控制面板首次展开时显示哪个月/年，不改变选中值） | `Date` \| `Date[]` | - |
| defaultValue | 默认值 | `Date` \| `Date[]` \| `[Date, Date]` | - |
| dateFnsLocale | date-fns locale 对象，驱动日期解析/格式化的本地化 | `Locale` | 跟随 LocaleProvider |
| density | 面板的尺寸，可选值：`default`、`compact` | string | 'default' |
| disabled | 是否禁用 | boolean | false |
| disabledDate | 日期禁止判断方法，返回为 true 时禁止该日期。第二参 `options` 含 `` `{ rangeStart, rangeEnd, rangeInputFocus }` `` | `(date: Date, options: { rangeStart: string; rangeEnd: string; rangeInputFocus: 'rangeStart' \| 'rangeEnd' \| false }) => boolean` | - |
| disabledTime | 时间禁止配置，返回值将会透传给 TimePicker。第二参 `panelType` 为 `'left'` \| `'right'`（range 场景区分左右面板） | `(date: Date, panelType?: string) => object` | - |
| disabledTimePicker | 是否禁止时间选择 | boolean | false |
| dropdownClassName | 下拉浮层的 CSS 类名 | string | - |
| dropdownStyle | 下拉浮层的内联样式 | `string` \| object | - |
| dropdownMargin | 下拉浮层算溢出时增加的冗余值，作用同 Tooltip margin | `number` \| `{ x?: number; y?: number }` | - |
| endDateOffset | type 为 dateRange 时，设置单击选择范围的结束日期 | `(date: Date) => Date` | - |
| format | 在输入框内展现的日期串格式（token 用大写 `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss`） | string | 与 type 对应，详见[日期时间格式](#日期时间格式) |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative` | `() => HTMLElement` | `() => document.body` |
| hideDisabledOptions | 隐藏禁止选择的时间 | boolean | false |
| insetInput | 面板中是否嵌入输入框 | boolean | false |
| inputReadOnly | 文本框是否 readonly | boolean | false |
| inputStyle | 输入框样式 | `string` \| object | - |
| insetLabel | 内嵌标签：浮入触发器左侧的常驻标签 | `string` \| Snippet | - |
| insetLabelId | 内嵌标签容器 id，供 `aria-labelledby` 关联 | string | - |
| leftSlot | 渲染左侧额外区域 | Snippet | - |
| locale | 局部覆盖本组件文案，只需给要改的字段，未给的回退 LocaleProvider | `` `Partial<Locale['DatePicker']>` `` | 跟随 LocaleProvider |
| localeCode | 覆盖 BCP 47 语言代码，驱动月份/星期的 Intl 本地化 | string | 跟随 LocaleProvider |
| max | multiple 为 true 时，多选的数目，不传或为 null/undefined 则无限制 | number | - |
| motion | 是否开启面板展开的动画 | boolean | true |
| multiple | 是否可以选择多个，仅支持 type="date" | boolean | false |
| needConfirm | 是否需要“确认选择”，仅 type="dateTime"/"dateTimeRange" 时有效。开启后面板选择只暂存，点“确定”才写入并触发 `onChange` | boolean | false |
| open | 面板显示或隐藏的受控属性 | boolean | - |
| placeholder | 输入框提示文字 | string | - |
| position | 浮层位置，可选值同 Popover position | string | 'bottomLeft' |
| prefix | 前缀内容，渲染在 input 左侧 | `string` \| Snippet | - |
| presets | 日期时间快捷方式，每项为 `` `{ text, start, end }` ``（`start`/`end` 支持 `Date`、时间戳、日期串或返回它们的函数） | `` `Array<PresetType \| (() => PresetType)>` `` | `[]` |
| presetPosition | 快捷方式面板位置，可选值 `'left'`、`'right'`、`'top'`、`'bottom'` | string | 'bottom' |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus | boolean | false |
| rangeSeparator | 自定义范围类型输入框的日期分隔符 | string | ' ~ ' |
| rangeSeparatorNode | 自定义范围类型输入框分隔符的渲染节点（仅影响 UI，字符串解析仍使用 rangeSeparator） | `string` \| Snippet | - |
| renderDate | 自定义日期显示内容 | `Snippet<[{ day: number; fullDate: string }]>` | - |
| renderFullDate | 自定义日期格子内容 | `Snippet<[{ day: number; fullDate: string; dayStatus: DayStatus }]>` | - |
| rightSlot | 渲染右侧额外区域 | Snippet | - |
| showClear | 是否显示清除按钮 | boolean | true |
| size | 尺寸，可选值：`small`、`default`、`large` | string | 'default' |
| spacing | 浮层与 trigger 的距离 | number | - |
| startDateOffset | type 为 dateRange 时，设置单击选择范围的开始日期 | `(date: Date) => Date` | - |
| startYear | 年份滚轮的开始年 | number | 当前年前 100 年 |
| endYear | 年份滚轮的结束年 | number | 当前年后 100 年 |
| stopPropagation | 是否阻止弹出层上的点击事件冒泡 | boolean | true |
| style | 根节点自定义样式 | string | - |
| syncSwitchMonth | 在范围选择的场景中，支持同步切换双面板的月份 | boolean | false |
| timePickerOpts | 透传给时间选择器的参数（`showSecond`、`use12Hours`、`scrollItemProps` 等） | object | - |
| timeZone | 按指定时区显示/解析日期时间（作用于显示格式化层） | `string` \| number | - |
| topSlot | 渲染顶部额外区域 | Snippet | - |
| triggerRender | 自定义触发器渲染 | `Snippet<[{ value; placeholder }]>` | - |
| type | 类型，可选值：`date`、`dateRange`、`dateTime`、`dateTimeRange`、`month`、`monthRange` | string | 'date' |
| validateStatus | 校验状态，可选值 `default`、`warning`、`error`，仅影响展示样式 | string | 'default' |
| value | 受控的值 | `Date` \| `Date[]` \| `[Date, Date]` | - |
| weekStartsOn | 以周几作为每周第一天，0 代表周日，1 代表周一，以此类推 | number | 0 |
| zIndex | 弹出面板的 zIndex | number | 1030 |
| onBlur | 失去焦点时的回调，范围选择时不推荐使用 | `(e: FocusEvent) => void` | - |
| onCancel | 取消选择时的回调，仅 needConfirm 时有效 | `(date, dateString: string) => void` | - |
| onChange | 值变化时的回调 | `(value, dateString: string) => void` | - |
| onChangeWithDateFirst | 控制 onChange 参数顺序，默认 `(value, dateString)`；false 时 `(dateString, value)` | boolean | true |
| onClear | 点击清除按钮时触发 | `(e) => void` | - |
| onClickOutSide | 弹出层展示时，点击非弹出层、触发器的回调 | `(e: MouseEvent) => void` | - |
| onConfirm | 确认选择时的回调，仅 needConfirm 时有效 | `(date, dateString: string) => void` | - |
| onFocus | 获得焦点时的回调，范围选择时不推荐使用 | `(e: FocusEvent) => void` | - |
| onMaxLimit | multiple 多选达到 `max` 上限后继续选择时的回调 | `() => void` | - |
| onOpenChange | 面板显示或隐藏状态切换的回调 | `(open: boolean) => void` | - |
| onPanelChange | 切换面板的年份或者月份时的回调 | `(date: Date \| Date[], dateString: string \| string[]) => void` | - |
| onPresetClick | 点击快捷选择按钮的回调 | `(item, e?: MouseEvent) => void` | - |
| yearAndMonthOpts | 透传给年月滚轮的参数（`yearCyclic`/`monthCyclic`） | object | - |

## Methods

绑定组件实例（`bind:this`）后可调用以下方法：

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| open | 手动展开下拉列表 | `() => void` |
| close | 手动关闭下拉列表 | `() => void` |
| focus | 手动聚焦输入框 | `(focusType?: 'rangeStart' \| 'rangeEnd') => void` |
| blur | 手动失焦输入框 | `() => void` |

<DemoBox code={methodsSrc}><Methods /></DemoBox>

## 类型定义

```typescript
type RangeValue = [Date | null, Date | null];

type BaseValueType = string | number | Date;

interface PresetType {
    text?: string;
    start?: BaseValueType | (() => BaseValueType);
    end?: BaseValueType | (() => BaseValueType);
}

interface DisabledDateOptions {
    rangeStart: string;
    rangeEnd: string;
    rangeInputFocus: 'rangeStart' | 'rangeEnd' | false;
}

interface DayStatus {
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isInMonth: boolean;
    isSelectedStart: boolean;
    isSelectedEnd: boolean;
    isInRange: boolean;
    isHover: boolean;
    isOffsetRangeStart: boolean;
    isOffsetRangeEnd: boolean;
    isHoverInOffsetRange: boolean;
}
```

## Accessibility

### ARIA

- 触发器使用 `` `<input role="combobox" aria-haspopup="dialog" aria-expanded aria-controls>` ``，`status=error` 时 `aria-invalid="true"`。
- 日期面板中月的 role 为 `grid`，周的 role 设置为 `row`，日期格子设置为 `gridcell`。
- 日期和时间禁用时对应选项的 `aria-disabled` 为 true。
- 多选时，月的 `aria-multiselectable` 为 true，选中时日期格子的 `aria-selected` 为 true。
- 面板中一些装饰作用的 icon，它们的 `aria-hidden` 为 true。

### 键盘交互

- 网格内 roving tabindex：方向键移动一天/一周；`Home`/`End` 跳本周首/末；`PageUp`/`PageDown` 上/下月；`Enter`/`Space` 选中；`Esc` 关闭面板焦点回触发器；`Tab` 在面板内循环。
- 打开面板焦点移至今天或已选日期格，关闭后焦点回触发器。

## 文案规范

- 日期选择器建议搭配标签使用。
- 使用简洁的标签来表明日期选择所指的内容。

## 日期时间格式

组件库中采用 date-fns 风格的格式化 token（本库使用大写形态），含义如下：

- `Y` ：年
- `M` ：月
- `D` ：日
- `H` ：小时
- `m` ：分钟
- `s` ：秒

下面以 `new Date('2023-12-09 08:08:00')` 和 `[new Date('2023-12-09 08:08:00'), new Date('2023-12-10 10:08:00')]` 为例说明不同 `format` 值对展示值的影响：

| 类型 | format | 展示值 |
| --- | --- | --- |
| date | YYYY-MM-DD | 2023-12-09 |
| dateTime | YYYY-MM-DD HH:mm:ss | 2023-12-09 08:08:00 |
| month | YYYY-MM | 2023-12 |
| dateRange | YYYY-MM-DD | 2023-12-09 ~ 2023-12-10 |
| dateTimeRange | YYYY-MM-DD HH:mm:ss | 2023-12-09 08:08:00 ~ 2023-12-10 10:08:00 |

## FAQ

- **日期时间选择器，时分秒选择时想要无限滚动效果如何实现？**

    内部时间列默认为 `normal` 模式（点击选中），若想应用无限滚动的滚轮效果，可以通过 `timePickerOpts` 传入 `` `{ scrollItemProps: { mode: 'wheel', cycled: true } }` ``。

- **如何设置面板打开时默认显示的时间？**

    可通过 `defaultPickerValue` 属性。

- **日期时间选择、范围日期选择，输入部分日期后，面板没有回显日期？**

    输入框需要输入完整后才会回显到面板上。比如日期时间选择，完整要求日期和时间都已输入；范围日期选择，完整要求开始日期和结束日期都已输入。
