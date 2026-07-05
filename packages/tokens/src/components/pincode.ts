/**
 * Component tokens for PinCode（分格验证码 / OTP）。
 * PinCode 单格复用 Input 的填充式外观（边框 / 背景 / 聚焦 / 校验态由 --cd-color-input-*
 * 直接承担，见 PinCode.svelte），本文件仅补分组布局与单格尺寸相关 token。
 * 单格取正方形，宽度派生自对应尺寸的 Input 容器高度（--cd-height-input-wrapper-*）。
 * 见 specs/components/input/PinCode.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const pinCodeTokens = {
  // —— 布局 ——
  'pincode-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '格间距', usage: '相邻单格之间的间距' },

  // —— 单格尺寸（正方形，派生自 Input 容器高度）——
  'pincode-cell-width-small': { value: 'var(--cd-height-input-wrapper-small)', category: 'width', label: '小尺寸单格宽', usage: 'small 单格宽度（派生自 Input small 高度，正方形）' },
  'pincode-cell-width-default': { value: 'var(--cd-height-input-wrapper-default)', category: 'width', label: '单格宽', usage: 'default 单格宽度（派生自 Input default 高度，正方形）' },
  'pincode-cell-width-large': { value: 'var(--cd-height-input-wrapper-large)', category: 'width', label: '大尺寸单格宽', usage: 'large 单格宽度（派生自 Input large 高度，正方形）' },

  // —— 单格文字 ——
  'pincode-cell-font-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '单格字号', usage: '单格字符字号（略大于正文，居中显示单字符）' },
  'pincode-cell-text-align': { value: 'center', category: 'other', label: '单格文字对齐', usage: '单格字符水平对齐' },
} satisfies TokenGroup;
