/**
 * Component tokens for AutoComplete。
 * 严格对齐 Semi semi-foundation/autoComplete/variables.scss：token 名与值逐条镜像
 * Semi 原始 `$...-autoComplete_...` 变量（下划线段转连字符、驼峰保留），去除「复用 Input/Select
 * 别名中间层」的自造转发 token。触发器/输入框结构复用本库 Input 组件（消费 Input 自身 token），
 * 故此处只声明 Semi autoComplete 原生存在的下拉/选项/加载相关 token，不再重复声明触发器外观。
 * 值引用本库 alias/global（--cd-color-* / --cd-spacing-* / --cd-width-* / --cd-font-weight-*）。
 */
import type { TokenGroup } from './token-def.js';

export const autocompleteTokens = {
  // —— 选项配色（Semi $color-autoComplete_option-*）——
  'autocomplete-option-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '自动完成菜单选项文本颜色（Semi $color-autoComplete_option_main-text）' },
  'autocomplete-option-bg-default': { value: 'transparent', category: 'color', label: '选项背景色-默认', usage: '自动完成菜单选项背景颜色 - 默认态（Semi $color-autoComplete_option-bg-default）' },
  'autocomplete-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选项背景色-悬停', usage: '自动完成菜单选项背景颜色 - 悬停/高亮态（Semi $color-autoComplete_option-bg-hover）' },
  'autocomplete-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项背景色-按下', usage: '自动完成菜单选项背景颜色 - 按下态（Semi $color-autoComplete_option-bg-active）' },
  'autocomplete-option-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用选项文字色', usage: '禁用自动完成菜单选项文字颜色（Semi $color-autoComplete_option_disabled-text）' },
  'autocomplete-option-keyword-text': { value: 'var(--cd-color-primary)', category: 'color', label: '关键词高亮色', usage: '自动完成菜单选项匹配搜索结果文本颜色（Semi $color-autoComplete_option_keyword-text）' },
  // 注：Semi variables.scss 另有 option-icon-default/active、option-tick-width/margin-right（仅作用于
  // 选中对勾 .semi-autocomplete-option-icon，而 autoComplete 恒传 showTick=false 从不渲染该 DOM）与
  // option-border-default（分组描边，autoComplete 无分组），本库 option 无对应结构，故不镜像这些死变量。

  // —— 选项尺寸/内边距（Semi $spacing-autoComplete_option-* / $radius-autoComplete_option）——
  'autocomplete-option-padding-left': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项左内边距', usage: '自动完成菜单项左侧内边距（Semi $spacing-autoComplete_option-paddingLeft）' },
  'autocomplete-option-padding-right': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项右内边距', usage: '自动完成菜单项右侧内边距（Semi $spacing-autoComplete_option-paddingRight）' },
  'autocomplete-option-padding-top': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项上内边距', usage: '自动完成菜单项顶部内边距（Semi $spacing-autoComplete_option-paddingTop）' },
  'autocomplete-option-padding-bottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项下内边距', usage: '自动完成菜单项底部内边距（Semi $spacing-autoComplete_option-paddingBottom）' },
  'autocomplete-option-first-margin-top': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '首项上外边距', usage: '自动完成第一个菜单项顶部外边距（Semi $spacing-autoComplete_option_first-marginTop）' },
  'autocomplete-option-last-margin-bottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '末项下外边距', usage: '自动完成最后一个菜单项底部外边距（Semi $spacing-autoComplete_option_last-marginBottom）' },
  'autocomplete-option-radius': { value: '0px', category: 'radius', label: '选项圆角', usage: '自动完成待选项圆角（Semi $radius-autoComplete_option）' },

  // —— 加载态（Semi $spacing-autoComplete_loading_wrapper-*）——
  'autocomplete-loading-wrapper-padding-top': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载区上内边距', usage: '加载搜索结果时的顶部内边距（Semi $spacing-autoComplete_loading_wrapper-paddingTop）' },
  'autocomplete-loading-wrapper-padding-bottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载区下内边距', usage: '加载搜索结果时的底部内边距（Semi $spacing-autoComplete_loading_wrapper-paddingBottom）' },

  // —— 字重（Semi $font-autoComplete_inset_label-fontWeight / $font-autoComplete_keyword-fontWeight）——
  'autocomplete-inset-label-font-weight': { value: '600', category: 'font', label: '内嵌标签字重', usage: '自动完成内嵌标签文本字重（Semi $font-autoComplete_inset_label-fontWeight）' },
  'autocomplete-keyword-font-weight': { value: '600', category: 'font', label: '关键词字重', usage: '自动完成搜索结果命中关键词文本字重（Semi $font-autoComplete_keyword-fontWeight）' },
} satisfies TokenGroup;
