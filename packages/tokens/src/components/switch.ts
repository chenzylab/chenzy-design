/**
 * Component tokens for Switch — 严格对齐 Semi Design（semi-foundation/switch/variables.scss）。
 * 名值对齐 Semi；值引用本库 alias/global var(--cd-*) 或字面量（Semi 用 SCSS 计算的
 * knob 尺寸/位移在此忠实翻译为字面量 px，与 variables.scss 数值一致）。
 * 无自造中间层：组件 CSS 直接消费下列 --cd-switch-* token。
 *
 * DOM 偏离：本库根为 <button role=switch>（保留 APG pattern），Semi 为 div+隐藏 input；
 * knob 用 translateX 位移对齐 Semi（非 inset 定位）。
 *
 * 尺寸/位移映射（对齐 variables.scss）：
 *   default: 宽40 高24 knob18 padding2 tx_off2 tx_on18
 *   large:   宽54 高32 knob24 padding3 tx_off3 tx_on26
 *   small:   宽26 高16 knob12 padding1 tx_off1 tx_on11
 */
import type { TokenGroup } from './token-def.js';

export const switchTokens = {
  // —— 尺寸：宽 / 高（对齐 $width-switch* / $height-switch*） ——
  'switch-width-default': { value: '40px', category: 'width', label: '开关宽度', usage: '开关宽度 - 默认' },
  'switch-width-small': { value: '26px', category: 'width', label: '开关宽度', usage: '开关宽度 - 小尺寸' },
  'switch-width-large': { value: '54px', category: 'width', label: '开关宽度', usage: '开关宽度 - 大尺寸' },
  'switch-height-default': { value: '24px', category: 'height', label: '开关高度', usage: '开关高度 - 默认' },
  'switch-height-small': { value: '16px', category: 'height', label: '开关高度', usage: '开关高度 - 小尺寸' },
  'switch-height-large': { value: '32px', category: 'height', label: '开关高度', usage: '开关高度 - 大尺寸' },
  'switch-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '开关圆角', usage: '开关圆角（Semi=height*0.5，pill 等价）' },
  'switch-border-width': { value: '1px', category: 'width', label: '描边宽度', usage: '开关描边宽度（对齐 border-thickness-control）' },

  // —— 背景色：关态 / 开态 × 默认 / 悬浮 / 按下 / 禁用（对齐 $color-switch_*-bg-*） ——
  'switch-bg-off': { value: 'var(--cd-color-fill-0)', category: 'color', label: '关态背景', usage: '关闭态背景 - 默认' },
  'switch-bg-off-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关态悬浮背景', usage: '关闭态背景 - 悬浮' },
  'switch-bg-off-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '关态按下背景', usage: '关闭态背景 - 按下' },
  'switch-bg-on': { value: 'var(--cd-color-success)', category: 'color', label: '开态背景', usage: '开启态背景 - 默认' },
  'switch-bg-on-hover': { value: 'var(--cd-color-success-hover)', category: 'color', label: '开态悬浮背景', usage: '开启态背景 - 悬浮' },
  'switch-bg-on-active': { value: 'var(--cd-color-success-active)', category: 'color', label: '开态按下背景', usage: '开启态背景 - 按下' },
  'switch-bg-on-disabled': { value: 'var(--cd-color-success-disabled)', category: 'color', label: '禁用开态背景', usage: '禁用开启态背景' },
  'switch-border-off': { value: 'transparent', category: 'color', label: '关态描边', usage: '关闭态描边颜色' },

  // —— knob（滑块） ——
  'switch-knob-bg': { value: 'var(--cd-color-white)', category: 'color', label: '滑块背景', usage: '开关滑块背景颜色' },
  'switch-knob-shadow': { value: '0 4px 6px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.3)', category: 'other', label: '滑块阴影', usage: '开关滑块阴影（对齐 shadow-knob mixin）' },
  'switch-knob-size': { value: '18px', category: 'width', label: '滑块尺寸', usage: '滑块宽高 - 默认（$width-switch_knob_default）' },
  'switch-knob-size-large': { value: '24px', category: 'width', label: '大尺寸滑块尺寸', usage: '滑块宽高 - 大尺寸（$width-switch_knob_large）' },
  'switch-knob-size-small': { value: '12px', category: 'width', label: '小尺寸滑块尺寸', usage: '滑块宽高 - 小尺寸（$width-switch_knob_large_small）' },
  'switch-knob-padding': { value: '2px', category: 'spacing', label: '滑块顶部边距', usage: '滑块顶部边距 - 默认（$spacing-switch_knob-padding）' },
  'switch-knob-padding-large': { value: '3px', category: 'spacing', label: '大尺寸滑块顶部边距', usage: '滑块顶部边距 - 大尺寸（$spacing-switch_knob_large-padding）' },
  'switch-knob-padding-small': { value: '1px', category: 'spacing', label: '小尺寸滑块顶部边距', usage: '滑块顶部边距 - 小尺寸（$spacing-switch_knob_small-padding）' },
  'switch-knob-tx-off': { value: '2px', category: 'spacing', label: '关态滑块位移', usage: '滑块位移 - 关态默认（$spacing-switch_unchecked-translateX）' },
  'switch-knob-tx-on': { value: '18px', category: 'spacing', label: '开态滑块位移', usage: '滑块位移 - 开态默认（$spacing-switch_checked-translateX）' },
  'switch-knob-tx-off-large': { value: '3px', category: 'spacing', label: '大尺寸关态滑块位移', usage: '滑块位移 - 关态大尺寸（$spacing-switch_unchecked_large-translateX）' },
  'switch-knob-tx-on-large': { value: '26px', category: 'spacing', label: '大尺寸开态滑块位移', usage: '滑块位移 - 开态大尺寸（$spacing-switch_checked_large-translateX）' },
  'switch-knob-tx-off-small': { value: '1px', category: 'spacing', label: '小尺寸关态滑块位移', usage: '滑块位移 - 关态小尺寸（$spacing-switch_unchecked_small-translateX）' },
  'switch-knob-tx-on-small': { value: '11px', category: 'spacing', label: '小尺寸开态滑块位移', usage: '滑块位移 - 开态小尺寸（$spacing-switch_checked_small-translateX）' },

  // —— 内嵌文案 ——
  'switch-text-width': { value: '20px', category: 'width', label: '文案宽度', usage: '内嵌文案节点宽度 - 默认' },
  'switch-text-width-large': { value: '26px', category: 'width', label: '大尺寸文案宽度', usage: '内嵌文案节点宽度 - 大尺寸（$width-switch_checked_unchecked_text）' },
  'switch-text-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '文案字号', usage: '内嵌文案字号 - 默认' },
  'switch-text-font-size-large': { value: 'var(--cd-font-size-regular)', category: 'font', label: '大尺寸文案字号', usage: '内嵌文案字号 - 大尺寸' },
  'switch-checked-text-color': { value: 'var(--cd-color-white)', category: 'color', label: '开态文案色', usage: '开启态文案颜色（$color-switch_checked-text-default）' },
  'switch-unchecked-text-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关态文案色', usage: '关闭态文案颜色（$color-switch_unchecked-text-default）' },

  // —— loading spin ——
  'switch-bg-spin-off': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关态加载背景', usage: '已关闭加载态背景（$color-switch_spin_unchecked-bg-default）' },
  'switch-bg-spin-on': { value: 'var(--cd-color-success-hover)', category: 'color', label: '开态加载背景', usage: '已开启加载态背景（$color-switch_spin_checked-bg-default）' },
  'switch-spin-track': { value: 'var(--cd-color-fill-1)', category: 'color', label: '加载轨道色', usage: '加载 spinner 轨道颜色' },
  'switch-spin-indicator': { value: 'var(--cd-color-white)', category: 'color', label: '加载指示色', usage: '加载 spinner 指示颜色（$color-switch_loading_spin-default）' },
  'switch-spin-duration': { value: 'var(--cd-motion-duration-slow)', category: 'animation', label: '加载动画时长', usage: '加载 spinner 旋转时长' },

  // —— 聚焦轮廓（对齐 $color-switch_primary-outline-focus / $width-switch-outline） ——
  'switch-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '开关聚焦轮廓颜色' },
  'switch-outline-width': { value: '2px', category: 'width', label: '聚焦轮廓宽度', usage: '开关聚焦轮廓宽度（$width-switch-outline）' },

  // —— 动画（对齐 $motion-switch-transitionDuration=200ms） ——
  'switch-transition-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '开关过渡动画时长（Semi=200ms）' },
  'switch-transition-easing': { value: 'ease-in-out', category: 'animation', label: '过渡曲线', usage: '开关过渡曲线（对齐 Semi ease-in-out）' },
} satisfies TokenGroup;
