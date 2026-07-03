/**
 * Component tokens for Button. 全量对齐 Semi Design（semi-foundation/button/variables.scss
 * + animation.scss 的 2 个真实值 token），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const buttonTokens = {
  // —— primary ——
  'color-button-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色' },
  'color-button-primary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - solid 模式' },
  'color-button-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 悬浮' },
  'color-button-primary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 悬浮' },
  'color-button-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 按下' },
  'color-button-primary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 按下' },
  'color-button-primary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '主要按钮边框色', usage: '主要按钮边框颜色 - 边框模式' },
  'color-button-primary-borderless-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— secondary ——
  'color-button-secondary-bg-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色' },
  'color-button-secondary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - solid 模式' },
  'color-button-secondary-bg-hover': { value: 'var(--cd-color-secondary-hover)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 悬浮' },
  'color-button-secondary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 悬浮' },
  'color-button-secondary-bg-active': { value: 'var(--cd-color-secondary-active)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 按下' },
  'color-button-secondary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 按下' },
  'color-button-secondary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '次要按钮边框色', usage: '次要按钮边框颜色 - 边框模式' },
  'color-button-secondary-borderless-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— danger ——
  'color-button-danger-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色' },
  'color-button-danger-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - solid 模式' },
  'color-button-danger-bg-hover': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 悬浮' },
  'color-button-danger-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 悬浮' },
  'color-button-danger-bg-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 按下' },
  'color-button-danger-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 按下' },
  'color-button-danger-outline-border-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮边框色', usage: '危险按钮边框颜色 - 边框模式' },
  'color-button-danger-borderless-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— warning ——
  'color-button-warning-bg-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色' },
  'color-button-warning-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - solid 模式' },
  'color-button-warning-bg-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 悬浮' },
  'color-button-warning-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 悬浮' },
  'color-button-warning-bg-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 按下' },
  'color-button-warning-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 按下' },
  'color-button-warning-outline-border-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮边框色', usage: '警告按钮边框颜色 - 边框模式' },
  'color-button-warning-borderless-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— tertiary ——
  'color-button-tertiary-bg-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色' },
  'color-button-tertiary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - solid 模式' },
  'color-button-tertiary-bg-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 悬浮' },
  'color-button-tertiary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 悬浮' },
  'color-button-tertiary-bg-active': { value: 'var(--cd-color-tertiary-active)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 按下' },
  'color-button-tertiary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 按下' },
  'color-button-tertiary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '第三按钮边框色', usage: '第三按钮边框颜色 - 边框模式' },
  'color-button-tertiary-solid-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— disabled ——

  // —— light ——
  'color-button-light-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色' },
  'color-button-light-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 悬浮' },
  'color-button-light-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 按下' },
  'color-button-light-border-default': { value: 'transparent', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色' },
  'color-button-light-border-hover': { value: 'var(--cd-color-button-light-border-default)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 悬浮' },
  'color-button-light-border-active': { value: 'var(--cd-color-button-light-border-hover)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 按下' },
  'width-button-light-border': { value: '0', category: 'width', label: '浅色按钮描边宽度', usage: '浅色按钮描边宽度' },

  // —— borderless ——
  'color-button-borderless-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '无背景按钮背景色', usage: '无背景按钮背景颜色 - 悬浮' },
  'color-button-borderless-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '无背景按钮背景色', usage: '无背景按钮背景颜色 - 按下' },
  'color-button-borderless-border-default': { value: 'transparent', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色' },
  'color-button-borderless-border-hover': { value: 'var(--cd-color-button-borderless-border-default)', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色 - 悬浮' },
  'color-button-borderless-border-active': { value: 'var(--cd-color-button-borderless-border-hover)', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色 - 按下' },
  'width-button-borderless-border': { value: '0', category: 'width', label: '无背景按钮描边宽度', usage: '无背景按钮描边宽度' },

  // —— outline ——
  'width-button-outline-border': { value: '1px', category: 'width', label: '边框模式边框宽度', usage: '边框模式按钮边框宽度' },
  'color-button-outline-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '边框模式背景色', usage: '边框模式按钮背景颜色 - 悬浮' },
  'color-button-outline-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '边框模式背景色', usage: '边框模式按钮背景颜色 - 按下' },

  // —— buttongroup ——

  // —— padding ——
  'spacing-button-default-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 默认' },
  'spacing-button-large-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 大尺寸' },
  'spacing-button-small-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 小尺寸' },

  // —— margin ——

  // —— font ——
  'font-button-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮文字字重', usage: '按钮文字字重 - 默认' },
  'font-button-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮文字字号', usage: '按钮文字字号- 默认' },

  // —— height ——
  'height-button-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '按钮高度', usage: '按钮高度 - 大尺寸' },
  'height-button-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '按钮高度', usage: '按钮高度 - 小尺寸' },
  'height-button-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮高度 - 默认' },

  // —— radius ——
  'width-button-border': { value: 'var(--cd-border-thickness)', category: 'width', label: '按钮描边宽度', usage: '按钮描边宽度' },
  'radius-button': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮圆角大小' },

  // —— splitButtonGroup ——

  // —— animation：背景色过渡（7 类型 × duration/function/delay，对齐 Semi animation.scss）——
  // 默认无动画（duration/delay=0ms），主题或 DSM 可按类型单独开启过渡。
  'transition-duration-button-primary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '主要按钮背景过渡时长', usage: '主要按钮-背景色-动画持续时间' },
  'transition-function-button-primary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '主要按钮背景过渡曲线', usage: '主要按钮-背景色-过渡曲线' },
  'transition-delay-button-primary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '主要按钮背景过渡延迟', usage: '主要按钮-背景色-延迟时间' },
  'transition-duration-button-secondary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '次要按钮背景过渡时长', usage: '次要按钮-背景色-动画持续时间' },
  'transition-function-button-secondary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '次要按钮背景过渡曲线', usage: '次要按钮-背景色-过渡曲线' },
  'transition-delay-button-secondary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '次要按钮背景过渡延迟', usage: '次要按钮-背景色-延迟时间' },
  'transition-duration-button-tertiary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '三级按钮背景过渡时长', usage: '三级按钮-背景色-动画持续时间' },
  'transition-function-button-tertiary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '三级按钮背景过渡曲线', usage: '三级按钮-背景色-过渡曲线' },
  'transition-delay-button-tertiary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '三级按钮背景过渡延迟', usage: '三级按钮-背景色-延迟时间' },
  'transition-duration-button-light-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '浅色按钮背景过渡时长', usage: '浅色按钮-背景色-动画持续时间' },
  'transition-function-button-light-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '浅色按钮背景过渡曲线', usage: '浅色按钮-背景色-过渡曲线' },
  'transition-delay-button-light-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '浅色按钮背景过渡延迟', usage: '浅色按钮-背景色-延迟时间' },
  'transition-duration-button-warning-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '警告按钮背景过渡时长', usage: '警告按钮-背景色-动画持续时间' },
  'transition-function-button-warning-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '警告按钮背景过渡曲线', usage: '警告按钮-背景色-过渡曲线' },
  'transition-delay-button-warning-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '警告按钮背景过渡延迟', usage: '警告按钮-背景色-延迟时间' },
  'transition-duration-button-danger-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '危险按钮背景过渡时长', usage: '危险按钮-背景色-动画持续时间' },
  'transition-function-button-danger-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '危险按钮背景过渡曲线', usage: '危险按钮-背景色-过渡曲线' },
  'transition-delay-button-danger-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '危险按钮背景过渡延迟', usage: '危险按钮-背景色-延迟时间' },
  'transition-duration-button-borderless-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '无边框按钮背景过渡时长', usage: '无边框按钮-背景色-动画持续时间' },
  'transition-function-button-borderless-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '无边框按钮背景过渡曲线', usage: '无边框按钮-背景色-过渡曲线' },
  'transition-delay-button-borderless-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '无边框按钮背景过渡延迟', usage: '无边框按钮-背景色-延迟时间' },

  // —— animation：边框过渡（6 类型 × duration/function/delay）——
  'transition-duration-button-primary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '主要按钮边框过渡时长', usage: '主要按钮-边框-动画持续时间' },
  'transition-function-button-primary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '主要按钮边框过渡曲线', usage: '主要按钮-边框-过渡曲线' },
  'transition-delay-button-primary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '主要按钮边框过渡延迟', usage: '主要按钮-边框-延迟时间' },
  'transition-duration-button-secondary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '次要按钮边框过渡时长', usage: '次要按钮-边框-动画持续时间' },
  'transition-function-button-secondary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '次要按钮边框过渡曲线', usage: '次要按钮-边框-过渡曲线' },
  'transition-delay-button-secondary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '次要按钮边框过渡延迟', usage: '次要按钮-边框-延迟时间' },
  'transition-duration-button-tertiary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '三级按钮边框过渡时长', usage: '三级按钮-边框-动画持续时间' },
  'transition-function-button-tertiary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '三级按钮边框过渡曲线', usage: '三级按钮-边框-过渡曲线' },
  'transition-delay-button-tertiary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '三级按钮边框过渡延迟', usage: '三级按钮-边框-延迟时间' },
  'transition-duration-button-light-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '浅色按钮边框过渡时长', usage: '浅色按钮-边框-动画持续时间' },
  'transition-function-button-light-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '浅色按钮边框过渡曲线', usage: '浅色按钮-边框-过渡曲线' },
  'transition-delay-button-light-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '浅色按钮边框过渡延迟', usage: '浅色按钮-边框-延迟时间' },
  'transition-duration-button-warning-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '警告按钮边框过渡时长', usage: '警告按钮-边框-动画持续时间' },
  'transition-function-button-warning-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '警告按钮边框过渡曲线', usage: '警告按钮-边框-过渡曲线' },
  'transition-delay-button-warning-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '警告按钮边框过渡延迟', usage: '警告按钮-边框-延迟时间' },
  'transition-duration-button-danger-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '危险按钮边框过渡时长', usage: '危险按钮-边框-动画持续时间' },
  'transition-function-button-danger-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '危险按钮边框过渡曲线', usage: '危险按钮-边框-过渡曲线' },
  'transition-delay-button-danger-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '危险按钮边框过渡延迟', usage: '危险按钮-边框-延迟时间' },

  // —— other：按压放大（7 类型，对齐 Semi transform token；归 other tab 对齐 Semi）——
  'transform-scale-button-primary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '主要按钮放大', usage: '主要按钮-放大' },
  'transform-scale-button-secondary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '次要按钮放大', usage: '次要按钮-放大' },
  'transform-scale-button-tertiary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '三级按钮放大', usage: '三级按钮-放大' },
  'transform-scale-button-light': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '浅色按钮放大', usage: '浅色按钮-放大' },
  'transform-scale-button-warning': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '警告按钮放大', usage: '警告按钮-放大' },
  'transform-scale-button-danger': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '危险按钮放大', usage: '危险按钮-放大' },
  'transform-scale-button-borderless': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '无边框按钮放大', usage: '无边框按钮-放大' },

  // —— animation：图标旋转 ——

  // —— chenzy-design 组件实际消费的补充 token（Semi 无）——
  'button-height-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮高度 - 默认（组件消费）' },
  'button-height-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '按钮高度', usage: '按钮高度 - 小尺寸（组件消费）' },
  'button-height-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '按钮高度', usage: '按钮高度 - 大尺寸（组件消费）' },
  'button-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮水平内边距', usage: '按钮水平内边距 - 默认/小尺寸（组件消费）' },
  'button-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮圆角（组件消费）' },
  'button-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮字号', usage: '按钮文字字号（组件消费）' },
  'button-group-divider': { value: 'var(--cd-color-border)', category: 'color', label: '按钮组分隔线色', usage: '按钮组分隔线颜色（组件消费）' },
  'button-colorful-from': { value: '#4d6bff', category: 'color', label: 'Colorful 渐变起始色', usage: 'colorful（AI 多彩）蓝→紫渐变起始色', editable: true },
  'button-colorful-via': { value: '#7b5cff', category: 'color', label: 'Colorful 渐变中间色', usage: 'colorful（AI 多彩）蓝→紫渐变中间色', editable: true },
  'button-colorful-to': { value: '#a64dff', category: 'color', label: 'Colorful 渐变结束色', usage: 'colorful（AI 多彩）蓝→紫渐变结束色', editable: true },
} satisfies TokenGroup;
