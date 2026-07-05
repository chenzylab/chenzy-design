/**
 * Machine-readable component metadata for AI/docs consumption.
 * AIChatDialogue — aligned to Semi Design AIChatDialogue（OpenAI Response Object
 * 消息格式 + ContentItem 分块渲染 + 非流式/流式 Adapter）。headless 类型与转换在
 * @chenzy-design/core（ai-chat-dialogue）。
 */
export const meta = {
  name: 'AIChatDialogue',
  category: 'show',
  description:
    'AI 对话展示：消息格式以 OpenAI Response Object 为原型，content 支持 ContentItem[]（output_text/input_text 走 MarkdownRender、image、file、reasoning 折叠块、function_call/tool_call 工具块、refusal、audio）。逐条 DialogueBox 渲染，ContentItemRenderer 按 type 分派、renderDialogueContentItem 可覆盖。消息流 role=log/aria-live=polite；滚动出现回到底部；选择模式 checkbox。ref 方法 selectAll/deselectAll/scrollToBottom/scrollToTop。core 提供类型全谱 + 非流式 Adapter（responseToMessage / chatCompletionToMessage）+ 流式 Adapter（streamingResponseToMessage 全功能增量状态机：sequence_number 顺序处理/无序缓冲/MAX_GAP 容错/20+ chunk 类型 delta 累积；streamingChatCompletionToMessage：choice.index 分组/processedCount 增量/tool_calls 累积），全功能对齐 Semi。',
  exports: ['AIChatDialogue'],
  props: [
    { name: 'chats', type: 'AIDialogueMessage[]', default: '[]', desc: '受控对话列表（OpenAI 消息格式）' },
    { name: 'roleConfig', type: 'AIDialogueRoleConfig', default: 'undefined', desc: '角色配置（user/assistant/system → Metadata 或 Map，对齐 Semi 必填）' },
    { name: 'align', type: "'leftRight'|'leftAlign'", default: "'leftRight'", desc: '布局对齐' },
    { name: 'mode', type: "'bubble'|'noBubble'|'userBubble'", default: "'bubble'", desc: '气泡模式' },
    { name: 'hints', type: 'string[]', default: 'undefined', desc: '提示信息' },
    { name: 'selecting', type: 'boolean', default: 'false', desc: '选择模式（消息前置 checkbox）' },
    { name: 'showReset', type: 'boolean', default: 'true', desc: '展示重置操作' },
    { name: 'markdownRenderProps', type: 'object', default: 'undefined', desc: '透传内容渲染的 MarkdownRender props' },
    { name: 'renderDialogueContentItem', type: 'Record<string, Snippet<[ContentItem]>>', default: 'undefined', desc: '按 ContentItem.type 覆盖渲染' },
  ],
  events: [
    { name: 'onChatsChange', payload: 'chats: AIDialogueMessage[]', desc: '对话列表变更' },
    { name: 'onHintClick', payload: 'hint: string', desc: '点击提示' },
    { name: 'onSelect', payload: 'selectedIds: string[]', desc: '选择变更' },
    { name: 'onMessageCopy', payload: 'message', desc: '复制消息' },
    { name: 'onMessageDelete', payload: 'message', desc: '删除消息' },
    { name: 'onMessageReset', payload: 'message', desc: '重置消息' },
    { name: 'onMessageGoodFeedback', payload: 'message', desc: '正向反馈' },
    { name: 'onMessageBadFeedback', payload: 'message', desc: '负向反馈' },
    { name: 'onFileClick', payload: 'file', desc: '文件点击' },
    { name: 'onImageClick', payload: 'image', desc: '图片点击' },
    { name: 'onMessageEdit', payload: 'message', desc: '点击编辑操作（P1）' },
  ],
  slots: [
    { name: 'renderDialogueContentItem', payload: 'ContentItem（按 type 覆盖）', desc: '按 ContentItem.type 覆盖渲染' },
    { name: 'messageEditRender', payload: 'AIChatInputMessageContent', desc: 'user 消息 editing 态替代内容（放 AIChatInput 编辑器，P1）' },
  ],
  methods: [
    { name: 'selectAll', desc: '全选所有消息' },
    { name: 'deselectAll', desc: '取消全选' },
    { name: 'scrollToBottom', desc: '滚动到底部（animation?）' },
    { name: 'scrollToTop', desc: '滚动到顶部（animation?）' },
  ],
  a11y: {
    role: '消息流 role=log；选择 checkbox；reasoning 折叠 aria-expanded；操作按钮 aria-label 走 i18n',
    keyboard: '操作按钮 Tab 可达；提示项可点',
  },
  tokens: [
    '--cd-ai-dialogue-*（复用 chat 气泡/头像 token + reasoning/tool/file 块）',
  ],
  examples: [
    { title: '基础对话', desc: 'chats + roleConfig，ContentItem 分块渲染' },
    { title: 'Adapter', desc: 'responseToMessage / chatCompletionToMessage 把 OpenAI 返回转 Message' },
    { title: '流式 Adapter', desc: 'streamingResponseToMessage / streamingChatCompletionToMessage 增量归约流式块' },
    { title: '消息编辑', desc: 'onMessageEdit + message.editing + messageEditRender（放 AIChatInput 编辑器）' },
    { title: '工具块完整交互', desc: 'function_call/tool_call/mcp 块状态图标 + 折叠展开 + 参数/输出 JSON 格式化 + call_id/MCP server' },
  ],
} as const;
