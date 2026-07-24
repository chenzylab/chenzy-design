---
title: AutoComplete 自动完成
name: autocomplete
category: input
brief: 输入框自动填充。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/autocomplete/01-basic.svelte';
  import basicSrc from '../../demos/autocomplete/01-basic.svelte?raw';
  import Render from '../../demos/autocomplete/02-render.svelte';
  import renderSrc from '../../demos/autocomplete/02-render.svelte?raw';
  import Remote from '../../demos/autocomplete/03-remote.svelte';
  import remoteSrc from '../../demos/autocomplete/03-remote.svelte?raw';
  import Size from '../../demos/autocomplete/04-size.svelte';
  import sizeSrc from '../../demos/autocomplete/04-size.svelte?raw';
  import Position from '../../demos/autocomplete/05-position.svelte';
  import positionSrc from '../../demos/autocomplete/05-position.svelte?raw';
  import Disabled from '../../demos/autocomplete/06-disabled.svelte';
  import disabledSrc from '../../demos/autocomplete/06-disabled.svelte?raw';
  import Status from '../../demos/autocomplete/07-status.svelte';
  import statusSrc from '../../demos/autocomplete/07-status.svelte?raw';
  import EmptyDemo from '../../demos/autocomplete/08-empty.svelte';
  import emptySrc from '../../demos/autocomplete/08-empty.svelte?raw';
</script>

## 使用场景

用于对输入框提供输入建议，进行自动补全的操作。

与可搜索的 Select 组件的区别：

- AutoComplete 本质上是一个增强型的提供了输入建议的 Input 组件，而 Select 是一个选择器。
- 点击展开时，Select 会将输入框的值全部清空，而 AutoComplete 会保留上次选中的值。
- Select 的已选项渲染（renderSelectedItem）可定制化程度更高，可以为任意类型的节点，而 AutoComplete 只允许为字符串。

## 代码演示

### 如何引入

```jsx
import { AutoComplete } from '@chenzy-design/svelte';
```

### 基本用法

通过 `onSearch` 监听用户输入，将输入建议通过更新 `data` 传入。通过 `onChange` 保持受控，当输入框变化 / 选中输入项时会触发 `onChange`。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义候选项渲染

需要自定义候选项渲染时，`data` 可以传入一个对象数组（每个 Object 必须含有 label、value 两个 key，value 为候选项选中的值，label 为候选项展示的内容）。通过 `renderItem` 可以自定义候选项的渲染。

<DemoBox code={renderSrc}><Render /></DemoBox>

### 远程搜索

从 `onSearch` 中获取用户输入值，动态更新 `data` 值。

<DemoBox code={remoteSrc}><Remote /></DemoBox>

### 尺寸

通过设置 `size` 可设置输入框尺寸，可选 `small`、`default`（默认）、`large`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 下拉菜单的位置

通过设置 `position` 可设置下拉菜单位置，可选值参考 Tooltip position。

<DemoBox code={positionSrc}><Position /></DemoBox>

### 禁用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 校验状态

可设置不同校验状态，展示不同样式。

<DemoBox code={statusSrc}><Status /></DemoBox>

### 自定义空内容

可设置自定义展示空内容。

<DemoBox code={emptySrc}><EmptyDemo /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoFocus | 是否自动聚焦 | boolean | false |
| autoAdjustOverflow | 浮层被遮挡时是否自动调整方向 | boolean | true |
| class | 样式类名 | string | - |
| clearIcon | 可用于自定义清除按钮，showClear 为 true 时有效 | Snippet | - |
| data | 候选项的数据源，可以为字符串数组或对象数组 | `array` | `[]` |
| defaultActiveFirstOption | 是否默认高亮第一个选项（按回车可直接选中） | boolean | false |
| defaultOpen | 是否默认展开下拉菜单 | boolean | false |
| defaultValue | 默认值 | `string \| number` | - |
| disabled | 是否禁用 | boolean | false |
| dropdownClassName | 下拉列表的 CSS 类名 | string | - |
| dropdownStyle | 下拉列表的内联样式 | `string \| Record<string, string>` | - |
| emptyContent | data 为空时自定义下拉内容 | `string \| Snippet` | - |
| getPopupContainer | 指定下拉列表浮层的父级容器，自定义该项时需给容器设置 `position: relative` | `() => HTMLElement` | `() => document.body` |
| loading | 下拉列表是否展示加载动画 | boolean | false |
| maxHeight | 下拉列表的最大高度 | `number \| string` | 300 |
| onSelectWithObject | 点击候选项时，是否将选中项 option 的其他属性也作为回调入参，设为 true 时 onSelect 的入参类型会从 string 变为 object | boolean | false |
| placeholder | 输入框默认提示文案 | string | - |
| position | 下拉菜单的显示位置，可选值同 Tooltip 组件，可选 `bottomLeft` / `bottomRight` / `topLeft` / `topRight` | string | bottomLeft |
| prefix | 选择框的前缀标签 | `string \| Snippet` | - |
| renderItem | 控制下拉列表候选项的渲染 | `Snippet<[{ item, isSelected }]>` | - |
| renderSelectedItem | 自定义候选项选中后在选择框中的渲染内容（仅支持返回 string） | `Snippet<[{ item }]>` | - |
| showClear | 是否展示清除按钮 | boolean | false |
| size | 尺寸，可选 `small`、`default`、`large` | string | default |
| style | 样式 | string | - |
| suffix | 选择框的后缀标签 | `string \| Snippet` | - |
| validateStatus | 校验状态，可选 `default`、`error`、`warning`，仅影响展示样式 | string | default |
| value | 当前值 | `string \| number` | - |
| zIndex | 下拉菜单的 zIndex | number | - |
| onBlur | 失去焦点时的回调 | `(e: FocusEvent) => void` | - |
| onChange | 输入框变化 / 候选项选中时变化 | `(value: string \| number) => void` | - |
| onFocus | 获得焦点时的回调 | `(e: FocusEvent) => void` | - |
| onKeyDown | keydown 回调 | `(e: KeyboardEvent) => void` | - |
| onSearch | 输入变化时的回调 | `(value: string) => void` | - |
| onSelect | 下拉菜单候选项被选中时的回调 | `(item) => void` | - |

## Accessibility

### 键盘和焦点

- AutoComplete 的 input 框可被聚焦，聚焦后，键盘用户可以通过 `上箭头` 或 `下箭头` 打开选项面板（如有）。
- AutoComplete 也支持通过 `Enter` 键打开和收起面板。
- 若用户将 `defaultActiveFirstOption` 属性设置为 true 时，选项面板打开后默认高亮第一个选项。
- 若下拉菜单打开时：使用 `Esc` 可以关闭菜单；使用 `上箭头` 或 `下箭头` 可以切换选项；被聚焦的选项可以通过 `Enter` 键选中，并收起面板。
