---
title: Typography 排版
name: typography
category: basic
brief: 文字，图片，段落，数值的基本格式。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Title from '../../demos/typography/01-title.svelte';
  import titleSrc from '../../demos/typography/01-title.svelte?raw';
  import Text from '../../demos/typography/02-text.svelte';
  import textSrc from '../../demos/typography/02-text.svelte?raw';
  import Link from '../../demos/typography/03-link.svelte';
  import linkSrc from '../../demos/typography/03-link.svelte?raw';
  import Paragraph from '../../demos/typography/04-paragraph.svelte';
  import paragraphSrc from '../../demos/typography/04-paragraph.svelte?raw';
  import Size from '../../demos/typography/05-size.svelte';
  import sizeSrc from '../../demos/typography/05-size.svelte?raw';
  import Copyable from '../../demos/typography/06-copyable.svelte';
  import copyableSrc from '../../demos/typography/06-copyable.svelte?raw';
  import Ellipsis from '../../demos/typography/07-ellipsis.svelte';
  import ellipsisSrc from '../../demos/typography/07-ellipsis.svelte?raw';
  import EllipsisWordBreak from '../../demos/typography/10-ellipsis-wordbreak.svelte';
  import ellipsisWordBreakSrc from '../../demos/typography/10-ellipsis-wordbreak.svelte?raw';
  import Numeral from '../../demos/typography/08-numeral.svelte';
  import numeralSrc from '../../demos/typography/08-numeral.svelte?raw';
  import NumeralParser from '../../demos/typography/09-numeral-parser.svelte';
  import numeralParserSrc from '../../demos/typography/09-numeral-parser.svelte?raw';
</script>

- 对文章、博客、日志等的文本内容进行展示时。
- 对文本进行复制和省略等基础操作时。

## 代码演示

### 如何引入

```jsx
import { Typography } from '@chenzy-design/svelte';
```

### 标题组件

通过设置 `heading` 可以展示不同级别的标题。

<DemoBox code={titleSrc}><Title /></DemoBox>

### 文本组件

内置不同样式的文本。可以通过 `icon` 属性传入图标，这种方式传入的图标默认与文本有间距，同时在链接文本的情况不会出现下划线符合设计规范。

<DemoBox code={textSrc}><Text /></DemoBox>

链接文本支持传入 `object`，将对应的属性挂在 `<a>` 标签上。默认不再有下划线，可以配合 `underline` 属性在 hover、active 态增加下划线的样式。

<DemoBox code={linkSrc}><Link /></DemoBox>

### 段落组件

段落组件拥有两种行距，可以通过设置 `spacing='extended'` 使用更宽松的行距。

<DemoBox code={paragraphSrc}><Paragraph /></DemoBox>

### 数值组件

Numeral 组件在 Text 组件的基础上，添加了属性：`rule`、`precision`、`truncate`、`parser`，以提供需要单独处理文本中数值的能力。

<Notice type="primary" title="注意">

Numeral 组件会递归遍历 Children 检测其中所有的数字文本进行转换展示，请注意控制渲染结构层级；

对于 `rule` 为 `percentages` 的 Numeral 组件，结果统一为 `(num*100)%`。

</Notice>

`precision` 可以设置小数点后保留位数，用于设置精度。
`truncate` 小数点后保留位截段取整方式，可选 `ceil`、`floor`、`round`，作用与 Math.ceil、Math.floor、Math.round 对齐。
`rule` 用于设置解析规则：

- 设为 `percentages` 会将数字自动转换为百分比形式展示；
- 设为 `bytes-decimal` 会将数字自动换算为字节对应的单位展示，1 KB 定义为等于 1000 字节（B, KB, MB, GB, TB, PB, EB, ZB, YB）；
- 设为 `bytes-binary` 会将数字自动换算为字节对应的单位展示，1 KiB 定义为等于 1024 字节（B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB）；
- 设为 `text` 时，仅自动对数字进行取整，根据 `precision` 和 `truncate` 属性；
- 设为 `numbers` 时，会将非数字字符进行过滤，仅展示数字；
- 设为 `exponential` 时，会将数字自动转换为科学计数法形式展示。

<DemoBox code={numeralSrc}><Numeral /></DemoBox>

可以通过 `parser` 自定义解析规则。

<DemoBox code={numeralParserSrc}><NumeralParser /></DemoBox>

### 文本大小

段落组件和文本组件支持三种尺寸，`small`（12px）、`normal`（14px）和 `inherit`，默认为 `normal`。

当段落组件或者文本组件嵌套使用时候，设置内层组件的 `size` 属性为 `inherit`，内层组件的 size 将继承外层组件的尺寸设置。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 可复制文本

可通过配置 `copyable` 属性支持文本的复制。
当 `copyable` 配置为 `true` 时，默认复制内容为 children 本身，注意，此时 children 只支持 string 类型传入。
当 `copyable` 配置为 object 时，可通过 `copyable.content` 指定复制至粘贴板的内容，与 children 不再强关联，此时 children 将不再限定类型，但 `copyable.content` 仍需要为 string。
可以通过 `copyable.render` 属性，自定义复制按钮的渲染逻辑。

<DemoBox code={copyableSrc}><Copyable /></DemoBox>

### 省略文本

支持文本的省略，可以通过 `ellipsis` 配置相关参数，具体参考 [Ellipsis Config](#ellipsis-config)。

<Notice title="注意事项">

1. ellipsis 仅支持纯文本的截断，不支持复杂类型，请确保 children 传入内容类型为 string。
2. ellipsis 要实现缩略，需要有明确的 width 或 maxWidth 宽度限制做对比判断。若自身未设置宽度（例如纯依靠 flex 属性撑开），或 width 为 100% 等不定数值，那么父级需要有明确的 width 或 maxWidth。
3. ellipsis 需要获取 DOM 的宽高度等信息用以做基本判断，若自身或父级存在 `display:none` 样式会导致取值不正确，此时缩略会失效。
4. 省略文本的计算，分为 CSS 截断和 JS 截断，强依赖 DOM 元素的相关状态获取。在结构复杂的页面，大量使用 Typography 可能会导致过多的 reflow 重排，建议选择合适的省略方式避免造成性能负担。更多信息见 [FAQ](#faq)。

</Notice>

<DemoBox code={ellipsisSrc}><Ellipsis /></DemoBox>

<Notice type="primary" title="注意事项">

当发生超长文本在弹出的 tooltip 没有换行时，可通过手动设置一下 [word-break](https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-break) 或者 word-wrap 等换行相关属性进行调整，更多细节可查看 Tooltip 的 FAQ 部分。

</Notice>

<DemoBox code={ellipsisWordBreakSrc}><EllipsisWordBreak /></DemoBox>

## API 参考

### Typography.Text

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 是否被 `code` 元素包裹 | boolean | - |
| component | 自定义渲染元素 | string | `span` |
| copyable | 是否可拷贝 | boolean \| object:[Copyable Config](#copyable-config) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 设置自动溢出省略 | boolean \| object:[Ellipsis Config](#ellipsis-config) | false |
| icon | 前缀图标 | Snippet | - |
| link | 是否为链接，传 object 时属性将透传给 a 标签 | boolean \| object | false |
| mark | 添加标记样式 | boolean | false |
| size | 文本大小，可选 `normal`、`small`、`inherit` | string | `normal` |
| strong | 是否加粗 | boolean | false |
| type | 文本类型，可选 `primary`、`secondary`、`tertiary`、`quaternary`、`warning`、`danger`、`success` | string | `primary` |
| underline | 添加下划线样式 | boolean | false |
| weight | 设置字重 | number | - |
| onExpand | 展开/收起的回调 | `(expanded: boolean, e: MouseEvent) => void` | - |

### Typography.Title

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| component | 自定义渲染元素，默认由 heading 决定 | string | h1~h6 |
| copyable | 是否可拷贝 | boolean \| object:[Copyable Config](#copyable-config) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 设置自动溢出省略 | boolean \| object:[Ellipsis Config](#ellipsis-config) | false |
| heading | 标题级别，可选 1、2、3、4、5、6，对应相应的标题 | number | 1 |
| link | 是否为链接，传 object 时属性将透传给 a 标签 | boolean \| object | false |
| mark | 添加标记样式 | boolean | false |
| type | 文本类型，可选 `primary`、`secondary`、`tertiary`、`quaternary`、`warning`、`danger`、`success` | string | `primary` |
| underline | 添加下划线样式 | boolean | false |
| weight | 设置字重，可选 `light`、`regular`、`medium`、`semibold`、`bold`、`default` 或数字 | string \| number | - |

### Typography.Paragraph

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 是否被 `code` 元素包裹 | boolean | - |
| component | 自定义渲染元素 | string | `p` |
| copyable | 是否可拷贝 | boolean \| object:[Copyable Config](#copyable-config) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 设置自动溢出省略 | boolean \| object:[Ellipsis Config](#ellipsis-config) | false |
| link | 是否为链接，传 object 时属性将透传给 a 标签 | boolean \| object | false |
| mark | 添加标记样式 | boolean | false |
| size | 文本大小，可选 `normal`、`small` | string | `normal` |
| spacing | 行距大小，可选 `normal`、`extended` | string | `normal` |
| strong | 是否加粗 | boolean | false |
| type | 文本类型，可选 `primary`、`secondary`、`tertiary`、`quaternary`、`warning`、`danger`、`success` | string | `primary` |
| underline | 添加下划线样式 | boolean | false |

### Typography.Numeral

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| rule | 解析规则，可选 `text`、`numbers`、`bytes-decimal`、`bytes-binary`、`percentages`、`exponential` | string | `text` |
| precision | 可以设置小数点后保留位数，用于设置精度 | number | 0 |
| truncate | 小数点后保留位截段取整方式，可选 `ceil`、`floor`、`round` | string | `round` |
| parser | 自定义数值解析函数 | `(str: string) => string` | - |
| component | 自定义渲染元素 | string | `span` |
| code | 是否被 `code` 元素包裹 | boolean | - |
| copyable | 是否可拷贝 | boolean \| object:[Copyable Config](#copyable-config) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 设置自动溢出省略 | boolean \| object:[Ellipsis Config](#ellipsis-config) | false |
| icon | 前缀图标 | Snippet | - |
| link | 是否为链接，传 object 时属性将透传给 a 标签 | boolean \| object | false |
| mark | 添加标记样式 | boolean | false |
| size | 文本大小，可选 `normal`、`small` | string | `normal` |
| strong | 是否加粗 | boolean | false |
| type | 文本类型，可选 `primary`、`secondary`、`tertiary`、`quaternary`、`warning`、`danger`、`success` | string | `primary` |
| underline | 添加下划线样式 | boolean | false |

### Ellipsis Config

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| collapseText | 折叠的展示文本 | string | `收起` |
| collapsible | 是否支持折叠 | boolean | false |
| expandText | 展开的展示文本 | string | `展开` |
| expandable | 是否支持展开 | boolean | false |
| pos | 省略截断的位置，支持末尾和中间截断：`end`、`middle` | string | `end` |
| rows | 省略溢出行数 | number | 1 |
| showTooltip | 是否展示 tooltip 及相关配置：`type`（浮层承载组件，支持 `tooltip` \| `popover`）；`opts`（透传给浮层组件的属性）；`renderTooltip`（自定义渲染弹出层） | boolean \| object | false |
| suffix | 始终展示的后缀 | string | - |
| onExpand | 展开/收起的回调 | `(expanded: boolean, e: MouseEvent) => void` | - |

### Copyable Config

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 复制出的文本 | string | - |
| copyTip | 复制图标的 tooltip 展示内容 | Snippet \| string | - |
| icon | 自定义渲染复制节点 | Snippet | - |
| onCopy | 复制回调 | `(e: MouseEvent, content: string, res: boolean) => void` | - |
| render | 自定义渲染复制节点 | `(copied: boolean, doCopy: (e: MouseEvent) => void, config: CopyableConfig) => Snippet` | - |
| successTip | 复制成功的展示内容 | Snippet \| string | - |

## 文案规范

- Link
  - 文字链接需要清晰且可预测，用户应该能够预测他们点击链接时会发生什么。
  - 切勿通过错误标记链接来误导用户。
  - 避免使用「Click here」或「Here」作为独立链接。
- 避免将整个句子作为可点击的文字链接，而是将描述具体去向的文字作为链接内容。
- 使用短术语或词作为链接文本会更有利于国际化，以避免由于不同的语言的语法和语序不同，而出现链接文字被拆分的问题。
- 以文字链接结尾时，不需要跟随标点符号，除了问号「？」。
- 链接文字不要包含冠词「the、a、an」。

## FAQ

- **Typography 省略具体机制及注意事项？**

  截断有两种策略：CSS 截断和 JS 截断。当设置中间截断（`pos='middle'`）、可展开（`expandable`）、有后缀（`suffix` 非空）、可复制（`copyable`），启用 JS 截断策略；非以上场景，启用 CSS 截断策略。

  通常来说，CSS 截断性能优于 JS 截断。在 children、容器尺寸不变的情况下，CSS 截断只涉及 1~2 次计算，JS 截断可能涉及多次计算。

  同时使用大量带有截断功能的 Typography 需注意性能消耗，如在 Table 中，可通过设置合理的页容量进行分页减少性能损耗。
