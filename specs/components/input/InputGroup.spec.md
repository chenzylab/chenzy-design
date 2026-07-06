# SPEC · InputGroup

> 分类：input · 阶段：M2（增补，深度对标发现——Semi 正式导出的 Input 子组件）
> 对标 Semi：[Input.Group / InputGroup](https://semi.design/zh-CN/input/input)（`export { InputGroup }`）
> 输入组合容器：将多个输入类组件（Input/Select/DatePicker 等）无缝拼接为一组，统一尺寸/圆角/标签。

## 1. 概述

InputGroup 把多个输入组件拼接成一体（相邻边框合并、首尾圆角、统一 size），可选整组 label。典型场景：区间输入（起止日期/价格）、带前后选择器的输入、复合查询条件。

## 2. 设计语义

**何时用**：多个输入控件需视觉上拼成一组。
**何时不用**：单输入 + 前后缀 → Input 的 addonBefore/addonAfter（已支持）。InputGroup 用于**多个独立输入控件**拼接，超出单 Input addon 能力。

## 3. 分层实现

- 纯渲染，无 core。`InputGroup.svelte`（`packages/svelte/src/input/` 内），包裹 children，通过 context 或 CSS 统一 size、合并相邻边框、首尾圆角。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 整组尺寸（透传/协调各子输入）。 |
| `label` | `LabelProps` | — | 整组标签（复用 Form label 语义）。 |
| `labelPosition` | `'top' \| 'left' \| ...` | — | 标签位置。 |
| `onFocus` / `onBlur` | `(e) => void` | — | 组级焦点事件。 |
| `disabled` | `boolean` | `false` | 整组禁用（透传子输入）。 |
| `class` / `style` | `string` | — | 根节点。 |
| `children` | `Snippet` | — | 子输入控件。 |

### Slots

default：子输入控件（Input/Select/DatePicker 等）。

## 5. 主题 / Token 表

`--cd-inputgroup-*`（拼接边框合并/圆角），复用 Input token。

## 6. 无障碍

- 组容器 `role="group"` + aria-label/aria-labelledby（关联 label）。
- 各子输入保留自身 a11y；相邻控件焦点顺序自然。

## 7. 国际化

- label 文案由使用方提供，走 i18n。无内置文案。

## 8. 文案

- 无内置。

## 9. 性能

svelte gzip ≤ 1.5 KB。CSS 拼接 + context 协调 size，无重运行时。

## 10. AI 元数据

`name: 'InputGroup'`、`relatedTo: 'Input'`、`semiEquivalent: 'InputGroup'`。examples：区间输入、带 Select 前缀的输入、整组 label。

## 11. 测试

- 组件：children 拼接渲染、size 统一、首尾圆角、label/labelPosition、disabled 透传、组级 focus/blur。
- a11y（`*.a11y.test.ts`）：role=group + label 关联。

## 12. 验收标准

- [ ] 复用 Input · [ ] 类型+JSDoc · [ ] Token · [ ] a11y · [ ] i18n · [ ] 测试 · [ ] Perf · [ ] meta · [ ] docs demo
