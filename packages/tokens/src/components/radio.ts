/**
 * Component tokens for Radio. 曾全量对齐 Semi Design（semi-foundation/radio/variables.scss），
 * 现按 DSM「Token 精简原则」清理孤儿：仅保留 chenzy-design Radio/RadioGroup 实际消费的
 * token 及其被消费 token 引用的中间节点，删去组件未用的 Semi 状态态变量。
 * 带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量 / calc()。
 * 末尾为 chenzy-design Radio/RadioGroup 实际消费的补充 token（Semi 无或命名不同）。
 *
 * Semi 映射规则：
 *   $color-radio_xxx → color-radio-xxx；var(--semi-color-*) → var(--cd-color-*)。
 *   $border-thickness-control → var(--cd-border-thickness-control)。
 *   $width-icon-medium → var(--cd-width-icon-medium)；$spacing-* → var(--cd-spacing-*)。
 *   var(--semi-border-radius-*) → var(--cd-border-radius-*)；$font-size-* → var(--cd-font-size-*)；
 *   $font-weight-bold → var(--cd-font-weight-bold)。calc/嵌套忠实翻译成 CSS calc()。
 */
import type { TokenGroup } from './token-def.js';

export const radioTokens = {
  // —— 基础单选圆圈（default / checked / primary / disabled） ——
  'color-radio-default-border-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 默认态' },
  'color-radio-default-bg-default': { value: 'transparent', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 默认态' },
  'color-radio-default-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 悬浮态' },
  'color-radio-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 悬浮态' },

  'color-radio-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '选项文本颜色' },
  'color-radio-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助文本色', usage: '辅助文本颜色' },

  'color-radio-primary-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 默认态' },
  'color-radio-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 默认态' },
  'color-radio-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中悬浮背景色', usage: '选中状态单选圆圈背景颜色 - 悬浮态' },
  'color-radio-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中按下背景色', usage: '选中状态单选圆圈背景颜色 - 按下态' },
  'color-radio-primary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '中心圆点色', usage: '选中状态单选圆圈中心圆点颜色' },

  // —— buttonRadio（按钮样式单选） ——
  'color-radio-buttonradio-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '按钮文本色', usage: '按钮样式单选文本颜色' },
  'color-radio-buttonradio-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮背景色', usage: '按钮样式单选背景颜色' },

  // —— cardRadioGroup（卡片样式单选） ——
  'color-radio-cardradiogroup-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中描边色', usage: '卡片样式单选选中态描边颜色' },

  // —— 圆角 ——
  'radius-radio-cardradiogroup': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '卡片圆角', usage: '卡片式单选圆角大小' },
  'radius-radio-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮式单选圆角大小' },

  // —— 间距（addon / extra / content） ——
  'spacing-radio-addon-buttonradio-middle-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中按钮水平内距', usage: '中尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-content-rowgap': { value: '4px', category: 'spacing', label: '内容行间距', usage: '内容行间距' },

  // —— 间距（group / buttonRadioGroup / cardRadioGroup） ——
  'spacing-radio-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '组右外边距', usage: '水平单选框组右侧外边距' },
  'spacing-radio-cardradiogroup-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组水平内距', usage: '卡片式单选组水平内边距' },
  'spacing-radio-cardradiogroup-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片组垂直内距', usage: '卡片式单选组垂直内边距' },

  // —— chenzy-design Radio/RadioGroup 实际消费的补充 token（Semi 无或命名不同；组件消费） ——
  // 圆圈尺寸三档（Semi 无独立尺寸档 token，组件保留）
  'radio-size-default': { value: '16px', category: 'width', label: '圆圈边长', usage: '单选圆圈边长 - 默认（组件消费）' },
  'radio-size-small': { value: '14px', category: 'width', label: '圆圈边长', usage: '单选圆圈边长 - 小尺寸（组件消费）' },
  'radio-size-large': { value: '18px', category: 'width', label: '圆圈边长', usage: '单选圆圈边长 - 大尺寸（组件消费）' },
  // 圆圈颜色（映射到对齐 Semi 的语义 token）
  'radio-border': { value: 'var(--cd-color-radio-default-border-default)', category: 'color', label: '圆圈描边色', usage: '单选圆圈默认描边（组件消费）' },
  'radio-border-hover': { value: 'var(--cd-color-radio-default-border-hover)', category: 'color', label: '圆圈悬浮描边色', usage: '单选圆圈悬浮描边（组件消费）' },
  'radio-bg': { value: 'var(--cd-color-radio-default-bg-default)', category: 'color', label: '圆圈背景色', usage: '单选圆圈默认背景（组件消费）' },
  'radio-bg-hover': { value: 'var(--cd-color-radio-default-bg-hover)', category: 'color', label: '圆圈悬浮背景色', usage: '单选圆圈悬浮背景（组件消费）' },
  'radio-color-checked': { value: 'var(--cd-color-radio-primary-border-default)', category: 'color', label: '选中主色', usage: '选中态圆圈描边 / 中心圆点主色（组件消费）' },
  'radio-bg-checked': { value: 'var(--cd-color-radio-primary-bg-default)', category: 'color', label: '选中背景色', usage: '选中态圆圈填充背景（品牌色实心，对齐 Semi；组件消费）' },
  'radio-bg-checked-hover': { value: 'var(--cd-color-radio-primary-bg-hover)', category: 'color', label: '选中悬浮背景色', usage: '选中态圆圈悬浮填充背景（组件消费）' },
  'radio-bg-checked-active': { value: 'var(--cd-color-radio-primary-bg-active)', category: 'color', label: '选中按下背景色', usage: '选中态圆圈按下填充背景（组件消费）' },
  'radio-dot-color': { value: 'var(--cd-color-radio-primary-text-default)', category: 'color', label: '中心圆点色', usage: '选中态中心圆点颜色（白色实心点，对齐 Semi；组件消费）' },
  'radio-color-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警示态色', usage: '校验警示态描边色（组件消费）' },
  'radio-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误态色', usage: '校验错误态描边色（组件消费）' },
  // 文字间距 / focus
  'radio-label-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文字与圆圈间距', usage: '文字与单选圆圈间距（组件消费）' },
  // button 型分段按钮高度（三档，Semi 无高度档 token，组件保留）
  'radio-button-height': { value: 'var(--cd-control-height-default, 32px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - 默认（组件消费）' },
  'radio-button-height-small': { value: 'var(--cd-control-height-small, 24px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - 小尺寸（组件消费）' },
  'radio-button-height-large': { value: 'var(--cd-control-height-large, 40px)', category: 'height', label: '按钮高度', usage: 'button 型高度 - 大尺寸（组件消费）' },
  // card 型圆角与选中边框
  'radio-card-radius': { value: 'var(--cd-radius-radio-cardradiogroup)', category: 'radius', label: '卡片圆角', usage: 'card 型圆角（组件消费）' },
  'radio-card-border-checked': { value: 'var(--cd-color-radio-cardradiogroup-border-active)', category: 'color', label: '卡片选中边框色', usage: 'card 型选中边框（组件消费）' },
} satisfies TokenGroup;
