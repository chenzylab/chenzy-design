/**
 * Component tokens for Drawer（M5 Feedback）。升级为带元数据的 TokenDef 结构以支持 DSM。
 *
 * Semi Design 无独立 drawer variables（Semi 用 SideSheet 承载抽屉语义）。Drawer 为
 * chenzy-design 复用 SideSheet 语义的自有组件，故保留自有 drawer-* token 名（组件消费），
 * 但凡与 SideSheet 语义重合的项一律 var() 引 SideSheet 对齐 Semi 的 side-sheet-* 层
 * token，使值随 Semi 对齐而收敛；Drawer 独有的百分比/固定尺寸档保留字面量。
 *
 * 注：
 *  - drawer-* 与 side-sheet.ts 的 sidesheet-* / *-side-sheet-* 均不同名，CSS 不会重复
 *    emit 同一变量；drawer-* 引用 side-sheet 层构成单向 var() 链，无自引用。
 *  - var(--cd-color-*) / var(--cd-spacing-*) 等为 alias / global 层，非本组件层，无死循环。
 */
import type { TokenGroup } from './token-def.js';

export const drawerTokens = {
  // —— Color（引 SideSheet 对齐 Semi 层） ——
  'drawer-bg': { value: 'var(--cd-color-side-sheet-bg)', category: 'color', label: '背景色', usage: '抽屉背景颜色（引 color-side-sheet-bg，随 Semi 对齐）' },
  'drawer-color-text': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '文本颜色', usage: '抽屉默认文本颜色（引 color-side-sheet-main-text）' },
  'drawer-color-title': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '标题颜色', usage: '抽屉标题颜色（引 color-side-sheet-main-text）' },
  'drawer-border': { value: 'var(--cd-color-side-sheet-header-border-bottom)', category: 'color', label: '分隔线颜色', usage: 'header/footer 分隔线颜色（引 color-side-sheet-header-border-bottom）' },
  'drawer-mask-bg': { value: 'var(--cd-color-side-sheet-mask-bg)', category: 'color', label: '蒙层颜色', usage: '抽屉蒙层颜色（引 color-side-sheet-mask-bg，随 Semi 对齐）' },
  'drawer-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '抽屉面板阴影' },

  // —— Size（Drawer 自有固定尺寸档） ——
  'drawer-width': { value: '448px', category: 'width', label: '宽度 - 默认', usage: '抽屉默认宽度（对齐 Semi sideSheet 小尺寸 448px）' },
  'drawer-width-small': { value: '320px', category: 'width', label: '宽度 - 小', usage: '抽屉小尺寸宽度' },
  'drawer-width-large': { value: '720px', category: 'width', label: '宽度 - 大', usage: '抽屉大尺寸宽度' },
  'drawer-height': { value: '320px', category: 'height', label: '高度 - 默认', usage: '抽屉默认高度（top/bottom 方向）' },
  'drawer-height-small': { value: '240px', category: 'height', label: '高度 - 小', usage: '抽屉小尺寸高度' },
  'drawer-height-large': { value: '480px', category: 'height', label: '高度 - 大', usage: '抽屉大尺寸高度' },

  // —— Spacing（引 SideSheet 对齐 Semi 层） ——
  'drawer-header-padding': { value: 'var(--cd-spacing-side-sheet-header-padding)', category: 'spacing', label: 'header 内边距', usage: 'header 内边距（引 spacing-side-sheet-header-padding，对齐 Semi 24px）' },
  'drawer-body-padding': { value: 'var(--cd-spacing-side-sheet-body-paddingx)', category: 'spacing', label: 'body 内边距', usage: 'body 内边距（引 spacing-side-sheet-body-paddingx，对齐 Semi 24px）' },
  'drawer-footer-padding': { value: 'var(--cd-spacing-side-sheet-footer-padding)', category: 'spacing', label: 'footer 内边距', usage: 'footer 内边距（引 spacing-side-sheet-footer-padding，对齐 Semi 24px）' },
  'drawer-footer-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'footer 按钮间距', usage: 'footer 按钮间距（组件消费）' },

  // —— Font（引 SideSheet 对齐 Semi 层） ——
  'drawer-title-color': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '标题颜色', usage: '标题文字颜色（引 color-side-sheet-main-text）' },
  'drawer-title-size': { value: 'var(--cd-font-side-sheet-title-fontsize)', category: 'font', label: '标题字号', usage: '标题字号（引 font-side-sheet-title-fontsize，对齐 Semi header-5）' },
  'drawer-title-weight': { value: 'var(--cd-font-side-sheet-title-fontweight)', category: 'font', label: '标题字重', usage: '标题字重（引 font-side-sheet-title-fontweight，对齐 Semi bold）' },

  // —— Close button ——
  'drawer-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费；修正原悬空 --cd-radius-sm）' },
  'drawer-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '关闭按钮图标颜色（组件消费）' },
  'drawer-close-color-hover': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '关闭图标悬浮色', usage: '关闭按钮悬浮图标颜色（引 color-side-sheet-main-text）' },
  'drawer-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },

  // —— Other ——
  'drawer-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '浮层层叠 z-index 基线（组件消费；运行时按堆叠计数覆盖）' },
  'drawer-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '开合过渡时长（组件消费）' },
} satisfies TokenGroup;
