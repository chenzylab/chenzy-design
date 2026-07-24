---
title: Slider 滑动选择器
name: slider
category: input
brief: 滑动选择器，使用拖动交互快速选择数值或数值范围，与 InputNumber 相比更直观。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/slider/01-basic.svelte';
  import basicSrc from '../../demos/slider/01-basic.svelte?raw';
  import WithInput from '../../demos/slider/02-with-input.svelte';
  import withInputSrc from '../../demos/slider/02-with-input.svelte?raw';
  import TipFormatter from '../../demos/slider/03-tip-formatter.svelte';
  import tipFormatterSrc from '../../demos/slider/03-tip-formatter.svelte?raw';
  import Marks from '../../demos/slider/04-marks.svelte';
  import marksSrc from '../../demos/slider/04-marks.svelte?raw';
  import RailGradient from '../../demos/slider/05-rail-gradient.svelte';
  import railGradientSrc from '../../demos/slider/05-rail-gradient.svelte?raw';
  import Controlled from '../../demos/slider/06-controlled.svelte';
  import controlledSrc from '../../demos/slider/06-controlled.svelte?raw';
  import Vertical from '../../demos/slider/07-vertical.svelte';
  import verticalSrc from '../../demos/slider/07-vertical.svelte?raw';
  import HandleDot from '../../demos/slider/08-handle-dot.svelte';
  import handleDotSrc from '../../demos/slider/08-handle-dot.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Slider } from '@chenzy-design/svelte';
```

### 基本用法

基本滑动条。当 `range` 为 `true` 时，支持两侧滑动。当 `disabled` 为 `true` 时，滑块处于不可用状态。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 带输入框的

滑动条的滑块和输入框组件保持同步。

<DemoBox code={withInputSrc}><WithInput /></DemoBox>

### 自定义提示

使用 `tipFormatter` 可以设置 Tooltip 的显示的格式。设置 `tipFormatter={null}`，则隐藏 Tooltip。`getAriaValueText` 用于给滑块的当前值提供一个用户友好的名称，对屏幕阅读器用户很重要。

<DemoBox code={tipFormatterSrc}><TipFormatter /></DemoBox>

### 带标签的

使用 `marks` 属性标注滑块的刻度，使用 `value` / `defaultValue` 指定滑块位置。

<DemoBox code={marksSrc}><Marks /></DemoBox>

### 分段背景

通过使用 `linear-gradient` 及 `railStyle`，配合 `onChange` 可以实现动态的分段背景效果。

<DemoBox code={railGradientSrc}><RailGradient /></DemoBox>

### 受控组件

滑块位置即 `Slider` 的值由 `value` 控制，配合 `onChange` 使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 垂直

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

### 滑块带圆点

<DemoBox code={handleDotSrc}><HandleDot /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| ariaLabel | `aria-label` 属性，用来给当前元素加上的标签描述，提升可访问性 | string | - | - |
| ariaLabelledby | `aria-labelledby` 属性，表明某些元素的 id 是某一对象的标签 | string | - | - |
| ariaValuetext | `aria-valuetext` 属性，为滑块的当前值提供用户友好的名称 | string | - | - |
| defaultValue | 设置初始取值 | `number \| number[]` | 0 | - |
| disabled | 滑块是否禁用 | boolean | false | - |
| handleDot | 滑块是否带有圆点 | `{ color?: string, size?: string } \| { color?: string, size?: string }[]` | - | |
| included | `marks` 不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列 | boolean | true | - |
| marks | 刻度，key 的类型必须为 `number` 且取值在闭区间 `[min, max]` 内 | `Record<number, string>` | - | - |
| max | 最大值 | number | 100 | - |
| min | 最小值 | number | 0 | - |
| railStyle | 滑块轨道的样式 | string | - | - |
| range | 是否支持两边同时可滑动 | boolean | false | - |
| showArrow | tooltip 是否带箭头 | boolean | true | |
| showBoundary | 是否在 hover 时展示最大值最小值 | boolean | false | - |
| showMarkLabel | 是否显示刻度标签 | boolean | true | |
| step | 步长 | number | 1 | - |
| tipFormatter | 设置 Tooltip 的展示格式，默认显示当前选值 | `(value: number) => string \| number \| null \| undefined` | v => v | - |
| tooltipOnMark | 滑轨上的 mark 是否带有 tooltip | boolean | false | |
| tooltipVisible | 是否始终显示 Tooltip | boolean | - | - |
| value | 设置当前取值 | `number \| number[]` | - | - |
| vertical | 是否设置方向为垂直 | boolean | false | - |
| verticalReverse | 反转垂直方向，即上大下小 | boolean | false | - |
| onAfterChange | 值变化后触发，把当前值作为参数传入 | `(value: number \| number[]) => void` | - | - |
| onChange | 当 Slider 的值发生改变时的回调 | `(value: number \| number[]) => void` | - | - |
| onMouseUp | 鼠标松开滑块时触发 | `(e: MouseEvent) => void` | - | - |
| getAriaValueText | 用于给滑块的当前值提供一个用户友好的名称，参数 value 为当前滑块的值，index 为当前滑块的顺序 | `(value: number, index?: number) => string` | - | - |

## Accessibility

### ARIA

- Slider 可聚焦的控制元素 role 为 `slider`。
- 元素的 `aria-valuenow` 属性为当前值的十进制数值。
- 元素的 `aria-valuemin` 属性为最小允许值的十进制数值。
- 元素的 `aria-valuemax` 属性为最大允许值的十进制数值。
- 当 Slider 为纵向时，元素的 `aria-orientation` 属性为 `vertical`。
- 当 `aria-valuenow` 的值不容易被理解时，支持通过 API `aria-valuetext` 传递一个字符串使其更友好。也可以通过 API `getAriaValueText(value, index)` 方法得到 `aria-valuetext` 的值。
- 支持通过 API `aria-label` 或者 `aria-labelledby` 确定 slider 的标签。

### 键盘和焦点

- Slider 的滑块可被获取到焦点，并展示当前滑块的提示信息，且这些信息需要被辅助技术读取到。
- 当用户使用 `range` 属性时，可以使用 `Tab` 及 `Shift` + `Tab` 切换左右两个滑块的焦点。
- 键盘用户可以通过 `上箭头` 或 `右箭头` 来增加滑块值，`下箭头` 或 `左箭头` 来减少滑块值。
- 若想要滑块高于步长的变化量时，Slider 支持 10\*step 的变化量：`Page Up` 用于增加，`Page Down` 用于减少。
- 若想将滑块移动到滑杆的最小值处，使用 `Home`；移动到最大值处，使用 `End`。
