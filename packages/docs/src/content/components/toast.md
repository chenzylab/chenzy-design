---
title: Toast 轻提示
name: toast
category: feedback
brief: Toast 是轻量级全局反馈组件，用于在不打断用户当前操作流的前提下，给出短暂的非阻塞提示。
---

## 使用场景

Toast 是轻量级全局反馈组件，用于在不打断用户当前操作流的前提下，给出短暂的非阻塞提示（成功、信息、警告、错误、加载）。它以命令式 API 为主（`Toast.success('已保存')`），由库内部维护全局挂载点，多条 Toast 在屏幕指定方位堆叠，到时自动消失，也可手动关闭或持久驻留（`duration: 0`）。

核心能力：命令式调用与去重/更新（按 id）、类型预设、自动消失与悬停暂停、堆叠与最大可见数（maxCount）、可配置定位（6 方位）、aria-live 播报、`Toast.promise` Promise 联动。

## 何时使用

在需要以非阻塞方式告知用户操作结果时使用 Toast，文案简短（通常不超过一行半）。比 Toast 信息更丰富（含标题和操作按钮）的使用 Notification；需要强阻断决策的使用 `Modal.confirm`；内嵌在文档流中常驻展示的使用 Banner/Alert。Toast 不承担危险操作的确认职责。

## 无障碍

- 使用单例 live region：error/warning 类型对应 `role="alert"` + `aria-live="assertive"`，info/success/loading 对应 `role="status"` + `aria-live="polite"`；通过 `useLiveAnnouncer` 写入隐藏 live region 播报，避免重复播报。
- 关闭按钮为 `<button>` + `aria-label`（i18n `Toast.close`），Tab 可达，Enter/Space 触发；不自动获取焦点，不创建焦点陷阱。
- 键盘聚焦进入 Toast 时自动暂停计时（`focusin` 暂停/`focusout` 恢复），满足 WCAG 2.2.1 时限可调要求；类型不以颜色为唯一区分，图标形状提供冗余信号。
- `prefers-reduced-motion` 时移除滑入/坍缩位移，仅透明度切换；RTL 下 topLeft/topRight 等方位镜像，内边距使用逻辑属性。
