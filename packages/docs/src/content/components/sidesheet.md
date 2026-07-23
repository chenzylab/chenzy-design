---
title: SideSheet 滑动侧边栏
name: sidesheet
category: feedback
brief: 可从屏幕边沿滑出的浮层面板，通常用于承载二级操作页面。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/side-sheet/01-basic.svelte';
  import basicSrc from '../../demos/side-sheet/01-basic.svelte?raw';
  import Placement from '../../demos/side-sheet/02-placement.svelte';
  import placementSrc from '../../demos/side-sheet/02-placement.svelte?raw';
  import Size from '../../demos/side-sheet/03-size.svelte';
  import sizeSrc from '../../demos/side-sheet/03-size.svelte?raw';
  import NoMask from '../../demos/side-sheet/04-no-mask.svelte';
  import noMaskSrc from '../../demos/side-sheet/04-no-mask.svelte?raw';
  import Container from '../../demos/side-sheet/05-container.svelte';
  import containerSrc from '../../demos/side-sheet/05-container.svelte?raw';
  import Content from '../../demos/side-sheet/06-content.svelte';
  import contentSrc from '../../demos/side-sheet/06-content.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { SideSheet } from '@chenzy-design/svelte';
```

### 基本

默认侧边栏从右滑出，支持点击遮罩区关闭。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义位置

可以通过设置 `placement` 属性设置侧边栏滑出位置，支持 `top`, `bottom`, `left`, `right`。

<DemoBox code={placementSrc}><Placement /></DemoBox>

### 自定义尺寸

可以通过设置 `size` 属性设置侧边栏尺寸，支持 `small`(448px)， `medium`(684px), `large`(920px)，仅在 `placement` 为 `left` 或 `right` 时生效。若默认的尺寸不满足你的需求，你还可以通过设置 `width` 属性自行设置宽度，例如 `width={900}` / `width={'800px'}`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 可操作的外部区域

当 `mask={false}` 时允许对外部区域进行操作。

<Notice type="primary" title="注意">
当 SideSheet 是默认渲染在 body 中时（即不传入 getPopupContainer 参数），会在打开时自动给 body 添加 `overflow: hidden` 来禁止滚动。如果你希望外部区域依然可滚动，可以将 `disableScroll` 设为 false。
</Notice>

<DemoBox code={noMaskSrc}><NoMask /></DemoBox>

### 渲染在指定容器

可以通过 `getPopupContainer` 指定父级 DOM，弹层将会渲染至该 DOM 中。

<Notice type="primary" title="注意">
容器需要手动设置样式 `overflow: hidden`，否则会导致动画溢出。
</Notice>

<DemoBox code={containerSrc}><Container /></DemoBox>

### 自定义内容区域

可以通过自定义 `title`，`footer` 等创建出丰富的内容样式。

<DemoBox code={contentSrc}><Content /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterVisibleChange | 面板展示/隐藏时动画结束触发的回调 | `(isVisible: boolean) => void` | - |
| ariaLabel | 无可见标题时提供的可访问名（对齐 Semi aria-label） | string | - |
| bodyStyle | 面板内容的样式 | string | - |
| class | 类名（对齐 Semi className） | string | - |
| closable | 是否允许通过右上角的关闭按钮关闭 | boolean | true |
| closeIcon | 关闭按钮的 icon（Snippet，传 null 不显示） | `Snippet` \| null | `IconClose` |
| closeOnEsc | 允许通过键盘事件 Esc 触发关闭 | boolean | false |
| disableScroll | 默认渲染在 document.body 层时是否禁止 body 的滚动，即给 body 添加 `overflow: hidden` | boolean | true |
| footer | 侧边栏底部（Snippet，未提供不渲染） | `Snippet<[{ close: () => void }]>` \| null | - |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative`。这会改变浮层 DOM 树位置，但不会改变视图渲染位置。 | `() => HTMLElement \| null` | - |
| headerStyle | 面板头部的样式 | string | - |
| height | 高度，位置为 `top` 或 `bottom` 时生效 | number \| string | 400 |
| keepDOM | 关闭 SideSheet 时是否保留内部组件不销毁 | boolean | false |
| mask | 是否显示遮罩，当 `mask={false}` 时允许对外部区域进行操作 | boolean | true |
| maskClosable | 是否允许通过点击遮罩来关闭面板 | boolean | true |
| maskStyle | 遮罩的样式 | string | - |
| motion | 是否允许动画 | boolean | true |
| placement | 侧边栏滑出位置，支持 `top`, `bottom`, `left`, `right` | string | `right` |
| size | 尺寸，支持 `small`(448px)， `medium`(684px), `large`(920px)，仅在 `left` 或 `right` 时生效 | string | `small` |
| style | 可用于设置面板根样式 | string | - |
| title | 面板的标题（string） | string | - |
| titleSnippet | 自定义标题区（Snippet，覆盖 title；对齐 Semi title 传 ReactNode） | `Snippet` | - |
| visible | 面板是否可见（受控，不回写） | boolean | false |
| width | 宽度，位置为 `left` 或 `right` 时生效 | number \| string | 448 |
| zIndex | 弹层 z-index 值 | number | 1000 |
| onCancel | 取消面板时的回调函数 | `(e: MouseEvent \| KeyboardEvent) => void` | - |

## Accessibility

### ARIA

- SideSheet 具有 `dialog` role 来表示它是一个弹窗组件，内部 header 具有 `heading` role 表明是 header。
- 模态（`mask={true}`）时容器额外设 `aria-modal="true"`，非模态（`mask={false}`）不设，避免误导屏幕阅读器。
- 有标题时 `aria-labelledby` 关联标题元素 id；无标题须提供 `ariaLabel` 作为可访问名。
- 键盘：`closeOnEsc={true}` 时 Esc 关闭；关闭按钮 Enter/Space 激活；`prefers-reduced-motion` 或 `motion={false}` 时移除位移动效，保留即时显隐。

## FAQ

- **SideSheet 会自动禁止 body 的滚动吗？** 当 SideSheet 是默认渲染在 body 中时（即不传入 getPopupContainer 参数），会在打开时自动给 body 添加 `overflow: hidden` 来禁止滚动。可以通过 `disableScroll={false}` 允许滚动。
