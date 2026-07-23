---
title: Tooltip 工具提示
name: tooltip
category: show
brief: 工具提示用于对一个元素进行标识或者附上少量辅助信息，最典型的场景是向用户解释图标的含义、展示被截断的文本、显示图片的描述等。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import ChildrenTypes from '../../demos/tooltip/01-children-types.svelte';
  import childrenTypesSrc from '../../demos/tooltip/01-children-types.svelte?raw';
  import Placement from '../../demos/tooltip/02-placement.svelte';
  import placementSrc from '../../demos/tooltip/02-placement.svelte?raw';
  import ArrowPointAtCenter from '../../demos/tooltip/03-arrow-point-at-center.svelte';
  import arrowPointAtCenterSrc from '../../demos/tooltip/03-arrow-point-at-center.svelte?raw';
  import Trigger from '../../demos/tooltip/04-trigger.svelte';
  import triggerSrc from '../../demos/tooltip/04-trigger.svelte?raw';
  import Condition from '../../demos/tooltip/05-condition.svelte';
  import conditionSrc from '../../demos/tooltip/05-condition.svelte?raw';
  import CustomStyle from '../../demos/tooltip/06-custom-style.svelte';
  import customStyleSrc from '../../demos/tooltip/06-custom-style.svelte?raw';
  import GetPopupContainer from '../../demos/tooltip/07-get-popup-container.svelte';
  import getPopupContainerSrc from '../../demos/tooltip/07-get-popup-container.svelte?raw';
  import WithPopconfirm from '../../demos/tooltip/08-with-popconfirm.svelte';
  import withPopconfirmSrc from '../../demos/tooltip/08-with-popconfirm.svelte?raw';
  import Ellipsis from '../../demos/tooltip/09-ellipsis.svelte';
  import ellipsisSrc from '../../demos/tooltip/09-ellipsis.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Tooltip } from '@chenzy-design/svelte';
```

### 注意事项

Tooltip 需要将 DOM 事件监听器应用到 children 中，如果子元素是自定义的组件，你需要确保它能将属性传递至底层的 DOM 元素。

同时为了计算弹出层的定位，需要获取到 children 的真实 DOM 元素，因此 Tooltip 支持如下类型的 children：

1. 真实 DOM 节点，如 span、div、p……
2. 渲染出真实 DOM 元素的自定义组件（Svelte 中无需 forwardRef——Tooltip 以包裹 span 承载事件与定位，children 只需渲染出真实 DOM）

<DemoBox code={childrenTypesSrc}><ChildrenTypes /></DemoBox>

### 位置

可以通过 position 配置弹出层方向以及对齐位置，position 详细可选值请参考下方 API 文档
配置为 `top` 时 向上弹出
配置为 `topLeft` 时，向上弹出，且弹出层与 children 左对齐（当arrowPointAtCenter=false时）
配置为 `topRight` 时，向上弹出，且弹出层与 children 右对齐（当arrowPointAtCenter=false时）
其他方向同理

<DemoBox code={placementSrc}><Placement /></DemoBox>

### 指向元素中心

默认情况下 `arrowPointAtCenter=true`，小三角始终指向 children 元素中心位置。
你可以将其设置为 false，此时小三角将不再保持指向元素中心。弹出层与 children 边缘对齐

<DemoBox code={arrowPointAtCenterSrc}><ArrowPointAtCenter /></DemoBox>

### 触发时机

- 配置触发展示的时机，默认为 `hover`，可选 `hover`/`focus`/`click`/`custom`/`contextMenu`
- 设为 `custom` 时，需要配合 `visible` 属性使用，此时显示与否完全受控

<DemoBox code={triggerSrc}><Trigger /></DemoBox>

### condition 条件触发

当 `condition={false}` 时，Tooltip 不响应 hover/click/focus 等触发行为（`trigger='custom'` 不受影响）。

<DemoBox code={conditionSrc}><Condition /></DemoBox>

### 覆盖特定样式

你可以通过 class、style 为弹出层配置特定样式，例如覆盖默认的 maxWidth（240px）

<DemoBox code={customStyleSrc}><CustomStyle /></DemoBox>

### 渲染至指定 DOM

传入 `getPopupContainer`，弹层将会渲染至该函数返回的 DOM 中。这会改变浮层 DOM 树位置，但不会改变视图渲染位置。

**需要注意的是：** 返回的容器如果不是 `document.body`，**`position` 需要设为 `"relative"`**

<DemoBox code={getPopupContainerSrc}><GetPopupContainer /></DemoBox>

### 搭配 Popover 或 Popconfirm 使用

Tooltip、Popconfirm、Popover 都需要劫持 children 的相关事件（pointerenter/pointerleave/click……），用于配置 trigger。
如果直接嵌套使用的话，会使外层 trigger 失效。
需要在中间加一层元素（div 或 span）以防止 trigger 的事件劫持失效。

<DemoBox code={withPopconfirmSrc}><WithPopconfirm /></DemoBox>

### 仅当内容宽度超出时展示 Tooltip

本库为这种场景提供了 Typography 组件，可以更简单快捷地满足需求。不需要自己再对 Tooltip 的出现做条件判断，详细的使用请参考 [Typography 组件文档](/components/typography)

<DemoBox code={ellipsisSrc}><Ellipsis /></DemoBox>

## API 参考

---

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterClose | 浮层完全关闭后的回调 | () => void | - |
| autoAdjustOverflow | 弹出层被遮挡时是否自动调整方向 | boolean | true |
| arrowPointAtCenter | “小三角”是否指向元素中心，需要同时传入"showArrow=true" | boolean | true |
| class | 弹出层的样式类名 | string | - |
| clickToHide | 点击弹出层及内部任一元素时是否自动关闭弹层 | boolean | false |
| closeOnEsc | 按 Esc 键是否关闭浮层（WCAG 1.4.13 可关闭要求） | boolean | true |
| condition | 是否允许 Tooltip 触发显示。仅当显式设置为 false 时，hover/click/focus 等触发行为不生效（trigger='custom' 场景不受影响） | boolean | true |
| content | 弹出层内容 | string \| Snippet | - |
| defaultVisible | 非受控时初始是否展示弹出层 | boolean | false |
| disabled | 是否禁用触发 | boolean | false |
| disableFocusListener | trigger为`hover`时，不响应键盘聚焦弹出浮层事件 | boolean | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative`。这会改变浮层 DOM 树位置，但不会改变视图渲染位置。缺省回退 ConfigProvider 全局配置，再回退 `document.body` | () => HTMLElement | () => document.body |
| keepDOM | 关闭时是否保留内部组件不销毁 | boolean | false |
| margin | 计算溢出时的增加的冗余值 | number \| `{ marginLeft: number; marginTop: number; marginRight: number; marginBottom: number }` | 0 |
| mouseEnterDelay | 鼠标移入后，延迟显示的时间，单位毫秒（仅当 trigger 为 hover/focus 时生效） | number | 50 |
| mouseLeaveDelay | 鼠标移出后，延迟消失的时间，单位毫秒（仅当 trigger 为 hover/focus 时生效），不小于 mouseEnterDelay | number | 50 |
| motion | 是否展示弹出层动画 | boolean | true |
| position | 弹出层展示位置，可选值：`top`, `topLeft`, `topRight`, `left`, `leftTop`, `leftBottom`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight` | string | 'top' |
| prefixCls | 弹出层 wrapper div 的 `class` 前缀，设置该项时，弹出层将不再带 Tooltip 的样式 | string | 'cd-tooltip' |
| preventScroll | 弹出层展示时是否阻止页面滚动 | boolean | false |
| rePosKey | 可以更新该项值手动触发弹出层的重新定位 | string \| number | - |
| style | 弹出层的内联样式 | string | - |
| spacing | 弹出层与 `children` 元素的距离，单位 px | number \| `{ x: number; y: number }` | 8 |
| showArrow | 是否显示箭头三角形，也可传入 Snippet 自定义箭头 | boolean \| Snippet | true |
| stopPropagation | 是否阻止弹层上的点击事件冒泡 | boolean | false |
| transformFromCenter | 是否从包裹的元素水平或垂直中心处变换，该参数仅影响动效变换的 `transform-origin`，一般无需改动 | boolean | true |
| trigger | 触发展示的时机，可选值：`hover` / `focus` / `click` / `custom` / `contextMenu` | string \| string[] | 'hover' |
| visible | 是否展示弹出层, 需配合 trigger='custom' 使用 | boolean | - |
| wrapperClassName | 触发器外层包裹 span 元素的样式类名 | string | - |
| wrapperId | 弹出层 wrapper 节点的 id，trigger 的 aria 属性指向此 id，若不设置组件会随机生成一个 id | string | - |
| zIndex | 弹层层级 | number | 1060 |
| onVisibleChange | 弹出层展示/隐藏时触发的回调 | (isVisible: boolean) => void | - |
| onClickOutSide | 当弹出层处于展示状态，点击非Children、非浮层内部区域时的回调（仅trigger为custom、click时有效） | (e: MouseEvent) => void | - |

## Accessibility

### ARIA

- Tooltip 具有 `tooltip` role，遵循 [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices/#tooltip) 规范中对于 Tooltip 的定义
- Tooltip 的 content 与 children
  - 关于 content
    - content 的 wrapper 会被自动添加 id 属性，用于与 children 的 `aria-describedby` 匹配，关联 content 与 children
  - 关于 children
    - Tooltip 的内容（content）与其触发器（children）之间应当具有显式联系。Tooltip 会自动为 children 元素添加 `aria-describedby` 属性，值为 content wrapper 的 id
    - 若你 Tooltip 的 children 是 Icon，不包含可见文本，我们推荐你在 children 上添加 `aria-label` 属性进行相应描述

```svelte
<!-- Good practices, add aria-label to description tooltip children -->
<Tooltip content="Edit your setting">
  <IconSetting aria-label="Settings" />
</Tooltip>
```

### 键盘和焦点

- Tab 键聚焦触发元素时显示 Tooltip，失去焦点时隐藏（`disableFocusListener` 可关闭该行为）
- Esc 键关闭 Tooltip，符合 WCAG 1.4.13 的「可关闭（Dismissible）」要求；鼠标悬停至 Tooltip 内容区仍保持显示，满足「可悬停（Hoverable）」要求
- Tooltip 为纯信息展示，不创建焦点陷阱

## 文案规范

- 只展示信息说明和引导，不展示报错信息
- 不在 tooltip 里只能是额外的链接和按钮
- 尽量精简至一句话进行说明，不展示标点符号

## FAQ

- **为什么 Tooltip content 配置很长很长的内容时，某些情况下内容会超出显示区域?**
  Tooltip 内部通过设置 <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap" target="_blank" rel="noopener noreferrer">word-wrap</a> 为 break-word 处理文本换行。如果默认设置不符合预期，使用方可以通过 style/class API 设置换行相关 CSS 属性进行调整。
