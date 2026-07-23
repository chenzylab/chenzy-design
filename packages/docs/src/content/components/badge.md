---
title: Badge 徽章
name: badge
category: show
brief: 用徽章来给用户提示。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/badge/01-basic.svelte';
  import basicSrc from '../../demos/badge/01-basic.svelte?raw';
  import Overflow from '../../demos/badge/02-overflow.svelte';
  import overflowSrc from '../../demos/badge/02-overflow.svelte?raw';
  import Position from '../../demos/badge/03-position.svelte';
  import positionSrc from '../../demos/badge/03-position.svelte?raw';
  import Theme from '../../demos/badge/04-theme.svelte';
  import themeSrc from '../../demos/badge/04-theme.svelte?raw';
  import Type from '../../demos/badge/05-type.svelte';
  import typeSrc from '../../demos/badge/05-type.svelte?raw';
  import Standalone from '../../demos/badge/06-standalone.svelte';
  import standaloneSrc from '../../demos/badge/06-standalone.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Badge } from '@chenzy-design/svelte';
```

### 基本用法

Badge 的基本类型为 `count`。如果传入 `dot` 则显示为小圆点，两者互斥，优先渲染小圆点。当传入是节点类型（snippet）时，将直接渲染该节点。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 设置显示数字最大值

可以通过设置 `overflowCount` 值设置显示数字的最大值，当实际数值超过该值时将以 `${overflowCount}+` 的格式显示。

<DemoBox code={overflowSrc}><Overflow /></DemoBox>

### 设置徽标位置

可以通过设置 `position` 设置位置，支持：`leftTop`， `leftBottom`， `rightTop`（默认）， `rightBottom`。

<DemoBox code={positionSrc}><Position /></DemoBox>

### 设置徽标样式

可以通过设置 `theme` 和 `type` 设置徽标的样式。其中 `theme` 支持三种形式：`solid`, `light`, `inverted`。默认形式为 `solid`。

<DemoBox code={themeSrc}><Theme /></DemoBox>

`type` 支持如下类型：`primary`，`secondary`，`tertiary`，`warning` 和 `danger`。默认类型为 `primary`。

<DemoBox code={typeSrc}><Type /></DemoBox>

### 独立使用

当 Badge 作为独立元素时可以单独使用。

<DemoBox code={standaloneSrc}><Standalone /></DemoBox>

## API参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 徽章的 base | Snippet | 无 |
| class | 外侧 class | string | - |
| count | 展示的内容 | number \| string \| Snippet | 无 |
| countClass | 内容区域 class | string | 无 |
| countStyle | 徽章内容的样式 | string | 无 |
| dot | 不展示数字，显示小圆点 | boolean | false |
| overflowCount | 最大的展示数字值 | number | 无 |
| position | 徽章位置，可选 `leftTop`、 `leftBottom`、 `rightTop`、 `rightBottom` | string | `rightTop` |
| style | 徽章内容区域内联样式（优先于 countStyle） | string | 无 |
| theme | 徽章主题，可选 `solid`、 `light`、 `inverted` | string | `solid` |
| type | 徽章类型，可选 `primary`、 `secondary`、 `tertiary`、 `danger`、 `warning`、 `success` | string | `primary` |
| onClick | 点击事件 | (e: MouseEvent) => void | 无 |
| onMouseEnter | 鼠标移入事件 | (e: MouseEvent) => void | 无 |
| onMouseLeave | 鼠标移出事件 | (e: MouseEvent) => void | 无 |

## Accessibility

- Badge 本身为非交互纯展示元素，不需要 `tabindex`，不进入 Tab 序列。
- 数字/字符串徽标以文本形式渲染，可被屏幕阅读器读出；宿主元素可通过 `aria-describedby` 关联徽标内容。
- 纯红点（dot）无数值语义，其含义应由宿主元素的文案承载；独立使用时建议在相邻文字中给出状态说明。
- 不以颜色为唯一信息通道，需同时通过文案或图标区分语义。

## 文案规范

- Badge内容若为英文时，首字母应大写
