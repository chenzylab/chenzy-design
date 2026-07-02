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
  // —— default 选择框背景 ——
  'color-tree-select-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '树选择器选择框背景颜色 - 默认' },
  'color-tree-select-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色', usage: '树选择器选择框背景颜色 - 悬停' },
  'color-tree-select-default-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '背景色', usage: '树选择器选择框背景颜色 - 按下' },
  'color-tree-select-default-bg-focus': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '树选择器选择框背景颜色 - 选中' },

  // —— default 选择框描边 / 回填文本 / 图标 ——
  'color-tree-select-default-border-default': { value: 'transparent', category: 'color', label: '描边色', usage: '树选择器选择框描边颜色 - 默认' },
  'color-tree-select-selection-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '回填文本色', usage: '树选择器选择框回填内容文本颜色 - 默认' },
  'color-tree-select-default-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '树选择器选择框图标颜色 - 默认' },
  'color-tree-select-default-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '清空按钮色', usage: '树选择器选择框清空按钮颜色 - 悬停' },
  'color-tree-select-default-icon-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '清空按钮色', usage: '树选择器选择框清空按钮颜色 - 按下' },

  'color-tree-select-default-border-hover': { value: 'transparent', category: 'color', label: '描边色', usage: '树选择器选择框描边颜色 - 悬浮' },
  'color-tree-select-default-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '描边色', usage: '树选择器选择框描边颜色 - 选中' },

  // —— 搜索框 / 禁用 / 占位 ——
  'color-tree-select-search-border-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '搜索框描边色', usage: '树选择器菜单搜索框描边颜色 - 默认' },
  'color-tree-select-tag-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用标签背景色', usage: '禁用树选择器菜单标签背景颜色' },
  'color-tree-select-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用树选择器选择框背景颜色' },
  'color-tree-select-input-disabled-border-default': { value: 'var(--cd-color-disabled-border)', category: 'color', label: '禁用描边色', usage: '禁用树选择器选择框描边颜色' },
  'color-tree-select-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '禁用树选择器选择框文本颜色' },
  'color-tree-select-input-disabled-bg-hover': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用树选择器选择框背景颜色 - 悬浮' },
  'color-tree-select-input-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文本色', usage: '树选择器选择框占位文本颜色' },

  // —— warning，same as Input ——
  'color-tree-select-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 默认' },
  'color-tree-select-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 默认' },
  'color-tree-select-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 悬浮' },
  'color-tree-select-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 悬浮' },
  'color-tree-select-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 选中' },
  'color-tree-select-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 选中' },
  'color-tree-select-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告背景色', usage: '警告树选择器选择框背景颜色 - 激活' },
  'color-tree-select-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告描边色', usage: '警告树选择器选择框描边颜色 - 激活' },

  // —— error，same as Input ——
  'color-tree-select-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 默认' },
  'color-tree-select-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 默认' },
  'color-tree-select-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 悬浮' },
  'color-tree-select-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 悬浮' },
  'color-tree-select-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 选中' },
  'color-tree-select-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 选中' },
  'color-tree-select-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误背景色', usage: '错误树选择器选择框背景颜色 - 激活' },
  'color-tree-select-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误描边色', usage: '错误树选择器选择框描边颜色 - 激活' },

  // —— radius / border width ——
  'radius-tree-select': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角', usage: '树选择器圆角' },
  'width-tree-select-border': { value: '1px', category: 'width', label: '描边宽度', usage: '树选择器描边宽度' },
  'width-tree-select-search-wrapper-border': { value: '1px', category: 'width', label: '搜索框描边宽度', usage: '树选择器搜索框描边宽度' },
  'width-tree-select-hover-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '描边宽度', usage: '树选择器选择框描边宽度 - 悬浮' },
  'width-tree-select-focus-border': { value: 'var(--cd-width-tree-select-hover-border)', category: 'width', label: '描边宽度', usage: '树选择器选择框描边宽度 - 选中' },
  'width-tree-select-default': { value: '80px', category: 'width', label: '最小宽度', usage: '树选择器最小宽度' },

  // —— height / font（尺寸档）——
  'height-tree-select-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '默认高度', usage: '树选择器选择器高度 - 默认' },
  'font-tree-select-default-lineheight': { value: 'var(--cd-height-tree-select-default)', category: 'font', label: '默认行高', usage: '树选择器选择器文本行高' },
  'font-tree-select-default-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '默认字重', usage: '树选择器选择器文本字重' },
  'font-tree-select-default-fontsize': { value: '14px', category: 'font', label: '默认字号', usage: '树选择器选择器文本字号' },
  'height-tree-select-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '小尺寸高度', usage: '小尺寸树选择器选择器高度' },
  'font-tree-select-small-lineheight': { value: 'var(--cd-height-tree-select-small)', category: 'font', label: '小尺寸行高', usage: '小尺寸树选择器选择器文本行高' },
  'height-tree-select-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '大尺寸高度', usage: '大尺寸树选择器选择器文本行高' },
  'font-tree-select-large-lineheight': { value: 'var(--cd-height-tree-select-large)', category: 'font', label: '大尺寸行高', usage: '大尺寸树选择器选择器文本行高' },
  'font-tree-select-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '前后缀字重', usage: '树选择器前缀后缀文本字重' },

  // —— spacing（选择框 / 标签 / 前缀后缀 / 搜索框内边距）——
  'spacing-tree-select-selection-taginput-wrapper-paddingx': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选容器水平内边距', usage: '树选择器多选标签容器水平内边距' },
  'spacing-tree-select-selection-taginput-empty-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选空容器左外边距', usage: '树选择器多选标签容器为空时左侧外边距' },
  'spacing-tree-select-selection-taginput-notempty-marginleft': { value: 'calc(-1 * var(--cd-spacing-extra-tight))', category: 'spacing', label: '多选非空容器左外边距', usage: '树选择器多选标签容器不为空时左侧外边距' },
  'spacing-tree-select-selection-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '单选左内边距', usage: '树选择器单选左侧内边距' },
  'spacing-tree-select-tag-marginx': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '标签水平外边距', usage: '树选择器多选标签水平外边距' },
  'spacing-tree-select-tag-marginy': { value: '1px', category: 'spacing', label: '标签垂直外边距', usage: '树选择器多选标签垂直外边距' },
  'spacing-tree-select-selection-multiple-paddingleft': { value: '4px', category: 'spacing', label: '多选标签左内边距', usage: '树选择器多选标签左侧内边距' },
  'spacing-tree-select-placeholder-multiple-paddingleft': { value: '8px', category: 'spacing', label: '多选占位左外边距', usage: '树选择器多选占位文本左侧外边距' },
  'spacing-tree-select-prefix-text-marginy': { value: '0px', category: 'spacing', label: '前缀文本垂直外边距', usage: '树选择器前缀文本垂直外边距' },
  'spacing-tree-select-prefix-text-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '前缀文本水平外边距', usage: '树选择器前缀文本水平外边距' },
  'spacing-tree-select-prefix-icon-marginy': { value: '0px', category: 'spacing', label: '前缀图标垂直外边距', usage: '树选择器前缀图标垂直外边距' },
  'spacing-tree-select-prefix-icon-marginx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '前缀图标水平外边距', usage: '树选择器前缀图标水平外边距' },
  'spacing-tree-select-selection-withsuffix-paddingright': { value: '0px', category: 'spacing', label: '有后缀右内边距', usage: '树选择器有后缀时内容右侧内边距' },
  'spacing-tree-select-search-wrapper-paddingx': { value: '12px', category: 'spacing', label: '搜索框容器水平内边距', usage: '树选择器搜索框容器水平内边距' },
  'spacing-tree-select-search-wrapper-paddingy': { value: '8px', category: 'spacing', label: '搜索框容器垂直内边距', usage: '树选择器搜索框容器垂直内边距' },

  // —— 带搜索触发器 / 前后缀文本 ——
  'color-tree-select-selection-triggersearchitem-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '触发器占位文本色', usage: '带搜索的树选择器触发器占位文本默认颜色' },
  'color-tree-select-inputtrigger-border-default': { value: 'none', category: 'color', label: '触发器描边色', usage: '带搜索的树选择器触发器描边颜色' },
  'color-tree-select-inputtrigger-bg-default': { value: 'transparent', category: 'color', label: '触发器背景色', usage: '带搜索的树选择器触发器背景颜色' },
  'color-tree-select-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文本色', usage: '带搜索的树选择器前后缀文本颜色' },

  // —— 箭头 / 菜单项 / 菜单高度 / 多选搜索框最小高度 ——
  'width-tree-select-arrow': { value: '32px', category: 'width', label: '展开箭头宽度', usage: '树选择器展开箭头宽度' },
  'width-tree-select-option': { value: '230px', category: 'width', label: '菜单项宽度', usage: '树选择器菜单项宽度' },
  'height-tree-select-popover': { value: '300px', category: 'height', label: '菜单高度', usage: '树选择器菜单高度' },
  'height-tree-select-selection-taginput-wrapper-small': { value: '22px', category: 'height', label: '多选搜索框最小高度-小', usage: '树选择器多选搜索，搜索框在选择框时选择框最小高度 - 小尺寸' },
  'height-tree-select-selection-taginput-wrapper-default': { value: '30px', category: 'height', label: '多选搜索框最小高度-默认', usage: '树选择器多选搜索，搜索框在选择框时选择框最小高度 - 默认尺寸' },
  'height-tree-select-selection-taginput-wrapper-large': { value: '38px', category: 'height', label: '多选搜索框最小高度-大', usage: '树选择器多选搜索，搜索框在选择框时选择框最小高度 - 大尺寸' },
} satisfies TokenGroup;
