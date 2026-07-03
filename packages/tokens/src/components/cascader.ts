/**
 * Component tokens for Cascader. 全量对齐 Semi Design（semi-foundation/cascader/variables.scss
 * 140 行，~112 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * Cascader 是「填充式触发器 + 多级菜单面板」的组合控件。variables 里「触发器（selection/
 * input/tag/状态色）」部分对齐 Semi，但 chenzy-design 触发器外观实际复用 Input/Select 填充式
 * token（对齐 TagInput/TreeSelect 复用 Input 的做法）、多选 tag 复用 TagInput；此文件建立 Semi
 * 全量 --cd-color-cascader-* / --cd-spacing-cascader-* 等菜单面板专属 token，并保留组件实际消费的
 * --cd-cascader-column-*（列宽 / 列分割线）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `$color-cascader_default-bg-default` → kebab `color-cascader-default-bg-default`。
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$height-control-*` → 我们 `var(--cd-control-height-*)`（scales.sizing 无 category 前缀）。
 * - Semi `$border-thickness-control-focus` → 我们 `var(--cd-border-thickness-control-focus)`。
 * - Semi `$spacing-none/-super-tight/-extra-tight/-tight/-base-tight` → 我们 `var(--cd-spacing-*)`。
 *   负值 `- $spacing-x` → `calc(-1 * var(--cd-spacing-x))`。
 * - Semi `$font-weight-regular/-bold` → 我们 `var(--cd-font-weight-regular/-bold)`；`$font-size-small`
 *   → `var(--cd-font-size-small)`；字面量（600 / 12px / 1px 等）保留。
 * - Semi `var(--semi-border-radius-small/medium)` → 我们 `var(--cd-border-radius-small/medium)`。
 * - Semi `$color-cascader-icon-default` 派生（`$color-cascader_option-icon-default: $color-cascader-icon-default`）
 *   翻成 var() 引用对应组件 token。usage 忠实照抄 Semi 中文注释（含原注释错别字）。
 */
import type { TokenGroup } from './token-def.js';

export const cascaderTokens = {
  // —— 菜单项 / 列分割线 ——
  'color-cascader-option-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '菜单项文字色', usage: '级联选择菜单项文字颜色' },
  'color-cascader-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 悬浮' },
  'color-cascader-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 按下' },

  // —— 前后缀文字 ——
  'color-cascader-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文字色', usage: '级联选择前后缀文字颜色' },

  // —— +n / 回填 / 占位 / 图标 颜色 ——
  'color-cascader-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 默认' },

  // —— prefix 文字 / 菜单项图标 ——
  'color-cascader-label-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 文字色', usage: '级联选择 prefix 文字颜色' },
  'color-cascader-option-icon-default': { value: 'var(--cd-color-cascader-icon-default)', category: 'color', label: '菜单项图标色', usage: '级联选择菜单项图标颜色' },

  // —— 禁用态 / 搜索 / 空态 / 输入框 / 高亮 ——
  'color-cascader-select-highlight': { value: 'var(--cd-color-primary)', category: 'color', label: '搜索高亮色', usage: '级联选择器搜索命中后文字高亮的颜色' },

  // —— font ——
  'font-cascader-label-fontweight': { value: '600', category: 'font', label: 'label 字重', usage: '级联选择 prefix 字重' },

  // —— chenzy-design Cascader 实际消费的补充 token（Semi 无独立变量；组件面板消费）——
  // 列宽 / 列分割线：Cascader.svelte 面板列 .cd-cascader__column / __flat / __search 直接消费。
  // 从 tree.ts 迁移至此（归属更正确），值对齐 Semi：$width-cascader_option（150px）/
  // $color-cascader_option_list-border-default（fill-0）。
  'cascader-column-width': { value: '150px', category: 'width', label: '列宽', usage: '级联选择各级菜单列宽（组件消费）' },
  'cascader-column-border': { value: 'var(--cd-color-fill-0)', category: 'color', label: '列分割线色', usage: '级联选择各级菜单分割线颜色（组件消费）' },
} satisfies TokenGroup;
