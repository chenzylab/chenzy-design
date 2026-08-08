---
title: ResizeObserver 尺寸监听
name: resizeobserver
category: other
brief: 无渲染尺寸监听工具组件，封装浏览器原生 ResizeObserver，监听元素盒模型尺寸变化并抛出归一化尺寸。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/resize-observer/01-basic.svelte';
  import basicSrc from '../../demos/resize-observer/01-basic.svelte?raw';
  import ResizeState from '../../demos/resize-observer/02-resize-state.svelte';
  import resizeStateSrc from '../../demos/resize-observer/02-resize-state.svelte?raw';
  import ResponsiveLayout from '../../demos/resize-observer/03-responsive-layout.svelte';
  import responsiveLayoutSrc from '../../demos/resize-observer/03-responsive-layout.svelte?raw';
  import MultipleTargets from '../../demos/resize-observer/04-multiple-targets.svelte';
  import multipleTargetsSrc from '../../demos/resize-observer/04-multiple-targets.svelte?raw';
  import ObserveParent from '../../demos/resize-observer/05-observe-parent.svelte';
  import observeParentSrc from '../../demos/resize-observer/05-observe-parent.svelte?raw';
  import ObserverProperty from '../../demos/resize-observer/06-observer-property.svelte';
  import observerPropertySrc from '../../demos/resize-observer/06-observer-property.svelte?raw';
</script>

## 使用场景

`ResizeObserver` 封装浏览器原生 `ResizeObserver` API，监听元素的盒模型尺寸变化，并以归一化、可节流/防抖的方式向外抛出尺寸信息。它不渲染任何可见 UI、不持有视觉样式，只测量并广播尺寸。

典型用途：容器级响应式布局（替代视口 media query）、虚拟列表行高测量、浮层随目标尺寸重定位、文本省略检测、自适应列宽。

> **与 Semi 的定位差异**：Semi 的 `resizeObserver` 是**内部实现细节**——它有组件目录、被 Table / Tabs / Tooltip / TextArea / Collapsible 等十余个组件消费，但**不从 `semi-ui` 导出、也没有文档页**。本库把它作为公开基座导出（`ResizeObserver` 组件 + `resize` action + `createResizeObserver`），因为本库同样有十余个内部消费方，且 Svelte 生态缺少对应轮子，故一并对外提供并保留本页文档。API 以本库为准：Semi 内部版本仅有 `onResize` / `observeParent` / `observerProperty` / `delayTick` 四个 prop（其中 `delayTick` 在 Semi 中声明后从未被读取，属死 prop，本库不实现；节流能力由 `throttle` / `debounce` 承担）。

> **渲染差异**：Semi 用 `React.cloneElement` 把 ref 挂到唯一子元素上，自身不产生 DOM。Svelte 无法向 snippet 注入 ref，故本库渲染一个无视觉样式的包裹元素（默认 `div`，可用 `tag` 改）；但**开启 `observeChild` 即可让观测目标落到 children 首个元素本身**，尺寸语义与 Semi 一致（同本库 Dropdown 处理 cloneElement 的手法）。包裹元素需生成盒子，因此不使用 `display: contents`。

## 代码演示

### 如何引入

```jsx
import { ResizeObserver } from '@chenzy-design/svelte';
```

### 基础尺寸观察

包裹目标内容，通过 slot 参数实时获取容器宽高。拖拽下方容器右下角即可调整。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 调整中 / 调整完成

`onResizeStart` 在一段连续尺寸变化的首帧触发，`onResizeEnd` 在静默一段时间后触发并回传最后一帧，适合「拖拽中显示实时尺寸、松手后提交一次」的场景。

<DemoBox code={resizeStateSrc}><ResizeState /></DemoBox>

### 响应式切换布局

按容器宽度（而非视口宽度）在断点两侧切换布局，实现组件级响应式。

<DemoBox code={responsiveLayoutSrc}><ResponsiveLayout /></DemoBox>

### 多目标观测

开启 `multiple` 后观测包裹元素的所有直接子元素，`onResize` 逐个抛出，用 `entry.target` 区分来源。

<DemoBox code={multipleTargetsSrc}><MultipleTargets /></DemoBox>

### 观测父容器

`observeParent` 观测包裹元素的**父节点**而非自身（对齐 Semi `observeParent`），用于「监听我所处容器的尺寸」而无需再包一层被观测元素。与 `multiple` 互斥，同时为 `true` 时 `multiple` 优先。

<DemoBox code={observeParentSrc}><ObserveParent /></DemoBox>

### 只监听某一维度

`observerProperty` 设为 `width` 或 `height` 时（对齐 Semi `observerProperty`），逐目标记忆上次上报值，另一维度单独变化不触发回调，可减少无谓重算。

<DemoBox code={observerPropertySrc}><ObserverProperty /></DemoBox>

## API 参考

### ResizeObserver

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| box | 观测盒模型 | `'content-box' \| 'border-box' \| 'device-pixel-content-box'` | content-box |
| children | 内容 slot，作用域参数 `{ width, height, entry }` | `Snippet<[{ width, height, entry }]>` | - |
| class | 包裹元素类名 | string | - |
| debounce | 防抖等待（ms），trailing-only。与 throttle 互斥且优先 | number | 0 |
| disabled | 暂停尺寸分发（observer 仍监听，仅不向外通知） | boolean | false |
| fallbackToWindow | 原生不可用或显式开启时，降级监听 `window.resize` 近似重测 | boolean | false |
| multiple | 观测包裹元素内所有直接子元素（而非包裹元素本身） | boolean | false |
| observeOnMount | 挂载后立即测量一次 | boolean | true |
| observeChild | 观测 children 首个元素而非包裹元素本身（对齐 Semi 直接观测子元素的语义）；无子元素时回退观测包裹元素 | boolean | false |
| observeParent | 观测包裹元素的父节点而非自身。优先级：multiple > observeChild > observeParent | boolean | false |
| observerProperty | 仅当指定维度变化时才回调 | `'width' \| 'height' \| 'all'` | all |
| onFirstMeasure | 首次测量回调 | `(entry: CDResizeEntry) => void` | - |
| onResize | 尺寸变化回调（归一化 entry） | `(entry: CDResizeEntry) => void` | - |
| onResizeEnd | 连续变化静默结束后触发，回传最后一帧 | `(entry: CDResizeEntry) => void` | - |
| onResizeStart | 一段连续尺寸变化的首帧触发 | `(entry: CDResizeEntry) => void` | - |
| tag | 包裹元素标签，须为能生成盒子的元素 | string | div |
| throttle | 节流间隔（ms），leading + trailing | number | 0 |

### CDResizeEntry

归一化后的尺寸负载，回调与 slot 参数均使用该结构（消费方无需再调 `getBoundingClientRect`）。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| box | 该次测量所用盒模型 | ResizeBox |
| height | 高度（px） | number |
| target | 发生尺寸变化的元素 | Element |
| width | 宽度（px） | number |

### resize action

轻量用法，直接把监听挂到任意元素上，无需包裹容器。

```jsx
import { resize } from '@chenzy-design/svelte';
```

```jsx
<div use:resize={{ throttle: 16, onResize: (e) => console.log(e.width, e.height) }}>...</div>
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| box | 观测盒模型。变化时重建 observer | ResizeBox | content-box |
| debounce | 防抖等待（ms）。变化时重建 observer | number | 0 |
| fallbackToWindow | 降级监听 `window.resize`。变化时重建 observer | boolean | false |
| observerProperty | 仅当指定维度变化时才回调。变化时重建 observer | `'width' \| 'height' \| 'all'` | all |
| onResize | 尺寸变化回调。变化时原地更新，不重建 | `(entry: CDResizeEntry) => void` | - |
| onResizeEnd | 连续变化静默结束后触发。变化时原地更新 | `(entry: CDResizeEntry) => void` | - |
| onResizeStart | 连续变化首帧触发。变化时原地更新 | `(entry: CDResizeEntry) => void` | - |
| throttle | 节流间隔（ms）。变化时重建 observer | number | 0 |

### createResizeObserver

底层工厂（来自 `@chenzy-design/core`），供不使用组件 / action 的场景直接调用，返回 `supported` / `observe` / `unobserve` / `disconnect`。另有 `getGlobalResizeObserver` 提供单例 observer 池，供大列表共享一个原生实例。

## 无障碍

- 本组件无可聚焦元素、无 role、无 aria 语义，不进入无障碍树；包裹元素不添加任何 aria 属性，避免污染语义树
- 监听尺寸变化不移动焦点、不触发 scrollIntoView
- 尺寸变化驱动的内容更新不应造成意外的视口跳动 / 回流（WCAG 2.1 §1.4.10 Reflow、§2.3.3 Animation from Interactions）；节流 / 防抖即为防止「连续重排导致辅助技术读屏抖动」的关键缓解措施
- 本组件不自动播报尺寸变化（避免噪音），如需播报由消费方自行处理
