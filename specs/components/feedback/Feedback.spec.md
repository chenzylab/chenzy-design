# SPEC · Feedback

> 分类：feedback · 阶段：M5（增补，对标 Semi 后补齐——全量核实时发现漏判，实为 Semi 正式导出组件）
> 对标 Semi：[Feedback](https://semi.design/zh-CN/show/feedback)（`export { Feedback }`）
> 用户反馈收集弹窗：以 Modal 或 popup(SideSheet) 形态收集反馈——emoji 评分 / 文本 / 单选 / 多选 / 自定义。纯组合本库 Modal / SideSheet + Rating / Input / Radio / Checkbox。

## 1. 概述

Feedback 弹出一个反馈收集面板，用户可选 emoji 表情评分、填文本、单选/多选，提交反馈。典型场景：产品满意度、功能反馈、NPS 评分。以弹窗（modal）或抽屉（popup/SideSheet）呈现。

## 2. 设计语义

**何时用**：需要在弹层中收集结构化用户反馈（评分+文本）。
**何时不用**：
- 普通表单 → Form。
- 单纯确认对话 → Modal/Popconfirm。
- 内联评分 → Rating。

## 3. 分层实现

- **headless（core/）**：反馈值状态（emoji/text/选项）可放 `packages/core/src/feedback.ts`（value 归一化 + onValueChange），或内联。core 禁 any。
- **渲染（svelte/）**：`Feedback.svelte` 按 `mode` 复用本库 **Modal**（modal）或 **SideSheet**（popup）作外壳，内部按 `type` 渲染 emoji 表情行 / TextArea / Radio / Checkbox / 自定义内容。复用 Rating（或自定义 emoji 行）、TextArea、Radio、Checkbox。

## 4. API

### Props

> 本表由 `packages/svelte/src/feedback/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `'popup' \| 'modal'` | `popup` | 展示模式：popup=SideSheet 抽屉；modal=Modal 弹窗 |
| type | `'text' \| 'emoji' \| 'radio' \| 'checkbox' \| 'custom'` | `emoji` | 反馈内容类型 |
| onValueChange | `(value: string \| string[] \| Object) => void` | `-` | 反馈内容变化时的回调 |
| textAreaProps | `TextAreaProps` | `-` | 设置多行输入框的参数 |
| radioGroupProps | `RadioGroupProps` | `-` | 设置单选的参数（含 options） |
| checkboxGroupProps | `CheckboxGroupProps` | `-` | 设置多选的参数（含 options） |
| renderContent | `(content: Snippet) => Snippet` | `-` | 自定义反馈内容展示（接收已渲染的默认内容） |
| onOk | `(e) => void \| Promise<any>` | `-` | 点击确定回调，返回 promise 时 resolve 后自动关闭 |
| onCancel | `(e) => void \| Promise<any>` | `-` | 取消回调，返回 promise 时 resolve 后自动关闭 |
| okButtonProps | `ButtonProps` | `-` | 设置提交按钮的参数（type=custom 时可用 disabled 控制禁用） |
| cancelButtonProps | `ButtonProps` | `-` | 设置取消按钮的参数 |
| afterClose | `() => void` | `-` | 关闭后回调 |
| ...rest | `ModalProps \| SideSheetProps` | `-` | mode=modal 透传 ModalProps；mode=popup 透传 SideSheetProps（含 visible/title/footer/width 等） |

### Events

见 onValueChange / onOk / onCancel / afterClose。

### Slots

| 名称 | 说明 |
| --- | --- |
| content | 自定义反馈内容（等价 renderContent，type=custom 时） |

## 5. 主题 / Token 表

> 本表按 `packages/svelte/src/feedback/meta.ts` 的 `tokens` 数组真源重写（2026-08-23），逐条镜像 Semi
> `semi-foundation/feedback/variables.scss`（名称/值/公式），此前列的 `--cd-feedback-emoji-size` 等均为
> Semi 对齐前的编造名，从未被实现消费。

| Token | 含义 | 默认值 / 引用 |
| --- | --- | --- |
| `--cd-color-feedback-thank-text` | 感谢文字颜色 | `var(--cd-color-text-2)` |
| `--cd-width-feedback` | 除文本类型外的弹窗宽度（modal 恒用；popup 非 text 用） | `400px` |
| `--cd-width-feedback-text` | 文本类型（type=text）popup 宽度 | `600px` |
| `--cd-spacing-feedback-emoji-container-column-gap` | emoji 容器内间距 | `24px` |
| `--cd-spacing-feedback-emoji-container-margin-y` | emoji 容器上下外边距 | `24px` |
| `--cd-spacing-feedback-thank-text-margin-top` | 感谢文字顶部间距 | `24px` |
| `--cd-spacing-feedback-thank-text-margin-bottom` | 感谢文字底部间距 | `0px` |
| `--cd-spacing-feedback-checkbox-group-vertical-row-gap` | 多选框组行间距 | `16px` |
| `--cd-spacing-feedback-footer-column-gap` | 底部按钮间距 | `12px` |
| `--cd-spacing-feedback-sidesheet-bottom-right` | popup 底部弹窗右间距 | `20px` |
| `--cd-spacing-feedback-sidesheet-bottom-inner-wrap-bottom` | popup 底部弹窗离视口底部悬浮间距（非贴底 0） | `50px` |
| `--cd-font-feedback-emoji-font-size` | emoji 尺寸 | `36px` |
| `--cd-font-feedback-thank-text-font-size` | 感谢文字字号 | `var(--cd-font-size-regular)` |
| `--cd-font-feedback-thank-text-line-height` | 感谢文字行高 | `20px` |
| `--cd-font-feedback-thank-text-font-weight` | 感谢文字字重 | `var(--cd-font-weight-regular)` |
| `--cd-radius-feedback-sidesheet-inner` | popup 面板圆角 | `12px` |

外壳其余视觉（modal 400px 宽、footer 布局等）复用 Modal/SideSheet 自身 token；emoji 字体族对齐 Semi
硬编码 `font-family: Inter`，走本库 `--cd-font-family-regular`（含 Inter + 系统回退链）。

## 6. 无障碍

> 以下如实反映 Semi 官方实现（2026-08-23 于 semi.design 真机核实），而非规划态描述。

- 外壳复用 Modal/SideSheet 的 a11y（role=dialog + focus-trap + Esc + 背景 inert，已有）。
- **emoji 评分对齐 Semi 原样，无 `role`/`tabindex`/`aria-label`**：真机核实 semi.design 官方 emoji 为纯裸
  `<span data-value="..." onClick>`，无任何无障碍属性，键盘不可达。本库严格对齐此行为，不自造
  `role="radio"`/`role="button"`/keydown 键盘增强——那属于超出 Semi 的自造能力，已移除。
- 文本区：TextArea 已有 a11y。
- radio/checkbox 类型复用 Radio/Checkbox 的 a11y。
- 提交/取消按钮键盘可达（原生 `<button>`）；onOk/onCancel 返回 Promise 时按钮 `loading` 态（视觉态，非
  `aria-busy`，对齐 Semi 未加 aria-busy）。

## 7. 国际化

- i18n key（locale `Feedback`）：仅 `submit`（提交）、`cancel`（取消），对齐 Semi locale 定义。
- **emoji 占位文案硬编码英文，不走 locale**：对齐 Semi 源码 `placeholder='Provider additional feedback'` /
  `'Provider additional feedback(optional)'` 字面硬编码（Semi 自身未国际化此文案，本库如实对齐，非缺陷）。
- emoji 语义（😞😐😃）无 aria-label，故无对应 i18n key（对齐 Semi 无障碍缺口，见 §6）。

## 8. 文案

- 提交/取消走 i18n（见 §7）；emoji 占位文案对齐 Semi 硬编码英文（非 i18n，见 §7）；文案内容遵循
  content-guidelines（简洁、动作明确）。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 3.5 KB | 组合壳（Modal/SideSheet/Rating/TextArea 为兄弟组件 externalize） |
| core（如建） gzip | ≤ 0.8 KB | value 归一化 |

- 复用外壳与子组件，惰性渲染（弹窗关闭时不渲染内容，随 Modal/SideSheet destroyOnClose）。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'Feedback'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Feedback'`。
- props schema；`FeedbackValue` 联合类型说明；`examples`：emoji 满意度、文本反馈、单选原因、多选、自定义内容、popup 抽屉形态。
- `doNot`：不要用它做通用表单（用 Form）；`type=custom` 时须自行经 `okButtonProps.disabled` 控制提交禁用
  （对齐 Semi）；不要给 emoji 补 role/aria-label/键盘增强（超出 Semi 的自造能力，见 §6）。

## 11. 测试

- **组件**：mode 切换 Modal vs SideSheet；type 五种渲染；emoji 选择（裸 span+click，无键盘）；文本输入；
  radio/checkbox；onOk/onCancel 异步 loading；renderContent 自定义；modal 模式下用户传 `okButtonProps`
  整体替换内置 `disabled` 强制值（对齐 Semi `{...restProps}` 展开顺序）。
- **a11y**：外壳 dialog/focus-trap/Esc 正常；emoji 无 role/aria-label 属预期行为（非回归）。
- **视觉回归**：五种 type × modal/popup × 暗色；popup 底部悬浮 50px 偏移与滑入/滑出动画位移量。
- **i18n**：提交/取消/emoji 语义随 locale。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（复用 Modal/SideSheet + Rating/TextArea/Radio/Checkbox） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（emoji radiogroup + 外壳复用）
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
