/**
 * Component tokens for Checkbox. 曾全量对齐 Semi Design（semi-foundation/checkbox/variables.scss
 * + animation.scss），现按 DSM「Token 精简原则」清理孤儿：仅保留组件实际消费的 token
 * 及其中间节点，删去组件未用的 Semi 状态态变量。带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾为 chenzy-design Checkbox/CheckboxGroup 实际消费的补充 token（Semi 无）。
 *
 * 注：Semi 的 var(--semi-color-white) 我们无对应 --cd-color-white alias，
 * 用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 */
import type { TokenGroup } from './token-def.js';

export const checkboxTokens = {
  // —— label / 文字 ——
  'spacing-checkbox-label-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文字与选框间距', usage: '文字与选框间距' },
  'color-checkbox-label-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字颜色', usage: '文字颜色' },

  // —— default（未选中态） ——
  'color-checkbox-default-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选框背景颜色', usage: '选框背景颜色 - 悬浮' },
  'color-checkbox-default-bg-default': { value: 'transparent', category: 'color', label: '选框背景色', usage: '复选框内部勾选框背景色 - 默认态' },
  'color-checkbox-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '选框描边颜色', usage: '复选框内部勾选框描边颜色 - 悬停态' },
  'color-checkbox-default-border-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '选框描边颜色', usage: '复选框内部勾选框描边颜色 - 默认态' },

  // —— checked（选中态） ——
  'color-checkbox-checked-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中态背景色', usage: '复选框选中态内部勾选框背景色 - 默认态' },
  'color-checkbox-checked-icon-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '对勾颜色', usage: '选框选中态对勾颜色 - 默认' },
  'color-checkbox-checked-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中态描边色', usage: '选框选中态描边颜色 - 默认' },

  // —— cardType（卡片形态） ——
  'color-checkbox-cardtype-checked-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中背景色', usage: '卡片类型复选框选中时的背景颜色 - 默认' },
  'color-checkbox-cardtype-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片背景色', usage: '卡片类型复选框选中时的背景颜色 - 悬浮' },
  'color-checkbox-cardtype-checked-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中边框色', usage: '卡片类型复选框选中时的边框颜色 - 默认' },

  // —— disabled（禁用态） ——
  'color-checkbox-cardtype-border-default': { value: 'transparent', category: 'color', label: '卡片默认边框色', usage: '卡片复选框默认边框颜色' },

  // —— extra（副标题） ——
  'color-checkbox-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '副标题文本色', usage: '复选框副标题文本颜色' },

  // —— 圆角 ——
  'radius-checkbox-cardtype': { value: '3px', category: 'radius', label: '卡片圆角', usage: '卡片类型复选框的圆角大小' },
  'radius-checkbox-inner': { value: 'var(--cd-border-radius-extra-small)', category: 'radius', label: '选框圆角', usage: '复选框内部勾选框圆角' },

  // —— 间距 ——
  'spacing-checkbox-extra-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '副标题顶内边距', usage: '复选框副标题顶部内边距' },
  'spacing-checkbox-cardtype-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片水平内间距', usage: '卡片类型复选框的水平内间距' },
  'spacing-checkbox-cardtype-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片垂直内间距', usage: '卡片类型复选框的垂直内间距' },
  'spacing-checkbox-group-vertical-item-marginbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直组项下间距', usage: '垂直复选框组底部外边距' },
  'spacing-checkbox-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平组右外边距', usage: '水平复选框组右侧外边距' },

  // —— animation（对齐 Semi checkbox/animation.scss；transition 占位归 animation，transform 归 other） ——
  'transition-duration-checkbox-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '背景过渡时长', usage: '复选框-背景色-动画持续时间' },
  'transition-function-checkbox-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '背景过渡曲线', usage: '复选框-背景色-过渡曲线' },
  'transition-delay-checkbox-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '背景过渡延迟', usage: '复选框-背景色-延迟时间' },
  'transition-duration-checkbox-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '边框过渡时长', usage: '复选框-边框-动画持续时间' },
  'transition-function-checkbox-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '边框过渡曲线', usage: '复选框-边框-过渡曲线' },
  'transition-delay-checkbox-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '边框过渡延迟', usage: '复选框-边框-延迟时间' },

  // —— chenzy-design Checkbox/CheckboxGroup 实际消费的补充 token（Semi 无；组件消费） ——
  'checkbox-size-default': { value: '16px', category: 'width', label: '勾选框边长', usage: '勾选框边长 - 默认（组件消费）' },
  'checkbox-size-small': { value: '14px', category: 'width', label: '勾选框边长', usage: '勾选框边长 - 小尺寸（组件消费）' },
  'checkbox-size-large': { value: '18px', category: 'width', label: '勾选框边长', usage: '勾选框边长 - 大尺寸（组件消费）' },
  'checkbox-radius': { value: 'var(--cd-radius-checkbox-inner)', category: 'radius', label: '框圆角', usage: '勾选框圆角（组件消费）' },
  'checkbox-border': { value: 'var(--cd-color-checkbox-default-border-default)', category: 'color', label: '未选边框色', usage: '勾选框未选中描边（组件消费）' },
  'checkbox-border-hover': { value: 'var(--cd-color-checkbox-default-border-hover)', category: 'color', label: '悬浮边框色', usage: '勾选框悬浮描边（组件消费）' },
  'checkbox-bg': { value: 'var(--cd-color-checkbox-default-bg-default)', category: 'color', label: '未选背景色', usage: '勾选框未选中背景（组件消费）' },
  'checkbox-bg-hover': { value: 'var(--cd-color-checkbox-default-bg-hover)', category: 'color', label: '悬浮背景色', usage: '勾选框悬浮背景（组件消费）' },
  'checkbox-bg-checked': { value: 'var(--cd-color-checkbox-checked-bg-default)', category: 'color', label: '选中背景色', usage: '勾选框选中背景（组件消费）' },
  'checkbox-border-checked': { value: 'var(--cd-color-checkbox-checked-border-default)', category: 'color', label: '选中边框色', usage: '勾选框选中描边（组件消费）' },
  'checkbox-mark-color': { value: 'var(--cd-color-checkbox-checked-icon-default)', category: 'color', label: '对勾颜色', usage: '勾选框对勾颜色（组件消费）' },
  'checkbox-label-gap': { value: 'var(--cd-spacing-checkbox-label-paddingleft)', category: 'spacing', label: '文字与选框间距', usage: '文字与勾选框间距（组件消费）' },
  // card / pureCard 形态
  'checkbox-card-padding': { value: 'var(--cd-spacing-checkbox-cardtype-paddingy) var(--cd-spacing-checkbox-cardtype-paddingx)', category: 'spacing', label: '卡片内边距', usage: '卡片形态内边距（组件消费）' },
  'checkbox-card-radius': { value: 'var(--cd-radius-checkbox-cardtype)', category: 'radius', label: '卡片圆角', usage: '卡片形态圆角（组件消费）' },
  'checkbox-card-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '卡片背景色', usage: '卡片形态默认背景（组件消费）' },
  'checkbox-card-bg-hover': { value: 'var(--cd-color-checkbox-cardtype-bg-hover)', category: 'color', label: '卡片悬浮背景色', usage: '卡片形态悬浮背景（组件消费）' },
  'checkbox-card-bg-checked': { value: 'var(--cd-color-checkbox-cardtype-checked-bg)', category: 'color', label: '卡片选中背景色', usage: '卡片形态选中背景（组件消费）' },
  'checkbox-card-border': { value: 'var(--cd-color-checkbox-cardtype-border-default)', category: 'color', label: '卡片边框色', usage: '卡片形态默认边框（组件消费）' },
  'checkbox-card-border-checked': { value: 'var(--cd-color-checkbox-cardtype-checked-border-default)', category: 'color', label: '卡片选中边框色', usage: '卡片形态选中边框（组件消费）' },
} satisfies TokenGroup;
