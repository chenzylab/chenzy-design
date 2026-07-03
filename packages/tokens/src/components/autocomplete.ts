/**
 * Component tokens for AutoComplete。
 * 遵循 dsm.spec「Token 精简原则」：只保留 AutoComplete.svelte 实际消费的 token。
 * AutoComplete 在触发器/输入框上复用 Input token、下拉外观复用 Select token，
 * 因此原「对齐 Semi autoComplete/variables.scss」的长名变量无人消费，已整段删除。
 * 以下别名把组件里散落的 alias 收敛到组件层，默认值 = 原直接引 alias，视觉不变。
 * 值为 var() 引用我们的 alias / global / input / select token，或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const autocompleteTokens = {
  // —— chenzy-design 组件实际消费的补充 token（AutoComplete.svelte 直接消费）——
  // 触发器/输入框外观复用 Input token，下拉外观复用 Select token。
  'autocomplete-font-size': { value: 'var(--cd-input-font-size)', category: 'font', label: '字号', usage: '自动完成文字字号（组件消费，复用 Input）' },
  'autocomplete-control-height-default': { value: 'var(--cd-height-input-default)', category: 'height', label: '触发器高度', usage: '自动完成触发器高度 - 默认（组件消费，复用 Input）' },
  'autocomplete-control-height-small': { value: 'var(--cd-height-input-small)', category: 'height', label: '触发器高度', usage: '自动完成触发器高度 - 小尺寸（组件消费，复用 Input）' },
  'autocomplete-control-height-large': { value: 'var(--cd-height-input-large)', category: 'height', label: '触发器高度', usage: '自动完成触发器高度 - 大尺寸（组件消费，复用 Input）' },
  'autocomplete-control-padding-x': { value: 'var(--cd-input-padding-x)', category: 'spacing', label: '触发器水平内边距', usage: '自动完成触发器水平内边距（组件消费，复用 Input）' },
  'autocomplete-control-bg': { value: 'var(--cd-input-color-bg)', category: 'color', label: '触发器背景色', usage: '自动完成触发器背景颜色（组件消费，复用 Input）' },
  'autocomplete-control-border': { value: 'var(--cd-input-border)', category: 'color', label: '触发器描边色', usage: '自动完成触发器描边颜色 - 默认（组件消费，复用 Input）' },
  'autocomplete-control-border-active': { value: 'var(--cd-input-border-active)', category: 'color', label: '触发器聚焦描边色', usage: '自动完成触发器描边颜色 - 聚焦（组件消费，复用 Input）' },
  'autocomplete-control-border-warning': { value: 'var(--cd-input-border-warning)', category: 'color', label: '触发器警告描边色', usage: '自动完成触发器描边颜色 - 警告（组件消费，复用 Input）' },
  'autocomplete-control-border-error': { value: 'var(--cd-input-border-error)', category: 'color', label: '触发器错误描边色', usage: '自动完成触发器描边颜色 - 错误（组件消费，复用 Input）' },
  'autocomplete-control-radius': { value: 'var(--cd-input-radius)', category: 'radius', label: '触发器圆角', usage: '自动完成触发器圆角（组件消费，复用 Input）' },
  'autocomplete-control-disabled-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用触发器背景色', usage: '自动完成触发器背景颜色 - 禁用（组件消费）' },
  'autocomplete-control-disabled-text': { value: 'var(--cd-color-text-3)', category: 'color', label: '禁用触发器文字色', usage: '自动完成触发器文字颜色 - 禁用（组件消费）' },
  'autocomplete-placeholder-text': { value: 'var(--cd-input-color-placeholder)', category: 'color', label: '占位文字色', usage: '自动完成占位文字颜色（组件消费，复用 Input）' },
  'autocomplete-affix-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀/内嵌标签文字色', usage: '自动完成 prefix/suffix/insetLabel 文字颜色（组件消费）' },
  'autocomplete-clear-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '清除按钮色', usage: '自动完成清除按钮颜色 - 默认（组件消费）' },
  'autocomplete-clear-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '清除按钮色', usage: '自动完成清除按钮颜色 - 悬停（组件消费）' },
  'autocomplete-dropdown-bg': { value: 'var(--cd-select-dropdown-bg)', category: 'color', label: '下拉背景色', usage: '自动完成下拉浮层背景颜色（组件消费，复用 Select）' },
  'autocomplete-dropdown-shadow': { value: 'var(--cd-select-dropdown-shadow)', category: 'other', label: '下拉阴影', usage: '自动完成下拉浮层阴影（组件消费，复用 Select）' },
  'autocomplete-dropdown-radius': { value: 'var(--cd-select-dropdown-radius)', category: 'radius', label: '下拉圆角', usage: '自动完成下拉浮层圆角（组件消费，复用 Select）' },
  'autocomplete-dropdown-z': { value: 'var(--cd-select-dropdown-z)', category: 'other', label: '下拉层级', usage: '自动完成下拉浮层 z-index（组件消费，复用 Select）' },
  'autocomplete-option-padding': { value: 'var(--cd-select-option-padding)', category: 'spacing', label: '选项内边距', usage: '自动完成下拉选项内边距（组件消费，复用 Select）' },
  'autocomplete-option-bg-hover': { value: 'var(--cd-select-option-bg-hover)', category: 'color', label: '选项背景色', usage: '自动完成下拉选项背景颜色 - 悬停（组件消费，复用 Select）' },
  'autocomplete-option-disabled-text': { value: 'var(--cd-color-text-3)', category: 'color', label: '禁用选项文字色', usage: '自动完成下拉禁用选项文字颜色（组件消费）' },
  'autocomplete-empty-text': { value: 'var(--cd-color-text-3)', category: 'color', label: '空态/加载文字色', usage: '自动完成空态与加载文字颜色（组件消费）' },
  'autocomplete-group-label-text': { value: 'var(--cd-color-text-3)', category: 'color', label: '分组标题文字色', usage: '自动完成分组标题文字颜色（组件消费）' },
  'autocomplete-spinner-track': { value: 'var(--cd-color-border)', category: 'color', label: 'spinner 轨道色', usage: '自动完成加载 spinner 轨道颜色（组件消费）' },
  'autocomplete-spinner-indicator': { value: 'var(--cd-color-primary)', category: 'color', label: 'spinner 指示色', usage: '自动完成加载 spinner 指示颜色（组件消费）' },
} satisfies TokenGroup;
