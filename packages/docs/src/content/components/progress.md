---
title: Progress 进度条
name: progress
category: feedback
brief: Progress 是进度指示组件，用于向用户反馈一项操作的当前进度。
---

## 使用场景

Progress 是进度指示组件，用于向用户反馈一项操作的当前进度，缓解等待焦虑并表达任务完成度。支持两种形态：线形（line，水平条带，适合表单提交、文件上传、页面顶部加载等横向布局场景）和环形/仪表盘（circle/dashboard，圆环或半开口仪表盘，适合卡片、统计面板等需要紧凑展示百分比的场景）。

Progress 支持受控进度值 `percent`（0–100）、四种语义状态（normal/success/error/warning）、不确定进度（indeterminate 循环动画）、自定义格式化文本与平滑过渡动画。

## 何时使用

在需要向用户展示某项操作进度时使用 Progress。不内置文件上传逻辑，仅消费外部传入的 `percent`；不内置分步骤导航（用 Steps）。`indeterminate` 适用于无法确定进度时的持续加载指示。

## 无障碍

- 根节点设 `role="progressbar"`，确定进度时配置 `aria-valuenow`、`aria-valuemin="0"`、`aria-valuemax="100"` 和 `aria-valuetext`（如"45%，上传进度"）；`indeterminate` 时省略 `aria-valuenow` 并设 `aria-busy="true"`。
- 必须提供 `aria-label` 或通过 `aria-labelledby` 关联可见标题描述进度含义（如"上传进度"），缺失时开发态告警。
- 状态不以颜色为唯一信号：error 可附文案，success（环形）显示对勾图标，满足 WCAG 1.4.1；Progress 不可聚焦，不进入 Tab 序列。
- `prefers-reduced-motion` 时禁用过渡与 indeterminate 循环动画，避免产生超过 3 次/秒的闪烁（防癫痫）。
