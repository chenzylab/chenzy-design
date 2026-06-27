---
title: Form 表单
name: form
category: input
brief: Form 是表单容器组件，负责承载并编排一组输入控件，提供字段注册、值收集、校验、错误展示与布局四大核心能力。
---

## 使用场景

Form 是表单容器组件，负责承载并编排一组输入控件（Input/Select/Checkbox/Radio/DatePicker 等），提供字段注册、值收集、校验、错误展示与布局四大核心能力。它向下通过 Context 暴露表单实例，向上通过受控 `value`/`on:change` 或非受控 `initValues` 管理整棵表单状态树。

适用场景：登录/注册、设置面板、数据录入、筛选条件区、向导步骤表单。区别于单个 Input 的局部受控，Form 关注**跨字段聚合状态**（dirty/touched/validating/errors）与**提交生命周期**。

核心子组件：
- `Form`：容器，持有 `createForm` 实例，提供 Context。
- `Form.Field`（或 `cd-form-field`）：单字段包裹器，完成注册、Label、必填星标、错误/提示文案、校验态联动。
- `Form.Section` / `Form.Slot`：分组与自由插入。

为获得"开箱即用"体验，Form 同时提供已绑定的字段封装（如 `Form.Input`、`Form.Select`），等价于 `Form.Field` + 对应控件，自动接管 `value`/`on:change`/`status`。

非目标：不内置网络提交（仅暴露 `on:submit` 携带校验结果）；不内置复杂联动 DSL（通过 `dependencies` + 函数式 rules 表达）。

## 何时使用

- 需要统一管理一组输入字段的值收集、校验与提交生命周期时使用。
- 需要跨字段联动校验（如确认密码与密码字段）时使用 `dependencies`。
- 简单独立的单字段受控输入可直接使用具体控件而不必套 Form。

## 无障碍

- 每个 `Form.Field` 通过 `useId` 生成 `id`，Label 用 `for={id}` 关联；控件 `aria-describedby` 指向 `extraText` 和错误文案节点。
- 必填控件加 `aria-required="true"`；必填星标本身 `aria-hidden="true"`（避免读屏念"星号"）。
- 校验失败控件加 `aria-invalid="true"`；错误文案容器使用 `role="alert"` 或 `aria-live="polite"`。
- 提交失败后焦点移至首个错误字段（`scrollToError` + `.focus()`）；表单不劫持 Tab，保持自然 tab 序。

## 文案规范

- **错误文案聚焦「如何修正」而非指责**：用「请输入有效的邮箱地址」而非「邮箱错了」。
- **必填提示简洁**，避免冗余的「该字段是必须填写的」，统一用「为必填项」。
- **前置引导用 `extraText`**（如「密码需 8 位以上」），减少校验失败概率。
- 错误短句不加句末标点，与 Semi 一致。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 请输入有效的邮箱地址 | 邮箱错了 |
| 用户名为必填项 | 该字段是必须填写的 |
| 密码需 8 位以上 | 输入有误 |

- 「重置/清空」会清除大量已填内容时，应由调用方用 Modal/Popconfirm 二次确认，破坏性按钮文案用动词明确「清空」而非模糊的「确定」。
