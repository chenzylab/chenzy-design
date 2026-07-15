/**
 * Component tokens for Spin — 全量对齐 Semi Design。
 * Semi 仅有 5 个 SCSS 变量（semi-foundation/spin/variables.scss）+ 2 个动画时长
 * （animation.scss）。指示器颜色靠 `color: color-spin-bg` 继承到 SVG 的
 * currentColor，无独立 track/mask/tip/z 变量——那些 chenzy-design 自造中间变量已移除。
 * 值与名严格对应 Semi。
 */
import type { TokenGroup } from './token-def.js';

export const spinTokens = {
  // —— Color（Semi variables.scss） ——
  'color-spin-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '加载图标背景色', usage: '加载图标背景颜色' },

  // —— Width（Semi variables.scss） ——
  'width-spin-large': { value: '32px', category: 'width', label: '加载图标尺寸-大', usage: '加载图标尺寸 - 大' },
  'width-spin-middle': { value: '20px', category: 'width', label: '加载图标尺寸-中', usage: '加载图标尺寸 - 中' },
  'width-spin-small': { value: '14px', category: 'width', label: '加载图标尺寸-小', usage: '加载图标尺寸 - 小' },

  // —— Other（Semi variables.scss） ——
  'opacity-spin-children': { value: '0.5', category: 'other', label: '加载图标透明度', usage: 'loading 时被包裹内容的半透明度' },

  // —— Animation（Semi animation.scss） ——
  'animation-duration-spin-wrapper-spin': { value: '600ms', category: 'animation', label: '加载图标旋转时长', usage: '加载图标容器旋转一周时长' },
  'animation-duration-spin-custom-children-spin': { value: '1600ms', category: 'animation', label: '自定义指示器旋转时长', usage: '自定义指示器时旋转一周时长' },
} satisfies TokenGroup;
