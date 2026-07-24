---
title: VirtualList 虚拟列表
name: virtuallist
category: show
brief: 虚拟滚动列表底座，渲染大数据量时只渲染视口内的可见行。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/virtual-list/01-basic.svelte';
  import basicSrc from '../../demos/virtual-list/01-basic.svelte?raw';
  import Dynamic from '../../demos/virtual-list/02-dynamic-height.svelte';
  import dynamicSrc from '../../demos/virtual-list/02-dynamic-height.svelte?raw';
  import ScrollToIndex from '../../demos/virtual-list/03-scroll-to-index.svelte';
  import scrollToIndexSrc from '../../demos/virtual-list/03-scroll-to-index.svelte?raw';
  import Horizontal from '../../demos/virtual-list/04-horizontal.svelte';
  import horizontalSrc from '../../demos/virtual-list/04-horizontal.svelte?raw';
  import CustomItem from '../../demos/virtual-list/05-custom-item.svelte';
  import customItemSrc from '../../demos/virtual-list/05-custom-item.svelte?raw';
</script>

> **与 Semi Design 的技术差异**：Semi 没有独立的 VirtualList 组件，它的虚拟滚动能力由第三方库 `react-window`（Tree / TreeSelect / Cascader / Select）与 `react-virtualized`（List 无限长列表）提供，作为内部实现细节，不对外导出。Svelte 生态没有可直接复用的等价库，因此本库自建了这个 headless `VirtualList` 基座，被 Table / List / TreeSelect / Cascader 等组件复用。它是技术栈差异导致的必要自建，Semi 官网无对应文档页。

## 代码演示

### 如何引入

```jsx
import { VirtualList } from '@chenzy-design/svelte';
```

### 基础虚拟列表

通过 `data` 传入数据、`itemSize` 指定固定行高，万行数据仅渲染视口内的可见行。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 动态/不定高

`itemSize='auto'` 时用 ResizeObserver 实测每行真实高度并修正偏移，`estimatedItemSize` 提供首屏占位估算。

<DemoBox code={dynamicSrc}><Dynamic /></DemoBox>

### 滚动到指定项

通过 `bind:this` 拿到组件实例，命令式调用 `scrollToIndex(index, { align })` 滚动到指定行。

<DemoBox code={scrollToIndexSrc}><ScrollToIndex /></DemoBox>

### 横向虚拟化

`horizontal` 沿 x 轴排列，`itemSize` 作列宽（仅支持 fixed 定宽）。

<DemoBox code={horizontalSrc}><Horizontal /></DemoBox>

### 自定义项渲染

`renderItem` 内可组合任意富结构（Tag、图标等），只要保证行高与 `itemSize` 一致。

<DemoBox code={customItemSrc}><CustomItem /></DemoBox>

## API 参考

### VirtualList

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 根节点自定义类名 | string | - |
| data | 列表数据源 | T[] | [] |
| estimatedItemSize | 动态模式（itemSize='auto'）下的初始估算行高（px），用于首屏占位与总高估算 | number | 40 |
| getKey | 每项的稳定 key 生成函数 | (item: T, index: number) => string \| number | (\_, index) => index |
| height | 视口主轴尺寸（vertical 为高度、horizontal 为宽度）；数字按 px，字符串用 ResizeObserver 测量 | number \| string | 400 |
| horizontal | 横向虚拟化：沿 x 轴排列、读/写 scrollLeft | boolean | false |
| itemSize | 固定行高/列宽（px）；传 `auto` 启用动态不定高测量（horizontal 暂不支持 dynamic） | number \| `auto` | 40 |
| overscan | 视口上下额外预渲染的行数 | number | 3 |
| renderItem | 渲染每一项的模板 | `Snippet<[item, index]>` | - |
| scrollTarget | 滚动源：`self` 内部容器自身滚动 / `window` 用窗口滚动（适合整页长列表，仅 vertical） | `self` \| `window` | `self` |

### 方法

通过 `bind:this` 拿到组件实例后可命令式调用：

| 方法 | 说明 |
| --- | --- |
| scrollToIndex(index, options?) | 滚动到指定项；`options.align` 支持 `start` / `center` / `end` |

## 无障碍

- VirtualList 本身是透明容器，不添加额外 role；具体 role（`list`/`grid`/`listbox` 等）由上层调用方传入，确保语义由业务层决定。
- 每行渲染时注入 `aria-setsize`（数据总量）和 `aria-posinset`（当前行在全列表中的位置），使屏幕阅读器可感知「第 N 条，共 M 条」。
- 当前聚焦的行不会被虚拟回收，确保键盘导航时焦点不丢失。
- 滚动时以 rAF 节流控制 ARIA 属性更新频率，避免辅助技术被频繁的属性变更淹没。
