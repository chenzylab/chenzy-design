---
title: Notification 通知提醒框
name: notification
category: feedback
brief: Notification（通知提醒框）是一种命令式的全局反馈组件，用于在页面角落弹出短时或可常驻的消息卡片。
---

## 使用场景

通知提醒框（Notification）是一种命令式的全局反馈组件，用于在页面角落弹出短时或可常驻的消息卡片，承载比 Toast/Message 更丰富的内容（标题 + 描述 + 操作按钮 + 图标），且不打断用户主流程。

典型场景：后台任务完成提示、新消息到达、带「撤销/查看详情」操作的反馈、错误堆栈摘要。支持六个位置（topLeft/top/topRight/bottomLeft/bottom/bottomRight）、多条堆叠、自动关闭与悬停暂停、`duration=0` 常驻模式。

## 何时使用

当需要在不打断主流程的前提下告知用户某事件发生时使用 Notification。信息量小且无需操作区的轻提示使用 Toast；需要强阻断用户决策的使用 `Modal.confirm`；破坏性操作的确认不应放在 Notification 中。

## 无障碍

- 通知卡片使用 `role="status"`（default/success/info）或 `role="alert"`（warning/error），分别对应 `aria-live="polite"` 与 `assertive`；可由 `role` prop 强制指定。
- 卡片通过 `aria-labelledby` 关联标题 id，通过 `aria-describedby` 关联内容 id（均由 `useId` 生成）。
- 关闭按钮为 `<button aria-label>`，Tab 可达，Enter/Space 触发；通知非模态，不抢占焦点，不创建焦点陷阱。
- 键盘聚焦进入通知时自动暂停计时（满足 WCAG 2.2.1 时限可调）；Esc 在焦点位于通知内时可关闭该条；`prefers-reduced-motion` 时禁用滑入/坍缩动画。

## 文案规范

- **标题**用名词短语，简洁说明「发生了什么」，可省略句号且不超过一行，如「文件已上传」。
- **内容**补充必要细节或后续动作，用完整句，避免与标题重复。
- **操作按钮**动词开头、不超过 4 字，主操作至多 1 个；error 类聚焦「出了什么问题 + 可恢复路径」。
- 不承载需确认的破坏性操作，删除等不可逆动作应走 Modal.confirm。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 标题「保存失败」，内容「网络中断，未保存的更改已暂存本地」，操作「重试」 | 标题「Error 500」，内容「保存失败了！！！」 |
| 撤销 / 查看 | 点击这里查看详情 |
| 文件已上传 | 你又上传错文件了 |

- error 类仅用于「已发生的失败」事后告知，不在 footer 放一键执行不可逆操作的按钮。
