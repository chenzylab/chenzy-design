/**
 * Component tokens for Radio. 严格对齐 Semi Design（semi-foundation/radio/variables.scss）。
 * 按 DSM「Token 精简 + 去中间层」：直接消费对齐 Semi 的语义 token（Radio.svelte 内 var() 直引），
 * 不再自造 `radio-*` 转发中间层（Space/Toast 同款结论）。已删组件不消费的 Semi 状态态变量，
 * 以及本库曾自造的超集能力 token（size 三档圆圈 / status warning|error，Semi 完全无）。
 * 带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量 / calc()。
 *
 * Semi 映射规则：
 *   $color-radio_xxx → color-radio-xxx；var(--semi-color-*) → var(--cd-color-*)。
 *   $width-icon-medium → var(--cd-width-icon-medium)；$spacing-* → var(--cd-spacing-*)。
 *   var(--semi-border-radius-*) → var(--cd-border-radius-*)；$font-size-* → var(--cd-font-size-*)。
 */
import type { TokenGroup } from './token-def.js';

export const radioTokens = {
  // —— 基础单选圆圈（default / hover / disabled） ——
  'color-radio-default-border-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 默认态' },
  'color-radio-default-bg-default': { value: 'transparent', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 默认态' },
  'color-radio-default-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 悬浮态' },
  'color-radio-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 悬浮态' },

  'color-radio-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '选项文本颜色' },
  'color-radio-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助文本色', usage: '辅助文本颜色' },

  // —— 选中态（primary） ——
  'color-radio-primary-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 默认态' },
  'color-radio-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 默认态' },
  'color-radio-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中悬浮背景色', usage: '选中状态单选圆圈背景颜色 - 悬浮态' },
  'color-radio-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中按下背景色', usage: '选中状态单选圆圈背景颜色 - 按下态' },
  'color-radio-primary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '中心圆点色', usage: '选中状态单选圆圈中心圆点颜色' },

  // —— 禁用态（对齐 Semi 精确禁用色，替代 opacity 近似） ——
  'color-radio-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '禁用态选项文本颜色' },
  'color-radio-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用圆圈背景色', usage: '未选中圆圈禁用态背景颜色' },
  'color-radio-default-border-disabled': { value: 'var(--cd-color-border)', category: 'color', label: '禁用圆圈描边色', usage: '未选中圆圈禁用态描边颜色' },
  'color-radio-checked-bg-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用背景色', usage: '选中圆圈禁用态背景颜色' },
  'color-radio-checked-border-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用描边色', usage: '选中圆圈禁用态描边颜色' },

  // —— buttonRadio（按钮样式单选） ——
  'color-radio-buttonradio-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '按钮文本色', usage: '按钮样式单选文本颜色' },
  'color-radio-buttonradio-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮背景色', usage: '按钮样式单选背景颜色' },

  // —— cardRadioGroup（卡片样式单选） ——
  'color-radio-cardradiogroup-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中描边色', usage: '卡片样式单选选中态描边颜色' },

  // —— 圆角 ——
  'radius-radio-cardradiogroup': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '卡片圆角', usage: '卡片式单选圆角大小' },
  'radius-radio-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮式单选圆角大小' },

  // —— 间距（addon / content / group） ——
  'spacing-radio-addon-buttonradio-middle-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中按钮水平内距', usage: '中尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-content-rowgap': { value: '4px', category: 'spacing', label: '内容行间距', usage: '内容行间距' },
  'spacing-radio-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '组右外边距', usage: '水平单选框组右侧外边距' },
  'spacing-radio-cardradiogroup-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组水平内距', usage: '卡片式单选组水平内边距' },
  'spacing-radio-cardradiogroup-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片组垂直内距', usage: '卡片式单选组垂直内边距' },

  // —— 圆圈尺寸（对齐 Semi $width-radio_inner: $width-icon-medium，单档 16px；无 small/large 超集） ——
  'radio-size-default': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '圆圈边长', usage: '单选圆圈边长（对齐 Semi $width-radio_inner）' },
  // —— 文字与圆圈间距 ——
  'radio-label-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文字与圆圈间距', usage: '文字与单选圆圈间距' },
  // —— button 型分段按钮高度（buttonSize 三档；映射控件高度基元） ——
  'radio-button-height': { value: 'var(--cd-control-height-default, 32px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - middle 默认' },
  'radio-button-height-small': { value: 'var(--cd-control-height-small, 24px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - small' },
  'radio-button-height-large': { value: 'var(--cd-control-height-large, 40px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - large' },
} satisfies TokenGroup;
