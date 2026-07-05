/**
 * Machine-readable component metadata for AI/docs consumption.
 * AIChatInput — 对齐 Semi Design AIChatInput（tiptap 富文本输入）。
 * 阶段 1（基础输入）：richTextInput + 发送（sendHotKey/canSend/generating/stop）+ Upload 附件。
 * tiptap 内核动态 import（gzip ~126KB，不进主 bundle）。headless 判定在 @chenzy-design/core。
 * 阶段 2+（references/suggestions/skill/configure/adapter）见 spec §6。
 */
export const meta = {
  name: 'AIChatInput',
  category: 'show',
  description:
    'AI 聊天输入框：基于 tiptap 富文本编辑器（内核动态 import 懒加载，绝不进主 bundle）。阶段 1 提供富文本输入 + 发送（sendHotKey enter/shift+enter、canSend 受控/推断、generating 时发送键变停止键并阻断 Enter 发送）+ Upload 附件。onMessageSend 载荷对齐 Semi MessageContent（inputContents/attachments，references/setup 留后续阶段）。headless 判定（canSend/sendHotKey/MessageContent 组装/doc→contents 归一）在 @chenzy-design/core，可单测。ref 方法 setContent/focusEditor/getText/getHTML/getEditor/clearContent。references/suggestions/skill/configure/adapter 为 P2+。',
  exports: ['AIChatInput'],
  props: [
    { name: 'defaultContent', type: 'string', default: "''", desc: '初始内容（HTML 或纯文本，tiptap Content）' },
    { name: 'placeholder', type: 'string', default: 'undefined', desc: '占位文本（缺省走 locale AIChatInput.placeholder）' },
    { name: 'canSend', type: 'boolean', default: 'undefined', desc: '是否可发送；未设置按内容/附件推断，显式设置以此为准' },
    { name: 'generating', type: 'boolean', default: 'false', desc: '生成中：发送键变停止键，Enter 不发送' },
    { name: 'sendHotKey', type: "'enter'|'shift+enter'", default: "'enter'", desc: '发送快捷键' },
    { name: 'showUploadButton', type: 'boolean', default: 'true', desc: '是否展示上传按钮' },
    { name: 'uploadProps', type: 'object', default: 'undefined', desc: '透传给内部 Upload 的 props' },
    { name: 'round', type: 'boolean', default: 'false', desc: '圆角样式（对齐 Semi round）' },
    { name: 'extensions', type: 'unknown[]', default: '[]', desc: '追加 tiptap extensions（StarterKit 之后）' },
    { name: 'transformer', type: 'Map<string, (node)=>Content>', default: 'undefined', desc: '富文本节点归一覆盖（对齐 Semi transformer）' },
  ],
  events: [
    { name: 'onContentChange', payload: '{ text, html, json }', desc: '内容变化' },
    { name: 'onMessageSend', payload: 'MessageContent（inputContents/attachments）', desc: '发送消息' },
    { name: 'onStopGenerate', payload: '()', desc: '停止生成' },
    { name: 'onUploadChange', payload: 'attachments', desc: '上传附件变化' },
  ],
  slots: [
    { name: 'renderActionArea', payload: '{ canSend, generating }', desc: '自定义发送/停止按钮区' },
  ],
  methods: [
    { name: 'setContent', desc: '设置编辑器内容' },
    { name: 'focusEditor', desc: '聚焦编辑器' },
    { name: 'getText', desc: '取纯文本' },
    { name: 'getHTML', desc: '取 HTML' },
    { name: 'getEditor', desc: '取 tiptap Editor 实例' },
    { name: 'clearContent', desc: '清空编辑器内容' },
  ],
  a11y: {
    role: '编辑区 role=textbox aria-multiline；aria-label 走 i18n（AIChatInput.editor）；发送/停止/上传按钮 aria-label 走 i18n',
    keyboard: 'Enter 发送（sendHotKey=enter，Shift+Enter 换行）/ Shift+Enter 发送（shift+enter，Enter 换行）；IME 组字中不发送；generating 时 Enter 不发送',
  },
  tokens: ['--cd-ai-chat-input-*（容器/编辑区/占位符/上传图标/发送-停止按钮，深浅双主题）'],
  examples: [
    { title: '基础输入', desc: 'defaultContent + placeholder + onMessageSend' },
    { title: '受控发送态', desc: 'canSend + generating + onStopGenerate' },
    { title: '快捷键', desc: "sendHotKey='shift+enter'" },
    { title: '附件', desc: 'showUploadButton + uploadProps + onUploadChange' },
  ],
} as const;
