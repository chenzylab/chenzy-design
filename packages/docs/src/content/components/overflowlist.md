---
title: OverflowList 折叠列表
name: overflowlist
category: show
brief: OverflowList 是一个行为组件，用于展示列表，并支持自适应来展示尽可能多的项目。因过长而溢出项目将折叠为一个元素。当检测到调整大小时，可见项将被重新计算。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Collapse from '../../demos/overflow-list/01-collapse.svelte';
  import collapseSrc from '../../demos/overflow-list/01-collapse.svelte?raw';
  import CollapseFrom from '../../demos/overflow-list/02-collapse-from.svelte';
  import collapseFromSrc from '../../demos/overflow-list/02-collapse-from.svelte?raw';
  import MinVisible from '../../demos/overflow-list/03-min-visible-items.svelte';
  import minVisibleSrc from '../../demos/overflow-list/03-min-visible-items.svelte?raw';
  import Scroll from '../../demos/overflow-list/04-scroll.svelte';
  import scrollSrc from '../../demos/overflow-list/04-scroll.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { OverflowList } from '@chenzy-design/svelte';
```

### 折叠模式 - 默认

通过 `renderMode="collapse"` (默认) 来实现内容的折叠。

<DemoBox code={collapseSrc}><Collapse /></DemoBox>

### 折叠模式 - 方向

`collapse` 模式下支持 collapseFrom 设置折叠方向。

<DemoBox code={collapseFromSrc}><CollapseFrom /></DemoBox>

### 折叠模式 - 最小展示的数目

`collapse` 模式下支持 minVisibleItems 设置最小展示的数目。

<DemoBox code={minVisibleSrc}><MinVisible /></DemoBox>

### 滚动模式

通过 `renderMode="scroll"` 来使用滚动模式的折叠列表。如果需要 scrollIntoView，可以通过选择器 `` .item-cls[data-scrollkey="${key}"] `` 来选取。

<DemoBox code={scrollSrc}><Scroll /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| renderMode | 渲染模式 | `collapse` \| `scroll` | `collapse` |
| style | OverflowList 的样式 | string | - |

### renderMode='collapse'

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| collapseFrom | 折叠方向 | `start` \| `end` | `end` |
| items | 渲染项目 | `Record<string, any>[]` | - |
| minVisibleItems | 最小展示的可见项数目 | number | 0 |
| onOverflow | 溢出回调 | (overflowItems: any[]) => void | - |
| overflowRenderer | 溢出项的自定义渲染模板 | Snippet | - |
| visibleItemRenderer | 展示项的自定义渲染模板 | `Snippet<[item, index]>` | - |

### renderMode='scroll'

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 渲染项目，**要求必含 key 项** | `Record<string, any>[]` | - |
| onIntersect | 溢出回调 | `(res: Record<string, IntersectionObserverEntry>) => void` | - |
| onVisibleStateChange | 隐藏显示状态变化回调 | `(visibleState: Map<string, boolean>) => void` | - |
| overflowRenderer | 溢出项的自定义渲染模板（两端各调用一次） | Snippet | - |
| threshold | 触发溢出回调的阈值 | number | 0.75 |
| visibleItemRenderer | 展示项的自定义渲染模板 | `Snippet<[item, index]>` | - |
| wrapperClass | 滚动 wrapper 的类名 | string | - |
| wrapperStyle | 滚动 wrapper 的样式 | string | - |
