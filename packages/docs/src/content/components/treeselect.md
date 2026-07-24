---
title: TreeSelect 树选择器
name: treeselect
category: input
brief: 树选择器用于多层级树形数据的结构化展示 & 选取，例如显示文件夹与文件的列表、显示组织架构成员列表等等。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/tree-select/01-basic.svelte';
  import basicSrc from '../../demos/tree-select/01-basic.svelte?raw';
  import Multiple from '../../demos/tree-select/02-multiple.svelte';
  import multipleSrc from '../../demos/tree-select/02-multiple.svelte?raw';
  import MaxTagCount from '../../demos/tree-select/03-max-tag-count.svelte';
  import maxTagCountSrc from '../../demos/tree-select/03-max-tag-count.svelte?raw';
  import Searchable from '../../demos/tree-select/04-searchable.svelte';
  import searchableSrc from '../../demos/tree-select/04-searchable.svelte?raw';
  import RemoteSearch from '../../demos/tree-select/05-remote-search.svelte';
  import remoteSearchSrc from '../../demos/tree-select/05-remote-search.svelte?raw';
  import SearchPosition from '../../demos/tree-select/06-search-position.svelte';
  import searchPositionSrc from '../../demos/tree-select/06-search-position.svelte?raw';
  import TriggerTagWrap from '../../demos/tree-select/07-trigger-tag-wrap.svelte';
  import triggerTagWrapSrc from '../../demos/tree-select/07-trigger-tag-wrap.svelte?raw';
  import Size from '../../demos/tree-select/08-size.svelte';
  import sizeSrc from '../../demos/tree-select/08-size.svelte?raw';
  import DefaultExpand from '../../demos/tree-select/09-default-expand.svelte';
  import defaultExpandSrc from '../../demos/tree-select/09-default-expand.svelte?raw';
  import Disabled from '../../demos/tree-select/10-disabled.svelte';
  import disabledSrc from '../../demos/tree-select/10-disabled.svelte?raw';
  import DisableStrictly from '../../demos/tree-select/11-disable-strictly.svelte';
  import disableStrictlySrc from '../../demos/tree-select/11-disable-strictly.svelte?raw';
  import Controlled from '../../demos/tree-select/12-controlled.svelte';
  import controlledSrc from '../../demos/tree-select/12-controlled.svelte?raw';
  import CheckRelation from '../../demos/tree-select/13-check-relation.svelte';
  import checkRelationSrc from '../../demos/tree-select/13-check-relation.svelte?raw';
  import SearchExpandControlled from '../../demos/tree-select/14-search-expand-controlled.svelte';
  import searchExpandControlledSrc from '../../demos/tree-select/14-search-expand-controlled.svelte?raw';
  import Virtualize from '../../demos/tree-select/15-virtualize.svelte';
  import virtualizeSrc from '../../demos/tree-select/15-virtualize.svelte?raw';
  import DynamicData from '../../demos/tree-select/16-dynamic-data.svelte';
  import dynamicDataSrc from '../../demos/tree-select/16-dynamic-data.svelte?raw';
  import LoadData from '../../demos/tree-select/17-load-data.svelte';
  import loadDataSrc from '../../demos/tree-select/17-load-data.svelte?raw';
  import TriggerRender from '../../demos/tree-select/18-trigger-render.svelte';
  import triggerRenderSrc from '../../demos/tree-select/18-trigger-render.svelte?raw';
  import RenderSelected from '../../demos/tree-select/19-render-selected.svelte';
  import renderSelectedSrc from '../../demos/tree-select/19-render-selected.svelte?raw';
  import SearchMethod from '../../demos/tree-select/20-search-method.svelte';
  import searchMethodSrc from '../../demos/tree-select/20-search-method.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { TreeSelect } from '@chenzy-design/svelte';
```

### 基本用法

最简单的用法，默认为单选模式，每一级菜单项均可选择。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 多选

设置 `multiple`，可以进行多选。多选情况下所有子项都被选择时，自动勾选显示其父项。通过 `leafOnly` 属性，可以设置只展示叶子节点，同时 onChange 的回调入参也会只有叶子节点的值。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 限制标签展示数量

在多选的场景中，利用 `maxTagCount` 可以限制展示的标签数量，超出部分将以 +N 的方式展示。使用 `showRestTagsPopover` 可以设置在超出 `maxTagCount` 后，hover +N 是否显示 Popover，默认为 `false`。并且，还可以在 `restTagsPopoverProps` 属性中配置 Popover。

<DemoBox code={maxTagCountSrc}><MaxTagCount /></DemoBox>

### 可搜索的

通过设置 `filterTreeNode` 属性可支持搜索功能。默认对 `label` 值进行搜索，可通过 `treeNodeFilterProp` 更改。如果只希望展示过滤后的结果，可以设置 `showFilteredOnly`。如果想要获取搜索结果的具体信息，可使用 `onSearch` 回调函数。

<DemoBox code={searchableSrc}><Searchable /></DemoBox>

### 远程搜索

通过设置 `remote` 属性可启用远程搜索。开启后，输入时不会执行本地过滤，而是仅触发 `onSearch` 回调，用户可自行处理远程数据获取并更新 `treeData`。

<DemoBox code={remoteSearchSrc}><RemoteSearch /></DemoBox>

### 搜索框位置

可以使用 `searchPosition` 来设置搜索框的位置，可选：`dropdown`（默认）、`trigger`。当输入框位于 trigger 时，搜索框占位符由 `placeholder` 控制；`showClear=true` 时，点击输入框的清空按钮，将同时清空 inputValue 和 value。

<DemoBox code={searchPositionSrc}><SearchPosition /></DemoBox>

### Trigger 内多行换行

当你在**多选 + 搜索框位于 trigger** 的场景下，选择了较多项或输入较长文本时，默认 trigger 可能会更倾向于保持单行展示。通过设置 `triggerTagWrap={true}`，可以让 trigger 内的已选标签支持自动换行（多行展示）。

<DemoBox code={triggerTagWrapSrc}><TriggerTagWrap /></DemoBox>

### 尺寸大小

可以通过 `size` 设置尺寸大小，可选：`small`、`default`、`large`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 默认展开

`defaultExpandAll` 和 `expandAll` 均可以设置 TreeSelect 的默认展开/收起状态。二者的区别是，`defaultExpandAll` 只在初始化时生效，而 `expandAll` 不仅会在初始化时生效，当数据（`treeData`）发生动态更新时，`expandAll` 也仍然生效。

<DemoBox code={defaultExpandSrc}><DefaultExpand /></DemoBox>

### 禁用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 严格禁用

可以使用 `disableStrictly` 来开启严格禁用。开启严格禁用后，当节点是 disabled 的时候，则不能通过子级或者父级的关系改变选中状态。以下面的 demo 为例，节点「中国」开启了严格禁用，因此，当我们改变其父节点「亚洲」的选中状态时，也不会影响到节点「中国」的选中状态。

<DemoBox code={disableStrictlySrc}><DisableStrictly /></DemoBox>

### 受控

传入 `value` 时即为受控组件，可以配合 `onChange` 使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 节点选中关系

多选时，可以使用 `checkRelation` 来设置节点之间选中关系的类型，可选：`related`（默认）、`unRelated`。当选中关系为 `unRelated` 时，意味着节点之间的选中互不影响。

<DemoBox code={checkRelationSrc}><CheckRelation /></DemoBox>

### 开启搜索的展开受控

传入 `expandedKeys` 时即为展开受控组件，可以配合 `onExpand` 使用。当展开受控时，如果开启 `filterTreeNode` 并进行搜索是不会再自动展开节点的，此时，节点的展开完全由 `expandedKeys` 来控制。你可以利用 `onSearch` 的入参 `filteredExpandedKeys` 来实现展开受控时的搜索展开效果。

<DemoBox code={searchExpandControlledSrc}><SearchExpandControlled /></DemoBox>

### 虚拟化

列表虚拟化，用于大量树节点的情况。开启后，动画效果将被关闭。`virtualize` 是一个包含 `height`、`width`、`itemSize` 的对象。如果带搜索框，建议开启 `showFilteredOnly` 减少多余节点的渲染。

<DemoBox code={virtualizeSrc}><Virtualize /></DemoBox>

### 动态更新数据

<DemoBox code={dynamicDataSrc}><DynamicData /></DemoBox>

### 异步加载数据

通过设置 `loadData` 可以动态加载数据，此时需要在数据中传入 `isLeaf` 标明叶子节点。

<DemoBox code={loadDataSrc}><LoadData /></DemoBox>

### 自定义 Trigger

如果默认的触发器样式满足不了你的需求，可以用 `triggerRender` 自定义选择框的展示。

<DemoBox code={triggerRenderSrc}><TriggerRender /></DemoBox>

### 自定义渲染已选项

你可以通过 `renderSelectedItem` 自定义选择框中已选项标签的渲染结构。

<DemoBox code={renderSelectedSrc}><RenderSelected /></DemoBox>

### 命令式搜索

如果需要在外部自定义搜索框，可以通过 `bind:this` 拿到组件实例后，在自定义搜索框值变更时主动调用 `search` 方法，改变筛选结果。

<DemoBox code={searchMethodSrc}><SearchMethod /></DemoBox>

## API 参考

### TreeSelect

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| arrowIcon | 自定义右侧下拉箭头 Icon | Snippet | - |
| autoAdjustOverflow | 浮层被遮挡时是否自动调整方向 | boolean | true |
| autoExpandParent | 是否自动展开父节点 | boolean | false |
| autoMergeValue | 开启后，当某个父节点被选中时，value 将不包括该节点的子孙节点（在 leafOnly 为 false 时生效） | boolean | true |
| borderless | 无边框模式 | boolean | false |
| checkRelation | 多选时，节点之间选中状态的关系，可选：`related`、`unRelated` | string | related |
| class | 选择框的 className 属性 | string | - |
| clearIcon | 可用于自定义清除按钮，showClear 为 true 时有效 | Snippet | - |
| clickToHide | 选择后是否自动关闭下拉弹层，仅单选模式有效 | boolean | true |
| defaultExpandAll | 设置在初始化时是否展开所有节点 | boolean | false |
| defaultExpandedKeys | 默认展开的节点，显示其直接子级 | `string[]` | - |
| defaultOpen | 默认展开下拉菜单 | boolean | false |
| defaultValue | 指定默认选中的条目 | `string \| number \| array` | - |
| disabled | 是否禁用 | boolean | false |
| disableStrictly | 是否严格禁用 | boolean | false |
| dropdownClassName | 下拉菜单的 className 属性 | string | - |
| dropdownMatchSelectWidth | 下拉菜单最小宽度是否等于 Select | boolean | true |
| dropdownStyle | 下拉菜单的样式 | `string \| Record<string, string>` | - |
| emptyContent | 当搜索无结果时展示的内容 | `string \| Snippet` | 暂无数据 |
| expandAll | 设置是否默认展开所有节点，若后续数据发生改变，展开情况也会受此 api 影响 | boolean | false |
| expandedKeys | （受控）展开的节点，默认展开节点显示其直接子级 | `string[]` | - |
| expandIcon | 自定义展开图标 | Snippet | - |
| keyMaps | 自定义节点中 key、label、value 的字段 | object | - |
| filterTreeNode | 是否根据输入项进行筛选，默认用 treeNodeFilterProp 的值筛选 | `boolean \| ((input, treeNodeString, data) => boolean)` | false |
| remote | 是否启用远程搜索，开启后输入时跳过本地过滤，仅触发 onSearch 回调 | boolean | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative` | `() => HTMLElement` | - |
| labelEllipsis | 是否开启 label 的超出省略，默认虚拟化状态下开启 | boolean | false |
| leafOnly | 多选模式下 onChange 回调入参及展示标签只有叶子节点 | boolean | false |
| loadData | 异步加载数据，需要返回一个 Promise | `(node) => Promise<node[]>` | - |
| maxTagCount | 最多显示多少个 tag | number | - |
| motionExpand | 是否开启选项树节点动画 | boolean | true |
| multiple | 是否支持多选 | boolean | false |
| outerBottomSlot | 渲染在弹出层底部，与 optionList 平级的自定义 slot | Snippet | - |
| outerTopSlot | 渲染在弹出层顶部，与 optionList 平级的自定义 slot | Snippet | - |
| placeholder | 选择框默认文字 | string | - |
| position | 下拉菜单位置，可选值参考 Tooltip position | string | bottomLeft |
| prefix | 前缀标签 | `string \| Snippet` | - |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | - |
| renderFullLabel | 完全自定义 label 的渲染函数 | Snippet | - |
| renderLabel | 自定义 label 的渲染函数 | Snippet | - |
| renderSelectedItem | 自定义渲染已选项 | `Snippet<[{ node, onRemove }]>` | - |
| restTagsPopoverProps | Popover 的配置属性 | object | `{}` |
| searchAutoFocus | 搜索框自动聚焦 | boolean | false |
| searchPlaceholder | 搜索框默认文字 | string | - |
| searchPosition | 设置搜索框的位置，可选：`dropdown`、`trigger` | string | dropdown |
| triggerTagWrap | 是否允许在 trigger 内将多选标签换行展示（仅多选 + filterTreeNode + searchPosition="trigger" 时生效） | boolean | false |
| showClear | 当值不为空时，trigger 是否展示清除按钮 | boolean | false |
| showFilteredOnly | 搜索状态下是否只展示过滤后的结果 | boolean | false |
| showLine | 选项面板中选项显示连接线 | boolean | false |
| showRestTagsPopover | 当超过 maxTagCount，hover +N 时，是否通过 Popover 显示剩余内容 | boolean | false |
| showSearchClear | 是否显示搜索框的清除按钮 | boolean | true |
| size | 选择框大小，可选 `large`、`small`、`default` | string | default |
| style | 选择框的样式 | string | - |
| suffix | 后缀标签 | `string \| Snippet` | - |
| treeData | treeNodes 数据，key 值在整个树范围内唯一 | `TreeNodeData[]` | `[]` |
| treeNodeFilterProp | 搜索时输入项过滤对应的 TreeNodeData 属性 | string | label |
| treeNodeLabelProp | 作为显示的 prop 设置 | string | label |
| triggerRender | 自定义触发器渲染方法 | Snippet | - |
| validateStatus | 校验结果，可选 `warning`、`error`、`default`（只影响样式背景色） | string | - |
| value | 当前选中的节点的 value 值，传入时作为受控组件 | `string \| number \| array` | - |
| virtualize | 列表虚拟化，由 height、width、itemSize 组成，开启后将关闭动画效果 | object | - |
| zIndex | treeSelect 下拉菜单的 zIndex | number | 1030 |
| onBlur | 失去焦点时的回调 | `(e) => void` | - |
| onChange | 选中树节点时调用，默认返回当前所有选中项的 value 值及节点属性 | Function | - |
| onChangeWithObject | 是否将选中项 option 的其他属性作为回调 | boolean | false |
| onClear | 点击清除按钮时触发的回调 | `(e) => void` | - |
| onExpand | 展示节点时调用 | `(expandedKeys, object) => void` | - |
| onFocus | 聚焦时的回调 | `(e) => void` | - |
| onLoad | 节点加载完毕时触发的回调 | `(loadedKeys, treeNode) => void` | - |
| onSearch | 文本框值变化时回调 | `(input, filteredExpandedKeys, filteredNodes) => void` | - |
| onSelect | 被选中时调用，返回值为当前事件选项的 key 值 | `(selectedKey, selected, selectedNode) => void` | - |
| onVisibleChange | 弹出层展示/隐藏时触发的回调 | `(isVisible: boolean) => void` | - |

### TreeNodeData

> 不同 TreeNodeData 的 key 值要求必填且唯一。label 允许重复。value 值非必填，此时 onChange、value、defaultValue 中所取的 value 属性值将改为 key 值。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 属性值 | `string \| number` | - |
| label | 展示的文本 | `string \| Snippet` | - |
| icon | 自定义图标 | Snippet | - |
| disabled | 是否禁用，多选状态下支持 | boolean | false |
| key | required 且要求唯一 | string | - |
| isLeaf | 是否为叶子节点 | boolean | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| search(input) | 如果需要在外部自定义搜索框，可以在自定义搜索框值变更时主动调用该方法，改变筛选结果 |

## Accessibility

### ARIA

- TreeSelect 会自动设置 `aria-label` 为 `TreeSelect`，也支持用户自行设置 `aria-label` 来表示该 TreeSelect 作用。
- TreeSelect 允许用户设置 `aria-describedby`、`aria-errormessage`、`aria-invalid`、`aria-labelledby`、`aria-required`。
- TreeSelect 会自动为每个子节点分别设置 `aria-disabled`、`aria-checked`、`aria-selected`、`aria-level` 来表明节点状态及层级。
