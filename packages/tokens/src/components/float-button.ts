/**
 * Component tokens for FloatButton / FloatButtonGroup（悬浮操作按钮）。
 * 悬浮固定在视口的可操作入口，形状默认圆角矩形(round)，可选方形(square)。
 * 值回退 Alias / Global token，禁写死。见 specs/components/basic/FloatButton.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const floatButtonTokens = {
  // —— 尺寸（正方形边长，三档）——
  'floatbutton-size-small': { value: '40px', category: 'width', label: '按钮尺寸（小）', usage: 'small 悬浮按钮宽高' },
  'floatbutton-size-default': { value: '48px', category: 'width', label: '按钮尺寸', usage: 'default 悬浮按钮宽高' },
  'floatbutton-size-large': { value: '56px', category: 'width', label: '按钮尺寸（大）', usage: 'large 悬浮按钮宽高' },

  // —— 形状圆角 ——
  'floatbutton-radius-round': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '圆角（round）', usage: 'round 形状圆角（正圆，对齐 Semi）' },
  'floatbutton-radius-square': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角（square）', usage: 'square 形状圆角（方形）' },

  // —— 配色 ——
  'floatbutton-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '背景色', usage: '按钮背景色 - 默认' },
  'floatbutton-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色（悬浮）', usage: '按钮背景色 - 悬浮' },
  'floatbutton-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色（按下）', usage: '按钮背景色 - 按下' },
  'floatbutton-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标颜色', usage: '按钮内图标 / 文字颜色' },
  'floatbutton-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '按钮描边颜色' },
  'floatbutton-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '阴影', usage: '按钮悬浮投影' },

  // —— colorful（AI 多彩渐变）——
  'floatbutton-colorful-gradient': {
    value: 'linear-gradient(135deg, var(--cd-color-primary) 0%, #8f5cff 100%)',
    category: 'color',
    label: 'colorful 渐变',
    usage: 'colorful 外观品牌蓝→紫渐变背景',
  },
  'floatbutton-colorful-color': { value: 'var(--cd-color-white)', category: 'color', label: 'colorful 前景色', usage: 'colorful 外观图标 / 文字颜色' },

  // —— 状态 ——
  'floatbutton-disabled-opacity': { value: 'var(--cd-opacity-disabled)', category: 'other', label: '禁用透明度', usage: '禁用态整体透明度' },
  'floatbutton-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦环色', usage: '键盘聚焦描边颜色' },
  'floatbutton-z': { value: '900', category: 'other', label: '层级', usage: '悬浮按钮 z-index' },
  'floatbutton-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '动画时长', usage: '悬浮 / 渐变过渡时长' },

  // —— Group 布局（胶囊工具条，对齐 Semi）——
  'floatbutton-group-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '组内间距', usage: 'Group 相邻项间距' },
  'floatbutton-group-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '组背景', usage: 'Group 胶囊条背景色' },
  'floatbutton-group-shadow': { value: 'var(--cd-floatbutton-shadow)', category: 'other', label: '组阴影', usage: 'Group 胶囊条阴影' },
  'floatbutton-group-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '组圆角', usage: 'Group 胶囊条圆角' },
  'floatbutton-group-padding': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '组内边距', usage: 'Group 胶囊条内边距' },
  'floatbutton-group-item-padding-y': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '项纵向内边距', usage: 'Group item 纵向内边距' },
  'floatbutton-group-item-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '项横向内边距', usage: 'Group item 横向内边距' },
  'floatbutton-group-item-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '项内图文间距', usage: 'Group item 图标与文字间距' },
  'floatbutton-group-item-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '项圆角', usage: 'Group item 圆角' },
  'floatbutton-group-item-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '项文字色', usage: 'Group item 文字颜色' },
  'floatbutton-group-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '项背景（悬浮）', usage: 'Group item 悬浮背景' },
  'floatbutton-group-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '项背景（按下）', usage: 'Group item 按下背景' },
} satisfies TokenGroup;
