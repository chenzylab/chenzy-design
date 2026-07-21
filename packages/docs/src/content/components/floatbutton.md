---
title: FloatButton 悬浮按钮
name: floatbutton
category: basic
brief: 悬浮按钮是可以悬浮在页面上的可操作按钮。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/float-button/01-basic.svelte';
  import basicSrc from '../../demos/float-button/01-basic.svelte?raw';
  import Size from '../../demos/float-button/02-size.svelte';
  import sizeSrc from '../../demos/float-button/02-size.svelte?raw';
  import Shape from '../../demos/float-button/03-shape.svelte';
  import shapeSrc from '../../demos/float-button/03-shape.svelte?raw';
  import Href from '../../demos/float-button/04-href.svelte';
  import hrefSrc from '../../demos/float-button/04-href.svelte?raw';
  import Colorful from '../../demos/float-button/05-colorful.svelte';
  import colorfulSrc from '../../demos/float-button/05-colorful.svelte?raw';
  import BadgeDemo from '../../demos/float-button/06-badge.svelte';
  import badgeSrc from '../../demos/float-button/06-badge.svelte?raw';
  import Group from '../../demos/float-button/07-group.svelte';
  import groupSrc from '../../demos/float-button/07-group.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { FloatButton, FloatButtonGroup } from '@chenzy-design/svelte';
```

### 基本用法

FloatButton 默认 `position: fixed` 悬浮在视口右下角，通过 `style` 覆盖定位。以下演示为便于在文档中预览，用相对定位容器将按钮框在示例区内。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 尺寸

支持三种尺寸：默认，小，大。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 形状

默认定义了两种形状：round（默认）、square。

<DemoBox code={shapeSrc}><Shape /></DemoBox>

### 点击跳转

可通过 `href` 设置跳转地址，`target` 指定目标网页应该在哪个窗口或框架中打开。

<DemoBox code={hrefSrc}><Href /></DemoBox>

### AI 风格 - 多彩悬浮按钮

可设置 `colorful` 为 true，展示多彩的悬浮按钮。

<DemoBox code={colorfulSrc}><Colorful /></DemoBox>

### 带徽章的

传入 `badge` 参数时，按钮外层包裹 [Badge](/components/badge)，支持 `dot` / `count` / `overflowCount` / `type` 等。

<DemoBox code={badgeSrc}><BadgeDemo /></DemoBox>

### 悬浮按钮组

可通过 `items` 传入子项，`onClick` 回传被点击子项的 `value`。

<DemoBox code={groupSrc}><Group /></DemoBox>

## API 参考

### FloatButton

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| badge | 徽章参数 | [BadgeProps](/components/badge) | - |
| colorful | 多彩悬浮按钮 | boolean | false |
| class | 样式类名 | string | - |
| disabled | 禁用状态 | boolean | false |
| href | 点击跳转的链接 | string | - |
| icon | 显示图标 | Snippet | - |
| onClick | 点击回调函数 | (e: MouseEvent) => void | - |
| shape | 形状，支持 round、square | round \| square | round |
| size | 尺寸，支持 default、small、large | small \| default \| large | default |
| style | 样式 | string | - |
| target | 指定在何处显示链接的 URL | string | - |

### FloatButtonGroupItem

在 FloatButtonProps 基础上增加以下参数。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 文本内容 | Snippet \| string | - |
| value | item 的标识 | string | - |

### FloatButtonGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 样式类名 | string | - |
| disabled | 禁用状态 | boolean | false |
| items | 单个子项的信息 | FloatButtonGroupItem[] | - |
| onClick | 点击回调函数 | (value: string, e: MouseEvent) => void | - |
| style | 样式 | string | - |
