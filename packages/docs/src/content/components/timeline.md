---
title: Timeline 时间轴
name: timeline
category: show
brief: 时间轴是用于对一系列信息进行时间排序时，垂直展示的组件。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/timeline/01-basic.svelte';
  import basicSrc from '../../demos/timeline/01-basic.svelte?raw';
  import Type from '../../demos/timeline/02-type.svelte';
  import typeSrc from '../../demos/timeline/02-type.svelte?raw';
  import CustomNode from '../../demos/timeline/03-custom-node.svelte';
  import customNodeSrc from '../../demos/timeline/03-custom-node.svelte?raw';
  import ModeLeft from '../../demos/timeline/04-mode-left.svelte';
  import modeLeftSrc from '../../demos/timeline/04-mode-left.svelte?raw';
  import ModeCenter from '../../demos/timeline/05-mode-center.svelte';
  import modeCenterSrc from '../../demos/timeline/05-mode-center.svelte?raw';
  import ModeAlternate from '../../demos/timeline/06-mode-alternate.svelte';
  import modeAlternateSrc from '../../demos/timeline/06-mode-alternate.svelte?raw';
  import ModeRight from '../../demos/timeline/07-mode-right.svelte';
  import modeRightSrc from '../../demos/timeline/07-mode-right.svelte?raw';
  import DataSource from '../../demos/timeline/08-datasource.svelte';
  import dataSourceSrc from '../../demos/timeline/08-datasource.svelte?raw';
  import Clickable from '../../demos/timeline/09-clickable.svelte';
  import clickableSrc from '../../demos/timeline/09-clickable.svelte?raw';
  import AriaLabel from '../../demos/timeline/10-aria-label.svelte';
  import ariaLabelSrc from '../../demos/timeline/10-aria-label.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Timeline } from '@chenzy-design/svelte';
```

### 基本用法

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 节点类型

通过 type 可以设置节点类型，对应原点会变成相应的颜色，可选：`default`，`ongoing`， `success`， `warning`， `error`。

<DemoBox code={typeSrc}><Type /></DemoBox>

### 自定义节点

可以通过 `dot` 自定义图标，`color` 自定义圆点色值。通过设置 `children` 的样式可以自定义节点样式。

<DemoBox code={customNodeSrc}><CustomNode /></DemoBox>

### 时间轴位置

通过 `mode` 属性可以设置时间的位置，共有 4 种模式可选：`left`， `center`， `alternate`， `right`。

#### 时间轴在左侧（默认）

<DemoBox code={modeLeftSrc}><ModeLeft /></DemoBox>

#### 时间节点在左侧

<DemoBox code={modeCenterSrc}><ModeCenter /></DemoBox>

#### 交替展现

<DemoBox code={modeAlternateSrc}><ModeAlternate /></DemoBox>

#### 时间轴在右侧

<DemoBox code={modeRightSrc}><ModeRight /></DemoBox>

### 使用 dataSource

<DemoBox code={dataSourceSrc}><DataSource /></DemoBox>

### 可点击节点

通过 Timeline.Item 的 `onClick` 监听节点点击。Timeline.Item 将 onClick 直接挂在 `<li>` 上（节点本身非交互控件，无键盘等价）。

<DemoBox code={clickableSrc}><Clickable /></DemoBox>

## API 参考

### Timeline

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| mode | 通过设置 mode 可以改变时间轴和内容的相对位置 | `left`\|`right`\|`center`\|`alternate` | `left` |
| style | 样式 | string | - |
| dataSource | 时间轴数据源，支持 content 属性及 Timeline.Item 的所有属性 | `TimelineItemData[]` | - |
| aria-label | 无障碍标签 | string | - |
| children | 声明式用法：内嵌 `<Timeline.Item>` 列表（未传 dataSource 时生效） | Snippet | - |

### Timeline.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| color | 自定义的圆圈色值 | string | - |
| dot | 自定义时间轴点 | string \| Snippet | - |
| extra | 自定义辅助内容 | string \| Snippet | - |
| position | 自定义节点位置，可以覆盖 Timeline 的模式选项 | `left`\|`right` | - |
| style | 样式 | string | - |
| time | 时间文本 | string \| Snippet | - |
| type | 当前圆圈的模式 | `default`\|`ongoing`\|`success`\|`warning`\|`error` | `default` |
| onClick | 鼠标点击事件的回调 | (e: MouseEvent) => void | - |
| children | 节点内容 | Snippet | - |

## Accessibility

### ARIA

- 组件中时间点的连线以及时间点本身被设置了 `aria-hidden`，不会响应 Accessibility API
- 可以通过传入 `aria-label` 设置 Timeline 组件的标签

<DemoBox code={ariaLabelSrc}><AriaLabel /></DemoBox>
