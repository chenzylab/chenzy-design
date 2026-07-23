---
title: Empty 空状态
name: empty
category: show
brief: 空状态时的展示占位图。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/empty/01-basic.svelte';
  import basicSrc from '../../demos/empty/01-basic.svelte?raw';
  import Custom from '../../demos/empty/02-custom.svelte';
  import customSrc from '../../demos/empty/02-custom.svelte?raw';
  import NoImage from '../../demos/empty/03-no-image.svelte';
  import noImageSrc from '../../demos/empty/03-no-image.svelte?raw';
  import Layout from '../../demos/empty/04-layout.svelte';
  import layoutSrc from '../../demos/empty/04-layout.svelte?raw';
  import Illustrations from '../../demos/empty/05-illustrations.svelte';
  import illustrationsSrc from '../../demos/empty/05-illustrations.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Empty } from '@chenzy-design/svelte';
```

### 基本用法

通过 `imageSlot` 设置占位图片，可以引入本库内置的对应插画（插画默认宽高是 200x200），也可以传入自定义的插画。目前拥有的插画可以查看[占位图插画](#占位图插画_建设中_)。

内置一系列暗色模式的插画，并支持通过 `darkModeImageSlot` 传入暗色模式下需要使用的插画，以更好地适配暗色模式。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义

通过 `children` 可以实现自定义的描述内容。

<DemoBox code={customSrc}><Custom /></DemoBox>

也可以不使用图片。

<DemoBox code={noImageSrc}><NoImage /></DemoBox>

### 不同布局

支持 2 种类型的布局：`vertical`、`horizontal`。默认为 `vertical`。

<DemoBox code={layoutSrc}><Layout /></DemoBox>

### 占位图插画(建设中)

目前本库内置以下插画。

<DemoBox code={illustrationsSrc}><Illustrations /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| darkModeImage | 暗色模式开启后的占位图（SVG 精灵对象或图片 URL），响应 `data-theme` 属性变化 | `{ id?: string; viewBox?: string; url?: string }` \| string | - |
| darkModeImageSlot | 暗色模式自定义插画节点（等价 Semi darkModeImage 传 ReactNode） | Snippet | - |
| description | 内容描述；string 直渲，Snippet 渲染富内容 | string \| Snippet | - |
| image | 占位图（SVG 精灵对象或图片 URL 字符串） | `{ id?: string; viewBox?: string; url?: string }` \| string | - |
| imageSlot | 自定义插画节点（等价 Semi image 传 ReactNode） | Snippet | - |
| imageStyle | 占位图样式 | string | - |
| layout | 布局方式，支持 `vertical`, `horizontal` | string | `vertical` |
| style | 样式名 | string | - |
| title | 标题 | string | - |

## Accessibility

### ARIA

- Empty 插图的 aria-hidden 为 true
- 外部图片 `<img>` 的 `alt` 取 `description`（缺省回退 `empty`），保证图片可访问名称
- Empty 本身不可聚焦；内部操作按钮遵循各自原生 Tab 顺序，满足键盘可达性

## 文案规范

- 标题
  - 标题应该简洁易懂
- 正文
  - 可以展示展示空状态的具体原因，也可以展示后续的操作行为去帮助用户消除空状态
  - 不要重复标题上的内容
  - 尽量保持正文在 1-2 句话内
- 动作按钮
  - 按钮文案需要足够清晰和容易理解
  - 使用 动词 + 名词 的格式
