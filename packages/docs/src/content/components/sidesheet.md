---
title: SideSheet 侧边滑出面板
name: sidesheet
category: feedback
brief: SideSheet（侧边滑出面板）是一种从视口边缘滑入的浮层容器，用于承载次要任务流、详情展示、表单填写或上下文操作。
---

## 使用场景

侧边滑出面板（SideSheet）是一种从视口边缘（左/右/上/下）滑入的浮层容器，用于承载次要任务流、详情展示、表单填写或上下文操作，在不完全打断主流程的前提下提供更大的内容承载空间。

典型场景：实体详情查看与编辑、筛选/高级搜索面板、购物车、通知中心、多步配置向导。支持模态（mask=true，锁定滚动与焦点）和非模态（mask=false，允许与主页面并行交互）两种形态。本库以 SideSheet 统一 Drawer 能力，不再提供独立 Drawer 组件。

## 何时使用

当需要在不完全打断主流程的前提下展示较多内容或提供次要任务操作区时使用 SideSheet。Modal 适合居中强阻断的短交互；Popover 适合轻量锚定浮层；Notification 适合全局非阻塞提示。

## 无障碍

- 模态（mask=true）容器使用 `role="dialog"` + `aria-modal="true"`；非模态（mask=false）使用 `role="dialog"` 但不设 `aria-modal`（或 `role="complementary"`），避免误导屏幕阅读器。
- 有标题时 `aria-labelledby` 关联标题元素 id；无标题须提供 `ariaLabel`；模态打开时对背景兄弟节点施加 `aria-hidden="true"`/`inert`。
- 焦点管理：打开时焦点移入面板，模态时 Tab/Shift+Tab 在面板内循环（`useFocusTrap`），关闭后焦点返回触发元素。
- 键盘：Esc 关闭（仅栈顶），Tab/Shift+Tab 焦点循环，关闭按钮 Enter/Space 激活；`prefers-reduced-motion` 时移除位移动效，保留即时显隐。

## 文案规范

- **标题**用名词短语，描述面板内容主体（如「编辑用户」「高级筛选」），避免句末标点。
- **关闭按钮**用图标按钮，`aria-label` 用动词「关闭」，不显示可见文字。
- **Footer 操作**主操作用具体动词（「保存」「应用筛选」）优于泛化的「确定」。
- 承载不可逆操作时，主操作按钮用 danger 语义并明确后果，文案为具体动词加对象。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 编辑用户 | 编辑用户。 |
| 应用筛选 | 确定 |
| 删除此项 | 确定 |
| 放弃未保存的更改？ | 关闭？ |

- 面板存在未保存编辑时，关闭意图应由业务侧拦截并弹出二次确认，SideSheet 本身不自动丢弃。
