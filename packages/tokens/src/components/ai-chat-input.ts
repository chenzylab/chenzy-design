/**
 * Component tokens for AIChatInput（阶段 1 · 基础输入，对齐 Semi AIChatInput）。
 * 容器/编辑区/占位符/上传图标/发送-停止按钮全走 token，深浅双主题；
 * 值回退 Alias / 语义 token，禁写死；深浅差异由所引 alias 随主题切换承担。
 * 见 specs/components/show/AIChatInput.spec.md §0/§2。
 */
import type { TokenGroup } from './token-def.js';

export const aiChatInputTokens = {
  // 容器
  'ai-chat-input-bg': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '容器背景',
    usage: 'AIChatInput 根容器背景',
  },
  'ai-chat-input-border': {
    value: 'var(--cd-color-border)',
    category: 'color',
    label: '容器描边',
    usage: '输入区容器描边色',
  },
  'ai-chat-input-border-focus': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '容器描边（聚焦）',
    usage: '输入区聚焦（focus-within）描边色',
  },
  'ai-chat-input-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '容器圆角',
    usage: '输入区容器圆角',
  },
  'ai-chat-input-radius-round': {
    value: 'var(--cd-border-radius-large)',
    category: 'radius',
    label: '容器圆角（round）',
    usage: 'round 模式容器圆角',
  },
  'ai-chat-input-padding': {
    value: 'var(--cd-spacing-base)',
    category: 'spacing',
    label: '容器内边距',
    usage: '输入区容器内边距',
  },
  'ai-chat-input-gap': {
    value: 'var(--cd-spacing-tight)',
    category: 'spacing',
    label: '内部间距',
    usage: '编辑区/footer/操作项之间的间距',
  },
  // 编辑区
  'ai-chat-input-color': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '编辑区文本',
    usage: '富文本编辑区文本色',
  },
  'ai-chat-input-placeholder-color': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '占位符文本',
    usage: '空编辑区占位符色',
  },
  'ai-chat-input-editor-min-height': {
    value: 'var(--cd-spacing-loose)',
    category: 'spacing',
    label: '编辑区最小高度',
    usage: '编辑区空态最小高度',
  },
  'ai-chat-input-editor-max-height': {
    value: '160px',
    category: 'spacing',
    label: '编辑区最大高度',
    usage: '编辑区最大高度（超出内部滚动）',
  },
  // 行高：镜像 Semi 的组件专属变量（Semi 此处用变量而非 mixin，本库同形对应）
  // semi-foundation/aiChatInput/variables.scss:146
  'ai-chat-input-rich-text-lineheight': {
    value: '24px',
    category: 'font',
    label: '富文本行高',
    usage: '富文本编辑器正文行高（对齐 Semi $font-aiChatInput_rich_text-lineHeight）',
  },
  // semi-foundation/aiChatInput/variables.scss:62
  'spacing-ai-chat-input-skill-item-columngap': {
    value: '8px',
    category: 'spacing',
    label: '技能项水平间距',
    usage: '技能项内容的水平间距（对齐 Semi $spacing-aiChatInput_skill_item-columnGap）',
  },
  // semi-foundation/aiChatInput/variables.scss:148
  'ai-chat-input-rich-text-input-slot-lineheight': {
    value: '20px',
    category: 'font',
    label: '插槽文本行高',
    usage: '富文本编辑器输入框插槽文本行高（对齐 Semi $font-aiChatInput_rich_text-input_slot-lineHeight）',
  },
  // 操作区（上传图标）
  'ai-chat-input-action-icon': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '操作图标色',
    usage: '上传等操作图标默认色',
  },
  'ai-chat-input-action-icon-hover': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '操作图标色（悬浮）',
    usage: '操作图标悬浮色',
  },
  'ai-chat-input-action-padding': {
    value: 'var(--cd-spacing-extra-tight)',
    category: 'spacing',
    label: '操作按钮内边距',
    usage: '上传/发送按钮内边距',
  },
  'ai-chat-input-action-radius': {
    value: 'var(--cd-border-radius-small)',
    category: 'radius',
    label: '操作按钮圆角',
    usage: '上传/发送按钮圆角',
  },
  // 发送按钮
  'ai-chat-input-send-bg': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '发送按钮背景',
    usage: '发送按钮背景（品牌色）',
  },
  'ai-chat-input-send-bg-hover': {
    value: 'var(--cd-color-primary-hover)',
    category: 'color',
    label: '发送按钮背景（悬浮）',
    usage: '发送按钮悬浮背景',
  },
  'ai-chat-input-send-bg-disabled': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '发送按钮背景（禁用）',
    usage: '不可发送时按钮背景',
  },
  'ai-chat-input-send-icon': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '发送按钮图标',
    usage: '发送按钮图标色（品牌底上反白）',
  },
  'ai-chat-input-send-icon-disabled': {
    value: 'var(--cd-color-text-3)',
    category: 'color',
    label: '发送按钮图标（禁用）',
    usage: '不可发送时图标色',
  },
  // 停止按钮
  'ai-chat-input-stop-bg': {
    value: 'var(--cd-color-fill-2)',
    category: 'color',
    label: '停止按钮背景',
    usage: '生成中停止按钮背景',
  },
  // 引用条（阶段 2）
  'ai-chat-input-reference-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '引用项背景',
    usage: '引用条单项背景',
  },
  'ai-chat-input-reference-bg-hover': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '引用项背景（悬浮）',
    usage: '引用条单项悬浮背景',
  },
  'ai-chat-input-reference-color': {
    value: 'var(--cd-color-text-1)',
    category: 'color',
    label: '引用项文本',
    usage: '引用条单项文本色',
  },
  'ai-chat-input-reference-radius': {
    // Semi $radius-aiChatInput_reference: 6px（本库原回退 --cd-border-radius-small=3px，差一半）
    value: '6px',
    category: 'radius',
    label: '引用项圆角',
    usage: 'Semi $radius-aiChatInput_reference',
  },
  // —— footer（逐条镜像 Semi aiChatInput/variables.scss 的 $..._footer_* ）——
  'spacing-ai-chat-input-footer-margintop': { value: '20px', category: 'spacing', label: 'footer 上外距', usage: 'Semi $spacing-aiChatInput_footer-marginTop' },
  'spacing-ai-chat-input-footer-action-columngap': { value: '8px', category: 'spacing', label: '操作区水平间距', usage: 'Semi $spacing-aiChatInput_footer_action-columnGap' },
  'spacing-ai-chat-input-footer-configure-columngap': { value: '8px', category: 'spacing', label: '配置区水平间距', usage: 'Semi $spacing-aiChatInput_footer_configure-columnGap' },
  // MCP 下拉头部（Semi mcp.tsx 的 -footer-configure-mcp-header）
  'spacing-ai-chat-input-footer-configure-mcp-header-paddingtop': { value: '8px', category: 'spacing', label: 'MCP 头部上内距', usage: 'Semi $spacing-aiChatInput_footer_configure_mcp_header-paddingTop' },
  'spacing-ai-chat-input-footer-configure-mcp-header-paddingbottom': { value: '0px', category: 'spacing', label: 'MCP 头部下内距', usage: 'Semi $spacing-aiChatInput_footer_configure_mcp_header-paddingBottom' },
  'spacing-ai-chat-input-footer-configure-mcp-header-paddingx': { value: '16px', category: 'spacing', label: 'MCP 头部水平内距', usage: 'Semi $spacing-aiChatInput_footer_configure_mcp_header-paddingX' },
  'spacing-ai-chat-input-footer-configure-mcp-columngap': { value: '4px', category: 'spacing', label: 'MCP 头部水平间距', usage: 'Semi $spacing-aiChatInput_footer_configure_mcp_columnGap' },
  'height-ai-chat-input-footer-configure-mcp-header': { value: '16px', category: 'height', label: 'MCP 头部高', usage: 'Semi $height-aiChatInput_footer_configure_mcp_header' },
  'color-ai-chat-input-footer-configure-mcp-header-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 头部标题色', usage: 'Semi $color-aiChatInput_footer-configure_mcp_header_title-text' },
  'width-ai-chat-input-footer-action-button': { value: '32px', category: 'width', label: '操作按钮宽', usage: 'Semi $width-aiChatInput_footer_action_button' },
  'height-ai-chat-input-footer-action-button': { value: '32px', category: 'height', label: '操作按钮高', usage: 'Semi $height-aiChatInput_footer_action_button' },
  'radius-ai-chat-input-footer-action-button': { value: '8px', category: 'radius', label: '操作按钮圆角', usage: 'Semi $radius-aiChatInput_footer_action_button' },
  'radius-ai-chat-input-footer-round': { value: '9999px', category: 'radius', label: 'round 模式圆角', usage: 'Semi $radius-aiChatInput_footer_round' },
  // —— 补齐最后三条（附件滚动区/按钮前景、富文本字号）——
  // 注：这条 Semi 变量表里有、但它自己的 scss 从不消费（上游死变量，注释还与
  // -scroll_button-bg 复制粘贴同一句）。仍镜像以保持变量表一致，本库同样不消费。
  'color-ai-chat-input-attachment-scroll-button-text': { value: 'var(--cd-color-white)', category: 'color', label: '附件滚动按钮前景', usage: 'Semi $color-aiChatInput_attachment_scroll_button-text（Semi 侧未消费）' },
  'spacing-ai-chat-input-attachment-scroll-container': { value: '8px', category: 'spacing', label: '附件滚动区内间距', usage: 'Semi $spacing-aiChatInput_attachment_scroll_container' },
  'font-ai-chat-input-rich-text-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '富文本编辑器字号', usage: 'Semi $font-aiChatInput_rich_text-fontSize' },

  // —— 配置区下拉/单选按钮（逐条镜像 Semi $*-aiChatInput_footer_configure_{select,radio_button}-*）——
  // 本库这两个组件此前只挂了类名（上一轮补的），一条 Semi 样式都没接。
  // 注：Semi 的 $color-...configure_select-text 在 variables.scss 里重复定义了两次
  //（54/55 行同名同值），这里只镜像一条。
  'color-ai-chat-input-footer-configure-select-border': { value: 'var(--cd-color-border)', category: 'color', label: '配置下拉边框色', usage: 'Semi $color-aiChatInput_footer_configure_select-border' },
  'color-ai-chat-input-footer-configure-select-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '配置下拉背景', usage: 'Semi $color-aiChatInput_footer_configure_select-bg' },
  'color-ai-chat-input-footer-configure-select-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '配置下拉文字色', usage: 'Semi $color-aiChatInput_footer_configure_select-text' },
  'width-ai-chat-input-footer-configure-select-border': { value: '1px', category: 'width', label: '配置下拉边框宽', usage: 'Semi $width-aiChatInput_footer_configure_select-border' },
  'font-ai-chat-input-footer-configure-select-fontweight': { value: '600', category: 'font', label: '配置下拉字重', usage: 'Semi $font-aiChatInput_footer_configure_select-fontWeight' },
  'color-ai-chat-input-footer-configure-radio-button-checked': { value: 'var(--cd-color-text-1)', category: 'color', label: '单选按钮选中文字色', usage: 'Semi $color-aiChatInput_footer_configure_radio_button_checked' },
  'color-ai-chat-input-footer-configure-radio-button-checked-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '单选按钮选中底色', usage: 'Semi $color-aiChatInput_footer_configure_radio_button_checked-bg' },
  'spacing-ai-chat-input-footer-configure-radio-button-padding': { value: '4px', category: 'spacing', label: '单选按钮内距', usage: 'Semi $spacing-aiChatInput_footer_configure_radio_button-padding' },
  'height-ai-chat-input-footer-configure-radio-button': { value: '16px', category: 'height', label: '单选按钮高', usage: 'Semi $height-aiChatInput_footer_configure_radio_button' },
  'font-ai-chat-input-footer-configure-radio-button-fontsize': { value: '14px', category: 'font', label: '单选按钮字号', usage: 'Semi $font-aiChatInput_footer_configure_radio_button-fontSize' },

  // —— 富文本选择器插槽（逐条镜像 Semi $*-aiChatInput_rich_text-select_slot-*）——
  // 本库此前只有「inline-flex + 通用 spacing 外边距 + min-width:80px」三行自造样式，
  // Semi 的底色/圆角/高度/内距/文本色/箭头色一条都没接。
  'color-ai-chat-input-rich-text-select-slot-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '选择器插槽背景', usage: 'Semi $color-aiChatInput_rich_text-select_slot-bg' },
  'color-ai-chat-input-rich-text-select-selection-text': { value: 'var(--cd-color-primary)', category: 'color', label: '选择器插槽文本色', usage: 'Semi $color-aiChatInput_rich_text-select_selection-text' },
  'color-ai-chat-input-rich-text-select-slot-arrow': { value: 'var(--cd-color-text-2)', category: 'color', label: '选择器插槽箭头色', usage: 'Semi $color-aiChatInput_rich_text-select_slot_arrow' },
  'spacing-ai-chat-input-rich-text-select-slot-paddingx': { value: '4px', category: 'spacing', label: '选择器插槽水平内距', usage: 'Semi $spacing-aiChatInput_rich_text-select_slot-paddingX' },
  'spacing-ai-chat-input-rich-text-select-slot-paddingy': { value: '2px', category: 'spacing', label: '选择器插槽垂直内距', usage: 'Semi $spacing-aiChatInput_rich_text-select_slot-paddingY' },
  'spacing-ai-chat-input-rich-text-select-slot-marginx': { value: '4px', category: 'spacing', label: '选择器插槽水平外距', usage: 'Semi $spacing-aiChatInput_rich_text-select_slot-marginX' },
  'spacing-ai-chat-input-rich-text-select-slot-marginy': { value: '2px', category: 'spacing', label: '选择器插槽垂直外距', usage: 'Semi $spacing-aiChatInput_rich_text-select_slot-marginY' },
  'spacing-ai-chat-input-rich-text-select-selection-marginleft': { value: '0px', category: 'spacing', label: '选择器文本左外距', usage: 'Semi $spacing-aiChatInput_rich_text-select_selection-marginLeft' },
  'height-ai-chat-input-rich-text-select-slot': { value: '24px', category: 'height', label: '选择器插槽高度', usage: 'Semi $height-aiChatInput_rich_text-select-slot' },
  'width-ai-chat-input-rich-text-select-slot-arrow': { value: '16px', category: 'width', label: '选择器插槽箭头宽', usage: 'Semi $width-aiChatInput_rich_text-select_slot_arrow' },
  'radius-ai-chat-input-rich-text-select-slot': { value: '4px', category: 'radius', label: '选择器插槽圆角', usage: 'Semi $radius-aiChatInput_rich_text-select_slot' },

  // —— 富文本技能插槽（逐条镜像 Semi $*-aiChatInput_rich_text-skill_slot-*）——
  // 本库此前用自造的 -skill-bg/-skill-color/-skill-radius/-skill-delete 四条，
  // 视觉也不同：本库是「常显药丸 + 常显删除按钮」，Semi 是「纯文字 + hover 才染底、
  // 删除按钮平时 display:none，hover 才浮出到右上角」。
  'color-ai-chat-input-rich-text-skill-slot-text': { value: 'var(--cd-color-primary)', category: 'color', label: '技能插槽文本色', usage: 'Semi $color-aiChatInput_rich_text-skill_slot-text' },
  'color-ai-chat-input-rich-text-skill-slot-bg-hover': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '技能插槽悬停底色', usage: 'Semi $color-aiChatInput_rich_text-skill_slot-bg-hover' },
  'color-ai-chat-input-rich-text-skill-slot-delete-bg': { value: 'var(--cd-color-grey-7)', category: 'color', label: '技能删除按钮底色', usage: 'Semi $color-aiChatInput_rich_text-skill_slot_delete-bg' },
  'color-ai-chat-input-rich-text-skill-slot-delete-text': { value: 'var(--cd-color-white)', category: 'color', label: '技能删除按钮前景', usage: 'Semi $color-aiChatInput_rich_text-skill_slot_delete-text' },
  'spacing-ai-chat-input-rich-text-skill-slot-paddingx': { value: '4px', category: 'spacing', label: '技能插槽水平内距', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-paddingX' },
  'spacing-ai-chat-input-rich-text-skill-slot-paddingy': { value: '0px', category: 'spacing', label: '技能插槽垂直内距', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-paddingY' },
  'spacing-ai-chat-input-rich-text-skill-slot-marginx': { value: '2px', category: 'spacing', label: '技能插槽水平外距', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-marginX' },
  'spacing-ai-chat-input-rich-text-skill-slot-marginy': { value: '2px', category: 'spacing', label: '技能插槽垂直外距', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-marginY' },
  'spacing-ai-chat-input-rich-text-skill-slot-top': { value: '0px', category: 'spacing', label: '删除按钮距顶', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-top' },
  'spacing-ai-chat-input-rich-text-skill-slot-right': { value: '0px', category: 'spacing', label: '删除按钮距右', usage: 'Semi $spacing-aiChatInput_rich_text-skill_slot-right' },
  'radius-ai-chat-input-rich-text-skill-slot': { value: '4px', category: 'radius', label: '技能插槽圆角', usage: 'Semi $radius-aiChatInput_rich_text-skill_slot' },
  'font-ai-chat-input-rich-text-skill-slot-fontweight': { value: '600', category: 'font', label: '技能插槽字重', usage: 'Semi $font-aiChatInput_rich_text-skill_slot-fontWeight' },
  'width-ai-chat-input-rich-text-select-slot-delete': { value: '12px', category: 'width', label: '插槽删除按钮宽高', usage: 'Semi $width-aiChatInput_rich_text-select_slot_delete' },
  'width-ai-chat-input-rich-text-select-slot-delete-icon': { value: '8px', category: 'width', label: '插槽删除图标宽高', usage: 'Semi $width-aiChatInput_rich_text-select_slot_delete_icon' },

  // —— 富文本输入插槽（逐条镜像 Semi $*-aiChatInput_rich_text-input_slot-*，13 条）——
  // 本库此前只有一条 lineHeight：插槽画成「虚线下划线」，Semi 是「主色浅底药丸」，
  // 视觉是两套东西。
  'color-ai-chat-input-rich-text-input-slot-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '输入插槽背景', usage: 'Semi $color-aiChatInput_rich_text-input_slot-bg' },
  'color-ai-chat-input-rich-text-input-slot-text': { value: 'var(--cd-color-primary)', category: 'color', label: '输入插槽文本色', usage: 'Semi $color-aiChatInput_rich_text-input_slot-text' },
  'color-ai-chat-input-rich-text-input-slot-placeholder': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '输入插槽占位符色', usage: 'Semi $color-aiChatInput_rich_text-input_slot_placeholder' },
  'spacing-ai-chat-input-rich-text-input-slot-paddingy': { value: '2px', category: 'spacing', label: '输入插槽垂直内距', usage: 'Semi $spacing-aiChatInput_rich_text-input_slot-paddingY' },
  'spacing-ai-chat-input-rich-text-input-slot-paddingx': { value: '4px', category: 'spacing', label: '输入插槽水平内距', usage: 'Semi $spacing-aiChatInput_rich_text-input_slot-paddingX' },
  'spacing-ai-chat-input-rich-text-input-slot-marginy': { value: '2px', category: 'spacing', label: '输入插槽垂直外距', usage: 'Semi $spacing-aiChatInput_rich_text-input_slot-marginY' },
  'spacing-ai-chat-input-rich-text-input-slot-marginx': { value: '2px', category: 'spacing', label: '输入插槽水平外距', usage: 'Semi $spacing-aiChatInput_rich_text-input_slot-marginX' },
  'width-ai-chat-input-rich-text-input-slot': { value: '2px', category: 'width', label: '输入插槽最小宽', usage: 'Semi $width-aiChatInput_rich_text-input_slot' },
  'radius-ai-chat-input-rich-text-input-slot': { value: '4px', category: 'radius', label: '输入插槽圆角', usage: 'Semi $radius-aiChatInput_rich_text-input_slot' },
  'font-ai-chat-input-rich-text-input-slot-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '输入插槽字号', usage: 'Semi $font-aiChatInput_rich_text-input_slot-fontSize' },
  'font-ai-chat-input-rich-text-input-slot-fontweight': { value: '600', category: 'font', label: '输入插槽字重', usage: 'Semi $font-aiChatInput_rich_text-input_slot-fontWeight' },
  'z-ai-chat-input-rich-text-input-slot-placeholder': { value: '1', category: 'other', label: '输入插槽占位符层级', usage: 'Semi $z-aiChatInput_rich_text-input_slot_placeholder' },

  // —— 配置区按钮（逐条镜像 Semi $*-aiChatInput_footer_configure_button-*）——
  // 值与本库原来写死的一致，但此前没走专属 token：外部改不动、也对不上 Semi 变量表。
  'color-ai-chat-input-footer-configure-button-border': { value: 'var(--cd-color-primary)', category: 'color', label: '配置按钮边框色', usage: 'Semi $color-aiChatInput_footer_configure_button-border' },
  'color-ai-chat-input-footer-configure-button-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '配置按钮边框色（激活）', usage: 'Semi $color-aiChatInput_footer_configure_button-border-active' },
  'color-ai-chat-input-footer-configure-button-text': { value: 'var(--cd-color-primary)', category: 'color', label: '配置按钮文字色（激活）', usage: 'Semi $color-aiChatInput_footer_configure_button-text' },
  'color-ai-chat-input-footer-configure-button-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '配置按钮背景（激活）', usage: 'Semi $color-aiChatInput_footer_configure_button-bg' },
  'width-ai-chat-input-footer-configure-button-border': { value: '1px', category: 'width', label: '配置按钮边框宽', usage: 'Semi $width-aiChatInput_footer_configure_button-border' },

  // —— 引用/附件的文件类型图标底色（逐条镜像 Semi $color-aiChatInput_ref_icon_word-*）——
  // 本库此前一条都没有：组件渲染了 -ref-icon-{type} 类名，却没有任何对应样式，
  // 七种类型全是同一个默认底色。
  'color-ai-chat-input-ref-icon-word-bg': { value: 'var(--cd-color-blue-4)', category: 'color', label: '文本文件图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-bg' },
  'color-ai-chat-input-ref-icon-word-pdf': { value: 'var(--cd-color-red-4)', category: 'color', label: 'PDF 图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-pdf' },
  'color-ai-chat-input-ref-icon-word-code': { value: 'var(--cd-color-teal-5)', category: 'color', label: '代码文件图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-code' },
  'color-ai-chat-input-ref-icon-word-excel': { value: 'var(--cd-color-green-5)', category: 'color', label: '表格文件图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-excel' },
  'color-ai-chat-input-ref-icon-word-video': { value: 'var(--cd-color-purple-4)', category: 'color', label: '视频文件图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-video' },
  'color-ai-chat-input-ref-icon-word-audio': { value: 'var(--cd-color-purple-4)', category: 'color', label: '音频文件图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-audio' },
  'color-ai-chat-input-ref-icon-word-unknown': { value: 'var(--cd-color-grey-5)', category: 'color', label: '未知类型图标底色', usage: 'Semi $color-aiChatInput_ref_icon_word-unknown' },
  'color-ai-chat-input-footer-send-text': { value: 'var(--cd-color-white)', category: 'color', label: '发送按钮内容色', usage: 'Semi $color-aiChatInput_footer_send-text' },
  'color-ai-chat-input-footer-send-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '发送按钮底（默认）', usage: 'Semi $color-aiChatInput_footer_send-bg-default' },
  'color-ai-chat-input-footer-send-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '发送按钮底（悬浮）', usage: 'Semi $color-aiChatInput_footer_send-bg-hover' },
  'color-ai-chat-input-footer-send-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '发送按钮底（按下）', usage: 'Semi $color-aiChatInput_footer_send-bg-active' },
  'color-ai-chat-input-footer-send-bg-disabled': { value: 'var(--cd-color-fill-2)', category: 'color', label: '发送按钮底（禁用）', usage: 'Semi $color-aiChatInput_footer_send-bg-disabled' },
  'color-ai-chat-input-footer-upload-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '上传按钮内容色', usage: 'Semi $color-aiChatInput_footer_upload-text' },
  'color-ai-chat-input-footer-upload-bg-default': { value: 'transparent', category: 'color', label: '上传按钮底（默认）', usage: 'Semi $color-aiChatInput_footer_upload-bg-default' },
  'color-ai-chat-input-footer-upload-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '上传按钮底（悬浮）', usage: 'Semi $color-aiChatInput_footer_upload-bg-hover' },
  'color-ai-chat-input-footer-upload-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '上传按钮底（按下）', usage: 'Semi $color-aiChatInput_footer_upload-bg-active' },
  // —— 建议面板 / 技能面板（逐条镜像 Semi aiChatInput/variables.scss）——
  // 原有 -suggestions-bg / -suggestions-shadow 两条已删除：它们是本库自绘浮层时期的产物，
  // Semi 无对应变量（面板背景/阴影由 Popover 承担）。现浮层改由 Popover 承载，二者无人消费。
  // 建议项（Semi $color-aiChatInput_suggestion_item-* / $spacing-* / $radius-*）
  'color-ai-chat-input-suggestion-item-text': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '建议项文本',
    usage: '建议项文本色（Semi $color-aiChatInput_suggestion_item-text）',
  },
  'color-ai-chat-input-suggestion-item-bg-hover': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '建议项背景（悬浮）',
    usage: '建议项悬浮背景（Semi $color-aiChatInput_suggestion_item-bg-hover）',
  },
  'color-ai-chat-input-suggestion-item-bg-active': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '建议项背景（激活）',
    usage: '建议项激活背景（Semi $color-aiChatInput_suggestion_item-bg-active）',
  },
  'spacing-ai-chat-input-suggestion-item-paddingy': {
    value: '8px',
    category: 'spacing',
    label: '建议项纵向内距',
    usage: 'Semi $spacing-aiChatInput_suggestion_item-paddingY',
  },
  'spacing-ai-chat-input-suggestion-item-paddingx': {
    value: '20px',
    category: 'spacing',
    label: '建议项横向内距',
    usage: 'Semi $spacing-aiChatInput_suggestion_item-paddingX',
  },
  'radius-ai-chat-input-suggestion-item': {
    value: '6px',
    category: 'radius',
    label: '建议项圆角',
    usage: 'Semi $radius-aiChatInput_suggestion_item',
  },
  // 技能面板与技能项（Semi $..._skill-* / $..._skill_item-*）——此前本库与建议项混用，已拆开
  'radius-ai-chat-input-skill': {
    value: '8px',
    category: 'radius',
    label: '技能面板圆角',
    usage: 'Semi $radius-aiChatInput_skill',
  },
  'spacing-ai-chat-input-skill-paddingy': {
    value: '4px',
    category: 'spacing',
    label: '技能面板纵向内距',
    usage: 'Semi $spacing-aiChatInput_skill-paddingY',
  },
  'spacing-ai-chat-input-skill-paddingx': {
    value: '0px',
    category: 'spacing',
    label: '技能面板横向内距',
    usage: 'Semi $spacing-aiChatInput_skill-paddingX',
  },
  'spacing-ai-chat-input-skill-item-paddingy': {
    value: '8px',
    category: 'spacing',
    label: '技能项纵向内距',
    usage: 'Semi $spacing-aiChatInput_skill_item-paddingY',
  },
  'spacing-ai-chat-input-skill-item-paddingx': {
    value: '20px',
    category: 'spacing',
    label: '技能项横向内距',
    usage: 'Semi $spacing-aiChatInput_skill_item-paddingX',
  },
  'color-ai-chat-input-skill-item-bg-hover': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '技能项背景（悬浮）',
    usage: 'Semi $color-aiChatInput_skill_item-bg-hover',
  },
  'color-ai-chat-input-skill-item-bg-active': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '技能项背景（激活）',
    usage: 'Semi $color-aiChatInput_skill_item-bg-active',
  },
  // skill-slot 编辑器内技能 chip（阶段 3）
  // 模版按钮（阶段 3）
  'ai-chat-input-template-color': {
    value: 'var(--cd-color-text-1)',
    category: 'color',
    label: '模版按钮文本',
    usage: '模版按钮文本/图标色',
  },
  'ai-chat-input-template-bg-hover': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '模版按钮背景（悬浮）',
    usage: '模版按钮悬浮背景',
  },
  // —— 引用条（逐条镜像 Semi $*-aiChatInput_reference* / $*-aiChatInput_references*）——
  'ai-chat-input-references-text': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '引用区文本',
    usage: 'Semi $color-aiChatInput_references-text',
  },
  'ai-chat-input-reference-delete-bg': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '引用删除按钮背景（悬浮）',
    usage: 'Semi $color-aiChatInput_reference_delete-bg',
  },
  'ai-chat-input-references-marginBottom': {
    value: '8px',
    category: 'spacing',
    label: '引用区下外边距',
    usage: 'Semi $spacing-aiChatInput_references-marginBottom',
  },
  'ai-chat-input-references-columnGap': {
    value: '4px',
    category: 'spacing',
    label: '引用区列间距',
    usage: 'Semi $spacing-aiChatInput_references-columnGap',
  },
  'ai-chat-input-references-rowGap': {
    value: '4px',
    category: 'spacing',
    label: '引用区行间距',
    usage: 'Semi $spacing-aiChatInput_references-rowGap',
  },
  'ai-chat-input-reference-paddingY': {
    value: '8px',
    category: 'spacing',
    label: '引用项垂直内边距',
    usage: 'Semi $spacing-aiChatInput_reference-paddingY',
  },
  'ai-chat-input-reference-paddingX': {
    value: '12px',
    category: 'spacing',
    label: '引用项水平内边距',
    usage: 'Semi $spacing-aiChatInput_reference-paddingX',
  },
  'ai-chat-input-reference-columnGap': {
    value: '8px',
    category: 'spacing',
    label: '引用项列间距',
    usage: 'Semi $spacing-aiChatInput_reference-columnGap',
  },
  'ai-chat-input-reference-icon-marginRight': {
    value: '4px',
    category: 'spacing',
    label: '引用图标右外边距',
    usage: 'Semi $spacing-aiChatInput_reference_icon-marginRight',
  },
  'ai-chat-input-references-delete-padding': {
    value: '2px',
    category: 'spacing',
    label: '引用删除按钮内边距',
    usage: 'Semi $spacing-aiChatInput_references_delete-padding',
  },
  'ai-chat-input-reference-icon-width': {
    value: '16px',
    category: 'width',
    label: '引用图标宽高',
    usage: 'Semi $width-aiChatInput_reference_icon',
  },
  'ai-chat-input-reference-icon-radius': {
    value: '2px',
    category: 'radius',
    label: '引用图标圆角',
    usage: 'Semi $radius-aiChatInput_reference_icon',
  },
  // —— 附件卡片（对齐 Semi $*-aiChatInput_attachment*，名/值/公式逐条镜像）——
  'ai-chat-input-attachment-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '附件项背景',
    usage: '附件卡片背景色',
  },
  'ai-chat-input-attachment-icon': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '附件项图标',
    usage: '附件卡片左侧图标颜色',
  },
  'ai-chat-input-attachment-name-text': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '附件名称文本',
    usage: '附件卡片名称行文本色',
  },
  'ai-chat-input-attachment-delete-bg': {
    value: 'var(--cd-color-grey-7)',
    category: 'color',
    label: '附件删除按钮背景',
    usage: '附件卡片右上角删除按钮背景（悬浮才显示）',
  },
  'ai-chat-input-attachment-delete-icon': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '附件删除按钮图标',
    usage: '附件卡片删除按钮图标色',
  },
  'ai-chat-input-attachment-columnGap': {
    value: '8px',
    category: 'spacing',
    label: '附件项列间距',
    usage: '附件卡片内图标与内容的水平间距',
  },
  'ai-chat-input-attachment-padding': {
    value: '8px',
    category: 'spacing',
    label: '附件项内边距',
    usage: '附件卡片内间距',
  },
  'ai-chat-input-attachment-content-size-columnGap': {
    value: '4px',
    category: 'spacing',
    label: '附件类型与大小间距',
    usage: '附件卡片第二行「类型 大小」之间的间距',
  },
  'ai-chat-input-attachment-width': {
    value: '224px',
    category: 'width',
    label: '附件项宽度',
    usage: '附件卡片宽度',
  },
  'ai-chat-input-attachment-height': {
    value: '36px',
    category: 'height',
    label: '附件项高度',
    usage: '附件卡片高度',
  },
  'ai-chat-input-attachment-left-height': {
    value: '36px',
    category: 'height',
    label: '附件左侧图标宽高',
    usage: '附件卡片左侧图标/缩略图的宽高',
  },
  'ai-chat-input-attachment-content-width': {
    value: '180px',
    category: 'width',
    label: '附件内容宽度',
    usage: '附件卡片右侧内容区宽度',
  },
  'ai-chat-input-attachment-content-height': {
    value: '20px',
    category: 'height',
    label: '附件名称行高度',
    usage: '附件卡片名称行高度',
  },
  'ai-chat-input-attachment-delete-width': {
    value: '16px',
    category: 'width',
    label: '附件删除按钮宽度',
    usage: '附件卡片删除按钮宽高',
  },
  'ai-chat-input-attachment-radius': {
    value: '6px',
    category: 'radius',
    label: '附件项圆角',
    usage: '附件卡片圆角',
  },
  'ai-chat-input-attachment-content-name-fontWeight': {
    value: '600',
    category: 'font',
    label: '附件名称字重',
    usage: '附件卡片名称行字重',
  },
  'ai-chat-input-attachment-content-delete-fontSize': {
    value: '12px',
    category: 'font',
    label: '附件删除按钮图标字号',
    usage: '附件卡片删除按钮图标大小',
  },
  // —— 附件横向滚动器（对齐 Semi $*-aiChatInput_attachment_scroll_*）——
  'ai-chat-input-attachment-scroll-wrapper-marginBottom': {
    value: '8px',
    category: 'spacing',
    label: '滚动区底部外边距',
    usage: '附件滚动区与下方内容的间距',
  },
  'ai-chat-input-attachment-scroll-container-columnGap': {
    value: '8px',
    category: 'spacing',
    label: '滚动区列间距',
    usage: '附件卡片之间的水平间距',
  },
  'ai-chat-input-attachment-scroll-button-offsetX': {
    value: '10px',
    category: 'spacing',
    label: '滚动按钮水平偏移',
    usage: '左右滚动按钮距滚动区边缘的距离',
  },
  'ai-chat-input-attachment-scroll-button-width': {
    value: '16px',
    category: 'width',
    label: '滚动按钮宽度',
    usage: '左右滚动按钮宽高',
  },
  'ai-chat-input-attachment-scroll-button-icon-width': {
    value: '12px',
    category: 'width',
    label: '滚动按钮图标大小',
    usage: '左右滚动按钮内图标字号',
  },
  'ai-chat-input-attachment-scroll-button-bg': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '滚动按钮背景',
    usage: '左右滚动按钮背景色',
  },
  'ai-chat-input-attachment-scroll-button-color': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '滚动按钮图标色',
    usage: '左右滚动按钮图标颜色',
  },
  'ai-chat-input-attachment-scroll-button-shadow': {
    value: 'var(--cd-shadow-elevated)',
    category: 'other',
    label: '滚动按钮阴影',
    usage: '左右滚动按钮阴影',
  },
  'z-ai-chat-input-attachment-scroll-button': {
    value: '10',
    category: 'other',
    label: '滚动按钮层级',
    usage: '左右滚动按钮 z-index',
  },
  // 动效
  'ai-chat-input-motion-duration': {
    value: 'var(--cd-motion-duration-fast)',
    category: 'animation',
    label: '动画时长',
    usage: '描边/按钮悬浮过渡时长',
  },
} satisfies TokenGroup;
