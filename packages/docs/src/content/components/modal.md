---
title: Modal 模态对话框
name: modal
category: feedback
brief: Modal 是模态对话框，在当前页面之上覆盖一层，需用户处理后才能继续。
---

## 使用场景

Modal 是模态对话框，在当前页面之上覆盖一层，需用户处理后才能继续操作。它用于打断式的关键交互场景，例如危险操作二次确认、重要表单填写、信息告知等。

Modal 提供声明式组件用法与命令式 API（`Modal.confirm/info/warning/error`），支持受控显隐、自定义宽度、确认/取消按钮配置、内容区 slot 等。适合需要用户明确做出决策、不宜在当前页面内嵌处理的场景。

## 何时使用

当需要完全打断用户操作、强制要求用户处理当前事项时使用 Modal。轻量反馈（如操作成功）使用 Toast/Notification；侧边详情或表单编辑使用 Drawer/SideSheet；就地的轻量确认使用 Popconfirm。

## 无障碍

- 容器使用 `role="dialog"` + `aria-modal="true"`，`aria-labelledby` 关联标题，`aria-describedby` 关联内容区。
- 打开时焦点移入弹层（首个可聚焦元素或关闭按钮），Tab 循环不逃出弹层（`useFocusTrap`）；关闭后焦点归还触发元素。
- Esc 关闭（受 `keyboard` 控制），点击遮罩关闭（受 `maskClosable` 控制）；背景内容对屏幕阅读器 `aria-hidden`/`inert`。
- 关闭按钮为 `<button aria-label>` 原生按钮；`prefers-reduced-motion` 时用即时显隐替代动画。

## 文案规范

- **标题陈述动作**，正文说明后果。
- **按钮回显动作**：用「删除 / 取消」而非「确定 / 取消」。
- 危险/不可逆操作用 danger okType 加明确文案。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 删除「项目 A」？· 删除后无法恢复。· 删除 / 取消 | 确认？· 确定 / 取消 |
| 退出登录？· 退出 / 取消 | 你确定吗？· 是 / 否 |
