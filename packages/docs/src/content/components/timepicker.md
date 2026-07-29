---
title: TimePicker 时间选择器
name: timepicker
category: input
brief: 用户使用时间选择器可以方便地选择某一符合要求的、格式化的时间点
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/time-picker/01-basic.svelte';
  import basicSrc from '../../demos/time-picker/01-basic.svelte?raw';
  import ScrollWheel from '../../demos/time-picker/02-scroll-wheel.svelte';
  import scrollWheelSrc from '../../demos/time-picker/02-scroll-wheel.svelte?raw';
  import Controlled from '../../demos/time-picker/03-controlled.svelte';
  import controlledSrc from '../../demos/time-picker/03-controlled.svelte?raw';
  import FormatDemo from '../../demos/time-picker/04-format.svelte';
  import formatSrc from '../../demos/time-picker/04-format.svelte?raw';
  import PanelHeaderFooter from '../../demos/time-picker/05-panel-header-footer.svelte';
  import panelHeaderFooterSrc from '../../demos/time-picker/05-panel-header-footer.svelte?raw';
  import DisabledDemo from '../../demos/time-picker/06-disabled.svelte';
  import disabledSrc from '../../demos/time-picker/06-disabled.svelte?raw';
  import StepDemo from '../../demos/time-picker/07-step.svelte';
  import stepSrc from '../../demos/time-picker/07-step.svelte?raw';
  import Use12Hours from '../../demos/time-picker/08-use12hours.svelte';
  import use12HoursSrc from '../../demos/time-picker/08-use12hours.svelte?raw';
  import TimeRange from '../../demos/time-picker/09-time-range.svelte';
  import timeRangeSrc from '../../demos/time-picker/09-time-range.svelte?raw';
  import DisabledTime from '../../demos/time-picker/10-disabled-time.svelte';
  import disabledTimeSrc from '../../demos/time-picker/10-disabled-time.svelte?raw';
  import TriggerRender from '../../demos/time-picker/11-trigger-render.svelte';
  import triggerRenderSrc from '../../demos/time-picker/11-trigger-render.svelte?raw';
  import TimeZone from '../../demos/time-picker/12-timezone.svelte';
  import timeZoneSrc from '../../demos/time-picker/12-timezone.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { TimePicker } from '@chenzy-design/svelte';
```

### 基础使用

点击 TimePicker，然后可以在浮层中选择或者输入某一时间。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 无限滚动

时间列内 ScrollItem 的默认模式为 `normal`，若想应用无限滚动的效果，可参考以下示例。

<DemoBox code={scrollWheelSrc}><ScrollWheel /></DemoBox>

### 受控组件

当使用 `value` 而不是 `defaultValue` 时，作为受控组件使用。`value` 和 `onChange` 需要配合使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 不同的 Format 格式

TimePicker 浮层中的列会随着 `format` 变化，当略去 `format` 中的某部分时，浮层中对应的列也会消失。

<Notice type="primary" title="注意事项">
  `format` 遵循 date-fns 的 `format` 格式，详见 <a href="https://date-fns.org/v2.0.0/docs/format" target="_blank" rel="noreferrer">date-fns format</a>。
</Notice>

<DemoBox code={formatSrc}><FormatDemo /></DemoBox>

### 设置面板头部，底部

通过 `panelHeader`、`panelFooter` 设置面板的头部与底部内容。`type="timeRange"` 时可传入数组，分别指定左右两个面板。

<Notice type="primary" title="注意事项">
  React 中 <code>panelHeader</code> / <code>panelFooter</code> 接收 ReactNode，本库对应传入 snippet（纯文本可直接传字符串）。
</Notice>

<DemoBox code={panelHeaderFooterSrc}><PanelHeaderFooter /></DemoBox>

### 禁用时间选择

<DemoBox code={disabledSrc}><DisabledDemo /></DemoBox>

### 设置步长

可以使用 `hourStep`, `minuteStep`, `secondStep` 按步长展示可选的时分秒。

<DemoBox code={stepSrc}><StepDemo /></DemoBox>

### 12 小时制

12 小时制的时间选择器，默认的 `format` 为 `a h:mm:ss`，传入的 `format` 格式必须在 <a href="https://date-fns.org/v2.0.0/docs/format" target="_blank" rel="noreferrer">dateFns 日期格式</a>范围之内。

> 例如默认的 12 小时制格式串为：`a h:mm:ss`，如果传入 `A h:mm:ss` 则会导致无法正确格式化。

<DemoBox code={use12HoursSrc}><Use12Hours /></DemoBox>

### 时间范围

传入 `type="timeRange"` 开启时间范围选择。

<DemoBox code={timeRangeSrc}><TimeRange /></DemoBox>

### Range 模式下分别禁用左右面板（disabledTime）

当 `type="timeRange"` 时，你可以通过 `disabledTime(value, panelType)` 对左右面板分别应用不同的禁用规则。

- `value`：当前面板对应的已选时间（`Date` 或 `null`）
- `panelType`：`'left' | 'right'`，分别代表开始/结束面板

下面示例实现：选择开始时间后，右侧结束时间面板会禁用早于开始时间的选项。

<DemoBox code={disabledTimeSrc}><DisabledTime /></DemoBox>

### 自定义触发器

默认情况下我们使用 `Input` 组件作为 `TimePicker` 组件的触发器，通过传递 `triggerRender` 你可以自定义这个触发器。

<Notice type="primary" title="注意事项">
  React 中 <code>triggerRender</code> 是渲染函数，本库对应带参 snippet，入参为 <code>{'{ value, placeholder, open, disabled }'}</code>。
</Notice>

<DemoBox code={triggerRenderSrc}><TriggerRender /></DemoBox>

## 时区设置

所有关于时区的配置都收敛在 ConfigProvider 中，详细使用可以参考 [ConfigProvider](/components/configprovider)。组件自身的 `timeZone` 优先，未传时回退 ConfigProvider。

<DemoBox code={timeZoneSrc}><TimeZone /></DemoBox>

## API 参考

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoAdjustOverflow | 浮层被遮挡时是否自动调整方向 | boolean | true |
| autoFocus | 自动获取焦点 | boolean | false |
| borderless | 无边框模式 | boolean | false |
| class | 外层样式名 | string | - |
| clearIcon | 可用于自定义清除按钮，showClear 为 true 时有效 | Snippet | - |
| clearText | 清除按钮的无障碍文案 | string | `'clear'` |
| dateFnsLocale | date-fns locale 对象，驱动时间串格式化的本地化（如 AM/PM 文案） | Locale | - |
| defaultOpen | 面板是否默认打开 | boolean | false |
| defaultValue | 默认时间 | Date \| string（type="timeRange" 时为数组） | null |
| disabled | 禁用全部操作 | boolean | false |
| disabledHours | 禁止选择部分小时选项 | () => number[] | - |
| disabledMinutes | 禁止选择部分分钟选项 | (selectedHour: number) => number[] | - |
| disabledSeconds | 禁止选择部分秒选项 | (selectedHour: number, selectedMinute: number) => number[] | - |
| disabledTime | **仅在 range 模式生效**：根据当前已选时间与面板位置返回 disabled 配置，左右面板可分别给出不同规则。返回值中存在的字段会**覆盖**对应的顶层 disabledHours / disabledMinutes / disabledSeconds，未返回的字段则**回退**到顶层。单选模式下请直接使用顶层 disabledHours / disabledMinutes / disabledSeconds | `(value: Date \| null, panelType?: 'left' \| 'right') => object` | - |
| dropdownMargin | 浮层算溢出时增加的冗余值，作用同 Tooltip margin | `number \| object` | - |
| focusOnOpen | 打开面板时是否 focus 触发器 | boolean | false |
| format | 展示的时间格式 | string | `'HH:mm:ss'`，use12Hours 为 true 时为 `'a h:mm:ss'` |
| getPopupContainer | 指定容器，浮层将会渲染至该元素内，自定义需要设置 `position: relative` | () => HTMLElement | () => document.body |
| hideDisabledOptions | 隐藏禁止选择的选项 | boolean | false |
| hourStep | 小时选项间隔 | number | 1 |
| id | 根节点 id | string | - |
| inputReadOnly | 设置输入框为只读（避免在移动设备上打开虚拟键盘） | boolean | false |
| inputStyle | 输入框样式 | `string \| object` | - |
| insetLabel | 内嵌标签 | `string \| Snippet` | - |
| insetLabelId | 内嵌标签容器 id | string | - |
| locale | locale 代码（Intl 本地化用） | string | `'zh-CN'` |
| minuteStep | 分钟选项间隔 | number | 1 |
| motion | 是否展示弹出层动画 | boolean | true |
| open | 面板是否打开的受控属性 | boolean | - |
| panelFooter | 面板底部 addon，range 模式可传数组分别指定两端 | `string \| Snippet \| Array` | - |
| panelHeader | 面板头部 addon，range 模式可传数组分别指定两端 | `string \| Snippet \| Array` | - |
| panels | range 模式下按面板分别指定内容，优先级高于 panelHeader / panelFooter | Array | - |
| placeholder | 没有值的时候显示的内容 | string | `'请选择时间'` |
| popupClassName | 弹出层类名 | string | - |
| popupStyle | 弹出层样式 | `string \| object` | - |
| position | 浮层位置 | string | `'bottomLeft'` |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | false |
| rangeSeparator | 时间范围分隔符 | string | `' ~ '` |
| scrollItemProps | 透传给时间列的属性，可选值同 [ScrollList](/components/scrolllist) 的 ScrollItem | object | - |
| secondStep | 秒选项间隔 | number | 1 |
| showClear | 是否展示清除按钮 | boolean | true |
| size | 输入框的大小，可选 `default`、`small`、`large` | string | `'default'` |
| stopPropagation | 是否阻止弹出层上的点击事件冒泡 | boolean | true |
| style | 根节点内联样式 | string | - |
| timeZone | 时区（数字偏移 / `GMT±HH:mm` / IANA），自身优先，未传回退 ConfigProvider | `string \| number` | - |
| triggerRender | 自定义触发器渲染，入参 `{ value, placeholder, open, disabled }` | Snippet | - |
| type | 类型 | `'time' \| 'timeRange'` | `'time'` |
| use12Hours | 使用 12 小时制，为 true 时 `format` 默认为 `a h:mm:ss` | boolean | false |
| validateStatus | 校验状态，可选 `default`、`warning`、`error`，仅影响展示样式 | string | `'default'` |
| value | 当前时间 | Date \| string（type="timeRange" 时为数组） | - |
| zIndex | 浮层层级 | number | 1030 |
| onBlur | 失去焦点时的回调 | (e: FocusEvent) => void | - |
| onChange | 时间发生变化的回调（type="timeRange" 时入参为数组） | (value) => void | - |
| onChangeWithDateFirst | 设置为 `true` 时 onChange 的入参顺序为 (Date, string)，`false` 时为 (string, Date) | boolean | true |
| onFocus | 获得焦点时的回调 | (e: FocusEvent) => void | - |
| onOpenChange | 面板打开/关闭时的回调 | (isOpen: boolean) => void | - |

### 无障碍属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaDescribedby | 关联描述元素的 id | string | - |
| ariaErrormessage | 关联错误信息元素的 id | string | - |
| ariaInvalid | 校验失败态 | boolean | - |
| ariaLabelledby | 关联标签元素的 id | string | - |
| ariaRequired | 必填态 | boolean | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 调用实现某些特殊交互。

| 名称 | 描述 |
| --- | --- |
| blur() | 移除焦点 |
| focus() | 获取焦点 |

## Accessibility

- 触发器使用 `aria-haspopup="dialog"`，配合 `aria-expanded`、`aria-controls` 指向浮层；`validateStatus="error"` 时 `aria-invalid="true"`。
- 浮层使用 `role="dialog"` 包裹，每列使用 `role="listbox"` 带 aria-label（如「小时」「分钟」「秒」），列项使用 `role="option"` 配合 `aria-selected`、`aria-disabled`。
- 禁用项 `aria-disabled="true"` 且不可点击；`hideDisabledOptions` 时直接从列中移除。
- 键盘交互：`Enter` 提交输入内容并打开浮层；`ArrowDown` 打开浮层；`Esc` 关闭浮层。

## 文案规范

- 时间选择器至少包括时和分，如：11:30，它在本地化过程中，可以适应为 12 小时制或者 24 小时制。
- 当选择 12 小时制，需要和 AM/PM 一起搭配使用。
