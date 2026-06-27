---
title: Popconfirm 气泡确认框
name: popconfirm
category: feedback
brief: Popconfirm 是一种轻量级的就地确认气泡，点击触发元素后在其旁边弹出带标题、内容、确认/取消按钮的小型浮层。
---

## 使用场景

Popconfirm 是一种轻量级的就地确认气泡：点击触发元素后，在其旁边弹出一个带标题、内容、确认/取消按钮的小型浮层，用户必须显式确认或取消才能继续。它定位在 Tooltip/Popover 与 Modal 之间——比 Modal 更轻、不打断主流程上下文（锚定在触发元素旁），但比 Tooltip 多了「必须做出决策」的交互语义。

典型用例：删除单行数据、移除标签、清空列表等破坏性/不可逆操作的二次确认；启用/禁用开关；退出未保存的编辑。

## 何时使用

当需要在破坏性操作（删除、清空、禁用）前进行就地轻量确认时使用 Popconfirm。信息量大、需要表单/多步交互的场景使用 Modal；仅展示信息无需决策的使用 Popover/Tooltip；全局非阻塞提示使用 Toast/Notification。

## 无障碍

- 浮层根节点使用 `role="dialog"`，配置 `aria-labelledby` 关联标题 id、`aria-describedby` 关联内容 id；触发元素设 `aria-haspopup="dialog"`、`aria-expanded` 和 `aria-controls`。
- 打开后焦点移入浮层，默认聚焦取消按钮（危险操作防误触，符合最佳实践）；关闭后焦点归还触发元素；浮层内 Tab 循环（轻量 focus trap）。
- 键盘交互：Esc 关闭并触发 cancel，Tab/Shift+Tab 在浮层内可聚焦元素间循环，Enter/Space 激活确认/取消按钮。
- 危险操作语义通过文案与图标承载，不以颜色为唯一信号；`prefers-reduced-motion` 时禁用 scale 动效。
