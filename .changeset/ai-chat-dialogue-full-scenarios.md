---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/locale": minor
---

AIChatDialogue 全场景对齐 Semi：补齐引用（references）与自定义渲染会话框（dialogueRenderConfig）两块能力，并将 docs demo 补全至 Semi 官方全部场景。

组件新增能力：

- **引用 references**：`AIDialogueMessage` 增显式 `references` 字段；新增 `showReference` prop（仅 user 消息生效）+ `onReferenceClick` 回调；DialogueBox 在内容下方渲染引用区，支持文本引用（两行裁剪）与文件引用（带图标），全走 alias token。补 `AIChatDialogue.references` locale（zh/en）。
- **自定义渲染会话框 dialogueRenderConfig**（对齐 Semi 最新 `dialogueRenderConfig`，非旧 `chatBoxRenderConfig`）：新增 `render-config.ts` 定义 `DialogueRenderConfig`（`renderDialogueAvatar` / `renderDialogueTitle` / `renderDialogueContent` / `renderDialogueAction` + 整块 `renderFullDialogue`）。DialogueBox 将头像/标题/内容/操作四区块抽为 `default*` snippet，各区块可覆盖或整块替换，`default*` 节点可复用。类型从 svelte 主 index 导出（并补 `ContentItem` 原名）。

docs demo 补齐（4 → 12），按 Semi 官方顺序排列：消息状态、引用、选择、提示、自定义渲染提示、自定义渲染会话框、自定义渲染消息、流式数据转换（`streamingResponseToMessage` 逐块增量归约驱动）。`meta.ts` 与 spec §4 同步新增 props/events/slots。
