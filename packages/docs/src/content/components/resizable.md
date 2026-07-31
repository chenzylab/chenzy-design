---
title: Resizable 可伸缩
name: resizable
category: basic
brief: 通过拖拽改变元素尺寸，支持单体伸缩与分栏组合两种形态。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import SingleEdge from '../../demos/resizable/01-single-edge.svelte';
  import singleEdgeSrc from '../../demos/resizable/01-single-edge.svelte?raw';
  import Callbacks from '../../demos/resizable/06-callbacks.svelte';
  import callbacksSrc from '../../demos/resizable/06-callbacks.svelte?raw';
  import AllHandles from '../../demos/resizable/07-all-handles.svelte';
  import allHandlesSrc from '../../demos/resizable/07-all-handles.svelte?raw';
  import Corners from '../../demos/resizable/02-corners.svelte';
  import cornersSrc from '../../demos/resizable/02-corners.svelte?raw';
  import LockGrid from '../../demos/resizable/03-lock-grid.svelte';
  import lockGridSrc from '../../demos/resizable/03-lock-grid.svelte?raw';
  import Snap from '../../demos/resizable/15-snap.svelte';
  import snapSrc from '../../demos/resizable/15-snap.svelte?raw';
  import BoundElement from '../../demos/resizable/14-bound-element.svelte';
  import boundElementSrc from '../../demos/resizable/14-bound-element.svelte?raw';
  import Controlled from '../../demos/resizable/08-controlled.svelte';
  import controlledSrc from '../../demos/resizable/08-controlled.svelte?raw';
  import Scale from '../../demos/resizable/10-scale.svelte';
  import scaleSrc from '../../demos/resizable/10-scale.svelte?raw';
  import CustomHandle from '../../demos/resizable/09-custom-handle.svelte';
  import customHandleSrc from '../../demos/resizable/09-custom-handle.svelte?raw';
  import CustomCorner from '../../demos/resizable/16-custom-corner.svelte';
  import customCornerSrc from '../../demos/resizable/16-custom-corner.svelte?raw';
  import GroupHorizontal from '../../demos/resizable/04-group-horizontal.svelte';
  import groupHorizontalSrc from '../../demos/resizable/04-group-horizontal.svelte?raw';
  import GroupVertical from '../../demos/resizable/05-group-vertical.svelte';
  import groupVerticalSrc from '../../demos/resizable/05-group-vertical.svelte?raw';
  import MultiPane from '../../demos/resizable/13-multi-pane.svelte';
  import multiPaneSrc from '../../demos/resizable/13-multi-pane.svelte?raw';
  import Nested from '../../demos/resizable/11-nested.svelte';
  import nestedSrc from '../../demos/resizable/11-nested.svelte?raw';
  import DynamicDirection from '../../demos/resizable/12-dynamic-direction.svelte';
  import dynamicDirectionSrc from '../../demos/resizable/12-dynamic-direction.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Resizable, ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';
```

### 单个组件 基本使用

通过 `defaultSize` 设置初始大小，可以通过 `onResizeStart`、`onChange`、`onResizeEnd` 设置拖拽的回调。

<DemoBox code={singleEdgeSrc}><SingleEdge /></DemoBox>

<DemoBox code={callbacksSrc}><Callbacks /></DemoBox>

### 控制伸缩方向

通过设置 `enable` 的值开启/关闭特定伸缩方向，默认值均为 `true`。

<DemoBox code={allHandlesSrc}><AllHandles /></DemoBox>

<DemoBox code={cornersSrc}><Corners /></DemoBox>

### 锁定横纵比

通过 `lockAspectRatio` 设置锁定横纵比，可以为 `boolean` 或 `number`；为 `number` 时表示横纵比为该值，为 `true` 时锁定初始横纵比。

<DemoBox code={lockGridSrc}><LockGrid /></DemoBox>

### 受控宽高

可通过 `size` 控制元素的宽高。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 设置缩放值

通过设置 `scale`，整体缩放元素。

<DemoBox code={scaleSrc}><Scale /></DemoBox>

### 根据元素限制元素宽高

通过 `boundElement` 设置用于限制宽高的元素，支持 `'parent'` / `'window'`。

<DemoBox code={boundElementSrc}><BoundElement /></DemoBox>

### 自定义边角 handler 样式

可通过 `handleNode` 设置不同方向的拖动元素节点，可通过 `handleStyle`、`handleClass` 设置不同方向上的样式。

<DemoBox code={customHandleSrc}><CustomHandle /></DemoBox>

<DemoBox code={customCornerSrc}><CustomCorner /></DemoBox>

### 允许阶段性调整宽高

可通过 `grid`、`snap` 属性允许逐渐调整宽高。`grid` 用于指定调整大小应对齐的增量，默认为 `[1, 1]`；`snap` 用于指定调整大小时应对齐的绝对像素值，x 和 y 都是可选的，允许仅包含要定义的轴，默认为空。以上两个参数可结合 `snapGap` 使用，该参数用于指定移动到下一个目标所需的最小间隙，默认为 0，这意味着始终使用 grid/snap 设定的目标。

<DemoBox code={snapSrc}><Snap /></DemoBox>

### 组合组件 基本使用

<Notice type="primary" title="注意事项">

`ResizeGroup` 内需按 `ResizeItem` → `ResizeHandler` → `ResizeItem` 的顺序交替书写，把手位于两个面板之间。

</Notice>

<DemoBox code={groupHorizontalSrc}><GroupHorizontal /></DemoBox>

<DemoBox code={multiPaneSrc}><MultiPane /></DemoBox>

### 嵌套使用

通过 `direction` 设置伸缩方向，可选值为 `horizontal` 和 `vertical`。

<DemoBox code={groupVerticalSrc}><GroupVertical /></DemoBox>

<DemoBox code={nestedSrc}><Nested /></DemoBox>

### 动态方向

`direction` 可以动态切换，切换后把手方向与面板排布随之改变。

<DemoBox code={dynamicDirectionSrc}><DynamicDirection /></DemoBox>

## API 参考

### Resizable

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| boundElement | 用于限制可伸缩元素宽高的元素，传入 `'parent'` 设置父节点为限制节点 | string | - |
| class | 类名 | string | - |
| defaultSize | 用于设置初始宽高，支持数字和字符串（px/vw/vh/%）两种格式 | `Size` | - |
| enable | 指定伸缩框可以伸缩的方向，没有设置为 false 则默认允许该方向的拖动 | `Enable` | - |
| grid | 指定调整大小应对齐的增量 | `[number, number]` | `[1, 1]` |
| handleClass | 用于设置拖拽处理元素各个方向的类名称 | `HandleClasses` | - |
| handleNode | 用于设置拖拽处理元素各个方向的自定义节点 | `HandleNode` | - |
| handleStyle | 用于设置拖拽处理元素各个方向的样式 | `HandleStyles` | - |
| lockAspectRatio | 设置伸缩框横纵比，当为 `true` 时按照初始宽高锁定 | `boolean \| number` | - |
| maxHeight | 指定伸缩框最大高度 | `string \| number` | - |
| maxWidth | 指定伸缩框最大宽度 | `string \| number` | - |
| minHeight | 指定伸缩框最小高度 | `string \| number` | - |
| minWidth | 指定伸缩框最小宽度 | `string \| number` | - |
| onChange | 拖拽过程中的回调 | `(size: Size, e: Event, direction: string) => void` | - |
| onResizeEnd | 结束伸缩的回调 | `(size: Size, e: Event, direction: string) => void` | - |
| onResizeStart | 开始伸缩的回调 | `(e: Event, direction: string) => void` | - |
| ratio | 拖动与实际变化的比例 | number | 1 |
| scale | 可伸缩元素被缩放的比例 | number | 1 |
| size | 控制伸缩框的大小，支持数字和字符串（px/vw/vh/%）两种格式 | `Size` | - |
| snap | 指定调整大小时应对齐的绝对像素值，x 和 y 都是可选的 | `Snap` | - |
| snapGap | 用于指定移动到下一个目标所需的最小间隙 | number | 0 |
| style | 样式 | string | - |

### ResizeGroup

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 面板与把手（`ResizeItem` / `ResizeHandler` 交替） | Snippet | - |
| class | 类名 | string | - |
| direction | 指定 Group 内的伸缩方向 | `'horizontal' \| 'vertical'` | `horizontal` |
| style | 样式 | string | - |

### ResizeItem

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 面板内容 | Snippet | - |
| class | 类名 | string | - |
| defaultSize | 用于设置初始宽高。**字符串支持 % 和 px 单位；当字符串为纯数字或直接设置数字时，表示按照值的比例分配剩余空间** | `string \| number` | - |
| max | 指定伸缩框最大尺寸（百分比或像素值） | string | - |
| min | 指定伸缩框最小尺寸（百分比或像素值） | string | - |
| onChange | 拖拽过程中的回调 | `(size: Size, e: Event, direction: string) => void` | - |
| onResizeEnd | 结束伸缩的回调 | `(size: Size, e: Event, direction: string) => void` | - |
| onResizeStart | 开始伸缩的回调 | `(e: Event, direction: string) => void` | - |
| style | 样式 | string | - |

### ResizeHandler

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 把手内容 | Snippet | - |
| class | 类名 | string | - |
| disabled | 是否禁用该把手（本库补充） | boolean | false |
| onResizeStart | 开始伸缩的回调（本库补充） | `(e: Event, direction: string) => void` | - |
| style | 样式 | string | - |
