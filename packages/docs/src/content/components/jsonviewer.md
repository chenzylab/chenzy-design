---
title: JsonViewer JSON 编辑器
name: jsonviewer
category: plus
brief: 用于展示和编辑 JSON 数据。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/json-viewer/01-basic.svelte';
  import basicSrc from '../../demos/json-viewer/01-basic.svelte?raw';
  import LineHeight from '../../demos/json-viewer/04-line-height.svelte';
  import lineHeightSrc from '../../demos/json-viewer/04-line-height.svelte?raw';
  import AutoWrap from '../../demos/json-viewer/05-auto-wrap.svelte';
  import autoWrapSrc from '../../demos/json-viewer/05-auto-wrap.svelte?raw';
  import Format from '../../demos/json-viewer/03-format.svelte';
  import formatSrc from '../../demos/json-viewer/03-format.svelte?raw';
  import CustomRender from '../../demos/json-viewer/06-custom-render.svelte';
  import customRenderSrc from '../../demos/json-viewer/06-custom-render.svelte?raw';
  import CustomSearchButton from '../../demos/json-viewer/07-custom-search-button.svelte';
  import customSearchButtonSrc from '../../demos/json-viewer/07-custom-search-button.svelte?raw';
</script>

## 使用场景

JsonViewer 组件可用于 JSON 数据的展示与编辑。底层参考了 VS Code 的 text-buffer 数据结构设计思路，结合功能/样式定制需求实现，视觉上与设计体系内其他组件更协调，对特定数据类型的定制化渲染更方便。相比直接使用 MonacoEditor，JsonViewer 仅关注 JSON 数据格式，更轻量、加载更快、内存占用更少，开箱即用无需关注复杂的构建配置。

- 如果你仅需要对 JSON 做预览/编辑，无需对更复杂的其他编程语言作修改，建议选用 JsonViewer。
- 如果你还需要处理其他格式的数据/代码文件，完整的代码编辑器能力（语法高亮、代码补全、错误提示、复杂编辑等）是刚需，构建产物体积不是关注重点，建议选用 Monaco Editor。

## 代码演示

### 如何引入

```jsx
import { JsonViewer } from '@chenzy-design/svelte';
```

### 基本用法

JsonViewer 的基本用法。传入 `height` 和 `width` 参数设置组件的高度和宽度，通过 `value` 传入 JSON 字符串。

<Notice title="注意">

JsonViewer 为非受控组件，`value` 仅用于初始化，后续内容变化不会因 `value` 改变而重建。若需获取组件的值，可通过 `bind:this` 拿到实例后调用方法，具体参考 [Methods](#methods)。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 设置行高

配置 `options` 的 `lineHeight` 参数，设置固定行高（单位：px，默认 18）。

<DemoBox code={lineHeightSrc}><LineHeight /></DemoBox>

### 自动换行

配置 `options` 的 `autoWrap` 参数，设置为 `true` 时，组件会根据内容长度自动换行。

<DemoBox code={autoWrapSrc}><AutoWrap /></DemoBox>

### 格式化配置

配置 `options` 的 `formatOptions` 参数，设置组件的格式化配置。

- `tabSize`：number，设置缩进大小为 4，表示每级缩进 4 个空格
- `insertSpaces`：boolean，`true` 表示使用空格进行缩进，`false` 表示使用制表符（Tab）
- `eol`：string，设置换行符，可以是 `\n`、`\r\n`

<DemoBox code={formatSrc}><Format /></DemoBox>

### 自定义渲染规则

通过配置 `options.customRenderRule` 参数，你可以自定义 JSON 内容的渲染方式（注意：仅在只读模式下生效）。

<Notice type="primary" title="技术差异">

Semi 的 `render` 返回 React 节点；本库 core 契约要求 `render` 返回 `HTMLElement`。因此本库示例用 Svelte 的命令式 `mount()` 把真实组件（Popover / Rating / Tag / Image）挂到返回的 DOM 上，视觉与交互与 Semi 等效。

</Notice>

`customRenderRule` 是一个规则数组，每条规则包含两个属性：

- `match`：匹配条件，可以是以下三种类型之一：
  - 字符串：精确匹配
  - 正则表达式：按正则匹配
  - 函数：自定义匹配逻辑，函数签名为 `(value, path, tokenType) => boolean`
    - `value`：待匹配的值（JSON 键或值），会尽量传入解析后的原始类型（number / boolean / null / string）
    - `path`：当前匹配到的路径，格式为 `root.key1.key2.key3[0].key4`
    - `tokenType`：当前 token 的类型，`'key'` 表示 JSON 键名，`'value'` 表示 JSON 值
- `render`：自定义渲染函数，函数签名为 `(content: string) => HTMLElement`
  - `content`：匹配到的内容。如果是字符串类型的值，将包含双引号（如 `"name"`、`"Semi"`）

<DemoBox code={customRenderSrc}><CustomRender /></DemoBox>

### 自定义搜索按钮

通过 `renderSearchButton` 属性，你可以自定义搜索按钮的渲染方式，实现固定位置、自定义样式等需求。

<DemoBox code={customSearchButtonSrc}><CustomSearchButton /></DemoBox>

## API 参考

### JsonViewer

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 展示内容 | string | - |
| height | 高度 | number \| string | - |
| width | 宽度 | number \| string | - |
| class | 类名 | string | - |
| style | 内联样式 | string | - |
| showSearch | 是否显示搜索 Icon | boolean | true |
| renderSearchButton | 自定义渲染搜索按钮 | `Snippet<[Snippet, SearchControls]>` | - |
| options | 编辑器配置 | JsonViewerOptions | - |
| onChange | 内容变化回调 | `(value: string) => void` | - |
| onCustomRender | 只读模式命中 customRenderRule 时透出 customRenderMap | `(map: Map<HTMLElement, unknown>) => void` | - |

### JsonViewerOptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| lineHeight | 行高 | number | 20 |
| autoWrap | 是否自动换行 | boolean | true |
| readOnly | 是否只读 | boolean | false |
| customRenderRule | 自定义渲染规则 | CustomRenderRule[] | - |
| formatOptions | 格式化配置 | FormattingOptions | - |

### CustomRenderRule

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| match | 匹配规则 | `string \| RegExp \| (value, path, tokenType) => boolean` | - |
| render | 渲染函数 | `(content: string) => HTMLElement` | - |

### FormattingOptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tabSize | 缩进大小 | number | 4 |
| insertSpaces | 是否使用空格进行缩进 | boolean | true |
| eol | 换行符 | string | `\n` |

### SearchControls

当使用 `renderSearchButton` 时，第二个参数 `controls` 包含以下属性：

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| showSearchBar | 当前是否显示搜索栏 | boolean |
| onToggleSearchBar | 切换搜索栏显示/隐藏 | `() => void` |
| onSearch | 执行搜索 | `(text: string, caseSensitive?: boolean, wholeWord?: boolean, regex?: boolean) => void` |
| onPrevSearch | 跳转到上一个搜索结果 | `() => void` |
| onNextSearch | 跳转到下一个搜索结果 | `() => void` |
| onReplace | 替换当前搜索结果 | `(text: string) => void` |
| onReplaceAll | 替换所有搜索结果 | `(text: string) => void` |

## Methods

可以通过 `bind:this` 拿到组件实例，调用其上绑定的方法，实现某些特殊交互。

| 名称 | 描述 |
| --- | --- |
| getValue() | 获取当前值 |
| format() | 格式化当前内容 |
| search(searchText, caseSensitive?, wholeWord?, regex?) | 搜索文本，可选参数控制大小写敏感、全词匹配和正则表达式 |
| getSearchResults() | 获取当前搜索结果 |
| prevSearch(step?) | 导航到上一个搜索结果，可选步长参数 |
| nextSearch(step?) | 导航到下一个搜索结果，可选步长参数 |
| replace(replaceText) | 替换当前搜索匹配项 |
| replaceAll(replaceText) | 替换所有搜索匹配项 |
