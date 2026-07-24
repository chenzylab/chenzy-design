---
title: Progress 进度条
name: progress
category: feedback
brief: 用于展示用户操作的当前进度和状态，一般在操作耗时较长时使用。也可用来表示任务/对象的完成度。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Line from '../../demos/progress/01-line.svelte';
  import lineSrc from '../../demos/progress/01-line.svelte?raw';
  import Info from '../../demos/progress/02-info.svelte';
  import infoSrc from '../../demos/progress/02-info.svelte?raw';
  import Vertical from '../../demos/progress/03-vertical.svelte';
  import verticalSrc from '../../demos/progress/03-vertical.svelte?raw';
  import Circle from '../../demos/progress/04-circle.svelte';
  import circleSrc from '../../demos/progress/04-circle.svelte?raw';
  import CircleSmall from '../../demos/progress/05-circle-small.svelte';
  import circleSmallSrc from '../../demos/progress/05-circle-small.svelte?raw';
  import DynamicLine from '../../demos/progress/06-dynamic-line.svelte';
  import dynamicLineSrc from '../../demos/progress/06-dynamic-line.svelte?raw';
  import DynamicCircle from '../../demos/progress/07-dynamic-circle.svelte';
  import dynamicCircleSrc from '../../demos/progress/07-dynamic-circle.svelte?raw';
  import Format from '../../demos/progress/08-format.svelte';
  import formatSrc from '../../demos/progress/08-format.svelte?raw';
  import Linecap from '../../demos/progress/09-linecap.svelte';
  import linecapSrc from '../../demos/progress/09-linecap.svelte?raw';
  import StrokeArray from '../../demos/progress/10-stroke-array.svelte';
  import strokeArraySrc from '../../demos/progress/10-stroke-array.svelte?raw';
  import StrokeGradient from '../../demos/progress/11-stroke-gradient.svelte';
  import strokeGradientSrc from '../../demos/progress/11-stroke-gradient.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Progress } from '@chenzy-design/svelte';
```

### 标准的进度条

通过`stroke`属性来控制进度条的填充色
通过`percent`属性控制已完成的进度
通过`size`属性控制进度条尺寸
通过`aria-label`说明进度条具体代表含义
如果`size`预设的尺寸不满足，可以通过`style`传入 height 自定义进度条高度

<DemoBox code={lineSrc}><Line /></DemoBox>

### 展示百分比文本

通过`showInfo`控制是否展示百分比数字，可以通过`format`格式化展示文本

<DemoBox code={infoSrc}><Info /></DemoBox>

### 垂直的进度条

设置`direction='vertical'`，展示垂直进度条，可以通过`style`传入 width 控制进度条宽度

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

### 环形进度条

将 type 设为`circle`，进度条将会展示成环状。进度条默认尺寸为 72 x 72

<DemoBox code={circleSrc}><Circle /></DemoBox>

### 小号的环形进度条

小号进度条默认尺寸为 24 x 24

<DemoBox code={circleSmallSrc}><CircleSmall /></DemoBox>

### 动态改变进度

<DemoBox code={dynamicLineSrc}><DynamicLine /></DemoBox>

<DemoBox code={dynamicCircleSrc}><DynamicCircle /></DemoBox>

### 自定义中心文字内容

你可以通过传入 `format` 函数自定义中心文字，`format` 的入参为当前百分比
如果不需要中心文本内容，你可以将 `showInfo` 设为 false，或者在 `format` 中直接返回空字符串

<DemoBox code={formatSrc}><Format /></DemoBox>

### 圆角/方角边缘

通过 strokeLinecap 属性，你可以控制环形进度条边缘形状

<DemoBox code={linecapSrc}><Linecap /></DemoBox>

### 自定义进度条颜色

可通过设置 `stroke` 属性，自定义具体 `percent` 的颜色

<DemoBox code={strokeArraySrc}><StrokeArray /></DemoBox>

### 自动补齐颜色区间

可通过设置 `strokeGradient` 属性，属性为 `true` 时自动补齐颜色区间，生成渐变色

<DemoBox code={strokeGradientSrc}><StrokeGradient /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| aria-label | `aria-label` 属性，用来给当前元素加上标签描述，用于提升可访问性 | string | - |
| aria-labelledby | `aria-labelledby` 属性，表明某些元素的 id 是当前元素的标签 | string | - |
| aria-valuetext | `aria-valuetext` 属性，用于提升可访问性 | string | - |
| class | 样式类名 | string | - |
| direction | 条状进度条方向 `horizontal`、`vertical` | string | `horizontal` |
| format | 格式化函数，入参为当前百分比，return 的结果将会直接渲染在圆形进度条中心 | (percent: number) => string \| null | (percent) => percent + '%' |
| id | id 标识 | string | - |
| orbitStroke | 进度条轨道填充色 | string | `var(--cd-color-fill-0)` |
| percent | 进度百分比 | number | - |
| showInfo | 环形进度条是否显示中间文本，条状进度条右侧是否显示文本 | boolean | false |
| size | 尺寸，可选 `default`、`small`（仅 type=circle 生效）、`large`（仅 type=line 生效） | string | `default` |
| stroke | 进度条填充色，类型为 `Array<{ percent: number; color: string }>` 时，`color` 支持 `Hex` \| `Hsl` \| `Hsla` \| `Rgb` \| `Rgba` \| Design Token | string \| `Array<{ percent: number; color: string }>` | `var(--cd-color-success)` |
| strokeGradient | 是否自动生成渐变色补齐区间颜色，需要 `stroke` 设置至少一个颜色区间 | boolean | false |
| strokeLinecap | 圆角 `round` / 方角 `square`（仅在 type='circle' 模式下生效） | string | `round` |
| strokeWidth | type 为 `circle` 时，该属性控制进度条宽度 | number | 4 |
| style | 样式 | string | - |
| type | 类型，可选 `line`、`circle` | string | `line` |
| width | 环形进度条宽度 | number | size='default' 时为 72，'small' 为 24 |

## Accessibility

### ARIA

- Progress 具有 `progressbar` role 来表示它是一个进度条组件。
- Progress 会自动将 `aria-valuenow` 设置为传递给组件的进度百分比（`percent`），以确保屏幕阅读器可以获取正确的百分比数值。另外，Progress 支持传入 `aria-valuetext`，当你传入时，根据 W3C 规范，`aria-valuetext` 将优先被屏幕阅读器消费，而不是 `aria-valuenow`。
- Progress 支持传入 `aria-label`、`aria-labelledby`
  - 当 Progress 外部存在关于 Progress 作用的描述元素时，你可以通过 aria-labelledby 显式指定某些元素的 id 是 Progress 的标签
  - 否则你应当通过 aria-label 说明 Progress 所代表的具体数值含义

## 文案规范

- 如果进度条过程复杂，或者有很长的等待时间，可以使用帮助文本来做说明。这样可以让用户知道正在发生的进度进展
