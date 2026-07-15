---
title: Progress 进度条
name: progress
category: feedback
brief: Progress 是进度指示组件，用于展示用户操作的当前进度和状态。
---

## 使用场景

Progress 是进度指示组件，用于展示用户操作的当前进度和状态，一般在操作耗时较长时使用，也可用来表示任务/对象的完成度，缓解等待焦虑。支持两种形态：线形（line，可横向 `horizontal` 或纵向 `vertical`，适合表单提交、文件上传、页面加载等场景）和环形（circle，圆环，适合卡片、统计面板等需要紧凑展示百分比的场景）。

Progress 支持受控进度值 `percent`（0–100）、自定义填充色 `stroke`（字符串或按 `percent` 区间取色的数组，配合 `strokeGradient` 自动生成渐变）、自定义轨道色 `orbitStroke`、`format` 格式化信息区文本，以及平滑的数字滚动与过渡动画。

## 何时使用

在需要向用户展示某项操作进度时使用 Progress。不内置文件上传逻辑，仅消费外部传入的 `percent`；不内置分步骤导航（用 Steps）。`showInfo` 控制是否展示百分比数字/中心文本，环形小号（`size="small"`）不展示中心文本。

## 无障碍

- 根节点设 `role="progressbar"`，配置 `aria-valuenow`、`aria-valuemin="0"`、`aria-valuemax="100"`。支持传入 `aria-valuetext`，按 W3C 规范其将优先于 `aria-valuenow` 被屏幕阅读器消费（如"Step 2: Copying files..."）。
- 通过 `aria-label` 说明进度条代表的具体含义（如"disk usage"），或用 `aria-labelledby` 关联外部可见标题元素。
- `prefers-reduced-motion` 或 `motion={false}` 时禁用数字滚动与过渡动画。Progress 不可聚焦，不进入 Tab 序列。
