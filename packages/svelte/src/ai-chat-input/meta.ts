/**
 * Machine-readable component metadata for AI/docs consumption.
 * AIChatInput — 对齐 Semi Design AIChatInput（tiptap 富文本输入）。
 * 阶段 1（基础输入）：richTextInput + 发送（sendHotKey/canSend/generating/stop）+ Upload 附件。
 * 阶段 2（引用/建议）：references 引用条 + suggestions 建议浮层 + 自定义渲染插槽。
 * 阶段 3（技能/模版）：skill-slot 自定义 NodeView（svelte-tiptap SvelteNodeViewRenderer）+ skillHotKey 面板 + renderTemplate。
 * 阶段 4（配置区）：renderConfigureArea + Configure 子组件（Select/Button/RadioButton，context+field 绑定）+ setup。
 * 阶段 5（Adapter 桥）：messageToChatInput / chatInputToChatCompletion 把 onMessageSend 载荷转成
 * AIDialogueMessage / OpenAI ChatCompletion，接 AIChatDialogue 展示或喂 API（core 纯函数透传）。
 * 可选补充（全部完成）：select-slot（内联下拉）+ input-slot（可编辑填空，全套零宽锚点 + 光标 plugin）
 * 自定义节点，用于 renderTemplate 模版填空（getSelectSlotHTML/getInputSlotHTML 生成）；
 * Configure.Mcp（MCP 服务多选下拉）。tiptap 内核 + pm + svelte-tiptap 动态 import（不进主 bundle）。
 * headless 判定在 @chenzy-design/core。
 */
export const meta = {
  name: 'AIChatInput',
  category: 'show',
  description:
    'AI 聊天输入框：基于 tiptap 富文本编辑器（内核 + svelte-tiptap 动态 import 懒加载，绝不进主 bundle）。阶段 1 富文本输入 + 发送（sendHotKey、canSend、generating 停止键）+ Upload 附件。阶段 2 references 引用条（可点击/删除/renderReference 覆盖）+ suggestions 建议浮层（聚焦弹出，↑↓/Enter/Esc/点击外部，renderSuggestionItem 覆盖）+ renderTopSlot。阶段 3 skills 技能面板（空编辑区按 skillHotKey 弹出，↑↓/Enter/Esc，选中插入 skill-slot 自定义节点并 onSkillChange）+ skill-slot NodeView（inline atom chip，含删除，用 svelte-tiptap SvelteNodeViewRenderer 渲染 SkillSlotNode.svelte）+ renderTemplate 模版面板（当前技能 hasTemplate 时展示模版按钮，点击弹出，setContent 填入）。阶段 4 renderConfigureArea 配置区（footer 左侧，放 AIChatInputConfigureSelect/Button/RadioButton 经 configure context 用 field 绑定）+ configureDefaultValue + onConfigureChange，配置值发送时并入 MessageContent.setup。onMessageSend 载荷对齐 Semi MessageContent（inputContents/attachments/references/setup）。headless（canSend/sendHotKey/MessageContent/doc→contents/suggestion 键盘/reference 归一/skill 归一/getSkillSlotHTML/skillHotKey 判定/configure setField-removeField）在 @chenzy-design/core，可单测。ref 方法 setContent/focusEditor/getText/getHTML/getEditor/clearContent/changeTemplateVisible/getConfigureValue。阶段 5 Adapter 桥（messageToChatInput → AIDialogueMessage 喂 AIChatDialogue；chatInputToChatCompletion → OpenAI ChatCompletion user message）为 core 纯函数，从 svelte 包透传。',
  exports: [
    'AIChatInput',
    'AIChatInputConfigureSelect',
    'AIChatInputConfigureButton',
    'AIChatInputConfigureRadioButton',
    'AIChatInputConfigureMcp',
  ],
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
    { name: 'skills', type: 'AIChatInputSkill[]', default: '[]', desc: '技能列表，空编辑区按 skillHotKey 弹面板（阶段 3）' },
    { name: 'skillHotKey', type: 'string', default: "'/'", desc: '触发技能面板的按键（阶段 3）' },
    { name: 'showTemplateButton', type: 'boolean', default: 'true', desc: '是否展示模版按钮（仅当前技能 hasTemplate 时生效，阶段 3）' },
    { name: 'configureDefaultValue', type: 'Record<string, unknown>', default: 'undefined', desc: '配置区初始值（阶段 4）' },
  ],
  events: [
    { name: 'onContentChange', payload: '{ text, html, json }', desc: '内容变化' },
    { name: 'onMessageSend', payload: 'MessageContent（inputContents/attachments/references）', desc: '发送消息' },
    { name: 'onStopGenerate', payload: '()', desc: '停止生成' },
    { name: 'onUploadChange', payload: 'attachments', desc: '上传附件变化' },
    { name: 'onReferenceClick', payload: 'reference', desc: '点击引用（阶段 2）' },
    { name: 'onReferenceDelete', payload: 'reference', desc: '删除引用（阶段 2）' },
    { name: 'onSuggestClick', payload: 'suggestion', desc: '选中建议；未提供时默认填入编辑器（阶段 2）' },
    { name: 'onSkillChange', payload: 'skill', desc: '选中技能（阶段 3）' },
    { name: 'onTemplateVisibleChange', payload: 'visible', desc: '模版面板显隐变化（阶段 3）' },
    { name: 'onConfigureChange', payload: '(value, changed)', desc: '配置区变更（阶段 4）' },
  ],
  slots: [
    { name: 'renderActionArea', payload: '{ canSend, generating }', desc: '自定义发送/停止按钮区' },
    { name: 'renderReference', payload: 'reference', desc: '自定义单条引用渲染（阶段 2）' },
    { name: 'renderSuggestionItem', payload: '{ suggestion, active }', desc: '自定义单条建议渲染（阶段 2）' },
    { name: 'renderTopSlot', payload: '{ references, attachments }', desc: '自定义 top slot 渲染（阶段 2）' },
    { name: 'renderSkillItem', payload: '{ skill, active }', desc: '自定义单条技能渲染（阶段 3）' },
    { name: 'renderTemplate', payload: '{ skill, setContent }', desc: '模版面板渲染（阶段 3）' },
    { name: 'renderConfigureArea', payload: '()', desc: 'footer 配置区渲染（放 Configure 子组件，阶段 4）' },
  ],
  methods: [
    { name: 'setContent', desc: '设置编辑器内容' },
    { name: 'focusEditor', desc: '聚焦编辑器' },
    { name: 'getText', desc: '取纯文本' },
    { name: 'getHTML', desc: '取 HTML' },
    { name: 'getEditor', desc: '取 tiptap Editor 实例' },
    { name: 'clearContent', desc: '清空编辑器内容' },
    { name: 'changeTemplateVisible', desc: '显隐模版面板（阶段 3）' },
    { name: 'getConfigureValue', desc: '取当前配置区值（阶段 4）' },
  ],
  a11y: {
    role: '编辑区 role=textbox aria-multiline；建议/技能面板 role=listbox / 项 role=option aria-selected；模版按钮 aria-expanded；引用 chip 名称与删除为平级 button（避免 nested-interactive）；skill-slot chip 含删除按钮；input-slot 可编辑填空空态显示 placeholder（aria-hidden）；Configure.Mcp 下拉 role=menuitemcheckbox；aria-label 全走 i18n',
    keyboard: 'Enter 发送（sendHotKey=enter，Shift+Enter 换行）/ Shift+Enter 发送；建议/技能面板可见时 ↑↓ 环绕导航、Enter 选中高亮项、Esc 关闭；空编辑区按 skillHotKey 弹技能面板；IME 组字中不发送；generating 时 Enter 不发送',
  },
  tokens: ['--cd-ai-chat-input-*（容器/编辑区/占位符/上传图标/发送-停止/引用条/建议-技能面板/skill-slot chip/模版按钮，深浅双主题；配置区 Button 复用 template/primary token）'],
  examples: [
    { title: '基础输入', desc: 'defaultContent + placeholder + onMessageSend' },
    { title: '受控发送态', desc: 'canSend + generating + onStopGenerate' },
    { title: '快捷键', desc: "sendHotKey='shift+enter'" },
    { title: '附件', desc: 'showUploadButton + uploadProps + onUploadChange' },
    { title: '引用', desc: 'references + onReferenceClick/onReferenceDelete + renderReference' },
    { title: '建议', desc: 'suggestions + onSuggestClick + renderSuggestionItem（↑↓/Enter/Esc）' },
    { title: '技能', desc: 'skills + skillHotKey + onSkillChange（选中插入 skill-slot 节点）' },
    { title: '模版', desc: 'skill.hasTemplate + renderTemplate（模版按钮弹面板 setContent）' },
    { title: '配置区', desc: 'renderConfigureArea + ConfigureSelect/Button/RadioButton + onConfigureChange（值进 setup）' },
    { title: '接入对话', desc: 'messageToChatInput 把发送载荷转 Message 喂 AIChatDialogue（Adapter 桥）' },
    { title: '模版填空节点', desc: 'getSelectSlotHTML/getInputSlotHTML 在模版嵌内联下拉/可编辑填空（select-slot/input-slot）' },
    { title: 'MCP 配置', desc: 'AIChatInputConfigureMcp 多选 MCP 服务，选中集进 setup' },
  ],
} as const;
