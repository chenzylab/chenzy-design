# SPEC · AIChatDialogue

> 分类：show（Semi 归 Ai） · 阶段：M4（富媒体补齐 · AI 子件）
> 对标 Semi：[AIChatDialogue](https://semi.design/zh-CN/ai/aiChatDialogue)
> **最高约束：一切以 Semi 实现为准**。消息格式以 OpenAI Response Object 为原型，API/类型/渲染对齐 Semi。偏离登记。
> **依赖**：内容渲染复用 **MarkdownRender**；头像复用 **Avatar**；可复用 Chat 的滚动/back-bottom/提示区基建。**不依赖 tiptap**（区别于 AIChatInput）。

## 1. 概述
展示 AI 聊天对话信息。消息格式以 OpenAI Response Object 为原型，支持文本/文件/图片/代码/思考块(reasoning)/引用(annotation)/工具调用(tool call) 等 ContentItem 块的展示，配 Adapter 把 OpenAI API 返回转成可展示的 Message。

## 2. 设计语义
- **用**：接 OpenAI Response / Chat Completion API 的 AI 对话展示；搭配 AIChatInput 构建完整 AI 会话。
- **与 Chat 区别**：Chat 是通用会话（简单 Message{role,content,status}）；AIChatDialogue 面向 OpenAI 消息格式（ContentItem 多块 + Adapter + 更细的 status）。
- **不用**：普通非 AI 会话 → 用 Chat。

## 3. 分层实现
- **headless / 数据（core/）**：`packages/core/src/ai-chat-dialogue.ts`
  - 类型：`Message`（id/content(string|ContentItem[])/role/status(queued|in_progress|incomplete|completed|failed|cancelled)/model/createdAt…）、`ContentItem`（对齐 Semi foundation：InputMessage/OutputMessage/OutputText/InputText/InputImage/InputFile/Reasoning/Annotation/ToolCall 等）、`RoleConfig`/`Metadata`/`Reference`。
  - **Adapter 转换函数**（对齐 Semi dataAdapter）：
    - **P0（本次做）**：`responseToMessage`（Response Object → Message，非流式，Semi 源码仅 322B，简单）、`chatCompletionToMessage`（ChatCompletion → Message[]，非流式）。
    - ~~**P1（本次登记为后续）**~~ **✅ 已于 2026-07-05 落地**：`streamingResponseToMessage`、`streamingChatCompletionToMessage` —— 流式增量状态机，**全功能逐条移植自 Semi**（无序缓冲 + sequence_number 顺序处理 + MAX_GAP 容错 + 20+ chunk 类型 delta 累积 / choice.index 分组 + processedCount 增量 + tool_calls 累积）。core 纯 reducer，8 单测。
    - `messageToChatInput` / `chatInputToChatCompletion`（配合 AIChatInput，AIChatInput 落地后补）。
  - 消息增删/选择/滚动逻辑可复用 core/chat 的 helper。
- **渲染（svelte/）**：
  - `AIChatDialogue.svelte`（容器：消息流 + 提示区 + 选择模式，复用 Chat 滚动基建）。
  - `DialogueBox.svelte`（单条消息：头像/标题/内容(ContentItem 分块渲染)/操作区/status）。
  - `ContentItemRenderer.svelte`（按 ContentItem.type 分派渲染：text→MarkdownRender、image→img、file→文件卡、code→CodeHighlight、reasoning→折叠思考块、annotation→引用角标、tool_call→工具调用块）。`renderDialogueContentItem` 允许覆盖。
  - `DialogueStep.svelte`（AIChatDialogue.Step 分步展示）。

## 4. API（对齐 Semi，核心）
### Props（节选，完整以 Semi 文档 + interface.d.ts 为准）
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| chats | `Message[]` | - | 受控对话列表 |
| roleConfig | `RoleConfig` | **必填** | 角色配置（user/assistant/system → Metadata 或 Map） |
| align | `'leftRight' \| 'leftAlign'` | `leftRight` | 布局 |
| mode | `'bubble' \| 'noBubble' \| 'userBubble'` | `bubble` | 气泡模式 |
| hints | `string[]` | - | 提示信息 |
| selecting | `boolean` | `false` | 选择模式 |
| showReference | `boolean` | `false` | 用户消息展示可引用图标 |
| showReset | `boolean` | `true` | 展示重置操作 |
| markdownRenderProps | `MarkdownRenderProps` | - | 透传内容渲染 |
| renderDialogueContentItem | `DialogueContentItemRendererMap` | - | 按类型覆盖内容渲染 |
| escapeHtml | `boolean` | `true` | 转义用户消息 HTML |
### Events（对齐 Semi）
`onChatsChange` / `onHintClick` / `onSelect` / `onMessageCopy` / `onMessageDelete` / `onMessageReset` / `onMessageEdit` / `onMessageShare` / `onMessageGoodFeedback` / `onMessageBadFeedback` / `onReferenceClick` / `onAnnotationClick` / `onFileClick` / `onImageClick`。
### Methods（ref）
`selectAll` / `deselectAll` / `scrollToBottom(animation)` / `scrollToTop(animation)`。
### 子组件 / 静态
`AIChatDialogue.Step`（分步）；`AIChatDialogue.defaultComponents`（默认 MarkdownRender 组件集，含增强 Code）。
### Adapter（core 导出）
`responseToMessage` / `chatCompletionToMessage`（P0）；streaming 版 P1 登记。

## 5. 主题 / Token
复用 Chat 的气泡/头像 token；ContentItem 各块（reasoning 折叠/annotation 角标/tool call/code）补专属 token，全走 alias。对照 Semi aiChatDialogue.scss（16K）挑关键 class 挂 token。

## 6. 无障碍
> 对齐优先。消息流 role=log/aria-live；选择模式 checkbox 语义；各操作按钮 aria-label 走 i18n；reasoning 折叠块 disclosure ARIA。

## 7. 国际化
- i18n key：`AIChatDialogue.{copy,delete,reset,edit,share,like,dislike,reasoning,references,selectAll,...}`。全走 locale。

## 8. 文案
遵循 content-guidelines。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | 待实测校准 |
- 长会话考虑虚拟化（后续）；ContentItem 渲染按类型惰性。

## 10. AI 元数据
提供 `meta.ts`。

## 11. 测试
- 单测（core）：responseToMessage / chatCompletionToMessage 转换正确；ContentItem 类型判定。
- e2e/dom：各 ContentItem 类型渲染（text/image/file/code/reasoning/annotation）；选择模式；renderDialogueContentItem 覆盖。
- a11y：axe + 消息流 role=log。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
- [ ] streaming Adapter 作为 P1 明确登记（本次非阻塞）

## 13. 本次范围与登记（务实分层）
- **本次做**：Message/ContentItem 类型 + 非流式 Adapter（responseToMessage/chatCompletionToMessage）+ 渲染层（text/image/file/code/reasoning/annotation 分块，复用 MarkdownRender/CodeHighlight/Avatar）+ 选择/提示/操作 + a11y/i18n/token/meta/测试。
- **已落地**：`streamingResponseToMessage` / `streamingChatCompletionToMessage`（流式 Adapter，全功能，2026-07-05，见 §13 上方）；`messageToChatInput` / `chatInputToChatCompletion`（随 AIChatInput PR #425 落地）。
- **仍登记为后续（P1，可选）**：消息编辑（messageEditRender）、tool_call/MCP 完整块交互（当前基础展示已够）。
