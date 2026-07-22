---
title: Tag 标签
name: tag
category: show
brief: 标签是图形化标记界面上的元素的组件，达到快速识别、分组的目的。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/tag/01-basic.svelte';
  import basicSrc from '../../demos/tag/01-basic.svelte?raw';
  import Size from '../../demos/tag/02-size.svelte';
  import sizeSrc from '../../demos/tag/02-size.svelte?raw';
  import Shape from '../../demos/tag/03-shape.svelte';
  import shapeSrc from '../../demos/tag/03-shape.svelte?raw';
  import Icon from '../../demos/tag/04-icon.svelte';
  import iconSrc from '../../demos/tag/04-icon.svelte?raw';
  import Color from '../../demos/tag/05-color.svelte';
  import colorSrc from '../../demos/tag/05-color.svelte?raw';
  import Colorful from '../../demos/tag/06-colorful.svelte';
  import colorfulSrc from '../../demos/tag/06-colorful.svelte?raw';
  import TypeDemo from '../../demos/tag/07-type.svelte';
  import typeSrc from '../../demos/tag/07-type.svelte?raw';
  import Avatar from '../../demos/tag/08-avatar.svelte';
  import avatarSrc from '../../demos/tag/08-avatar.svelte?raw';
  import Visible from '../../demos/tag/09-visible.svelte';
  import visibleSrc from '../../demos/tag/09-visible.svelte?raw';
  import TagGroupDemo from '../../demos/tag/10-taggroup.svelte';
  import tagGroupSrc from '../../demos/tag/10-taggroup.svelte?raw';
  import TagGroupClosable from '../../demos/tag/11-taggroup-closable.svelte';
  import tagGroupClosableSrc from '../../demos/tag/11-taggroup-closable.svelte?raw';
  import SplitTagGroupDemo from '../../demos/tag/12-splittaggroup.svelte';
  import splitTagGroupSrc from '../../demos/tag/12-splittaggroup.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Tag, TagGroup, SplitTagGroup } from '@chenzy-design/svelte';
```

### 基本用法

基本标签用法，将内容使用 `<Tag>` 标签包裹即可。
可以通过添加 `closable` 属性将其变为可关闭标签，此时点击 x 关闭会触发 onClose 事件，在 onClose 中阻止默认事件可以使其点击后依然显示不隐藏

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 尺寸

默认定义了两种尺寸：大、小（默认）。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 形状

默认定义了两种形状：`square`（默认）、`circle`。

<DemoBox code={shapeSrc}><Shape /></DemoBox>

### 配置图标

支持通过配置 prefixIcon、suffixIcon， 可以在 children 内容前后添加 Icon 图标。

<DemoBox code={iconSrc}><Icon /></DemoBox>

### 颜色

标签支持默认色板的 16 种颜色和白色，包括：`amber`、 `blue`、 `cyan`、 `green`、 `grey`、 `indigo`、 `light-blue`、 `light-green`、 `lime`、 `orange`、 `pink`、 `purple`、 `red`、 `teal`、 `violet`、 `yellow`、 `white`，也可以通过 style 来自定义颜色样式。

<DemoBox code={colorSrc}><Color /></DemoBox>

### AI 风格 - 多彩标签

设置 `colorful` 为 `true` 即可获得多彩的标签。<strong>注意: </strong> 多彩标签的字重和非多彩标签字重不同。

多彩标签可通过 `gradient` 区分是否为渐变色。

<DemoBox code={colorfulSrc}><Colorful /></DemoBox>

### 样式类型

标签支持三种样式类型，包括浅色底色 `light`，白色底色 `ghost`，深色底色 `solid`；默认值为 `light`。通过 type 配置

<DemoBox code={typeSrc}><TypeDemo /></DemoBox>

### 头像标签

设置 `avatarSrc` 可以生成头像标签。结合 `avatarShape` 可以调整头像标签的形状，支持 `square` 和 `circle`。

<DemoBox code={avatarSrc}><Avatar /></DemoBox>

### 不可见的

通过 visible 属性控制标签是否可见。

<DemoBox code={visibleSrc}><Visible /></DemoBox>

### TagGroup 使用

在 TagGroup 内通过 `tagList` 传入 tags 配置，并且设置 `maxTagCount` 属性, 超出数量限制后，会显示为 +N
通过设置 `showPopover` 属性，来控制 hover 到 +N Tag 时，是否通过 Popover 显示剩余内容

<DemoBox code={tagGroupSrc}><TagGroupDemo /></DemoBox>

如果 TagGroup 中的标签可删除，用户需要在 `onTagClose` 中处理传递给 TagGroup 的 `tagList`。

<DemoBox code={tagGroupClosableSrc}><TagGroupClosable /></DemoBox>

### SplitTagGroup 组合标签

使用 `SplitTagGroup` 可以将多个标签组合成一个整体，首尾标签会有圆角，中间标签圆角为 0，形成连续的视觉效果。

<DemoBox code={splitTagGroupSrc}><SplitTagGroupDemo /></DemoBox>

## API 参考

### Tag

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatarShape | 头像 Tag 形状，可选 `square` 和 `circle` | string | `square` |
| avatarSrc | 头像的资源地址 | string | - |
| class | 类名 | string | - |
| closable | 标签是否可以关闭 | boolean | false |
| color | 标签的颜色，可选 `amber`、 `blue`、 `cyan`、 `green`、 `grey`、 `indigo`、 `light-blue`、 `light-green`、 `lime`、 `orange`、 `pink`、 `purple`、 `red`、 `teal`、 `violet`、 `yellow`、 `white` | string | `grey` |
| colorful | 多彩标签 | boolean | false |
| gradient | 是否为渐变色，需在 colorful 为 true 时生效 | boolean | false |
| prefixIcon | 前缀图标 | Snippet | - |
| suffixIcon | 后缀图标 | Snippet | - |
| shape | 标签的形状，可选 `square`、 `circle` | string | `square` |
| size | 标签的尺寸，可选 `small`、 `default`、 `large` | string | `default` |
| style | 样式 | string | - |
| type | 标签的样式类型，可选 `ghost`、 `solid`、 `light` | string | `light` |
| visible | 标签是否可见 | boolean | true |
| tagKey | 作为每个标签的唯一标识，不允许重复 | string \| number | - |
| ariaLabel | 无障碍标签，对可删除或可点击的标签推荐配置 | string | - |
| onClick | 单击标签时的回调函数 | (e: MouseEvent) => void | - |
| onClose | 关闭标签时的回调函数 | (tagChildren, e: MouseEvent, tagKey) => void | - |

### TagGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatarShape | 头像 Tag 形状，可选 `square` 和 `circle` | string | `square` |
| class | 类名 | string | - |
| maxTagCount | 最大数量限制，超出后显示为 +N | number | - |
| popoverProps | popover 的配置属性，可以控制 direction、zIndex、trigger 等，具体参考 [Popover](/components/popover#API_参考) | PopoverProps | `{}` |
| showPopover | hover 到 +N 时，是否通过 Popover 显示剩余内容 | boolean | false |
| size | 标签的尺寸，可选 `small`、 `default`、 `large` | string | `default` |
| style | 样式 | string | - |
| tagList | 标签组 | TagProps[] | `[]` |
| onTagClose | 删除 TagGroup 中的 Tag 时候的回调函数 | (tagChildren, e: MouseEvent, tagKey) => void | - |

### SplitTagGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| style | 样式 | string | - |
| children | 标签组 | Snippet | - |
| ariaLabel | 无障碍标签 | string | - |

## Accessibility

### ARIA

- `ariaLabel` 用于表示 `Tag` 的作用，对于可删除或者可点击的 `Tag` ，我们推荐使用此属性

### 键盘和焦点

- 如果当前 `Tag` 可交互，那么这个 `Tag` 可被聚焦到。如：
  - 使用了 `onClick` 属性时，键盘用户可以通过 `Enter` 键激活此 `Tag`
  - `closable` 属性为 `true` 时，键盘用户可以通过 `Delete` 键删除此 `Tag`
  - `Tag` 被聚焦时，键盘用户可以通过 `Esc` 键使当前聚焦 `Tag` 失焦

## 文案规范

- 由于空间有限，标签文本应尽可能简短
- 避免换行
- 使用句子大小写
