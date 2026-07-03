/**
 * Component tokens for Radio. 全量对齐 Semi Design（semi-foundation/radio/variables.scss
 * 96 个变量：basic radio + buttonRadio（按钮组样式）+ cardRadioGroup（卡片样式）三种），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量 / calc()。
 * 末尾保留 chenzy-design Radio/RadioGroup 实际消费的补充 token（Semi 无或命名不同）。
 *
 * Semi 映射规则：
 *   $color-radio_xxx → color-radio-xxx；var(--semi-color-*) → var(--cd-color-*)。
 *   rgba(var(--semi-white), 1)（= #fff）我们无 --cd-color-white alias，
 *   用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
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
  'color-radio-default-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 按下态' },
  'color-radio-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 悬浮态' },
  'color-radio-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 悬浮态' },
  'color-radio-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 按下态' },

  'color-radio-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '选项文本颜色' },
  'color-radio-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助文本色', usage: '辅助文本颜色' },

  'color-radio-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 悬浮态' },
  'color-radio-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 按下态' },
  'color-radio-primary-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 默认态' },
  'color-radio-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 默认态' },
  'color-radio-primary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '中心圆点色', usage: '选中状态单选圆圈中心圆点颜色' },

  'color-radio-checked-bg-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用背景色', usage: '选中状态单选圆圈背景颜色 - 禁用态' },
  'color-radio-default-border-disabled': { value: 'var(--cd-color-border)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 禁用态' },
  'color-radio-checked-border-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用描边色', usage: '选中状态单选圆圈描边颜色 - 禁用态' },

  'color-radio-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '单选圆圈背景颜色 - 禁用态' },
  'color-radio-disabled-bg-hover': { value: 'transparent', category: 'color', label: '禁用背景色', usage: '单选圆圈背景颜色 - 禁用悬浮态' },
  'color-radio-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '禁用态文本颜色' },
  'color-radio-disabled-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用描边色', usage: '单选圆圈描边颜色 - 禁用态' },
  'color-radio-checked-icon-disabled': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '禁用圆点色', usage: '选中且禁用状态下中心圆点颜色' },

  // —— buttonRadio（按钮样式单选） ——
  'color-radio-buttonradio-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '按钮文本色', usage: '按钮样式单选文本颜色' },
  'color-radio-buttonradio-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮背景色', usage: '按钮样式单选背景颜色' },
  'color-radio-buttonradio-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '按钮禁用文本色', usage: '按钮样式单选禁用态文本颜色' },
  'color-radio-addon-buttonradio-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '按钮悬浮背景色', usage: '按钮样式单选悬浮态背景色' },
  'color-radio-addon-buttonradio-text-checked': { value: 'var(--cd-color-primary)', category: 'color', label: '按钮选中文本色', usage: '按钮样式单选选中项文字颜色' },
  'color-radio-addon-buttonradio-bg-checked': { value: 'var(--cd-color-bg-3)', category: 'color', label: '按钮选中背景色', usage: '按钮样式单选选中项背景颜色' },

  // —— cardRadioGroup（卡片样式单选） ——
  'color-radio-cardradiogroup-bg-default': { value: 'transparent', category: 'color', label: '卡片背景色', usage: '卡片样式单选默认背景色' },
  'color-radio-cardradiogroup-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中背景色', usage: '卡片样式单选选中态背景色' },
  'color-radio-cardradiogroup-disabled-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中禁用背景色', usage: '卡片样式单选选中且禁用时的背景色' },
  'color-radio-cardradiogroup-disabled-bg-active': { value: 'transparent', category: 'color', label: '卡片禁用背景色', usage: '卡片样式单选禁用时的背景色 - 按下态' },
  'color-radio-cardradiogroup-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片悬浮背景色', usage: '卡片样式单选悬浮态背景色' },
  'color-radio-cardradiogroup-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片按下背景色', usage: '卡片样式单选按下态背景色' },
  'color-radio-cardradiogroup-border-default': { value: 'transparent', category: 'color', label: '卡片描边色', usage: '卡片样式单选默认描边颜色' },
  'color-radio-cardradiogroup-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中描边色', usage: '卡片样式单选选中态描边颜色' },
  'color-radio-cardradiogroup-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '卡片选中描边色', usage: '卡片样式单选选中态描边颜色 - 按下态' },
  'color-radio-cardradiogroup-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '卡片选中描边色', usage: '卡片样式单选选中态描边颜色 - 悬浮态' },
  'color-radio-cardradiogroup-border-disabled-active': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片禁用描边色', usage: '卡片样式单选选中且禁用时的描边颜色' },
  'color-radio-cardradiogroup-addon-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文本色', usage: '卡片样式单选标题文字颜色' },
  'color-radio-cardradiogroup-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片辅助文本色', usage: '卡片样式单选辅助文字颜色' },
  'color-radio-cardradiogroup-checked-disabled-border-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用描边色', usage: '卡片样式选中项禁用态描边颜色 - 默认态' },
  'color-radio-cardradiogroup-checked-disabled-border-hover': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用描边色', usage: '卡片样式选中项禁用态描边颜色 - 悬浮态' },
  'color-radio-card-bg-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片圆圈背景色', usage: '卡片模式下单选圆圈背景颜色 - 悬浮态' },
  'color-radio-card-bg-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片圆圈背景色', usage: '卡片模式下单选圆圈背景颜色 - 按下态' },
  'color-radio-card-bg-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '卡片圆圈背景色', usage: '卡片模式下单选圆圈背景颜色 - 默认态' },

  'color-radio-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '轮廓颜色 - 按键聚焦' },

  // —— 圆角 ——
  'radius-radio-cardradiogroup': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '卡片圆角', usage: '卡片式单选圆角大小' },
  'radius-radio-addon-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆点圆角', usage: '按钮式单选圆点圆角大小' },
  'radius-radio-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮式单选圆角大小' },

  // —— 描边宽度 / 轮廓 ——
  'width-radio-cardradiogroup-checked-border': { value: '1px', category: 'width', label: '卡片描边宽度', usage: '卡片式单选描边宽度' },
  'width-radio-cardradiogroup-checked-disabled-border': { value: '1px', category: 'width', label: '卡片禁用描边宽度', usage: '卡片式单选选中且禁用时的描边宽度' },
  'width-radio-hover-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '悬浮描边宽度', usage: '描边宽度 - 悬浮态' },
  'width-radio-disabled-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '禁用描边宽度', usage: '描边宽度 - 禁用态' },
  'width-radio-innder-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '内圈描边宽度', usage: '描边宽度 - 禁用态' },
  'width-radio-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: '单选框轮廓宽度' },

  // —— 尺寸 ——
  'height-radio-inner-min': { value: '20px', category: 'height', label: '单选按钮高度', usage: '单选按钮高度' },
  'width-radio-inner': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '单选按钮宽度', usage: '单选按钮宽度' },

  // —— 间距（addon / extra / content） ——
  'spacing-radio-addon-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题左内边距', usage: '单选标题到单选按钮左侧边距' },
  'spacing-radio-addon-marginleft': { value: 'var(--cd-width-icon-medium)', category: 'spacing', label: '标题左外边距', usage: '单选标题左侧整体外边距' },
  'spacing-radio-addon-buttonradio-large-paddingx': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '大按钮水平内距', usage: '大尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-large-paddingy': { value: 'calc(var(--cd-spacing-base-tight) * 0.5)', category: 'spacing', label: '大按钮垂直内距', usage: '大尺寸按钮式单选按钮垂直内边距' },
  'spacing-radio-addon-buttonradio-small-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '小按钮水平内距', usage: '小尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-small-paddingy': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮垂直内距', usage: '中尺寸按钮式单选按钮垂直内边距' },
  'spacing-radio-addon-buttonradio-middle-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中按钮水平内距', usage: '中尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-middle-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中按钮垂直内距', usage: '中尺寸按钮式单选按钮垂直内边距' },
  'spacing-radio-addon-buttonradio-marginleft': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '按钮左外边距', usage: '按钮式单选按钮左侧外边距' },
  'spacing-radio-extra-paddingleft': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight))', category: 'spacing', label: '副标题左内距', usage: '单选副标题左侧内边距' },
  'spacing-radio-content-rowgap': { value: '4px', category: 'spacing', label: '内容行间距', usage: '内容行间距' },

  // —— 间距（group / buttonRadioGroup / cardRadioGroup） ——
  'spacing-radio-group-vertical-marginbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '组下外边距', usage: '垂直布局单选框组底部外边距' },
  'spacing-radio-card-group-vertical-marginbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组下外边距', usage: '垂直布局卡片式单选框组底部外边距' },
  'spacing-radio-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '组右外边距', usage: '水平单选框组右侧外边距' },
  'spacing-radio-buttonradio-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '按钮内边距', usage: '按钮式单选内边距' },
  'spacing-radio-buttonradiogroup-small-paddingx': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮组水平内距', usage: '小尺寸按钮式单选组水平内边距' },
  'spacing-radio-buttonradiogroup-small-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小按钮组垂直内距', usage: '小尺寸按钮式单选组垂直内边距' },
  'spacing-radio-buttonradiogroup-middle-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中按钮组内距', usage: '中尺寸按钮式单选组内边距' },
  'spacing-radio-buttonradiogroup-large-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '大按钮组内距', usage: '大尺寸按钮式单选组内边距' },
  'spacing-radio-buttonradiogroup-paddingright': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '按钮组右内距', usage: '中尺寸按钮式单选组右侧内边距' },
  'spacing-radio-cardradiogroup-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组水平内距', usage: '卡片式单选组水平内边距' },
  'spacing-radio-cardradiogroup-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片组垂直内距', usage: '卡片式单选组垂直内边距' },
  'spacing-radio-cardradiogroup-inner-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片圆圈右外距', usage: '卡片式单选按钮右侧外边距' },

  // —— 字体（buttonRadio / cardRadioGroup） ——
  'font-radio-buttonradio-large-default-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '大按钮字号', usage: '大尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-small-default-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '小按钮字号', usage: '中尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-middle-default-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '中按钮字号', usage: '小尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-default-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重', usage: '按钮式单选标题字重 - 默认态' },
  'font-radio-buttonradio-hover-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重', usage: '按钮式单选标题字重 - 悬浮态' },
  'font-radio-buttonradio-checked-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重', usage: '按钮式单选标题字重 - 选中态' },
  'font-radio-buttonradiogroup-small-lineheight': { value: '16px', category: 'font', label: '小按钮行高', usage: '小尺寸按钮式单选标题行高' },
  'font-radio-buttonradiogroup-middle-lineheight': { value: '16px', category: 'font', label: '中按钮行高', usage: '中尺寸按钮式单选标题行高' },
  'font-radio-buttonradiogroup-large-lineheight': { value: '20px', category: 'font', label: '大按钮行高', usage: '大尺寸按钮式单选标题行高' },
  'font-radio-cardradiogroup-addon-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片标题字号', usage: '卡片式单选组标题字体大小' },
  'font-radio-cardradiogroup-addon-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '卡片标题字重', usage: '卡片式单选组标题字重' },
  'font-radio-cardradiogroup-addon-lineheight': { value: '20px', category: 'font', label: '卡片标题行高', usage: '卡片式单选组标题行高' },
  'font-radio-cardradiogroup-extra-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片副标题字号', usage: '卡片式单选组副标题字体大小' },
  'font-radio-cardradiogroup-extra-fontweight': { value: 'normal', category: 'font', label: '卡片副标题字重', usage: '卡片式单选组副标题字重' },
  'font-radio-cardradiogroup-extra-lineheight': { value: '20px', category: 'font', label: '卡片副标题行高', usage: '卡片式单选组副标题行高' },

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
  'radio-dot-color': { value: 'var(--cd-color-radio-primary-text-default)', category: 'color', label: '中心圆点色', usage: '选中态中心圆点颜色（组件消费）' },
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
