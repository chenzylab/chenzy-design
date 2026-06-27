---
title: Carousel 走马灯
name: carousel
category: show
brief: Carousel（走马灯）用于在有限的视觉空间内循环轮播一组内容。
---

## 使用场景

走马灯（Carousel）用于在有限的视觉空间内循环轮播一组内容，支持自动播放、手动切换、指示器导航等交互模式。典型场景包括首页 Banner 广告位、商品图集、活动公告轮播。

Carousel 提供水平与垂直两个方向的滚动模式，支持无限循环，并允许通过指示器快速跳转到特定幻灯片。自动播放时支持鼠标悬停暂停，减少用户在阅读时内容意外切走的干扰。

## 何时使用

在空间有限但需要展示多个平行内容的场景中使用 Carousel。不适合用于承载核心功能的导航，因为自动播放轮播会分散注意力、增加读取负担；不应把重要操作或通知放在轮播中依赖用户"等到"那一帧。

## 无障碍

- 轮播容器使用 `role="region"` 并配置 `aria-roledescription="carousel"` 及 `aria-label`；每张幻灯片使用 `role="group"` + `aria-roledescription="slide"` + `aria-label`（如"第 1 张，共 5 张"）。
- 指示器渲染为 `tablist`/`tab` 模式或独立按钮，支持 ←/→/Home/End 键切换幻灯片，Enter/Space 激活。
- 必须提供可见的暂停/继续按钮（满足 WCAG 2.2.2），键盘用户可通过该按钮控制自动播放；鼠标悬停与键盘聚焦均应暂停自动播放。
- `prefers-reduced-motion` 时禁用滑动动画，改为即时切换，不触发自动播放。
