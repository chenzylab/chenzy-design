---
title: TagInput 标签输入框
name: taginput
category: input
brief: 标签输入框能够将输入的内容生成标签。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/tag-input/01-basic.svelte';
  import basicSrc from '../../demos/tag-input/01-basic.svelte?raw';
  import Separator from '../../demos/tag-input/02-separator.svelte';
  import separatorSrc from '../../demos/tag-input/02-separator.svelte?raw';
  import ShowClear from '../../demos/tag-input/03-show-clear.svelte';
  import showClearSrc from '../../demos/tag-input/03-show-clear.svelte?raw';
  import Disabled from '../../demos/tag-input/04-disabled.svelte';
  import disabledSrc from '../../demos/tag-input/04-disabled.svelte?raw';
  import Size from '../../demos/tag-input/05-size.svelte';
  import sizeSrc from '../../demos/tag-input/05-size.svelte?raw';
  import ValidateStatus from '../../demos/tag-input/06-validate-status.svelte';
  import validateStatusSrc from '../../demos/tag-input/06-validate-status.svelte?raw';
  import PrefixSuffix from '../../demos/tag-input/07-prefix-suffix.svelte';
  import prefixSuffixSrc from '../../demos/tag-input/07-prefix-suffix.svelte?raw';
  import AddOnBlur from '../../demos/tag-input/08-add-on-blur.svelte';
  import addOnBlurSrc from '../../demos/tag-input/08-add-on-blur.svelte?raw';
  import NoDuplicates from '../../demos/tag-input/09-no-duplicates.svelte';
  import noDuplicatesSrc from '../../demos/tag-input/09-no-duplicates.svelte?raw';
  import Max from '../../demos/tag-input/10-max.svelte';
  import maxSrc from '../../demos/tag-input/10-max.svelte?raw';
  import MaxTagCount from '../../demos/tag-input/11-max-tag-count.svelte';
  import maxTagCountSrc from '../../demos/tag-input/11-max-tag-count.svelte?raw';
  import Controlled from '../../demos/tag-input/12-controlled.svelte';
  import controlledSrc from '../../demos/tag-input/12-controlled.svelte?raw';
  import InputControlled from '../../demos/tag-input/13-input-controlled.svelte';
  import inputControlledSrc from '../../demos/tag-input/13-input-controlled.svelte?raw';
  import Callbacks from '../../demos/tag-input/14-callbacks.svelte';
  import callbacksSrc from '../../demos/tag-input/14-callbacks.svelte?raw';
  import MethodsFocus from '../../demos/tag-input/15-methods-focus.svelte';
  import methodsFocusSrc from '../../demos/tag-input/15-methods-focus.svelte?raw';
  import RenderTag from '../../demos/tag-input/16-render-tag.svelte';
  import renderTagSrc from '../../demos/tag-input/16-render-tag.svelte?raw';
  import Draggable from '../../demos/tag-input/17-draggable.svelte';
  import draggableSrc from '../../demos/tag-input/17-draggable.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { TagInput } from '@chenzy-design/svelte';
```

### 基本演示

敲击回车键后，输入内容将成为标签。标签内容如果为空串或者纯空格时，则会被过滤。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 批量添加

可以使用 `separator` 设置分隔符，来实现批量输入，它的默认值为英文逗号。支持多个分隔符以 `string[]` 格式传入。

<DemoBox code={separatorSrc}><Separator /></DemoBox>

### 批量删除

可使用 `showClear` 设置是否支持一键删除所有标签和输入框内容。

<DemoBox code={showClearSrc}><ShowClear /></DemoBox>

### 禁用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 尺寸大小

通过 `size` 控制标签输入框的大小尺寸，可选：`small`、`default`、`large`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 不同校验状态样式

可以使用 `validateStatus` 设置不同校验状态的样式，它仅影响背景颜色等样式表现，可选值：`default`、`warning`、`error`。

<DemoBox code={validateStatusSrc}><ValidateStatus /></DemoBox>

### 前缀 / 后缀

可以通过 `prefix` 传入输入框前缀，通过 `suffix` 传入输入框后缀，可以为文本或者节点。当 prefix、suffix 传入的内容为 string 或者 Icon 时，会自动带上左右间隔；若为自定义节点，则左右间隔为 0。

<DemoBox code={prefixSuffixSrc}><PrefixSuffix /></DemoBox>

### 失焦后自动创建标签

可使用 `addOnBlur`，设置是否在 blur 事件触发时，将当前 input 的值自动创建成 tag。

<DemoBox code={addOnBlurSrc}><AddOnBlur /></DemoBox>

### 过滤重复标签

可使用 `allowDuplicates`，设置是否允许创建相同 tag，默认为 true。

<DemoBox code={noDuplicatesSrc}><NoDuplicates /></DemoBox>

### 输入限制

可使用 `max` 限制输入的标签数量，超出后将不允许再输入，并且触发 `onExceed()` 回调。可使用 `maxLength` 限制单个标签的最大长度，超出后将不允许再输入，并且触发 `onInputExceed()` 回调。

<DemoBox code={maxSrc}><Max /></DemoBox>

### 限制标签展示数量

利用 `maxTagCount` 可以限制展示的标签数量，超出部分将以 +N 的方式展示。使用 `showRestTagsPopover` 可以设置在超出 maxTagCount 后，hover +N 是否显示 Popover，并且可以在 `restTagsPopoverProps` 属性中配置 Popover。

<DemoBox code={maxTagCountSrc}><MaxTagCount /></DemoBox>

### 标签受控

可使用 `value` 设置标签内容，并配合 `onChange` 实现标签内容受控。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 输入受控

可使用 `inputValue` 设置输入框内容，并配合 `onInputChange` 实现输入内容受控。

<DemoBox code={inputControlledSrc}><InputControlled /></DemoBox>

### 回调

<DemoBox code={callbacksSrc}><Callbacks /></DemoBox>

### 焦点管理

可以使用 `blur()` 和 `focus()` 方法对焦点进行管理。

<DemoBox code={methodsFocusSrc}><MethodsFocus /></DemoBox>

### 自定义标签渲染

可以使用 `renderTagItem` 自定义标签渲染，第三个参数 `onClose` 用于关闭对应标签。

<DemoBox code={renderTagSrc}><RenderTag /></DemoBox>

### 拖拽排序

将 `draggable` 设为 true，开启拖拽排序功能。拖拽排序下不允许添加相同 Tag，因此需要将 `allowDuplicates` 设置为 false。拖拽功能开启后，点击 TagInput，Tag 可拖拽。点击 TagInput 外任意区域，Tag 不可拖拽。

<DemoBox code={draggableSrc}><Draggable /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| addOnBlur | 是否在 blur 事件触发时，将当前 input 的值自动创建成 tag | boolean | false |
| allowDuplicates | 是否允许添加相同 tag | boolean | true |
| autoFocus | 初始渲染时是否自动 focus | boolean | false |
| class | 样式类名 | string | - |
| defaultValue | 初始标签 | `string[]` | - |
| disabled | 是否禁用 | boolean | false |
| draggable | 设置是否可拖拽 | boolean | false |
| expandRestTagsOnClick | 在不可拖拽的情况下，TagInput 被点击后是否展开多余的 Tag | boolean | true |
| inputValue | 当前输入框内容，配合 onInputChange 实现受控 | string | - |
| max | 允许标签的最大数量 | number | - |
| maxLength | 单个标签的最大长度 | number | - |
| maxTagCount | 标签的最大展示数量，超出后将以 +N 形式展示 | number | - |
| placeholder | 占位默认值 | string | - |
| prefix | 前缀标签 | `string \| Snippet` | - |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | - |
| renderTagItem | 自定义标签渲染 | `Snippet<[{ value, index, onClose }]>` | - |
| restTagsPopoverProps | Popover 的配置属性 | object | `{}` |
| separator | 设置批量输入时的分隔符 | `string \| string[]` | , |
| showClear | 是否支持一键删除所有标签和输入内容 | boolean | false |
| showContentTooltip | 当标签长度过长发生截断时，hover 标签时是否通过 Tooltip 显示全部内容 | `boolean \| object` | true |
| showRestTagsPopover | 当超过 maxTagCount，hover +N 时，是否通过 Popover 显示剩余内容 | boolean | true |
| size | 设置输入框尺寸，可选：`small`、`large`、`default` | string | default |
| split | 自定义分隔符处理函数 | `(value: string, separator) => string[]` | - |
| style | 内联样式 | string | - |
| suffix | 后缀标签 | `string \| Snippet` | - |
| validateStatus | 设置校验状态样式，可选：`default`、`warning`、`error` | string | default |
| value | 当前标签，配合 onChange 实现受控 | `string[]` | - |
| onAdd | 添加标签时的回调 | `(addedValue: string[]) => void` | - |
| onBlur | 输入框失去焦点时的回调 | `(e) => void` | - |
| onChange | 标签变化时的回调 | `(value: string[]) => void` | - |
| onExceed | 超过 max 时的回调 | `(value: string[]) => void` | - |
| onFocus | 输入框获取焦点时的回调 | `(e) => void` | - |
| onInputChange | 输入框内容变化时的回调 | `(value: string) => void` | - |
| onInputExceed | 超过 maxLength 时的回调 | `(value: string) => void` | - |
| onKeyDown | keydown 回调 | `(e: KeyboardEvent) => void` | - |
| onRemove | 移除标签时的回调 | `(removedValue: string, idx: number) => void` | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| blur() | 移出焦点 |
| focus() | 获取焦点 |

## Accessibility

### ARIA

- TagInput 支持传入 `aria-label` 来表示该 TagInput 作用。
- TagInput 会依据 disabled 及 validateStatus props 来分别设置 `aria-disabled`、`aria-invalid`。
- TagInput 的输入框和清空按钮均具有 `aria-label` 来表明元素作用。
