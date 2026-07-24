---
title: Breadcrumb 面包屑
name: breadcrumb
category: navigation
brief: 面包屑是用户界面中的一种辅助导航，可以显示当前页面在层级架构中的位置，并能返回之前的页面。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/breadcrumb/01-basic.svelte';
  import basicSrc from '../../demos/breadcrumb/01-basic.svelte?raw';
  import Icon from '../../demos/breadcrumb/02-icon.svelte';
  import iconSrc from '../../demos/breadcrumb/02-icon.svelte?raw';
  import Sizes from '../../demos/breadcrumb/03-sizes.svelte';
  import sizesSrc from '../../demos/breadcrumb/03-sizes.svelte?raw';
  import Separator from '../../demos/breadcrumb/04-separator.svelte';
  import separatorSrc from '../../demos/breadcrumb/04-separator.svelte?raw';
  import Tooltip from '../../demos/breadcrumb/05-tooltip.svelte';
  import tooltipSrc from '../../demos/breadcrumb/05-tooltip.svelte?raw';
  import Collapse from '../../demos/breadcrumb/06-collapse.svelte';
  import collapseSrc from '../../demos/breadcrumb/06-collapse.svelte?raw';
  import MoreType from '../../demos/breadcrumb/07-more-type.svelte';
  import moreTypeSrc from '../../demos/breadcrumb/07-more-type.svelte?raw';
  import RenderMore from '../../demos/breadcrumb/08-render-more.svelte';
  import renderMoreSrc from '../../demos/breadcrumb/08-render-more.svelte?raw';
  import RouteObject from '../../demos/breadcrumb/09-route-object.svelte';
  import routeObjectSrc from '../../demos/breadcrumb/09-route-object.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Breadcrumb } from '@chenzy-design/svelte';
```

### 基本用法

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 带图标的

支持标题只显示图标或者同时显示图标和文本。

<DemoBox code={iconSrc}><Icon /></DemoBox>

### 尺寸

默认为 `compact`，设置属性为 `false` 可使图标和文字尺寸增加。

<DemoBox code={sizesSrc}><Sizes /></DemoBox>

### 自定义的分隔符

默认为 `/`。

<DemoBox code={separatorSrc}><Separator /></DemoBox>

### 截断逻辑

当级别名字溢出设定宽度后省略截断。可以通过 `showTooltip` 属性设置相关参数。默认宽度 150px，鼠标悬停时显示 Tooltip 完整显示级别名称。

<DemoBox code={tooltipSrc}><Tooltip /></DemoBox>

当路径层级超过 4 个级别，则：第二层至倒数第三层省略，点击省略号展开显示全部级别；如果过长则自动换行。可以通过 `maxItemCount` 来控制超过多少个级别进行折叠。

> 折叠能力作用于 `routes` 数据数组：Svelte 的 Snippet children 无法被父组件切片，故层级折叠走 `routes` 模式（这是与 Semi React children 的技术栈差异）。声明式 `<Breadcrumb.Item>` 适用于层级固定、无需折叠的场景。

<DemoBox code={collapseSrc}><Collapse /></DemoBox>

### 自定义省略号区域

组件内部提供了两种省略号区域渲染的类型，可通过 `moreType` 来设置，`moreType` 的可选值为 `default` 和 `popover`。

<DemoBox code={moreTypeSrc}><MoreType /></DemoBox>

如果想要为省略号区域自定义其他形式的渲染，则可以使用 `renderMore()` 方法。

<DemoBox code={renderMoreSrc}><RenderMore /></DemoBox>

### 路由对象

Breadcrumb 支持通过 routes 传入路由对象 `route: { name, path, href, icon }` 或字符串组成的数组。可以配合 renderItem 来渲染节点。通过这样实现的 Breadcrumb 同样会进行截断处理。

- name 为展示的名称，不传入时为空字符串。当 route 为字符串时，默认将字符串设置为名称。
- path 为路由路径
- href 为链接目的地，挂载在 a 标签上。
- icon 为标签的显示图标

<DemoBox code={routeObjectSrc}><RouteObject /></DemoBox>

## API 参考

### Breadcrumb

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeIndex | 受控使用，当前选择的导航序号 | number | - |
| autoCollapse | 是否超出 maxItemCount 后自动折叠 | boolean | true |
| class | 类名 | string | - |
| compact | 显示尺寸，是否紧凑 | boolean | true |
| maxItemCount | 超出多少个进行自动折叠 | number | 4 |
| moreType | 内置的 ... 区域的渲染类型，可选值为 `default`、`popover` | string | `default` |
| renderItem | 自定义链接函数，配合 routes 使用 | `(route: Route) => Snippet` | - |
| renderMore | 自定义 ... 区域的渲染 | `Snippet<[restItem]>` | - |
| routes | router 的路由信息，由路由对象或字符串组成的数组 | `Array<Route \| string>` | - |
| separator | 自定义的分隔符 | string \| Snippet | `/` |
| showTooltip | 是否展示 Tooltip 及相关配置：width，溢出宽度；ellipsisPos，截断方式（从中间/末尾截断）；opts，透传给 Tooltip 的属性 | `boolean \| ShowTooltipProps` | `{ width: 150, ellipsisPos: 'end' }` |
| style | 内联样式 | string | - |
| onClick | 单击事件 | `(item: Route, e: Event) => void` | - |

### Breadcrumb.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| href | 链接的目的地 | string | - |
| icon | 标签的显示图标 | Snippet | - |
| separator | 分隔符，可以覆盖父级的分隔符 | string \| Snippet | - |
| noLink | 移除 hover 和 active 的样式 | boolean | false |
| onClick | 单击事件 | `(item: Route, e: Event) => void` | - |

### Route

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| href | 链接目的地 | string | - |
| icon | 标签的显示图标 | Snippet | - |
| name | 路由名 | string | - |
| path | 路由路径 | string | - |

## 无障碍

- Breadcrumb 支持传入 `aria-label` 来表示该 Breadcrumb 作用。
- Breadcrumb 会对当前项设置 `aria-current='page'`。

## 文案规范

- 每个页面链接都应该很简短，并且清楚地反映它链接到的位置或链接的实体。
- 按句子大小写书写。
