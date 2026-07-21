---
title: Anchor 锚点
name: anchor
category: navigation
brief: 创建超链接导航栏。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/anchor/01-basic.svelte';
  import basicSrc from '../../demos/anchor/01-basic.svelte?raw';
  import Comprehensive from '../../demos/anchor/02-comprehensive.svelte';
  import comprehensiveSrc from '../../demos/anchor/02-comprehensive.svelte?raw';
  import SizeDefault from '../../demos/anchor/03-size-default.svelte';
  import sizeDefaultSrc from '../../demos/anchor/03-size-default.svelte?raw';
  import SizeSmall from '../../demos/anchor/04-size-small.svelte';
  import sizeSmallSrc from '../../demos/anchor/04-size-small.svelte?raw';
  import RailPrimary from '../../demos/anchor/05-rail-primary.svelte';
  import railPrimarySrc from '../../demos/anchor/05-rail-primary.svelte?raw';
  import RailTertiary from '../../demos/anchor/06-rail-tertiary.svelte';
  import railTertiarySrc from '../../demos/anchor/06-rail-tertiary.svelte?raw';
  import RailMuted from '../../demos/anchor/07-rail-muted.svelte';
  import railMutedSrc from '../../demos/anchor/07-rail-muted.svelte?raw';
  import CollapseOn from '../../demos/anchor/08-collapse-on.svelte';
  import collapseOnSrc from '../../demos/anchor/08-collapse-on.svelte?raw';
  import CollapseOff from '../../demos/anchor/09-collapse-off.svelte';
  import collapseOffSrc from '../../demos/anchor/09-collapse-off.svelte?raw';
  import Tooltip from '../../demos/anchor/10-tooltip.svelte';
  import tooltipSrc from '../../demos/anchor/10-tooltip.svelte?raw';
  import TooltipPosition from '../../demos/anchor/11-tooltip-position.svelte';
  import tooltipPositionSrc from '../../demos/anchor/11-tooltip-position.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Anchor } from '@chenzy-design/svelte';
```

### 基本示例

使用 Link 可以创建锚点，点击它会跳转到指定位置。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 综合使用

你可以搭配 `getContainer`、`targetOffset`、`style`、`offsetTop` 完成一个拆箱即用的超链接导航栏。

- 滚动容器：你可以通过 `getContainer` 设置滚动内容的容器，默认值为 `window`。
- 距离顶部的距离：可以通过设置 `targetOffset` 设置文档滚动结束时，锚点距离容器顶部的距离。
- 自定义定位方式：Anchor 的默认定位方式为 `relative`，你可以通过 `style` 对象自定义它的定位方式。
- 偏移距离：`offsetTop` 可以在滚动内容距离容器顶部达到指定偏移量时触发当前 Link 切换。

<DemoBox code={comprehensiveSrc}><Comprehensive /></DemoBox>

### 尺寸

Anchor 设置 `size` 可以控制锚点的尺寸。

<DemoBox code={sizeDefaultSrc}><SizeDefault /></DemoBox>

<DemoBox code={sizeSmallSrc}><SizeSmall /></DemoBox>

### 滑轨主题

Anchor 设置 `railTheme` 可以控制滑轨的主题色。默认值为 `primary`。

<DemoBox code={railPrimarySrc}><RailPrimary /></DemoBox>

<DemoBox code={railTertiarySrc}><RailTertiary /></DemoBox>

<DemoBox code={railMutedSrc}><RailMuted /></DemoBox>

### 动态展示

Anchor 设置 `autoCollapse` 可以动态展示下一级锚点。默认值为 `false`。

<DemoBox code={collapseOnSrc}><CollapseOn /></DemoBox>

<DemoBox code={collapseOffSrc}><CollapseOff /></DemoBox>

### 显示工具提示

Anchor 设置 `showTooltip` 可以在 Link 超出最大宽度时显示 Link 的文字内容。默认值为 `false`，更多使用参考 API 说明。

<DemoBox code={tooltipSrc}><Tooltip /></DemoBox>

### 工具提示位置

Anchor 设置 `position` 可以设置 Tooltip 的显示位置。它仅在 `showTooltip` 为 `true` 时起作用。

<DemoBox code={tooltipPositionSrc}><TooltipPosition /></DemoBox>

## API 参考

### Anchor

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoCollapse | 滚动时动态显示下一级锚点 | boolean | false |
| class | 类名 | string | - |
| defaultAnchor | 默认高亮锚点 | string | - |
| getContainer | 指定滚动的容器 | `() => HTMLElement` | window |
| maxHeight | 组件的 max-height，超出时显示滚动条 | string \| number | `750px` |
| maxWidth | 组件的 max-width，超出时显示省略 | string \| number | `200px` |
| offsetTop | 滚动内容距离容器顶部达到指定偏移量时触发 | number | 0 |
| onChange | 改变锚点的回调函数 | `(currentLink: string, previousLink: string) => void` | - |
| onClick | 点击锚点回调函数 | `(event: MouseEvent, currentLink: string) => void` | - |
| position | Tooltip 显示位置，可选值同 Tooltip 组件 position | string | - |
| railTheme | 滑轨主题，可选值：`primary`、`tertiary`、`muted` | string | `primary` |
| scrollMotion | 是否开启滚动动画 | boolean | false |
| showTooltip | 文字缩略时是否显示 Tooltip 及相关配置：`type`（浮层内容承载的组件，支持 `tooltip`（默认）\| `popover`）；`opts`（其他需要透传给浮层组件的属性） | boolean \| object | false |
| size | 锚点尺寸，可选值：`small`、`default` | string | `default` |
| style | 样式对象 | string | - |
| targetOffset | 锚点滚动时距离顶部偏移量 | number | 0 |

### Anchor.Link

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| disabled | 禁用，不响应点击跳转 | boolean | false |
| href | 跳转的链接 | string | - |
| style | 样式对象 | string | - |
| title | 文字内容 | string \| Snippet | - |

## 文案规范

- 按句子大小写书写。
- 保持简洁，避免换行。

## FAQ

- **为何我的 Link 没有高亮和滑动跟随？**

  检查下点击锚点是否可以滚动到指定位置：

  - 不可以，说明 href 有问题，检查文档中是否存在该 id；
  - 可以，可能是滚动容器设置不正确，确保文档内容被包裹在滚动容器内。滚动容器默认为 window，如果你的容器是 `.my-container` 的 div，则应该将滚动容器设置为该 div。

  ```jsx
  // 此容器不是 Anchor 组件的容器，是文档内容的容器，
  // 因为要根据文档容器去计算当前是哪个 id 在容器上方
  const getContainer = () => document.querySelector('.my-container');

  <Anchor getContainer={getContainer}>
    {/* Links */}
  </Anchor>
  ```
