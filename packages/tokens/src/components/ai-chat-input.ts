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
    value: 'var(--cd-border-radius-small)',
    category: 'radius',
    label: '引用项圆角',
    usage: '引用条单项圆角',
  },
  // 建议面板（阶段 2）
  'ai-chat-input-suggestions-bg': {
    value: 'var(--cd-color-bg-2)',
    category: 'color',
    label: '建议面板背景',
    usage: '建议浮层面板背景',
  },
  'ai-chat-input-suggestions-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '建议面板圆角',
    usage: '建议浮层面板圆角',
  },
  'ai-chat-input-suggestions-shadow': {
    value: 'var(--cd-shadow-elevated)',
    category: 'other',
    label: '建议面板阴影',
    usage: '建议浮层投影',
  },
  'ai-chat-input-suggestion-color': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '建议项文本',
    usage: '建议项文本色',
  },
  'ai-chat-input-suggestion-bg-active': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '建议项背景（激活）',
    usage: '建议项高亮/悬浮背景',
  },
  // skill-slot 编辑器内技能 chip（阶段 3）
  'ai-chat-input-skill-bg': {
    value: 'var(--cd-color-primary-light-default)',
    category: 'color',
    label: '技能块背景',
    usage: '编辑器内 skill-slot chip 背景（品牌浅色）',
  },
  'ai-chat-input-skill-color': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '技能块文本',
    usage: 'skill-slot chip 文本/图标色',
  },
  'ai-chat-input-skill-delete': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '技能块删除图标',
    usage: 'skill-slot 删除图标默认色',
  },
  'ai-chat-input-skill-radius': {
    value: 'var(--cd-border-radius-small)',
    category: 'radius',
    label: '技能块圆角',
    usage: 'skill-slot chip 圆角',
  },
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
  // 动效
  'ai-chat-input-motion-duration': {
    value: 'var(--cd-motion-duration-fast)',
    category: 'animation',
    label: '动画时长',
    usage: '描边/按钮悬浮过渡时长',
  },
} satisfies TokenGroup;
