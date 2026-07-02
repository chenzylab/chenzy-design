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
  // —— radius ——
  'radius-cascader': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '触发器圆角', usage: '级联选择触发器圆角' },
  'radius-cascader-option-empty': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '菜单空状态圆角', usage: '级联选择菜单空状态圆角' },

  // —— default 触发器描边 / 背景 ——
  'color-cascader-default-border-default': { value: 'transparent', category: 'color', label: '触发器描边色', usage: '级联选择触发器描边颜色 - 默认' },
  'color-cascader-default-border-hover': { value: 'transparent', category: 'color', label: '触发器描边色', usage: '级联选择触发器描边颜色 - 悬浮' },
  'color-cascader-default-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '触发器描边色', usage: '级联选择触发器描边颜色 - 选中' },
  'color-cascader-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '触发器背景色', usage: '级联选择触发器背景颜色 - 默认' },
  'color-cascader-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '触发器背景色', usage: '级联选择触发器背景颜色 - 悬浮' },
  'color-cascader-default-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '触发器背景色', usage: '级联选择触发器背景颜色 - 按下' },

  // —— 菜单项 / 列分割线 ——
  'color-cascader-option-list-border-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单分割线色', usage: '级联选择各级菜单分割线颜色' },
  'color-cascader-option-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '菜单项文字色', usage: '级联选择菜单项文字颜色' },
  'color-cascader-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 悬浮' },
  'color-cascader-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 按下' },
  'color-cascader-option-bg-selected': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '菜单项背景色', usage: '级联选择菜单项背景颜色 - 命中' },
  'color-cascader-option-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '菜单项禁用文字色', usage: '级联选择菜单项文字颜色 - 禁用' },
  'color-cascader-option-disabled-bg-hover': { value: 'transparent', category: 'color', label: '菜单项禁用背景色', usage: '级联选择菜禁用单项背景颜色 - 悬浮' },
  'color-cascader-option-disabled-bg-active': { value: 'transparent', category: 'color', label: '菜单项禁用背景色', usage: '级联选择菜禁用单项背景颜色 - 按下' },
  'color-cascader-tag-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用标签背景色', usage: '级联选择菜禁用Tag背景颜色' },

  // —— warning，same as Input ——
  'color-cascader-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '级联选择触发器警告背景颜色' },
  'color-cascader-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '级联选择触发器警告描边颜色' },
  'color-cascader-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色', usage: '级联选择触发器警告背景颜色 - 悬浮' },
  'color-cascader-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色', usage: '级联选择触发器警告描边颜色 - 悬浮' },
  'color-cascader-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '级联选择触发器警告背景颜色 - 选中' },
  'color-cascader-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色', usage: '级联选择触发器警告描边颜色 - 选中' },
  'color-cascader-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告背景色', usage: '级联选择触发器警告背景颜色 - 按下' },
  'color-cascader-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告描边色', usage: '级联选择触发器警告描边颜色 - 按下' },

  // —— error，same as Input ——
  'color-cascader-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '级联选择触发器危险背景颜色' },
  'color-cascader-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险描边色', usage: '级联选择触发器危险描边颜色' },
  'color-cascader-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险背景色', usage: '级联选择触发器危险背景颜色 - 悬浮' },
  'color-cascader-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险描边色', usage: '级联选择触发器危险描边颜色 - 悬浮' },
  'color-cascader-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '级联选择触发器危险背景颜色 - 选中' },
  'color-cascader-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '危险描边色', usage: '级联选择触发器危险描边颜色 - 选中' },
  'color-cascader-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '危险背景色', usage: '级联选择触发器危险背景颜色 - 按下' },
  'color-cascader-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '危险描边色', usage: '级联选择触发器危险描边颜色 - 按下' },

  // —— 前后缀文字 ——
  'color-cascader-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文字色', usage: '级联选择前后缀文字颜色' },

  // —— 触发器 selection 内边距（单选 / 小 / 大）——
  'spacing-cascader-selection-paddingleft': { value: '12px', category: 'spacing', label: '触发器左内边距', usage: '级联选择触发器左侧内边距 - 默认' },
  'spacing-cascader-selection-paddingright': { value: '12px', category: 'spacing', label: '触发器右内边距', usage: '级联选择触发器右侧内边距 - 默认' },
  'spacing-cascader-small-selection-paddingleft': { value: '12px', category: 'spacing', label: '小触发器左内边距', usage: '级联选择触发器左侧内边距 - 小尺寸' },
  'spacing-cascader-small-selection-paddingright': { value: '12px', category: 'spacing', label: '小触发器右内边距', usage: '级联选择触发器右侧内边距 - 小尺寸' },
  'spacing-cascader-large-selection-paddingleft': { value: '12px', category: 'spacing', label: '大触发器左内边距', usage: '级联选择触发器左侧内边距 - 大尺寸' },
  'spacing-cascader-large-selection-paddingright': { value: '12px', category: 'spacing', label: '大触发器右内边距', usage: '级联选择触发器右侧内边距 - 大尺寸' },

  // —— 多选触发器 selection 内边距（默认 / 小 / 大）——
  'spacing-cascader-selection-multiple-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选触发器左内边距', usage: '级联选择触发器多选时左侧内边距 - 默认' },
  'spacing-cascader-selection-multiple-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选触发器右内边距', usage: '级联选择触发器多选时右侧内边距 - 默认' },
  'spacing-cascader-small-selection-multiple-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小多选触发器左内边距', usage: '级联选择触发器多选时左侧内边距 - 小尺寸' },
  'spacing-cascader-small-selection-multiple-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小多选触发器右内边距', usage: '级联选择触发器多选时左侧内边距 - 小尺寸' },
  'spacing-cascader-large-selection-multiple-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '大多选触发器左内边距', usage: '级联选择触发器多选时左侧内边距 - 大尺寸' },
  'spacing-cascader-large-selection-multiple-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '大多选触发器右内边距', usage: '级联选择触发器多选时左侧内边距 - 大尺寸' },

  // —— 多选标签 / TagInput / 输入框 / +n 外边距 ——
  'spacing-cascader-selection-tag-marginleft': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '标签左外边距', usage: '级联选择触发器多选时标签的水平左外边距' },
  'spacing-cascader-selection-tag-marginright': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '标签右外边距', usage: '级联选择触发器多选时标签的水平右外边距' },
  'spacing-cascader-selection-tag-marginy': { value: '1px', category: 'spacing', label: '标签垂直外边距', usage: '级联选择触发器多选时标签的垂直外边距' },
  'spacing-cascader-selection-taginput-marginleft': { value: 'calc(-1 * var(--cd-spacing-extra-tight))', category: 'spacing', label: 'TagInput 左外边距', usage: '级联选择触发器多选搜索时 TagInput 的左外边距' },
  'spacing-cascader-selection-input-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '输入框左外边距', usage: '级联选择触发器多选搜索时输入框的左外边距' },
  'spacing-cascader-selection-n-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '+n 右外边距', usage: '超出 maxTagCount 后，+n 的右外边距' },
  'spacing-cascader-option-icon-marginleft': { value: '8px', category: 'spacing', label: '菜单项图标左外边距', usage: '级联选择菜单项图标左侧外边距' },

  // —— +n / 回填 / 占位 / 图标 颜色 ——
  'color-cascader-selection-n-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '+n 文字色', usage: '超出 maxTagCount 后，+n 的文字默认颜色' },
  'color-cascader-selection-n-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '+n 禁用文字色', usage: '超出 maxTagCount 后，+n 的文字disabled颜色' },
  'color-cascader-selection-text-inactive': { value: 'var(--cd-color-text-2)', category: 'color', label: '并存 text 色', usage: '级联选择单选inpu输入框和text并存时，text颜色' },
  'color-cascader-selection-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中项文字色', usage: '级联选择选中项文字颜色' },
  'color-cascader-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文字色', usage: '级联选择未选中项文字颜色' },
  'color-cascader-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 默认' },
  'color-cascader-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 悬浮' },
  'color-cascader-icon-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '触发器图标色', usage: '级联选择触发器图标颜色 - 按下' },

  // —— prefix 文字 / 菜单项图标 ——
  'color-cascader-label-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 文字色', usage: '级联选择 prefix 文字颜色' },
  'color-cascader-option-icon-default': { value: 'var(--cd-color-cascader-icon-default)', category: 'color', label: '菜单项图标色', usage: '级联选择菜单项图标颜色' },

  // —— 禁用态 / 搜索 / 空态 / 输入框 / 高亮 ——
  'color-cascader-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '级联选择禁用态背景颜色' },
  'color-cascader-input-disabled-bg-hover': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '级联选择禁用态背景颜色 - 悬浮' },
  'color-cascader-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '级联选择禁用态文字颜色' },
  'color-cascader-input-disabled-icon-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用图标色', usage: '级联选择禁用态图标颜色' },
  'color-cascader-search-border-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '搜索描边色', usage: '级联选择搜索描边颜色' },
  'color-cascader-option-empty-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '空状态文字色', usage: '级联选择空状态文字颜色' },
  'color-cascader-input-bg-default': { value: 'transparent', category: 'color', label: '输入框背景色', usage: '级联选择输入框背景颜色' },
  'color-cascader-input-border-default': { value: 'none', category: 'color', label: '输入框描边色', usage: '级联选择输入框描边颜色' },
  'color-cascader-select-highlight': { value: 'var(--cd-color-primary)', category: 'color', label: '搜索高亮色', usage: '级联选择器搜索命中后文字高亮的颜色' },

  // —— font ——
  'font-cascader-select-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '菜单项选中字重', usage: '级联选择菜单项字重 - 选中' },
  'font-cascader-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '菜单项未选中字重', usage: '级联选择菜单项字重 - 未选中' },
  'font-cascader-label-fontweight': { value: '600', category: 'font', label: 'label 字重', usage: '级联选择 prefix 字重' },
  'font-cascader-selection-n-fontsize': { value: 'var(--cd-font-size-small)', category: 'font', label: '+n 字号', usage: '超出 maxTagCount 后，+n 的文字尺寸' },
  'font-cascader-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '前后缀字重', usage: '级联选择 prefix/suffix 文字字重' },

  // —— width ——
  'width-cascader-border': { value: '1px', category: 'width', label: '触发器描边宽度', usage: '级联选择触发器描边宽度' },
  'width-cascader-option-list-border': { value: '1px', category: 'width', label: '菜单分割线宽度', usage: '级联选择各级菜单分割线宽度' },
  'width-cascader': { value: '80px', category: 'width', label: '触发器最小宽度', usage: '级联选择触发器最小宽度' },

  // —— height（触发器尺寸档）——
  'height-cascader-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '触发器高度', usage: '级联选择触发器高度 - 默认' },
  'height-cascader-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '小触发器高度', usage: '级联选择触发器高度 - 小尺寸' },
  'height-cascader-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '大触发器高度', usage: '级联选择触发器高度 - 大尺寸' },

  // —— width（描边状态 / 图标 / 列 / 菜单）——
  'width-cascader-hover-border': { value: 'var(--cd-width-cascader-border)', category: 'width', label: '触发器描边宽度', usage: '级联选择触发器描边宽度 - 悬浮' },
  'width-cascader-focus-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '触发器描边宽度', usage: '级联选择触发器描边宽度 - 选中态' },
  'width-cascader-search-border': { value: '1px', category: 'width', label: '搜索描边宽度', usage: '级联选择触搜索描边宽度' },
  'width-cascader-icon': { value: '32px', category: 'width', label: '触发器图标尺寸', usage: '级联选择触发器图标尺寸' },
  'width-cascader-option-icon': { value: '16px', category: 'width', label: '菜单项图标尺寸', usage: '级联选择菜单项图标尺寸' },
  'width-cascader-option': { value: '150px', category: 'width', label: '各级菜单宽度', usage: '级联选择各级菜单宽度' },

  // —— height（菜单 / 多选搜索框 / 单选搜索框 最小高度）——
  'height-cascader-option-list': { value: '180px', category: 'height', label: '菜单高度', usage: '级联选择菜单高度' },
  'height-cascader-selection-taginput-wrapper-small': { value: '22px', category: 'height', label: '多选搜索框最小高度-小', usage: '级联选择多选搜索时搜索框最小高度 - 小尺寸' },
  'height-cascader-selection-taginput-wrapper-default': { value: '30px', category: 'height', label: '多选搜索框最小高度-默认', usage: '级联选择多选搜索时搜索框最小高度 - 默认尺寸' },
  'height-cascader-selection-taginput-wrapper-large': { value: '38px', category: 'height', label: '多选搜索框最小高度-大', usage: '级联选择多选搜索时搜索框最小高度 - 大尺寸' },
  'height-cascader-selection-wrapper-small': { value: '22px', category: 'height', label: '单选搜索框高度-小', usage: '级联选择单选搜索时搜索框高度 - 小尺寸' },
  'height-cascader-selection-wrapper': { value: '30px', category: 'height', label: '单选搜索框高度-默认', usage: '级联选择单选搜索时搜索框高度 - 默认尺寸' },
  'height-cascader-selection-wrapper-large': { value: '38px', category: 'height', label: '单选搜索框高度-大', usage: '级联选择单选搜索时搜索框高度 - 大尺寸' },

  // —— spacing（prefix/suffix 文字 / 图标 / checkbox / +N）——
  'spacing-cascader-text-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '前后缀文字水平内间距', usage: '级联选择 prefix/suffix 文字水平内间距' },
  'spacing-cascader-icon-marginx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '前后缀图标水平内间距', usage: '级联选择 prefix/suffix 图标水平内间距' },
  'spacing-cascader-label-checkbox-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'checkbox 右间距', usage: '级联选择 checkbox 的右间距' },
  'spacing-cascader-selection-n-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '+N 水平间距', usage: '级联选择 +N 的水平间距' },

  // —— spacing（搜索结果菜单 / 下拉列表 / 搜索 / 空结果 / 菜单项内边距）——
  'spacing-cascader-flatten-list-paddingright': { value: '64px', category: 'spacing', label: '搜索结果菜单右内边距', usage: '级联选择搜索结果菜单右侧内边距' },
  'spacing-cascader-empty-icon-marginright': { value: '8px', category: 'spacing', label: '空结果图标右外边距', usage: '级联选择搜索结果菜单' },
  'spacing-cacader-option-list-paddingy': { value: '4px', category: 'spacing', label: '下拉列表垂直内边距', usage: '级联选择下拉菜单列表垂直内边距' },
  'spacing-cacader-option-list-paddingx': { value: '0px', category: 'spacing', label: '下拉列表水平内边距', usage: '级联选择下拉菜单列表水平内边距' },
  'spacing-cascader-search-paddingx': { value: '12px', category: 'spacing', label: '搜索水平内边距', usage: '级联选择搜索水平内边距' },
  'spacing-cascader-search-paddingy': { value: '8px', category: 'spacing', label: '搜索垂直内边距', usage: '级联选择搜索垂直内边距' },
  'spacing-cascader-option-empty-paddingy': { value: '8px', category: 'spacing', label: '空结果垂直内边距', usage: '级联选择空结果垂直内边距' },
  'spacing-cascader-option-empty-paddingx': { value: '12px', category: 'spacing', label: '空结果水平内边距', usage: '级联选择空结果水平内边距' },
  'spacing-cascader-option-paddingtop': { value: '8px', category: 'spacing', label: '菜单项顶部内边距', usage: '级联选择菜单项顶部内边距' },
  'spacing-cascader-option-paddingbottom': { value: '8px', category: 'spacing', label: '菜单项底部内边距', usage: '级联选择菜单项底部内边距' },
  'spacing-cascader-option-paddingleft': { value: '12px', category: 'spacing', label: '菜单项左内边距', usage: '级联选择菜单项左侧内边距' },
  'spacing-cascader-option-paddingright': { value: '16px', category: 'spacing', label: '菜单项右内边距', usage: '级联选择菜单项右侧内边距' },

  // —— chenzy-design Cascader 实际消费的补充 token（Semi 无独立变量；组件面板消费）——
  // 列宽 / 列分割线：Cascader.svelte 面板列 .cd-cascader__column / __flat / __search 直接消费。
  // 值对齐 Semi $width-cascader_option（150px）/ $color-cascader_option_list-border-default。
  'cascader-column-width': { value: 'var(--cd-width-cascader-option)', category: 'width', label: '列宽', usage: '级联选择各级菜单列宽（组件消费）' },
  'cascader-column-border': { value: 'var(--cd-color-cascader-option-list-border-default)', category: 'color', label: '列分割线色', usage: '级联选择各级菜单分割线颜色（组件消费）' },
} satisfies TokenGroup;
