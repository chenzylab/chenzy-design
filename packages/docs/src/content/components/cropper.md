---
title: Cropper 图片裁切
name: cropper
category: show
brief: 用于裁切图片，支持自定义裁切框样式，可拖动调整裁切框与图片位置，可缩放、旋转被裁切图片。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/cropper/01-basic.svelte';
  import basicSrc from '../../demos/cropper/01-basic.svelte?raw';
  import AspectRatio from '../../demos/cropper/02-aspect-ratio.svelte';
  import aspectRatioSrc from '../../demos/cropper/02-aspect-ratio.svelte?raw';
  import RotateZoom from '../../demos/cropper/03-rotate-zoom.svelte';
  import rotateZoomSrc from '../../demos/cropper/03-rotate-zoom.svelte?raw';
  import CropperBox from '../../demos/cropper/04-cropper-box.svelte';
  import cropperBoxSrc from '../../demos/cropper/04-cropper-box.svelte?raw';
  import Preview from '../../demos/cropper/05-preview.svelte';
  import previewSrc from '../../demos/cropper/05-preview.svelte?raw';
</script>

## 使用场景

Cropper 用于裁切图片，支持自定义裁切框样式，可通过拖动调整裁切框位置，被裁切图片位置；可缩放，旋转被裁切图片。

## 代码演示

### 如何引入

```jsx
import { Cropper } from '@chenzy-design/svelte';
```

### 基本用法

通过 `src` 设置被裁切的图片；可通过 `shape` 设置裁切框形状，默认为方形。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义裁切框比例

可通过 `defaultAspectRatio` 设置初始的裁切框比例（默认为 1）。可通过 `aspectRatio` 设置固定的裁切框比例。
设置 `aspectRatio` 时，裁切框比例固定，拖动时裁切框将以此比例变化。

<DemoBox code={aspectRatioSrc}><AspectRatio /></DemoBox>

### 受控旋转/缩放图片

通过 `rotate` 和 `zoom` 控制图片旋转和缩放，可通过 `onZoomChange` 拿到最新的 `zoom` 值。

<DemoBox code={rotateZoomSrc}><RotateZoom /></DemoBox>

### 裁切框设置

可通过 `cropperBoxStyle`、`cropperBoxClassName` 自定义裁切框样式。可通过 `showResizeBox` 设置是否展示裁切框边角的调整块。

<DemoBox code={cropperBoxSrc}><CropperBox /></DemoBox>

### 实时预览裁切效果

通过 `preview` 指定预览容器，实时预览裁切效果。

<DemoBox code={previewSrc}><Preview /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| aria-label | 容器无障碍名称（未设时走 locale `Cropper.container`，本库补充） | string | - |
| aspectRatio | 裁切框比例 | number | - |
| class | 类名 | string | - |
| cropperBoxClassName | 裁切框类名 | string | - |
| cropperBoxStyle | 裁切框样式 | string | - |
| defaultAspectRatio | 初始裁切框比例 | number | 1 |
| fill | 裁切结果中非图片部分的填充色 | string | `rgba(0, 0, 0, 0)` |
| imgProps | 透传给 img 标签的属性 | object | - |
| maxZoom | 最大缩放倍数 | number | 3 |
| minZoom | 最小缩放倍数 | number | 0.1 |
| onZoomChange | 缩放回调 | `(zoom: number) => void` | - |
| preview | 指定预览容器 | `() => HTMLElement` | - |
| rotate | 旋转角度 | number | - |
| shape | 裁切框形状 | `'rect' \| 'round' \| 'roundRect'` | `rect` |
| showResizeBox | 是否展示调整块 | boolean | true |
| src | 图片地址 | string | - |
| style | 样式 | string | - |
| zoom | 缩放比例 | number | - |
| zoomStep | 缩放步长 | number | 0.1 |

### Methods

绑定在组件实例上的方法，通过 `bind:this` 拿到实例后调用。

| Name | Description |
| --- | --- |
| getCropperCanvas | 获取裁剪图片的 canvas |
