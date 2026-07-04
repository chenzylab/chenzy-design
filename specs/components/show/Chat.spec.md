# SPEC · Chat

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[Chat](https://semi.design/zh-CN/plus/chat)
> **最高约束：一切以 Semi 实现为准**。API 命名、prop 语义、默认值、消息模型、模式、快捷键、DOM/class 严格对齐 Semi。Semi 没有的行为默认不加；增强须登记偏离。
> **依赖**：内容渲染复用本库 **MarkdownRender**（已合入，Chat 中默认 `format='md'`）；附件复用 **Upload**（已有）；代码块高亮走 **CodeHighlight/prismjs**（Semi 底层同）。

## 1. 概述
快速搭建对话内容容器。用于普通会话与 AI 会话：消息流、SSE 流式更新、附件上传、角色配置、提示区、丰富的插槽自定义。

## 2. 设计语义
- **用**：AI 对话 UI、客服/IM 会话。
- **不用**：仅展示单条富文本 → MarkdownRender 即可。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/chat.ts` —— 移植 Semi `ChatFoundation` 的框架无关逻辑：滚动到底/返回底部按钮显隐（SHOW_SCROLL_GAP=100、SCROLL_ANIMATION_TIME=300）、消息发送/清除上下文、附件粘贴/拖拽/点击上传的判定、hint 点击。状态与 adapter 注入（getContainerRef/registerWheelEvent/notify*）。常量对齐：ROLE(user/assistant/system/divider)、CHAT_ALIGN(leftRight/leftAlign)、MESSAGE_STATUS(loading/incomplete/complete/error)、MODE(bubble/noBubble/userBubble)、SEND_HOT_KEY(enter/shift+enter)。
- **渲染（svelte/）**：
  - `Chat.svelte`（容器 + 消息列表滚动区 + back-bottom 按钮 + 输入区 + 提示区 + 顶/底插槽）。
  - `ChatBox.svelte`（单条消息：头像/标题/内容/操作区/状态）——内容用 MarkdownRender 渲染（`markdownRenderProps` 透传）。
  - `InputBox.svelte`（输入框 + 上传按钮 + 发送，sendHotKey 判定，enableUpload 三态）。
  - `Hint.svelte`（提示区）。
  - 大量 `renderXxx` 自定义渲染点用 Svelte snippet 实现（对齐 Semi 的 render props）。

## 4. API（对齐 Semi，节选核心；完整表以 Semi 文档 + interface.d.ts 为准）
### Props（核心）
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| chats | `Message[]` | - | 受控对话列表 |
| roleConfig | `RoleConfig` | - | 角色信息（user/assistant/system：name/avatar/color） |
| align | `'leftRight' \| 'leftAlign'` | `leftRight` | 布局 |
| mode | `'bubble' \| 'noBubble' \| 'userBubble'` | `bubble` | 气泡模式 |
| sendHotKey | `'enter' \| 'shift+enter'` | `enter` | 发送快捷键 |
| showClearContext | `boolean` | `false` | 显示清除上下文 |
| showStopGenerate | `boolean` | `false` | 显示停止生成 |
| hints | `string[]` | - | 提示信息 |
| enableUpload | `boolean \| {pasteUpload;dragUpload;clickUpload}` | `true` | 上传开关（三态） |
| uploadProps | `UploadProps` | - | 透传 Upload |
| markdownRenderProps | `MarkdownRenderProps` | - | 透传内容渲染（默认 format=md） |
| placeholder | `string` | - | 输入占位 |
| topSlot / bottomSlot | `Snippet` | - | 顶/底插槽 |
### Events（对齐 Semi 回调）
`onChatsChange` / `onMessageSend` / `onInputChange` / `onClear` / `onHintClick` / `onStopGenerator` / `onMessageCopy` / `onMessageDelete` / `onMessageReset` / `onMessageGoodFeedback` / `onMessageBadFeedback`。
### 自定义渲染（Svelte snippet，对齐 Semi render props）
`renderInputArea` / `renderChatBoxAvatar` / `renderChatBoxTitle` / `renderChatBoxContent` / `renderChatBoxAction` / `renderFullChatBox` / `renderHintBox` / `renderDivider`。
### Methods（ref）
`resetMessage` / `scrollToBottom(animation)` / `clearContext` / `sendMessage(content, attachment)`。
### 类型（对齐 Semi）
`Message{role,name,id,content,parentId,createAt,status}`、`Content{type:'text'|'image_url'|'file_url', ...}`、`RoleConfig{user,assistant,system}`、`Metadata{name,avatar,color}`。

## 5. 主题 / Token
气泡/头像/输入框/提示/分割线全走 token，深浅双主题。
| Token | 默认 | 用途 |
|---|---|---|
| `--cd-chat-bubble-user-bg` | 品牌浅 | 用户气泡 |
| `--cd-chat-bubble-assistant-bg` | fill | 助手气泡 |
| `--cd-chat-input-bg` | fill-0 | 输入框 |
| `--cd-chat-hint-bg` | fill | 提示区 |
| `--cd-chat-divider` | border | 分割线 |
| `--cd-chat-action-icon` | text-2 | 操作图标 |
（禁写死；核对 Semi class 结构挂 token。）

## 6. 无障碍（见 a11y.spec.md）
> 对齐优先。补：消息流 `role=log`/`aria-live=polite`（新消息播报）、输入框 `aria-label`、操作按钮 aria-label 走 i18n、发送/停止按钮语义。SSE 流式更新用 live region 但节流避免刷屏。
- 键盘：输入框 sendHotKey（enter / shift+enter）对齐 Semi；提示项可 Tab + Enter。
- reduced-motion：滚动动画降级。RTL：气泡镜像（对齐 Semi rtl.scss）。

## 7. 国际化
- i18n key：`Chat.{send,stop,clear,copy,delete,reset,like,dislike,upload,placeholder,loading,error}` 等。全走 locale。

## 8. 文案
- 操作/状态文案遵循 content-guidelines。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | 待实测校准（大组件，参照 Semi 体量设初值 +15%） |
| SSE 流式 | `chats` 高频更新时内容编译（MarkdownRender）需 debounce；滚动节流 |
- 长会话考虑消息列表虚拟化（可作为后续增强，先对齐 Semi 的普通渲染 + 是否 Semi 已虚拟化以 foundation 为准）。

## 10. AI 元数据
提供 `meta.ts`：props/events/slots/methods/tokens/examples。

## 11. 测试
- 单测（core）：滚动 back-bottom 显隐阈值、发送/清除、enableUpload 三态判定、sendHotKey 判定、消息状态。
- e2e/dom：渲染消息流（各 status 样式）、发送触发 onMessageSend、hint 点击、清除上下文、自定义 render snippet。
- a11y：axe + 消息流 role=log + 输入 aria + 键盘发送。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
