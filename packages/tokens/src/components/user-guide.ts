/**
 * Component tokens for UserGuide（M4 Show，增补对标 Semi UserGuide）。
 * 值为 var() 引用 alias / global token，或字面量。组件消费的 token 名与 alias / global
 * 层不同名，var() 无自引用死循环。见 specs/components/show/UserGuide.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const userGuideTokens = {
  // —— 遮罩 / spotlight ——
  'userguide-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '遮罩背景色', usage: 'popup spotlight / modal 蒙层背景（组件消费）' },
  'userguide-spotlight-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '高亮挖洞圆角', usage: 'spotlight 挖洞矩形圆角（组件消费）' },
  'userguide-spotlight-transition': { value: 'var(--cd-motion-duration-mid) ease', category: 'other', label: '高亮移动过渡', usage: 'spotlight 移动 / 尺寸过渡（reduced-motion 下移除，组件消费）' },

  // —— 气泡 ——
  'userguide-popup-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '气泡背景色', usage: 'default 主题气泡背景（组件消费）' },
  'userguide-popup-bg-primary': { value: 'var(--cd-color-primary)', category: 'color', label: 'primary 气泡背景', usage: 'primary 主题气泡背景（组件消费）' },
  'userguide-popup-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '气泡文字色', usage: 'default 主题气泡文字（组件消费）' },
  'userguide-popup-color-primary': { value: 'var(--cd-color-white)', category: 'color', label: 'primary 气泡文字色', usage: 'primary 主题气泡文字（组件消费）' },
  'userguide-popup-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '气泡圆角', usage: '气泡圆角（组件消费）' },
  'userguide-popup-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '气泡阴影', usage: '气泡阴影（组件消费）' },
  'userguide-popup-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '气泡内边距', usage: '气泡内容内边距（组件消费）' },
  'userguide-popup-width': { value: '320px', category: 'other', label: '气泡宽度', usage: '气泡最大宽度（组件消费）' },
  'userguide-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '气泡 / 弹窗标题字号（组件消费）' },
  'userguide-title-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '标题字重（组件消费）' },
  'userguide-desc-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '描述文字色', usage: 'default 主题描述文字（组件消费）' },

  // —— 圆点指示器（modal）——
  'userguide-indicator-color': { value: 'var(--cd-color-fill-1)', category: 'color', label: '圆点默认色', usage: '圆点指示器未激活态（组件消费）' },
  'userguide-indicator-active': { value: 'var(--cd-color-primary)', category: 'color', label: '圆点激活色', usage: '圆点指示器激活态（组件消费）' },
  'userguide-indicator-size': { value: '6px', category: 'other', label: '圆点尺寸', usage: '圆点指示器直径（组件消费）' },

  // —— 层级 ——
  'userguide-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '弹层 / spotlight z-index 基线（zIndex prop 覆盖，组件消费）' },
} satisfies TokenGroup;
