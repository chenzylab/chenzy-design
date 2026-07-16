/**
 * Component tokens for TreeSelect. 全量对齐 Semi Design（semi-foundation/treeSelect/variables.scss
 * 94 行），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * TreeSelect 是 Tree + Select 的组合控件。variables 里「选择框（selection/input/tag）」部分为
 * treeSelect 专属，在此建 --cd-tree-select-* token；下拉里的「树节点」样式复用 Tree，故组件
 * 消费时保留复用 --cd-tree-*（不重复造），容器填充式外观复用 --cd-select-*（对齐 TagInput 复用 Input 的做法）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$height-control-*` → 我们 `var(--cd-control-height-*)`（scales.sizing 无 category 前缀）。
 * - Semi `$border-thickness-control-focus` → 我们 `var(--cd-border-thickness-control-focus)`。
 * - Semi `$spacing-extra-tight/-super-tight/-tight/-base-tight` → 我们 `var(--cd-spacing-*)`。
 * - Semi `$font-weight-regular/-bold` → 我们 `var(--cd-font-weight-regular/-bold)`。
 * - Semi `var(--semi-border-radius-small)` → 我们 `var(--cd-border-radius-small)`。
 * - `$color-treeSelect_*-icon-hover/active: --semi-color-primary-*` → 我们 `var(--cd-color-primary-*)`。
 */
import type { TokenGroup } from './token-def.js';

export const treeSelectTokens = {
  // —— default 选择框描边 / 回填文本 / 图标 ——
  'color-tree-select-default-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '树选择器选择框图标颜色 - 默认' },
  'color-tree-select-default-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '清空按钮色', usage: '树选择器选择框清空按钮颜色 - 悬停' },

  // —— 搜索框 / 禁用 / 占位 ——
  'color-tree-select-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用树选择器选择框背景颜色' },
  'color-tree-select-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '禁用树选择器选择框文本颜色' },
  'color-tree-select-input-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文本色', usage: '树选择器选择框占位文本颜色' },

  // —— insetLabel 内嵌标签（触发器值前的内嵌标签文本）——
  'color-tree-select-label': { value: 'var(--cd-color-text-2)', category: 'color', label: '内嵌标签文本色', usage: '树选择器触发器内嵌标签（insetLabel）文本颜色' },
  'font-tree-select-label': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '内嵌标签字重', usage: '树选择器触发器内嵌标签（insetLabel）文本字重' },

  // —— warning 校验态（same as Input，对齐 Semi variables.scss:22-33）——
  'color-tree-select-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 默认' },
  'color-tree-select-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 默认' },
  'color-tree-select-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 悬浮' },
  'color-tree-select-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 悬浮' },
  'color-tree-select-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 选中' },
  'color-tree-select-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 选中' },
  'color-tree-select-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 激活' },
  'color-tree-select-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 激活' },

  // —— error/danger 校验态（same as Input，对齐 Semi variables.scss:36-46）——
  'color-tree-select-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 默认' },
  'color-tree-select-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 默认' },
  'color-tree-select-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 悬浮' },
  'color-tree-select-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 悬浮' },
  'color-tree-select-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 选中' },
  'color-tree-select-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 选中' },
  'color-tree-select-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 激活' },
  'color-tree-select-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 激活' },
} satisfies TokenGroup;
