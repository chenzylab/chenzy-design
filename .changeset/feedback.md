---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

新增 Feedback 用户反馈弹窗（对标 Semi 2.101.0，全量核实时发现的漏判组件——Semi 正式 `export { Feedback }`）。以 Modal 或 SideSheet 形态收集结构化用户反馈，纯组合本库现成组件。

- svelte：`Feedback.svelte` 按 `mode`（modal→Modal / popup→SideSheet）复用外壳，按 `type`（text→TextArea / emoji→自建 radiogroup 表情行 / radio→RadioGroup / checkbox→CheckboxGroup / custom→renderContent slot）渲染内容；外壳的 focus-trap / inert / Esc / 锁滚直接复用。
- props：mode / type / value（FeedbackValue = string | string[] | EmojiResult）/ onValueChange / options / textAreaProps / renderContent / content / onOk（异步 await 期间外壳 loading）/ onCancel / afterClose / emojis + 透传外壳（open / title / width / placement / onOpenChange）。value 归一化内联（逻辑简单，未建 core）。
- a11y：emoji 评分 `role="radiogroup"` + 每 emoji `role="radio"` + aria-label（表情语义走 i18n）+ 方向键 roving 选择（对齐 Rating 键盘范式）；提交 loading 时按钮 aria-busy；外壳 dialog / focus-trap / Esc 复用 Modal / SideSheet。
- tokens：`--cd-feedback-emoji-size` / `--cd-feedback-emoji-gap` / `--cd-feedback-emoji-active-scale` / `--cd-feedback-content-gap`。
- locale：`Feedback.{submit,cancel,placeholder,ratingLabel,emojiVeryBad/Bad/Neutral/Good/VeryGood}`（zh_CN / en_US）。
