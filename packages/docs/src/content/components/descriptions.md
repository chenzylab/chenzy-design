---
title: Descriptions 描述列表
name: descriptions
category: show
brief: 描述列表用于键值对的呈现。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/descriptions/01-basic.svelte';
  import basicSrc from '../../demos/descriptions/01-basic.svelte?raw';
  import Align from '../../demos/descriptions/02-align.svelte';
  import alignSrc from '../../demos/descriptions/02-align.svelte?raw';
  import Jsx from '../../demos/descriptions/03-jsx.svelte';
  import jsxSrc from '../../demos/descriptions/03-jsx.svelte?raw';
  import LayoutVertical from '../../demos/descriptions/04-layout-vertical.svelte';
  import layoutVerticalSrc from '../../demos/descriptions/04-layout-vertical.svelte?raw';
  import LayoutHorizontal from '../../demos/descriptions/05-layout-horizontal.svelte';
  import layoutHorizontalSrc from '../../demos/descriptions/05-layout-horizontal.svelte?raw';
  import Double from '../../demos/descriptions/06-double.svelte';
  import doubleSrc from '../../demos/descriptions/06-double.svelte?raw';
  import KeyStyle from '../../demos/descriptions/07-keystyle.svelte';
  import keyStyleSrc from '../../demos/descriptions/07-keystyle.svelte?raw';
  import KeyStyleJsx from '../../demos/descriptions/08-keystyle-jsx.svelte';
  import keyStyleJsxSrc from '../../demos/descriptions/08-keystyle-jsx.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Descriptions } from '@chenzy-design/svelte';
```

### 基本用法

可以通过 `props.data` 以键值对 `{ key: value }` 数组方式传入数据
value 支持字符串或 Snippet 类型，你可以传入字符串或更高自由度的 Snippet 自由定制渲染效果

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 设置对齐方式

可以通过设置 `align` 值选择对齐方式，支持 `center`, `justify`, `left`, 和 `plain`。默认对齐方式为 `center`
当 row 为 true 时，该配置无效

<DemoBox code={alignSrc}><Align /></DemoBox>

### 声明式写法

除了通过 props.data 声明数据外，还可以通过 children 声明式写法声明数据
注意 `Descriptions.Item` 应当是 `Descriptions` 的直接子元素。

<DemoBox code={jsxSrc}><Jsx /></DemoBox>

### 设置布局模式

可以通过 `layout` 设置布局模式, 默认为 `vertical` 纵向布局 。

<DemoBox code={layoutVerticalSrc}><LayoutVertical /></DemoBox>

横向布局可设置 layout为 `horizontal` 。当设置 horizontal 时，可配合 column 指定每行最大列数

<DemoBox code={layoutHorizontalSrc}><LayoutHorizontal /></DemoBox>

### 双行显示

可以通过设置 `row` 可选择双行显示，支持三种不同的大小：`small`, `medium`, `large`。默认大小为 `medium`，此时 align 配置不再生效

<DemoBox code={doubleSrc}><Double /></DemoBox>

### 自定义 Key 样式

可以通过 `keyStyle` 属性自定义 key 的样式，例如设置固定宽度实现对齐效果。该属性支持所有 CSS 样式，如 `width`、`maxWidth`、`textAlign`、`color` 等。

<DemoBox code={keyStyleSrc}><KeyStyle /></DemoBox>

也可以配合声明式写法使用：

<DemoBox code={keyStyleJsxSrc}><KeyStyleJsx /></DemoBox>

## API 参考

### Descriptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 描述列表的对齐方式，可选 `center`、 `justify`、 `left`、 `plain` | string | `center` |
| class | 类名 | string | 无 |
| column | `horizontal` 横向布局下，每行的总列数 | number | 3 |
| data | 列表显示的内容 | DataItem[] | 无 |
| layout | 列表布局模式，可选 `vertical`、`horizontal` | string | `vertical` |
| row | 是否双行显示 | boolean | `false` |
| size | 设置双行显示时的列表的大小，可选 `small`、 `medium`、 `large` | string | `medium` |
| style | 列表的样式 | string | 无 |

### DataItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 键值 | string | - |
| value | 属性值 | string \| number \| Snippet | - |
| hidden | 该数据是否需要展示 | boolean | - |
| span | 单元格应跨越的列数 | number | 1 |
| keyStyle | key 的自定义样式，可用于设置宽度、对齐方式等 | string | - |

### Descriptions.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| itemKey | 键值 | string | - |
| hidden | 该数据是否需要展示 | boolean | - |
| class | Item 外部 wrapper: tr 的类名 | string | - |
| style | Item 外部 wrapper: tr 的内联样式 | string | - |
| span | 单元格应跨越的列数 | number | 1 |
| keyStyle | key 的自定义样式，可用于设置宽度、对齐方式等 | string | - |

## Accessibility

- 使用 `<table>` 语义结构承载键值对，key 渲染为 `<th>`、value 渲染为 `<td>`（`plain`/横向布局下 key 与 value 同排为单个 `<td>`）。
- `plain` 及横向布局下 key 后附内联冒号，屏幕阅读器可自然感知字段与值的对应关系。
- `hidden` 为 `true` 的数据项不渲染，不进入无障碍树。
- Descriptions 为纯展示组件，无键盘交互需求，不设置 `tabindex`，不进入 Tab 序列。

## 文案规范

- 字段名和值都按 Sentence case 原则书写大小写
