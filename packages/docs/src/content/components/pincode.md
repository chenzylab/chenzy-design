---
title: PinCode 验证码输入框
name: pincode
category: input
brief: PinCode 用于分格输入定长验证码 / 一次性密码（OTP）/ 短信码，将定长字符串拆到 count 个独立输入格，逐格填入、自动跳格、支持整串粘贴自动分发。
---

## 使用场景

PinCode 用于**分格输入定长验证码 / 一次性密码（OTP）/ 短信码 / 分格密码**。将一个定长字符串拆到 `count` 个独立输入格，逐格填入、自动跳格、支持整串粘贴自动分发到各格。核心能力：

- **字符校验（format）**：`number` 纯数字（inputMode=numeric）、`mixed` 数字+字母、`RegExp` 逐字符 test、函数逐字符判定。
- **自动跳格**：填入合法字符后自动前进到下一格；填满末格自动 blur 并触发 `onComplete`。
- **键盘可达**：`←`/`→` 切格、`Backspace` 清空并回退、`Delete` 清空并前进，首末不越界。
- **粘贴分发**：任一格粘贴整串，从当前格起逐字符按 `count` 上限分发，遇非法字符停止。
- **受控 / 非受控**：`value` + `onChange` 受控，`defaultValue` 非受控。
- **附加能力**：`count`、`size`、`disabled`、`status` 校验态、`name`（隐藏聚合 input 提交整串）。

典型使用场景：登录二次验证、短信验证码、支付密码。

## 何时使用

- 需要输入固定位数、逐位可见的短码（4~8 位为主）时使用。
- 变长 / 长文本用 `Input`；需要遮蔽的长密码用 `Input type="password"`。

## 无障碍

- 根容器 `role="group"`，配 `aria-label`（i18n 默认「验证码」）或 `aria-labelledby` 关联外部 label。
- 每格 `aria-label` 播报位次「第 N 位，共 M 位」；`autoComplete="one-time-code"` 支持系统级 OTP 填充；`inputMode` 随 `format` 切换（number→numeric）；`maxlength="1"`。
- `status="error"` 时各格 `aria-invalid="true"`；`disabled` 时 `aria-disabled` + 各格原生 disabled。
- 键盘全流程无鼠标可操作：`←`/`→` 切格、`Backspace`/`Delete` 清空、合法字符自动跳格、`Home`/`End` 跳首末。RTL 下方向键语义镜像。
- 输入法组合态（isComposing）不写入，避免中文候选误入。
- `autoFocus` 默认 `false`（偏离 Semi 的 `true`）：遵循全库不擅自抢焦点约定。
