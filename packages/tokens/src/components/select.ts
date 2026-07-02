/**
 * Component tokens for Select & AutoComplete. 全量对齐 Semi Design
 * （semi-foundation/select/variables.scss 104 个 + animation.scss 11 个），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token / input token，或字面量。
 * 末尾保留 chenzy-design 组件实际消费的补充 token
 * （Select/TreeSelect/AutoComplete/Cascader/Pagination/Table/Menu 等共用，勿删）。
 * 见 specs/components/input/Select.spec.md。
 */
import type { TokenGroup } from './token-def.js';

export const selectTokens = {
  // —— Color · 触发器背景 / 描边 ——
  'color-select-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选择框背景色', usage: '选择器输入框背景色 - 默认态' },
  'color-select-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选择框背景色', usage: '选择器输入框背景色 - 悬停态' },
  'color-select-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '选择框背景色', usage: '选择器输入框背景色 - 按下态' },
  'color-select-bg-focus': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选择框背景色', usage: '选择器输入框背景色 - 聚焦态' },
  'color-select-border-default': { value: 'transparent', category: 'color', label: '选择框描边色', usage: '选择器输入框描边颜色' },
  'color-select-border-hover': { value: 'var(--cd-color-select-border-default)', category: 'color', label: '选择框描边色', usage: '选择器输入框描边颜色 - 悬浮' },
  'color-select-border-active': { value: 'var(--cd-color-focus-border)', category: 'color', label: '选择框描边色', usage: '选择器输入框描边颜色 - 按下态' },
  'color-select-border-focus': { value: 'var(--cd-color-select-border-active)', category: 'color', label: '选择框描边色', usage: '选择器输入框描边颜色 - 选中态' },

  'color-select-dropdown-input-border': { value: 'var(--cd-color-select-border-default)', category: 'color', label: '搜索框描边色', usage: '下拉搜索框底部描边颜色' },

  // —— Color · warning ——
  'color-select-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警示选择框背景色', usage: '警示选择器输入框背景色 - 默认态' },
  'color-select-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警示选择框描边色', usage: '警示选择器输入框描边颜色 - 默认态' },
  'color-select-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警示选择框背景色', usage: '警示选择器输入框背景色 - 悬停态' },
  'color-select-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警示选择框描边色', usage: '警示选择器输入框描边颜色 - 悬停态' },
  'color-select-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警示选择框背景色', usage: '警示选择器输入框背景色 - 选中态' },
  'color-select-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警示选择框描边色', usage: '警示选择器输入框描边颜色 - 选中态' },
  'color-select-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警示选择框背景色', usage: '警示选择器输入框背景色 - 按下态' },
  'color-select-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警示选择框描边色', usage: '警示选择器输入框描边颜色 - 按下态' },

  // —— Color · danger ——
  'color-select-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '报错选择框背景色', usage: '报错选择器输入框背景色 - 默认态' },
  'color-select-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '报错选择框描边色', usage: '报错选择器输入框描边颜色 - 默认态' },
  'color-select-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '报错选择框背景色', usage: '报错选择器输入框背景色 - 悬停态' },
  'color-select-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '报错选择框描边色', usage: '报错选择器输入框描边颜色 - 悬停态' },
  'color-select-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '报错选择框背景色', usage: '报错选择器输入框背景色 - 选中态' },
  'color-select-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '报错选择框描边色', usage: '报错选择器输入框描边颜色 - 选中态' },
  'color-select-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '报错选择框背景色', usage: '报错选择器输入框背景色 - 按下态' },
  'color-select-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '报错选择框描边色', usage: '报错选择器输入框描边颜色 - 按下态' },

  'color-select-default-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '默认选择框描边色', usage: '默认选择器输入框描边颜色 - 选中态' },

  // —— Color · 文本 / 图标 / 清空 ——
  'color-select-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '回填文本色', usage: '选择器输入框回填内容文本颜色' },
  'color-select-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '选择器输入框图标颜色' },
  'color-select-clearbtn-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '清空按钮色', usage: '选择器输入框清空按钮颜色 - 默认态' },
  'color-select-clearbtn-text-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '清空按钮色', usage: '选择器输入框清空按钮颜色 - 悬停态' },

  // —— Color · disabled ——
  'color-select-input-disabled-bg': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用选择器输入框背景色' },
  'color-select-input-disabled-border': { value: 'var(--cd-color-border)', category: 'color', label: '禁用描边色', usage: '禁用选择器输入框描边颜色' },
  'color-select-input-disabled-border-focus': { value: 'transparent', category: 'color', label: '禁用描边色', usage: '禁用选择器输入框描边颜色 - 聚焦态' },
  'color-select-input-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '禁用选择器输入框回填内容文字颜色' },
  'color-select-input-disabled-bg-hover': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用选择器输入框背景色 - 悬停态' },
  'color-select-input-disabled-bg-focus': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用选择器输入框背景色 - 聚焦态' },

  'color-select-input-placeholder-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文本色', usage: '选择器输入框占位文本文字颜色' },

  // —— Color · 下拉选项 ——
  'color-select-option-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '选择器下拉菜单选项文本颜色' },
  'color-select-option-keyword-text': { value: 'var(--cd-color-primary)', category: 'color', label: '匹配文本色', usage: '选择器下拉菜单选项匹配搜索结果文本颜色' },
  'color-select-option-icon-default': { value: 'transparent', category: 'color', label: '选项图标色', usage: '选择器下拉菜单选项图标颜色 - 默认态' },
  'color-select-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选项背景色', usage: '选择器下拉菜单选项背景颜色 - 悬停态' },
  'color-select-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项背景色', usage: '选择器下拉菜单选项背景颜色 - 按下态' },
  'color-select-option-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用选项文字色', usage: '禁用选择器下拉菜单选项文字颜色' },
  'color-select-option-icon-active': { value: 'var(--cd-color-text-2)', category: 'color', label: '选项图标色', usage: '选择器下拉菜单选项图标颜色 - 选中态' },
  'color-select-option-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分组分割线色', usage: '选择器下拉菜单分组标题分割线颜色' },
  'color-select-option-bg-selected': { value: 'transparent', category: 'color', label: '选中项背景色', usage: '选择器下拉菜单选项背景颜色 - 选中态' },
  'color-select-create-tips-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '新建提示文本色', usage: '选择器下拉菜单新建选项提示文本颜色' },
  'color-select-group-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文本色', usage: '选择器下拉菜单分组标题文本颜色' },

  'color-select-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文本色', usage: '选择器输入框前后缀文本颜色' },

  // —— Width / Height ——
  'width-select-icon-right': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight) * 2)', category: 'width', label: '右侧图标大小', usage: '选择器右侧图标大小' },
  'height-select-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '选择框高度', usage: '选择器输入框高度 - 大尺寸' },
  'height-select-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '选择框高度', usage: '选择器输入框高度 - 小尺寸' },
  'height-select-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '选择框高度', usage: '选择器输入框高度 - 默认尺寸' },
  'width-select-option-tick': { value: 'var(--cd-width-icon-small)', category: 'width', label: '对勾图标大小', usage: '选择器下拉菜单项选中对勾图标大小' },
  'width-select-border': { value: '1px', category: 'width', label: '描边宽度', usage: '选择器输入框描边宽度' },
  'width-select-arrow': { value: '32px', category: 'width', label: '下拉箭头宽度', usage: '选择器输入框下拉箭头宽度' },
  'width-select-arrow-empty': { value: '12px', category: 'width', label: '下拉箭头宽度', usage: '选择器输入框下拉箭头为空时（有suffix icon）宽度' },
  'width-select-clear-icon': { value: '32px', category: 'width', label: '清空按钮宽度', usage: '选择器输入框清空按钮宽度' },
  'width-select-group-top-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '分组标题描边宽度', usage: '选择器下拉菜单分组标题描边宽度' },

  'height-select-multiple-input-small': { value: '20px', category: 'height', label: '多选输入框高度', usage: '小尺寸多项选择器输入框Input框高度' },
  'height-select-multiple-input-default': { value: '24px', category: 'height', label: '多选输入框高度', usage: '默认多项选择器输入框Input框高度' },
  'height-select-multiple-input-large': { value: '24px', category: 'height', label: '多选输入框高度', usage: '大尺寸多项选择器输入框Input框高度' },

  'width-select-border-hover': { value: 'var(--cd-width-select-border)', category: 'width', label: '描边宽度', usage: '选择器输入框描边宽度 - 悬浮' },
  'width-select-border-focus': { value: 'var(--cd-width-select-border-hover)', category: 'width', label: '描边宽度', usage: '选择器输入框描边宽度 - 按下' },
  'width-select-border-active': { value: 'var(--cd-width-select-border-focus)', category: 'width', label: '描边宽度', usage: '选择器输入框描边宽度 - 选中' },

  // —— Spacing ——
  'spacing-select-option-tick-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '对勾右外边距', usage: '选择器下拉菜单选中对勾右侧外边距' },
  'spacing-select-prefix-suffix-text-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '前后缀文本水平边距', usage: '选择器输入框前后缀文本水平内边距' },
  'spacing-select-prefix-suffix-text-marginy': { value: '0px', category: 'spacing', label: '前后缀文本垂直边距', usage: '选择器输入框前后缀文本垂直内边距' },
  'spacing-select-prefix-suffix-icon-marginx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '前后缀图标水平边距', usage: '选择器输入框前后缀图标水平内边距' },
  'spacing-select-prefix-suffix-icon-marginy': { value: '0px', category: 'spacing', label: '前后缀图标垂直边距', usage: '选择器输入框前后缀图标垂直内边距' },
  'spacing-select-create-tips-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '新建提示右外边距', usage: '创建新选项右侧外边距' },
  'spacing-select-group-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '分组标题上外边距', usage: '选择器下拉菜单分组标题顶部外边距' },
  'spacing-select-group-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '分组标题上内边距', usage: '选择器下拉菜单分组标题顶部内边距' },
  'spacing-select-group-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '分组标题下内边距', usage: '选择器下拉菜单分组标题底部内边距' },
  'spacing-select-group-paddingleft': { value: 'calc(var(--cd-spacing-base-tight) + var(--cd-width-select-option-tick) + var(--cd-spacing-select-option-tick-marginright))', category: 'spacing', label: '分组标题左内边距', usage: '选择器下拉菜单分组标题左侧内边距' },
  'spacing-select-group-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '分组标题右内边距', usage: '选择器下拉菜单分组标题右侧内边距' },
  'spacing-select-loading-wrapper-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '加载左内边距', usage: '选择器加载左侧内边距' },
  'spacing-select-loading-wrapper-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '加载右内边距', usage: '选择器加载右侧内边距' },
  'spacing-select-loading-wrapper-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载上内边距', usage: '选择器加载顶部内边距' },
  'spacing-select-loading-wrapper-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '加载下内边距', usage: '选择器加载底部内边距' },
  'spacing-select-multiple-content-wrapper-empty-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '多选空态左边距', usage: '多项选择器空回填内容为空时左侧内边距' },
  'spacing-select-multiple-selection-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选回填左边距', usage: '多项选择器回填内容左侧内边距' },
  'spacing-select-option-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项左内边距', usage: '选择器下拉菜单项左侧内边距' },
  'spacing-select-option-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选项右内边距', usage: '选择器下拉菜单项右侧内边距' },
  'spacing-select-option-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项上内边距', usage: '选择器下拉菜单项顶部内边距' },
  'spacing-select-option-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项下内边距', usage: '选择器下拉菜单项底部内边距' },
  'spacing-select-tag-margintop': { value: 'calc(var(--cd-spacing-super-tight) - 1px)', category: 'spacing', label: '标签上外边距', usage: '多项选择器标签顶部外边距' },
  'spacing-select-tag-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标签右外边距', usage: '多项选择器标签右侧外边距' },
  'spacing-select-tag-marginbottom': { value: 'calc(var(--cd-spacing-super-tight) - 1px)', category: 'spacing', label: '标签下外边距', usage: '多项选择器标签底部外边距' },
  'spacing-select-selection-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容区左外边距', usage: '选择器内容区左侧外边距' },
  'spacing-select-option-list-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '内容区上内边距', usage: '选择器内容区顶部内边距' },
  'spacing-select-option-list-paddingright': { value: '0px', category: 'spacing', label: '内容区右内边距', usage: '选择器内容区右侧内边距' },
  'spacing-select-option-list-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '内容区下内边距', usage: '选择器内容区底部内边距' },
  'spacing-select-option-list-paddingleft': { value: '0px', category: 'spacing', label: '内容区左内边距', usage: '选择器内容区左侧内边距' },
  'spacing-select-dropdown-input-paddingtop': { value: '8px', category: 'spacing', label: '搜索框上内边距', usage: '下拉搜索框顶部内边距' },
  'spacing-select-dropdown-input-paddingbottom': { value: '8px', category: 'spacing', label: '搜索框下内边距', usage: '下拉搜索框底部内边距' },
  'spacing-select-dropdown-input-paddingright': { value: '12px', category: 'spacing', label: '搜索框右内边距', usage: '下拉搜索框右侧内边距' },
  'spacing-select-dropdown-input-paddingleft': { value: '12px', category: 'spacing', label: '搜索框左内边距', usage: '下拉搜索框左侧内边距' },

  // —— Radius ——
  'radius-select': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '选择框圆角', usage: '选择器输入框圆角' },
  'radius-select-option': { value: '0px', category: 'radius', label: '待选项圆角', usage: '选择器待选项圆角' },

  // —— Font ——
  'font-select-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '文本字重', usage: '选择器文本字重' },
  'font-select-keyword-fontweight': { value: '600', category: 'font', label: '匹配文本字重', usage: '选择器搜索结果命关键词中文本字重' },
  'font-select-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '前后缀字重', usage: '选择器输入框前后缀文本字重' },

  // —— Other ——
  'opacity-select-selection-text-inactive': { value: '0.4', category: 'other', label: '回填内容不活跃透明度', usage: '选择器回填内容不活跃态透明度' },

  // —— animation：过渡（bg/border/option × duration/function/delay，对齐 Semi animation.scss）——
  // 默认无动画（duration/delay=0ms），主题或 DSM 可单独开启过渡。
  'transition-duration-select-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '背景过渡时长', usage: '选择器-背景色-动画持续时间' },
  'transition-function-select-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '背景过渡曲线', usage: '选择器-背景色-过渡曲线' },
  'transition-delay-select-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '背景过渡延迟', usage: '选择器-背景色-延迟时间' },
  'transition-duration-select-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '边框过渡时长', usage: '选择器-边框-动画持续时间' },
  'transition-function-select-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '边框过渡曲线', usage: '选择器-边框-过渡曲线' },
  'transition-delay-select-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '边框过渡延迟', usage: '选择器-边框-延迟时间' },
  'transition-duration-select-option-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '选项过渡时长', usage: '选择器-选项-动画持续时间' },
  'transition-function-select-option-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '选项过渡曲线', usage: '选择器-选项-过渡曲线' },
  'transition-delay-select-option-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '选项过渡延迟', usage: '选择器-选项-延迟时间' },

  // —— other：按压放大 / 箭头旋转（对齐 Semi transform token；归 other tab 对齐 Semi）——
  'transform-scale-select': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '选择框放大', usage: '选择框-变大' },
  'transform-rotate-select-arrow': { value: 'var(--cd-motion-rotate-none)', category: 'other', label: '箭头旋转', usage: '选择框-箭头-旋转' },

  // —— chenzy-design 组件实际消费的补充 token（Semi 无；勿删）——
  // 以下 select-* 别名被 Select/TreeSelect/AutoComplete/Cascader/Pagination/Table/Menu 直接消费。
  'select-height-default': { value: 'var(--cd-height-select-default)', category: 'height', label: '选择框高度', usage: '选择器高度 - 默认（组件消费）' },
  'select-height-small': { value: 'var(--cd-height-select-small)', category: 'height', label: '选择框高度', usage: '选择器高度 - 小尺寸（组件消费）' },
  'select-height-large': { value: 'var(--cd-height-select-large)', category: 'height', label: '选择框高度', usage: '选择器高度 - 大尺寸（组件消费）' },
  'select-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选择框水平内边距', usage: '选择器水平内边距（组件消费）' },
  'select-border': { value: 'var(--cd-color-select-border-default)', category: 'color', label: '选择框描边色', usage: '选择器描边颜色 - 默认（组件消费）' },
  'select-border-active': { value: 'var(--cd-color-select-border-active)', category: 'color', label: '聚焦描边色', usage: '选择器描边颜色 - 聚焦（组件消费）' },
  'select-border-error': { value: 'var(--cd-color-select-danger-border-focus)', category: 'color', label: '错误描边色', usage: '选择器描边颜色 - 错误（组件消费）' },
  'select-radius': { value: 'var(--cd-radius-select)', category: 'radius', label: '选择框圆角', usage: '选择器输入框圆角（组件消费）' },
  'select-bg': { value: 'var(--cd-color-select-bg-default)', category: 'color', label: '选择框背景色', usage: '选择器背景颜色 - 默认（组件消费）' },
  'select-bg-hover': { value: 'var(--cd-color-select-bg-hover)', category: 'color', label: '选择框背景色', usage: '选择器背景颜色 - 悬浮（组件消费）' },
  'select-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '选择框字号', usage: '选择器文字字号（组件消费）' },
  'select-dropdown-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '下拉背景色', usage: '选择器下拉浮层背景颜色（组件消费）' },
  'select-dropdown-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '下拉阴影', usage: '选择器下拉浮层阴影（组件消费）' },
  'select-dropdown-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '下拉圆角', usage: '选择器下拉浮层圆角（组件消费）' },
  'select-dropdown-z': { value: 'var(--cd-z-dropdown)', category: 'other', label: '下拉层级', usage: '选择器下拉浮层 z-index（组件消费）' },
  'select-option-padding': { value: 'var(--cd-spacing-select-option-paddingtop) var(--cd-spacing-select-option-paddingright)', category: 'spacing', label: '选项内边距', usage: '选择器下拉选项内边距（组件消费）' },
  'select-option-bg-hover': { value: 'var(--cd-color-select-option-bg-hover)', category: 'color', label: '选项背景色', usage: '选择器下拉选项背景颜色 - 悬浮（组件消费）' },
  'select-option-bg-active': { value: 'var(--cd-color-select-option-bg-active)', category: 'color', label: '选项背景色', usage: '选择器下拉选项背景颜色 - 选中（组件消费）' },
  'select-option-color-selected': { value: 'var(--cd-color-select-option-main-text)', category: 'color', label: '选中项文字色', usage: '选择器下拉选中项文字颜色（组件消费）' },
  'select-option-check-color': { value: 'var(--cd-color-primary)', category: 'color', label: '选中对勾色', usage: '选择器下拉选中对勾颜色（组件消费）' },
} satisfies TokenGroup;
