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

**注意：Safari 16.3 之前的版本不支持正则环视断言，会导致上游依赖的 remark-gfm [报错](https://github.com/syntax-tree/mdast-util-gfm-autolink-literal/issues/10)，可以传入 `remarkGfm` 为 `false` 关闭 GFM 语法解析（会导致表格等 Markdown 特性无法解析），并在项目编译时用 null-loader 或 alias 等方式忽略掉 remark-gfm 这个包。**

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

可以覆盖的基本元素 tag 支持 `a blockquote br code em h1 h2 h3 h4 h5 h6 hr img li ol p pre strong ul table`；其中 `h1` `h2` `h3` `h4` `h5` `h6` `p` `a` `img` `table` `code` 默认已注册为 Semi 风格组件（见 `MarkdownRender.defaultComponents`），其余标签走原生渲染，可自行传入 `components` 覆盖。

### 仅纯 Markdown

`format="md"` 为纯 Markdown 模式。本库仅支持该模式（见上方差异说明），特殊符号无需转义。

<DemoBox code={plainMarkdownSrc}><PlainMarkdown /></DemoBox>

<Notice type="primary" title="format='md' 模式下 HTML 标签的处理">

`format="md"` 模式下，Markdown 中嵌入的 raw HTML（如 `<div>`、`<span style="color:red">` 等）会被底层编译器剥离，不会渲染到页面上（默认 `allowDangerousHtml: false`）。

如需保留 HTML 标签渲染，可通过 `rehypePlugins` 传入 [rehype-raw](https://github.com/rehypejs/rehype-raw) 插件（自负 XSS 风险）：

</Notice>

```jsx
import { MarkdownRender } from '@chenzy-design/svelte';
import rehypeRaw from 'rehype-raw';
```

```svelte
<MarkdownRender
  format="md"
  raw={`<span style="color:red">红色文字</span>`}
  rehypePlugins={[rehypeRaw]}
/>
```

### 添加自定义组件

通过 `components` 注册自定义组件，即可在 Markdown 中渲染带 JS 事件的元素——这是本库替代 MDX 正文 JSX 的方式。默认的 Markdown 组件可从 `MarkdownRender.defaultComponents` 中获取，用于二次封装叠加自定义组件。

<Notice type="primary" title="注意事项">

注意尽量确保被渲染的 Markdown 内容可信，防止 XSS。

</Notice>

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
| remarkGfm | 是否开启 Github GFM 语法，Safari 16.3 之前不支持环视断言会报错 | boolean | true |
| remarkPlugins | 自定义 Remark Plugin | `Plugin[]` | - |
| style | 样式 | string | - |
