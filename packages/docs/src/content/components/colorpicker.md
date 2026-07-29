---
title: ColorPicker 颜色选择器
name: colorpicker
category: input
brief: 快速便捷地选择颜色，并提供滴管工具取色
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import PopoverDemo from '../../demos/color-picker/01-popover.svelte';
  import popoverSrc from '../../demos/color-picker/01-popover.svelte?raw';
  import Inline from '../../demos/color-picker/02-inline.svelte';
  import inlineSrc from '../../demos/color-picker/02-inline.svelte?raw';
  import EyeDropper from '../../demos/color-picker/03-eye-dropper.svelte';
  import eyeDropperSrc from '../../demos/color-picker/03-eye-dropper.svelte?raw';
  import DefaultValue from '../../demos/color-picker/04-default-value.svelte';
  import defaultValueSrc from '../../demos/color-picker/04-default-value.svelte?raw';
  import Controlled from '../../demos/color-picker/05-controlled.svelte';
  import controlledSrc from '../../demos/color-picker/05-controlled.svelte?raw';
  import Slots from '../../demos/color-picker/06-slots.svelte';
  import slotsSrc from '../../demos/color-picker/06-slots.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { ColorPicker } from '@chenzy-design/svelte';
```

### 基本用法

#### 放在弹层

<DemoBox code={popoverSrc}><PopoverDemo /></DemoBox>

#### 正常展示

<DemoBox code={inlineSrc}><Inline /></DemoBox>

### 滴管取色器

使用 `eyeDropper={true}` 开启滴管功能，支持从浏览器内或外部软件屏幕取色。

<Notice type="primary" title="注意事项">
开启此功能需要当前网页部署在 HTTPS 或 localhost 域名等安全 context 下，否则无效果。需用户浏览器版本 Chromium > 95
</Notice>

<DemoBox code={eyeDropperSrc}><EyeDropper /></DemoBox>

### 默认值

在进行各种颜色表示格式之间相互转换时，部分格式之间存在理论误差，因此 onChange 返回给你的值是同时包含了 hsva hex rgba 三种格式的色值的对象。

你传入的 defaultValue(非受控) 和 value(受控) 也应当是同样包含三种格式的对象。

我们提供了工具函数 `colorStringToValue`，用于将常见颜色字符串转换为该对象，支持 rgb(57,197,187) #39c5bb hsv(176,71,77) 等字符串直接传入。

<Notice type="primary" title="与 Semi 的差异">
Semi 把该工具函数挂在组件类的静态属性上（ColorPicker.colorStringToValue）。Svelte 组件没有静态方法，本库改为从包内具名导出：<code>import &#123; colorStringToValue &#125; from '@chenzy-design/svelte'</code>。
</Notice>

<DemoBox code={defaultValueSrc}><DefaultValue /></DemoBox>

### 受控

通过传入 value 来受控使用

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 顶部和底部渲染额外元素

使用 `topSlot` 和 `bottomSlot` 在顶部和底部渲染额外元素

<DemoBox code={slotsSrc}><Slots /></DemoBox>

## API 参考

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| alpha | 是否开启透明度选择 | boolean | false |
| bottomSlot | 底部渲染额外元素 | Snippet | - |
| children | 自定义 trigger，仅 `usePopover` 时生效；缺省渲染默认色块 | Snippet | - |
| class | 类名 | string | - |
| defaultFormat | 默认手动输入时的格式，可选值 `hex`、`rgba`、`hsva` | string | `hex` |
| defaultValue | 默认值（非受控） | `ColorValue` | `#39c5bb` 对应的三态对象 |
| eyeDropper | 是否开启滴管拾色器 | boolean | true |
| height | 饱和度方块高度 | number | 280 |
| popoverProps | 放入 Popover 时，Popover 传入的 props | `PopoverProps` | - |
| style | 样式 | string | - |
| topSlot | 顶部渲染额外元素 | Snippet | - |
| usePopover | 是否放入 Popover 渲染 | boolean | false |
| value | 受控值 | `ColorValue` | - |
| width | 宽度 | number | 280 |
| onChange | 用户选中颜色的回调 | `(value: ColorValue) => void` | - |

### ColorValue

三种颜色格式同源的值对象，`hsva` 的 `s`/`v` 为 0-100，`a` 为 0-1。

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| hex | 十六进制色值字符串，透明度不为 1 时为 8 位 | string |
| hsva | 色相 / 饱和度 / 明度 / 透明度 | `{ h: number; s: number; v: number; a: number }` |
| rgba | 红 / 绿 / 蓝 / 透明度 | `{ r: number; g: number; b: number; a: number }` |

### 工具函数

| 函数 | 说明 | 类型 |
| --- | --- | --- |
| colorStringToValue | 常见颜色字符串转 ColorValue 三态对象，支持 `#39c5bb`、`rgb(57,197,187)`、`rgba(57,197,187,0.5)`、`hsv(176,71,77)`；无法识别时抛错 | `(raw: string) => ColorValue` |

## Accessibility

- 饱和度方块、色相滑块、透明度滑块均为 `role="slider"`，携带 `aria-label`、`aria-valuemin`、`aria-valuemax`、`aria-valuenow`；饱和度方块与透明度滑块另有 `aria-valuetext` 播报百分比。
- 三个滑块均可聚焦并支持键盘操作：`←`/`→`、`↑`/`↓` 步进，`Home`/`End` 跳至极值。
- 手动输入区复用 Input / InputNumber / Select / Button，各自携带可访问名与内置无障碍能力。
- `usePopover` 模式下浮层的显隐、焦点管理与 `Esc` 关闭由内部 Popover 承载。

## 文案规范

- 格式选择、色值输入等控件的可访问名跟随语言包，不在 demo 里硬编码。
- 顶部/底部插槽的说明文案保持简短，避免与面板内的色值信息重复。
