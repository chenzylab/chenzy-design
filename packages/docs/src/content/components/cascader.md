---
title: Cascader 级联选择
name: cascader
category: input
brief: 用于选择多级分类下的某个选项。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/cascader/01-basic.svelte';
  import basicSrc from '../../demos/cascader/01-basic.svelte?raw';
  import Multiple from '../../demos/cascader/02-multiple.svelte';
  import multipleSrc from '../../demos/cascader/02-multiple.svelte?raw';
  import Searchable from '../../demos/cascader/03-searchable.svelte';
  import searchableSrc from '../../demos/cascader/03-searchable.svelte?raw';
  import SearchableMultiple from '../../demos/cascader/04-searchable-multiple.svelte';
  import searchableMultipleSrc from '../../demos/cascader/04-searchable-multiple.svelte?raw';
  import MaxTagCount from '../../demos/cascader/05-max-tag-count.svelte';
  import maxTagCountSrc from '../../demos/cascader/05-max-tag-count.svelte?raw';
  import Max from '../../demos/cascader/06-max.svelte';
  import maxSrc from '../../demos/cascader/06-max.svelte?raw';
  import ChangeOnSelect from '../../demos/cascader/07-change-on-select.svelte';
  import changeOnSelectSrc from '../../demos/cascader/07-change-on-select.svelte?raw';
  import Display from '../../demos/cascader/08-display.svelte';
  import displaySrc from '../../demos/cascader/08-display.svelte?raw';
  import Disabled from '../../demos/cascader/09-disabled.svelte';
  import disabledSrc from '../../demos/cascader/09-disabled.svelte?raw';
  import DisableStrictly from '../../demos/cascader/10-disable-strictly.svelte';
  import disableStrictlySrc from '../../demos/cascader/10-disable-strictly.svelte?raw';
  import ShowNext from '../../demos/cascader/11-show-next.svelte';
  import showNextSrc from '../../demos/cascader/11-show-next.svelte?raw';
  import Slots from '../../demos/cascader/12-slots.svelte';
  import slotsSrc from '../../demos/cascader/12-slots.svelte?raw';
  import Controlled from '../../demos/cascader/13-controlled.svelte';
  import controlledSrc from '../../demos/cascader/13-controlled.svelte?raw';
  import AutoMergeValue from '../../demos/cascader/14-auto-merge-value.svelte';
  import autoMergeValueSrc from '../../demos/cascader/14-auto-merge-value.svelte?raw';
  import LeafOnly from '../../demos/cascader/15-leaf-only.svelte';
  import leafOnlySrc from '../../demos/cascader/15-leaf-only.svelte?raw';
  import CheckRelation from '../../demos/cascader/16-check-relation.svelte';
  import checkRelationSrc from '../../demos/cascader/16-check-relation.svelte?raw';
  import DynamicData from '../../demos/cascader/17-dynamic-data.svelte';
  import dynamicDataSrc from '../../demos/cascader/17-dynamic-data.svelte?raw';
  import LoadData from '../../demos/cascader/18-load-data.svelte';
  import loadDataSrc from '../../demos/cascader/18-load-data.svelte?raw';
  import Remote from '../../demos/cascader/19-remote.svelte';
  import remoteSrc from '../../demos/cascader/19-remote.svelte?raw';
  import VirtualizedSearch from '../../demos/cascader/20-virtualized-search.svelte';
  import virtualizedSearchSrc from '../../demos/cascader/20-virtualized-search.svelte?raw';
  import TriggerRender from '../../demos/cascader/21-trigger-render.svelte';
  import triggerRenderSrc from '../../demos/cascader/21-trigger-render.svelte?raw';
  import KeyMaps from '../../demos/cascader/22-key-maps.svelte';
  import keyMapsSrc from '../../demos/cascader/22-key-maps.svelte?raw';
  import ChangeWithObject from '../../demos/cascader/23-change-with-object.svelte';
  import changeWithObjectSrc from '../../demos/cascader/23-change-with-object.svelte?raw';
</script>

## 使用场景

与 TreeSelect 组件的区别：

- TreeSelect：核心价值在于**目标节点**，层级结构是为了方便用户快速筛选出目标选项，最终的节点才是用户想要的内容，常见于文件/文件夹选择、组织架构、权限分配等场景。
- Cascader：核心价值在于**路径**，用户选择的不是一个孤立的点，而是一条从根到叶的完整路径，常用于地理位置、商品分类等场景。

## 代码演示

### 如何引入

```jsx
import { Cascader } from '@chenzy-design/svelte';
```

### 基本用法

最简单的用法，默认只可以选叶子节点。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 多选

设置 `multiple`，可以进行多选。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 可搜索的

通过设置 `filterTreeNode` 属性可支持搜索功能。默认对 `label` 值进行搜索（使用字符串的 includes 方法进行匹配，不区分大小写），可通过 `treeNodeFilterProp` 指定其他属性值进行搜索。默认搜索结果只会展示叶子结点的路径，想要显示更多的结果，可以设置 `filterLeafOnly` 为 `false`。

<DemoBox code={searchableSrc}><Searchable /></DemoBox>

### 可搜索的多选

支持多选和搜索同时使用，在这种场景下，可以通过按下 BackSpace 键来删除对应的已选项目。

<DemoBox code={searchableMultipleSrc}><SearchableMultiple /></DemoBox>

### 限制标签展示数量

在多选的场景中，利用 `maxTagCount` 可以限制展示的标签数量，超出部分将以 +N 的方式展示。使用 `showRestTagsPopover` 可以设置在超出 maxTagCount 后，hover +N 是否显示 Popover，默认为 false。并且，还可以在 `restTagsPopoverProps` 属性中配置 Popover。

<DemoBox code={maxTagCountSrc}><MaxTagCount /></DemoBox>

### 限制选中数量

在多选的场景中，利用 `max` 可以限制多选选中的数量。超出 max 后将触发 `onExceed` 回调。

<DemoBox code={maxSrc}><Max /></DemoBox>

### 选择即改变

在单选的情况下，还可以通过设置 `changeOnSelect`，允许选中父级选项。

<DemoBox code={changeOnSelectSrc}><ChangeOnSelect /></DemoBox>

### 自定义显示

可以通过 `separator` 设置分隔符，包括：搜索时显示在下拉框的内容以及单选时回显到 Trigger 的内容的分隔符。也可以通过设置 `displayRender` 设定返回格式。

<DemoBox code={displaySrc}><Display /></DemoBox>

### 禁用

通过节点的 `disabled` 字段禁用单个选项或整棵子树。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 严格禁用

可以使用 `disableStrictly` 来开启严格禁用。开启严格禁用后，当节点是 disabled 的时候，则不能通过子级或者父级的关系改变选中状态。以下面的 demo 为例，节点「宁波市」开启了严格禁用，因此，当我们改变其父节点「浙江省」的选中状态时，也不会影响到节点「宁波市」的选中状态。

<DemoBox code={disableStrictlySrc}><DisableStrictly /></DemoBox>

### 展示子菜单的时机与点击选中

可以使用 `showNext` 设置展开 Dropdown 子菜单的触发时机，可选：`click`（默认）、`hover`。在多选模式下，你可以通过 `clickToSelect` 开启点击任意节点即选中的功能。这个 API 在配合 `showNext="hover"` 使用时特别有用：鼠标悬浮展开子菜单，点击则选中当前节点。

<DemoBox code={showNextSrc}><ShowNext /></DemoBox>

### 在顶部/底部渲染附加项

我们在级联选择器的顶部、底部分别预留了插槽，你可以通过 `topSlot` 或 `bottomSlot` 来设置。

<DemoBox code={slotsSrc}><Slots /></DemoBox>

### 受控

传入 `value` 时即为受控组件，可以配合 `onChange` 使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 自动合并 value

在多选（multiple=true）场景中，当我们选中祖先节点时，如果希望 value 不包含它对应的子孙节点，则可以通过 `autoMergeValue` 来设置，默认为 true。当 autoMergeValue 和 leafOnly 同时开启时，后者优先级更高。

<DemoBox code={autoMergeValueSrc}><AutoMergeValue /></DemoBox>

### 仅叶子节点

在多选时，可以通过开启 `leafOnly` 来设置 value 只包含叶子节点，即显示的 Tag 和 onChange 的参数 value 只包含叶子节点。

<DemoBox code={leafOnlySrc}><LeafOnly /></DemoBox>

### 节点选中关系

多选时，可以使用 `checkRelation` 来设置节点之间选中关系的类型，可选：`related`（默认）、`unRelated`。当选中关系为 `unRelated` 时，意味着节点之间的选中互不影响。

<DemoBox code={checkRelationSrc}><CheckRelation /></DemoBox>

### 动态更新数据

<DemoBox code={dynamicDataSrc}><DynamicData /></DemoBox>

### 异步加载数据

可以使用 `loadData` 实现异步加载数据。**不能与搜索同时使用**。

<DemoBox code={loadDataSrc}><LoadData /></DemoBox>

### 远程搜索

设置 `remote` 后，搜索输入不再走本地匹配，而是仅触发 `onSearch` 回调，由你根据输入异步拉取 `treeData`。这与 Select 的 `remote` 行为一致。搜索时建议自行处理防抖、竞态保护、loading 提示、空输入还原等。

<DemoBox code={remoteSrc}><Remote /></DemoBox>

### 超长列表

当你的数据结构层级特别深时，Cascader 下拉菜单可能会超出屏幕。如果搜索结果中存在大量 Option，可以通过设置 `virtualizeInSearch` 开启搜索结果面板的虚拟化来优化性能。virtualizeInSearch 是一个包含 `height`、`width`、`itemSize` 的对象。

<DemoBox code={virtualizedSearchSrc}><VirtualizedSearch /></DemoBox>

### 自定义 Trigger

如果默认的触发器样式满足不了你的需求，可以用 `triggerRender` 自定义选择框的展示。

<DemoBox code={triggerRenderSrc}><TriggerRender /></DemoBox>

### 自定义字段映射

可以通过 `keyMaps` 自定义节点中 value、label、children、disabled、isLeaf 的字段名。

<DemoBox code={keyMapsSrc}><KeyMaps /></DemoBox>

### 获取选项的其他属性

设为 `onChangeWithObject` 时，`onChange` 的入参类型会从 value 变为节点对象。

<DemoBox code={changeWithObjectSrc}><ChangeWithObject /></DemoBox>

## API 参考

### Cascader

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| arrowIcon | 自定义右侧下拉箭头 Icon | Snippet | - |
| autoAdjustOverflow | 是否自动调整下拉框展开方向，用于边缘遮挡时自动调整展开方向 | boolean | true |
| autoMergeValue | 开启后，当某个父节点被选中时，value 将不包括该节点的子孙节点。不支持动态切换 | boolean | true |
| bottomSlot | 底部插槽 | Snippet | - |
| borderless | 无边框模式 | boolean | false |
| changeOnSelect | 是否允许选择非叶子节点 | boolean | false |
| checkRelation | 多选时，节点之间选中状态的关系，可选：`related`、`unRelated` | string | related |
| class | 选择框的 className 属性 | string | - |
| clearIcon | 可用于自定义清除按钮，showClear 为 true 时有效 | Snippet | - |
| defaultOpen | 设置是否默认打开下拉菜单 | boolean | false |
| defaultValue | 指定默认选中的条目 | `string \| number \| array` | - |
| disabled | 是否禁用 | boolean | false |
| disableStrictly | 开启严格禁用后，当节点是 disabled 时，不能通过子级或父级的关系改变选中状态 | boolean | false |
| displayProp | 设置回填选项显示的属性值 | string | label |
| displayRender | 设置回填格式 | `(labels: string[], nodes) => string` | - |
| dropdownClassName | 下拉菜单的 className 属性 | string | - |
| dropdownStyle | 下拉菜单的样式 | string | - |
| emptyContent | 当搜索无结果时展示的内容 | `string \| Snippet` | 暂无数据 |
| filterLeafOnly | 搜索结果是否只展示叶子结点路径 | boolean | true |
| filterRender | 自定义渲染筛选后的选项 | Snippet | - |
| filterSorter | 对筛选后的选项进行排序 | `(a, b, input: string) => number` | - |
| filterTreeNode | 设置筛选，true 用默认策略，传入函数自定义 | `boolean \| ((input, path) => boolean)` | false |
| getPopupContainer | 指定父级 DOM，自定义需要设置 `position: relative` | `() => HTMLElement` | `() => document.body` |
| keyMaps | 自定义节点中 value、label、children、disabled、isLeaf 的字段 | object | - |
| leafOnly | 多选时设置 value 只包含叶子节点。不支持动态切换 | boolean | false |
| loadData | 异步加载数据，需要返回一个 Promise | `(node) => Promise<node[]>` | - |
| max | 多选时限制选中数量，超出后触发 onExceed 回调 | number | - |
| maxTagCount | 多选时标签的最大展示数量，超出后以 +N 形式展示 | number | - |
| motion | 设置下拉框弹出的动画 | boolean | true |
| multiple | 设置多选 | boolean | false |
| placeholder | 选择框默认文字 | string | - |
| position | 方向，可选值同 Tooltip position | string | bottom |
| prefix | 前缀标签 | Snippet | - |
| remote | 是否开启远程搜索，行为与 Select 的 remote 一致 | boolean | false |
| restTagsPopoverProps | Popover 的配置属性 | object | `{}` |
| separator | 自定义分隔符 | string | / |
| showClear | 是否展示清除按钮 | boolean | false |
| showNext | 设置展开 Dropdown 子菜单的方式，可选：`click`、`hover` | string | click |
| showRestTagsPopover | 当超过 maxTagCount，hover +N 时，是否通过 Popover 显示剩余内容 | boolean | false |
| size | 选择框大小，可选 `large`、`small`、`default` | string | default |
| clickToSelect | 多选时，点击任意节点即可触发选中，常配合 showNext="hover" 使用 | boolean | false |
| style | 选择框的样式 | string | - |
| suffix | 后缀标签 | Snippet | - |
| topSlot | 顶部插槽 | Snippet | - |
| treeData | 展示数据，具体属性参考 CascaderData | `CascaderData[]` | `[]` |
| treeNodeFilterProp | 搜索时输入项过滤对应的 CascaderData 属性 | string | label |
| triggerRender | 自定义触发器渲染方法 | Snippet | - |
| validateStatus | trigger 的校验状态，仅影响展示样式。可选：default、error、warning | string | default |
| value | （受控）选中的条目 | `string \| number \| array` | - |
| virtualizeInSearch | 搜索列表虚拟化，由 height、width、itemSize 组成 | object | - |
| zIndex | 下拉菜单的 zIndex | number | 1030 |
| onBlur | 失焦 Cascader 的回调 | `(e) => void` | - |
| onChange | 选中树节点时调用，默认返回选中项 path 的 value 数组 | `(value) => void` | - |
| onChangeWithObject | 设为 true 时，onChange 的入参类型会从 value 变为节点对象 | boolean | false |
| onClear | showClear 为 true 时，点击清空按钮触发的回调 | `() => void` | - |
| onDropdownVisibleChange | 下拉框切换时的回调 | `(visible: boolean) => void` | - |
| onExceed | 多选时，超出 max 后触发的回调 | `(items) => void` | - |
| onFocus | 聚焦 Cascader 的回调 | `(e) => void` | - |
| onLoad | 节点加载完毕时触发的回调 | `(keys, data) => void` | - |
| onSearch | 文本框值变化时回调 | `(value: string) => void` | - |
| onSelect | 被选中时调用，返回选中项的 value | `(value) => void` | - |

### CascaderData

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 子节点 | `CascaderData[]` | - |
| disabled | 不可选状态 | boolean | - |
| isLeaf | 叶子节点 | boolean | - |
| label | 展示的文本（必填） | `string \| Snippet` | - |
| loading | 正在加载 | boolean | - |
| value | 属性值（必填） | `string \| number` | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 方法 | 说明 |
| --- | --- |
| close | 调用时可以手动关闭下拉列表 |
| open | 调用时可以手动展开下拉列表 |
| focus | 调用时可以手动聚焦 |
| blur | 调用时可以手动失焦 |
| search | 手动触发搜索，需同时设置 filterTreeNode 开启搜索 |

## Accessibility

### ARIA

- Cascader 支持传入 `aria-label`、`aria-describedby`、`aria-errormessage`、`aria-invalid`、`aria-labelledby`、`aria-required` 来表示该 Cascader 的相关信息。
- Cascader 支持通过按下 Enter 键来选中选项、清空选项、展开下拉框。
