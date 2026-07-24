---
title: List 列表
name: list
category: show
brief: 列表控件，用于展示一组结构、样式类似的数据。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/list/01-basic.svelte';
  import basicSrc from '../../demos/list/01-basic.svelte?raw';
  import Template from '../../demos/list/02-template.svelte';
  import templateSrc from '../../demos/list/02-template.svelte?raw';
  import Layout from '../../demos/list/03-layout.svelte';
  import layoutSrc from '../../demos/list/03-layout.svelte?raw';
  import Grid from '../../demos/list/04-grid.svelte';
  import gridSrc from '../../demos/list/04-grid.svelte?raw';
  import GridResponsive from '../../demos/list/05-grid-responsive.svelte';
  import gridResponsiveSrc from '../../demos/list/05-grid-responsive.svelte?raw';
  import LoadMore from '../../demos/list/06-load-more.svelte';
  import loadMoreSrc from '../../demos/list/06-load-more.svelte?raw';
  import InfiniteScroll from '../../demos/list/07-infinite-scroll.svelte';
  import infiniteScrollSrc from '../../demos/list/07-infinite-scroll.svelte?raw';
  import Virtualized from '../../demos/list/08-virtualized.svelte';
  import virtualizedSrc from '../../demos/list/08-virtualized.svelte?raw';
  import DragSort from '../../demos/list/09-drag-sort.svelte';
  import dragSortSrc from '../../demos/list/09-drag-sort.svelte?raw';
  import Pagination from '../../demos/list/10-pagination.svelte';
  import paginationSrc from '../../demos/list/10-pagination.svelte?raw';
  import Filter from '../../demos/list/11-filter.svelte';
  import filterSrc from '../../demos/list/11-filter.svelte?raw';
  import AddRemove from '../../demos/list/12-add-remove.svelte';
  import addRemoveSrc from '../../demos/list/12-add-remove.svelte?raw';
  import Select from '../../demos/list/13-select.svelte';
  import selectSrc from '../../demos/list/13-select.svelte?raw';
  import Keyboard from '../../demos/list/14-keyboard.svelte';
  import keyboardSrc from '../../demos/list/14-keyboard.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { List } from '@chenzy-design/svelte';
```

### 基本用法

可以通过 `dataSource` 传入数据，配合 `renderItem` 自定义每一项的渲染。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 模板用法

`List.Item` 内置 `header` / `main` / `extra` 三段结构，`align` 控制头与主体的垂直对齐。

<DemoBox code={templateSrc}><Template /></DemoBox>

### 布局

`layout='horizontal'` 让列表项横向排列。

<DemoBox code={layoutSrc}><Layout /></DemoBox>

### 栅格列表

通过 grid 属性可以实现栅格列表，`span` 可设置每项的占格数，`gutter` 可设置栅格间隔。

<DemoBox code={gridSrc}><Grid /></DemoBox>

### 响应式的栅格列表

grid 支持 `xs`、`sm`、`md`、`lg`、`xl`、`xxl` 响应式栅格。

<DemoBox code={gridResponsiveSrc}><GridResponsive /></DemoBox>

### 加载更多

通过 `loadMore` 属性可以自定义加载更多按钮。

<DemoBox code={loadMoreSrc}><LoadMore /></DemoBox>

### 滚动加载

滚动到底部自动加载更多数据。

<DemoBox code={infiniteScrollSrc}><InfiniteScroll /></DemoBox>

### 滚动加载无限长列表

配合虚拟列表可以支撑万级数据的高性能滚动。

<DemoBox code={virtualizedSrc}><Virtualized /></DemoBox>

### 拖拽排序

可以实现列表项的拖拽重排。

<DemoBox code={dragSortSrc}><DragSort /></DemoBox>

### 带分页器

你可以通过组装 Pagination 使用，实现对 List 列表的分页。

<DemoBox code={paginationSrc}><Pagination /></DemoBox>

### 带筛选器

你可以通过组装 Input 使用，实现对 List 列表的筛选。

<DemoBox code={filterSrc}><Filter /></DemoBox>

### 添加删除项

操作 dataSource 数组即可动态增删列表项。

<DemoBox code={addRemoveSrc}><AddRemove /></DemoBox>

### 单选或多选

你可以通过组合使用 Radio 或 Checkbox 将 List 增强为一个列表选择器。

<DemoBox code={selectSrc}><Select /></DemoBox>

### 响应键盘事件

监听方向键 ↑↓ 在列表项间移动高亮。

<DemoBox code={keyboardSrc}><Keyboard /></DemoBox>

## API 参考

### List

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 是否显示边框 | boolean | `false` |
| class | 自定义样式类名 | string | - |
| dataSource | 列表数据源 | any[] | - |
| emptyContent | 空列表的展示内容 | string \| Snippet | - |
| footer | 列表底部 | string \| Snippet | - |
| grid | 列表栅格配置 | ListGrid | - |
| header | 列表头部 | string \| Snippet | - |
| layout | 列表布局，支持 `vertical`、`horizontal` | string | `vertical` |
| loadMore | 加载更多的按钮 | Snippet | - |
| loading | 是否处于加载中，为 `true` 时会显示 spin | boolean | `false` |
| renderItem | 当使用 dataSource 时，用 renderItem 自定义渲染列表项 | `Snippet<[item, index]>` | - |
| size | 列表尺寸，支持 `small`、`default`、`large` | string | `default` |
| split | 是否展示分割线 | boolean | `true` |
| style | 自定义样式 | string | - |
| onClick | 点击回调事件 | (e: MouseEvent) => void | - |
| onRightClick | 右键点击回调事件 | (e: MouseEvent) => void | - |

### List grid props

其他 grid 参数，请参考 Grid。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| span | 栅格占位格数 | number | - |
| gutter | 栅格间隔 | number | 0 |
| xs | `<576px` 响应式栅格，可为栅格数或对象 | number \| object | - |
| sm | `≥576px` 响应式栅格，可为栅格数或对象 | number \| object | - |
| md | `≥768px` 响应式栅格，可为栅格数或对象 | number \| object | - |
| lg | `≥992px` 响应式栅格，可为栅格数或对象 | number \| object | - |
| xl | `≥1200px` 响应式栅格，可为栅格数或对象 | number \| object | - |
| xxl | `≥1600px` 响应式栅格，可为栅格数或对象 | number \| object | - |

### List.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 列表项头内容和主体内容的垂直对齐方式，支持 `flex-start`、`flex-end`、`center`、`baseline`、`stretch` | string | `flex-start` |
| class | 自定义样式类名 | string | - |
| extra | 列表项附加内容 | string \| Snippet | - |
| header | 列表项头内容 | string \| Snippet | - |
| main | 列表项主体内容 | string \| Snippet | - |
| style | 自定义样式 | string | - |
| onClick | 点击回调事件 | (e: MouseEvent) => void | - |
| onRightClick | 右键点击回调事件 | (e: MouseEvent) => void | - |

## 文案规范

- 首字母大写
- 结尾不跟随标点符号
- 语法平行：如主动态与被动态、陈述句与祈使句混合使用
