---
title: Tag 标签
name: tag
category: show
brief: Tag（标签）用于对事物进行标记、分类或属性归纳。
---

## 使用场景

标签（Tag）用于对事物进行标记、分类或属性归纳，是高密度信息场景下的轻量展示原子。典型用途包括：状态标记（成功/警告/失败）、分类标记（文章标签、商品属性）、可关闭的筛选条件回显、可选中的多选项（filter chip）。

Tag 默认是纯展示组件，但提供两种可交互形态：可关闭（closable，右侧出现关闭图标，点击触发移除）和可选中（checkable，整体作为切换控件）。配套的 TagGroup 支持 `maxTagCount` 折叠 + +N 溢出提示。

## 何时使用

在需要对内容打标记、分类归纳或提供多选筛选项时使用 Tag。与 Button 区分：Tag 不承担主操作，权重低；与 Badge 区分：Badge 是依附于其他元素的小角标，Tag 是独立信息单元；与 Checkbox 区分：checkable Tag 是视觉化的紧凑多选，语义上仍为 checkbox。

## 无障碍

- 纯展示 Tag 渲染为 `<span>`，无需 role，不可聚焦，纯文本由读屏器顺序读取；不以颜色为唯一状态通道，需辅以文本或图标。
- closable Tag 的关闭区为独立 `<button type="button">`，`aria-label` 插值标签文本（如"移除 已完成"），Tab 可达，Enter/Space 触发关闭。
- checkable Tag 根元素使用 `role="checkbox"` + `aria-checked` + `tabindex="0"`，Space/Enter 切换选中态；`disabled` 时设 `aria-disabled="true"` 并移出 Tab 序。
- TagGroup 的 +N 按钮使用 `<button>` 并设置 `aria-label`（插值数量）；`prefers-reduced-motion` 时禁用选中/关闭过渡。

## 文案规范

- **简短**：标签文本建议 ≤ 4 字 / 1-2 词，名词或形容词，无句子与句末标点。
- **大小写规范**：英文用 Sentence case 或既定术语，不全大写（品牌缩写除外）。
- **状态语义一致**：成功类统一"已完成/Active"，失败类统一"失败/Failed"，避免同义混用。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 已完成 | 该任务已经完成了。 |
| Active | ACTIVE |
| 失败 | 失败 / 错误 / 未通过（混用） |

- closable Tag 的关闭为轻量可逆操作，无需确认；若移除触发不可逆业务，应在 `on:close` 中拦截弹确认。
