/**
 * Component tokens for InputNumber. 严格对齐 Semi Design
 * （semi-foundation/inputNumber/variables.scss，22 变量，名值逐条对应）。
 * 组件直接消费这些 Semi 对齐名，不再有自造短名中间层（已删）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + global/scales.ts + alias/index.ts）：
 * - Semi `$color-inputNumber_button-*` → kebab `color-input-number-button-*`。
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$height-control-*` → 我们 `var(--cd-control-height-*)`。
 * - Semi `$height-inputNumber_button_inner_*: $height-control-* - 2px`
 *   → `calc(var(--cd-control-height-*) - 2px)`。
 * - Semi `$spacing-tight` / `$spacing-extra-tight` → 我们同名 `var(--cd-spacing-*)`；
 *   `-$spacing-extra-tight`（负值）→ `calc(-1 * var(--cd-spacing-extra-tight))`。
 * - Semi `var(--semi-border-radius-small)` → 我们 `var(--cd-border-radius-small)`。
 * - 字面量（14px / 1px / 4px）保留。
 */
import type { TokenGroup } from './token-def.js';

export const inputNumberTokens = {
  // —— height：步进器展开 / 隐藏步进器（内部）——
  'height-input-number-button-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '数字输入框高度', usage: '数字输入框高度 - 默认' },
  'height-input-number-button-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '数字输入框高度', usage: '数字输入框高度 - 大' },
  'height-input-number-button-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '数字输入框高度', usage: '数字输入框高度 - 小' },
  'height-input-number-button-inner-default': { value: 'calc(var(--cd-control-height-default) - 2px)', category: 'height', label: '隐藏步进器高度', usage: '隐藏步进器的数字输入框高度 - 默认' },
  'height-input-number-button-inner-large': { value: 'calc(var(--cd-control-height-large) - 2px)', category: 'height', label: '隐藏步进器高度', usage: '隐藏步进器的数字输入框高度 - 大' },
  'height-input-number-button-inner-small': { value: 'calc(var(--cd-control-height-small) - 2px)', category: 'height', label: '隐藏步进器高度', usage: '隐藏步进器的数字输入框高度 - 小' },

  // —— width ——
  'width-input-number-button': { value: '14px', category: 'width', label: '步进器按钮宽度', usage: '步进器按钮宽度' },
  'width-input-number-button-border': { value: '1px', category: 'width', label: '步进器按钮描边宽度', usage: '步进器按钮描边宽度' },

  // —— radius ——
  'radius-input-number': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '步进器按钮圆角', usage: '步进器按钮圆角 - 外部' },
  'radius-input-number-inner': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '步进器按钮圆角', usage: '步进器按钮圆角 - 内部' },

  // —— color：按钮图标 / 背景 / 描边 ——
  'color-input-number-button-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '步进器图标色', usage: '步进器按钮图标颜色' },
  'color-input-number-button-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '步进器图标色', usage: '步进器按钮图标颜色 - 禁用' },
  'color-input-number-button-bg-default': { value: 'var(--cd-color-bg-2)', category: 'color', label: '步进器背景色', usage: '步进器按钮背景颜色' },
  'color-input-number-button-bg-disabled': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '步进器背景色', usage: '步进器按钮背景颜色 - 禁用' },
  'color-input-number-button-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '步进器背景色', usage: '步进器按钮图标颜色 - 悬浮' },
  'color-input-number-button-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '步进器背景色', usage: '步进器按钮图标颜色 - 按下' },
  'color-input-number-button-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '步进器描边色', usage: '步进器按钮描边颜色' },
  'color-input-number-button-border-hover': { value: 'var(--cd-color-fill-2)', category: 'color', label: '步进器描边色', usage: '步进器按钮描边颜色 - 悬浮' },

  // —— spacing ——
  'spacing-input-number-button-marginleft': { value: '4px', category: 'spacing', label: '步进器左外边距', usage: '步进器按钮左侧外边距' },
  'spacing-input-number-button-inner-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '隐藏步进器左外边距', usage: '隐藏步进器按钮左侧外边距' },
  'spacing-input-number-clearbtn-suffix-marginleft': { value: 'calc(-1 * var(--cd-spacing-extra-tight))', category: 'spacing', label: '清空按钮左外边距', usage: '清空按钮左侧外边距' },
} satisfies TokenGroup;
