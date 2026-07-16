/**
 * Component tokens for Rating. 破坏性对齐 Semi Design，去中间层：
 * 组件 CSS 直接消费下列 Semi 对齐 token，无「组件消费别名」二次套娃。
 *
 * 名值一一翻译 Semi：
 *  - semi-foundation/rating/variables.scss（12 个）
 *  - semi-foundation/rating/animation.scss（3 个 rating-color 过渡 token）
 *
 * 注：
 *  - Semi $color-rating-icon-default: rgba(var(--semi-yellow-5), 1) —— 评分星传统金黄（非 warning 橙）。
 *    alias 层已建 --cd-color-rating-icon-default（= palette.yellow-5）；组件层若同名会自引用死循环，
 *    故组件层落名 color-rating-icon-active 并引 alias。
 *  - Semi $font-rating_item_xxx-fontSize 复用对应 $width-rating_item_xxx，忠实翻译为 var(...) 引用。
 *  - Semi animation.scss 的 rating-color 过渡三件套引 --semi-transition_*-none / -easeIn；
 *    本库对应 --cd-motion-duration-none / -ease-in / -delay-none（默认 0ms，即 Semi 观感无动画）。
 */
import type { TokenGroup } from './token-def.js';

export const ratingTokens = {
  // —— Color（variables.scss）——
  // 注：Semi $color-rating-icon-default 与 alias 层 --cd-color-rating-icon-default（星金黄）同名；
  // 组件层沿用会自引用死循环，故落名 color-rating-icon-active 并引 alias。
  'color-rating-icon-active': { value: 'var(--cd-color-rating-icon-default)', category: 'color', label: '已填图标色', usage: '评分图标按钮颜色 - 已填（Semi $color-rating-icon-default，yellow-5 金黄）' },
  'color-rating-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '未填图标色', usage: '评分图标按钮颜色 - 未填' },
  'color-rating-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '空评分项聚焦轮廓颜色' },

  // —— Font（variables.scss）——
  'font-rating-fontsize': { value: '20px', category: 'font', label: '评分文本字号', usage: '评分文本字体大小' },

  // —— Spacing（variables.scss）——
  'spacing-rating-margin': { value: '0px', category: 'spacing', label: '整体外边距', usage: '整体外边距' },
  'spacing-rating-padding': { value: '0px', category: 'spacing', label: '整体内边距', usage: '整体内边距' },
  'spacing-rating-item-marginright': { value: '6px', category: 'spacing', label: '评分项右外边距', usage: '评分项右侧外边距' },

  // —— Width / 尺寸（variables.scss）——
  'width-rating-item-small': { value: '16px', category: 'width', label: '小尺寸评分项宽度', usage: '小尺寸评分项宽度' },
  'font-rating-item-small-fontsize': { value: 'var(--cd-width-rating-item-small)', category: 'font', label: '小尺寸评分项字号', usage: '小尺寸评分项文本字体大小' },
  'width-rating-item-default': { value: '24px', category: 'width', label: '评分项宽度', usage: '评分项宽度' },
  'font-rating-item-default-fontsize': { value: 'var(--cd-width-rating-item-default)', category: 'font', label: '评分项字号', usage: '评分项文本字体大小' },
  'width-rating-outline-focus': { value: '2px', category: 'width', label: '聚焦轮廓宽度', usage: '空评分项聚焦轮廓宽度' },

  // —— Transition（animation.scss：first/second 星填充色过渡，默认 0ms 无动画）——
  'transition-duration-rating-color': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '填充色过渡时长', usage: '评分-背景色-动画持续时间（Semi transition_duration-none）' },
  'transition-function-rating-color': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '填充色过渡曲线', usage: '评分-背景色-过渡曲线（Semi transition_function-easeIn）' },
  'transition-delay-rating-color': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '填充色过渡延迟', usage: '评分-背景色-延迟时间（Semi transition_delay-none）' },
} satisfies TokenGroup;
