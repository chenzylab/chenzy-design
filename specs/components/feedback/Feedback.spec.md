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

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-feedback-emoji-size` | emoji 表情尺寸 | `--cd-font-size-header-3` |
| `--cd-feedback-emoji-gap` | emoji 行间距 | `--cd-spacing-base` |
| `--cd-feedback-emoji-active-scale` | 选中 emoji 放大 | `1.2` |
| `--cd-feedback-content-gap` | 内容区块间距 | `--cd-spacing-base` |

外壳视觉复用 Modal/SideSheet token。

## 6. 无障碍

- 外壳复用 Modal/SideSheet 的 a11y（role=dialog + focus-trap + Esc + 背景 inert，已有）。
- emoji 评分：`role="radiogroup"` + 每个 emoji `role="radio"` + aria-label（表情语义文本，如「满意」）+ 键盘方向键选择（对齐 Rating 模式）。
- 文本区：TextArea 已有 a11y。
- radio/checkbox 类型复用 Radio/Checkbox 的 a11y。
- 提交/取消按钮键盘可达；onOk loading 时 aria-busy。

## 7. 国际化

- i18n key（locale `Feedback`）：`submit`（提交）、`cancel`（取消）、`placeholder`（文本占位）、emoji 表情默认 aria-label（如 `emojiVeryBad/bad/neutral/good/veryGood`）。
- 提交/取消文案 + emoji 语义走 locale。

## 8. 文案

- 内置提交/取消/占位/emoji 语义走 i18n，遵循 content-guidelines（简洁、动作明确）。

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
- `doNot`：不要用它做通用表单（用 Form）；emoji 必须有语义 aria-label。

## 11. 测试

- **单元（core，如建）**：FeedbackValue 归一化（string/string[]/EmojiResult）、onValueChange 触发。
- **组件**：mode 切换 Modal vs SideSheet；type 五种渲染；emoji 选择；文本输入；radio/checkbox；onOk 异步 loading；renderContent 自定义。
- **a11y**：axe 无违规；emoji radiogroup + 键盘；外壳 dialog/focus-trap；提交按钮 aria-busy。
- **视觉回归**：五种 type × modal/popup × 暗色。
- **i18n**：提交/取消/emoji 语义随 locale。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（复用 Modal/SideSheet + Rating/TextArea/Radio/Checkbox） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（emoji radiogroup + 外壳复用）
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
