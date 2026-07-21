---
title: Highlight 高亮文本
name: highlight
category: show
brief: 高亮特定内容。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/highlight/01-basic.svelte';
  import basicSrc from '../../demos/highlight/01-basic.svelte?raw';
  import HighlightStyle from '../../demos/highlight/02-highlight-style.svelte';
  import highlightStyleSrc from '../../demos/highlight/02-highlight-style.svelte?raw';
  import Differentiated from '../../demos/highlight/03-differentiated.svelte';
  import differentiatedSrc from '../../demos/highlight/03-differentiated.svelte?raw';
  import Component from '../../demos/highlight/04-component.svelte';
  import componentSrc from '../../demos/highlight/04-component.svelte?raw';
  import CaseSensitive from '../../demos/highlight/06-case-sensitive.svelte';
  import caseSensitiveSrc from '../../demos/highlight/06-case-sensitive.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Highlight } from '@chenzy-design/svelte';
```

### 基本用法

你可以通过 `searchWords` 指定需要高亮的关键字，通过 `sourceString` 指定源文本。

<Notice title="注意事项">

Highlight 组件会将文本拆分成多个独立的行内元素，任何分割文本流的 CSS 布局（如 flex 布局）可能会将高亮文本断开，为避免高亮内容被浏览器拆分到不同行或列，请按需使用元素包裹 Highlight 组件。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 指定高亮样式

默认情况下，高亮文本会自带文本样式，背景颜色为浅黄色、文本颜色为黑色；暗色模式下背景色更深、文本颜色为白色。当你需要自定义不同的高亮样式时，你可以通过 `highlightClassName`、`highlightStyle` 来指定。

<DemoBox code={highlightStyleSrc}><HighlightStyle /></DemoBox>

### 不同文本使用差异化样式

支持针对不同的高亮文本使用不同的高亮样式。`searchWords` 默认为字符串数组，当传入对象数组时，可以通过 `text` 指定高亮文本，同时单独指定 `className`、`style`。

<DemoBox code={differentiatedSrc}><Differentiated /></DemoBox>

### 指定高亮标签

默认会将 `sourceString` 中与 `searchWords` 匹配的文本用 `mark` 标签包裹，你也可以通过 `component` 重新指定标签。

<DemoBox code={componentSrc}><Component /></DemoBox>

### 大小写敏感

通过设置 `caseSensitive` 控制匹配是否区分大小写，默认为不敏感。

<DemoBox code={caseSensitiveSrc}><CaseSensitive /></DemoBox>

## API 参考

### Highlight

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| searchWords | 期望高亮显示的文本（对象数组支持差异化样式） | string \| string[] \| object[] | `[]` |
| sourceString | 源文本 | string | - |
| component | 高亮标签 | string | `mark` |
| highlightClassName | 高亮标签的样式类名 | string | - |
| highlightStyle | 高亮标签的内联样式 | string | - |
| caseSensitive | 是否大小写敏感 | boolean | false |
| autoEscape | 是否自动转义 | boolean | true |
