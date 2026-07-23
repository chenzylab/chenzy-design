---
title: Avatar 头像
name: avatar
category: show
brief: 头像，支持图片或字符展示。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Size from '../../demos/avatar/01-size.svelte';
  import sizeSrc from '../../demos/avatar/01-size.svelte?raw';
  import Color from '../../demos/avatar/02-color.svelte';
  import colorSrc from '../../demos/avatar/02-color.svelte?raw';
  import Gap from '../../demos/avatar/03-gap.svelte';
  import gapSrc from '../../demos/avatar/03-gap.svelte?raw';
  import Image from '../../demos/avatar/04-image.svelte';
  import imageSrc from '../../demos/avatar/04-image.svelte?raw';
  import Shape from '../../demos/avatar/05-shape.svelte';
  import shapeSrc from '../../demos/avatar/05-shape.svelte?raw';
  import Event from '../../demos/avatar/06-event.svelte';
  import eventSrc from '../../demos/avatar/06-event.svelte?raw';
  import TopSlot from '../../demos/avatar/07-top-slot.svelte';
  import topSlotSrc from '../../demos/avatar/07-top-slot.svelte?raw';
  import BottomSlot from '../../demos/avatar/08-bottom-slot.svelte';
  import bottomSlotSrc from '../../demos/avatar/08-bottom-slot.svelte?raw';
  import Combo from '../../demos/avatar/16-combo.svelte';
  import comboSrc from '../../demos/avatar/16-combo.svelte?raw';
  import Border from '../../demos/avatar/09-border.svelte';
  import borderSrc from '../../demos/avatar/09-border.svelte?raw';
  import ContentMotion from '../../demos/avatar/10-content-motion.svelte';
  import contentMotionSrc from '../../demos/avatar/10-content-motion.svelte?raw';
  import Group from '../../demos/avatar/11-group.svelte';
  import groupSrc from '../../demos/avatar/11-group.svelte?raw';
  import GroupMax from '../../demos/avatar/12-group-max.svelte';
  import groupMaxSrc from '../../demos/avatar/12-group-max.svelte?raw';
  import RenderMore from '../../demos/avatar/13-render-more.svelte';
  import renderMoreSrc from '../../demos/avatar/13-render-more.svelte?raw';
  import OverlapFrom from '../../demos/avatar/14-overlap-from.svelte';
  import overlapFromSrc from '../../demos/avatar/14-overlap-from.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Avatar, AvatarGroup } from '@chenzy-design/svelte';
```

### 尺寸

可以通过 `size` 属性设置图标大小，支持 `extra-extra-small`，`extra-small`，`small`，`default`，`medium`，`large`，`extra-large`。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 颜色

Avatar 支持默认色板的 15 种颜色和白色，包括：`amber`、 `blue`、 `cyan`、 `green`、 `grey`、 `indigo`、 `light-blue`、 `light-green`、 `lime`、 `orange`、 `pink`、 `purple`、 `red`、 `teal`、 `violet`、 `yellow`。也可以通过 `style` 来自定义颜色样式。默认为 `grey`。

<DemoBox code={colorSrc}><Color /></DemoBox>

### 自适应字符大小

字符类型的头像，字体大小会根据头像宽度自适应调整。使用 `gap` 调整字符头像距离左右两侧的像素大小。

<DemoBox code={gapSrc}><Gap /></DemoBox>

### 图片

可以通过 `src` 设置图片格式的头像。

<DemoBox code={imageSrc}><Image /></DemoBox>

### 形状

Avatar 支持 `circle`、`square` 两种形状，默认为 `circle`。

<DemoBox code={shapeSrc}><Shape /></DemoBox>

### 事件

Avatar 支持 `onClick`、`onMouseEnter`、`onMouseLeave`。其中 `hover` 状态下可以通过 `hoverMask` 属性传入覆盖层的内容。覆盖层无默认样式。

<DemoBox code={eventSrc}><Event /></DemoBox>

### 顶部和底部 Slot

顶部 Slot 通过 `topSlot` 对象配置（`gradientStart`/`gradientEnd`/`text`），常用于「直播」渐变标记。

<DemoBox code={topSlotSrc}><TopSlot /></DemoBox>

底部 Slot 通过 `bottomSlot` 对象配置（`shape`/`bgColor`/`text`）：方形放文字、圆形放图标或单符号。

<DemoBox code={bottomSlotSrc}><BottomSlot /></DemoBox>

综合示例：图片头像叠加边框呼吸动画、内容动效、顶部直播气泡与底部圆形图标。

<DemoBox code={comboSrc}><Combo /></DemoBox>

### 额外边框

通过 `border` 为头像添加一圈额外描边环，对象形式可定制 `color`。

<DemoBox code={borderSrc}><Border /></DemoBox>

### 额外动效

通过 `border={{ motion: true }}` 和 `contentMotion` 开启边框和内容区域的额外动效。

<DemoBox code={contentMotionSrc}><ContentMotion /></DemoBox>

### 头像组

可以通过 AvatarGroup 将 `avatar` 显示为组。

<DemoBox code={groupSrc}><Group /></DemoBox>

可以通过 `maxCount` 设置展示的头像数量。因 Svelte 无法像 React `Children` 那样遍历 children 计数，折叠形态改用数据驱动的 `items` 数组（与 Semi `children` + `maxCount` 等价）。

<DemoBox code={groupMaxSrc}><GroupMax /></DemoBox>

可以通过 `renderMore` 自定义 more 标签。

<DemoBox code={renderMoreSrc}><RenderMore /></DemoBox>

可以通过 `overlapFrom` 控制头像组的覆盖方式。可选值有 `start` 和 `end`，分别表示左边覆盖右边和右边覆盖左边。默认值为 `start`。

<DemoBox code={overlapFromSrc}><OverlapFrom /></DemoBox>

## API 参考

### Avatar

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| alt | 图像的替代文本描述 | string | - |
| border | 额外边框，`{ color?: string, motion?: boolean }` 或 boolean | object \| boolean | - |
| bottomSlot | 底部 Slot 配置，`{ render?, shape?, text, bgColor?, textColor?, class?, style? }` | object | - |
| class | 类名 | string | - |
| color | 指定头像的颜色，支持 `amber`、 `blue`、 `cyan`、 `green`、 `grey`、 `indigo`、 `light-blue`、 `light-green`、 `lime`、 `orange`、 `pink`、 `purple`、 `red`、 `teal`、 `violet`、 `yellow` | string | `grey` |
| contentMotion | 头像内容区域动效 | boolean | - |
| gap | 字符头像距离左右两侧的像素大小 | number | 3 |
| hoverMask | hover 时头像内容覆盖层 | Snippet | - |
| imgAttr | 原生 img 属性 | object | - |
| shape | 指定头像的形状，支持 `circle`、`square` | string | `circle` |
| size | 设置头像的大小，支持 `extra-extra-small`、`extra-small`、`small`、`default`、`medium`、`large`、`extra-large` 和合法的 width 值例如 `"10px"` | string | `medium` |
| src | 图片类头像的资源地址 | string | - |
| srcSet | 设置图片类头像响应式资源地址 | string | - |
| style | 样式 | string | - |
| topSlot | 顶部 Slot 配置，`{ render?, gradientStart?, gradientEnd?, text, textColor?, class?, style? }` | object | - |
| onClick | 单击头像的回调 | (e: MouseEvent) => void | - |
| onError | 图片加载失败的事件，返回 false 会关闭组件默认的 fallback 行为 | (e: Event) => boolean | - |
| onMouseEnter | MouseEnter 事件的回调 | (e: MouseEvent) => void | - |
| onMouseLeave | MouseLeave 事件的回调 | (e: MouseEvent) => void | - |

### AvatarGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 数据驱动的成员数组，启用 `maxCount` 折叠（对齐 Semi `children`；Svelte 折叠需数据驱动） | AvatarGroupItem[] | - |
| maxCount | 最大数量限制，超出后显示 +N | number | - |
| overlapFrom | 设置头像覆盖方向，支持 `start`、`end` | string | `start` |
| renderMore | 自定义渲染 more 标签，参数 `{ restNumber, restAvatars }` | Snippet | - |
| shape | 指定头像的形状，支持 `circle`、`square` | string | `circle` |
| size | 设置头像的大小，同 Avatar 的 `size` | string | `medium` |
| children | 不用 `items` 时自由传入的头像（不折叠） | Snippet | - |

## Accessibility

- Avatar 一般不用于操作，不需要被获取焦点。但当 Avatar 可以被点击操作时（如页面右上角的头像）需要被聚焦，并响应键盘 `Enter` 事件。
- 当 Avatar 与其他组件结合使用时，需要同时检查该组件的可访问性指南。
- Avatar 的 `alt` 属性可以被屏幕阅读器读取，使用头像组件时，请使用 `alt` 属性解释头像的内容。
- 文字或图标型 Avatar 添加 `role="img"` 并设置 `aria-label` 描述内容，纯装饰型加 `aria-hidden="true"`。
- AvatarGroup 根容器使用 `role="group"` 并配置 `aria-label`；组内使用 roving tabindex 管理键盘焦点。
