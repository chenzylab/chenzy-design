---
title: DragMove 拖拽移动
name: dragmove
category: plus
brief: 可通过拖拽改变位置
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/drag-move/01-basic.svelte';
  import basicSrc from '../../demos/drag-move/01-basic.svelte?raw';
  import Constrainer from '../../demos/drag-move/02-constrainer.svelte';
  import constrainerSrc from '../../demos/drag-move/02-constrainer.svelte?raw';
  import Handler from '../../demos/drag-move/03-handler.svelte';
  import handlerSrc from '../../demos/drag-move/03-handler.svelte?raw';
  import CustomMove from '../../demos/drag-move/04-custom-move.svelte';
  import customMoveSrc from '../../demos/drag-move/04-custom-move.svelte?raw';
</script>

## 使用场景

用于设置元素可被拖动改变位置，支持限制拖拽范围，支持自定义触发拖动的元素。

## 代码演示

### 如何引入

```jsx
import { DragMove } from '@chenzy-design/svelte';
```

### 基本用法

被 `DragMove` 包裹的元素将能够通过拖拽改变位置。

<Notice type="primary" title="注意事项">

1. DragMove 会将可拖拽的元素设置为 absolute 定位
2. DragMove 需要把 DOM 事件监听器应用到子元素上。Svelte 的 snippet 无法像 React 那样被 `cloneElement` 注入 ref，因此本库渲染一层包裹元素来承载事件与定位，子元素本身无需做任何透传处理——这与 Semi 要求 children 必须能透传 props/ref 的约束不同。
3. **由此带来一条使用约定**：被强制 `absolute` 的是那层包裹元素（等价于 Semi 里的「可拖拽元素」本身），所以**初始 `top` / `left` 要写在 `<DragMove style="...">` 上，子元素保持默认静态定位**。若给子元素也加 `position: absolute`，它会脱离包裹层、使包裹层塌成 `0×0`，进而撑不起父容器、内容溢出。同理，`customMove` 回调收到的 `element` 也是这层包裹元素。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 限制拖动范围

传入 `constrainer`，该函数返回限制可拖拽范围的元素；也可直接传字符串 `'parent'` 表示约束在父元素内。

<Notice type="primary" title="注意">

constrainer 设置的元素需要为 relative 定位。

</Notice>

<DemoBox code={constrainerSrc}><Constrainer /></DemoBox>

### 自定义触发拖动的元素

可通过 `handler` 自定义触发拖动的元素。如果不设置，则点击任意位置均可拖动；如果设置，则仅点击 handler 部分可拖动。

<DemoBox code={handlerSrc}><Handler /></DemoBox>

### 自定义拖动后的位置处理

可通过 `customMove` 自定义拖动后的位置处理，该参数设置后，DragMove 组件内部将仅通过参数返回计算后的位置，不做设置，用户按需自行设置新位置。

<DemoBox code={customMoveSrc}><CustomMove /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allowInputDrag | 点击原生 input/textarea 时是否允许拖动 | boolean | false |
| allowMove | 点击/触摸时是否允许拖动的判断函数 | `(event: MouseEvent \| TouchEvent, element: HTMLElement) => boolean` | - |
| constrainer | 返回限制可拖拽的范围的元素 | `() => HTMLElement \| 'parent'` | - |
| customMove | 自定义拖动后的位置处理 | `(element: HTMLElement, top: number, left: number) => void` | - |
| handler | 返回触发拖动的元素 | `() => HTMLElement` | - |
| onMouseDown | 鼠标按下时的回调 | `(e: MouseEvent) => void` | - |
| onMouseMove | 鼠标移动时的回调 | `(e: MouseEvent) => void` | - |
| onMouseUp | 鼠标抬起时的回调 | `(e: MouseEvent) => void` | - |
| onTouchCancel | 触摸取消时的回调 | `(e: TouchEvent) => void` | - |
| onTouchEnd | 触摸结束时的回调 | `(e: TouchEvent) => void` | - |
| onTouchMove | 触摸移动时的回调 | `(e: TouchEvent) => void` | - |
| onTouchStart | 触摸开始时的回调 | `(e: TouchEvent) => void` | - |
| class | 包裹元素类名（Svelte 框架必要补充，Semi 靠 cloneElement 无需此 prop） | string | - |
| style | 包裹元素内联样式（Svelte 框架必要补充，用于设置初始 top/left） | string | - |
