---
title: Card 卡片
name: card
category: show
brief: 常规的卡片容器，可以承载标题、段落、图片、列表等内容。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/card/01-basic.svelte';
  import basicSrc from '../../demos/card/01-basic.svelte?raw';
  import Simple from '../../demos/card/02-simple.svelte';
  import simpleSrc from '../../demos/card/02-simple.svelte?raw';
  import Cover from '../../demos/card/03-cover.svelte';
  import coverSrc from '../../demos/card/03-cover.svelte?raw';
  import Border from '../../demos/card/04-border.svelte';
  import borderSrc from '../../demos/card/04-border.svelte?raw';
  import Shadow from '../../demos/card/05-shadow.svelte';
  import shadowSrc from '../../demos/card/05-shadow.svelte?raw';
  import Meta from '../../demos/card/06-meta.svelte';
  import metaSrc from '../../demos/card/06-meta.svelte?raw';
  import Inner from '../../demos/card/07-inner.svelte';
  import innerSrc from '../../demos/card/07-inner.svelte?raw';
  import InGrid from '../../demos/card/08-in-grid.svelte';
  import inGridSrc from '../../demos/card/08-in-grid.svelte?raw';
  import Loading from '../../demos/card/09-loading.svelte';
  import loadingSrc from '../../demos/card/09-loading.svelte?raw';
  import SkeletonDemo from '../../demos/card/10-skeleton.svelte';
  import skeletonSrc from '../../demos/card/10-skeleton.svelte?raw';
  import TabsDemo from '../../demos/card/11-tabs.svelte';
  import tabsSrc from '../../demos/card/11-tabs.svelte?raw';
  import Actions from '../../demos/card/12-actions.svelte';
  import actionsSrc from '../../demos/card/12-actions.svelte?raw';
  import Group from '../../demos/card/13-group.svelte';
  import groupSrc from '../../demos/card/13-group.svelte?raw';
  import GridGroup from '../../demos/card/14-grid-group.svelte';
  import gridGroupSrc from '../../demos/card/14-grid-group.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Card, CardGroup } from '@chenzy-design/svelte';
```

### 基础卡片

基础卡片包含标题、内容等部分。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 简洁卡片

卡片可以只设置内容区域。

<DemoBox code={simpleSrc}><Simple /></DemoBox>

### 封面

可以使用 `cover` 属性设置封面。

<DemoBox code={coverSrc}><Cover /></DemoBox>

### 边线和外边框

可以使用 `bordered` 设置卡片是否有外边框，默认为 true 。同时，也可以使用 `headerLine` 设置内容区和标题区是否有边线， `footerLine` 设置内容区和页尾区是否有边线。

<DemoBox code={borderSrc}><Border /></DemoBox>

### 阴影

可以使用 `shadows` 设置显示阴影的时机，可选值为: `hover`（hover 时显示阴影）、`always`（始终显示阴影），如果不设置该属性则没有阴影。

<DemoBox code={shadowSrc}><Shadow /></DemoBox>

### 更灵活的内容展示

可以利用 `Card.Meta` 支持更灵活的内容，允许设置 `title`、`avatar`、`description`。

<DemoBox code={metaSrc}><Meta /></DemoBox>

### 内部卡片

卡片内部可以嵌套其他卡片。

<DemoBox code={innerSrc}><Inner /></DemoBox>

### 栅格卡片

在系统概览页面常常和栅格进行配合。

<DemoBox code={inGridSrc}><InGrid /></DemoBox>

### 内置预加载

可以使用 `Card` 的 `loading` 属性来设置卡片内容区是否显示占位元素，当它为 true 时将显示占位元素，反之则不显示。

<DemoBox code={loadingSrc}><Loading /></DemoBox>

### 更丰富的预加载效果

`Card` 自带的 `loading` 属性只能设置内容区的预加载效果，如果你想要设置其他部分的预加载，或者自定义更丰富的预加载效果，你可以结合 Skeleton 组件来实现。

<DemoBox code={skeletonSrc}><SkeletonDemo /></DemoBox>

### 带页签的卡片

可以结合 Tabs 组件，实现带页签的卡片。

<DemoBox code={tabsSrc}><TabsDemo /></DemoBox>

### 卡片操作区

`actions` 以 12px 的水平间距展示于内容区底部；本库以 snippet 承载（对齐 Semi 的 ReactNode 数组），snippet 内的多个子元素逐项排布。

<DemoBox code={actionsSrc}><Actions /></DemoBox>

### 卡片组

`CardGroup` 中的卡片将呈现为等间距排列，利用 `spacing` 属性可以设置卡片间距大小。

<DemoBox code={groupSrc}><Group /></DemoBox>

### 网格型卡片组

使用 `CardGroup` 的 `type` 属性，可以将卡片组设置为网格型。

<DemoBox code={gridGroupSrc}><GridGroup /></DemoBox>

## API 参考

**Card**

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| actions | 卡片操作组，位于卡片内容区的底部，snippet 内多个子元素以 12px 水平间距排布 | Snippet | - |
| ariaLabel | 根节点 aria-label，表述该 Card 的作用 | string | - |
| bodyStyle | 卡片内容区内联样式 | string | - |
| bordered | 是否设置卡片的外边框 | boolean | true |
| class | 卡片的样式类名 | string | - |
| cover | 卡片封面 | Snippet | - |
| headerExtraContent | 卡片标题右侧的额外内容 | Snippet | - |
| footer | 自定义卡片页脚 | Snippet | - |
| footerLine | 卡片页脚区与内容区是否有边线 | boolean | false |
| footerStyle | 卡片页脚区内联样式 | string | - |
| header | 自定义卡片头部，若传入将覆盖 `title` 和 `headerExtraContent` | Snippet | - |
| headerLine | 卡片标题区与内容区是否有边线 | boolean | true |
| headerStyle | 卡片标题区内联样式 | string | - |
| loading | 是否设置加载时的占位 | boolean | false |
| shadows | 设置显示阴影的时机，如果不设置该属性则没有阴影，可选值：`hover`、`always` | string | - |
| style | 卡片内联样式 | string | - |
| title | 卡片标题 | string \| Snippet | - |

**CardGroup**

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 卡片组的样式类名 | string | - |
| spacing | 间距尺寸，支持数值或数组，数组形如: `[水平间距, 垂直间距]` | number \| number[] | 16 |
| style | 卡片组的内联样式 | string | - |
| type | 可以把卡片组设置为网格型，设置完该属性后将覆盖 `spacing` 属性，可选值：`grid` | string | - |

**Card.Meta**

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar | 头像 | Snippet | - |
| class | 类名 | string | - |
| description | 描述 | string \| Snippet | - |
| style | 内联样式 | string | - |
| title | 标题 | string \| Snippet | - |

## Accessibility

- Card 支持传入 `ariaLabel` 来表示该 Card 作用
- Card loading 时，将开启 `aria-busy`
- Card 为容器型组件，卡片内部的任何元素需要遵循各自的可访问性指南

## 文案规范

- 卡片标题
  - 卡片标题应具有信息描述性，聚焦最重要的信息
  - 尽量将标题限制在 1 个短语或句段中
  - 卡片标题应句子大小写书写
  - 不要以标点符号结尾（除了问号）
- 正文
  - 可操作的：使用祈使句而不是"你可以"来描述正文，可以更好的告诉用户可以做什么

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Get order progress for details | You can get order progress for details |

- 总是优先说最重要的信息
- 使用 "Need to"而不是"must"
