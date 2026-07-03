/**
 * Component tokens for Rating. 全量对齐 Semi Design（semi-foundation/rating/variables.scss
 * 12 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Rating 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi $color-rating-icon-default: rgba(var(--semi-yellow-5), 1) —— Semi 用原始 palette
 *    yellow-5（评分星传统金黄，非 warning 橙）。我们已在 alias 层建 --cd-color-rating-icon-default
 *    （= palette.yellow-5，暗色 = rgb(253,222,67)），此处直引该 alias，未在组件层发明新 palette 名。
 *  - Semi var(--semi-color-fill-0) → var(--cd-color-fill-0)；
 *    var(--semi-color-primary-light-active) → var(--cd-color-primary-light-active)。
 *  - Semi $font-rating_item_xxx-fontSize 复用对应 $width-rating_item_xxx，忠实翻译为 var(...) 引用。
 */
import type { TokenGroup } from './token-def.js';

export const ratingTokens = {
  // —— Color ——
  // 注：Semi 变量名 $color-rating-icon-default 与我们 alias 层 --cd-color-rating-icon-default（星金黄）
  // 同名；组件层若沿用会自引用死循环，故组件层落名 color-rating-icon-active 并引 alias。
  'color-rating-icon-active': { value: 'var(--cd-color-rating-icon-default)', category: 'color', label: '已填图标色', usage: '评分图标按钮颜色 - 已填（Semi $color-rating-icon-default，原为 yellow-5 金黄）' },
  'color-rating-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '未填图标色', usage: '评分图标按钮颜色 - 未填' },
  'color-rating-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '聚焦轮廓颜色' },

  // —— Font ——
  'font-rating-fontsize': { value: '20px', category: 'font', label: '评分文本字号', usage: '评分文本字体大小' },

  // —— Spacing ——
  'spacing-rating-margin': { value: '0px', category: 'spacing', label: '整体外边距', usage: '整体外边距' },
  'spacing-rating-padding': { value: '0px', category: 'spacing', label: '整体内边距', usage: '整体内边距' },
  'spacing-rating-item-marginright': { value: '6px', category: 'spacing', label: '评分项右外边距', usage: '评分项右侧外边距' },

  // —— Width / 尺寸 ——
  'width-rating-item-small': { value: '16px', category: 'width', label: '小尺寸评分项宽度', usage: '小尺寸评分项宽度' },
  'font-rating-item-small-fontsize': { value: 'var(--cd-width-rating-item-small)', category: 'font', label: '小尺寸评分项字号', usage: '小尺寸评分项文本字体大小' },
  'width-rating-item-default': { value: '24px', category: 'width', label: '评分项宽度', usage: '评分项宽度' },
  'font-rating-item-default-fontsize': { value: 'var(--cd-width-rating-item-default)', category: 'font', label: '评分项字号', usage: '评分项文本字体大小' },
  'width-rating-outline-focus': { value: '2px', category: 'width', label: '聚焦轮廓宽度', usage: '聚焦轮廓宽度' },

  // —— chenzy-design Rating 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'rating-size-default': { value: 'var(--cd-width-rating-item-default)', category: 'width', label: '评分项边长', usage: '评分项边长 - 默认（组件消费；对齐 Semi item_default = 24px）' },
  'rating-size-small': { value: 'var(--cd-width-rating-item-small)', category: 'width', label: '评分项边长', usage: '评分项边长 - 小尺寸（组件消费）' },
  'rating-size-large': { value: 'var(--cd-width-rating-item-default)', category: 'width', label: '评分项边长', usage: '评分项边长 - 大尺寸（组件消费；对齐 Semi item_default = 24px）' },
  'rating-gap': { value: 'var(--cd-spacing-rating-item-marginright)', category: 'spacing', label: '评分项间距', usage: '评分项之间间距（组件消费；对齐 Semi item marginRight = 6px）' },
  'rating-color-active': { value: 'var(--cd-color-rating-icon-default)', category: 'color', label: '已填星色', usage: '评分已填星颜色（组件消费；金黄）' },
  'rating-color-inactive': { value: 'var(--cd-color-rating-bg-default)', category: 'color', label: '未填星色', usage: '评分未填星颜色（组件消费）' },
  'rating-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '聚焦圆角', usage: '聚焦轮廓圆角（组件消费）' },
  'rating-outline-focus': { value: 'var(--cd-focus-ring)', category: 'other', label: '聚焦轮廓', usage: '聚焦轮廓阴影（组件消费）' },
  'rating-color-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警示星色', usage: 'warning 状态已填星颜色（组件消费）' },
  'rating-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误星色', usage: 'error 状态已填星颜色（组件消费）' },
  'rating-transition-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '过渡时长', usage: '星填充色过渡动画时长（组件消费）' },
  'rating-transition-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '过渡曲线', usage: '星填充色过渡动画曲线（组件消费）' },
} satisfies TokenGroup;
