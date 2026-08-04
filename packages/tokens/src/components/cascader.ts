/**
 * Component tokens for Cascader（严格对齐 Semi semi-foundation/cascader/variables.scss）。
 *
 * Cascader 是「填充式触发器 + 多级菜单面板」的组合控件。触发器（selection/背景/描边/
 * 圆角/内边距/状态描边）复用 Input/Select 填充式 token（对齐本库 TagInput/TreeSelect 的
 * 做法，见 meta.tokens 的 --cd-select-* / --cd-input-*），本文件只建立组件面板与触发器
 * 内部实际消费的 Cascader 专属 token，名与值逐条对齐 Semi variables.scss：
 * - 命中项底色 option-bg-selected（Semi $color-cascader_option-bg-selected: primary-light-default）
 * - 选中/命中字重 select-fontweight（Semi $font-cascader_select-fontWeight: bold）
 * - 触发器图标三态 icon-default/hover/active（Semi $color-cascader-icon-*）
 * - +N/占位/选中文字色 selection-n-text/placeholder-text/selection-text（Semi 同名变量）
 * - 禁用项/空态文字色 option-disabled-text/option-empty-text（Semi 同名变量）
 * - 列宽/列分割线 column-width/column-border（Semi $width-cascader_option 150px /
 *   $color-cascader_option_list-border-default fill-0）——组件面板列直接消费。
 *
 * 值引用我们的 alias/global var(--cd-color-*)（语义名与 Semi var(--semi-color-*) 一一对应）。
 */
import type { TokenGroup } from './token-def.js';

export const cascaderTokens = {
  // —— 菜单项 文字 / 背景 ——
  'color-cascader-option-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '菜单项文字色', usage: '级联选择菜单项文字颜色' },
  'color-cascader-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 悬浮' },
  'color-cascader-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 按下' },
  'color-cascader-option-bg-selected': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '命中项背景色', usage: '级联选择菜单项背景颜色 - 命中' },
  'color-cascader-option-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用项文字色', usage: '级联选择菜单项文字颜色 - 禁用' },
  'color-cascader-option-empty-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '空态文字色', usage: '级联选择空状态文字颜色' },

  // —— 前后缀 / prefix ——
  'color-cascader-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文字色', usage: '级联选择前后缀文字颜色' },
  'color-cascader-label-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 文字色', usage: '级联选择 prefix 文字颜色' },

  // —— 触发器图标三态 ——
  'color-cascader-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 默认' },
  'color-cascader-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 悬浮' },
  'color-cascader-icon-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 按下' },
  'color-cascader-option-icon-default': { value: 'var(--cd-color-cascader-icon-default)', category: 'color', label: '菜单项图标色', usage: '级联选择菜单项图标颜色' },

  // —— +N / 选中 / 占位 文字色 ——
  'color-cascader-selection-n-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '+N 文字色', usage: '超出 maxTagCount 后，+n 的文字默认颜色' },
  'color-cascader-selection-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中项文字色', usage: '级联选择选中项文字颜色' },
  'color-cascader-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文字色', usage: '级联选择未选中项文字颜色' },

  // —— 搜索高亮 ——
  'color-cascader-select-highlight': { value: 'var(--cd-color-primary)', category: 'color', label: '搜索高亮色', usage: '级联选择器搜索命中后文字高亮的颜色' },

  // —— 触发器内搜索 Input 背景/描边（组件消费）——
  // 值对齐 Semi：$color-cascader_input-bg-default（transparent）/
  // $color-cascader_input-border-default（none）。均为独立字面量（非引用色板/border scale），
  // 与 Semi 结构保持一致——即使数值恰好等于 CSS 关键字，也建专属 token 而非硬编码。
  'color-cascader-input-bg-default': { value: 'transparent', category: 'color', label: '搜索框背景色', usage: '级联选择触发器内置搜索框背景颜色（组件消费）' },
  'color-cascader-input-border-default': { value: 'none', category: 'color', label: '搜索框描边', usage: '级联选择触发器内置搜索框描边（组件消费）' },

  // —— font ——
  'font-cascader-label-fontweight': { value: '600', category: 'font', label: 'label 字重', usage: '级联选择 prefix 字重' },
  'font-cascader-select-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '命中项字重', usage: '级联选择菜单项字重 - 选中' },

  // —— 列宽 / 列分割线（组件面板列直接消费）——
  // 值对齐 Semi：$width-cascader_option（150px）/ $color-cascader_option_list-border-default（fill-0）。
  'cascader-column-width': { value: '150px', category: 'width', label: '列宽', usage: '级联选择各级菜单列宽（组件消费）' },
  'cascader-column-border': { value: 'var(--cd-color-fill-0)', category: 'color', label: '列分割线色', usage: '级联选择各级菜单分割线颜色（组件消费）' },

  // —— 面板高度（组件消费）——
  // 值对齐 Semi $height-cascader_option_list（180px）：面板固定 height（非 max-height），
  // 各列 height:100% 继承此值。
  'height-cascader-option-list': { value: '180px', category: 'height', label: '面板高度', usage: '级联选择下拉面板固定高度（组件消费）' },

  // —— 触发器内搜索框高度（组件消费）——
  // 值对齐 Semi $height-cascader_selection_wrapper/-small/-large（30/22/38px）：单选内置可
  // 搜索时 search-wrapper 用固定像素高度（非百分比继承），因为其父级 .cascader-selection
  // 是内容自适应高度的 flex 容器，"height:100%" 在此链路上无固定基准会解析成 0。
  'height-cascader-selection-search-wrapper': { value: '30px', category: 'height', label: '搜索框高度 - 默认', usage: '级联选择触发器内置搜索框高度（组件消费）' },
  'height-cascader-selection-search-wrapper-small': { value: '22px', category: 'height', label: '搜索框高度 - 小尺寸', usage: '级联选择触发器内置搜索框高度 - 小尺寸（组件消费）' },
  'height-cascader-selection-search-wrapper-large': { value: '38px', category: 'height', label: '搜索框高度 - 大尺寸', usage: '级联选择触发器内置搜索框高度 - 大尺寸（组件消费）' },

  // —— 列内边距（组件消费）——
  // 值对齐 Semi：$spacing-cacader_option_list-paddingY（4px）/ -paddingX（0px）。
  // Semi 这两个变量本身是独立字面量（非引用其他 spacing scale），故本库同样不接入通用
  // --cd-spacing-* token，直接建 Cascader 专属字面量 token，与 Semi 结构保持一致。
  'spacing-cascader-option-list-padding-y': { value: '4px', category: 'spacing', label: '列垂直内边距', usage: '级联选择各级菜单列垂直内边距（组件消费）' },
  'spacing-cascader-option-list-padding-x': { value: '0px', category: 'spacing', label: '列水平内边距', usage: '级联选择各级菜单列水平内边距（组件消费）' },

  // —— 触发器 / 菜单项图标尺寸（组件消费）——
  // 值对齐 Semi：$width-cascader-icon（32px，触发器 arrow/clearbtn）/
  // $width-cascader-option-icon（16px，菜单项展开箭头/loading spin）。均为独立字面量。
  'width-cascader-icon': { value: '32px', category: 'width', label: '触发器图标尺寸', usage: '级联选择触发器图标尺寸（arrow/clearbtn，组件消费）' },
  'width-cascader-option-icon': { value: '16px', category: 'width', label: '菜单项图标尺寸', usage: '级联选择菜单项图标尺寸（组件消费）' },

  // —— 菜单项内边距（组件消费）——
  // 值对齐 Semi：$spacing-cascader_option-paddingTop/-paddingBottom（均 8px）、
  // -paddingLeft（12px）/ -paddingRight（16px，左右不对称）。均为独立字面量。
  'spacing-cascader-option-padding-top': { value: '8px', category: 'spacing', label: '菜单项上内边距', usage: '级联选择菜单项顶部内边距（组件消费）' },
  'spacing-cascader-option-padding-bottom': { value: '8px', category: 'spacing', label: '菜单项下内边距', usage: '级联选择菜单项底部内边距（组件消费）' },
  'spacing-cascader-option-padding-left': { value: '12px', category: 'spacing', label: '菜单项左内边距', usage: '级联选择菜单项左侧内边距（组件消费，RTL 下镜像为右）' },
  'spacing-cascader-option-padding-right': { value: '16px', category: 'spacing', label: '菜单项右内边距', usage: '级联选择菜单项右侧内边距（组件消费，RTL 下镜像为左）' },

  // —— 空态内边距（组件消费）——
  // 值对齐 Semi：$spacing-cascader_option_empty-paddingY（8px）/ -paddingX（12px）。独立字面量。
  'spacing-cascader-option-empty-padding-y': { value: '8px', category: 'spacing', label: '空态垂直内边距', usage: '级联选择空结果垂直内边距（组件消费）' },
  'spacing-cascader-option-empty-padding-x': { value: '12px', category: 'spacing', label: '空态水平内边距', usage: '级联选择空结果水平内边距（组件消费）' },

  // —— 搜索结果扁平列表右内边距（组件消费）——
  // 值对齐 Semi：$spacing-cascader_flatten_list-paddingRight（64px，为层级面包屑留白）。独立字面量。
  'spacing-cascader-flatten-list-padding-right': { value: '64px', category: 'spacing', label: '扁平列表右内边距', usage: '级联选择搜索结果菜单右侧内边距（组件消费，RTL 下镜像为左）' },
} satisfies TokenGroup;
