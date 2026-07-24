---
title: Dropdown 下拉菜单
name: dropdown
category: navigation
brief: 向下弹出的菜单。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/dropdown/01-basic.svelte';
  import basicSrc from '../../demos/dropdown/01-basic.svelte?raw';
  import Nested from '../../demos/dropdown/02-nested.svelte';
  import nestedSrc from '../../demos/dropdown/02-nested.svelte?raw';
  import Position from '../../demos/dropdown/03-position.svelte';
  import positionSrc from '../../demos/dropdown/03-position.svelte?raw';
  import Trigger from '../../demos/dropdown/04-trigger.svelte';
  import triggerSrc from '../../demos/dropdown/04-trigger.svelte?raw';
  import Events from '../../demos/dropdown/05-events.svelte';
  import eventsSrc from '../../demos/dropdown/05-events.svelte?raw';
  import MenuJson from '../../demos/dropdown/06-menu-json.svelte';
  import menuJsonSrc from '../../demos/dropdown/06-menu-json.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Dropdown } from '@chenzy-design/svelte';
```

### 基本用法

- 在 Dropdown 的 children 中为它的 Trigger 触发器：默认为 hover 展示，可通过 `props.trigger` 修改为 `click`、`custom`、`contextMenu` 等值指定不同触发方式。
- 通过 `render` 指定下拉框的具体内容：使用 `Dropdown.Menu` 作为父容器，组合使用 `Dropdown.Item`、`Dropdown.Divider`、`Dropdown.Title`。当然简单场景你也可以仅搭配 `Dropdown.Menu` 与 `Dropdown.Item`，其他元素不是必须的。
- `Dropdown.Item` 通过设置 `disabled` 可以禁用某个选项，配置 `type` 可以展示不同颜色的文本，设置 `icon` 可以快速配置图标。更复杂的自定义结构，你可以通过 children 传入自定义渲染。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 嵌套使用

用户可以对 `Dropdown` 进行嵌套使用，此类情况适合具有多个子级选项的情况。

<DemoBox code={nestedSrc}><Nested /></DemoBox>

### 弹出位置

支持的位置同 Tooltip，常用的是："bottom"、"bottomLeft"、"bottomRight" 这三种。

> 本库统一采用 12 方位 `Placement` 命名，语义与 Semi 一一对应：`bottomStart≈bottomLeft`、`bottomEnd≈bottomRight`、`rightStart≈rightTop` 等。

<DemoBox code={positionSrc}><Position /></DemoBox>

### 触发方式

默认是移入触发，可通过获取焦点（focus）、点击（click）或自定义事件触发菜单展开。

<DemoBox code={triggerSrc}><Trigger /></DemoBox>

### 触发事件

点击菜单项后可触发不同鼠标事件，支持 `onClick`、`onMouseEnter`、`onMouseLeave` 和 `onContextMenu`。

<DemoBox code={eventsSrc}><Events /></DemoBox>

### Json 用法

可以通过 `menu` 属性，传入 JSON Array 快速配置出下拉框菜单。

<DemoBox code={menuJsonSrc}><MenuJson /></DemoBox>

## API 参考

### Dropdown

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoAdjustOverflow | 弹出层被遮挡时是否自动调整方向 | boolean | true |
| closeOnEsc | 在 trigger 或弹出层按 Esc 键是否关闭面板，受控时不生效 | boolean | true |
| class | 下拉弹层外层样式类名 | string | - |
| children | 触发弹出层的 Trigger 元素 | Snippet | - |
| clickToHide | 在弹出层内点击时是否自动关闭弹出层 | boolean | - |
| contentClassName | 下拉菜单根元素类名 | string | - |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中 | `() => HTMLElement` | `() => document.body` |
| keepDOM | 关闭时是否保留内部组件 DOM 不销毁 | boolean | false |
| margin | 弹出层计算溢出时增加的冗余值，作用同 Tooltip margin | number \| object | - |
| mouseEnterDelay | 鼠标移入 Trigger 后延迟显示的时间（ms，仅 hover/focus 生效） | number | 50 |
| mouseLeaveDelay | 鼠标移出弹出层后延迟消失的时间（ms，仅 hover/focus 生效） | number | 50 |
| menu | 通过传入 JSON Array 来快速配置 Dropdown 内容 | `Array<DropdownMenuItem>` | [] |
| position | 弹出菜单的位置，常用："bottom"、"bottomLeft"、"bottomRight"（本库用 Placement 命名） | Placement | `bottom` |
| render | 弹出层的内容，由 `Dropdown.Menu` 及 `Dropdown.Item`、`Dropdown.Title` 构成 | Snippet | - |
| rePosKey | 更新该值可手动触发弹出层的重新定位 | string \| number | - |
| spacing | 弹出层与 Trigger 元素的距离（px） | number | 4 |
| style | 弹出层内联样式 | string | - |
| showTick | 是否自动在 active 的 Dropdown.Item 项左侧展示表示选中的勾 | boolean | false |
| stopPropagation | 是否阻止弹出层上的点击事件冒泡 | boolean | false |
| trigger | 触发下拉的行为，可选 "hover"、"focus"、"click"、"custom"、"contextMenu" | string | "hover" |
| visible | 是否显示菜单，需配合 trigger custom 使用 | boolean | - |
| zIndex | 弹出层 z-index 值 | number | 1050 |
| onClickOutSide | 弹出层展示时，点击非 Children、非弹出层内部区域的回调（仅 custom、click 有效） | `(e: Event) => void` | - |
| onEscKeyDown | 在 trigger 或弹出层按 Esc 键时调用 | `(e: Event) => void` | - |
| onVisibleChange | 弹出层显示状态改变时的回调 | `(visible: boolean) => void` | - |

### Dropdown.Menu

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 下拉弹层菜单样式类名 | string | - |
| children | 下拉弹层菜单包裹的子元素，一般为 `Dropdown.Item` 或 `Dropdown.Title` | Snippet | - |
| style | 下拉弹层菜单样式 | string | - |

### Dropdown.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| active | 当前项是否处于激活态（左侧显示 √，字体加粗色深；需 Dropdown 的 showTick 为 true） | boolean | false |
| class | 样式类名 | string | - |
| disabled | 是否禁用菜单 | boolean | false |
| icon | 图标 | Snippet | - |
| style | 内联样式 | string | - |
| type | 类型，可选："primary"、"secondary"、"tertiary"、"warning"、"danger" | string | "tertiary" |
| onClick | 单击触发的回调事件 | function | - |
| onMouseEnter | MouseEnter 触发的回调事件 | function | - |
| onMouseLeave | MouseLeave 触发的回调事件 | function | - |
| onContextMenu | 点击鼠标右键触发的回调事件 | function | - |

### Dropdown.Title

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 样式类名 | string | - |
| style | 内联样式 | string | - |

### DropdownMenuItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| node | 节点类型，可选：`title`、`item`、`divider` | string | - |
| name | 菜单文本，标题或 Item 的内容 | string | - |

其他属性与 Title、Item、Divider 属性对应。

## 无障碍

### ARIA

- Dropdown.Menu `role` 设置为 `menu`，`aria-orientation` 设置为 `vertical`。
- Dropdown.Item `role` 设置为 `menuitem`。

### 键盘和焦点

- Dropdown 的触发器可被聚焦，目前支持 3 种触发方式：
  - 触发方式设置为 hover 或 focus 时：鼠标悬浮或聚焦时打开 Dropdown，打开后用户可以使用 `下箭头` 将焦点移动到 Dropdown 内。
  - 触发方式设置为 click 时：点击触发器或聚焦时使用 `Enter` 或 `Space` 键可以打开 Dropdown，此时焦点自动聚焦到第一个非禁用项上。
- 当焦点位于菜单项上时：使用 `上箭头` / `下箭头` 切换可交互元素；使用 `Enter` / `Space` 激活聚焦的菜单项。
- 键盘用户可以通过按 `Esc` 关闭 Dropdown，关闭后焦点返回到触发器上。

## 文案规范

- 下拉框内选项内容需要表述准确且包含信息，使用户在浏览时更容易在选项中选择。
- 使用语句式的大小写，并且简洁明了地书写选项。
- 如果是动作选项，使用动词或动词短语来描述用户选择该选项后会发生的动作（如 "Move"、"Log time"、"Hide labels"）。
- 不使用介词。
