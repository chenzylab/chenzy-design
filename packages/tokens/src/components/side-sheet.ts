/**
 * Component tokens for SideSheet（M5 Feedback）。全量对齐 Semi Design
 * （semi-foundation/sideSheet/variables.scss 19 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design SideSheet 实际消费的补充 token（原名 sidesheet-*，Semi 无 /
 * 命名差异；组件消费），一律 var() 引 Semi 对齐层 token，无自引用。
 *
 * 注：
 *  - Semi sideSheet（camelCase）→ 我们 kebab（side-sheet）；var(--semi-color-*) 一一对应
 *    var(--cd-color-*)；var(--semi-color-overlay-bg) → var(--cd-color-overlay-bg)。
 *  - Semi $spacing-loose → var(--cd-spacing-loose)（24px）；$spacing-base-loose →
 *    var(--cd-spacing-base-loose)（20px）。
 *  - $font-weight-bold → var(--cd-font-weight-bold)；$font-size-header-5 →
 *    var(--cd-font-size-header-5)。
 *  - 组件 token 名（color-side-sheet-* / spacing-side-sheet-* …）与 alias / global 层
 *    不同名，var() 无自引用死循环。
 *  - Drawer 复用 SideSheet 语义但保留自有 drawer-* token（见 drawer.ts）；两文件 token 名
 *    不同名，CSS 不会重复 emit 同一变量。
 */
import type { TokenGroup } from './token-def.js';

export const sideSheetTokens = {
  // —— Color ——
  'color-side-sheet-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '蒙层颜色', usage: '侧边栏打开后蒙层颜色' },
  'color-side-sheet-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '背景色', usage: '侧边栏背景颜色' },
  'color-side-sheet-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '文本颜色', usage: '侧边栏默认文本颜色' },
  'color-side-sheet-header-border-bottom': { value: 'var(--cd-color-border)', category: 'color', label: 'header 底部边框色', usage: '侧边栏 header 底部边框颜色' },

  // —— Spacing ——
  'spacing-side-sheet-margin': { value: '0', category: 'spacing', label: '整体外边距', usage: '侧边栏整体外边距' },
  'spacing-side-sheet-title-margin': { value: '0', category: 'spacing', label: '标题外边距', usage: '侧边栏标题外边距' },
  'spacing-side-sheet-header-padding': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'header 内边距', usage: '侧边栏 header 内边距' },
  'spacing-side-sheet-header-padding-bottom': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: 'header 底部内边距', usage: '侧边栏 header 底部内边距' },
  'spacing-side-sheet-body-paddingy': { value: '0', category: 'spacing', label: 'body 垂直内边距', usage: '侧边栏 body 垂直内边距' },
  'spacing-side-sheet-body-paddingx': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'body 水平内边距', usage: '侧边栏 body 水平内边距' },
  'spacing-side-sheet-footer-padding': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'footer 内边距', usage: '侧边栏 footer 内边距' },

  // —— Width / Border ——
  'width-side-sheet-header-border-bottom': { value: '0px', category: 'width', label: 'header 底部边框宽度', usage: '侧边栏 header 底部边框宽度' },
  'width-side-sheet-size-small': { value: '448px', category: 'width', label: '宽度 - 小', usage: '小尺寸侧边栏宽度' },
  'width-side-sheet-size-medium': { value: '684px', category: 'width', label: '宽度 - 中', usage: '中尺寸侧边栏宽度' },
  'width-side-sheet-size-large': { value: '920px', category: 'width', label: '宽度 - 大', usage: '大尺寸侧边栏宽度' },

  // —— Font ——
  'font-side-sheet-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '侧边栏标题文本字重' },
  'font-side-sheet-title-fontsize': { value: 'var(--cd-font-size-header-5)', category: 'font', label: '标题字号', usage: '侧边栏标题文本字号' },

  // —— Filter ——
  'filter-side-sheet-mask-bg': { value: 'none', category: 'other', label: '蒙层滤镜', usage: '侧边栏蒙层背景滤镜' },
  'filter-side-sheet-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '侧边栏背景滤镜' },

  // —— chenzy-design SideSheet 实际消费的补充 token（原名 sidesheet-*，Semi 无 / 命名差异；组件消费） ——
  'sidesheet-bg': { value: 'var(--cd-color-side-sheet-bg)', category: 'color', label: '面板背景色', usage: '面板背景（组件消费；引 color-side-sheet-bg）' },
  'sidesheet-color': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '文本颜色', usage: '默认文本颜色（组件消费；引 color-side-sheet-main-text）' },
  'sidesheet-mask-bg': { value: 'var(--cd-color-side-sheet-mask-bg)', category: 'color', label: '蒙层背景色', usage: '蒙层背景（组件消费；引 color-side-sheet-mask-bg）' },
  'sidesheet-border': { value: 'var(--cd-color-side-sheet-header-border-bottom)', category: 'color', label: '分隔线颜色', usage: 'header/footer 分隔线颜色（组件消费；引 color-side-sheet-header-border-bottom）' },
  'sidesheet-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '面板圆角', usage: '面板贴边圆角（组件消费；Semi sideSheet 无圆角 token，chenzy 自有视觉）' },
  'sidesheet-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '面板阴影（组件消费；Semi sideSheet 无阴影 token，chenzy 自有视觉）' },
  'sidesheet-padding': { value: 'var(--cd-spacing-side-sheet-body-paddingx)', category: 'spacing', label: 'body 内边距', usage: 'body 内边距（组件消费；对齐 Semi body 水平内边距 24px）' },
  'sidesheet-header-padding': { value: 'var(--cd-spacing-side-sheet-header-padding)', category: 'spacing', label: 'header 内边距', usage: 'header 内边距（组件消费；对齐 Semi header 内边距 24px）' },
  'sidesheet-footer-padding': { value: 'var(--cd-spacing-side-sheet-footer-padding)', category: 'spacing', label: 'footer 内边距', usage: 'footer 内边距（组件消费；对齐 Semi footer 内边距 24px）' },
  'sidesheet-title-color': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '标题颜色', usage: '标题文字颜色（组件消费；引 color-side-sheet-main-text）' },
  'sidesheet-title-size': { value: 'var(--cd-font-side-sheet-title-fontsize)', category: 'font', label: '标题字号', usage: '标题字号（组件消费；引 font-side-sheet-title-fontsize，对齐 Semi header-5）' },
  'sidesheet-title-weight': { value: 'var(--cd-font-side-sheet-title-fontweight)', category: 'font', label: '标题字重', usage: '标题字重（组件消费；引 font-side-sheet-title-fontweight，对齐 Semi bold）' },
  'sidesheet-close-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费）' },
  'sidesheet-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '关闭按钮图标颜色（组件消费）' },
  'sidesheet-close-color-hover': { value: 'var(--cd-color-side-sheet-main-text)', category: 'color', label: '关闭图标悬浮色', usage: '关闭按钮悬浮图标颜色（组件消费；引 color-side-sheet-main-text）' },
  'sidesheet-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },
  'sidesheet-width-small': { value: 'var(--cd-width-side-sheet-size-small)', category: 'width', label: '宽度 - 小', usage: '小尺寸宽度（组件消费；引 width-side-sheet-size-small，对齐 Semi 448px）' },
  'sidesheet-width': { value: '60%', category: 'width', label: '宽度 - 默认', usage: '默认尺寸宽度（组件消费；chenzy 自有百分比策略）' },
  'sidesheet-width-large': { value: '90%', category: 'width', label: '宽度 - 大', usage: '大尺寸宽度（组件消费；chenzy 自有百分比策略）' },
  'sidesheet-height-small': { value: '40%', category: 'height', label: '高度 - 小', usage: '小尺寸高度（组件消费；chenzy 自有百分比策略）' },
  'sidesheet-height': { value: '60%', category: 'height', label: '高度 - 默认', usage: '默认尺寸高度（组件消费；chenzy 自有百分比策略）' },
  'sidesheet-height-large': { value: '90%', category: 'height', label: '高度 - 大', usage: '大尺寸高度（组件消费；chenzy 自有百分比策略）' },
  'sidesheet-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '浮层层叠 z-index 基线（组件消费；运行时按堆叠计数覆盖）' },
  'sidesheet-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '开合过渡时长（组件消费）' },
} satisfies TokenGroup;
