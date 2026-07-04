/**
 * Component tokens for Chat（M4 富媒体，对齐 Semi Chat）。
 * 气泡（user/assistant）/头像/输入框/提示/分割线/操作图标全走 token，深浅双主题。
 * 值回退 Alias / 语义 token，禁写死；深浅差异由所引 alias（bg/fill/text/primary-light）随主题切换承担。
 * 见 specs/components/show/Chat.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const chatTokens = {
  // 容器
  'chat-bg': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '容器背景',
    usage: 'Chat 根容器背景',
  },
  'chat-gap': {
    value: 'var(--cd-spacing-loose)',
    category: 'spacing',
    label: '消息间距',
    usage: '相邻消息垂直间距',
  },
  // 气泡 - 用户
  'chat-bubble-user-bg': {
    value: 'var(--cd-color-primary-light-default)',
    category: 'color',
    label: '用户气泡背景',
    usage: '用户消息气泡背景（品牌浅）',
  },
  'chat-bubble-user-color': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '用户气泡文本',
    usage: '用户消息气泡文本色',
  },
  // 气泡 - 助手
  'chat-bubble-assistant-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '助手气泡背景',
    usage: '助手消息气泡背景（中性填充）',
  },
  'chat-bubble-assistant-color': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '助手气泡文本',
    usage: '助手消息气泡文本色',
  },
  'chat-bubble-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '气泡圆角',
    usage: '消息气泡圆角',
  },
  'chat-bubble-padding-y': {
    value: 'var(--cd-spacing-tight)',
    category: 'spacing',
    label: '气泡纵向内边距',
    usage: '气泡上下内边距',
  },
  'chat-bubble-padding-x': {
    value: 'var(--cd-spacing-base)',
    category: 'spacing',
    label: '气泡横向内边距',
    usage: '气泡左右内边距',
  },
  // 头像
  'chat-avatar-size': {
    value: '32px',
    category: 'width',
    label: '头像尺寸',
    usage: '消息头像宽高',
  },
  'chat-avatar-radius': {
    value: 'var(--cd-border-radius-full)',
    category: 'radius',
    label: '头像圆角',
    usage: '头像圆角（默认全圆）',
  },
  'chat-avatar-bg': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '头像占位背景',
    usage: '无头像图时占位背景',
  },
  // 标题
  'chat-title-color': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '标题色',
    usage: '消息标题（角色名/时间）文本色',
  },
  'chat-title-font-size': {
    value: 'var(--cd-font-size-small)',
    category: 'font',
    label: '标题字号',
    usage: '消息标题字号',
  },
  // 分割线（clearContext divider）
  'chat-divider': {
    value: 'var(--cd-color-border)',
    category: 'color',
    label: '分割线色',
    usage: '清除上下文分割线颜色',
  },
  'chat-divider-color': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '分割线文本',
    usage: '分割线中央提示文本色',
  },
  // 操作区图标
  'chat-action-icon': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '操作图标色',
    usage: '复制/删除/重置/赞/踩图标默认色',
  },
  'chat-action-icon-hover': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '操作图标色（悬浮）',
    usage: '操作图标悬浮色',
  },
  'chat-action-icon-active': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '操作图标色（激活）',
    usage: '赞/踩激活态图标色（品牌色）',
  },
  // 输入框
  'chat-input-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '输入框背景',
    usage: '输入区背景填充',
  },
  'chat-input-color': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '输入框文本',
    usage: '输入框文本色',
  },
  'chat-input-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '输入框圆角',
    usage: '输入区容器圆角',
  },
  'chat-input-border': {
    value: 'var(--cd-color-border)',
    category: 'color',
    label: '输入框描边',
    usage: '输入区描边色',
  },
  'chat-input-border-focus': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '输入框描边（聚焦）',
    usage: '输入区聚焦描边色',
  },
  // 提示区
  'chat-hint-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '提示项背景',
    usage: 'hint 提示项背景',
  },
  'chat-hint-bg-hover': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '提示项背景（悬浮）',
    usage: 'hint 提示项悬浮背景',
  },
  'chat-hint-color': {
    value: 'var(--cd-color-text-1)',
    category: 'color',
    label: '提示项文本',
    usage: 'hint 提示项文本色',
  },
  'chat-hint-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '提示项圆角',
    usage: 'hint 提示项圆角',
  },
  // back-bottom 返回底部按钮
  'chat-back-bottom-bg': {
    value: 'var(--cd-color-bg-2)',
    category: 'color',
    label: '返回底部按钮背景',
    usage: '返回底部悬浮按钮背景',
  },
  'chat-back-bottom-color': {
    value: 'var(--cd-color-text-1)',
    category: 'color',
    label: '返回底部按钮图标',
    usage: '返回底部按钮图标色',
  },
  'chat-back-bottom-shadow': {
    value: 'var(--cd-shadow-elevated)',
    category: 'other',
    label: '返回底部按钮阴影',
    usage: '返回底部按钮投影',
  },
  // 状态
  'chat-status-error-color': {
    value: 'var(--cd-color-danger)',
    category: 'color',
    label: '错误状态色',
    usage: 'status=error 消息提示色',
  },
  // 动效
  'chat-motion-duration': {
    value: 'var(--cd-motion-duration-fast)',
    category: 'animation',
    label: '动画时长',
    usage: '返回底部显隐 / 悬浮过渡时长',
  },
} satisfies TokenGroup;
