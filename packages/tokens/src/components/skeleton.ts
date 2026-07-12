/**
 * Component tokens for Skeleton（M5 Feedback）。严格镜像 Semi Design
 * （semi-foundation/skeleton/variables.scss 15 个 + animation.scss 2 个 = 17 个），
 * token 名与值逐条对应 Semi，无中间转接短名（Semi 没有的中间变量一律不引入）。
 * 组件直接消费下列 --cd-* 长名 token（等价于 Semi 组件直接消费 $... 变量）。
 * 值为 var() 引用我们的 alias / global token，或字面量，与 Semi 一致。
 *
 * 注（与 Semi 一一对应）：
 * - $height-skeleton_title = $height-control-small(24px) → 引 --cd-control-height-small。
 * - $height-skeleton_button = $height-control-default(32px) → 引 --cd-control-height-default。
 * - 圆形头像 Semi 用字面量 border-radius:50%（无 token），故此处不设圆形圆角 token，组件内联 50%。
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
} satisfies TokenGroup;
