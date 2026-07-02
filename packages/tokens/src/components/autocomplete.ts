/**
 * Component tokens for AutoComplete. 全量对齐 Semi Design
 * （semi-foundation/autoComplete/variables.scss，去重后 25 个唯一变量）,
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * AutoComplete 在 Semi 里大量复用 Select/Input 的样式；此处仅收敛 autoComplete/variables.scss
 * 声明的专属变量，其余触发器/下拉外观仍走 select/input 组件 token（见组件消费段）。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design 组件实际消费的补充 token（勿删）。
 */
import type { TokenGroup } from './token-def.js';

export const autocompleteTokens = {
  // —— Spacing · loading ——
  'spacing-autocomplete-loading-wrapper-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载上内边距', usage: '加载搜索结果时的顶部内边距' },
  'spacing-autocomplete-loading-wrapper-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载下内边距', usage: '加载搜索结果时的底部内边距' },

  // —— Color · 选项 ——
  'color-autocomplete-option-keyword-text': { value: 'var(--cd-color-primary)', category: 'color', label: '匹配文本色', usage: '自动完成菜单选项匹配搜索结果文本颜色' },
  'color-autocomplete-option-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '自动完成菜单选项文本颜色' },
  'color-autocomplete-option-bg-default': { value: 'transparent', category: 'color', label: '选项背景色', usage: '自动完成菜单选项背景颜色 - 默认态' },
  'color-autocomplete-option-icon-default': { value: 'transparent', category: 'color', label: '选项图标色', usage: '自动完成菜单选项图标颜色 - 默认态' },
  'color-autocomplete-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选项背景色', usage: '自动完成菜单选项背景颜色 - 悬停态' },
  'color-autocomplete-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项背景色', usage: '自动完成菜单选项背景颜色 - 按下态' },
  'color-autocomplete-option-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用选项文字色', usage: '禁用自动完成菜单选项文字颜色' },
  'color-autocomplete-option-disabled-bg': { value: 'transparent', category: 'color', label: '禁用选项背景色', usage: '禁用自动完成菜单选项背景颜色' },
  'color-autocomplete-option-icon-active': { value: 'var(--cd-color-text-2)', category: 'color', label: '选项图标色', usage: '禁用自动完成菜单选项图标颜色 - 选中态' },
  'color-autocomplete-option-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分组分割线色', usage: '分组自动完成菜单项描边颜色' },

  // —— Width / Radius · 选项 ——
  'width-autocomplete-option-tick': { value: 'var(--cd-width-icon-small)', category: 'width', label: '对勾图标大小', usage: '自动完成菜单项选中对勾图标大小' },
  'radius-autocomplete-option': { value: '0px', category: 'radius', label: '待选项圆角', usage: '自动完成待选项圆角' },

  // —— Spacing · 选项 / 对勾 ——
  'spacing-autocomplete-option-tick-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '对勾右外边距', usage: '自动完成菜单选中对勾右侧外边距' },
  'spacing-autocomplete-option-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项左内边距', usage: '自动完成菜单项左侧内边距' },
  'spacing-autocomplete-option-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项右内边距', usage: '自动完成菜单项右侧内边距' },
  'spacing-autocomplete-option-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项上内边距', usage: '自动完成菜单项顶部内边距' },
  'spacing-autocomplete-option-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项下内边距', usage: '自动完成菜单项底部内边距' },
  'spacing-autocomplete-option-first-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '首项上外边距', usage: '自动完成第一个菜单项顶部外边距' },
  'spacing-autocomplete-option-last-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '末项下外边距', usage: '自动完成最后一个菜单项底部外边距' },

  // —— Spacing · 内容区 ——
  'spacing-autocomplete-option-list-paddingtop': { value: '0px', category: 'spacing', label: '内容区上内边距', usage: '自动完成内容区顶部内边距' },
  'spacing-autocomplete-option-list-paddingright': { value: '0px', category: 'spacing', label: '内容区右内边距', usage: '自动完成内容区右侧内边距' },
  'spacing-autocomplete-option-list-paddingbottom': { value: '0px', category: 'spacing', label: '内容区下内边距', usage: '自动完成内容区底部内边距' },
  'spacing-autocomplete-option-list-paddingleft': { value: '0px', category: 'spacing', label: '内容区左内边距', usage: '自动完成内容区左侧内边距' },

  // —— Font ——
  'font-autocomplete-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '文本字重', usage: '自动完成文本字重' },
  'font-autocomplete-inset-label-fontweight': { value: '600', category: 'font', label: '内嵌标签字重', usage: '自动完成内嵌标签文本字重' },
  'font-autocomplete-keyword-fontweight': { value: '600', category: 'font', label: '匹配文本字重', usage: '自动完成搜索结果命中关键词文本字重' },

  // —— chenzy-design 组件实际消费的补充 token（Semi 无；勿删）——
  // AutoComplete.svelte 直接消费。触发器/输入框外观复用 Input token，下拉外观复用 Select token；
  // 以下别名把组件里散落的 alias 收敛到组件层，默认值 = 原直接引 alias，视觉不变。
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
