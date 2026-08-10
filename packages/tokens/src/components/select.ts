/**
 * Component tokens for Select（及被 AutoComplete/Cascader/Pagination/TreeSelect 等复用的短名别名）。
 * 遵循 dsm.spec「Token 精简原则」：只保留组件实际消费的 token。
 * 原「全量对齐 Semi select/variables.scss（104 个）+ animation.scss」中，无任何 .svelte
 * 消费、且不被其它存活 token 引用的长名变量已删除；被组件消费的短名别名（select-*）
 * 原先经由这些长名中转，现已重接到其最终 alias/global 值，链条缩短、语义不变。
 * 值为 var() 引用我们的 alias / global / input token，或字面量。
 * 见 specs/components/input/Select.spec.md。
 */
import type { TokenGroup } from './token-def.js';

export const selectTokens = {
  // —— Color · 文本 / 图标 / 清空（组件直接消费）——
  'color-select-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '回填文本色', usage: '选择器输入框回填内容文本颜色' },
  'color-select-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '选择器输入框图标颜色' },
  'color-select-clearbtn-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '清空按钮色', usage: '选择器输入框清空按钮颜色 - 默认态' },
  'color-select-clearbtn-text-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '清空按钮色', usage: '选择器输入框清空按钮颜色 - 悬停态' },
  // 对齐 Semi `.semi-select-option-keyword { color: var(--semi-color-primary); background-color:
  // inherit; font-weight: 600 }`（真机核对官网线上 CSS 确认；本地 checkout 的 select.scss 无此
  // 规则，属版本落后于线上）：选项文字匹配搜索词的高亮片段，颜色走主色而非通用 Highlight
  // 组件的黄底黑字默认值——Select 场景下自定义了这层覆盖。
  'color-select-option-keyword': { value: 'var(--cd-color-primary)', category: 'color', label: '选项高亮命中片段色', usage: '搜索命中片段文字颜色（覆盖 Highlight 组件默认黄底样式）' },

  // —— Color · disabled（组件直接消费）——
  'color-select-input-disabled-bg': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用选择器输入框背景色' },
  // 对齐 Semi $color-select_input_disabled-bg-hover/-bg-focus：与默认禁用背景同值（禁用态不因 hover/focus 变色）。
  'color-select-input-disabled-bg-hover': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '禁用选择器输入框背景色 - 悬停/聚焦态' },
  // 对齐 Semi $color-select_input_disabled-border-focus：聚焦态描边透明（禁用态不应有强调边框）。
  'color-select-input-disabled-border-focus': { value: 'transparent', category: 'color', label: '禁用聚焦描边色', usage: '禁用选择器输入框描边颜色 - 聚焦态' },
  'color-select-input-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '禁用选择器输入框回填内容文字颜色' },

  'color-select-input-placeholder-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文本色', usage: '选择器输入框占位文本文字颜色' },

  // —— Color · 下拉选项（组件直接消费）——
  'color-select-option-keyword-text': { value: 'var(--cd-color-primary)', category: 'color', label: '匹配文本色', usage: '选择器下拉菜单选项匹配搜索结果文本颜色' },
  'color-select-option-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用选项文字色', usage: '禁用选择器下拉菜单选项文字颜色' },
  'color-select-option-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分组分割线色', usage: '选择器下拉菜单分组标题分割线颜色' },
  'color-select-group-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文本色', usage: '选择器下拉菜单分组标题文本颜色' },
  // 对齐 Semi $color-select_create_tips-text：allowCreate 新建选项的「创建」提示前缀色。
  'color-select-create-tips-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '新建提示文本色', usage: '选择器下拉菜单新建选项提示文本颜色' },

  'color-select-prefix-suffix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '前后缀文本色', usage: '选择器输入框前后缀文本颜色' },

  // —— Color · 校验态 warning（对齐 Semi $color-select_warning-*，组件直接消费）——
  'color-select-warning-bg': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警示背景色', usage: '警示选择器输入框背景色 - 默认态' },
  'color-select-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警示背景色', usage: '警示选择器输入框背景色 - 悬停态' },
  'color-select-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警示背景色', usage: '警示选择器输入框背景色 - 按下态' },
  'color-select-warning-border': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警示描边色', usage: '警示选择器输入框描边色 - 默认态' },
  'color-select-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警示聚焦描边色', usage: '警示选择器输入框描边色 - 聚焦态' },
  'color-select-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警示按下描边色', usage: '警示选择器输入框描边色 - 按下态' },

  // —— Color · 校验态 danger（对齐 Semi $color-select_danger-*，组件直接消费）——
  'color-select-danger-bg': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '报错背景色', usage: '报错选择器输入框背景色 - 默认态' },
  'color-select-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '报错背景色', usage: '报错选择器输入框背景色 - 悬停态' },
  'color-select-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '报错背景色', usage: '报错选择器输入框背景色 - 按下态' },
  'color-select-danger-border': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '报错描边色', usage: '报错选择器输入框描边色 - 默认态' },
  'color-select-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '报错聚焦描边色', usage: '报错选择器输入框描边色 - 聚焦态' },
  'color-select-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '报错按下描边色', usage: '报错选择器输入框描边色 - 按下态' },

  // —— animation：过渡（bg/border/option × duration/function/delay，组件直接消费）——
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

  // —— other：按压放大 / 箭头旋转（组件直接消费）——
  'transform-scale-select': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '选择框放大', usage: '选择框-变大' },
  'transform-rotate-select-arrow': { value: 'var(--cd-motion-rotate-none)', category: 'other', label: '箭头旋转', usage: '选择框-箭头-旋转' },

  // —— 跨组件复用的短名别名（红线：删除会静默断链，本轮保留）——
  // 被 TreeSelect / Cascader 直接消费（select-bg / select-border* / select-height* /
  // select-dropdown-* / select-font-size / select-padding-x / select-radius），
  // 以及 Pagination 覆写 --cd-select-dropdown-z。这些下游多数尚未对齐 Semi，
  // 贸然删短名会导致 var() 取空值 → 远端样式静默失效（记忆 deleting-shared-token-breaks-cross-component-consumer）。
  // 待 TreeSelect / Cascader 对齐后再统一清理。值已重接到最终 alias/global，链条缩短、视觉不变。
  // 注：select-option-* 系为 Select 自用短名（下游不消费），仅 select.svelte 直引。
  'select-height-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '选择框高度', usage: '选择器高度 - 默认（组件消费）' },
  'select-height-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '选择框高度', usage: '选择器高度 - 小尺寸（组件消费）' },
  'select-height-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '选择框高度', usage: '选择器高度 - 大尺寸（组件消费）' },
  'select-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '选择框水平内边距', usage: '选择器水平内边距（组件消费；TreeSelect / Cascader 亦消费）' },
  // 对齐 Semi $width-select_arrow / $spacing-select_selection-marginLeft：
  // Semi 的触发器本身无水平内边距，左侧留白由内容区 margin-left 承担、右侧由固定宽的箭头盒承担。
  'width-select-arrow': { value: '32px', category: 'width', label: '箭头区宽度', usage: '选择器下拉箭头区宽度（图标 16px 在其中居中，组件消费）' },
  // 对齐 Semi `.semi-select { max-height: 300px; overflow-y: auto }`：内容超高滚动而非撑开触发器。
  'select-max-height': { value: '300px', category: 'height', label: '选择框最大高度', usage: '选择器触发器最大高度，超出滚动（组件消费）' },
  'spacing-select-selection-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容区左外边距', usage: '选择器内容区左侧外边距（组件消费）' },
  // 对齐 Semi $spacing-select_multiple_selection-marginLeft：多选态内容区左外边距更小（4px）。
  'spacing-select-multiple-selection-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '多选内容区左外边距', usage: '多选选择器内容区左侧外边距（组件消费）' },
  // 对齐 Semi $spacing-select_multiple_content_wrapper_empty-marginLeft（= $spacing-tight，8px）：
  // 多选无选中值时，content-wrapper 在 selection 的 4px 基础上再加 8px，合计 12px，与单选
  // 态的 12px（spacing-select-selection-marginleft）视觉对齐——placeholder 不应因为多选态
  // 基础 margin 更小就比单选态更贴边框。
  'spacing-select-multiple-content-wrapper-empty-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '多选空值内容区额外左外边距', usage: '多选选择器无选中值时内容区左侧额外外边距，叠加在多选内容区左外边距之上（组件消费）' },
  // 对齐 Semi $spacing-select_create_tips-marginRight：「创建」提示与输入值之间的间距。
  'spacing-select-create-tips-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '新建提示右外边距', usage: '选择器下拉菜单新建选项提示文本右侧外边距（组件消费）' },
  // 对齐 Semi $opacity-select_selection_text_inactive：触发器内搜索且输入为空时，
  // 原回填文本叠在输入框下方淡出显示（Semi index.tsx:1057 selection-text-inactive）。
  'opacity-select-selection-text-inactive': { value: '0.4', category: 'other', label: '回填文本淡出透明度', usage: '触发器内搜索、输入为空时原回填文本的淡出透明度（组件消费）' },
  'select-border': { value: 'transparent', category: 'color', label: '选择框描边色', usage: '选择器描边颜色 - 默认（组件消费）' },
  'select-border-active': { value: 'var(--cd-color-focus-border)', category: 'color', label: '聚焦描边色', usage: '选择器描边颜色 - 聚焦（组件消费）' },
  'select-border-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误描边色', usage: '选择器描边颜色 - 错误（组件消费）' },
  'select-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '选择框圆角', usage: '选择器输入框圆角（组件消费）' },
  'select-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选择框背景色', usage: '选择器背景颜色 - 默认（组件消费）' },
  'select-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选择框背景色', usage: '选择器背景颜色 - 悬浮（组件消费）' },
  'select-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '选择框背景色', usage: '选择器背景颜色 - 按下态（对齐 Semi，组件消费）' },
  'select-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '选择框字号', usage: '选择器文字字号（组件消费）' },
  'select-dropdown-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '下拉背景色', usage: '选择器下拉浮层背景颜色（组件消费）' },
  'select-dropdown-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '下拉阴影', usage: '选择器下拉浮层阴影（组件消费）' },
  'select-dropdown-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '下拉圆角', usage: '选择器下拉浮层圆角（组件消费）' },
  'select-dropdown-z': { value: 'var(--cd-z-dropdown)', category: 'other', label: '下拉层级', usage: '选择器下拉浮层 z-index（组件消费）' },
  'select-option-padding': { value: 'var(--cd-spacing-tight) var(--cd-spacing-base-tight)', category: 'spacing', label: '选项内边距', usage: '选择器下拉选项内边距（组件消费）' },
  // 对齐 Semi：hover/focused 态 = fill-0；选中态背景 = transparent（仅靠对勾/主色区分）。
  'select-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选项背景色', usage: '选择器下拉选项背景颜色 - 悬浮/高亮（组件消费）' },
  'select-option-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项背景色', usage: '选择器下拉选项背景颜色 - 按下态（对齐 Semi，组件消费）' },
  'select-option-bg-selected': { value: 'transparent', category: 'color', label: '选中项背景色', usage: '选择器下拉选中项背景颜色（对齐 Semi transparent，组件消费）' },
  'select-option-color-selected': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中项文字色', usage: '选择器下拉选中项文字颜色（组件消费）' },
  // 对齐 Semi $color-select_option-icon-active: var(--semi-color-text-2)（灰色，非主色）。
  'select-option-check-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '选中对勾色', usage: '选择器下拉选中对勾颜色（组件消费）' },

  // —— Animation · 浮层进出场（对齐 Semi Select 的 Popover 实例 popover.scss zoomIn/zoomOut，
  // 非 Tooltip 自己的 zoomIn）——Semi 里 Popover 与 Tooltip 各自持有独立的 SCSS 变量命名空间，
  // 但 popover.scss 的 $motion-zoom_opacity-from/$motion-zoom_scale-from 直接复用 Tooltip
  // 那份定义（编译期常量，无运行时区别），duration/function 也是同一组值（100ms、
  // cubic-bezier(0.215, 0.61, 0.355, 1)），仅 token 命名空间不同。本库同理：Select 用独立
  // token 名（对齐 Semi 组件级 token 各自持有的惯例），值与 --cd-tooltip-* 系相同。
  'select-dropdown-motion-zoom-scale-from': { value: '0.8', category: 'animation', label: '浮层初始缩放', usage: '浮层进场初始缩放（组件消费）' },
  'select-dropdown-motion-zoom-opacity-from': { value: '0', category: 'animation', label: '浮层初始透明度', usage: '浮层进场初始透明度（组件消费）' },
  'select-dropdown-motion-zoom-opacity-to': { value: '1', category: 'animation', label: '浮层最终透明度', usage: '浮层进场最终透明度（组件消费）' },
  'animation-duration-select-dropdown-in': { value: '100ms', category: 'animation', label: '浮层弹出动画时长', usage: '选择器下拉浮层弹出动画持续时间（组件消费）' },
  'animation-function-select-dropdown-in': { value: 'cubic-bezier(0.215, 0.61, 0.355, 1)', category: 'animation', label: '浮层弹出动画曲线', usage: '选择器下拉浮层弹出动画插值函数（组件消费）' },
} satisfies TokenGroup;
