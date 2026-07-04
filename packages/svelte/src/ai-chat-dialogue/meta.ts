/**
 * Machine-readable component metadata for AI/docs consumption.
 * AIChatDialogue — aligned to Semi Design AIChatDialogue（OpenAI Response Object
 * 消息格式 + ContentItem 分块渲染 + 非流式 Adapter）。headless 类型与转换在
 * @chenzy-design/core（ai-chat-dialogue）。
 */
export const meta = {
  name: 'AIChatDialogue',
  category: 'show',
  description:
    'AI 对话展示：消息格式以 OpenAI Response Object 为原型，content 支持 ContentItem[]（output_text/input_text 走 MarkdownRender、image、file、reasoning 折叠块、function_call/tool_call 工具块、refusal、audio）。逐条 DialogueBox 渲染，ContentItemRenderer 按 type 分派、renderDialogueContentItem 可覆盖。消息流 role=log/aria-live=polite；滚动出现回到底部；选择模式 checkbox。ref 方法 selectAll/deselectAll/scrollToBottom/scrollToTop。core 提供类型全谱与非流式 Adapter（responseToMessage / chatCompletionToMessage）；流式 Adapter 为 P1。',
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
  ],
} as const;
