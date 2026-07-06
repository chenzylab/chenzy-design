/**
 * Component tokens for Input. 全量对齐 Semi Design（semi-foundation/input/variables.scss
 * 87 个 + animation.scss 10 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design 组件实际消费的补充 token（Input/TextArea/Select 等共用）。
 */
import type { TokenGroup } from './token-def.js';

export const inputTokens = {
  // —— default ——
  'color-input-default-border-default': { value: 'transparent', category: 'color', label: '输入框描边色', usage: '输入框描边颜色 - 默认' },
  'color-input-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 默认' },
  'color-input-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '输入框文本色', usage: '输入框文本颜色 - 默认' },
  'color-input-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 悬浮' },
  'color-input-default-border-hover': { value: 'transparent', category: 'color', label: '输入框描边色', usage: '输入框描边颜色 - 悬浮' },
  'color-input-default-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 按下' },
  'color-input-default-border-active': { value: 'var(--cd-color-input-default-bg-active)', category: 'color', label: '输入框描边色', usage: '输入框描边颜色 - 按下' },
  'color-input-default-bg-focus': { value: 'var(--cd-color-fill-0)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 选中' },
  'color-input-default-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '输入框描边色', usage: '输入框描边颜色 - 选中' },
  'color-input-icon-outline': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '图标轮廓色', usage: '输入框 icon outline 颜色' },
  'color-input-default-bg-focus-hover': { value: 'var(--cd-color-input-default-bg-focus)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 选中悬浮' },

  // —— error ——
  'color-input-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误输入框背景色', usage: '错误输入框背景颜色 - 默认' },
  'color-input-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误输入框描边色', usage: '错误输入框描边颜色 - 默认' },
  'color-input-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误输入框背景色', usage: '错误输入框背景颜色 - 悬浮' },
  'color-input-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误输入框描边色', usage: '错误输入框描边颜色 - 悬浮' },
  'color-input-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误输入框背景色', usage: '错误输入框背景颜色 - 选中' },
  'color-input-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '错误输入框描边色', usage: '错误输入框描边颜色 - 选中' },
  'color-input-danger-bg-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误输入框背景色', usage: '错误输入框背景颜色 - 按下' },
  'color-input-danger-border-active': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '错误输入框描边色', usage: '错误输入框描边颜色 - 按下' },

  // —— warning ——
  'color-input-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告输入框背景色', usage: '警告输入框背景颜色 - 默认' },
  'color-input-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告输入框描边色', usage: '警告输入框文本颜色 - 默认' },
  'color-input-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告输入框背景色', usage: '警告输入框背景颜色 - 悬浮' },
  'color-input-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告输入框描边色', usage: '警告输入框描边颜色 - 悬浮' },
  'color-input-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告输入框背景色', usage: '警告输入框背景颜色 - 选中' },
  'color-input-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告输入框描边色', usage: '警告输入框描边颜色 - 选中' },
  'color-input-warning-bg-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告输入框背景色', usage: '警告输入框背景颜色 - 按下' },
  'color-input-warning-border-active': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告输入框描边色', usage: '警告输入框描边颜色 - 按下' },

  // —— disabled ——
  'color-input-disabled-border-default': { value: 'var(--cd-color-disabled-border)', category: 'color', label: '禁用输入框描边色', usage: '禁用输入框描边颜色' },
  'color-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用输入框背景色', usage: '禁用输入框背景颜色' },
  'color-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用输入框文字色', usage: '禁用输入框文字颜色' },

  // —— placeholder / prefix / icon ——
  'color-input-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '占位文字色', usage: '输入框占位文字颜色' },
  'color-input-prefix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 文字色', usage: '输入框 prefix 文字颜色' },
  'color-input-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '输入框图标颜色' },
  'color-input-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '图标色', usage: '输入框图标颜色 - 悬浮' },
  'color-input-icon-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '图标色', usage: '输入框图标颜色 - 按下' },

  // —— counter / group / border-only ——
  'color-input-counter-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '字数统计文字色', usage: '多行文本字数统计文字颜色 - 未超限' },
  'color-input-counter-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '字数统计超限色', usage: '多行文本字数统计文字颜色 - 未超限' },
  'color-input-group-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '输入框组合分割线色', usage: '输入框组合分割线颜色' },
  'color-input-default-border-only-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '描边输入框描边色', usage: '只有描边的输入框描边颜色 - 默认' },
  'color-input-default-border-only-border-hover': { value: 'var(--cd-color-border)', category: 'color', label: '描边输入框描边色', usage: '只有描边的输入框描边颜色 - 默认' },

  // —— height ——
  'height-input-large': { value: 'calc(var(--cd-control-height-large) - 2px)', category: 'height', label: '输入框内高', usage: '输入框高度 & 行高 - 大尺寸' },
  'height-input-small': { value: 'calc(var(--cd-control-height-small) - 2px)', category: 'height', label: '输入框内高', usage: '输入框高度 & 行高 - 小尺寸' },
  'height-input-default': { value: 'calc(var(--cd-control-height-default) - 2px)', category: 'height', label: '输入框内高', usage: '输入框高度 & 行高 - 默认尺寸' },
  'height-input-wrapper-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '输入框高度', usage: '输入框容器高度 - 大尺寸' },
  'height-input-wrapper-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '输入框高度', usage: '输入框容器高度 - 小尺寸' },
  'height-input-wrapper-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '输入框高度', usage: '输入框容器高度 - 默认尺寸' },

  // —— icon width ——
  'width-input-icon': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight) * 2)', category: 'width', label: '密码图标最小宽度', usage: '密码图标最小宽度' },
  'width-input-icon-clear-before-suffix': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight))', category: 'width', label: '清除按钮宽度', usage: 'suffix 之前的清除按钮宽度' },
  'width-input-icon-clear-before-modebtn': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '清除按钮宽度', usage: '密码之前的清除按钮宽度' },

  // —— motion scale（按压缩放系数，归 other 对齐 Semi）——
  'motion-scale-size-active': { value: '.97', category: 'other', label: '按压缩放系数', usage: '输入框按压缩放系数 - 激活' },
  'motion-scale-size-inactive': { value: '1', category: 'other', label: '按压缩放系数', usage: '输入框按压缩放系数 - 非激活' },

  // —— border width ——
  'width-input-append-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '后置标签描边宽度', usage: '后置标签描边宽度' },
  'width-input-prepend-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '前置标签描边宽度', usage: '前置标签描边宽度' },
  'width-input-group-pseudo-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '组合分割线宽度', usage: '输入框组合分割线宽度' },
  'width-input-wrapper-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '输入框描边宽度', usage: '输入框描边宽度' },
  'width-input-wrapper-focus-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '输入框描边宽度', usage: '输入框描边宽度 - 选中态' },
  'width-input-icon-outline': { value: '2px', category: 'width', label: '图标轮廓宽度', usage: '输入框 icon outline 宽度' },
  'width-input-icon-outlineoffset': { value: '-1px', category: 'width', label: '图标轮廓偏移', usage: '输入框 icon outline-offset 宽度' },

  // —— radius / spacing ——
  'radius-input-wrapper': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '输入框圆角', usage: '输入框圆角大小' },
  'spacing-input-icon-marginleft': { value: 'calc(-1 * var(--cd-spacing-base-tight))', category: 'spacing', label: '图标左侧边距', usage: '输入框图标左侧内边距' },
  'spacing-input-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '输入框左内边距', usage: '输入光标距离容器的左侧内边距' },
  'spacing-input-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '输入框右内边距', usage: '输入文字距离容器的右侧内边距' },
  'spacing-input-prefix-suffix-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'prefix/suffix 水平外边距', usage: 'prefix/suffix 水平外边距' },
  'spacing-input-prefix-icon-marginy': { value: '0', category: 'spacing', label: 'prefix 图标垂直边距', usage: 'prefix 图标垂直内边距' },
  'spacing-input-prefix-icon-marginx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'prefix 图标水平边距', usage: 'prefix 图标水平内边距' },
  'spacing-input-clearbtn-withsuffix-marginleft': { value: 'calc(-1 * var(--cd-spacing-base-tight))', category: 'spacing', label: '清空按钮左边距', usage: '清空按钮左侧内边距' },
  'spacing-input-prepend-paddingy': { value: '0', category: 'spacing', label: '前置标签垂直内边距', usage: '前置标签垂直内边距' },
  'spacing-input-prepend-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '前置标签水平内边距', usage: '前置标签水平内边距' },
  'spacing-input-group-withtoplabel-margintop': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '组合带标签上外边距', usage: '输入框组合带顶部标签时的上外边距' },
  'spacing-input-group-withtoplabel-marginbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '组合带标签下外边距', usage: '输入框组合带顶部标签时的下外边距' },
  'font-input-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'prefix/suffix 字重', usage: 'prefix/suffix 文字字重' },

  // —— textarea ——
  'spacing-textarea-paddingy': { value: '5px', category: 'spacing', label: '多行文本垂直内边距', usage: '多行文本垂直内边距' },
  'spacing-textarea-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '多行文本水平内边距', usage: '多行文本水平内边距' },
  'spacing-textarea-counter-paddingtop': { value: '3px', category: 'spacing', label: '字数统计上内边距', usage: '多行文本字数统计顶部内边距' },
  'spacing-textarea-counter-paddingright': { value: '12px', category: 'spacing', label: '字数统计右内边距', usage: '多行文本字数统计右侧内边距' },
  'spacing-textarea-counter-paddingbottom': { value: '5px', category: 'spacing', label: '字数统计下内边距', usage: '多行文本字数统计底部内边距' },
  'spacing-textarea-counter-paddingleft': { value: '12px', category: 'spacing', label: '字数统计左内边距', usage: '多行文本字数统计左侧内边距' },
  'width-textarea-border': { value: 'var(--cd-border-thickness)', category: 'width', label: '多行文本描边宽度', usage: '多行文本描边宽度' },
  'height-textarea-counter': { value: '24px', category: 'height', label: '字数统计最小高度', usage: '多行文本字数统计最小高度' },
  'color-textarea-border-default': { value: 'transparent', category: 'color', label: '多行文本描边色', usage: '多行文本描边颜色' },
  'color-textarea-border-hover': { value: 'var(--cd-color-textarea-border-default)', category: 'color', label: '多行文本描边色', usage: '多行文本描边颜色 - 悬浮' },
  'color-textarea-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '多行文本图标色', usage: '多行文本 clear 图标颜色' },
  'color-textarea-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '多行文本图标色', usage: '多行文本 clear 图标颜色 - 悬浮' },
  'width-textarea-icon': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight))', category: 'width', label: 'clear 图标最小宽度', usage: 'clear 图标最小宽度' },
  'height-textarea-default': { value: '32px', category: 'height', label: 'clear 图标高度', usage: '多行文本 clear 图标的高度' },
  'spacing-textarea-withshowclear-paddingright': { value: '36px', category: 'spacing', label: 'showClear 右内边距', usage: '多行文本设置 showClear 后的右内边距' },
  'spacing-textarea-icon-right': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'clear 图标右边距', usage: '多行文本 clear 图标的右边距' },

  // —— animation：过渡（bg/border/text × duration/function/delay，对齐 Semi animation.scss）——
  // 默认无动画（duration/delay=0ms），主题或 DSM 可单独开启过渡。
  'transition-duration-input-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '输入框背景过渡时长', usage: '输入框-背景色-动画持续时间' },
  'transition-function-input-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '输入框背景过渡曲线', usage: '输入框-背景色-过渡曲线' },
  'transition-delay-input-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '输入框背景过渡延迟', usage: '输入框-背景色-延迟时间' },
  'transition-duration-input-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '输入框边框过渡时长', usage: '输入框-边框-动画持续时间' },
  'transition-function-input-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '输入框边框过渡曲线', usage: '输入框-边框-过渡曲线' },
  'transition-delay-input-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '输入框边框过渡延迟', usage: '输入框-边框-延迟时间' },
  'transition-duration-input-text': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '输入框文字过渡时长', usage: '输入框-文字或图标-动画持续时间' },
  'transition-function-input-text': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '输入框文字过渡曲线', usage: '输入框-文字或图标-过渡曲线' },
  'transition-delay-input-text': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '输入框文字过渡延迟', usage: '输入框-文字或图标-延迟时间' },

  // —— other：按压放大（对齐 Semi transform token；归 other tab 对齐 Semi）——
  'transform-scale-input': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '输入框放大', usage: '输入框-变大' },

  // —— chenzy-design 组件实际消费的补充 token（Semi 无；Input/TextArea/Select/DatePicker 等共用）——
  'input-padding-x': { value: 'var(--cd-spacing-input-paddingleft)', category: 'spacing', label: '输入框水平内边距', usage: '输入框水平内边距（组件消费）' },
  'input-border': { value: 'var(--cd-color-input-default-border-default)', category: 'color', label: '输入框描边色', usage: '输入框描边颜色 - 默认（组件消费）' },
  'input-radius': { value: 'var(--cd-radius-input-wrapper)', category: 'radius', label: '输入框圆角', usage: '输入框圆角（组件消费）' },
  'input-color-bg': { value: 'var(--cd-color-input-default-bg-default)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 默认（组件消费）' },
  'input-bg-hover': { value: 'var(--cd-color-input-default-bg-hover)', category: 'color', label: '输入框背景色', usage: '输入框背景颜色 - 悬浮（组件消费）' },
  'input-color-text': { value: 'var(--cd-color-input-default-text-default)', category: 'color', label: '输入框文本色', usage: '输入框文本颜色（组件消费）' },
  'input-color-placeholder': { value: 'var(--cd-color-input-placeholder-text-default)', category: 'color', label: '占位文字色', usage: '输入框占位文字颜色（组件消费）' },
  'input-border-active': { value: 'var(--cd-color-input-default-border-focus)', category: 'color', label: '聚焦描边色', usage: '输入框描边颜色 - 聚焦（组件消费）' },
  'input-border-warning': { value: 'var(--cd-color-input-warning-border-focus)', category: 'color', label: '警告描边色', usage: '输入框描边颜色 - 警告（组件消费）' },
  'input-border-error': { value: 'var(--cd-color-input-danger-border-focus)', category: 'color', label: '错误描边色', usage: '输入框描边颜色 - 错误（组件消费）' },
  'input-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '输入框字号', usage: '输入框文字字号（组件消费）' },
  // InputNumber 步进器补充 token 已迁至 components/input-number.ts（组件消费，Semi inputNumber）。

  // —— InputGroup（组件消费；多控件拼接容器：相邻边框合并 + 首尾圆角 + 组标签间距） ——
  'inputgroup-border': { value: 'var(--cd-color-input-group-border-default)', category: 'color', label: '输入组分隔线色', usage: 'InputGroup 相邻控件分隔线颜色（组件消费）' },
  'inputgroup-radius': { value: 'var(--cd-radius-input-wrapper)', category: 'radius', label: '输入组圆角', usage: 'InputGroup 首尾圆角（组件消费）' },
  'inputgroup-label-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '输入组标签间距', usage: 'InputGroup 标签与控件的间距（组件消费）' },
} satisfies TokenGroup;
