---
title: ColorPicker 颜色选择器
name: colorpicker
category: input
brief: ColorPicker 是一个颜色选择控件，用于让用户通过可视化的饱和度方块、色相/透明度滑块及输入框选取颜色，值为 ColorValue 对象 { hsva, rgba, hex }。
---

## 使用场景

ColorPicker 是一个颜色选择控件，用于让用户通过可视化的饱和度方块、色相/透明度滑块及 DataPart 输入区选取颜色。严格对齐 Semi Design：值为 `ColorValue` 对象 `{ hsva, rgba, hex }`（`hsva` 的 `s`/`v` 为 0-100），经 `onChange` 通信。

典型使用场景：
- 主题/样式编辑器中选取品牌色、背景色、文字色。
- 表单中作为颜色输入字段（受控 `value` + `onChange`）。

核心能力边界：
- 内置色彩空间三态同源转换（HSVA ↔ RGBA ↔ HEX，含带 Alpha 的 8 位 HEX）。
- 默认 inline 内联渲染面板；`usePopover` 时包裹浮层（`children` 缺省渲染默认色块 trigger）。
- 受控/非受控双模式：`value` 受控不回写，仅 `onChange`；`defaultValue` 默认 Semi 品牌绿 `#39c5bb`。
- DataPart 输入区可切换 `hex` / `rgba` / `hsva` 三种格式（不受控内部 state）；`alpha` 开启时含透明度百分比数字输入。
- 不负责：渐变（gradient）编辑、颜色管理 ICC profile；吸管取色（EyeDropper 为可选增强，依赖浏览器 API，降级隐藏）。

## 何时使用

- 需要用户可视化选取颜色值时使用，如主题编辑、样式配置、图形标注。
- 需要在 HEX / RGBA / HSVA 之间切换编辑或需要透明度时使用。
- 纯展示一个色块（不可交互）时，不应使用本组件，应直接用样式实现色块。

## 无障碍

- 饱和度方块、色相滑块、透明度滑块均使用 `role="slider"`，配合 `aria-label`、`aria-valuemin`、`aria-valuemax`、`aria-valuenow`。
- 键盘交互：滑块 `←/→`、`↑/↓` 步进，`Home/End` 跳极值。
- DataPart 复用 Input / InputNumber / Select / Button，各自携带 `aria-label` 与内置无障碍。
- `usePopover` 模式的浮层显隐、焦点陷阱、`Esc` 关闭由内部 Popover 承载。
