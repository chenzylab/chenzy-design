---
title: Banner 横幅通知
name: banner
category: feedback
brief: Banner 是页面级/区块级的横幅通知组件，用于在内容流的顶部或局部容器内持续展示一条具有特定语义的提示信息。
---

## 使用场景

Banner 是页面级/区块级的横幅通知组件，用于在内容流的顶部或局部容器内持续展示一条具有特定语义（信息、成功、警告、危险）的提示信息。与 Toast（短暂、漂浮、自动消失）和 Notification（角标、可堆叠）不同，Banner 是内嵌在文档流中、需要用户主动关注甚至主动关闭的常驻反馈，适合表达「当前页面/模块的全局状态」，例如系统维护公告、表单提交结果、订阅过期提醒、降级提示等。

Banner 支持四种语义类型（info/success/warning/danger）、两种视觉密度（full 铺满/card 卡片）、可关闭模式、标题加描述双层文案与尾部操作区。

## 何时使用

当需要在页面顶部或某个区块内以常驻横幅形式向用户展示全局性状态提示时使用 Banner。自动消失的轻提示使用 Toast，可堆叠的角标消息使用 Notification，需要用户交互决策的使用 Modal。

## 无障碍

- 根节点使用 `role="alert"`（danger/warning 类型）或 `role="status"`（info/success），分别对应 `aria-live="assertive"` 与 `aria-live="polite"`；静态首屏内容降为 `role="region"` + `aria-label` 避免无意义播报。
- 标题节点 id 通过 `aria-labelledby` 关联根节点，描述节点通过 `aria-describedby` 关联，使 Banner 具备完整可访问名称。
- 关闭按钮为 `<button type="button">`，配置 i18n `aria-label`；Tab 可达，Enter/Space 触发关闭；关闭后焦点不丢失，回退至前一个可聚焦元素。
- `prefers-reduced-motion` 时禁用 slide/fade 关闭动画；不以颜色为唯一语义通道，图标形状提供冗余区分。
