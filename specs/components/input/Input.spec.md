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

> 本表由 `packages/svelte/src/input/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string` | `undefined` | 受控值；提供则为受控 |
| defaultValue | `string` | `''` | 非受控初始值 |
| size | `'small'\|'default'\|'large'` | `'default'` |  |
| disabled | `boolean` | `false` |  |
| readonly | `boolean` | `false` |  |
| placeholder | `string` | `undefined` |  |
| showClear | `boolean` | `false` | 有内容且 hover/focus 时展示清除按钮（对齐 Semi showClear） |
| maxLength | `number` | `undefined` | 原生 maxlength（getValueLength 存在时不下发，改由 JS 按可见长度截断） |
| minLength | `number` | `undefined` | 最小长度，下发原生 minlength 触发校验（getValueLength 存在时按可见长度换算，对齐 Semi） |
| validateStatus | `'default'\|'warning'\|'error'\|'success'` | `'default'` | 校验状态，仅影响展示样式（对齐 Semi validateStatus；success 合法但无特殊样式） |
| mode | `'password'` | `undefined` | 输入框模式，password 启用密码显隐按钮（对齐 Semi mode） |
| type | `string` | `'text'` | 原生 input type，透传（对齐 Semi type，可为 number/email/search 等） |
| prefix | `Snippet \| string` | `undefined` | 前缀标签（输入框内左侧）；字符串直接渲染，Snippet 自定义（对齐 Semi） |
| suffix | `Snippet \| string` | `undefined` | 后缀标签（输入框内右侧）；字符串直接渲染，Snippet 自定义（对齐 Semi） |
| insetLabel | `Snippet \| string` | `undefined` | 内嵌标签（与 prefix 同槽，对齐 Semi insetLabel） |
| insetLabelId | `string` | `undefined` | 内嵌标签容器 id（对齐 Semi insetLabelId） |
| clearIcon | `Snippet` | `undefined` | 自定义清除图标（showClear 有值时替换默认图标，对齐 Semi） |
| addonBefore | `Snippet \| string` | `undefined` | 前置标签（如 "https://"） |
| addonAfter | `Snippet \| string` | `undefined` | 后置标签（如 ".com"） |
| borderless | `boolean` | `false` | 无边框模式（对齐 Semi borderless） |
| getValueLength | `(value: string) => number` | `undefined` | 自定义字符计数函数，替代默认长度（存在时接管 maxLength 校验） |
| hideSuffix | `boolean` | `false` | 清除按钮与后缀并存时隐藏后缀（对齐 Semi hideSuffix） |
| style | `string` | `undefined` | 根容器内联样式（对齐 Semi style） |
| class | `string` | `undefined` | 根容器自定义类名（对齐 Semi className） |
| inputStyle | `string` | `undefined` | input 元素内联样式（对齐 Semi inputStyle） |
| preventScroll | `boolean` | `false` | 调用 focus() 时传入 { preventScroll }（对齐 Semi） |
| autoFocus | `boolean` | `false` | 组件挂载时自动聚焦（对齐 Semi） |
| composition | `boolean` | `false` | 输入法模式：开启后 IME 未确认期间不触发 onChange，确认后触发一次（对齐 Semi） |
| name | `string` | `undefined` |  |
| id | `string` | `undefined` | 透传到原生 <input id>，供 <label for> 精确关联 |
| aria-label | `string` | `undefined` |  |
| ariaLabelledby | `string` | `undefined` | 对齐 Semi aria-labelledby |
| ariaDescribedby | `string` | `undefined` | 关联说明/错误文本 |
| ariaErrormessage | `string` | `undefined` | 对齐 Semi aria-errormessage |
| ariaRequired | `boolean` | `undefined` | 必填语义（Form.Field required 透传）：输出 aria-required |
| onChange | `(value: string, e: Event) => void` | `undefined` | 内容变化（对齐 Semi：第二参为原生事件） |
| onInput | `(value: string, e: Event) => void` | `undefined` |  |
| onClear | `(e: MouseEvent) => void` | `undefined` | 点击清除按钮（对齐 Semi：透传鼠标事件） |
| onEnterPress | `(e: KeyboardEvent) => void` | `undefined` | 回车按下（composition 中不触发） |
| onFocus | `(e: FocusEvent) => void` | `undefined` |  |
| onBlur | `(e: FocusEvent) => void` | `undefined` |  |
| onKeyDown | `(e: KeyboardEvent) => void` | `undefined` | 透传原生 keydown（对齐 Semi） |
| onKeyUp | `(e: KeyboardEvent) => void` | `undefined` |  |
| onKeyPress | `(e: KeyboardEvent) => void` | `undefined` |  |
| onCompositionStart | `(e: CompositionEvent) => void` | `undefined` |  |
| onCompositionEnd | `(e: CompositionEvent) => void` | `undefined` |  |
| onCompositionUpdate | `(e: CompositionEvent) => void` | `undefined` |  |

**子组件**：`TextArea`、`InputGroup`
### Events
> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。
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
- key：`Input.showPassword`、`Input.hidePassword`（Input slice 仅此两键）。清除按钮 `aria-label` 由调用方传入；字数计数分隔符走 `Textarea.countFormat`，Input 自身不产出计数文案。
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
