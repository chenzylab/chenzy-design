/**
 * Component tokens for Anchor. 全量对齐 Semi Design（semi-foundation/anchor/variables.scss），
 * 升级为带元数据的 TokenDef 结构以支持 DSM。名/值/作用位置严格镜像 Semi，无中间层。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 注：Semi 的自引用（$color-anchor_title_active-text-hover: $color-anchor_title-text-hover）
 * 保留为 var() 自引用另一个 anchor token。
 */
import type { TokenGroup } from './token-def.js';

export const anchorTokens = {
  // —— Color：滑轨 slide ——
  'color-anchor-slide-default-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '滑轨背景色', usage: '滑轨背景颜色' },
  'color-anchor-slide-primary-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '选中色-Primary', usage: '选中颜色 - Primary' },
  'color-anchor-slide-tertiary-bg-active': { value: 'var(--cd-color-tertiary)', category: 'color', label: '选中色-Tertiary', usage: '选中颜色 - Tietrary' },
  'color-anchor-slide-muted-bg-active': { value: 'var(--cd-color-white)', category: 'color', label: '选中色-Muted', usage: '选中颜色 - Muted' },

  // —— Color：标题文字 title ——
  'color-anchor-title-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '文字色-未选中', usage: '文字颜色 - 未选中' },
  'color-anchor-title-text-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '文字色-未选中悬浮', usage: '文字颜色 - 未选中悬浮态' },
  'color-anchor-title-active-text-hover': { value: 'var(--cd-color-anchor-title-text-hover)', category: 'color', label: '文字色-选中悬浮', usage: '文字颜色 - 选中悬浮态' },
  'color-anchor-title-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字色-选中', usage: '文字颜色 - 选中' },
  'color-anchor-title-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '文字色-禁用', usage: '文字颜色 - 禁用' },

  'color-anchor-title-bg-default': { value: 'transparent', category: 'color', label: '标题背景色', usage: '背景色' },
  'color-anchor-title-bg-active': { value: 'transparent', category: 'color', label: '标题选中背景色', usage: '背景色 - 选中' },

  'color-anchor-title-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '轮廓 - 聚焦' },

  // —— Spacing ——
  'spacing-anchor-slide-left': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '滑轨左侧位置', usage: '滑轨左侧位置' },
  'spacing-anchor-slide-top': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '滑轨顶部位置', usage: '滑轨顶部位置' },
  'spacing-anchor-slide-default-y': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项间距-默认', usage: '选项间距 - 默认' },
  'spacing-anchor-slide-small-y': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项间距-紧凑', usage: '选项间距 - 紧凑' },
  'spacing-anchor-link-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项文字左边距', usage: '选项文字左边距' },
  'spacing-anchor-link-title-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项文字顶部内边距', usage: '选项文字顶部内边距' },
  'spacing-anchor-link-title-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项文字底部内边距', usage: '选项文字底部内边距' },

  // —— Size ——
  'width-anchor-slide-default': { value: '2px', category: 'width', label: '滑轨宽度', usage: '滑轨宽度' },
  'height-anchor-slide-default': { value: '20px', category: 'height', label: '选项高度-默认', usage: '选项高度 - 默认' },
  'height-anchor-slide-small': { value: '16px', category: 'height', label: '选项高度-小尺寸', usage: '选项高度 - 小尺寸' },

  // —— Radius ——
  'radius-anchor-slide': { value: '1px', category: 'radius', label: '滑轨圆角', usage: '滑轨圆角' },

  // —— Animation：标题文字过渡 + 缩放（对齐 Semi anchor/animation.scss，无中间层） ——
  // Semi: $transition_duration-anchor_title-text: var(--semi-transition_duration-none) → 0ms
  'transition-duration-anchor-title-text': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '标题文字过渡时长', usage: '锚点标题文字-文字-动画持续时间' },
  // Semi: $transition_function-anchor_title-text: var(--semi-transition_function-easeIn) → ease-in
  'transition-function-anchor-title-text': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '标题文字过渡曲线', usage: '锚点标题文字-文字-过渡曲线' },
  // Semi: $transition_delay-anchor_title-text: var(--semi-transition_delay-none) → 0ms
  'transition-delay-anchor-title-text': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '标题文字过渡延迟', usage: '锚点标题文字-文字-延迟时间' },
  // Semi: $transform_scale-anchor_title-text: var(--semi-transform_scale-none) → scale(1, 1)
  'transform-scale-anchor-title-text': { value: 'var(--cd-motion-scale-none)', category: 'animation', label: '标题文字缩放', usage: '锚点-放大' },

  // —— Width：轮廓 outline ——
  'width-anchor-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: 'anchor轮廓宽度' },
  'width-anchor-outlineoffset': { value: '-2px', category: 'width', label: '轮廓 outline-offset', usage: 'anchor轮廓 outline-offset 宽度' },
  'width-anchor-outline-border-radius': { value: '3px', category: 'width', label: '轮廓圆角', usage: 'anchor轮廓圆角' },
} satisfies TokenGroup;
