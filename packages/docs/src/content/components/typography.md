---
title: Typography 排版
name: typography
category: basic
brief: 排版组件族，统一管理文本的字号、行高、字重、颜色语义与文本行为，避免业务侧散落写死值。
---

## 使用场景

Typography 是排版组件族，统一管理文本的字号、行高、字重、颜色语义与文本行为，避免业务侧散落 `font-size` / `color` 写死值。它由四个子组件组成（通过命名空间挂载，亦可独立导入）：

- **Title**：标题，`heading` 级别 1–6，对应渲染 `<h1>`–`<h6>`。
- **Text**：行内文本，渲染 `<span>`，支持各类语义修饰（强调、加粗、删除、下划线、代码、键盘键）。
- **Paragraph**：段落文本，渲染 `<p>`，块级，含间距。
- **Link**：超链接，渲染 `<a>`，含外链安全属性与 disabled 态。

四者共享三组核心行为能力：省略（单行/多行截断，可配展开/收起、tooltip）；复制（尾部追加复制按钮，复制后图标态切换并 announce）；可编辑（双击或点击图标进入 inline 编辑，回车/失焦提交、ESC 取消）。

定位：几乎所有上层组件（Card、List、Form label、Description 等）的文本基座。

## 何时使用

需要语义化文本展示时使用：标题层级用 Title 并匹配 heading 级别；仅放大字号时通过 `component` 改标签保留视觉；长文本需截断时优先 CSS clamp，需展开/tooltip 才走测量路径；链接跳转用 Link。

不适用于富文本编辑（交给独立 RichText）、Markdown 渲染、数学公式。

## 无障碍

- Title 渲染真实 `<h1>`–`<h6>`，不破坏文档大纲；Paragraph→`<p>`，Link→`<a>`，Text→`<span>`。
- copyable 复制按钮为 `<button type="button">`，`aria-label` 来自 i18n；复制成功通过 `aria-live="polite"` 朗读。
- editable 编辑触发为 `<button>`；进入编辑 textarea 自动聚焦，ESC 取消并把焦点送回触发按钮。
- 键盘：copy/edit/expand 按钮均可 Tab 聚焦、Enter/Space 触发；编辑态 Enter 提交、Shift+Enter 换行、Esc 取消。
