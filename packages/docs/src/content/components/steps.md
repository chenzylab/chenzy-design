---
title: Steps 步骤条
name: steps
category: navigation
brief: 引导用户按照预设的流程逐步完成任务，清晰展示当前步骤、已完成步骤与剩余步骤。
---

## 使用场景

步骤条（Steps）用于引导用户按照预设的流程逐步完成任务，常见于注册引导、订单流程、表单分步提交、向导式配置等场景。它把一个复杂任务拆分为若干阶段，向用户清晰展示「当前在哪一步、已完成哪些步、还剩哪些步」。

核心能力：水平/垂直两种布局方向；fill（默认填充图标）/basic（基础线框）/nav（导航式，整块可点击）/dot（仅圆点，弱化标题）四种类型；单步状态 wait/process/finish/error/warning；内容含标题、描述、自定义图标/序号；可点击步骤支持 onChange 切换；连接线在已完成段落高亮。

## 何时使用

将多步骤任务流程可视化，展示进度与各步状态时使用。需切换面板内容时请用 Tabs。

Steps 不管理业务流转逻辑，仅负责当前步索引 + 各步状态的展示与可选的点击切换；与 Form/Wizard 等容器组件组合使用。步骤数超过 20 项时不建议继续使用横向布局。

## 无障碍

- 容器 `<ol role="list">`（nav 类型外层包 `<nav aria-label>`）；每步 `<li role="listitem">`；当前步设 `aria-current="step"`。
- 每步状态通过可见图标 + 视觉隐藏文本双重表达（如「步骤 2，共 4 步，已完成」），颜色非唯一信息载体。
- 可点击步骤为 `role="button"` 或 `<button>`，键盘可达；键盘：`Tab` 进入/离开整组（单一 tab stop），`Left/Right`（horizontal）或 `Up/Down`（vertical）在可点击步骤间移动焦点，`Home/End` 跳首/末，`Enter/Space` 激活。
- `prefers-reduced-motion` 下禁用连接线进度填充与图标过渡动画。
