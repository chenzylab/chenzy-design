/**
 * Machine-readable component metadata for AI/docs consumption.
 * AIChatInput — 对齐 Semi Design AIChatInput（tiptap 富文本输入）。
 * 阶段 1（基础输入）：richTextInput + 发送（sendHotKey/canSend/generating/stop）+ Upload 附件。
 * 阶段 2（引用/建议）：references 引用条 + suggestions 建议浮层 + 自定义渲染插槽。
 * tiptap 内核动态 import（gzip ~126KB，不进主 bundle）。headless 判定在 @chenzy-design/core。
 * 阶段 3+（skill/configure/adapter）见 spec §6。
 */
export const meta = {
  name: 'AIChatInput',
  category: 'show',
  description:
    'AI 聊天输入框：基于 tiptap 富文本编辑器（内核动态 import 懒加载，绝不进主 bundle）。阶段 1 富文本输入 + 发送（sendHotKey enter/shift+enter、canSend 受控/推断、generating 时发送键变停止键并阻断 Enter 发送）+ Upload 附件。阶段 2 references 引用条（编辑区上方，text→content/file→name/image→缩略图，可点击/删除/renderReference 覆盖）+ suggestions 建议浮层（聚焦空编辑区弹出，↑↓ 环绕导航/Enter 选中/Esc 关闭/点击外部关闭，renderSuggestionItem 覆盖，onSuggestClick 未提供时默认填入编辑器）+ renderTopSlot（topSlotPosition top/bottom）。onMessageSend 载荷对齐 Semi MessageContent（inputContents/attachments/references）。headless 判定（canSend/sendHotKey/MessageContent 组装/doc→contents 归一/suggestion 键盘导航/reference 归一）在 @chenzy-design/core，可单测。ref 方法 setContent/focusEditor/getText/getHTML/getEditor/clearContent。skill/configure/adapter 为 P3+。',
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
    { name: 'references', type: 'AIChatInputReference[]', default: '[]', desc: '受控引用列表，渲染于编辑区上方（阶段 2）' },
    { name: 'showReference', type: 'boolean', default: 'true', desc: '是否展示引用条（阶段 2）' },
    { name: 'suggestions', type: 'AIChatInputSuggestion[]', default: '[]', desc: '建议列表，聚焦空编辑区弹出面板（阶段 2）' },
    { name: 'topSlotPosition', type: "'top'|'bottom'", default: "'top'", desc: 'renderTopSlot 相对引用条位置（阶段 2）' },
  ],
  events: [
    { name: 'onContentChange', payload: '{ text, html, json }', desc: '内容变化' },
    { name: 'onMessageSend', payload: 'MessageContent（inputContents/attachments/references）', desc: '发送消息' },
    { name: 'onStopGenerate', payload: '()', desc: '停止生成' },
    { name: 'onUploadChange', payload: 'attachments', desc: '上传附件变化' },
    { name: 'onReferenceClick', payload: 'reference', desc: '点击引用（阶段 2）' },
    { name: 'onReferenceDelete', payload: 'reference', desc: '删除引用（阶段 2）' },
    { name: 'onSuggestClick', payload: 'suggestion', desc: '选中建议；未提供时默认填入编辑器（阶段 2）' },
  ],
  slots: [
    { name: 'renderActionArea', payload: '{ canSend, generating }', desc: '自定义发送/停止按钮区' },
    { name: 'renderReference', payload: 'reference', desc: '自定义单条引用渲染（阶段 2）' },
    { name: 'renderSuggestionItem', payload: '{ suggestion, active }', desc: '自定义单条建议渲染（阶段 2）' },
    { name: 'renderTopSlot', payload: '{ references, attachments }', desc: '自定义 top slot 渲染（阶段 2）' },
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
    role: '编辑区 role=textbox aria-multiline；建议面板 role=listbox / 项 role=option aria-selected；引用 chip 名称与删除为平级 button（避免 nested-interactive）；aria-label 全走 i18n',
    keyboard: 'Enter 发送（sendHotKey=enter，Shift+Enter 换行）/ Shift+Enter 发送（shift+enter，Enter 换行）；建议面板可见时 ↑↓ 环绕导航、Enter 选中高亮项、Esc 关闭；IME 组字中不发送；generating 时 Enter 不发送',
  },
  tokens: ['--cd-ai-chat-input-*（容器/编辑区/占位符/上传图标/发送-停止按钮/引用条/建议面板，深浅双主题）'],
  examples: [
    { title: '基础输入', desc: 'defaultContent + placeholder + onMessageSend' },
    { title: '受控发送态', desc: 'canSend + generating + onStopGenerate' },
    { title: '快捷键', desc: "sendHotKey='shift+enter'" },
    { title: '附件', desc: 'showUploadButton + uploadProps + onUploadChange' },
    { title: '引用', desc: 'references + onReferenceClick/onReferenceDelete + renderReference' },
    { title: '建议', desc: 'suggestions + onSuggestClick + renderSuggestionItem（↑↓/Enter/Esc）' },
  ],
} as const;
