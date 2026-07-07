# SPEC · Input

> 分类：input · 阶段：M2
> 对标 Semi Input。**示范组件**：作为「受控表单输入类」组件 SPEC 的范例。

## 1. 概述
单行文本输入框，表单最基础录入控件。

## 2. 设计语义
用于短文本录入。多行用 Textarea，数值用 InputNumber，选项用 Select。

## 3. 分层实现
- **headless**：受控/非受控值管理、清除逻辑、组合输入（IME composition）处理可抽到 core 的 `createInput`（便于跨框架复用）。
- **渲染**：`Input.svelte`，内含前后缀、清除按钮、计数。

## 4. API
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| value | `string` | — | 受控值 |
| defaultValue | `string` | `''` | 非受控初值 |
| size | `'small'\|'default'\|'large'` | `'default'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| readonly | `boolean` | `false` | 只读 |
| placeholder | `string` | — | 占位符 |
| clearable | `boolean` | `false` | 显示清除按钮 |
| showCount | `boolean` | `false` | 显示字数 |
| maxLength | `number` | — | 最大长度 |
| status | `'default'\|'warning'\|'error'` | `'default'` | 校验态 |
| prefix / suffix | `Snippet` | — | 前后缀 |
| addonBefore / addonAfter | `Snippet \| string` | — | 输入框外前置/后置标签（如 `https://` / `.com`） |
| borderless | `boolean` | `false` | 无边框模式 |
| type | `'text'\|'password'\|...` | `'text'` | 原生 type；password 带显隐切换 |
| getValueLength | `(value: string) => number` | — | 自定义字符计数（emoji 按可见长度计），用于 showCount 与 maxLength |
| hideSuffix | `boolean` | `false` | 有值时隐藏 suffix |
| composition | `boolean` | `false` | 输入法模式：开启后 IME 未确认期间不触发 on:change，确认后触发一次（对齐 Semi） |
| clearIcon | `Snippet` | — | 自定义清除图标（clearable 有值时替换默认图标，对齐 Semi） |
| preventScroll | `boolean` | `false` | 命令式 focus() 时是否阻止滚动文档 |
### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| on:change | `string` | 值变化（受控约定）|
| on:input | `string` | 每次输入（含 IME 处理后）|
| on:clear | — | 点击清除 |
| on:enterPress | `KeyboardEvent` | 回车 |
| on:focus / on:blur | `FocusEvent` | |
| on:keyDown / on:keyUp / on:keyPress | `KeyboardEvent` | 透传原生键盘事件（对齐 Semi）|
| on:compositionStart / on:compositionEnd / on:compositionUpdate | `CompositionEvent` | 透传原生输入法事件（对齐 Semi）|
### Slots
| 名称 | 说明 |
|---|---|
| prefix / suffix | 前后缀内容 |
| clearIcon | 自定义清除图标 |
### Methods
通过组件实例（`bind:this`）调用（对齐 Semi）：

| 方法 | 说明 |
|---|---|
| `focus()` | 命令式聚焦输入框（尊重 preventScroll） |
| `blur()` | 命令式移除焦点 |

## 5. 主题 / Token

Input 已全量对齐 Semi 填充式（DSM P2）：容器走 `--cd-color-input-*` 填充式
token（灰底 + 透明描边，聚焦换 focus 边框），全表见 `packages/tokens/src/components/input.ts`
（102 token）与 docs 组件页「设计变量」。以下为代表性 token（值均取自 token 源）：

| Token | 默认 | 用途 |
|---|---|---|
| --cd-color-input-default-bg-default | var(--cd-color-fill-0) | 容器背景（填充式灰底） |
| --cd-color-input-default-border-default | transparent | 容器描边（默认透明） |
| --cd-color-input-default-bg-hover | var(--cd-color-fill-1) | 背景 - 悬浮 |
| --cd-color-input-default-border-focus | var(--cd-color-focus-border) | 聚焦边框 |
| --cd-color-input-danger-border-focus | var(--cd-color-danger) | 错误态聚焦边框 |
| --cd-color-input-warning-border-focus | var(--cd-color-warning) | 警告态聚焦边框 |
| --cd-height-input-wrapper-default | var(--cd-control-height-default) | 容器高度 |
| --cd-radius-input-wrapper | var(--cd-border-radius-small) | 圆角 |
| --cd-width-input-wrapper-border | var(--cd-border-thickness-control-focus) | 描边宽度 |

组件消费别名（跨表单控件共用，默认值 = 对应填充式 token）：`--cd-input-color-bg`
`--cd-input-border` `--cd-input-radius` `--cd-input-border-active` `--cd-input-border-error`
`--cd-input-padding-x` `--cd-input-font-size`。

## 6. 无障碍
- 渲染原生 `<input>`，由 Form 关联 `<label>`（`for`/`aria-labelledby`）。
- 校验态 error → `aria-invalid="true"` + 通过 `aria-describedby` 关联错误文案。
- 清除按钮是 `<button aria-label>`（用 i18n 文案），可键盘聚焦。
- password 显隐切换按钮有 `aria-label` 与 `aria-pressed`。
- 计数信息对 SR 友好（`aria-live` 视情况）。
- 正确处理 IME composition，组合期间不触发 change。

## 7. 国际化
- key：`Input.clear`、`Input.showPassword`、`Input.hidePassword`、`Input.countSeparator`。
- showCount 文案随 locale。

## 8. 文案
- placeholder 提示输入内容，不替代 label；遵循 content-guidelines。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 3.5 KB |
| 输入响应 | 无明显延迟；受控更新不抖动 |
- 高频输入场景使用方建议自行 debounce；组件不强制。

## 10. AI 元数据
提供 `component.meta.ts`。

## 11. 测试
- 单测：受控/非受控、maxLength、clearable、showCount、status、IME composition。
- e2e：键盘录入、清除按钮聚焦与触发、password 切换。
- a11y：axe 0 violations；error 态 aria-invalid + describedby 正确。

## 12. 验收标准
对照 AGENTS.md §5 DoD 全勾。
