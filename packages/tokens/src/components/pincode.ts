/**
 * Component tokens for PinCode（分格验证码 / OTP）。
 * PinCode 单格复用 Input 的填充式外观（边框 / 背景 / 聚焦 / 校验态由 --cd-color-input-*
 * 直接承担，见 PinCode.svelte），本文件仅补分组布局与单格尺寸相关 token。
 *
 * 值严格对齐 Semi `semi-foundation/pinCode/variables.scss`（逐档常量，非派生）：
 *  - 格间距 marginRight：small/default/large = 6/8/12px
 *    → default 8px = var(--cd-spacing-tight)、large 12px = var(--cd-spacing-base-tight)；
 *      small 6px 是 Semi 组件级常量，无对应全局别名，取字面量。
 *  - 单格宽 width：small/default/large = 24/32/42px
 *    → small 24px = var(--cd-control-height-small)、default 32px = var(--cd-control-height-default)；
 *      large 42px ≠ control-height-large(40px)，Semi 单格宽是独立常量，取字面量对齐。
 * 单格高度仍复用 Input 容器高度（--cd-height-input-wrapper-* = 24/32/40px），与 Semi
 * 单格「宽独立、高继承 Input」一致（故 large 为 42×40 非正方形，对齐 Semi）。
 * 见 specs/components/input/PinCode.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const pinCodeTokens = {
  // —— 格间距（逐档对齐 Semi $spacing-pinCode_*-marginRight = 6/8/12px）——
  'pincode-gap-small': { value: '6px', category: 'spacing', label: '小尺寸格间距', usage: 'small 相邻单格间距（对齐 Semi 6px，无全局别名取字面量）' },
  'pincode-gap-default': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '格间距', usage: 'default 相邻单格间距（对齐 Semi 8px = $spacing-tight）' },
  'pincode-gap-large': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '大尺寸格间距', usage: 'large 相邻单格间距（对齐 Semi 12px = $spacing-base-tight）' },

  // —— 单格宽度（逐档对齐 Semi $width-pinCode_input_* = 24/32/42px）——
  'pincode-cell-width-small': { value: 'var(--cd-control-height-small)', category: 'width', label: '小尺寸单格宽', usage: 'small 单格宽度（对齐 Semi 24px = $height-control-small）' },
  'pincode-cell-width-default': { value: 'var(--cd-control-height-default)', category: 'width', label: '单格宽', usage: 'default 单格宽度（对齐 Semi 32px = $height-control-default）' },
  'pincode-cell-width-large': { value: '42px', category: 'width', label: '大尺寸单格宽', usage: 'large 单格宽度（对齐 Semi 42px，Semi 独立常量≠control-height 40px，取字面量）' },

  // —— 单格文字 ——
  'pincode-cell-font-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '单格字号', usage: '单格字符字号（略大于正文，居中显示单字符）' },
  'pincode-cell-text-align': { value: 'center', category: 'other', label: '单格文字对齐', usage: '单格字符水平对齐' },
} satisfies TokenGroup;
