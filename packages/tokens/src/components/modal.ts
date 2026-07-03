/**
 * Component tokens for Modal（M5 Feedback）。对齐 Semi Design
 * （semi-foundation/modal/variables.scss），仅保留组件实际消费的 token，并升级为
 * 带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Modal / ConfirmModal 实际消费的补充 token（原名，Semi 无 /
 * 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)；var(--semi-color-overlay-bg)
 *    → var(--cd-color-overlay-bg)。
 *  - Semi $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；
 *    $font-size-regular → var(--cd-font-size-regular)；$font-weight-bold →
 *    var(--cd-font-weight-bold)。
 *  - var(--semi-border-radius-large) → var(--cd-border-radius-large)；
 *    var(--semi-shadow-elevated) → var(--cd-shadow-elevated)。
 *  - 组件 token 名（color-modal-* / spacing-modal-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const modalTokens = {
  // —— Color ——
  'color-modal-primary-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '主要图标颜色', usage: '模态框主要图标颜色' },
  'color-modal-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标颜色', usage: '模态框成功图标颜色' },
  'color-modal-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '危险图标颜色', usage: '模态框危险图标颜色' },
  'color-modal-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标颜色', usage: '模态框警告图标颜色' },

  // —— Spacing ——
  'spacing-modal-marginy': { value: '80px', category: 'spacing', label: '距顶外边距', usage: '模态框距容器顶部外边距' },
  'spacing-modal-confirm-icon-wrapper-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '命令式图标右外边距', usage: '命令式调用模态框图标右侧外边距' },

  // —— chenzy-design Modal / ConfirmModal 实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费） ——
  'modal-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '面板圆角', usage: '面板圆角（组件消费）' },
  'modal-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '面板背景色', usage: '面板背景（组件消费）' },
  'modal-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '面板阴影（组件消费）' },
  'modal-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '蒙层背景色', usage: '蒙层背景（组件消费）' },
  'modal-padding': { value: '24px', category: 'spacing', label: '面板内边距', usage: '面板内边距（组件消费；对齐 Semi 内容水平内边距 24px）' },
  'modal-header-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'header 间距', usage: 'header 元素与底部间距（组件消费）' },
  'modal-footer-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 按钮间距', usage: 'footer 按钮间距（组件消费；对齐 Semi 按钮左外边距 12px）' },
  'modal-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '标题文字颜色（组件消费）' },
  'modal-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '标题字号（组件消费）' },
  'modal-title-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '标题字重（组件消费）' },
  'modal-body-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '正文颜色', usage: '正文文字颜色（组件消费）' },
  'modal-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '关闭按钮图标颜色（组件消费）' },
  'modal-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },
  'modal-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '面板层叠 z-index 基线（组件消费；运行时按堆叠计数覆盖）' },
} satisfies TokenGroup;
