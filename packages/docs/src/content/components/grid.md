---
title: Grid 栅格
name: grid
category: basic
brief: 24 栅格系统。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/grid/01-basic.svelte';
  import basicSrc from '../../demos/grid/01-basic.svelte?raw';
  import Gutter from '../../demos/grid/02-gutter.svelte';
  import gutterSrc from '../../demos/grid/02-gutter.svelte?raw';
  import Offset from '../../demos/grid/03-offset.svelte';
  import offsetSrc from '../../demos/grid/03-offset.svelte?raw';
  import FlexJustify from '../../demos/grid/05-flex-justify.svelte';
  import flexJustifySrc from '../../demos/grid/05-flex-justify.svelte?raw';
  import FlexAlign from '../../demos/grid/06-flex-align.svelte';
  import flexAlignSrc from '../../demos/grid/06-flex-align.svelte?raw';
  import Order from '../../demos/grid/07-order.svelte';
  import orderSrc from '../../demos/grid/07-order.svelte?raw';
  import Responsive from '../../demos/grid/04-responsive.svelte';
  import responsiveSrc from '../../demos/grid/04-responsive.svelte?raw';
</script>

## 概述

布局的栅格化系统，我们是基于行（row）和列（col）来定义信息区块的外部框架，以保证页面的每个区域能够稳健地排布起来。

## 弹性布局

我们的栅格化系统支持 Flex 布局，允许子元素在父节点内的水平对齐方式 - 居左、居中、居右、等宽排列、分散排列。子元素与子元素之间，支持顶部对齐、垂直居中对齐、底部对齐的方式。同时，支持使用 `order` 来定义元素的排列顺序。

## 代码演示

### 如何引入

```jsx
import { Row, Col } from '@chenzy-design/svelte';
```

### 基础使用

从堆叠到水平排列。使用单一的一组 Row 和 Col 栅格组件，就可以创建一个基本的栅格系统，所有 Col 必须放在 Row 内。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### Gutter 间隔

栅格常常需要和间隔进行配合，你可以使用 Row 的 `gutter` 属性，我们推荐使用 (16+8n)px 作为栅格间隔（n 是自然数）。垂直间隔可以使用数组形式，数组第一项为横向间隔，第二项为垂直间隔。如果要支持响应式，可以写成 `{ xs: 8, sm: 16, md: 24, lg: 32 }`。

<DemoBox code={gutterSrc}><Gutter /></DemoBox>

### Offset 偏移

通过 `offset` 使列向右偏移指定的格数，偏移的间隔内不可以有栅格。

<DemoBox code={offsetSrc}><Offset /></DemoBox>

### Flex 布局

Row `type="flex"` 定义 Flex 布局，其子元素根据 `justify` 不同的值 `start`、`center`、`end`、`space-between`、`space-around`，分别定义其在父节点里面的排版方式。

<DemoBox code={flexJustifySrc}><FlexJustify /></DemoBox>

### Flex 子元素垂直对齐

Flex 布局下，通过 `align` 定义不等高子元素的垂直对齐方式：`top`、`middle`、`bottom`。

<DemoBox code={flexAlignSrc}><FlexAlign /></DemoBox>

### Flex 元素排序

通过 Flex 布局的 `order` 来改变元素的排序。

<DemoBox code={orderSrc}><Order /></DemoBox>

### 响应式

参照 Bootstrap 的响应式设计，预设六个响应尺寸：`xs`、`sm`、`md`、`lg`、`xl`、`xxl`。缩放窗口可观察列宽与间距的自适应变化。

<DemoBox code={responsiveSrc}><Responsive /></DemoBox>

## API 参考

### Row

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | flex 布局下的垂直对齐方式：top、middle、bottom | top \| middle \| bottom | - |
| class | 类名 | string | - |
| gutter | 栅格间隔，可以写成像素值、[水平, 垂直] 数组，或支持响应式的对象写法 `{ xs: 8, sm: 16, md: 24 }` | number \| object \| [number \| object, number \| object] | 0 |
| justify | flex 布局下的水平排列方式：start、end、center、space-around、space-between | string | start |
| style | 自定义样式 | string | - |
| type | 布局模式，可选 flex，现代浏览器下有效 | flex | - |

### Col

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| span | 栅格占位格数，为 0 时相当于 `display: none` | number | - |
| offset | 栅格左侧的间隔格数，间隔内不可以有栅格 | number | 0 |
| order | 栅格顺序，flex 布局模式下有效 | number | 0 |
| push | 栅格向右移动格数 | number | 0 |
| pull | 栅格向左移动格数 | number | 0 |
| xs | `<576px` 响应式栅格，可为栅格数或对象配置 `{ span, offset }` | number \| object | - |
| sm | `≥576px` 响应式栅格，可为栅格数或对象配置 | number \| object | - |
| md | `≥768px` 响应式栅格，可为栅格数或对象配置 | number \| object | - |
| lg | `≥992px` 响应式栅格，可为栅格数或对象配置 | number \| object | - |
| xl | `≥1200px` 响应式栅格，可为栅格数或对象配置 | number \| object | - |
| xxl | `≥1600px` 响应式栅格，可为栅格数或对象配置 | number \| object | - |
