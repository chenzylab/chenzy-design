/**
 * Component tokens for Progress（M5 Feedback）。严格镜像 Semi Design
 * semi-foundation/progress/variables.scss 的 19 个变量（名与值一一对应），
 * 不含任何自造中间 token。值为 var() 引用我们的 alias / global token 或字面量。
 *
 * 映射说明：
 *  - Semi var(--semi-color-*) → var(--cd-color-*)：fill-0 / success / text-0。
 *  - Semi var(--semi-color-mode-minor-text) 仅 progress 引用，且仅暗色主题注入、
 *    亮色主题未定义；我们无对应 alias，环形文字色对齐组件实际渲染映射 text-0。
 *  - Semi $spacing-base → var(--cd-spacing-base)（16px）；$spacing-extra-tight →
 *    var(--cd-spacing-extra-tight)（4px）；$spacing-tight → var(--cd-spacing-tight)（8px）。
 *  - Semi var(--semi-border-radius-small) → var(--cd-border-radius-small)（3px）。
 *  - 组件 token 名（color-progress-* / spacing-progress-* …）与 alias / global 层
 *    不同名，var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const progressTokens = {
  // —— Color ——
  'color-progress-default-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '默认背景色', usage: '进度条轨道默认背景色' },
  'color-progress-track-inner-bg': { value: 'var(--cd-color-success)', category: 'color', label: '默认进度色', usage: '进度条填充默认颜色' },
  'color-progress-line-text-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '百分比文本文字颜色', usage: '条状进度条百分比文本文字颜色' },
  'color-progress-circle-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '环形百分比文本颜色', usage: '环形进度条中心文本颜色（Semi 用 mode-minor-text，亮色未定义，映射 text-0）' },

  // —— Motion ——
  'motion-progress-transition-duration': { value: '0.3s', category: 'animation', label: '进度条动画时长', usage: '进度条动画时长' },
  'motion-progress-transition-timing-function': { value: 'cubic-bezier(0.62, 0.05, 0.36, 0.95)', category: 'animation', label: '进度条动画曲线', usage: '进度条动画曲线' },

  // —— Height ——
  'height-progress-horizontal': { value: '4px', category: 'height', label: '水平进度条高度', usage: '水平进度条高度' },
  'height-progress-horizontal-large': { value: '6px', category: 'height', label: '大尺寸水平进度条高度', usage: '大尺寸水平进度条高度' },

  // —— Spacing ——
  'spacing-progress-line-text-marginleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平进度条百分比文本左侧外边距', usage: '水平进度条百分比文本左侧外边距' },
  'spacing-progress-line-text-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平进度条百分比文本右侧外边距', usage: '水平进度条百分比文本右侧外边距（RTL）' },
  'spacing-progress-vertical-marginx': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '垂直进度条水平方向外边距', usage: '垂直进度条水平方向外边距' },
  'spacing-progress-horizontal-marginy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '水平进度条垂直方向外边距', usage: '水平进度条垂直方向外边距' },
  'spacing-progress-vertical-line-text-margintop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直进度条百分比文本顶部外边距', usage: '垂直进度条百分比文本顶部外边距' },

  // —— Font ——
  'font-progress-line-text-fontweight': { value: '600', category: 'font', label: '百分比文本字重', usage: '百分比文本字重' },

  // —— Width ——
  'width-progress-line-text': { value: '45px', category: 'width', label: '百分比文本最小宽度', usage: '百分比文本最小宽度' },
  'width-progress-vertical': { value: '4px', category: 'width', label: '垂直进度条宽度', usage: '垂直进度条宽度' },
  'width-progress-vertical-large': { value: '6px', category: 'width', label: '大尺寸垂直进度条宽度', usage: '大尺寸垂直进度条宽度' },

  // —— Radius ——
  'radius-progress-track': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '背景圆角大小', usage: '进度条轨道背景圆角' },
  'radius-progress-track-inner': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '进度条圆角大小', usage: '进度条填充圆角' },
} satisfies TokenGroup;
