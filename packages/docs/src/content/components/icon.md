---
title: Icon 图标
name: icon
category: basic
brief: 语义化的矢量图形。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import IconList from '../../demos/icon/10-icon-list.svelte';
  import Basic from '../../demos/icon/07-named-basic.svelte';
  import basicSrc from '../../demos/icon/07-named-basic.svelte?raw';
  import Rotate from '../../demos/icon/11-named-rotate.svelte';
  import rotateSrc from '../../demos/icon/11-named-rotate.svelte?raw';
  import Size from '../../demos/icon/12-named-size.svelte';
  import sizeSrc from '../../demos/icon/12-named-size.svelte?raw';
  import Color from '../../demos/icon/13-named-color.svelte';
  import colorSrc from '../../demos/icon/13-named-color.svelte?raw';
  import TwoTone from '../../demos/icon/08-two-tone.svelte';
  import twoToneSrc from '../../demos/icon/08-two-tone.svelte?raw';
  import MultiTone from '../../demos/icon/09-multi-tone.svelte';
  import multiToneSrc from '../../demos/icon/09-multi-tone.svelte?raw';
  import Custom from '../../demos/icon/14-custom.svelte';
  import customSrc from '../../demos/icon/14-custom.svelte?raw';
  import SvgString from '../../demos/icon/05-source-a11y.svelte';
  import svgStringSrc from '../../demos/icon/05-source-a11y.svelte?raw';
  import PresetIcons from '../../demos/icon/06-preset-icons.svelte';
  import presetIconsSrc from '../../demos/icon/06-preset-icons.svelte?raw';
  import AriaLabel from '../../demos/icon/15-aria-label.svelte';
  import ariaLabelSrc from '../../demos/icon/15-aria-label.svelte?raw';
</script>

## 图标列表

默认的图标集 `@chenzy-design/icons` 包含面性、线性、AI 三套图标。面性图标、线性图标，以及 AI 图标中的单色图标默认不带颜色，可通过 css color 属性更改颜色。
AI 图标中的双色，多色图标有默认颜色，可以通过 fill 更改颜色。

`@chenzy-design/icons-lab` 为彩色图标集，需单独安装，不可改色。

<div class="not-prose">
  <IconList />
</div>

## 代码演示

### 如何引入

```jsx
import { Icon } from '@chenzy-design/svelte';
import { IconHome } from '@chenzy-design/icons';
import { IconAvatar, IconCard } from '@chenzy-design/icons-lab';
```

### 基础使用

从`@chenzy-design/icons`包中引入图标

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 旋转

从`@chenzy-design/icons`包中引入图标，自带尺寸、旋转、spin功能

<DemoBox code={rotateSrc}><Rotate /></DemoBox>

### 尺寸

> 可以改变`font-size`来更改图标大小

Icon组件封装了size属性，可以更方便地定义图标尺寸，支持 `extra-small` (8x8)，`small` (12x12)， `default` (16x16)， `large` (20x20)， `extra-large` (24x24)，当size指定为`inherit`时，图标大小继承当前上下文字体大小

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 颜色

单色图标会自动继承外部容器 CSS 的 `color` 属性
你还可以通过给 Icon 设置 style props 来修改图标的颜色。

<DemoBox code={colorSrc}><Color /></DemoBox>

### 双色图标

双色图标可以通过 `fill` 属性设置颜色，支持 string 以及 string[]。

<DemoBox code={twoToneSrc}><TwoTone /></DemoBox>

### 多色按钮

多色图标，当前的多色按钮可传入四个颜色。可以通过 `fill` 属性设置颜色，支持 string 以及 string[]。

<DemoBox code={multiToneSrc}><MultiTone /></DemoBox>

### 自定义图标

可以使用自定义图标传入Icon组件。Icon组件支持 size、rotate、spin 等属性。React 的 `svg={<CustomIcon />}` 在本库映射为 `svg={snippet}`（`svg` 亦接受可信来源的 SVG 字符串，见下）。

<DemoBox code={customSrc}><Custom /></DemoBox>

### 使用 SVG 字符串作为图标源

Semi 通过 `@svgr/webpack` 把 svg 文件转成 ReactComponent；本库对应做法是以 Vite 的 `?raw` 导入把 svg 文件读成字符串传给 `svg` prop（内部 `{@html}` 渲染，来源须可信）。提供 `type` 后根元素为 `role="img"` + `aria-label`，供屏幕阅读器读出；`fill` 可覆盖填充色。

```svelte
<script>
  import { Icon } from '@chenzy-design/svelte';
  import star from './star.svg?raw';
</script>

<Icon svg={star} />
```

<DemoBox code={svgStringSrc}><SvgString /></DemoBox>

### UnoCSS 图标（纯 class，本库补充）

文档站另内置一条不经过组件的图标路径：UnoCSS `preset-icons` 的 `i-<图标集>-<图标名>` class，可渲染任意 [Iconify](https://icon-sets.iconify.design/) 图标。图标以纯 CSS 渲染，尺寸随 `font-size`、颜色随 `currentColor`；class 必须静态出现在源码中（构建期生成 CSS），a11y 需自理（装饰性加 `aria-hidden`，语义性加 `role="img"` + `aria-label`）。

<DemoBox code={presetIconsSrc}><PresetIcons /></DemoBox>

## API参考

### Icon

| 属性  | 说明        | 类型            | 默认值 |
|-------|-------------|-----------------|--------|
| class | 类名 | string | 无    |
| fill | 双色，多色图标的填充颜色。具名 AI 图标（`IconAI…Level2/3`）支持 string 与 string[]；`<Icon>` 基座上为 string（以 `color` 覆盖 currentColor 填充） | string \| string[] | 无 |
| onclick | 单击图标的回调事件（原生事件透传） | (e: Event) => void | 无    |
| onmousedown | 鼠标按钮按下的回调事件（原生事件透传） | (e: Event) => void | 无    |
| onmouseenter | 进入图标的回调事件（原生事件透传） | (e: Event) => void | 无    |
| onmouseleave | 离开图标的回调事件（原生事件透传） | (e: Event) => void | 无    |
| onmousemove | 移动鼠标的回调事件（原生事件透传） | (e: Event) => void | 无    |
| onmouseup | 鼠标按钮抬起的回调事件（原生事件透传） | (e: Event) => void | 无    |
| rotate | 旋转度数 | number |   |
| size | 尺寸，支持`inherit`，`extra-small`，`small`， `default`， `large`， `extra-large` | string | `default`  |
| spin | 旋转动画 | boolean |   |
| style | 图标样式 | string | 无    |
| svg | 图标内容：SVG 字符串（`{@html}` 渲染，来源须可信）或自定义图标 Snippet | string \| Snippet | 无    |
| type | 图标语义类型，映射到 aria-label 与 `cd-icon-{type}` 类 | string | 无    |
| children | 自定义图标内容（`svg` 未传时的备选插槽） | Snippet | 无    |

## Accessibility

### ARIA

- Icon 组件 role 为 img，它的 aria-label 默认为组件的文件名。例如 IconHome 的 aria-label 为 `home`，如果你有更好的语义化名字，可以通过 aria-label 传入。

<DemoBox code={ariaLabelSrc}><AriaLabel /></DemoBox>

- Icon 内部的 svg 元素为装饰元素，默认设置了 aria-hidden 以不被屏幕阅读器阅读
