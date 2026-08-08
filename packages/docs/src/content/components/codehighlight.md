---
title: CodeHighlight 代码高亮
name: codehighlight
category: plus
brief: 根据语法高亮页面中的代码块
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/code-highlight/01-basic.svelte';
  import basicSrc from '../../demos/code-highlight/01-basic.svelte?raw';
  import BasicCss from '../../demos/code-highlight/02-basic-css.svelte';
  import basicCssSrc from '../../demos/code-highlight/02-basic-css.svelte?raw';
  import OtherLanguage from '../../demos/code-highlight/03-other-language.svelte';
  import otherLanguageSrc from '../../demos/code-highlight/03-other-language.svelte?raw';
  import CustomTheme from '../../demos/code-highlight/04-custom-theme.svelte';
  import customThemeSrc from '../../demos/code-highlight/04-custom-theme.svelte?raw';
</script>

## 使用场景

代码高亮组件基于 prismjs 封装，支持 297 种编程语言的高亮（已自动配置 `JavaScript` `CSS` `类 C` `html` `svg` 等，其他语言需要手动引入），同时具有高扩展性和丰富的插件生态。
需要展示代码片段时推荐使用 CodeHighlight 组件

## 代码演示

### 如何引入

```jsx
import { CodeHighlight } from '@chenzy-design/svelte';
```

### 基本用法

向 `code` props 传入代码纯文本，并在 `language` 传入编程语言名称。支持的编程语言和对应名称在 [Prismjs 官网](https://prismjs.com/#supported-languages) 查看

<DemoBox code={basicSrc}><Basic /></DemoBox>

**CSS**

<DemoBox code={basicCssSrc}><BasicCss /></DemoBox>

### 支持其他语言

支持 297 种语言，除去 `JavaScript` `CSS` `类 C` `html` `svg` 外，支持其他语言需要手动引入配置。

例如，高亮用于编写 GTK 程序前端 UI 的 Vala 语言，需要引入 `prism-vala.js`

```javascript
import 'prismjs/components/prism-vala.js';
```

<DemoBox code={otherLanguageSrc}><OtherLanguage /></DemoBox>

### 自定义主题

设置 `defaultTheme={false}` 关闭默认主题，然后手动将需要的主题的 css 文件拷贝并放入项目中引入即可。
一些主题可在 node_modules 内 prismjs/themes 下找到，你也可以在网上搜索其他中意的主题。

> Semi 该章节只有文字说明、无示例；本库补一个示例展示关闭默认主题后的效果（未引入替代主题时，
> 代码按正文默认色渲染，不再有内置配色），便于对照上方各示例。

<DemoBox code={customThemeSrc}><CustomTheme /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| code | 代码纯文本 | string | - |
| defaultTheme | 是否使用默认主题，添加自己的主题时设置 false | boolean | true |
| language | 语言类型 | string | `markup` |
| lineNumber | 是否开启行数显示 | boolean | true |
| style | 样式 | string | - |
