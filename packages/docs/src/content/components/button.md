---
title: Button 按钮
name: button
category: basic
brief: 触发即时操作的按钮，是最基础的交互原子。
---

## 使用场景

触发即时操作的按钮，是最基础的交互原子。

## 何时使用

用于触发动作（提交、打开弹窗、跳转）。强调主操作用 primary，一组操作中只有一个主按钮。危险操作用 danger。链接式跳转优先考虑 `Typography.Link`。

## 无障碍

- 渲染原生 `<button>`（或 `href` 时使用真链接语义）。
- 键盘：Enter/Space 触发；`href` 形态用浏览器原生链接行为。
- `disabled` → 原生 disabled + `aria-disabled`；loading → `aria-busy="true"`。
- 仅图标按钮必须有 `aria-label`（缺失则 dev 警告）。
