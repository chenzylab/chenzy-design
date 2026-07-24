---
title: Spin 加载器
name: spin
category: feedback
brief: 加载器组件用于告知用户内容正在加载且需要一段不确定的时长。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/spin/01-basic.svelte';
  import basicSrc from '../../demos/spin/01-basic.svelte?raw';
  import SizeDemo from '../../demos/spin/02-size.svelte';
  import sizeSrc from '../../demos/spin/02-size.svelte?raw';
  import Tip from '../../demos/spin/03-tip.svelte';
  import tipSrc from '../../demos/spin/03-tip.svelte?raw';
  import Indicator from '../../demos/spin/04-indicator.svelte';
  import indicatorSrc from '../../demos/spin/04-indicator.svelte?raw';
  import Delay from '../../demos/spin/05-delay.svelte';
  import delaySrc from '../../demos/spin/05-delay.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Spin } from '@chenzy-design/svelte';
```

### 基本用法

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 尺寸

组件定义了三种尺寸：大、中（默认）、小。

<DemoBox code={sizeSrc}><SizeDemo /></DemoBox>

### 带文字的

通过 `tip` 属性可设置当 Spin 用作包裹元素时的文字。

<DemoBox code={tipSrc}><Tip /></DemoBox>

### 自定义指示符

可以通过设置 `indicator` 属性自定义 Spin 的指示符样式。

<DemoBox code={indicatorSrc}><Indicator /></DemoBox>

### 延迟显示

通过 delay 设置延迟显示 `loading` 的效果
组件是否处于 `loading` 状态由传入的 `spinning` 值决定，loading 为受控属性

<DemoBox code={delaySrc}><Delay /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| childStyle | 内部子元素的样式 | string | - |
| delay | 延迟显示加载效果的时间 | number(ms) | 0 |
| indicator | 加载指示符 | Snippet | - |
| size | 组件大小，可选值为 `small`, `middle`, `large` | string | `middle` |
| spinning | 是否处于加载中的状态 | boolean | true |
| style | 内联样式 | string | - |
| tip | 当 spin 作为包裹元素时，可以自定义描述文字 | string | - |
| wrapperClassName | 包裹元素的类名 | string | - |

## 文案规范

- 准确地说明加载状态，使用比如"Loading", "Submitting", "Processing"等词
- 使用尽量少的词汇去描述状态

## FAQ

- **怎么修改 icon 的颜色？**

  可以通过给 `.cd-spin-wrapper` 类添加 color 属性覆盖原有的颜色（推荐以更高权重覆盖）

  ```css
  .custom .cd-spin-wrapper {
    color: red;
  }
  ```
