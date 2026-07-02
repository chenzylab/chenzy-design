/**
 * Component tokens for Checkbox. 全量对齐 Semi Design（semi-foundation/checkbox/variables.scss
 * 61 个 + animation.scss 7 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Checkbox/CheckboxGroup 实际消费的补充 token（Semi 无）。
 *
 * 注：Semi 的 var(--semi-color-white) 我们无对应 --cd-color-white alias，
 * 用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 */
import type { TokenGroup } from './token-def.js';

export const checkboxTokens = {
  // —— label / 文字 ——
  'spacing-checkbox-label-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文字与选框间距', usage: '文字与选框间距' },
  'color-checkbox-label-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字颜色', usage: '文字颜色' },
  'font-checkbox-label-lineheight': { value: '20px', category: 'font', label: '文字行高', usage: '文字行高' },
  'color-checkbox-label-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字颜色', usage: '禁用文字颜色' },

  // —— default（未选中态） ——
  'color-checkbox-default-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选框背景颜色', usage: '选框背景颜色 - 悬浮' },
  'color-checkbox-default-bg-default': { value: 'transparent', category: 'color', label: '选框背景色', usage: '复选框内部勾选框背景色 - 默认态' },
  'color-checkbox-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '选框描边颜色', usage: '复选框内部勾选框描边颜色 - 悬停态' },
  'color-checkbox-default-border-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '选框描边颜色', usage: '复选框内部勾选框描边颜色 - 默认态' },
  'color-checkbox-default-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选框背景颜色', usage: '选框未选中态背景颜色 - 按下' },

  // —— checked（选中态） ——
  'color-checkbox-checked-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中态背景色', usage: '复选框选中态内部勾选框背景色 - 默认态' },
  'color-checkbox-checked-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中态背景色', usage: '选框选中态背景颜色 - 悬浮' },
  'color-checkbox-checked-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中态背景色', usage: '选框选中态背景颜色 - 按下' },
  'color-checkbox-checked-icon-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '对勾颜色', usage: '选框选中态对勾颜色 - 默认' },
  'color-checkbox-checked-icon-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '对勾颜色', usage: '选框选中态对勾颜色 - 悬浮' },
  'color-checkbox-checked-icon-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '对勾颜色', usage: '选框选中态对勾颜色 - 按下' },
  'color-checkbox-checked-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中态描边色', usage: '选框选中态描边颜色 - 默认' },
  'color-checkbox-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中态描边色', usage: '选框选中态描边颜色 - 悬浮' },
  'color-checkbox-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中态描边色', usage: '选框选中态描边颜色 - 按下' },

  // —— cardType（卡片形态） ——
  'color-checkbox-cardtype-checked-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中背景色', usage: '卡片类型复选框选中时的背景颜色 - 默认' },
  'color-checkbox-cardtype-checked-disabled-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中禁用背景色', usage: '卡片类型复选框选中且禁用时的背景颜色 - 默认' },
  'color-checkbox-cardtype-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片背景色', usage: '卡片类型复选框选中时的背景颜色 - 悬浮' },
  'color-checkbox-cardtype-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片背景色', usage: '卡片类型复选框选中时的背景颜色 - 按下' },
  'color-checkbox-cardtype-checked-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中边框色', usage: '卡片类型复选框选中时的边框颜色 - 默认' },
  'color-checkbox-cardtype-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '卡片选中边框色', usage: '卡片类型复选框选中时的边框颜色 - 悬浮' },
  'color-checkbox-cardtype-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '卡片选中边框色', usage: '卡片类型复选框选中时的边框颜色 - 按下' },
  'color-checkbox-cardtype-checked-disabled-border-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用边框色', usage: '卡片类型复选框选中且禁用时的边框颜色 - 默认' },
  'color-checkbox-cardtype-addon-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文本色', usage: '卡片类型复选框标题文本颜色 - 默认' },
  'color-checkbox-cardtype-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片副标题文本色', usage: '卡片复选框副标题文本颜色 - 默认' },
  'color-checkbox-cardtype-inner-bg-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片选框背景色', usage: '卡片复选框内部勾选框背景色 - 悬浮' },
  'color-checkbox-cardtype-inner-bg-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片选框背景色', usage: '卡片复选框内部勾选框背景色 - 按下' },
  'color-checkbox-cardtype-inner-bg-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片选框背景色', usage: '卡片复选框内部勾选框背景色 - 默认' },

  // —— disabled（禁用态） ——
  'color-checkbox-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '选框禁用态背景颜色 - 默认' },
  'color-checkbox-disabled-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用描边色', usage: '选框禁用态描边颜色 - 默认' },
  'color-checkbox-checked-bg-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用背景色', usage: '选框选中 + 禁用态背景颜色' },
  'color-checkbox-checked-icon-disabled': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '禁用对勾颜色', usage: '选框禁用态对勾颜色' },
  'color-checkbox-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '复选框轮廓-聚焦颜色' },
  'color-checkbox-cardtype-border-default': { value: 'transparent', category: 'color', label: '卡片默认边框色', usage: '卡片复选框默认边框颜色' },

  // —— extra（副标题） ——
  'color-checkbox-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '副标题文本色', usage: '复选框副标题文本颜色' },

  // —— 尺寸 / 描边宽度 ——
  'size-checkbox-inner-shadow': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '选框内描边宽度', usage: '选框内描边宽度' },
  'width-checkbox-inner': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '选框对勾宽度', usage: '选框对勾 icon 宽度' },
  'height-checkbox-inner': { value: '20px', category: 'height', label: '选框对勾高度', usage: '选框对勾 icon 高度' },
  'width-checkbox-cardtype-checked-border': { value: '1px', category: 'width', label: '卡片边框宽度', usage: '卡片类型复选框的边框宽度' },
  'width-checkbox-cardtype-checked-disabled-border': { value: '1px', category: 'width', label: '卡片选中禁用边框宽度', usage: '卡片类型复选框选中且禁用的边框宽度' },
  'width-checkbox-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: '复选框轮廓宽度' },

  // —— 圆角 ——
  'radius-checkbox-cardtype': { value: '3px', category: 'radius', label: '卡片圆角', usage: '卡片类型复选框的圆角大小' },
  'radius-checkbox-inner': { value: 'var(--cd-border-radius-extra-small)', category: 'radius', label: '选框圆角', usage: '复选框内部勾选框圆角' },

  // —— 间距 ——
  'spacing-checkbox-extra-paddingleft': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight))', category: 'spacing', label: '副标题左内边距', usage: '复选框副标题左侧内边距' },
  'spacing-checkbox-extra-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '副标题顶内边距', usage: '复选框副标题顶部内边距' },
  'spacing-checkbox-cardtype-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片水平内间距', usage: '卡片类型复选框的水平内间距' },
  'spacing-checkbox-cardtype-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片垂直内间距', usage: '卡片类型复选框的垂直内间距' },
  'spacing-checkbox-cardtype-inner-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片选框右外边距', usage: '卡片类型复选框 inner 的右外边距' },
  'spacing-checkbox-card-group-vertical-marginbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组下间距', usage: '卡片样式复选框的下间距' },
  'spacing-checkbox-group-vertical-marginbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '垂直组下间距', usage: '垂直复选框组底部外边距' },
  'spacing-checkbox-group-vertical-item-marginbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直组项下间距', usage: '垂直复选框组底部外边距' },
  'spacing-checkbox-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平组右外边距', usage: '水平复选框组右侧外边距' },

  // —— cardType 文字 ——
  'font-checkbox-cardtype-addon-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片标题字号', usage: '卡片类型复选框标题文本大小' },
  'font-checkbox-cardtype-addon-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '卡片标题字重', usage: '卡片类型复选框的标题的 fontWeight' },
  'font-checkbox-cardtype-addon-lineheight': { value: '20px', category: 'font', label: '卡片标题行高', usage: '卡片类型复选框的标题的文字行高' },
  'font-checkbox-cardtype-extra-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片副标题字号', usage: '卡片类型复选框的副标题的文字大小' },
  'font-checkbox-cardtype-extra-fontweight': { value: 'normal', category: 'font', label: '卡片副标题字重', usage: '卡片类型复选框的副标题的 fontWeight' },
  'font-checkbox-cardtype-extra-lineheight': { value: '20px', category: 'font', label: '卡片副标题行高', usage: '卡片类型复选框的副标题的文字行高' },

  // —— animation（对齐 Semi checkbox/animation.scss；transition 占位归 animation，transform 归 other） ——
  'transition-duration-checkbox-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '背景过渡时长', usage: '复选框-背景色-动画持续时间' },
  'transition-function-checkbox-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '背景过渡曲线', usage: '复选框-背景色-过渡曲线' },
  'transition-delay-checkbox-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '背景过渡延迟', usage: '复选框-背景色-延迟时间' },
  'transition-duration-checkbox-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '边框过渡时长', usage: '复选框-边框-动画持续时间' },
  'transition-function-checkbox-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '边框过渡曲线', usage: '复选框-边框-过渡曲线' },
  'transition-delay-checkbox-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '边框过渡延迟', usage: '复选框-边框-延迟时间' },
  'transform-scale-checkbox': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '复选框放大', usage: '复选框-放大' },

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
