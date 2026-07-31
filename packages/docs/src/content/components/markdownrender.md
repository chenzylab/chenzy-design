---
title: MarkdownRender Markdown 渲染
name: markdownrender
category: plus
brief: 渲染 Markdown 纯文本为符合设计规范的富文本内容。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/markdown-render/01-basic.svelte';
  import basicSrc from '../../demos/markdown-render/01-basic.svelte?raw';
  import CustomElement from '../../demos/markdown-render/02-custom-element.svelte';
  import customElementSrc from '../../demos/markdown-render/02-custom-element.svelte?raw';
  import PlainMarkdown from '../../demos/markdown-render/03-plain-markdown.svelte';
  import plainMarkdownSrc from '../../demos/markdown-render/03-plain-markdown.svelte?raw';
  import CustomComponent from '../../demos/markdown-render/04-custom-component.svelte';
  import customComponentSrc from '../../demos/markdown-render/04-custom-component.svelte?raw';
</script>

## 使用场景

Markdown 是一种文档标记语言，可以通过简单的标记实现例如标题，图片，表格，链接，加粗等基本常用富文本功能。

本库提供的 MarkdownRender 组件支持渲染 Markdown，无需特别配置，传入纯文本即可渲染出符合样式规范的富文本内容。

通常用于下列场景：

- 文档站编写与渲染
- 服务端动态生成富文本内容时，前端渲染
- 偏内容展示的轻交互网站

<Notice type="primary" title="与 Semi 的能力差异：不支持 MDX">

Semi 的 MarkdownRender 同时支持 Markdown 与 **MDX**（在 Markdown 中直接书写 JSX），其实现依赖 React 的 `jsx/run-time`。

**Svelte 生态没有对应的 jsx-runtime，因此本库不支持 MDX**，`format` 只接受 `'md'`。渲染管线改用 unified（remark → rehype）。

需要在 Markdown 中插入自定义组件时，用 `components` 注册标签来替代 MDX 的正文 JSX —— 见下方「添加自定义组件」。

由此带来一个**好处**：纯 Markdown 模式下 `<` `{` 等符号不会被当作 JSX 解析，**无需转义**（Semi 在 mdx 模式下必须转义，并为此单列了「仅纯 Markdown」一节）。

</Notice>

## 代码演示

### 如何引入

```jsx
import { MarkdownRender } from '@chenzy-design/svelte';
```

### 基本用法

导入 MarkdownRender 后，直接传入 Markdown 纯文本即可。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 修改元素样式

通过 `components` 传入渲染组件，可覆盖任意 Markdown 元素的渲染。

<DemoBox code={customElementSrc}><CustomElement /></DemoBox>

### 仅纯 Markdown

`format="md"` 为纯 Markdown 模式。本库仅支持该模式（见上方差异说明），特殊符号无需转义。

<DemoBox code={plainMarkdownSrc}><PlainMarkdown /></DemoBox>

### 添加自定义组件

通过 `components` 注册自定义组件，即可在 Markdown 中渲染带 JS 事件的元素——这是本库替代 MDX 正文 JSX 的方式。

<DemoBox code={customComponentSrc}><CustomComponent /></DemoBox>

### 添加插件

通过 `remarkPlugins`、`rehypePlugins` 支持 unified 生态的所有 Remark / Rehype 插件，详情请参考 [remark](https://github.com/remarkjs/remark) 与 [rehype](https://github.com/rehypejs/rehype)。

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| components | 用于覆盖 Markdown 元素，也可添加自定义组件 | `Record<string, Component \| string>` | - |
| format | 传入的 raw 类型。**本库仅支持 `'md'`**（Semi 另有 `'mdx'`，Svelte 无 jsx-runtime 故不支持） | `'md'` | `'md'` |
| raw | Markdown 的纯文本 | string | - |
| rehypePlugins | 自定义 Rehype Plugin | `Plugin[]` | - |
| remarkGfm | 是否开启 Github GFM 语法 | boolean | true |
| remarkPlugins | 自定义 Remark Plugin | `Plugin[]` | - |
| style | 样式 | string | - |
