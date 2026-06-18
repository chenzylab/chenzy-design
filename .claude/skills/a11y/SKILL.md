---
name: a11y
description: chenzy-design 无障碍实现手册。当为组件实现键盘交互、ARIA、焦点管理、对比度或编写 a11y 测试时使用。
---

# SKILL · 无障碍（a11y）

> 配套 SPEC：`specs/00-foundation/a11y.spec.md`。基线 WCAG 2.1 AA。

## 决策流程
1. **有没有原生语义元素可用？** 有就用（`<button>`/`<input>`/`<a>`），别用 div 模拟。
2. **是复合控件吗？**（Menu/Tabs/Listbox/Radio）→ 照 WAI-ARIA APG 模式：roving tabindex + 方向键 + 正确 role/aria。
3. **有浮层吗？**（Modal/Drawer/Dropdown）→ focus trap + Esc 关闭 + 焦点归还 + 背景 inert/scroll lock。

## 复用 core 原语（别重复造）
`useFocusTrap` · `useRovingTabindex` · `useDismiss`(外部点击/Esc) · `useScrollLock` · `useLiveAnnouncer` · `useId`。

## 必查清单
- [ ] 仅键盘可完成全部交互（Tab/Enter/Space/方向键/Esc）。
- [ ] role 与 aria-*（expanded/selected/checked/disabled/invalid/busy）正确且随状态更新。
- [ ] label 关联：`aria-labelledby` / `aria-describedby` / 原生 `<label for>`。
- [ ] 仅图标按钮有 `aria-label`。
- [ ] `:focus-visible` 焦点环可见（`--cd-focus-ring`），不裸 `outline:none`。
- [ ] 对比度 ≥ 4.5:1（大字 3:1）。
- [ ] `prefers-reduced-motion` 下禁用非必要动效。
- [ ] 支持 `dir="rtl"`，样式用逻辑属性（`*-inline-start/end`）。
- [ ] 动态内容用 `aria-live` 播报。

## 测试
- axe（@axe-core/playwright）→ 0 violations。
- 关键组件写「纯键盘」e2e。
- 断言 focus trap 与焦点归还。
