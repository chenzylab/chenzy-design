/**
 * Component tokens for Slider —— 严格对齐 Semi Design（semi-foundation/slider/variables.scss）。
 * 破坏性精简：删除自造中间层（slider-rail-height / slider-rail-bg / slider-handle-* 别名、
 * slider-tip-* 气泡 token（气泡改复用 Tooltip 组件 token）、slider-status-* 校验态、
 * slider-boundary/padding/gap 语义化别名等），仅保留与 Semi variables.scss 名值对应的 token。
 * 值 var() 引用本库 alias / global token，或字面量。
 *
 * 名值对齐要点：
 *  - Semi $radius-slider_rail/track = var(--semi-border-radius-small) → var(--cd-border-radius-small)（3px，非 full）。
 *  - Semi 手柄常态 border:none，仅 focus outline / disabled 1px border；无常态 primary 描边。
 *  - Semi $width-slider_dot: 4px（点直径 4px，非本库旧值 8px）。
 *  - Semi $color-slider_dot-*: var(--semi-color-white) 系。
 */
import type { TokenGroup } from './token-def.js';

export const sliderTokens = {
  // —— Color（对齐 Semi variables.scss Color 段）——
  'color-slider-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '滑块文本色', usage: '滑动条文本颜色 - 默认' },
  'color-slider-dot-bg-default': { value: 'var(--cd-color-white)', category: 'color', label: '刻度点背景色', usage: '滑动条圆形刻度点颜色 - 默认态' },
  'color-slider-dot-border-active': { value: 'var(--cd-color-white)', category: 'color', label: '刻度点激活背景色', usage: '滑动条圆形刻度点颜色 - 按下态（命中段）' },
  'color-slider-handle-bg-default': { value: 'var(--cd-color-white)', category: 'color', label: '手柄背景色', usage: '滑动条圆形按钮颜色 - 默认态' },
  'color-slider-handle-bg-hover': { value: 'var(--cd-color-white)', category: 'color', label: '手柄悬停背景色', usage: '滑动条圆形按钮颜色 - 悬停态' },
  'color-slider-handle-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '手柄激活描边色', usage: '滑动条圆形描边颜色 - 激活态' },
  'color-slider-handle-disabled-border': { value: 'var(--cd-color-border)', category: 'color', label: '禁用手柄描边色', usage: '禁用滑动条圆形描边颜色 - 默认态' },
  'color-slider-mark-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '刻度文字色', usage: '滑动条刻度文字颜色' },
  'color-slider-rail-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '轨道背景色', usage: '滑动条轨道颜色 - 未填充' },
  'color-slider-track-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '已填充轨道色', usage: '滑动条轨道颜色 - 已填充' },
  'color-slider-track-disabled-bg': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '禁用已填充轨道色', usage: '禁用滑动条轨道颜色 - 已填充' },
  'color-slider-handle-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '手柄聚焦轮廓色', usage: '圆形按钮轮廓 - 聚焦' },
  'color-slider-handle-dot': { value: 'var(--cd-color-primary)', category: 'color', label: '手柄圆点色', usage: '圆形按钮内部圆点颜色' },

  // —— Radius（对齐 Semi $radius-slider_rail/track = small）——
  'radius-slider-rail': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '未填充轨道圆角', usage: '滚动条未填充轨道圆角' },
  'radius-slider-track': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '已填充轨道圆角', usage: '滚动条已填充轨道圆角' },

  // —— Width / Height（对齐 Semi variables.scss Width/Height 段）——
  'height-slider-wrapper': { value: '32px', category: 'height', label: '容器整体高度', usage: '滚动条容器整体高度' },
  'height-slider-rail': { value: '4px', category: 'height', label: '未填充轨道高度', usage: '滚动条未填充轨道高度' },
  'height-slider-track': { value: '4px', category: 'height', label: '已填充轨道高度', usage: '滚动条已填充轨道高度' },
  'width-slider-handle': { value: '24px', category: 'width', label: '手柄宽度', usage: '滚动条圆形按钮宽度' },
  'width-slider-handle-clicked': { value: '1px', category: 'width', label: '手柄按下描边宽度', usage: '滚动条圆形按钮按下后描边宽度' },
  'width-slider-dot': { value: '4px', category: 'width', label: '刻度点宽度', usage: '滚动条圆形刻度点宽度' },
  'width-slider-handle-border-disabled': { value: '1px', category: 'width', label: '禁用手柄描边宽度', usage: '禁用滚动条圆形按钮描边宽度' },
  'width-slider-handle-focus': { value: '2px', category: 'width', label: '手柄聚焦轮廓宽度', usage: '圆形按钮轮廓 - 聚焦' },
  'width-slider-handle-dot': { value: '4px', category: 'width', label: '手柄圆点宽度', usage: '圆形按钮内部圆点宽度' },

  // —— Spacing（对齐 Semi variables.scss Spacing 段：水平内边距与各定位偏移）——
  'spacing-slider-paddingx': { value: '13px', category: 'spacing', label: '整体水平内边距', usage: '滑动条整体水平内边距' },
  'spacing-slider-rail-top': { value: '14px', category: 'spacing', label: '轨道顶部距离', usage: '滑动条未填充轨道顶部距离' },
  'spacing-slider-marks-top': { value: '23px', category: 'spacing', label: '刻度标签顶部距离', usage: '滑动条刻度标签顶部距离' },
  'spacing-slider-boundary-top': { value: '30px', category: 'spacing', label: '边界值顶部距离', usage: '边界值标签顶部距离' },

  // —— Font（对齐 Semi variables.scss Font 段）——
  'font-slider-marks-fontsize': { value: '14px', category: 'font', label: '刻度标签字号', usage: '滚动条刻度标签字号' },

  // —— Shadow（对齐 Semi @mixin shadow-knob，手柄常态阴影）——
  'shadow-slider-knob': { value: '0 4px 6px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.3)', category: 'other', label: '手柄阴影', usage: '滑动条圆形按钮阴影（对齐 Semi shadow-knob）' },
} satisfies TokenGroup;
