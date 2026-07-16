---
title: BackTop 回到顶部
name: backtop
category: other
brief: 浮于页面右下角的悬浮按钮，当目标滚动容器的滚动距离超过设定阈值时显现，点击后将容器平滑滚动回顶部。
---

## 使用场景

BackTop（回到顶部）是一个浮于页面右下角的悬浮按钮，当目标滚动容器的滚动距离超过设定阈值时显现，点击后将容器平滑滚动回顶部。它解决长页面/长列表场景下用户快速返回起点的诉求。

核心能力：
- **滚动阈值显隐**：监听目标容器 scroll，滚动距离超过 visibilityHeight（默认 400px）时显示，反之隐藏（对齐 Semi，严格大于）；不可见时不在 DOM。
- **目标容器可配**：默认监听 window，可通过 target 指定任意滚动容器（如 Modal 内的滚动区、侧栏 List）。
- **平滑滚动**：内置缓动动画（easeInOutCubic）返回顶部，duration 可配（默认 450ms），尊重 prefers-reduced-motion。
- **自定义内容**：默认渲染 IconButton（theme="light"）+ 上箭头，支持通过 children 完全自定义外观/文案。
- **定位可配**：默认距底 50px、距右 100px，可用 style 覆盖，支持 RTL 镜像。

与 Affix 的区别：Affix 是"吸附固定"任意内容；BackTop 是"阈值显隐 + 滚动到顶"的专用行为按钮。BackTop 属轻量交互组件，不涉及焦点陷阱或浮层栈。

## 何时使用

- 页面内容较长，用户需要快速回到顶部时
- 长列表、长文档等滚动距离较大的容器内
- Modal 弹窗或侧边栏等独立滚动区域内，需局部回顶时
- 不应与页面主要操作按钮（primary CTA）颜色一致，避免视觉干扰

视觉层级：悬浮于内容之上，使用中性/低饱和背景的圆形按钮，避免与主操作抢夺注意力。

## 无障碍

- 对齐 Semi：外层为可点击 `div`，真实 button 语义/键盘可聚焦由内部 `IconButton`（theme="light"）承担
- 内部按钮 `aria-label` 取 i18n `BackTop.ariaLabel`（"回到顶部"）
- 隐藏态不渲染，自然移出无障碍树，不可聚焦
- 键盘支持 Enter / Space 触发（原生 button 行为）
- 点击回顶后焦点保留在按钮，不强制移动焦点至页首，避免打断屏幕阅读器用户上下文
- `prefers-reduced-motion` 下回顶使用瞬时跳转
