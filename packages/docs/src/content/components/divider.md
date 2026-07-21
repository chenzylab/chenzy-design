---
title: Divider 分割线
name: divider
category: basic
brief: 分割线是一个呈线状的轻量化组件，用于有逻辑的组织元素内容和页面结构或区域。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/divider/01-basic.svelte';
  import basicSrc from '../../demos/divider/01-basic.svelte?raw';
  import WithContent from '../../demos/divider/02-with-content.svelte';
  import withContentSrc from '../../demos/divider/02-with-content.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Divider } from '@chenzy-design/svelte';
```

### 基本用法

通过 `layout` 控制分割线方向（水平 / 垂直），`dashed` 切换实线 / 虚线，`margin` 控制分割线的外边距（水平方向为上下 margin，垂直方向为左右 margin）。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 包含内容

水平分割线可以嵌入文字或图标，通过 `align` 控制内容的对齐方式（居左 / 居中 / 居右）。

<DemoBox code={withContentSrc}><WithContent /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 带内容时，内容对齐方式 | left \| center \| right | center |
| children | 内容 | Snippet | 无 |
| class | 类名 | string | 无 |
| dashed | 是否为虚线 | boolean | false |
| layout | 分割线方向 | horizontal \| vertical | horizontal |
| margin | 分割线上下 margin（垂直方向时为左右 margin） | number \| string | 无 |
| style | 自定义样式 | string | 无 |
