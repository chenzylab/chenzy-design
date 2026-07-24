---
title: Select 选择器
name: select
category: input
brief: 用户可以通过 Select 选择器从一个选项集合中去选中一个或多个选项，并呈现最终选择结果。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/select/01-basic.svelte';
  import basicSrc from '../../demos/select/01-basic.svelte?raw';
  import OptionListDemo from '../../demos/select/02-option-list.svelte';
  import optionListSrc from '../../demos/select/02-option-list.svelte?raw';
  import Multiple from '../../demos/select/03-multiple.svelte';
  import multipleSrc from '../../demos/select/03-multiple.svelte?raw';
  import Group from '../../demos/select/04-group.svelte';
  import groupSrc from '../../demos/select/04-group.svelte?raw';
  import Size from '../../demos/select/05-size.svelte';
  import sizeSrc from '../../demos/select/05-size.svelte?raw';
  import Status from '../../demos/select/06-status.svelte';
  import statusSrc from '../../demos/select/06-status.svelte?raw';
  import PrefixSuffix from '../../demos/select/07-prefix-suffix.svelte';
  import prefixSuffixSrc from '../../demos/select/07-prefix-suffix.svelte?raw';
  import Slots from '../../demos/select/08-slots.svelte';
  import slotsSrc from '../../demos/select/08-slots.svelte?raw';
  import Controlled from '../../demos/select/09-controlled.svelte';
  import controlledSrc from '../../demos/select/09-controlled.svelte?raw';
  import DynamicOptions from '../../demos/select/10-dynamic-options.svelte';
  import dynamicOptionsSrc from '../../demos/select/10-dynamic-options.svelte?raw';
  import Linked from '../../demos/select/11-linked.svelte';
  import linkedSrc from '../../demos/select/11-linked.svelte?raw';
  import Filter from '../../demos/select/12-filter.svelte';
  import filterSrc from '../../demos/select/12-filter.svelte?raw';
  import SearchPosition from '../../demos/select/13-search-position.svelte';
  import searchPositionSrc from '../../demos/select/13-search-position.svelte?raw';
  import Remote from '../../demos/select/14-remote.svelte';
  import remoteSrc from '../../demos/select/14-remote.svelte?raw';
  import FilterFunction from '../../demos/select/15-filter-function.svelte';
  import filterFunctionSrc from '../../demos/select/15-filter-function.svelte?raw';
  import RenderSelected from '../../demos/select/16-render-selected.svelte';
  import renderSelectedSrc from '../../demos/select/16-render-selected.svelte?raw';
  import DropdownStyle from '../../demos/select/17-dropdown-style.svelte';
  import dropdownStyleSrc from '../../demos/select/17-dropdown-style.svelte?raw';
  import ChangeWithObject from '../../demos/select/18-change-with-object.svelte';
  import changeWithObjectSrc from '../../demos/select/18-change-with-object.svelte?raw';
  import Create from '../../demos/select/19-create.svelte';
  import createSrc from '../../demos/select/19-create.svelte?raw';
  import Virtualize from '../../demos/select/20-virtualize.svelte';
  import virtualizeSrc from '../../demos/select/20-virtualize.svelte?raw';
  import TriggerRender from '../../demos/select/21-trigger-render.svelte';
  import triggerRenderSrc from '../../demos/select/21-trigger-render.svelte?raw';
  import RenderOption from '../../demos/select/22-render-option.svelte';
  import renderOptionSrc from '../../demos/select/22-render-option.svelte?raw';
  import Methods from '../../demos/select/23-methods.svelte';
  import methodsSrc from '../../demos/select/23-methods.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Select } from '@chenzy-design/svelte';
```

### 基本使用

每个选项都必须声明 `value` 属性，`label` 将会被渲染至下拉列表中。

<Notice type="primary" title="注意">

本库 Select 通过 `optionList` 数组传入候选项（对齐 Semi 的 `optionList` 用法）。Semi 也支持组合式 `<Select.Option>` / `<Select.OptGroup>` children 声明，本库因 Svelte 无法像 React.Children 遍历 children 收集，统一走数据驱动的 `optionList`。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 以数组形式传入 Option

可以直接通过 `optionList` 传入一个对象数组，每个对象必须包含 value / label 属性（当然其他属性也可以通过此方式传入）。

<DemoBox code={optionListSrc}><OptionListDemo /></DemoBox>

### 多选

配置 `multiple` 属性，可以支持多选。

配置 `maxTagCount` 可以限制已选项展示的数量，超出部分将以 +N 的方式展示。

配置 `ellipsisTrigger` 对溢出部分的 tag 做自适应处理，当宽度不足时，最后一个 tag 内容作截断处理。开启该功能后会有一定性能损耗，不推荐在大表单场景下使用。

配置 `expandRestTagsOnClick` 可以在设置 `maxTagCount` 情况下通过点击展示全剩余的 tag。

使用 `showRestTagsPopover` 可以设置在超出 `maxTagCount` 后，hover +N 是否显示 Popover，默认为 `false`。并且，还可以在 `restTagsPopoverProps` 属性中配置 Popover。

配置 `max` 属性可限制最大可选的数量，超出最大限制数量后无法选中，同时会触发 `onExceed` 回调。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 分组

`optionList` 中含 `{ label, options }` 的对象即渲染为一个分组。

<DemoBox code={groupSrc}><Group /></DemoBox>

### 不同尺寸

通过 `size` 控制选择器的大小尺寸：`small` / `default` / `large`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 不同校验状态样式

`validateStatus`：default / warning / error，仅影响背景颜色等样式表现。

<DemoBox code={statusSrc}><Status /></DemoBox>

### 配置前缀、后缀、清除按钮

- 可以通过 `prefix` 传入选择框前缀，通过 `suffix` 传入选择框后缀，可以为文本或者节点。当 prefix、suffix 传入的内容为文本或者 Icon 时，会自动带上左右间隔，若为自定义节点，则左右间隔为 0。
- 通过 `showClear` 控制清除按钮是否展示。
- 通过 `showArrow` 控制右侧下拉箭头是否展示。

<DemoBox code={prefixSuffixSrc}><PrefixSuffix /></DemoBox>

### 在顶部/底部渲染附加项

我们在弹出层顶部、底部分别预留了插槽，当你需要在弹出层中添加自定义 node 时，可以通过 `innerBottomSlot` 或者 `outerBottomSlot` 传入，自定义 node 将会被渲染在弹出层底部；可以通过 `innerTopSlot` 或者 `outerTopSlot` 传入，自定义 node 将会被渲染在弹出层顶部。

- `innerTopSlot` 和 `innerBottomSlot` 将会被渲染在 optionList 内部，当滚动到 optionList 顶部/底部时展现。
- `outerTopSlot` 和 `outerBottomSlot` 将会被渲染为与 optionList 平级，无论 optionList 是否滚动，都会始终展现。

<DemoBox code={slotsSrc}><Slots /></DemoBox>

### 受控组件

传入 `value` 时 Select 为受控组件，所选中的值完全由 value 决定。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 动态修改 Options

如果需要动态更新 Options，应该使用受控的 `value`。

<DemoBox code={dynamicOptionsSrc}><DynamicOptions /></DemoBox>

### 联动

使用受控 `value`，实现不同 Select 之间的联动。如果是带有层级关系的复杂联动建议直接使用 `Cascader` 组件。

<DemoBox code={linkedSrc}><Linked /></DemoBox>

### 开启搜索

将 `filter` 置为 true，开启搜索能力。默认搜索策略将为 input 输入值与 option 的 label 值进行 include 对比。

默认情况下，多选选中后会自动清空搜索关键字。若你希望保留，可以通过 `autoClearSearchValue` 设为 false 关闭默认行为。

<DemoBox code={filterSrc}><Filter /></DemoBox>

### 搜索框位置

默认搜索框展示于 Select 的 Trigger 触发器上。通过 `searchPosition` 可以指定不同的位置，可选 `dropdown`、`trigger`。若希望定制位于 dropdown 中的 Input 搜索框的 placeholder，可以通过 `searchPlaceholder` 控制。

<DemoBox code={searchPositionSrc}><SearchPosition /></DemoBox>

### 远程搜索

带有远程搜索，防抖请求，加载状态的多选示例。通过 `filter` 开启搜索能力，将 `remote` 设置为 true 关闭对当前数据的筛选过滤，通过动态更新 `optionList` 更新下拉菜单中的备选项，并使用受控的 value 属性。

<DemoBox code={remoteSrc}><Remote /></DemoBox>

### 自定义搜索逻辑

可以将 `filter` 置为自定义函数，定制你想要的搜索策略。如下例子，选项 label 值都是大写，默认的检索策略是字符串 include 对比，会区分大小写。通过传入自定义 `filter` 函数，检索时输入小写字母也能搜到相应内容。

<DemoBox code={filterFunctionSrc}><FilterFunction /></DemoBox>

### 自定义已选项标签渲染

默认情况下，选中选项后会将 option.label 的内容回填到选择框中。但你可以通过 `renderSelectedItem` 自定义选择框中已选项标签的渲染结构。

<DemoBox code={renderSelectedSrc}><RenderSelected /></DemoBox>

### 自定义弹出层样式

你可以通过 `dropdownClassName`、`dropdownStyle` 控制弹出层的样式。例如当自定义弹出层的宽度时，可以通过 dropdownStyle 传入 width。

<DemoBox code={dropdownStyleSrc}><DropdownStyle /></DemoBox>

### 获取选项的其他属性

默认情况下 `onChange` 只能拿到 value，如果需要拿选中节点的其他属性，可以使用 `onChangeWithObject` 回调。此时回调函数的入参将会是 object，包含 option 的各种属性，例如 `{ value, label, ...rest }`。

<DemoBox code={changeWithObjectSrc}><ChangeWithObject /></DemoBox>

### 创建条目

设置 `allowCreate`，可以创建并选中选项中不存在的条目。允许通过 `renderCreateItem` 自定义创建标签时的内容显示。可以配合 `defaultActiveFirstOption` 属性使用，自动选中第一项，当输入完内容直接回车时，可立即创建。

<Notice type="primary" title="注意">

当开启 allowCreate 后，不会再响应对 optionList 的更新。

</Notice>

<DemoBox code={createSrc}><Create /></DemoBox>

### 虚拟化

传入 `virtualize` 时开启列表虚拟化，用于大量 Option 节点的情况优化性能。virtualize 是一个包含下列值的对象：

- `height`：Option 列表高度值，默认 270。
- `width`：Option 列表宽度值，默认 100%。
- `itemSize`：每行 Option 的高度，必传。

<Notice type="primary" title="关于高度设置">

当 virtualize.height 大于默认值 270px 时，为了避免出现双滚动条问题，需要将 maxHeight 属性设置为与 virtualize.height 相同的值。

</Notice>

<DemoBox code={virtualizeSrc}><Virtualize /></DemoBox>

### 自定义触发器

如果 Select 默认的触发器样式满足不了你的需求，可以用 `triggerRender` 自定义选择框的展示。如果想保留搜索筛选能力，又不希望自己渲染 Input 相关的结构，可以同时通过 `searchPosition='dropdown'`，将默认的搜索框置于下拉列表中。

<DemoBox code={triggerRenderSrc}><TriggerRender /></DemoBox>

### 自定义候选项渲染

通过传入 `renderOptionItem`，你可以完全接管列表中候选项的渲染，并且从回调入参中，获取到相关的状态值。

注意事项：

1. 选中（selected）、聚焦（focused）、禁用（disabled）等状态的样式需自行加上，你可以从入参中获取到相对的 boolean 值。
2. 入参的 `onMouseEnter`、`onClick` 需在 wrapper dom 上消费，否则上下键盘操作时显示会有问题。

<DemoBox code={renderOptionSrc}><RenderOption /></DemoBox>

### 命令式方法

通过 `bind:this` 拿到组件实例后，可以命令式调用 `open` / `close` / `focus` / `selectAll` / `deselectAll` 等方法。

<DemoBox code={methodsSrc}><Methods /></DemoBox>

## API 参考

### Select Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allowCreate | 是否允许用户创建新条目，需配合 filter 使用。该项为 true 时不再响应 optionList 的变更 | boolean | false |
| arrowIcon | 自定义右侧下拉箭头 Icon | Snippet | - |
| autoAdjustOverflow | 浮层被遮挡时是否自动调整方向 | boolean | true |
| autoClearSearchValue | 选中选项后，是否自动清空搜索关键字，当 multiple、filter 都开启时生效 | boolean | true |
| autofocus | 初始渲染时是否自动 focus | boolean | false |
| borderless | 无边框模式 | boolean | false |
| class | 类名 | string | - |
| clearIcon | 可用于自定义清除按钮，showClear 为 true 时有效 | Snippet | - |
| clickToHide | 已展开时，点击选择框是否自动收起下拉列表 | boolean | false |
| defaultValue | 初始选中的值 | `string \| number \| array` | - |
| defaultOpen | 是否默认展开下拉列表 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| defaultActiveFirstOption | 是否默认高亮第一个选项（按回车可直接选中） | boolean | true |
| dropdownClassName | 弹出层的 className | string | - |
| dropdownMatchSelectWidth | 下拉菜单最小宽度是否等于 Select | boolean | true |
| dropdownStyle | 弹出层的样式 | string | - |
| emptyContent | 无结果时展示的内容 | `string \| Snippet` | - |
| ellipsisTrigger | maxTagCount 存在且多选时，是否对溢出部分的 tag 做自适应处理 | boolean | false |
| expandRestTagsOnClick | maxTagCount 存在且多选时，面板打开状态下是否展开多余的 Tag | boolean | false |
| filter | 是否可搜索。传入 true 采用默认过滤策略；传入函数时接收 `(input, option)` 返回 boolean | `boolean \| ((input: string, option: OptionData) => boolean)` | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative` | `() => HTMLElement` | `() => document.body` |
| innerTopSlot | 渲染在弹出层顶部，在 optionList 内部的自定义 slot | Snippet | - |
| innerBottomSlot | 渲染在弹出层底部，在 optionList 内部的自定义 slot | Snippet | - |
| loading | 下拉列表是否展示加载动画 | boolean | false |
| maxTagCount | 多选模式下，已选项超出 maxTagCount 时，后续选项会被渲染成 +N 的形式 | number | - |
| max | 最多可选几项，仅在多选模式下生效 | number | - |
| maxHeight | 下拉菜单中 optionList 的最大高度 | `string \| number` | 270 |
| multiple | 是否多选 | boolean | false |
| outerTopSlot | 渲染在弹出层顶部，与 optionList 平级的自定义 slot | Snippet | - |
| outerBottomSlot | 渲染在弹出层底部，与 optionList 平级的自定义 slot | Snippet | - |
| optionList | 传入候选项数组，每个元素需具备 label、value 属性；含 options 字段的对象即为分组 | `array` | - |
| placeholder | 选择框默认文字 | `string \| Snippet` | - |
| position | 菜单展开的位置，可选项同 Tooltip position | string | bottomLeft |
| prefix | 选择框的前缀标签 | Snippet | - |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | - |
| renderCreateItem | allowCreate 为 true 时，可自定义创建标签的渲染 | `Snippet<[input]>` | - |
| renderSelectedItem | 自定义选择框中已选项标签的渲染 | `Snippet<[{ option }]>` | - |
| renderOptionItem | 完全自定义下拉列表中候选项的渲染 | `Snippet<[props]>` | - |
| restTagsPopoverProps | Popover 的配置属性 | object | `{}` |
| remote | 是否开启远程搜索，为 true 时 input 内容改变后不会进行本地筛选匹配 | boolean | false |
| searchPosition | filter 开启时，搜索框的位置，可选 `trigger` / `dropdown` | string | trigger |
| searchPlaceholder | 搜索框的 placeholder | string | - |
| size | 大小，可选值 `default` / `small` / `large` | string | default |
| style | 样式 | string | - |
| suffix | 选择框的后缀标签 | Snippet | - |
| showClear | 是否展示清除按钮 | boolean | false |
| showArrow | 是否展示下拉箭头 | boolean | true |
| showRestTagsPopover | 当超过 maxTagCount，hover +N 时，是否通过 Popover 显示剩余内容 | boolean | false |
| spacing | 浮层与选择器的距离 | number | 4 |
| triggerRender | 自定义触发器渲染 | Snippet | - |
| value | 当前选中的值，传入时作为受控组件 | `string \| number \| array` | - |
| validateStatus | 校验结果，可选 `warning` / `error` / `default`（只影响样式背景色） | string | default |
| virtualize | 列表虚拟化，由 height、width、itemSize 组成 | `{ itemSize?: number, height?: number, width?: string \| number }` | - |
| zIndex | 弹层的 zIndex | number | 1030 |
| onBlur | 失去焦点时的回调 | `() => void` | - |
| onChange | 变化时回调函数 | `(value) => void` | - |
| onChangeWithObject | 携带完整 option 对象的变化回调 | `(option) => void` | - |
| onCreate | allowCreate 为 true，创建备选项时的回调 | `(value: string) => void` | - |
| onClear | 清除按钮的回调 | `() => void` | - |
| onDropdownVisibleChange | 下拉菜单展开/收起时的回调 | `(visible: boolean) => void` | - |
| onSearch | input 输入框内容发生改变时回调函数 | `(input: string) => void` | - |
| onSelect | 被选中时的回调 | `(value, option) => void` | - |
| onDeselect | 取消选中时的回调，仅在多选时有效 | `(value, option) => void` | - |
| onExceed | 当试图选择数超出 max 限制时的回调，仅在多选时生效 | `(option) => void` | - |
| onFocus | 获得焦点时的回调 | `() => void` | - |

### Option 属性

`optionList` 数组中每个 Option 对象支持的属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 是否禁用 | boolean | false |
| label | 展示的文本 | `string \| Snippet` | - |
| value | 属性值 | `string \| number` | - |

### OptGroup 属性

`optionList` 数组中含 `options` 字段的对象即为一个分组：

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| label | 分组展示的文本 | string |
| options | 该分组下的 Option 数组 | `OptionData[]` |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 方法 | 说明 |
| --- | --- |
| open | 调用时可以手动展开下拉列表 |
| close | 调用时可以手动关闭下拉列表 |
| focus | 调用时可以手动聚焦 |
| clearInput | 调用时可以手动清空 input 搜索框的值 |
| deselectAll | 调用时可以手动清空所有已选项 |
| selectAll | 调用时可以选中所有 Option |
| search | 可通过实例调用该方法进行搜索，该搜索值会被置给 Input |
| rePosition | 调用时可以手动触发下拉层重新定位 |

## Accessibility

### ARIA

- Select trigger 的 role 为 `combobox`，弹出层的 role 为 `listbox`，可选项的 role 为 `option`。
- Select trigger 具有 `aria-haspopup`、`aria-expanded`、`aria-controls` 属性，表示 trigger 与弹出层的关系。
- 多选时，listbox `aria-multiselectable` 为 true，表示当前可以多选。
- Option 选中时，`aria-selected` 为 true；当 Option 禁用时，`aria-disabled` 为 true。
- 属性 `aria-activedescendant` 能够保证在朗读旁白时识别到当前的选择的 option。

### 键盘和焦点

**不带 Filter 功能的 Select：**

- Select 聚焦后，键盘用户可以通过 `上箭头` 或 `下箭头` 或 `Enter` 键打开下拉菜单，并将焦点自动聚焦到下拉菜单中的第一个选项上（`defaultActiveFirstOption` 默认为 true）。
- 当下拉菜单打开时：使用 `Esc` 键或 `Tab` 键可以关闭菜单；使用 `上箭头` 或 `下箭头` 可以切换选项；被聚焦的选项可以通过 Enter 键选中，并收起面板。

**带 Filter 功能的 Select：**

- Select 聚焦后，键盘用户可以通过 `上箭头` 或 `下箭头` 或 `Enter` 键打开下拉菜单。此时焦点仍然处于 Select 框，用户可以输入内容，同时也能使用 `上箭头` 或 `下箭头` 切换选项。
