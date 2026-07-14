/**
 * Component tokens for Popconfirm（严格对齐 Semi Design
 * semi-foundation/popconfirm/variables.scss，无自造中间变量）。
 *
 * 与 Semi 的映射：
 *  - var(--semi-color-*) → var(--cd-color-*)；$font-weight-bold → var(--cd-font-weight-bold)；
 *    var(--semi-border-radius-medium) → var(--cd-border-radius-medium)。
 *  - $spacing-popconfirm-* 的 calc 依赖同族 token，忠实翻译为 CSS calc(...)，
 *    引用本组 token 的 CSS 变量名（--cd-spacing-popconfirm-*）。
 *  - 组件（Popconfirm.svelte）直接消费这些正名 token，不再经任何 --cd-popconfirm-* 短名中间层。
 */
import type { TokenGroup } from './token-def.js';

export const popconfirmTokens = {
  // —— Color ——
  'color-popconfirm-header-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文字颜色', usage: '标题文字颜色' },
  'color-popconfirm-body-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '正文文字颜色', usage: '正文文字颜色' },
  'color-popconfirm-header-alert-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警示图标颜色', usage: '警示图标颜色' },

  // —— Width / Height ——
  'width-popconfirm-icon': { value: '24px', category: 'width', label: '图标宽度', usage: '图标宽度' },
  'width-popconfirm-close-btn': { value: '24px', category: 'width', label: '关闭按钮宽度', usage: '关闭按钮宽度' },
  'width-popconfirm-maxwidth': { value: '400px', category: 'width', label: '整体最大宽度', usage: '整体最大宽度' },

  // —— Spacing ——
  'spacing-popconfirm-top': { value: '24px', category: 'spacing', label: '顶部内边距', usage: '顶部内边距' },
  'spacing-popconfirm-bottom': { value: '20px', category: 'spacing', label: '底部内边距', usage: '底部内边距' },
  'spacing-popconfirm-btn-close-margin': { value: '24px', category: 'spacing', label: '关闭按钮外边距', usage: '关闭按钮顶部 & 右侧外边距' },
  'spacing-popconfirm-with-arrow-padding': { value: '12px', category: 'spacing', label: '带箭头内边距', usage: '顶部内边距' },
  'spacing-popconfirm-header-title-marginbottom': { value: '8px', category: 'spacing', label: 'header 标题底外边距', usage: 'header 标题底部外边距' },
  'spacing-popconfirm-header-content-p-padding': { value: '0', category: 'spacing', label: 'header 正文内边距', usage: 'header 正文内边距' },
  'spacing-popconfirm-header-content-p-margin': { value: '0', category: 'spacing', label: 'header 正文外边距', usage: 'header 正文外边距' },
  'spacing-popconfirm-body-p-padding': { value: '0', category: 'spacing', label: 'body 正文内边距', usage: 'body 正文内边距' },
  'spacing-popconfirm-body-p-margin': { value: '0', category: 'spacing', label: 'body 正文外边距', usage: 'body 正文外边距' },
  'spacing-popconfirm-footer-margintop': { value: '25px', category: 'spacing', label: 'footer 顶外边距', usage: 'footer 顶部外边距' },
  'spacing-popconfirm-footer-btn-marginright': { value: '8px', category: 'spacing', label: 'footer 按钮右外边距', usage: 'footer 按钮右侧外边距' },
  'spacing-popconfirm-popover-with-arrow-inner-padding': { value: 'calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-bottom) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头浮层内边距', usage: '带三角形箭头时的内边距' },
  'spacing-popconfirm-popover-with-arrow-inner-rtl-padding': { value: 'calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-bottom) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头浮层内边距(rtl)', usage: '带三角形箭头时的内边距(rtl)' },
  'spacing-popconfirm-popover-with-arrow-inner-btn-close-margintop': { value: 'calc(var(--cd-spacing-popconfirm-btn-close-margin) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头关闭按钮顶外边距', usage: '带三角形箭头时关闭按钮的顶部外边距' },
  'spacing-popconfirm-header-icon-marginright': { value: '12px', category: 'spacing', label: 'header 图标右外边距', usage: 'header 图标的右侧外边距' },

  // —— Font ——
  'font-popconfirm-header-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 标题字重', usage: 'header 标题字重' },

  // —— Radius ——
  'radius-popconfirm-popover': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '气泡确认框圆角', usage: '气泡确认框圆角大小' },
} satisfies TokenGroup;
