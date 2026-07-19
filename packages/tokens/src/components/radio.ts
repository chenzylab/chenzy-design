/**
 * Component tokens for Radio. 严格对齐 Semi Design（semi-foundation/radio/variables.scss）。
 * 逐条镜像 Semi 的 $color/$spacing/$radius/$width/$font 变量：token 名与值一一对应，
 * 不再自造转发中间层短名（size-default / button-height 等已删）。公式值用 calc() 复刻。
 *
 * Semi → 本库 映射规则：
 *   $color-radio_xxx        → color-radio-xxx
 *   var(--semi-color-*)     → var(--cd-color-*)
 *   var(--semi-white)       → 用 var(--cd-color-white)（已等价 rgba(255,255,255,1)）
 *   $width-icon-medium      → var(--cd-width-icon-medium)
 *   $spacing-*              → var(--cd-spacing-*)
 *   $border-thickness-control → var(--cd-border-thickness-control)
 *   var(--semi-border-radius-*) → var(--cd-border-radius-*)
 *   $font-size-* / $font-weight-* → var(--cd-font-size-*) / var(--cd-font-weight-*)
 */
import type { TokenGroup } from './token-def.js';

export const radioTokens = {
  // ——— 颜色：基础圆圈 default / hover / active ———
  'color-radio-default-border-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '圆圈描边色', usage: '单选圆圈描边颜色 - 默认态' },
  'color-radio-default-bg-default': { value: 'transparent', category: 'color', label: '圆圈背景色', usage: '单选圆圈背景颜色 - 默认态' },
  'color-radio-default-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '圆圈悬浮背景', usage: '单选圆圈背景颜色 - 悬浮态' },
  'color-radio-default-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '圆圈按下背景', usage: '单选圆圈背景颜色 - 按下态' },
  'color-radio-default-border-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '圆圈悬浮描边', usage: '单选圆圈描边颜色 - 悬浮态' },

  // ——— 颜色：选中态描边 hover / active ———
  'color-radio-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中悬浮描边', usage: '选中状态单选圆圈描边颜色 - 悬浮态' },
  'color-radio-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中按下描边', usage: '选中状态单选圆圈描边颜色 - 按下态' },

  // ——— 颜色：文本 ———
  'color-radio-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文本色', usage: '选项文本颜色' },
  'color-radio-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助文本色', usage: '辅助文本颜色' },

  // ——— 颜色：选中态圆圈（primary） ———
  'color-radio-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '选中悬浮背景', usage: '选中状态单选圆圈背景颜色 - 悬浮态' },
  'color-radio-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '选中按下背景', usage: '选中状态单选圆圈背景颜色 - 按下态' },
  'color-radio-primary-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中描边色', usage: '选中状态单选圆圈描边颜色 - 默认态' },
  'color-radio-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中背景色', usage: '选中状态单选圆圈背景颜色 - 默认态' },
  'color-radio-primary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '中心圆点色', usage: '选中状态单选圆圈中心圆点颜色（IconRadio 颜色）' },

  // ——— 颜色：禁用态 ———
  'color-radio-checked-bg-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用背景', usage: '选中状态单选圆圈背景颜色 - 禁用态' },
  'color-radio-default-border-disabled': { value: 'var(--cd-color-border)', category: 'color', label: '禁用圆圈描边', usage: '单选圆圈描边颜色 - 禁用态' },
  'color-radio-checked-border-disabled': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '选中禁用描边', usage: '选中状态单选圆圈描边颜色 - 禁用态' },
  'color-radio-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用圆圈背景', usage: '单选圆圈背景颜色 - 禁用态' },
  'color-radio-disabled-bg-hover': { value: 'transparent', category: 'color', label: '禁用圆圈悬浮背景', usage: '单选圆圈背景颜色 - 禁用悬浮态' },
  'color-radio-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '禁用态文本颜色' },
  'color-radio-disabled-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用描边色', usage: '单选圆圈描边颜色 - 禁用态' },
  'color-radio-checked-icon-disabled': { value: 'var(--cd-color-white)', category: 'color', label: '选中禁用圆点色', usage: '选中且禁用状态下中心圆点颜色' },

  // ——— 颜色：buttonRadio（按钮样式） ———
  'color-radio-buttonradio-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '按钮文本色', usage: '按钮样式单选文本颜色' },
  'color-radio-buttonradio-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮背景色', usage: '按钮样式单选背景颜色' },
  'color-radio-buttonradio-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '按钮禁用文本', usage: '按钮样式单选禁用态文本颜色' },
  'color-radio-addon-buttonradio-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '按钮悬浮背景', usage: '按钮样式单选悬浮态背景色' },
  'color-radio-addon-buttonradio-text-checked': { value: 'var(--cd-color-primary)', category: 'color', label: '按钮选中文本', usage: '按钮样式单选选中项文字颜色' },
  'color-radio-addon-buttonradio-bg-checked': { value: 'var(--cd-color-bg-3)', category: 'color', label: '按钮选中背景', usage: '按钮样式单选选中项背景颜色' },

  // ——— 颜色：cardRadioGroup（卡片样式） ———
  'color-radio-cardradiogroup-bg-default': { value: 'transparent', category: 'color', label: '卡片默认背景', usage: '卡片样式单选默认背景色' },
  'color-radio-cardradiogroup-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中背景', usage: '卡片样式单选选中态背景色' },
  'color-radio-cardradiogroup-disabled-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '卡片选中禁用背景', usage: '卡片样式单选选中且禁用时的背景色' },
  'color-radio-cardradiogroup-disabled-bg-active': { value: 'transparent', category: 'color', label: '卡片禁用按下背景', usage: '卡片样式单选禁用时的背景色 - 按下态' },
  'color-radio-cardradiogroup-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片悬浮背景', usage: '卡片样式单选悬浮态背景色' },
  'color-radio-cardradiogroup-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片按下背景', usage: '卡片样式单选按下态背景色' },
  'color-radio-cardradiogroup-border-default': { value: 'transparent', category: 'color', label: '卡片默认描边', usage: '卡片样式单选默认描边颜色' },
  'color-radio-cardradiogroup-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '卡片选中描边', usage: '卡片样式单选选中态描边颜色' },
  'color-radio-cardradiogroup-checked-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '卡片选中按下描边', usage: '卡片样式单选选中态描边颜色 - 按下态' },
  'color-radio-cardradiogroup-checked-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '卡片选中悬浮描边', usage: '卡片样式单选选中态描边颜色 - 悬浮态' },
  'color-radio-cardradiogroup-border-disabled-active': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用描边', usage: '卡片样式单选选中且禁用时的描边颜色' },
  'color-radio-cardradiogroup-addon-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文字色', usage: '卡片样式单选标题文字颜色' },
  'color-radio-cardradiogroup-extra-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片辅助文字色', usage: '卡片样式单选辅助文字颜色' },
  'color-radio-cardradiogroup-checked-disabled-border-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用描边默认', usage: '卡片样式选中项禁用态描边颜色 - 默认态' },
  'color-radio-cardradiogroup-checked-disabled-border-hover': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '卡片选中禁用描边悬浮', usage: '卡片样式选中项禁用态描边颜色 - 悬浮态' },
  'color-radio-card-bg-hover': { value: 'var(--cd-color-white)', category: 'color', label: '卡片圆圈悬浮背景', usage: '卡片模式下单选圆圈背景颜色 - 悬浮态' },
  'color-radio-card-bg-active': { value: 'var(--cd-color-white)', category: 'color', label: '卡片圆圈按下背景', usage: '卡片模式下单选圆圈背景颜色 - 按下态' },
  'color-radio-card-bg-default': { value: 'var(--cd-color-white)', category: 'color', label: '卡片圆圈默认背景', usage: '卡片模式下单选圆圈背景颜色 - 默认态' },

  // ——— 颜色：聚焦轮廓 ———
  'color-radio-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '轮廓颜色 - 按键聚焦' },

  // ——— 圆角 ———
  'radius-radio-cardradiogroup': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '卡片圆角', usage: '卡片式单选圆角大小' },
  'radius-radio-addon-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆点圆角', usage: '按钮式单选圆点圆角大小' },
  'radius-radio-buttonradio': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮式单选圆角大小' },

  // ——— 描边宽度 ———
  'width-radio-cardradiogroup-checked-border': { value: '1px', category: 'width', label: '卡片描边宽度', usage: '卡片式单选描边宽度' },
  'width-radio-cardradiogroup-checked-disabled-border': { value: '1px', category: 'width', label: '卡片禁用描边宽度', usage: '卡片式单选选中且禁用时的描边宽度' },
  'width-radio-hover-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '悬浮描边宽度', usage: '描边宽度 - 悬浮态' },
  'width-radio-disabled-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '禁用描边宽度', usage: '描边宽度 - 禁用态' },
  'width-radio-inner-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '圆圈描边宽度', usage: '单选圆圈描边宽度' },
  'width-radio-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: '单选框轮廓宽度' },

  // ——— 尺寸 ———
  'height-radio-inner-min': { value: '20px', category: 'height', label: '单选最小高度', usage: '单选按钮最小高度' },
  'width-radio-inner': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '圆圈边长', usage: '单选圆圈边长（对齐 Semi $width-radio_inner）' },

  // ——— 间距：addon / content / group ———
  'spacing-radio-addon-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题左内距', usage: '单选标题到单选按钮左侧边距' },
  'spacing-radio-addon-marginleft': { value: 'var(--cd-width-icon-medium)', category: 'spacing', label: '标题左外距', usage: '单选标题左侧整体外边距' },
  'spacing-radio-extra-paddingleft': { value: 'calc(var(--cd-width-icon-medium) + var(--cd-spacing-tight))', category: 'spacing', label: '副标题左内距', usage: '单选副标题左侧内边距（$width-radio_inner + $spacing-tight）' },
  'spacing-radio-content-rowgap': { value: '4px', category: 'spacing', label: '内容行间距', usage: '内容行间距' },

  // ——— 间距：buttonRadio addon 各尺寸 ———
  'spacing-radio-addon-buttonradio-large-paddingx': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '大按钮水平内距', usage: '大尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-large-paddingy': { value: 'calc(var(--cd-spacing-base-tight) * 0.5)', category: 'spacing', label: '大按钮垂直内距', usage: '大尺寸按钮式单选按钮垂直内边距（$spacing-base-tight * 0.5）' },
  'spacing-radio-addon-buttonradio-small-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '小按钮水平内距', usage: '小尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-small-paddingy': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮垂直内距', usage: '小尺寸按钮式单选按钮垂直内边距' },
  'spacing-radio-addon-buttonradio-middle-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中按钮水平内距', usage: '中尺寸按钮式单选按钮水平内边距' },
  'spacing-radio-addon-buttonradio-middle-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中按钮垂直内距', usage: '中尺寸按钮式单选按钮垂直内边距' },
  'spacing-radio-addon-buttonradio-marginleft': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '按钮左外距', usage: '按钮式单选按钮左侧外边距' },

  // ——— 间距：buttonRadioComponent / buttonRadioGroup ———
  'spacing-radio-buttonradio-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '按钮组件内距', usage: '按钮式单选内边距' },
  'spacing-radio-buttonradiogroup-small-paddingx': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮组水平内距', usage: '小尺寸按钮式单选组水平内边距' },
  'spacing-radio-buttonradiogroup-small-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小按钮组垂直内距', usage: '小尺寸按钮式单选组垂直内边距' },
  'spacing-radio-buttonradiogroup-middle-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中按钮组内距', usage: '中尺寸按钮式单选组内边距' },
  'spacing-radio-buttonradiogroup-large-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '大按钮组内距', usage: '大尺寸按钮式单选组内边距' },
  'spacing-radio-buttonradiogroup-paddingright': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '中按钮组右内距', usage: '中尺寸按钮式单选组右侧内边距' },

  // ——— 间距：cardRadioGroup ———
  'spacing-radio-cardradiogroup-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片组水平内距', usage: '卡片式单选组水平内边距' },
  'spacing-radio-cardradiogroup-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片组垂直内距', usage: '卡片式单选组垂直内边距' },
  'spacing-radio-cardradiogroup-inner-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片圆圈右外距', usage: '卡片式单选按钮右侧外边距' },

  // ——— 间距：group 布局 ———
  'spacing-radio-group-vertical-marginbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直组底外距', usage: '垂直布局单选框组底部外边距' },
  'spacing-radio-card-group-vertical-marginbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '垂直卡片组底外距', usage: '垂直布局卡片式单选框组底部外边距' },
  'spacing-radio-group-horizontal-marginright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平组右外距', usage: '水平单选框组右侧外边距' },

  // ——— 字体：buttonRadio ———
  'font-radio-buttonradio-large-default-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '大按钮字号', usage: '大尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-small-default-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '小按钮字号', usage: '小尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-middle-default-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '中按钮字号', usage: '中尺寸按钮式单选标题字体大小' },
  'font-radio-buttonradio-default-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重默认', usage: '按钮式单选标题字重 - 默认态' },
  'font-radio-buttonradio-hover-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重悬浮', usage: '按钮式单选标题字重 - 悬浮态' },
  'font-radio-buttonradio-checked-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮字重选中', usage: '按钮式单选标题字重 - 选中态' },
  'font-radio-buttonradiogroup-small-lineheight': { value: '16px', category: 'font', label: '小按钮行高', usage: '小尺寸按钮式单选标题行高' },
  'font-radio-buttonradiogroup-middle-lineheight': { value: '16px', category: 'font', label: '中按钮行高', usage: '中尺寸按钮式单选标题行高' },
  'font-radio-buttonradiogroup-large-lineheight': { value: '20px', category: 'font', label: '大按钮行高', usage: '大尺寸按钮式单选标题行高' },

  // ——— 字体：cardRadioGroup addon / extra ———
  'font-radio-cardradiogroup-addon-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片标题字号', usage: '卡片式单选组标题字体大小' },
  'font-radio-cardradiogroup-addon-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '卡片标题字重', usage: '卡片式单选组标题字重' },
  'font-radio-cardradiogroup-addon-lineheight': { value: '20px', category: 'font', label: '卡片标题行高', usage: '卡片式单选组标题行高' },
  'font-radio-cardradiogroup-extra-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片副标题字号', usage: '卡片式单选组副标题字体大小' },
  'font-radio-cardradiogroup-extra-fontweight': { value: 'normal', category: 'font', label: '卡片副标题字重', usage: '卡片式单选组副标题字重' },
  'font-radio-cardradiogroup-extra-lineheight': { value: '20px', category: 'font', label: '卡片副标题行高', usage: '卡片式单选组副标题行高' },
} satisfies TokenGroup;
