---
title: Transfer 穿梭框
name: transfer
category: input
brief: 一个更直观高效的多选选择器，可以露出更多选项的信息，支持搜索功能，缺点是占据更多空间。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/transfer/01-basic.svelte';
  import basicSrc from '../../demos/transfer/01-basic.svelte?raw';
  import Group from '../../demos/transfer/02-group.svelte';
  import groupSrc from '../../demos/transfer/02-group.svelte?raw';
  import CustomFilterRender from '../../demos/transfer/03-custom-filter-render.svelte';
  import customFilterRenderSrc from '../../demos/transfer/03-custom-filter-render.svelte?raw';
  import Disabled from '../../demos/transfer/04-disabled.svelte';
  import disabledSrc from '../../demos/transfer/04-disabled.svelte?raw';
  import Draggable from '../../demos/transfer/05-draggable.svelte';
  import draggableSrc from '../../demos/transfer/05-draggable.svelte?raw';
  import Pagination from '../../demos/transfer/06-pagination.svelte';
  import paginationSrc from '../../demos/transfer/06-pagination.svelte?raw';
  import PaginationControlled from '../../demos/transfer/07-pagination-controlled.svelte';
  import paginationControlledSrc from '../../demos/transfer/07-pagination-controlled.svelte?raw';
  import DraggableCustomItem from '../../demos/transfer/08-draggable-custom-item.svelte';
  import draggableCustomItemSrc from '../../demos/transfer/08-draggable-custom-item.svelte?raw';
  import CustomHeader from '../../demos/transfer/09-custom-header.svelte';
  import customHeaderSrc from '../../demos/transfer/09-custom-header.svelte?raw';
  import FullyCustom from '../../demos/transfer/10-fully-custom.svelte';
  import fullyCustomSrc from '../../demos/transfer/10-fully-custom.svelte?raw';
  import FullyCustomDraggable from '../../demos/transfer/11-fully-custom-draggable.svelte';
  import fullyCustomDraggableSrc from '../../demos/transfer/11-fully-custom-draggable.svelte?raw';
  import Tree from '../../demos/transfer/12-tree.svelte';
  import treeSrc from '../../demos/transfer/12-tree.svelte?raw';
  import TreeLeafCount from '../../demos/transfer/13-tree-leaf-count.svelte';
  import treeLeafCountSrc from '../../demos/transfer/13-tree-leaf-count.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Transfer } from '@chenzy-design/svelte';
```

### 基本使用

数据项需传入 value、label、key。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 分组

将 type 设为 `groupList`。分组的 dataSource，一级子元素必须拥有 title 以及 items 属性（本库分组字段为 `items`，对齐 Semi 的分组语义）。暂不支持多层嵌套。

<DemoBox code={groupSrc}><Group /></DemoBox>

### 自定义筛选逻辑，自定义选项数据渲染

使用 `filter` 自定义搜索逻辑，返回 true 时表示当前项符合筛选规则，保留当前项在列表中的显示，返回 false 则表示不符合，当前项会被隐藏。使用 `renderSourceItem`，你可以自定义左侧每一条源数据的渲染结构。使用 `renderSelectedItem` 你可以自定义右侧每一条已选项的渲染结构。

<DemoBox code={customFilterRenderSrc}><CustomFilterRender /></DemoBox>

### 禁用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 拖拽排序

将 `draggable` 设为 true，开启拖拽排序功能。

<DemoBox code={draggableSrc}><Draggable /></DemoBox>

### 左侧分页

当左侧选项较多时，可以通过 `pagination` 属性开启分页功能。`pagination` 接收一个对象，包含 `pageSize`（每页条数，默认 10）、`currentPage`（受控页码）、`defaultCurrentPage`（默认页码）、`onPageChange`（页码变化回调）等属性。

<DemoBox code={paginationSrc}><Pagination /></DemoBox>

### 左侧分页 + 受控页码

通过 `pagination.currentPage` 可以受控地设置当前页码。

<DemoBox code={paginationControlledSrc}><PaginationControlled /></DemoBox>

### 拖拽 + 自定义已选项渲染

将 `draggable` 设为 true 开启拖拽排序功能；使用 `renderSelectedItem` 自定义右侧已选项渲染。你可以将拖拽触发器定义为任意节点，并添加样式。

<DemoBox code={draggableCustomItemSrc}><DraggableCustomItem /></DemoBox>

### 自定义渲染面板头部信息

`renderSourceHeader`、`renderSelectedHeader` 允许用户自定义渲染左右两个面板的头部信息。

<DemoBox code={customHeaderSrc}><CustomHeader /></DemoBox>

### 完全自定义渲染

`renderSourcePanel`、`renderSelectedPanel` 允许你完全自定义左右侧两个面板的渲染结构。通过该功能，你可以直接复用 Transfer 内部的逻辑能力，实现高度自定义样式结构的 Transfer 组件。

<DemoBox code={fullyCustomSrc}><FullyCustom /></DemoBox>

### 完全自定义渲染 + 拖拽排序

在完全自定义渲染的场景下，由于拖拽区的渲染也已由你完全接管，你需要自行实现拖拽逻辑，并在拖拽排序结束后将 oldIndex、newIndex 作为入参调用 `onSortEnd`。

<DemoBox code={fullyCustomDraggableSrc}><FullyCustomDraggable /></DemoBox>

### 树穿梭框

传入 type 为 `treeList`，使用 Tree 组件作为自定义渲染列表。可通过 `treeProps` 来覆盖默认树的属性。

<DemoBox code={treeSrc}><Tree /></DemoBox>

### 树穿梭框自定义头部显示叶子节点数量

当 type 为 `treeList` 时，`renderSourceHeader` 的入参中会额外提供 `leafOnlyNum` 字段，表示叶子节点的数量。这在文件选择等场景中非常有用，可以在头部只显示文件数量而不是包含文件夹的总数。

<DemoBox code={treeLeafCountSrc}><TreeLeafCount /></DemoBox>

## API 参考

### Transfer Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 样式类名 | string | - |
| dataSource | 数据源 | `Item[] \| GroupItem[] \| TreeItem[]` | `[]` |
| defaultValue | 默认已选中值 | `Array<string \| number>` | - |
| disabled | 是否禁用 | boolean | false |
| draggable | 是否开启拖拽排序 | boolean | false |
| emptyContent | 自定义空状态提示文本，search 为无搜索结果、left 为左侧无源数据、right 为无勾选数据时的文本 | `{ left, right, search }` | - |
| filter | 自定义筛选逻辑，为 false 时不展示搜索框，传函数可自定义搜索逻辑 | `boolean \| ((input: string, item: Item) => boolean)` | true |
| inputProps | 自定义搜索框 Input 的额外配置 | object | - |
| loading | 是否正在加载左侧选项 | boolean | - |
| pagination | 左侧面板分页配置，仅对 list 和 groupList 类型生效 | PaginationProps | - |
| renderSelectedHeader | 自定义右侧面板头部信息的渲染 | `Snippet<[SelectedHeaderProps]>` | - |
| renderSelectedItem | 自定义右侧单个已选项的渲染 | `Snippet<[{ onRemove, sortableHandle } & Item]>` | - |
| renderSelectedPanel | 自定义右侧已选面板的渲染 | `Snippet<[SelectedPanelProps]>` | - |
| renderSourceHeader | 自定义左侧面板头部信息的渲染 | `Snippet<[SourceHeaderProps]>` | - |
| renderSourceItem | 自定义左侧单个候选项的渲染 | `Snippet<[{ onChange, checked } & Item]>` | - |
| renderSourcePanel | 自定义左侧候选面板的渲染 | `Snippet<[SourcePanelProps]>` | - |
| showPath | 当 type 为 treeList 时，控制右侧选中项是否显示选择路径 | boolean | false |
| style | 内联样式 | string | - |
| treeProps | 当 type 为 treeList 时，作为 TreeProps 传入左侧的 Tree 组件 | object | - |
| type | Transfer 类型，可选 `list`、`groupList`、`treeList` | string | list |
| virtualize | 右侧已选列表虚拟化，仅在默认右侧面板渲染且 draggable 为 false 时生效 | VirtualizeProps | - |
| value | 已选中值，传入时作为受控组件使用 | `Array<string \| number>` | - |
| onChange | 选中值发生变化时触发的回调，拖拽排序变化后也会触发 | `(values, items) => void` | - |
| onDeselect | 取消勾选时的回调 | `(item: Item) => void` | - |
| onSearch | 搜索框输入内容变化时调用 | `(inputValue: string) => void` | - |
| onSelect | 勾选时的回调 | `(item: Item) => void` | - |

### Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 样式类名 | string | - |
| disabled | 是否禁用 | boolean | false |
| key | 必填，每个选项的唯一标识，不允许重复 | `string \| number` | - |
| label | 选项展示内容 | `string \| Snippet` | - |
| fullPath | type=treeList 且 showPath 为 true 时，返回当前节点从根到自身的完整路径节点数组 | `Item[]` | - |
| style | 内联样式 | string | - |
| value | 选项代表的值 | `string \| number` | - |

### GroupItem

GroupItem 继承 Item 的所有属性：

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| items | 该分组的元素（本库字段名 items，对齐 Semi children 语义） | `Item[]` |
| title | 分组名称 | string |

### TreeItem

TreeItem 继承 Item 的所有属性：

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| children | 子元素 | `TreeItem[]` |

### VirtualizeProps

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| height | 虚拟列表高度 | `number \| string` |
| width | 虚拟列表宽度 | `number \| string` |
| itemSize | 每行高度（固定） | number |

### PaginationProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| currentPage | 当前页码（受控模式） | number | - |
| defaultCurrentPage | 默认当前页码（非受控模式） | number | 1 |
| pageSize | 每页显示条数 | number | 10 |
| onPageChange | 页码变化时的回调 | `(currentPage: number) => void` | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| search(value) | 可通过实例调用该方法进行搜索，该搜索值会被置给 Input |

## Accessibility

### ARIA

- 搜索框添加 `role` `search`。
- 右侧选中列表添加 `role` `list`，选中项添加 `role` `listitem`。
