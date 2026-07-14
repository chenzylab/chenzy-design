---
title: Tag 标签
name: tag
category: show
brief: Tag（标签）用于对事物进行标记、分类或属性归纳。
---

## 使用场景

Tag（标签）用于对事物进行标记、分类或属性归纳，是高密度信息场景下的轻量展示原子。典型用途包括：状态标记（成功/警告/失败）、分类标记（文章标签、商品属性）、可关闭的筛选条件回显、头像标记、AI 多彩标记。

Tag 默认是纯展示组件；提供可交互形态：可关闭（closable，右侧出现关闭图标，点击触发移除）与可点击（传入 onClick 后整体作为按钮）。配套的 TagGroup 支持 `maxTagCount` 折叠 + +N 溢出提示，SplitTagGroup 将多个 Tag 组合成整体。

## 何时使用

在需要对内容打标记、分类归纳时使用 Tag。与 Button 区分：Tag 不承担主操作，权重低；与 Badge 区分：Badge 是依附于其他元素的小角标，Tag 是独立信息单元。

## 无障碍

- 纯展示 Tag 渲染为 `<div>`，无需 role，不可聚焦，纯文本由读屏器顺序读取；不以颜色为唯一状态通道，需辅以文本或图标。
- 可交互 Tag（传入 onClick 或 closable）根 `<div>` 使用 `role="button"` + `tabindex`，Enter 激活 onClick，Delete/Backspace 关闭标签，Esc 使当前聚焦 Tag 失焦。对可删除或可点击的 Tag 推荐配置 `aria-label`。
- closable Tag 的关闭区为 `<div class="cd-tag__close">`，点击触发 onClose（回调内 `e.preventDefault()` 可阻止默认隐藏）。
- TagGroup 的 +N 标签设置 `aria-label`（插值数量）；showPopover 时弹层复用 Popover 的键盘/Esc 行为。
