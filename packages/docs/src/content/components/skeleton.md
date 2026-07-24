---
title: Skeleton 骨架屏
name: skeleton
category: feedback
brief: 在需要等待加载内容的位置提供的占位组件。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/skeleton/01-basic.svelte';
  import basicSrc from '../../demos/skeleton/01-basic.svelte?raw';
  import ImageTitle from '../../demos/skeleton/03-image-title.svelte';
  import imageTitleSrc from '../../demos/skeleton/03-image-title.svelte?raw';
  import Statistic from '../../demos/skeleton/04-statistic.svelte';
  import statisticSrc from '../../demos/skeleton/04-statistic.svelte?raw';
  import AvatarTitle from '../../demos/skeleton/05-avatar-title.svelte';
  import avatarTitleSrc from '../../demos/skeleton/05-avatar-title.svelte?raw';
  import ParagraphButton from '../../demos/skeleton/06-paragraph-button.svelte';
  import paragraphButtonSrc from '../../demos/skeleton/06-paragraph-button.svelte?raw';
  import AvatarTitleParagraph from '../../demos/skeleton/07-avatar-title-paragraph.svelte';
  import avatarTitleParagraphSrc from '../../demos/skeleton/07-avatar-title-paragraph.svelte?raw';
  import TableDemo from '../../demos/skeleton/08-table.svelte';
  import tableSrc from '../../demos/skeleton/08-table.svelte?raw';
  import Active from '../../demos/skeleton/02-active.svelte';
  import activeSrc from '../../demos/skeleton/02-active.svelte?raw';
</script>

## 概述

- `SkeletonAvatar`：占位头像，默认为圆形，默认尺寸：Avatar medium: `width: 48px`，`height: 48px`。支持 size、shape 属性
- `SkeletonImage`：占位图像，默认尺寸：`width: 100%`，`height: 100%`。
- `SkeletonTitle`：占位标题，默认尺寸：`width: 100%`， `height: 24px`。
- `SkeletonParagraph`：占位内容部分，默认尺寸：`width: 100%`，`height: 16px`，`margin-bottom: 10px`。
- `SkeletonButton`：占位按钮，默认尺寸：`width: 115px`，`height: 32px`。

> 注意：默认样式均可通过 `class` 或 `style` 进行自定义。

## 代码演示

### 如何引入

```jsx
import { Skeleton } from '@chenzy-design/svelte';
```

### 基本使用

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 组合使用

图片和标题。

<DemoBox code={imageTitleSrc}><ImageTitle /></DemoBox>

统计数字。

<DemoBox code={statisticSrc}><Statistic /></DemoBox>

头像和标题。

<DemoBox code={avatarTitleSrc}><AvatarTitle /></DemoBox>

居中段落和按钮。

<DemoBox code={paragraphButtonSrc}><ParagraphButton /></DemoBox>

头像、标题和段落。

<DemoBox code={avatarTitleParagraphSrc}><AvatarTitleParagraph /></DemoBox>

表格。

<DemoBox code={tableSrc}><TableDemo /></DemoBox>

### 加载动画

通过设置 `active` 属性可以展示动画效果。

<DemoBox code={activeSrc}><Active /></DemoBox>

## API 参考

### Skeleton

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| active | 是否展示动画效果 | boolean | false |
| class | 类名 | string | - |
| loading | 为 true 时，显示占位元素。反之则显示子组件 | boolean | true |
| placeholder | 加载等待时的占位元素 | Snippet | - |
| style | 样式 | string | - |

### SkeletonAvatar

> `SkeletonImage`，`SkeletonTitle`，`SkeletonButton` 大部分 API 与 `SkeletonAvatar` 相同。其中 shape 仅 `SkeletonAvatar` 支持。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| size | 设置头像的大小，支持 `extra-extra-small`、`extra-small`、`small`、`medium`、`large`、`extra-large` | string | `medium` |
| style | 样式 | string | - |
| shape | 指定头像的形状，支持 `circle`、`square` | string | `circle` |

### SkeletonParagraph

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| rows | 设置段落占位图的行数 | number | 4 |
| style | 样式 | string | - |

## 文案规范

- 不变的固定内容直接展示固定内容，可变的内容使用骨架屏展示
