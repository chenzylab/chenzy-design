/**
 * Component tokens for Skeleton（M5 Feedback）。全量对齐 Semi Design
 * （semi-foundation/skeleton/variables.scss 15 个 + animation.scss 2 个），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 末尾保留 chenzy-design Skeleton 原子组件实际消费的补充 token（原名，Semi 无 / 命名差异；
 * 组件消费），值统一改读上面 Semi 对齐后的 token。
 *
 * 注：
 * - Semi 的 $height-skeleton_title = $height-control-small(24px)、
 *   $height-skeleton_button = $height-control-default(32px)，我们引 --cd-control-height-*。
 * - Semi 圆形头像用字面量 border-radius:50%（无 token），胶囊按钮我们无 Semi 对应；
 *   故 radius-pill 归为组件消费 token，引 --cd-border-radius-full。
 * - 图标弱色沿用 --cd-color-text-3（Semi 图片骨架无独立 token，此为组件消费）。
 */
import type { TokenGroup } from './token-def.js';

export const skeletonTokens = {
  // —— 背景色（variables.scss） ——
  'color-skeleton-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '骨架背景色', usage: '骨架屏背景色 - 默认' },
  'color-skeleton-loading-gradient-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '动画高亮背景色', usage: '骨架屏背景色 - 动画开启后' },

  // —— 头像尺寸（variables.scss） ——
  'width-skeleton-avatar-extra-extra-small': { value: '20px', category: 'width', label: '头像极小', usage: '头像骨架屏尺寸 - 极小' },
  'width-skeleton-avatar-extra-small': { value: '24px', category: 'width', label: '头像超小', usage: '头像骨架屏尺寸 - 超小' },
  'width-skeleton-avatar-small': { value: '32px', category: 'width', label: '头像小', usage: '头像骨架屏尺寸 - 小' },
  'width-skeleton-avatar-medium': { value: '48px', category: 'width', label: '头像中', usage: '头像骨架屏尺寸 - 中' },
  'width-skeleton-avatar-large': { value: '72px', category: 'width', label: '头像大', usage: '头像骨架屏尺寸 - 大' },
  'width-skeleton-avatar-extra-large': { value: '128px', category: 'width', label: '头像超大', usage: '头像骨架屏尺寸 - 超大' },
  'width-skeleton-button': { value: '115px', category: 'width', label: '按钮宽度', usage: '按钮骨架屏宽度' },

  // —— 高度（variables.scss） ——
  'height-skeleton-li': { value: '16px', category: 'height', label: '段落高度', usage: '段落骨架屏高度' },
  'height-skeleton-title': { value: 'var(--cd-control-height-small)', category: 'height', label: '标题高度', usage: '标题骨架屏高度' },
  'height-skeleton-button': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮骨架屏高度' },

  // —— 间距（variables.scss） ——
  'spacing-skeleton-li-marginbottom': { value: '10px', category: 'spacing', label: '段落行下间距', usage: '段落骨架屏行下外边距' },

  // —— 圆角（variables.scss） ——
  'radius-skeleton-item': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '骨架圆角', usage: '骨架屏圆角' },
  'radius-skeleton-li': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '段落圆角', usage: '骨架屏圆角' },

  // —— 动画（animation.scss） ——
  'animation-duration-skeleton-highlight': { value: '1400ms', category: 'animation', label: '高亮动画时长', usage: '骨架屏高亮动画时长' },
  'animation-function-skeleton-highlight': { value: 'ease', category: 'animation', label: '高亮动画曲线', usage: '骨架屏高亮动画曲线' },

  // —— chenzy-design Skeleton 原子组件实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费） ——
  'skeleton-color-bg': { value: 'var(--cd-color-skeleton-default-bg-default)', category: 'color', label: '骨架背景色', usage: '骨架块背景色（组件消费；引 color-skeleton-default-bg-default）' },
  'skeleton-color-highlight': { value: 'var(--cd-color-skeleton-loading-gradient-bg-active)', category: 'color', label: '动画高亮色', usage: 'shimmer 高亮色（组件消费；引 color-skeleton-loading-gradient-bg-active）' },
  'skeleton-radius': { value: 'var(--cd-radius-skeleton-item)', category: 'radius', label: '骨架圆角', usage: '骨架块圆角（组件消费；引 radius-skeleton-item）' },
  'skeleton-radius-pill': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '胶囊圆角', usage: '圆形头像 / 胶囊按钮圆角（组件消费；Semi 圆形头像用 50%，此处统一 full）' },
  'skeleton-gap': { value: 'var(--cd-spacing-skeleton-li-marginbottom)', category: 'spacing', label: '块间距', usage: '骨架块间距（组件消费；引 spacing-skeleton-li-marginbottom）' },
  'skeleton-title-height': { value: 'var(--cd-height-skeleton-title)', category: 'height', label: '标题高度', usage: '标题骨架高度（组件消费；引 height-skeleton-title）' },
  'skeleton-paragraph-height': { value: 'var(--cd-height-skeleton-li)', category: 'height', label: '段落行高', usage: '段落骨架行高（组件消费；引 height-skeleton-li）' },
  'skeleton-anim-duration': { value: 'var(--cd-animation-duration-skeleton-highlight)', category: 'animation', label: '动画时长', usage: 'shimmer 动画时长（组件消费；引 animation-duration-skeleton-highlight）' },
  'skeleton-anim-timing': { value: 'var(--cd-animation-function-skeleton-highlight)', category: 'animation', label: '动画曲线', usage: 'shimmer 动画曲线（组件消费；引 animation-function-skeleton-highlight）' },
  'skeleton-image-icon-color': { value: 'var(--cd-color-text-3)', category: 'color', label: '图片图标色', usage: '图片骨架中心图标弱色（组件消费；Semi 无独立 token）' },
} satisfies TokenGroup;
