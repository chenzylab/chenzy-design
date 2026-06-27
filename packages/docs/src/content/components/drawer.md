---
title: Drawer 抽屉
name: drawer
category: feedback
brief: Drawer（抽屉）是从视口边缘滑入的浮层容器，承载临时性的次要任务流。
---

## 使用场景

Drawer（抽屉）是从视口边缘滑入的浮层容器，承载临时性的次要任务流：表单编辑、详情查看、筛选面板、设置项等。相比 Modal 居中弹窗，Drawer 不打断主内容的空间认知，适合内容较长、需要并行参照主界面的场景。

Drawer 支持四方向滑入（left/right/top/bottom）、可选遮罩、可拖拽/预设宽高、嵌套多层、关闭后销毁内容等能力。本库的 SideSheet 为 Drawer 的别名导出，二者能力完全一致。

## 何时使用

当需要在不打断主内容的前提下，提供一个较大面积的临时任务区（如长表单编辑、详情浏览、筛选配置）时使用 Drawer。关键确认或短交互使用 Modal（居中强阻断）；简单信息展示使用 Popover；快速轻量提示使用 Toast/Notification。

## 无障碍

- 面板容器使用 `role="dialog"` + `aria-modal="true"`（有遮罩时）；通过 `aria-labelledby` 关联标题，无标题时提供 `aria-label`，缺少可访问名称时开发态告警。
- 打开时焦点移入面板内首个可聚焦元素，Tab/Shift+Tab 在面板内循环（`useFocusTrap`）；关闭后焦点归还触发元素（`returnFocusOnClose`）。
- 有遮罩时对面板外内容设置 `inert`/`aria-hidden`，屏幕阅读器与指针均不可达背景内容。
- 键盘交互：Esc 关闭（仅栈顶 Drawer 响应），Tab/Shift+Tab 焦点循环，关闭按钮 Enter/Space 激活；`prefers-reduced-motion` 时禁用位移过渡。
