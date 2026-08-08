---
title: Collapsible 折叠
name: collapsible
category: show
brief: 行为组件，是一个用于展开或折叠内容的容器。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/collapsible/01-basic.svelte';
  import basicSrc from '../../demos/collapsible/01-basic.svelte?raw';
  import Duration from '../../demos/collapsible/06-duration.svelte';
  import durationSrc from '../../demos/collapsible/06-duration.svelte?raw';
  import Nested from '../../demos/collapsible/07-nested.svelte';
  import nestedSrc from '../../demos/collapsible/07-nested.svelte?raw';
  import CollapseHeight from '../../demos/collapsible/04-collapse-height.svelte';
  import collapseHeightSrc from '../../demos/collapsible/04-collapse-height.svelte?raw';
  import Fade from '../../demos/collapsible/05-fade.svelte';
  import fadeSrc from '../../demos/collapsible/05-fade.svelte?raw';
  import KeepDom from '../../demos/collapsible/02-keep-dom.svelte';
  import keepDomSrc from '../../demos/collapsible/02-keep-dom.svelte?raw';
  import LazyRender from '../../demos/collapsible/03-lazy-render.svelte';
  import lazyRenderSrc from '../../demos/collapsible/03-lazy-render.svelte?raw';
  import Aria from '../../demos/collapsible/08-aria.svelte';
  import ariaSrc from '../../demos/collapsible/08-aria.svelte?raw';
</script>

## 使用场景

- `Collapsible` 是一个行为组件，默认开启动画效果。它被用于本库的各种组件中，如：`Nav`、`Collapse`、`Tree`、`TreeSelect`，以及 `Typography` 中。
- 当上述组件不能满足需求或者需要自定义一些折叠行为时，可以使用 `Collapsible` 来包裹需要展开或者折叠的内容。

## 代码演示

### 如何引入

```jsx
import { Collapsible } from '@chenzy-design/svelte';
```

### 基本用法

通过 `isOpen` 来控制内容的展开或者折叠。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义动画时间

通过 `duration` 设置动画展开或者折叠的时间，也可以通过 `motion` 来关闭动画。

<DemoBox code={durationSrc}><Duration /></DemoBox>

### 嵌套使用

<DemoBox code={nestedSrc}><Nested /></DemoBox>

### 自定义折叠高度

可以使用 collapseHeight 自定义收起的高度

<DemoBox code={collapseHeightSrc}><CollapseHeight /></DemoBox>

### 淡入淡出

> 以下三段为本库补充示例：Semi 有 `fade` / `keepDOM` / `lazyRender` 三个 API 但文档未配示例，本库各补一个便于直观对照。

`fade` 为 true 时，折叠/展开会叠加透明度渐变，过渡更柔和。

<DemoBox code={fadeSrc}><Fade /></DemoBox>

### 保留隐藏的 DOM

`keepDOM` 为 true 时折叠后内容 DOM 不卸载，输入框内容、滚动位置等状态得以保留。

<DemoBox code={keepDomSrc}><KeepDom /></DemoBox>

### 惰性渲染

`lazyRender` 配合 `keepDOM` 使用：首次展开前不渲染内容，节省首屏成本，首次展开后保留 DOM。

<DemoBox code={lazyRenderSrc}><LazyRender /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 被折叠的内容 | Snippet | - |
| class | 类名 | string | - |
| collapseHeight | 折叠高度 | number | 0 |
| collapseHeightAdaptive | 当内容高度小于 collapseHeight 时，是否自适应内容高度。为 true 时，收起状态高度为 `Math.min(内容高度, collapseHeight)` | boolean | false |
| duration | 动画执行的时间 | number | 250 |
| fade | 是否开启淡入淡出 | boolean | false |
| id | id | string | - |
| isOpen | 是否展开内容区域 | boolean | false |
| keepDOM | 是否保留隐藏的面板 DOM 树，默认销毁 | boolean | false |
| lazyRender | 配合 keepDOM 使用，为 true 时挂载时不会渲染组件 | boolean | false |
| motion | 是否开启动画 | boolean | true |
| onMotionEnd | 动画结束的回调 | `() => void` | - |
| reCalcKey | 当 reCalcKey 改变时，将重新计算子节点的高度，用于优化动态渲染时的计算 | `number \| string` | - |
| style | 样式 | string | - |

## Accessibility

### ARIA

- Collapsible 具有 `id` props，传入的值会被设置为内容元素的 id，可以配合其他组件的 `aria-controls` 指明控制关系，见下方使用示例。

<DemoBox code={ariaSrc}><Aria /></DemoBox>

## FAQ

- 为什么使用 Collapsible 没有正常展开？

  检查 Collapsible 父级是否设置 `display: none`，此时因为无法拿到节点高度，会出现无法展开的问题。

  同理，**页面处于后台标签页（`document.hidden === true`）时浏览器会冻结 `ResizeObserver` 投递**，
  组件拿不到内容高度，`isOpen` 变化后 wrapper 高度会停在 `0`（内容 DOM 已渲染但不可见），
  切回前台即恢复。这不是组件问题——同页放一个裸 `ResizeObserver` 探针同样收不到回调。
