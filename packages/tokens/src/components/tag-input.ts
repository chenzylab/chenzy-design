/**
 * Component tokens for TagInput. 严格对齐 Semi Design
 * (semi-foundation/tagInput/variables.scss)，去中间层：token 名即组件消费的
 * `--cd-tag-input-*` CSS 变量名，值 var() 引用我们的 alias / global token 或字面量。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$height-control-*` → 我们 `var(--cd-control-height-*)`。
 * - Semi `$width-icon-medium` → 我们 `var(--cd-width-icon-medium)`。
 * - Semi `$border-thickness-control` / `-control-focus` → 我们 `var(--cd-border-thickness-control[-focus])`。
 * - Semi `$spacing-super-tight/-tight/-base-tight` → 我们 `var(--cd-spacing-super-tight/-tight/-base-tight)`。
 * - Semi `$font-weight-bold` → 我们 `var(--cd-font-weight-bold)`。
 * - Semi `var(--semi-border-radius-small)` → 我们 `var(--cd-border-radius-small)`。
 * - 废弃项（variables.scss 中注释掉的 deprecated）不纳入。
 *
 * 标签背景/文字色来自复用的 Tag 组件（color=white type=light），故本文件无自造的
 * tag 背景/删除/清除中间变量（对齐 Semi：TagInput 不重定义 Tag 视觉）。
 */
import type { TokenGroup } from './token-def.js';

export const tagInputTokens = {
  // —— icon / maxTagCount / prefix / suffix / handler 颜色 ——
  'tag-input-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '标签输入框图标颜色 - 默认' },
  'tag-input-maxtagcount-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '限制数量文字色', usage: '标签输入框限制标签展示数量文字颜色' },
  'tag-input-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '图标色', usage: '标签输入框图标颜色 - 悬浮' },
  'tag-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '标签输入框禁用文字颜色' },
  'tag-input-disabled-bg': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '标签输入框禁用背景色' },
  'tag-input-default-bg-focus': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 选中态' },

  // —— border ——
  'tag-input-border-default': { value: 'transparent', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 默认' },
  'tag-input-border-hover': { value: 'transparent', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 悬浮' },
  'tag-input-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 选中态' },
  'tag-input-prefix-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 色', usage: '标签输入框 prefix 颜色' },
  'tag-input-suffix-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'suffix 色', usage: '标签输入框 suffix 颜色' },

  // —— default 背景 ——
  'tag-input-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 默认' },
  'tag-input-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 悬浮' },

  // —— warning ——
  'tag-input-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 默认' },
  'tag-input-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 默认' },
  'tag-input-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 悬浮' },
  'tag-input-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 悬浮' },
  'tag-input-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 选中' },
  'tag-input-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 选中' },

  // —— danger ——
  'tag-input-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 默认' },
  'tag-input-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 默认' },
  'tag-input-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 悬浮' },
  'tag-input-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 悬浮' },
  'tag-input-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 选中' },
  'tag-input-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 选中' },
  'tag-input-sortable-item-over-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽指示线色', usage: '拖拽经过的元素前竖线背景色' },
  'tag-input-handler-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '拖拽手柄色', usage: '可拖拽的标签拖拽按钮颜色' },

  // —— spacing ——
  'tag-input-small-y': { value: '1px', category: 'spacing', label: '小尺寸标签上外边距', usage: '小尺寸标签输入框标签顶部外边距' },
  'tag-input-default-y': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '默认标签上外边距', usage: '默认尺寸标签输入框标签顶部外边距' },
  'tag-input-large-y': { value: '3px', category: 'spacing', label: '大尺寸标签上外边距', usage: '大尺寸标签输入框标签顶部外边距' },
  'tag-input-wrapper-n-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签容器水平内边距', usage: '标签输入框标签容器水平内边距' },
  'tag-input-drag-handler-marginright': { value: '4px', category: 'spacing', label: '拖拽手柄右外边距', usage: '拖拽 handler icon 的右外边距' },
  'tag-input-prefix-suffix-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'prefix/suffix 水平外边距', usage: '标签输入框 prefix/suffix 水平外边距' },

  // —— height ——
  'tag-input-height-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '大尺寸高度', usage: '大尺寸标签输入框高度' },
  'tag-input-height-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '默认尺寸高度', usage: '默认尺寸标签输入框高度' },
  'tag-input-height-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '小尺寸高度', usage: '小尺寸标签输入框高度' },
  'tag-input-input-small': { value: '20px', category: 'height', label: '小尺寸输入框高度', usage: '小尺寸标签输入框 Input 框高度' },
  'tag-input-input-default': { value: '24px', category: 'height', label: '默认尺寸输入框高度', usage: '默认尺寸标签输入框 Input 框高度' },
  'tag-input-input-large': { value: '24px', category: 'height', label: '大尺寸输入框高度', usage: '大尺寸标签输入框 Input 框高度' },

  // —— width ——
  'tag-input-clear-medium': { value: 'calc(var(--cd-width-icon-medium) * 2)', category: 'width', label: '清空按钮宽度', usage: '标签输入框清空按钮宽度' },
  'tag-input-border-width-default': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '描边宽度', usage: '标签输入框描边宽度 - 默认' },
  'tag-input-border-width-focus': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '描边宽度', usage: '标签输入框描边宽度 - 选中态' },
  'tag-input-sortable-item-over': { value: '2px', category: 'width', label: '拖拽指示线宽度', usage: '拖拽经过的元素前竖线宽度' },

  // —— radius ——
  'tag-input-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角', usage: '标签输入框圆角' },

  // —— font ——
  'tag-input-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'prefix/suffix 字重', usage: '标签输入框 prefix/suffix 文字字重' },
} satisfies TokenGroup;
