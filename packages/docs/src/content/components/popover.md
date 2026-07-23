---
title: Popover 气泡卡片
name: popover
category: show
brief: 点击/鼠标移入元素，弹出气泡式的卡片浮层。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import ChildrenTypes from '../../demos/popover/01-children-types.svelte';
  import childrenTypesSrc from '../../demos/popover/01-children-types.svelte?raw';
  import Basic from '../../demos/popover/02-basic.svelte';
  import basicSrc from '../../demos/popover/02-basic.svelte?raw';
  import Position from '../../demos/popover/03-position.svelte';
  import positionSrc from '../../demos/popover/03-position.svelte?raw';
  import Controlled from '../../demos/popover/04-controlled.svelte';
  import controlledSrc from '../../demos/popover/04-controlled.svelte?raw';
  import Condition from '../../demos/popover/05-condition.svelte';
  import conditionSrc from '../../demos/popover/05-condition.svelte?raw';
  import Arrow from '../../demos/popover/06-arrow.svelte';
  import arrowSrc from '../../demos/popover/06-arrow.svelte?raw';
  import ArrowPointAtCenter from '../../demos/popover/07-arrow-point-at-center.svelte';
  import arrowPointAtCenterSrc from '../../demos/popover/07-arrow-point-at-center.svelte?raw';
  import CustomBg from '../../demos/popover/08-custom-bg.svelte';
  import customBgSrc from '../../demos/popover/08-custom-bg.svelte?raw';
  import InitialFocus from '../../demos/popover/09-initial-focus.svelte';
  import initialFocusSrc from '../../demos/popover/09-initial-focus.svelte?raw';
</script>

## 使用场景

Popover 气泡卡片是由用户自主打开的临时性浮层卡片，能够承载一些额外内容和交互行为而不影响原页面。

和 Tooltip 的区别是，它可以承载更复杂的内容，而不仅仅是提示文本。

## 代码演示

### 如何引入

```jsx
import { Popover } from '@chenzy-design/svelte';
```

### 注意事项

Popover 需要将 DOM 事件监听器应用到 children 中，如果子元素是自定义的组件，你需要确保它能将属性传递至底层的 DOM 元素。

同时为了计算弹出层的定位，需要获取到 children 的真实 DOM 元素，因此 Popover 支持如下类型的 children：

1. 真实 DOM 节点，如 span、div、p……
2. 渲染出真实 DOM 元素的自定义组件（Svelte 中无需 forwardRef——Popover 以包裹 span 承载事件与定位，children 只需渲染出真实 DOM）

<DemoBox code={childrenTypesSrc}><ChildrenTypes /></DemoBox>

### 基本使用

将浮层的触发器 Trigger 作为 `children`，使用 Popover 包裹（如下的例子中触发器为 Tag 元素）。浮层内容通过 `content` 传入
注意事项同 [Tooltip](/components/tooltip)

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 弹出位置

支持通过 `position` 设置浮层弹出方向，共支持十二个方向。

<DemoBox code={positionSrc}><Position /></DemoBox>

### 受控显示

设置 `trigger='custom'`，此场景下，Popover 的显示与否完全受到参数 `visible` 的控制。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### condition 条件触发

当 `condition={false}` 时，Popover 不响应 hover/click/focus 等触发行为（`trigger='custom'` 不受影响）。

<DemoBox code={conditionSrc}><Condition /></DemoBox>

### 显示小三角

通过设置 `showArrow`，Popover 同样也支持展示一个小三角。

> 这种模式下浮层会拥有一个默认的样式，你可以通过传递 style 参数来覆盖掉。

<DemoBox code={arrowSrc}><Arrow /></DemoBox>

### 指向元素中心

在**显示小三角**的条件（`showArrow=true`）下，可以传入 `arrowPointAtCenter=true` 使得小三角始终指向元素中心位置。

<DemoBox code={arrowPointAtCenterSrc}><ArrowPointAtCenter /></DemoBox>

### 设置浮层背景色

如果你需要定制浮层的背景色或边框颜色，请**务必同时声明 `style` 中的背景色/边框色与 `arrowStyle` 中的 `backgroundColor` 和 `borderColor` 属性**，这样能够使得“小三角”也能应用相同的背景色和边框颜色。

<DemoBox code={customBgSrc}><CustomBg /></DemoBox>

### 初始化弹出层焦点位置

Popover content 支持传入带参数的 Snippet，它的入参是一个对象，将 `initialFocusRef` 以 `use:` action 绑定在可聚焦 DOM 或包裹组件的元素上，打开面板时会自动聚焦在该位置。

<DemoBox code={initialFocusSrc}><InitialFocus /></DemoBox>

### 搭配 Tooltip 或 Popconfirm 使用

请参考 [Tooltip 搭配使用](/components/tooltip#搭配-popover-或-popconfirm-使用)

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterClose | 浮层完全关闭后的回调 | () => void | - |
| autoAdjustOverflow | 是否自动调整弹出层展开方向，用于边缘遮挡时自动调整展开方向 | boolean | true |
| arrowPointAtCenter | “小三角”是否指向元素中心，需要同时传入 "showArrow=true" | boolean | true |
| arrowStyle | “小三角”颜色定制（borderColor/backgroundColor/borderOpacity），需要同时传入 "showArrow=true" | `{ borderColor?: string; backgroundColor?: string; borderOpacity?: string \| number }` | - |
| class | 弹出层的样式类名 | string | - |
| clickToHide | 点击弹出层及内部任一元素时是否自动关闭弹层 | boolean | false |
| closeOnEsc | 在 trigger 或 弹出层按 Esc 键是否关闭面板，受控时不生效 | boolean | true |
| condition | 是否允许 Popover 触发显示。仅当显式设置为 false 时，hover/click/focus 等触发行为不生效（trigger='custom' 场景不受影响） | boolean | true |
| content | 显示的内容：文本或 Snippet，Snippet 可选接收 `{ initialFocusRef }` 入参 | `string`\|`Snippet<[{ initialFocusRef }]>` | - |
| defaultVisible | 非受控时初始是否展示弹出层 | boolean | false |
| disabled | 是否禁用触发 | boolean | false |
| disableFocusListener | trigger 为 `hover` 时，不响应键盘聚焦弹出浮层事件 | boolean | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative`。这会改变浮层 DOM 树位置，但不会改变视图渲染位置。缺省回退 ConfigProvider 全局配置，再回退 `document.body` | () => HTMLElement | () => document.body |
| guardFocus | 当焦点处于弹出层内时，切换 Tab 是否让焦点在弹出层内循环 | boolean | true（dialog 模式下） |
| keepDOM | 关闭时是否保留内部组件不销毁 | boolean | false |
| margin | 弹出层计算溢出时的增加的冗余值，作用同 Tooltip margin | number \| `{ marginLeft: number; marginTop: number; marginRight: number; marginBottom: number }` | 0 |
| motion | 是否展示弹出层动画 | boolean | true |
| mouseEnterDelay | 鼠标移入后，延迟显示的时间，单位毫秒（仅当 trigger 为 hover/focus 时生效） | number | 50 |
| mouseLeaveDelay | 鼠标移出后，延迟消失的时间，单位毫秒（仅当 trigger 为 hover/focus 时生效） | number | 50 |
| position | 方向，可选值：`top`,`topLeft`,`topRight`,`left`,`leftTop`,`leftBottom`,`right`,`rightTop`,`rightBottom`,`bottom`,`bottomLeft`,`bottomRight` | string | 'bottom' |
| rePosKey | 可以更新该项值手动触发弹出层的重新定位 | string \| number | - |
| returnFocusOnClose | 按下 Esc 键后，焦点是否回到 trigger 上，设置 trigger 为 hover, focus, click 时生效 | boolean | true |
| showArrow | 是否显示“小三角” | boolean | false |
| spacing | 弹出层与 children 元素的距离，单位 px | number \| `{ x: number; y: number }` | 4（showArrow=false 时）10（showArrow=true 时） |
| stopPropagation | 是否阻止弹出层上的点击事件冒泡 | boolean | false |
| style | 弹出层的内联样式 | string | - |
| title | 标题，提供时渲染标题区与分隔线（本库扩展） | string \| Snippet | - |
| trigger | 触发方式，可选值：`hover`, `focus`, `click`, `custom`, `contextMenu` | string | 'hover' |
| triggerStyle | 触发器外层包裹 span 元素的内联样式 | string | - |
| visible | 是否显示，配合 trigger='custom' 可实现完全受控 | boolean | - |
| wrapperClassName | 触发器外层包裹 span 元素的样式类名 | string | - |
| zIndex | 弹出层 z-index 值 | number | 1030 |
| onClickOutSide | 当弹出层处于展示状态，点击非 Children、非浮层内部区域时的回调（仅 trigger 为 custom、click 时有效） | (e: MouseEvent) => void | - |
| onEscKeyDown | 在 trigger 或 弹出层按 Esc 键时调用 | (e: KeyboardEvent) => void | - |
| onVisibleChange | 弹出层展示/隐藏时触发的回调 | (isVisible: boolean) => void | - |

## Accessibility

### ARIA

- 关于 role
  - 当 Popover 的 trigger 为 click、custom 时，Popover 的 content 具有 `dialog` role
  - 当 trigger 为 hover 时，Popover 的 content 具有 `tooltip` role
- Popover 的 content
  - content 的 wrapper 会被自动添加 `id` 属性
- Popover 的 children
  - 会被自动添加 [aria-expanded](https://www.w3.org/TR/wai-aria-1.1/#aria-expanded) 属性，当 Popover 可见时，属性值为 `true`，不可见时为 `false`
  - 会被自动添加 [aria-haspopup](https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup) 属性，为 `dialog`
  - 会被自动添加 [aria-controls](https://www.w3.org/TR/wai-aria-1.1/#aria-controls) 属性，为 content 的 wrapper 的 id

### 键盘和焦点

- Popover 触发方式设置为 hover 时：鼠标悬浮或聚焦时打开 Popover
- Popover 触发方式设置为 click 时：点击触发器或聚焦时并使用 Enter 键打开 Popover
- Popover 激活后，按下方向键 ⬇️ 将焦点移动到 Popover 上，此时焦点默认处于 Popover 中第一个可交互元素上，用户也可自定义焦点位置（若 Popover 内无可交互元素则表现为无响应）
- 焦点处于 Popover 内时使用 Tab 键，焦点会在 Popover 内循环，使用 Shift + Tab 会反方向移动焦点
- 键盘用户能够通过按 Esc 关闭 Popover，关闭后焦点返回到触发器上（仅当 trigger 为 click 时）

## FAQ

- **为什么 Popover 浮层卡片的位置和浮层的触发器的相对位置不符合预期?**
  Popover 底层依赖了 Tooltip，Tooltip 为了计算定位，需要获取到 children 的真实 DOM 元素，因此 Popover 目前支持如下类型的 children：

  1. 真实 DOM 节点，如 span、div、p……
  2. 渲染出真实 DOM 元素的自定义组件（Popover 以包裹 span 承载事件与定位，children 只需渲染出真实 DOM）

  若 children 渲染出的真实 DOM 节点宽高并非是你的 children 元素的全部，则位置可能有出入。例如设置了 prefix、suffix 的 Input，Popover 位置仍是相对于不包含前缀部分的 input 框进行定位，此时只要在 Input 外层再套一个 div 就能解决问题。
