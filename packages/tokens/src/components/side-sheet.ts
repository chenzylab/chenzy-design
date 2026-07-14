/**
 * Component tokens for SideSheet（M5 展示类）。严格镜像 Semi Design
 * （semi-foundation/sideSheet/variables.scss 19 个 + animation.scss 12 个），升级为带元数据
 * 的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量，
 * 与 Semi 变量一一对应。组件（SideSheet.svelte）直接消费这些对齐层 token，
 * 无 chenzy 自造中间短名层（对齐 Modal 范式）。
 *
 * 命名映射：
 *  - Semi sideSheet（camelCase）→ 我们 kebab（side-sheet）；var(--semi-color-*) 一一对应
 *    var(--cd-color-*)；var(--semi-color-overlay-bg) → var(--cd-color-overlay-bg)。
 *  - Semi $spacing-loose → var(--cd-spacing-loose)（24px）；$spacing-base-loose →
 *    var(--cd-spacing-base-loose)（20px）。
 *  - Semi $font-weight-bold → var(--cd-font-weight-bold)；$font-size-header-5 →
 *    var(--cd-font-size-header-5)。
 *  - 非模态（mask=false）面板阴影：Semi 用 var(--semi-shadow-elevated) →
 *    var(--cd-shadow-elevated)（组件 .cd-sidesheet-fixed 内联消费，Semi 无独立 token）。
 *  - animation：Semi $animation_duration/function/delay-sideSheet_{mask|inner}-{show|hide} →
 *    --cd-animation-duration/function/delay-side-sheet-{mask|inner}-{show|hide}。
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

  // —— Animation（对齐 Semi animation.scss；mask/inner × show/hide × duration/function/delay）——
  'animation-duration-side-sheet-mask-show': { value: '180ms', category: 'animation', label: '蒙层入场时长', usage: '侧边栏打开时-蒙层-动画持续时间' },
  'animation-function-side-sheet-mask-show': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '蒙层入场曲线', usage: '侧边栏打开时-蒙层-过渡曲线' },
  'animation-delay-side-sheet-mask-show': { value: '0ms', category: 'animation', label: '蒙层入场延迟', usage: '侧边栏打开时-蒙层-延迟时间' },
  'animation-duration-side-sheet-mask-hide': { value: '180ms', category: 'animation', label: '蒙层出场时长', usage: '侧边栏关闭时-蒙层-动画持续时间' },
  'animation-function-side-sheet-mask-hide': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '蒙层出场曲线', usage: '侧边栏关闭时-蒙层-过渡曲线' },
  'animation-delay-side-sheet-mask-hide': { value: '0ms', category: 'animation', label: '蒙层出场延迟', usage: '侧边栏关闭时-蒙层-延迟时间' },
  'animation-duration-side-sheet-inner-show': { value: '180ms', category: 'animation', label: '面板入场时长', usage: '侧边栏打开-动画持续时间' },
  'animation-function-side-sheet-inner-show': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '面板入场曲线', usage: '侧边栏打开-过渡曲线' },
  'animation-delay-side-sheet-inner-show': { value: '0ms', category: 'animation', label: '面板入场延迟', usage: '侧边栏打开-延迟时间' },
  'animation-duration-side-sheet-inner-hide': { value: '180ms', category: 'animation', label: '面板出场时长', usage: '侧边栏关闭-动画持续时间' },
  'animation-function-side-sheet-inner-hide': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '面板出场曲线', usage: '侧边栏关闭-过渡曲线' },
  'animation-delay-side-sheet-inner-hide': { value: '0ms', category: 'animation', label: '面板出场延迟', usage: '侧边栏关闭-延迟时间' },
} satisfies TokenGroup;
