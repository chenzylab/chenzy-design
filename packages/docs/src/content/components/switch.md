---
title: Switch 开关
name: switch
category: input
brief: Switch（开关）是一个二态切换控件，用于在「开 / 关」两个互斥状态之间即时切换，操作结果立即生效。
---

## 使用场景

开关（Switch）是一个二态切换控件，用于在「开 / 关」两个互斥状态之间即时切换，操作结果立即生效（与需要提交的 Checkbox 不同）。

适用场景：
- 即时生效的设置项（如「开启通知」「夜间模式」）。
- 表单中的布尔字段（配合 status 校验态）。
- 列表/表格行内的快捷开关（small 尺寸）。
- 异步切换：点击后向服务端确认结果期间展示 loading，避免重复点击。

不适用场景：需要确认提交后再生效的选择，应使用 Checkbox；多选项的单选应使用 Radio；超过两态的应使用 RadioGroup 或 Select。

核心能力：尺寸（small/default/large）、loading 异步态、带文字（开/关态内嵌文案或图标）、受控/非受控、禁用、校验态、自定义开关值（checkedValue/uncheckedValue）。

## 何时使用

- 操作结果需要立即生效时使用（需提交后生效的用 Checkbox）。
- 控制单一布尔设置项时使用（多选项用 Radio 或 Checkbox）。
- 控制破坏性/不可逆设置时，不应仅靠 Switch 即时生效，建议在 change 回调中触发二次确认。

## 无障碍

- 根元素使用 `<button role="switch">`（APG Switch Pattern），优于 checkbox 角色以表达即时生效语义。
- ARIA 属性：`aria-checked="true|false"`（loading 时维持当前态值）；`aria-disabled="true"`（禁用时）；`aria-busy="true"`（loading 时）；`aria-invalid="true"`（status=error 时）；无可见文本时必须提供 `aria-label` 或 `aria-labelledby`。
- 键盘交互：`Space`/`Enter` 切换状态（loading/disabled 时无效）；`Tab`/`Shift+Tab` 进出焦点。
- 焦点环 2px 满足非文本对比 ≥ 3:1；开/关状态不仅靠颜色，还有滑块位移与文字/图标双重表达。

## 文案规范

- **内嵌文字尽量短**（建议不超过 2 个汉字 / 4 个字符），优先用图标承载语义，避免轨道无限加宽。
- **状态文案描述「状态」而非「动作」**：用「开/关」而非「打开/点此关闭」。
- 校验提示文案不内置于 Switch 本身，由外层 FormField 承载。
- 控制破坏性设置时，应在 change 回调中触发二次确认，确认前不更新 value。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 开 / 关 | 打开 / 点此关闭 |
| 关闭双重验证将降低账户安全性，确认关闭？· 关闭 | 确定吗？· 确定 |

- 二次确认主操作按钮用具象动词「关闭」而非「确定」。
