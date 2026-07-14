---
title: SideSheet 侧边滑出面板
name: sidesheet
category: feedback
brief: SideSheet（侧边滑出面板）是一种从视口边缘滑入的浮层容器，用于承载次要任务流、详情展示、表单填写或上下文操作。
---

## 使用场景

SideSheet（侧边滑出面板）是一种从视口边缘（左/右/上/下）滑入的浮层容器，用于承载次要任务流、详情展示、表单填写或上下文操作，在不完全打断主流程的前提下提供更大的内容承载空间。

典型场景：实体详情查看与编辑、筛选/高级搜索面板、购物车、通知中心、多步配置向导。支持模态（mask=true，遮罩 + 锁定 body 滚动）和非模态（mask=false，允许操作外部区域）两种形态。

## 何时使用

当需要在不完全打断主流程的前提下展示较多内容或提供次要任务操作区时使用 SideSheet。Modal 适合居中强阻断的短交互；Popover 适合轻量锚定浮层；Notification 适合全局非阻塞提示。

## 无障碍

- 容器（`.cd-sidesheet-inner`）使用 `role="dialog"` + `tabindex="-1"`；模态（mask=true）额外设 `aria-modal="true"`，非模态（mask=false）不设，避免误导屏幕阅读器。
- 内部 header 使用 `role="heading"` + `aria-level="1"` 表明这是标题区域（对齐 Semi）。
- 有标题时 `aria-labelledby` 关联标题元素 id；无标题须提供 `ariaLabel` 作为可访问名。
- 键盘：`closeOnEsc=true` 时 Esc 关闭；关闭按钮 Enter/Space 激活；`prefers-reduced-motion` 或 `motion=false` 时移除位移动效，保留即时显隐。
