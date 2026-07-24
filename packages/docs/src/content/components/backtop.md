---
title: BackTop 回到顶部
name: backtop
category: other
brief: 返回页面顶部的操作按钮。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/back-top/01-basic.svelte';
  import basicSrc from '../../demos/back-top/01-basic.svelte?raw';
  import CustomStyle from '../../demos/back-top/02-custom-style.svelte';
  import customStyleSrc from '../../demos/back-top/02-custom-style.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { BackTop } from '@chenzy-design/svelte';
```

### 基本用法

BackTop 预设了基本的返回按钮，可以直接调用。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义样式

BackTop 预设了默认样式，包括：距离底部 50px、距离右侧 100px、`box-sizing` 为 `border-box`、内容水平居中。样式可以覆盖。

<DemoBox code={customStyleSrc}><CustomStyle /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| duration | 滚动到顶部的时间 | number | 450 |
| style | 样式 | string | - |
| target | 返回需要监听其滚动事件的元素对应 DOM 元素的函数 | `() => HTMLElement \| Window` | `() => window` |
| visibilityHeight | 出现 BackTop 需要达到的滚动高度 | number | 400 |
| onClick | 点击事件的回调函数 | `(e: MouseEvent) => void` | - |
