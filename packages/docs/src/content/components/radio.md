---
title: Radio 单选框
name: radio
category: input
brief: Radio 用于在一组互斥选项中选择单一值。
---

## 使用场景

Radio 用于在一组互斥选项中选择**单一**值。单独的 `<Radio>` 极少独立使用，绝大多数场景由 `<RadioGroup>` 统一托管 `value` / `on:change` / `name` / `disabled` / 校验态，子项间由浏览器原生 radio 分组（同 `name`）形成单一焦点环。

典型用例：
- 表单中的二选一 / 多选一设置项（如"性别""配送方式"）。
- 配合 `type="button"` 渲染为**按钮组（Radio Button）**，作视图切换、过滤器。
- 配合 `type="card"` 渲染为**卡片选择**，承载更丰富的描述/图标。

边界（区分相邻组件）：
- 互斥但选项多、需搜索/虚拟化 → 用 `Select`。
- 可多选 → 用 `Checkbox` / `CheckboxGroup`。
- 视觉上是开关、单一布尔 → 用 `Switch`。

## 何时使用

- 需要从一组互斥选项中单选时使用（选项多且需搜索时应使用 Select）。
- 选项常驻可见，数量在 2~20 项之间，不需要折叠收起时使用。
- 需要即时生效的二态切换时应使用 Switch 而非 Radio。

## 无障碍

- 严格对齐 Semi：**全类型**（default / button / card / pureCard）均用原生 `<input type="radio">`（`mode="advanced"` 时为 `<input type="checkbox">`）；button/card 型时 input 绝对定位盖满容器承接点击与键盘。`aria-labelledby` 默认指向 addon 节点、`aria-describedby` 指向 extra 节点（对齐 Semi）。
- RadioGroup 根元素使用 `role="radiogroup"`，通过 `aria-labelledby` 或 `aria-label` 关联可见标题；校验失败时经 `ariaInvalid` 透传 `aria-invalid="true"`，`ariaDescribedby` / `ariaErrormessage` 指向错误说明（对齐 Semi）。
- 键盘交互由浏览器原生 radio 分组（同 `name`）接管，无 JS roving：`Tab` 进入组时焦点落在选中项（无选中时落在首个可用项）；`ArrowDown`/`ArrowRight` 移到下一项并即时选中、`ArrowUp`/`ArrowLeft` 移到上一项，到边界循环；无选中项时 `Space` 选中当前聚焦项。
