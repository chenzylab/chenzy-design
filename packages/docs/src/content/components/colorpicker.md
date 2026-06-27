---
title: ColorPicker 颜色选择器
name: colorpicker
category: input
brief: ColorPicker 是一个颜色选择控件，用于让用户通过可视化的色相/饱和度面板、滑块及输入框选取颜色，并在 HSV / RGB / HEX 多种格式间切换。
---

## 使用场景

ColorPicker 是一个颜色选择控件，用于让用户通过可视化的色相/饱和度面板、滑块及输入框选取颜色，并在 HSV / RGB / HEX 多种格式间切换。它支持透明度（Alpha）调节、预设色板（presets / recent）、以及作为触发器的色块（Trigger）弹出浮层。

典型使用场景：
- 主题/样式编辑器中选取品牌色、背景色、文字色。
- 表单中作为颜色输入字段（受控 `value` + `on:change`）。
- 图形/标注工具中的快速取色（配合预设与最近使用）。

核心能力边界：
- 内置色彩空间转换（HSV ↔ RGB ↔ HEX，含 8 位带 Alpha 的 HEXA）。
- 浮层模式（默认，`open` + `on:openChange` 控制）与内联面板模式（`inline`，无 Trigger）。
- 受控/非受控双模式，`value` 支持对象（`{ h,s,v,a }` / `{ r,g,b,a }`）或字符串（`#RRGGBBAA`）。
- 不负责：渐变（gradient）编辑、吸管取色（EyeDropper 为可选增强，依赖浏览器 API，降级隐藏）、颜色管理 ICC profile。

## 何时使用

- 需要用户可视化选取颜色值时使用，如主题编辑、样式配置、图形标注。
- 需要支持多种颜色格式（HEX/RGB/HSV）及透明度时使用。
- 纯展示一个色块（不可交互）时，不应使用本组件，应直接用样式实现色块。

## 无障碍

- Trigger 使用 `role="button"` 配合 `aria-haspopup="dialog"`、`aria-expanded`、`aria-label`（含当前色值）。
- 浮层使用 `role="dialog"`；inline 模式使用 `role="group"`。
- 色相/透明度滑块使用 `role="slider"` 配合 `aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`（如「色相 210 度」）。
- 键盘交互：`Enter`/`Space` 打开浮层；滑块 `←/→` 或 `↑/↓` 步进，`Shift+方向键` 大步进，`Home/End` 跳极值；预设区方向键移动，`Enter` 选择；浮层内 Tab 循环（useFocusTrap）；`Esc` 关闭并返还焦点。

## 文案规范

- **label 用名词短语**，简洁，如「色相」而非「请选择色相」。
- **格式切换用大写缩写** `HEX / RGB / HSV`（约定俗成不翻译），读屏走 `aria-label` 本地化全称。
- **校验提示具体**，如「无效的颜色值」，配合示例占位 `#1A73E8`。
- 「清除颜色」属可逆操作，不需二次确认。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 色相 | 请选择色相 |
| 无效的颜色值（占位 `#1A73E8`） | 格式不对 |
| 清除（aria-label「清除颜色选择」） | 删除 |

- 无破坏性数据删除操作；最近使用列表清空走宿主自定义，不在组件内置危险确认。
