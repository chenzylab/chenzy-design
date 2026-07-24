---
title: Image 图片
name: image
category: show
brief: 用于展示和预览图片。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/image/01-basic.svelte';
  import basicSrc from '../../demos/image/01-basic.svelte?raw';
  import Fallback from '../../demos/image/02-fallback.svelte';
  import fallbackSrc from '../../demos/image/02-fallback.svelte?raw';
  import Progressive from '../../demos/image/03-progressive.svelte';
  import progressiveSrc from '../../demos/image/03-progressive.svelte?raw';
  import CustomPreviewSrc from '../../demos/image/04-custom-preview-src.svelte';
  import customPreviewSrcSrc from '../../demos/image/04-custom-preview-src.svelte?raw';
  import Group from '../../demos/image/05-group.svelte';
  import groupSrc from '../../demos/image/05-group.svelte?raw';
  import Standalone from '../../demos/image/06-standalone.svelte';
  import standaloneSrc from '../../demos/image/06-standalone.svelte?raw';
  import PopupContainer from '../../demos/image/07-popup-container.svelte';
  import popupContainerSrc from '../../demos/image/07-popup-container.svelte?raw';
  import RenderMenu from '../../demos/image/08-render-menu.svelte';
  import renderMenuSrc from '../../demos/image/08-render-menu.svelte?raw';
  import MenuItems from '../../demos/image/09-menu-items.svelte';
  import menuItemsSrc from '../../demos/image/09-menu-items.svelte?raw';
  import RenderHeader from '../../demos/image/10-render-header.svelte';
  import renderHeaderSrc from '../../demos/image/10-render-header.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Image, ImagePreview } from '@chenzy-design/svelte';
```

### 基本用法

通过 `src` 指定图片路径即可获取一个具有预览功能的图片，通过 `width`，`height` 指定图片的宽高

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 加载失败的占位图

可通过 `fallback` 自定义加载失败的占位图，该参数类型支持 string 和 Snippet

<DemoBox code={fallbackSrc}><Fallback /></DemoBox>

### 渐进加载

大图可通过 `placeholder` 实现渐进加载

<DemoBox code={progressiveSrc}><Progressive /></DemoBox>

### 自定义预览图片

可以通过设置 Image 组件的 `src` 和 `preview` 参数中的 `src` 不同来自定义预览图片

<DemoBox code={customPreviewSrcSrc}><CustomPreviewSrc /></DemoBox>

### 多图预览

使用 ImagePreview 包裹 Image 即可实现多图片预览

<DemoBox code={groupSrc}><Group /></DemoBox>

### 单独使用预览组件

预览组件 ImagePreview 可以单独使用，通过 `visible` 和 `onVisibleChange` 控制是否预览，通过 `src` 传入可以预览的图片

<DemoBox code={standaloneSrc}><Standalone /></DemoBox>

### 渲染在指定容器

可以通过 `getPopupContainer` 指定预览组件的父级 DOM（需要指定 `position: relative`)，图片预览将会渲染至该 DOM 中。这会改变浮层 DOM 树位置，但不会改变视图渲染位置。

<DemoBox code={popupContainerSrc}><PopupContainer /></DemoBox>

### 自定义预览底部操作区

可以使用 `renderPreviewMenu` 自定义预览底部操作区域

<DemoBox code={renderMenuSrc}><RenderMenu /></DemoBox>

如果想基于默认底部操作区域自定义预览底部操作区域， 可以通过 renderPreviewMenu 的 menuItems 获取默认的按钮节点, menuItems 是一个 Snippet 数组，顺序和默认底部操作栏功能区域内容顺序一致

<DemoBox code={menuItemsSrc}><MenuItems /></DemoBox>

### 自定义预览顶部展示区

通过 `renderHeader` 可以自定义预览顶部展示区

<DemoBox code={renderHeaderSrc}><RenderHeader /></DemoBox>

## API 参考

### Image

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| alt | 图像描述 | string | - |
| class | 自定义样式类名 | string | - |
| crossOrigin | 透传给原生 img 标签的 crossorigin | `'anonymous'` \| `'use-credentials'` | - |
| fallback | 加载失败容错地址或自定义加载失败时的显示内容 | string \| Snippet | - |
| height | 图片显示高度 | number | - |
| imgCls | 自定义样式类名，透传给 img 节点 | string | - |
| imgStyle | 自定义样式，透传给 img 节点 | string | - |
| onClick | 点击图片的回调 | (event: MouseEvent) => void | - |
| onError | 加载错误回调 | (event: Event) => void | - |
| onLoad | 加载成功回调 | (event: Event) => void | - |
| placeholder | 图片未加载时候的占位内容 | Snippet | - |
| preview | 预览参数，为 false 时候禁用预览 | boolean \| ImagePreview | - |
| setDownloadName | 设置图片下载名称 | (src: string) => string | - |
| src | 图片获取地址 | string | - |
| style | 自定义样式 | string | - |
| width | 图片显示宽度 | number | - |

其他支持的属性同 [img](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attributes)。其他属性将透传至底层的 img 节点。

### ImagePreview

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| adaptiveTip | 适应页面操作按钮提示 | string | `适应页面` |
| class | 自定义样式类名 | string | - |
| closable | 是否显示关闭按钮 | boolean | true |
| closeOnEsc | 点击 esc 关闭预览 | boolean | true |
| crossOrigin | 透传给预览图片的原生 img 标签的 crossorigin | `'anonymous'` \| `'use-credentials'` | - |
| currentIndex | 受控属性，当前预览图片下标 | number | - |
| defaultCurrentIndex | 首次展示图片下标 | number | - |
| defaultVisible | 首次是否开启预览 | boolean | - |
| disableDownload | 禁用下载 | boolean | false |
| downloadTip | 下载操作按钮提示 | string | `下载` |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 container `position: relative` | () => HTMLElement | () => document.body |
| infinite | 是否无限循环 | boolean | false |
| initialZoom | 预览图片初始缩放比例，仅在首次打开或切换到该图片时生效一次 | number | - |
| maxZoom | 预览图片最大缩放比例 | number | 5 |
| minZoom | 预览图片最小缩放比例 | number | 0.1 |
| lazyLoad | 是否开启懒加载 | boolean | true |
| lazyLoadMargin | 传给 options 中的 rootMargin 参数 | string | `0px 100px 100px 0px` |
| maskClosable | 点击遮罩是否可关闭 | boolean | true |
| nextTip | 下一步操作按钮提示 | string | `下一步` |
| originTip | 原始尺寸操作按钮提示 | string | `原始尺寸` |
| onChange | 切换图片触发的事件 | (index: number) => void | - |
| onClose | 点击关闭按钮时的回调函数 | () => void | - |
| onDownload | 图片下载回调函数 | (src: string, index: number) => void | - |
| onDownloadError | 图片下载错误回调函数 | (src: string) => void | - |
| onRotateLeft | 旋转图片的回调 | (angle: number) => void | - |
| onNext | 向后切换图片的回调 | (index: number) => void | - |
| onPrev | 向前切换图片的回调 | (index: number) => void | - |
| onZoomIn | 图片放大时的回调函数 | (zoom: number) => void | - |
| onZoomOut | 图片缩小时的回调函数 | (zoom: number) => void | - |
| onVisibleChange | 切换可见状态触发的回调 | (visible: boolean) => void | - |
| preLoad | 是否开启预加载 | boolean | true |
| preLoadGap | 预加载的步长 | number | 2 |
| previewTitle | 自定义预览 title | string \| Snippet | - |
| previewCls | 自定义预览样式类名 | string | - |
| previewStyle | 自定义预览样式 | string | - |
| prevTip | 上一步操作按钮提示 | string | `上一步` |
| renderCloseIcon | 自定义关闭 icon | Snippet | - |
| renderLeftIcon | 自定义向左 icon | Snippet | - |
| renderRightIcon | 自定义向右 icon | Snippet | - |
| renderHeader | 自定义渲染预览顶部信息，入参为当前图 previewTitle | `Snippet<[title]>` | - |
| renderPreviewMenu | 自定义渲染预览底部菜单信息 | `Snippet<[MenuProps]>` | - |
| rotateTip | 旋转操作按钮提示 | string | `旋转` |
| showTooltip | 是否展示底部操作区提示 | boolean | false |
| src | 图片列表信息 | string \| string[] | - |
| style | 自定义样式 | string | - |
| viewerVisibleDelay | 隐藏预览操作按钮前的无操作时长 | number | 10000 |
| visible | 受控属性，是否预览 | boolean | - |
| zIndex | 预览层层级 | number | 1070 |
| zoomInTip | 放大操作按钮提示 | string | `放大` |
| zoomOutTip | 缩小操作按钮提示 | string | `缩小` |
| zoomStep | 图片每次缩小/放大比例 | number | 0.1 |
| setDownloadName | 设置图片下载名称 | (src: string) => string | - |

### MenuProps

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| curPage | 当前图片页下标 | number |
| disabledPrev | 是否禁用向左切换按钮 | boolean |
| disabledNext | 是否禁用向右切换按钮 | boolean |
| disabledZoomIn | 是否禁用放大按钮 | boolean |
| disabledZoomOut | 是否禁用缩小按钮 | boolean |
| disableDownload | 是否禁用下载按钮 | boolean |
| max | 图片缩放最大比例 | number |
| min | 图片缩放最小比例 | number |
| onDownload | 图片下载的调用函数 | () => void |
| onZoomIn | 图片放大时的调用函数 | () => void |
| onZoomOut | 图片缩小时的调用函数 | () => void |
| onPrev | 向前切换图片的调用函数 | () => void |
| onNext | 向后切换图片的调用函数 | () => void |
| onRotateLeft | 逆时针旋转图片的调用函数 | () => void |
| onRotateRight | 顺时针旋转图片的调用函数 | () => void |
| onRatioClick | 切换原始尺寸↔适应页面的调用函数 | () => void |
| ratio | 原始尺寸或适应页面按钮状态 | `'adaptation'` \| `'realSize'` |
| step | 缩放的比例步长 | number |
| totalNum | 可预览的总图片数 | number |
| zoom | 当前图片缩放比例 | number |
| menuItems | 默认底部预览操作区域功能按钮 Snippet 数组 | Snippet[] |
