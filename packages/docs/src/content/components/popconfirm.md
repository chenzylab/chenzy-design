---
title: Popconfirm 气泡确认框
name: popconfirm
category: feedback
brief: 目标元素的操作需要用户进一步的确认时使用。与 Popover 相比它内置了一系列可配置的操作按钮，与 Modal 相比它不强制全屏居中显示，交互也更轻量。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/popconfirm/01-basic.svelte';
  import basicSrc from '../../demos/popconfirm/01-basic.svelte?raw';
  import Types from '../../demos/popconfirm/02-types.svelte';
  import typesSrc from '../../demos/popconfirm/02-types.svelte?raw';
  import Async from '../../demos/popconfirm/03-async.svelte';
  import asyncSrc from '../../demos/popconfirm/03-async.svelte?raw';
  import Focus from '../../demos/popconfirm/04-focus.svelte';
  import focusSrc from '../../demos/popconfirm/04-focus.svelte?raw';
  import CloseIcon from '../../demos/popconfirm/05-close-icon.svelte';
  import closeIconSrc from '../../demos/popconfirm/05-close-icon.svelte?raw';
  import Arrow from '../../demos/popconfirm/06-arrow.svelte';
  import arrowSrc from '../../demos/popconfirm/06-arrow.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Popconfirm } from '@chenzy-design/svelte';
```

### 基本使用

Popconfirm 底层基于 Popover 封装，children 支持类型同 Popover。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 类型搭配

开发者可以基于场景使用 `okType`/`cancelType`/`icon` 等参数搭配出不同风格的气泡式确认框。

<DemoBox code={typesSrc}><Types /></DemoBox>

### 延时关闭

onConfirm、onCancel 可以通过 return Promise 实现点击后延时关闭。
onConfirm、onCancel 被触发时，对应的 Button 会自动切换为 loading: true，promise resolve 会关闭气泡确认框，promise reject 时气泡依然保留，同时 button loading 自动切换为 false。

<DemoBox code={asyncSrc}><Async /></DemoBox>

### 初始化弹出层焦点位置

okButtonProps 和 cancelButtonProps 支持传入 `autoFocus` 参数，传入后打开面板时会自动聚焦在该位置。

content 支持传入函数，它的入参是一个对象，将 `initialFocusRef` 绑定在可聚焦 DOM 或组件上，打开面板时会自动聚焦在该位置。

<DemoBox code={focusSrc}><Focus /></DemoBox>

### 关闭按钮

`showCloseIcon` 默认为 `true`，在气泡确认框右上角展示关闭按钮，设为 `false` 可隐藏。

<DemoBox code={closeIconSrc}><CloseIcon /></DemoBox>

### 箭头

`showArrow` 显示指向触发元素的小三角，`arrowPointAtCenter` 令三角指向元素中心（需同时设 `showArrow`）。

<DemoBox code={arrowSrc}><Arrow /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| arrowPointAtCenter | “小三角”是否指向元素中心，需要同时传入 `showArrow=true` | boolean | false |
| cancelText | 取消按钮文字 | string | `取消` |
| cancelButtonProps | 取消按钮的 props | ExtraButtonProps | - |
| cancelType | 取消按钮类型 | ButtonType | `tertiary` |
| closeOnEsc | 在 trigger 聚焦时或在弹出层内聚焦元素上按 Esc 键是否关闭面板，受控时不生效 | boolean | true |
| content | 显示的内容（函数 Snippet 入参含 `initialFocusRef`） | `string`\|`Snippet<[{ initialFocusRef }]>` | - |
| defaultVisible | 气泡框默认是否展示 | boolean | false |
| disabled | 点击 Popconfirm 子元素是否弹出气泡确认框，false 不弹出 | boolean | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义时容器需要设置 `position: relative` | () => HTMLElement | - |
| guardFocus | 当焦点处于弹出层内时，切换 Tab 是否让焦点在弹出层内循环 | boolean | true |
| icon | 自定义弹出气泡 Icon 图标，`false` 隐藏 | Snippet \| false | `<IconAlertTriangle size="extra-large" />` |
| motion | 下拉列表出现/隐藏时，是否有动画 | boolean | true |
| okText | 确认按钮文字 | string | `确认` |
| okType | 确认按钮类型 | ButtonType | `primary` |
| okButtonProps | 确认按钮的 props | ExtraButtonProps | - |
| position | 方向，可选值：`top`、`topLeft`、`topRight`、`left`、`leftTop`、`leftBottom`、`right`、`rightTop`、`rightBottom`、`bottom`、`bottomLeft`、`bottomRight` | string | `bottomLeft` |
| returnFocusOnClose | 按下 Esc 键后，焦点是否回到 trigger 上，只有设置 trigger 为 click 时生效 | boolean | true |
| showArrow | 是否显示箭头三角形 | boolean | false |
| showCloseIcon | 是否显示右上角关闭按钮 | boolean | true |
| stopPropagation | 是否阻止弹层上的点击事件冒泡 | boolean | true |
| title | 显示的标题 | string \| Snippet | - |
| trigger | 触发展示的时机，可选值：`hover` / `focus` / `click` / `custom` | string | `click` |
| visible | 气泡框是否展示的受控属性 | boolean | - |
| zIndex | 浮层 z-index 值 | number | 1030 |
| onConfirm | 点击确认按钮回调；返回 Promise 时按钮 loading，resolve 关闭 / reject 保持 | `(e: MouseEvent) => void`\|`Promise<unknown>` | - |
| onCancel | 点击取消按钮回调；返回 Promise 时按钮 loading，resolve 关闭 / reject 保持 | `(e: MouseEvent) => void`\|`Promise<unknown>` | - |
| onClickOutSide | 当弹出层处于展示状态，点击非 children、非浮层内部区域时的回调 | (e: MouseEvent) => void | - |
| onEscKeyDown | 在 trigger 或弹出层按 Esc 键时调用 | (e: KeyboardEvent) => void | - |
| onVisibleChange | 气泡框切换显示隐藏的回调 | (visible: boolean) => void | - |

## Accessibility

### ARIA

语义化请参考 [Popover](/components/popover#Accessibility)。

### 键盘和焦点

- Popconfirm 必须带有触发器，触发器可被聚焦，使用 Enter 键打开 Popconfirm。
- Popconfirm 激活后，初始焦点应当遵循以下几个原则：
    - 如果 Popconfirm 内包含一个不可逆转过程的最后一个步骤，比如：删除数据等，那么这个初始焦点最好放在破坏性最小的可交互元素上，如：取消按钮（通过向对象 cancelButtonProps 中传入 autoFocus 实现）。
    - 如果 Popconfirm 内仅为阅读文本，那么建议将初始焦点设置在最可能常用的交互元素上，如：确定按钮（通过向对象 okButtonProps 中传入 autoFocus 实现）。
- 键盘用户能够通过按 Esc 关闭 Popconfirm，并且焦点应该返回到触发器上（仅当 trigger 为 click 时）。
