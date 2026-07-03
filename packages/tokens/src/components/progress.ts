/**
 * Component tokens for Progress（M5 Feedback）。全量对齐 Semi Design
 * （semi-foundation/progress/variables.scss 19 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Progress 实际消费的补充 token（原名，Semi 无 / 命名差异；
 * 组件消费），其值对齐 Semi。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)：fill-0 / success /
 *    text-0。
 *  - Semi $spacing-base → var(--cd-spacing-base)（16px）；$spacing-extra-tight →
 *    var(--cd-spacing-extra-tight)（4px）；$spacing-tight → var(--cd-spacing-tight)（8px）。
 *  - Semi var(--semi-border-radius-small) → var(--cd-border-radius-small)（3px）。
 *  - Semi 的 var(--semi-color-mode-minor-text) 仅在 progress 里被引用，默认亮色主题
 *    未定义该变量（暗色主题才注入），我们无对应 alias；对齐组件实际渲染（info 文字用
 *    text-0），circle 文字色映射 var(--cd-color-text-0)，未发明新 alias。
 *  - 组件 token 名（color-progress-* / spacing-progress-* …）与 alias / global 层
 *    不同名，var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const progressTokens = {
  // —— Color ——
  'color-progress-default-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '默认背景色', usage: '默认背景色' },
  'color-progress-track-inner-bg': { value: 'var(--cd-color-success)', category: 'color', label: '默认进度色', usage: '默认进度色' },
  'color-progress-line-text-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '百分比文本文字颜色', usage: '百分比文本文字颜色' },
  'color-progress-circle-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '环形百分比文本颜色', usage: '环形进度条百分比文本文字颜色（Semi 用 mode-minor-text，亮色未定义，映射 text-0）' },

  // —— Motion ——
  'motion-progress-transition-duration': { value: '0.3s', category: 'animation', label: '进度条动画时长', usage: '进度条动画时长' },
  'motion-progress-transition-timing-function': { value: 'cubic-bezier(0.62, 0.05, 0.36, 0.95)', category: 'animation', label: '进度条动画曲线', usage: '进度条动画曲线' },

  // —— Height ——
  'height-progress-horizontal': { value: '4px', category: 'height', label: '水平进度条高度', usage: '水平进度条高度' },
  'height-progress-horizontal-large': { value: '6px', category: 'height', label: '大尺寸水平进度条高度', usage: '大尺寸水平进度条高度' },

  // —— Spacing ——
  'spacing-progress-line-text-marginleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平进度条百分比文本左侧外边距', usage: '水平进度条百分比文本左侧外边距' },
  'spacing-progress-line-text-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平进度条百分比文本右侧外边距', usage: '水平进度条百分比文本右侧外边距' },
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
  'radius-progress-track': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '背景圆角大小', usage: '背景圆角大小' },
  'radius-progress-track-inner': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '进度条圆角大小', usage: '进度条圆角大小' },

  // —— chenzy-design Progress 实际消费的补充 token（Semi 无 / 命名差异；组件消费，值对齐 Semi） ——
  'progress-track-color': { value: 'var(--cd-color-progress-default-bg)', category: 'color', label: '轨道背景色', usage: '进度条轨道（背景）颜色（组件消费）' },
  'progress-stroke-normal': { value: 'var(--cd-color-progress-track-inner-bg)', category: 'color', label: '默认进度色', usage: '默认进度色（对齐 Semi success 绿；组件消费）' },
  'progress-stroke-success': { value: 'var(--cd-color-success)', category: 'color', label: '成功进度色', usage: '成功态进度色（组件消费）' },
  'progress-stroke-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误进度色', usage: '错误态进度色（组件消费）' },
  'progress-stroke-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警告进度色', usage: '警告态进度色（组件消费）' },
  'progress-info-color': { value: 'var(--cd-color-progress-line-text-text)', category: 'color', label: '信息文字色', usage: '百分比信息文字颜色（组件消费）' },
  'progress-info-success-color': { value: 'var(--cd-color-success)', category: 'color', label: '成功信息文字色', usage: '成功态百分比信息文字颜色（组件消费）' },
  'progress-height-small': { value: 'var(--cd-height-progress-horizontal)', category: 'height', label: '小尺寸条高', usage: '小尺寸水平进度条高度（组件消费）' },
  'progress-height-default': { value: 'var(--cd-height-progress-horizontal)', category: 'height', label: '默认条高', usage: '默认水平进度条高度（对齐 Semi 4px；组件消费）' },
  'progress-height-large': { value: 'var(--cd-height-progress-horizontal-large)', category: 'height', label: '大尺寸条高', usage: '大尺寸水平进度条高度（对齐 Semi 6px；组件消费）' },
  'progress-circle-size-small': { value: '80px', category: 'width', label: '小尺寸环径', usage: '小尺寸环形进度条直径（组件消费）' },
  'progress-circle-size-default': { value: '120px', category: 'width', label: '默认环径', usage: '默认环形进度条直径（组件消费）' },
  'progress-circle-size-large': { value: '160px', category: 'width', label: '大尺寸环径', usage: '大尺寸环形进度条直径（组件消费）' },
  'progress-transition': { value: 'var(--cd-motion-progress-transition-duration) var(--cd-motion-progress-transition-timing-function)', category: 'animation', label: '进度过渡', usage: '进度条过渡（对齐 Semi 0.3s + 专属曲线；组件消费）' },
  'progress-info-color-circle': { value: 'var(--cd-color-progress-circle-text)', category: 'color', label: '环形信息文字色', usage: '环形进度条百分比信息文字颜色（组件消费）' },
  'progress-info-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '信息字号', usage: '水平进度条百分比信息文字大小（组件消费）' },
  'progress-info-font-size-circle': { value: 'var(--cd-font-size-header-4)', category: 'font', label: '环形信息字号', usage: '环形进度条百分比信息文字大小（组件消费）' },
  'progress-info-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '信息间距', usage: '进度条与百分比信息间距（组件消费）' },
} satisfies TokenGroup;
