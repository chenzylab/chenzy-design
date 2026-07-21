---
title: Space 间距
name: space
category: basic
brief: 设置组件之间的间距。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/space/01-basic.svelte';
  import basicSrc from '../../demos/space/01-basic.svelte?raw';
  import Align from '../../demos/space/02-align.svelte';
  import alignSrc from '../../demos/space/02-align.svelte?raw';
  import Spacing from '../../demos/space/03-spacing.svelte';
  import spacingSrc from '../../demos/space/03-spacing.svelte?raw';
  import Vertical from '../../demos/space/04-vertical.svelte';
  import verticalSrc from '../../demos/space/04-vertical.svelte?raw';
  import Wrap from '../../demos/space/05-wrap.svelte';
  import wrapSrc from '../../demos/space/05-wrap.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Space } from '@chenzy-design/svelte';
```

### 基本用法

默认在一组相邻子元素之间施加统一的水平间距。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 对齐方式

可使用 `align` 设置对齐方式，可选值：`start`、`center`（默认）、`end`、`baseline`。

<DemoBox code={alignSrc}><Align /></DemoBox>

### 间距尺寸

可使用 `spacing` 设置间距大小，内置可选值：`tight`（8px，默认）、`medium`（16px）、`loose`（24px），并且支持传入 number 来自定义间距大小，也支持传入 array 来同时设置水平和垂直方向的间距。

<DemoBox code={spacingSrc}><Spacing /></DemoBox>

### 间距方向

可使用 `vertical` 设置间距是否为垂直方向，默认情况下为 false。

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

### 设置换行

当间距为水平方向时，可使用 `wrap` 设置是否自动换行，默认情况下为 false。

<DemoBox code={wrapSrc}><Wrap /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 对齐方式，支持 `start`、`end`、`center`、`baseline` | string | center |
| class | 样式类名 | string | - |
| spacing | 间距尺寸，支持 `tight`、`medium`、`loose` 或 number、array | string \| number \| array | tight |
| style | 内联样式 | string | - |
| vertical | 是否为垂直间距 | boolean | false |
| wrap | 是否自动换行 | boolean | false |
