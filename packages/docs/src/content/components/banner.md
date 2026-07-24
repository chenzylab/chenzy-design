---
title: Banner 通知横幅
name: banner
category: feedback
brief: 横幅通常用于标识全页的状态或通知等。它通常是常驻的，需要用户主动将其关闭。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/banner/01-basic.svelte';
  import basicSrc from '../../demos/banner/01-basic.svelte?raw';
  import TypeDemo from '../../demos/banner/02-type.svelte';
  import typeSrc from '../../demos/banner/02-type.svelte?raw';
  import FullMode from '../../demos/banner/03-full-mode.svelte';
  import fullModeSrc from '../../demos/banner/03-full-mode.svelte?raw';
  import CustomContent from '../../demos/banner/04-custom-content.svelte';
  import customContentSrc from '../../demos/banner/04-custom-content.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Banner } from '@chenzy-design/svelte';
```

### 基本用法

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 不同类型

支持 4 种类型：`info`、`warning`、`danger`、`success`。默认为 `info`。

<DemoBox code={typeSrc}><TypeDemo /></DemoBox>

### 非全屏模式

可以设置 `fullMode={false}` 使用非全屏模式的 banner 样式。
通过 `bordered` 属性可以设置边框。

<DemoBox code={fullModeSrc}><FullMode /></DemoBox>

### 自定义内容

可以通过 children 自定义其他渲染内容。

<DemoBox code={customContentSrc}><CustomContent /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 是否展示边框，仅在非全屏模式下有效 | boolean | false |
| class | 类名 | string | - |
| closeIcon | 自定义关闭 icon（Snippet），为 null 时不显示关闭按钮 | Snippet \| null | - |
| description | 描述内容（string 文本，descriptionSnippet 优先） | string | - |
| descriptionSnippet | 描述内容自定义节点 | Snippet | - |
| fullMode | 是否为全屏模式 | boolean | true |
| icon | 自定义 icon（Snippet），为 null 时不显示 icon | Snippet \| null | - |
| onClose | 关闭时的回调函数 | () => void | - |
| style | 样式 | string | - |
| title | 标题（string 文本，titleSnippet 优先） | string | - |
| titleSnippet | 标题自定义节点 | Snippet | - |
| type | 类型，支持 `info`, `success`, `danger`, `warning` | string | `info` |

## Accessibility

### ARIA

- 组件的 `role` 为 `alert`
- 关闭按钮的 `aria-label` 为 `Close`

### 键盘和焦点

- Banner 的关闭按钮可以使用 `Tab` 键聚焦，按钮聚焦后，敲击 `Enter` 键或 `Space` 键可以关闭 banner

## 文案规范

- 全屏 Banner
  - 尽量保持内容一行展示完全
  - 使用正确的标点符号，句子内使用逗号，句子间使用句号
- 非全屏 Banner
  - 标题
    - 使用精简的语言进行说明
    - 标题上尽量避免使用逗号，句号等标点符号，有且只有是疑问句的时候，支持使用问号结尾
  - 正文
    - 在信息传递完整的前提下，尽可能地将正文压缩至 1-2 句话
    - 对标题进行详尽地描述或者解释，而不是对标题的重复说明
    - 使用正确的标点符号，句子内使用逗号，句子间使用句号
