---
title: Carousel 轮播图
name: carousel
category: show
brief: 轮播图是一种媒体组件，可以在可视化应用中展示多张图片轮流播放的效果。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/carousel/01-basic.svelte';
  import basicSrc from '../../demos/carousel/01-basic.svelte?raw';
  import ThemeDemo from '../../demos/carousel/02-theme.svelte';
  import themeSrc from '../../demos/carousel/02-theme.svelte?raw';
  import Indicator from '../../demos/carousel/03-indicator.svelte';
  import indicatorSrc from '../../demos/carousel/03-indicator.svelte?raw';
  import Arrow from '../../demos/carousel/04-arrow.svelte';
  import arrowSrc from '../../demos/carousel/04-arrow.svelte?raw';
  import CustomArrow from '../../demos/carousel/05-custom-arrow.svelte';
  import customArrowSrc from '../../demos/carousel/05-custom-arrow.svelte?raw';
  import AutoPlay from '../../demos/carousel/06-autoplay.svelte';
  import autoPlaySrc from '../../demos/carousel/06-autoplay.svelte?raw';
  import Animation from '../../demos/carousel/07-animation.svelte';
  import animationSrc from '../../demos/carousel/07-animation.svelte?raw';
  import Controlled from '../../demos/carousel/08-controlled.svelte';
  import controlledSrc from '../../demos/carousel/08-controlled.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Carousel } from '@chenzy-design/svelte';
```

### 基本用法

本库以 `slides` 数组（每项一个 Snippet）承载幻灯片内容（对齐 Semi 的 children 声明式写法）。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 主题切换

默认定义了三种主题：`primary`、`light`、`dark`

<DemoBox code={themeSrc}><ThemeDemo /></DemoBox>

### 指示器

指示器可以调节类型、位置、尺寸
类型：`dot`、`line`、`columnar`
位置：`left`、`center`、`right`
尺寸：`small`、`medium`

<DemoBox code={indicatorSrc}><Indicator /></DemoBox>

### 箭头

通过 `showArrow` 控制箭头是否展示，`arrowType` 控制箭头展示时机（`hover`、`always`）。

<DemoBox code={arrowSrc}><Arrow /></DemoBox>

### 定制箭头

通过 arrowProps 属性定制箭头样式和点击事件

<DemoBox code={customArrowSrc}><CustomArrow /></DemoBox>

### 播放参数

通过给 autoPlay 传入参数 interval 控制两张图片之间的时间间隔，传入 hoverToPause 控制鼠标放置在图片上时是否停止播放

<DemoBox code={autoPlaySrc}><AutoPlay /></DemoBox>

### 动画效果与切换速度

通过给 animation 属性控制动画，可选值有 `fade`，`slide`
通过给 speed 属性控制两张图片之间的切换时间，单位为 ms

<DemoBox code={animationSrc}><Animation /></DemoBox>

### 受控的轮播图

通过 `activeIndex` 受控当前激活的索引，通过 `onChange` 感知切换。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

## API 参考

### Carousel

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeIndex | 受控属性 | number | - |
| animation | 切换动画，可选值：`fade`，`slide` | `fade` \| `slide` | `slide` |
| arrowProps | 箭头参数，用于自定义箭头样式和点击事件 | `{ leftArrow, rightArrow }` | - |
| arrowType | 箭头展示时机，可选值有：`hover`、`always` | `hover` \| `always` | `always` |
| autoPlay | 是否自动循环展示，或传入 `{ interval: 自动切换时间间隔(默认 2000), hoverToPause: 鼠标悬浮时是否暂停(默认 true) }` | boolean \| `{ interval?, hoverToPause? }` | true |
| class | 样式类名 | string | - |
| defaultActiveIndex | 初始化时默认展示的索引 | number | 0 |
| indicatorPosition | 指示器位置，可选值有：`left`、`center`、`right` | `left` \| `center` \| `right` | `center` |
| indicatorSize | 指示器尺寸，可选值有：`small`、`medium` | `small` \| `medium` | `small` |
| indicatorType | 指示器类型，可选值有：`dot`、`line`、`columnar` | `dot` \| `line` \| `columnar` | `dot` |
| onChange | 图片切换时的回调 | (index: number, preIndex: number) => void | - |
| showArrow | 是否展示箭头 | boolean | true |
| showIndicator | 是否展示指示器 | boolean | true |
| slideDirection | 动画效果为 `slide` 时的滑动方向，可选值有：`left`、`right` | `left` \| `right` | `left` |
| slides | 每项一张幻灯片的 Snippet 数组（对齐 Semi children） | Snippet[] | - |
| speed | 切换速度，单位 ms | number | 300 |
| style | 内联样式 | string | - |
| theme | 指示器和箭头主题，可选值有：`primary`、`light`、`dark` | `primary` \| `light` \| `dark` | `light` |
| trigger | 指示器触发的时机，可选值有：`hover`、`click` | `hover` \| `click` | - |

### ArrowButton（arrowProps.leftArrow / rightArrow）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| props | 箭头 div 上的可传参数，包括 style、onClick 事件等 | `Record<string, unknown>` | - |
| children | 箭头自定义 Icon | Snippet | - |
