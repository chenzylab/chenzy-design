---
title: Tree 树形控件
name: tree
category: show
brief: 树型结构列表。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/tree/01-basic.svelte';
  import basicSrc from '../../demos/tree/01-basic.svelte?raw';
  import Multiple from '../../demos/tree/02-multiple.svelte';
  import multipleSrc from '../../demos/tree/02-multiple.svelte?raw';
  import Searchable from '../../demos/tree/03-searchable.svelte';
  import searchableSrc from '../../demos/tree/03-searchable.svelte?raw';
  import SearchRender from '../../demos/tree/04-search-render.svelte';
  import searchRenderSrc from '../../demos/tree/04-search-render.svelte?raw';
  import ManualSearch from '../../demos/tree/05-manual-search.svelte';
  import manualSearchSrc from '../../demos/tree/05-manual-search.svelte?raw';
  import SimpleJson from '../../demos/tree/06-simple-json.svelte';
  import simpleJsonSrc from '../../demos/tree/06-simple-json.svelte?raw';
  import BlockNode from '../../demos/tree/07-block-node.svelte';
  import blockNodeSrc from '../../demos/tree/07-block-node.svelte?raw';
  import CustomLabel from '../../demos/tree/08-custom-label.svelte';
  import customLabelSrc from '../../demos/tree/08-custom-label.svelte?raw';
  import CustomIcon from '../../demos/tree/09-custom-icon.svelte';
  import customIconSrc from '../../demos/tree/09-custom-icon.svelte?raw';
  import Directory from '../../demos/tree/10-directory.svelte';
  import directorySrc from '../../demos/tree/10-directory.svelte?raw';
  import Disabled from '../../demos/tree/11-disabled.svelte';
  import disabledSrc from '../../demos/tree/11-disabled.svelte?raw';
  import CheckRelation from '../../demos/tree/12-check-relation.svelte';
  import checkRelationSrc from '../../demos/tree/12-check-relation.svelte?raw';
  import ExpandAll from '../../demos/tree/13-expand-all.svelte';
  import expandAllSrc from '../../demos/tree/13-expand-all.svelte?raw';
  import Controlled from '../../demos/tree/14-controlled.svelte';
  import controlledSrc from '../../demos/tree/14-controlled.svelte?raw';
  import AutoExpandParent from '../../demos/tree/15-auto-expand-parent.svelte';
  import autoExpandParentSrc from '../../demos/tree/15-auto-expand-parent.svelte?raw';
  import ExpandIcon from '../../demos/tree/16-expand-icon.svelte';
  import expandIconSrc from '../../demos/tree/16-expand-icon.svelte?raw';
  import ShowLine from '../../demos/tree/17-show-line.svelte';
  import showLineSrc from '../../demos/tree/17-show-line.svelte?raw';
  import Virtualized from '../../demos/tree/18-virtualized.svelte';
  import virtualizedSrc from '../../demos/tree/18-virtualized.svelte?raw';
  import LoadData from '../../demos/tree/19-load-data.svelte';
  import loadDataSrc from '../../demos/tree/19-load-data.svelte?raw';
  import DynamicUpdate from '../../demos/tree/20-dynamic-update.svelte';
  import dynamicUpdateSrc from '../../demos/tree/20-dynamic-update.svelte?raw';
  import Draggable from '../../demos/tree/21-draggable.svelte';
  import draggableSrc from '../../demos/tree/21-draggable.svelte?raw';
  import FullLabelLeaf from '../../demos/tree/22-full-label-leaf.svelte';
  import fullLabelLeafSrc from '../../demos/tree/22-full-label-leaf.svelte?raw';
  import FullLabelHighlight from '../../demos/tree/23-full-label-highlight.svelte';
  import fullLabelHighlightSrc from '../../demos/tree/23-full-label-highlight.svelte?raw';
  import FieldNames from '../../demos/tree/24-field-names.svelte';
  import fieldNamesSrc from '../../demos/tree/24-field-names.svelte?raw';
  import CustomFilter from '../../demos/tree/25-custom-filter.svelte';
  import customFilterSrc from '../../demos/tree/25-custom-filter.svelte?raw';
  import SearchControlledExpand from '../../demos/tree/26-search-controlled-expand.svelte';
  import searchControlledExpandSrc from '../../demos/tree/26-search-controlled-expand.svelte?raw';
  import DraggableFullLabel from '../../demos/tree/27-draggable-full-label.svelte';
  import draggableFullLabelSrc from '../../demos/tree/27-draggable-full-label.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Tree } from '@chenzy-design/svelte';
```

### 基本用法

最简单的用法，默认为单选模式，每一级菜单项均可选择。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 多选

设置 `multiple`，可以进行多选。多选情况下所有子项都被选择时，自动勾选显示其父项。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 可搜索的

通过设置 `filterTreeNode` 属性可支持搜索功能。默认对 `label` 值进行搜索，可通过 `treeNodeFilterProp` 更改。如果只希望展示过滤后的结果，可以设置 `showFilteredOnly`。

<DemoBox code={searchableSrc}><Searchable /></DemoBox>

### 自定义搜索框

设置 `filterTreeNode` 属性开启搜索后，可以通过设置 `searchRender` 自定义搜索框的渲染方法，设置为 `false` 时可以隐藏搜索框。

<DemoBox code={searchRenderSrc}><SearchRender /></DemoBox>

### 手动触发搜索

可以通过 `bind:this` 的方式获取 tree 的实例，调用 tree 的 `search` 方法进行搜索。注意需要同时设置 `filterTreeNode` 开启搜索，如果搜索框在 tree 外部，可以通过设置 `searchRender={false}` 隐藏 tree 内部的搜索框。

<DemoBox code={manualSearchSrc}><ManualSearch /></DemoBox>

### 简单 JSON 格式的数据

可以通过 `treeDataSimpleJson` 传入 JSON 形式的 treeNodes 数据。此时 key-value 键值对中的 key 值将作为 TreeNodeData 的 key 和 label，value 值将作为 TreeNodeData 的 value。

<DemoBox code={simpleJsonSrc}><SimpleJson /></DemoBox>

### 行显示节点

可以通过设置 `blockNode` 使节点显示为整行，此时悬浮选中高亮状态都会显示整行。默认打开。关闭时只高亮节点 label。

<DemoBox code={blockNodeSrc}><BlockNode /></DemoBox>

### 自定义节点内容

TreeNodeData 的 label 属性支持传入节点来自定义显示的节点内容。你也可以使用 `renderLabel` 来传入自定义的渲染方法，此时搜索值仍为 treeData 中相应的 label 属性。

<DemoBox code={customLabelSrc}><CustomLabel /></DemoBox>

### 自定义图标

通过设置 `icon` 属性可添加自定义图标。

<DemoBox code={customIconSrc}><CustomIcon /></DemoBox>

### 目录树模式

通过设置 `directory` 属性可显示为目录树模式。目录树模式下自带目录图标，可以通过自定义图标覆盖。

<DemoBox code={directorySrc}><Directory /></DemoBox>

### 禁用

可以使用 `disableStrictly` 来开启严格禁用。开启严格禁用后，当节点是 disabled 的时候，则不能通过子级或者父级的关系改变选中状态。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 节点选中关系

多选时，可以使用 `checkRelation` 来设置节点选中关系的类型，可选：`related`（默认）、`unRelated`。当选中关系为 `unRelated`，意味着节点之间的选中互不影响。

<DemoBox code={checkRelationSrc}><CheckRelation /></DemoBox>

### 默认展开

`defaultExpandAll` 和 `expandAll` 均可以设置 Tree 的默认展开/收起状态。二者的区别是，`defaultExpandAll` 只在初始化时生效，而 `expandAll` 不仅会在初始化时生效，当数据发生动态更新时，`expandAll` 也仍然生效。

<DemoBox code={expandAllSrc}><ExpandAll /></DemoBox>

### 受控

传入 `value` 时即为受控组件，可以配合 `onChange` 使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 自动展开父节点

在展开受控的情况下，当开启了 `autoExpandParent`，如果想要收起父元素，则需要把它的所有子元素均收起后才可以。默认情况下，`autoExpandParent` 为 false，即父元素收起不受到子元素的影响。

<DemoBox code={autoExpandParentSrc}><AutoExpandParent /></DemoBox>

### 自定义展开 Icon

可以通过 `expandIcon` 自定义展开 Icon，支持传入节点或者函数。

<DemoBox code={expandIconSrc}><ExpandIcon /></DemoBox>

### 连接线

通过 `showLine` 设置节点之间的连接线，默认为 false。

<DemoBox code={showLineSrc}><ShowLine /></DemoBox>

### 虚拟化

列表虚拟化，用于大量树节点的情况。开启后，动画效果将被关闭。`virtualize` 是一个包含 `height`、`width`、`itemSize` 的对象。如果带搜索框，建议开启 `showFilteredOnly` 减少多余节点的渲染。

<DemoBox code={virtualizedSrc}><Virtualized /></DemoBox>

### 动态更新数据

<DemoBox code={dynamicUpdateSrc}><DynamicUpdate /></DemoBox>

### 异步加载数据

通过设置 `loadData` 可以动态加载数据，此时需要在数据中传入 `isLeaf` 标明叶子节点。

<DemoBox code={loadDataSrc}><LoadData /></DemoBox>

### 可拖拽的 Tree

通过设置 `draggable` 配合 `onDrop` 可以实现 Tree 节点的拖拽。

<DemoBox code={draggableSrc}><Draggable /></DemoBox>

### 高级定制·叶子分组勾选

Tree 组件的 API 支持了大部分的渲染需求，如果有非常特殊的定制要求，可以使用 `renderFullLabel` 来接管整行 option 的渲染效果。此例针对「希望只有叶子节点可以选中，父节点只起到分组作用」的场景：只渲染叶子节点前的 Checkbox，并且点击父节点时不触发选中，点击叶子节点触发。同时开启 `leafOnly` 可以使 onChange 的回调入参都是叶子节点。

<DemoBox code={fullLabelLeafSrc}><FullLabelLeaf /></DemoBox>

### 高级定制·单选高亮子节点

此例针对「单选选中父节点同时也高亮子节点」的场景，通过 `renderFullLabel` 接管渲染并配合 `onSelect` 实现。

<DemoBox code={fullLabelHighlightSrc}><FullLabelHighlight /></DemoBox>

### 字段映射

可以通过 `keyMaps` 自定义节点中 key、label、value 的字段。

<DemoBox code={fieldNamesSrc}><FieldNames /></DemoBox>

### 自定义搜索谓词

将 `filterTreeNode` 置为自定义函数，定制你想要的搜索策略。

<DemoBox code={customFilterSrc}><CustomFilter /></DemoBox>

### 开启搜索的展开受控

传入 `expandedKeys` 时即为展开受控组件，可以配合 `onExpand` 使用。当展开受控时，如果开启 `filterTreeNode` 并进行搜索是不会再自动展开节点的，此时，节点的展开完全由 `expandedKeys` 来控制。你可以利用 `onSearch` 的入参 `filteredExpandedKeys` 来实现展开受控时的搜索展开效果。

<DemoBox code={searchControlledExpandSrc}><SearchControlledExpand /></DemoBox>

### 可拖拽的高级定制

支持可拖拽（`draggable`）和高级定制（`renderFullLabel`）同时使用。

<DemoBox code={draggableFullLabelSrc}><DraggableFullLabel /></DemoBox>

## API 参考

### Tree

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoExpandParent | 是否自动展开父节点 | boolean | false |
| autoExpandWhenDragEnter | 是否允许拖拽到节点上时自动展开该节点 | boolean | true |
| autoMergeValue | 开启后，当某个父节点被选中时，value 将不包括该节点的子孙节点（在 leafOnly 为 false 时生效） | boolean | true |
| blockNode | 行显示节点 | boolean | true |
| checkRelation | 多选时，节点之间选中状态的关系，可选：`related`、`unRelated` | string | related |
| class | 类名 | string | - |
| defaultExpandAll | 设置在初始化时是否展开所有节点 | boolean | false |
| defaultExpandedKeys | 默认展开的节点，显示其直接子级 | `string[]` | - |
| defaultValue | 指定默认选中的条目 | `string \| number \| array` | - |
| directory | 目录树模式 | boolean | false |
| disableStrictly | 当节点的 disabled 状态确定时，不可通过子级或父级的关系选中 | boolean | false |
| disabled | 禁用整个树，不可选择 | boolean | false |
| draggable | 是否允许拖拽 | boolean | false |
| emptyContent | 当搜索无结果时展示的内容 | `string \| Snippet` | 暂无数据 |
| expandAction | 展开逻辑，可选 false、`click`、`doubleClick` | `boolean \| string` | false |
| expandAll | 设置是否默认展开所有节点，若后续数据发生改变，展开情况也受此 api 影响 | boolean | false |
| expandedKeys | （受控）展开的节点，默认展开节点显示其直接子级 | `string[]` | - |
| expandIcon | 自定义展开图标 | Snippet | - |
| keyMaps | 自定义节点中 key、label、value 的字段 | object | - |
| filterTreeNode | 是否根据输入项进行筛选，默认用 treeNodeFilterProp 的值筛选 | `boolean \| ((input, treeNodeString, data) => boolean)` | false |
| icon | 自定义图标 | Snippet | - |
| labelEllipsis | 是否开启 label 的超出省略，默认虚拟化状态开启 | boolean | `false \| true(虚拟化)` |
| leafOnly | 多选模式下 onChange 回调入参及展示标签只有叶子节点 | boolean | false |
| loadData | 异步加载数据，需要返回一个 Promise | `(node?) => Promise<void>` | - |
| loadedKeys | （受控）已经加载的节点，配合 loadData 使用 | `string[]` | - |
| motion | 是否开启动画 | boolean | true |
| multiple | 是否支持多选 | boolean | false |
| renderFullLabel | 完全自定义 label 的渲染函数 | Snippet | - |
| renderLabel | 自定义 label 的渲染函数 | Snippet | - |
| searchClassName | 搜索框的 className 属性 | string | - |
| searchPlaceholder | 搜索框默认文字 | string | - |
| searchRender | 自定义搜索框的渲染方法，为 false 时可以隐藏组件的搜索框 | `Snippet \| false` | - |
| searchStyle | 搜索框的样式 | string | - |
| showClear | 支持清除搜索框 | boolean | true |
| showFilteredOnly | 搜索状态下是否只展示过滤后的结果 | boolean | false |
| showLine | 显示连接线 | boolean | false |
| style | 样式 | string | - |
| treeData | treeNodes 数据，key 值在整个树范围内唯一 | `TreeNodeData[]` | `[]` |
| treeDataSimpleJson | 简单 JSON 形式的 TreeNodeData 数据 | object | `{}` |
| treeNodeFilterProp | 搜索时输入项过滤对应的 TreeNodeData 属性 | string | label |
| value | 当前选中的节点的 value 值，传入时作为受控组件 | `string \| number \| array` | - |
| virtualize | 列表虚拟化，由 height、width、itemSize 组成，开启后将关闭动画效果 | object | - |
| onChange | 选中树节点时调用，默认返回当前所有选中项的 value 值 | `(value?) => void` | - |
| onChangeWithObject | 是否将选中项 option 的其他属性作为回调 | boolean | false |
| onDoubleClick | 双击事件的回调 | `(e, node) => void` | - |
| onDragEnd | onDragEnd 事件回调 | `(dragProps) => void` | - |
| onDragEnter | onDragEnter 事件回调 | `(dragProps) => void` | - |
| onDragLeave | onDragLeave 事件回调 | `(dragProps) => void` | - |
| onDragOver | onDragOver 事件回调 | `(dragProps) => void` | - |
| onDragStart | onDragStart 事件回调 | `(dragProps) => void` | - |
| onDrop | onDrop 事件回调 | `(dragProps) => void` | - |
| onExpand | 展示节点时调用 | `(expandedKeys, object) => void` | - |
| onLoad | 节点加载完毕时触发的回调 | `(loadedKeys, node) => void` | - |
| onContextMenu | 右键点击的回调 | `(e, node) => void` | - |
| onSearch | 文本框值变化时回调 | `(input, filteredExpandedKeys) => void` | - |
| onSelect | 被选中时调用，返回值为当前事件选项的 key 值 | `(selectedKey, selected, selectedNode) => void` | - |

### TreeNodeData

> 不同 TreeNodeData 的 key 值要求必填且唯一。label 允许重复。value 值非必填，此时 onChange、value、defaultValue 中所取的 value 属性值将改为 key 值。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 属性值 | `string \| number` | - |
| label | 展示的文本 | `string \| Snippet` | - |
| icon | 自定义图标 | Snippet | - |
| disabled | 是否禁用 | boolean | false |
| key | required 且要求唯一 | string | - |
| isLeaf | 设置节点为叶子节点，在异步加载数据即传入 loadData 时有效 | boolean | - |

### Virtualize

> `itemSize` 必传。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| height | 高度值，如果为 string 必须保证有计算高度 | `number \| string` | 100% |
| itemSize | 每行的 treeNode 的高度，必传 | number | - |
| width | 宽度值 | `number \| string` | 100% |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| search | 手动触发搜索 |
| scrollTo | 在虚拟化 Tree 中，使指定节点滚动到视图 |

## Accessibility

### ARIA

- Tree 支持传入 `aria-label` 来表示该 Tree 作用。
- Tree 会自动为每个子节点分别设置 `aria-disabled`、`aria-checked`、`aria-selected`、`aria-level` 来表明节点状态及层级。
- Tree 会自动为对应部分分别设置 `role` 为 `tree`、`treeitem`。
