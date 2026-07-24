---
title: Pagination 分页器
name: pagination
category: navigation
brief: 采用分页的形式分隔长列表，每次只加载一个页面。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/pagination/01-basic.svelte';
  import basicSrc from '../../demos/pagination/01-basic.svelte?raw';
  import Disabled from '../../demos/pagination/02-disabled.svelte';
  import disabledSrc from '../../demos/pagination/02-disabled.svelte?raw';
  import ShowTotal from '../../demos/pagination/03-show-total.svelte';
  import showTotalSrc from '../../demos/pagination/03-show-total.svelte?raw';
  import DefaultCurrent from '../../demos/pagination/04-default-current.svelte';
  import defaultCurrentSrc from '../../demos/pagination/04-default-current.svelte?raw';
  import SizeChanger from '../../demos/pagination/05-size-changer.svelte';
  import sizeChangerSrc from '../../demos/pagination/05-size-changer.svelte?raw';
  import QuickJumper from '../../demos/pagination/06-quick-jumper.svelte';
  import quickJumperSrc from '../../demos/pagination/06-quick-jumper.svelte?raw';
  import Controlled from '../../demos/pagination/07-controlled.svelte';
  import controlledSrc from '../../demos/pagination/07-controlled.svelte?raw';
  import PageSizeOpts from '../../demos/pagination/08-page-size-opts.svelte';
  import pageSizeOptsSrc from '../../demos/pagination/08-page-size-opts.svelte?raw';
  import Small from '../../demos/pagination/09-small.svelte';
  import smallSrc from '../../demos/pagination/09-small.svelte?raw';
  import HoverShow from '../../demos/pagination/10-hover-show-page-select.svelte';
  import hoverShowSrc from '../../demos/pagination/10-hover-show-page-select.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Pagination } from '@chenzy-design/svelte';
```

### 基本

基础分页，通过 `total` 设置总条数，`pageSize` 设置每页容量。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 禁用

通过 `disabled` 设置禁用。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 总页数显示

通过 `showTotal` 属性控制是否展示总页数。

<DemoBox code={showTotalSrc}><ShowTotal /></DemoBox>

### 指定当前页码

可以通过 `defaultCurrentPage` 指定当前激活的页码。

<DemoBox code={defaultCurrentSrc}><DefaultCurrent /></DemoBox>

### 每页容量切换

通过设置 `showSizeChanger` 为 `true`，允许通过 Select 组件快速切换每页容量。

<DemoBox code={sizeChangerSrc}><SizeChanger /></DemoBox>

### 快速跳转至某页

通过设置 `showQuickJumper` 为 `true`，允许通过 Input 控件输入页码，快速跳转。当 Input 失去焦点时，若其中为有效数字，会直接跳转；也可在 Input 聚焦时输入期望页码后敲击回车跳转。若输入页码大于总页数，会自动跳转至最后一页。

<DemoBox code={quickJumperSrc}><QuickJumper /></DemoBox>

### 页码受控

传入 `currentPage` 后为受控组件，当前页完全取决于 `currentPage`。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 预设每页容量可选值

通过 `pageSizeOpts` 指定每页显示多少条的可选值。

<DemoBox code={pageSizeOptsSrc}><PageSizeOpts /></DemoBox>

### 迷你版本

`size` 设置为 `small` 显示紧凑视图。

<DemoBox code={smallSrc}><Small /></DemoBox>

开启 `hoverShowPageSelect`，可以 hover 页码快速切换（仅 `size='small'` 时生效）。

<DemoBox code={hoverShowSrc}><HoverShow /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| currentPage | 当前页码 | number | - |
| defaultCurrentPage | 默认的当前页码 | number | - |
| disabled | 禁用 | boolean | false |
| hideOnSinglePage | 总页数小于 2 时是否自动隐藏分页器（showSizeChanger 为 true 时此开关不再生效） | boolean | false |
| hoverShowPageSelect | hover 页码时是否展示切换页数的 Select 控件，仅当 `size='small'` 时生效 | boolean | false |
| nextText | 下一页文本 | string \| Snippet | - |
| pageSize | 每页条数 | number | 10 |
| pageSizeOpts | 指定每页显示多少条 | `number[]` | `[10, 20, 40, 100]` |
| popoverPosition | 浮层方向，具体可见 Popover position | string | "bottomLeft" |
| popoverZIndex | 浮层 z-index 值 | number | 1030 |
| prevText | 上一页文本 | string \| Snippet | - |
| preventPageChangeOnPageSizeChange | 切换 pageSize 时是否阻止自动调整 currentPage | boolean | false |
| style | 样式 | string | - |
| size | 尺寸 | string | - |
| showTotal | 是否显示总页数 | boolean | false |
| showSizeChanger | 是否显示切换页容量的 Select，size 为 small 时不生效 | boolean | false |
| showQuickJumper | 是否显示切换页码的 Input | boolean | false |
| total | 总条数 | number | 1 |
| onChange | 页码、每页容量变化时的回调函数 | `(currentPage: number, pageSize: number) => void` | - |
| onPageChange | 页码变化的回调函数 | `(currentPage: number) => void` | - |
| onPageSizeChange | 每页容量变化时的回调函数 | `(pageSize: number) => void` | - |

## 无障碍

### ARIA

- 根容器 `<nav aria-label>`，页码列表使用 `<ul>` / `<li>`，当前页加 `aria-current="page"`。
- 「上一页」/「下一页」为 `<button>`，边界态加 `aria-disabled` + `disabled`；省略号项 `aria-hidden="true"`。
- 键盘：`←` / `→` 在页码项间移动焦点，`Home` / `End` 跳首 / 末，`Enter` / `Space` 激活翻页。
