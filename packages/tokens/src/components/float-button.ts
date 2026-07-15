/**
 * Component tokens for FloatButton / FloatButtonGroup（悬浮操作按钮）。
 * 严格对齐 Semi Design（semi-foundation/floatButton/variables.scss）。
 * semi- 前缀映射为 cd-；写死 px 的（8px 圆角、6px padding、4px gap、24px 位置、
 * 14/20/400 字体）照 Semi 写死，引 Semi 变量的映射到对应 var(--cd-*)。
 */
import type { TokenGroup } from './token-def.js';

export const floatButtonTokens = {
  // —— 尺寸（Semi $width-floatButton*，正方形边长，三档）——
  'floatbutton-size-small': { value: '24px', category: 'width', label: '按钮尺寸（小）', usage: 'small 悬浮按钮宽高' },
  'floatbutton-size-default': { value: '32px', category: 'width', label: '按钮尺寸', usage: 'default 悬浮按钮宽高' },
  'floatbutton-size-large': { value: '40px', category: 'width', label: '按钮尺寸（大）', usage: 'large 悬浮按钮宽高' },

  // —— 形状圆角（Semi $radius-floatButton_round/square）——
  'floatbutton-radius-round': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '圆角（round）', usage: 'round 形状圆角（正圆）' },
  'floatbutton-radius-square': { value: '8px', category: 'radius', label: '圆角（square）', usage: 'square 形状圆角（Semi 写死 8px）' },

  // —— 配色（Semi $color-floatButton-*）——
  'floatbutton-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '按钮背景色 - 默认' },
  'floatbutton-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色（悬浮）', usage: '按钮背景色 - 悬浮' },
  'floatbutton-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '背景色（按下）', usage: '按钮背景色 - 按下' },
  'floatbutton-color': { value: 'var(--cd-color-primary)', category: 'color', label: '图标颜色', usage: '按钮内图标 / 文字颜色（Semi=primary）' },
  'floatbutton-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '阴影', usage: '按钮悬浮投影' },

  // —— 禁用（Semi $color-floatButton-disabled-*）——
  'floatbutton-disabled-bg': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用背景', usage: '禁用态背景色' },
  'floatbutton-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用前景', usage: '禁用态图标 / 文字颜色' },

  // —— colorful（AI 多彩渐变，Semi $color-floatButton-colorful-*）——
  'floatbutton-colorful-bg': { value: 'var(--cd-color-ai-general)', category: 'color', label: 'colorful 背景', usage: 'colorful 外观 AI 渐变背景 - 默认' },
  'floatbutton-colorful-bg-hover': { value: 'var(--cd-color-ai-general-hover)', category: 'color', label: 'colorful 背景（悬浮）', usage: 'colorful 外观 AI 渐变背景 - 悬浮' },
  'floatbutton-colorful-bg-active': { value: 'var(--cd-color-ai-general-active)', category: 'color', label: 'colorful 背景（按下）', usage: 'colorful 外观 AI 渐变背景 - 按下' },
  'floatbutton-colorful-text': { value: 'var(--cd-color-white)', category: 'color', label: 'colorful 前景', usage: 'colorful 外观图标 / 文字颜色（白）' },

  // —— 位置 / 层级（Semi $spacing-floatButton-bottom/right、$z-floatButton）——
  'floatbutton-bottom': { value: '24px', category: 'spacing', label: '距底部', usage: '悬浮按钮距视口底部（fixed）' },
  'floatbutton-right': { value: '24px', category: 'spacing', label: '距右侧', usage: '悬浮按钮距视口右侧（fixed）' },
  'floatbutton-z': { value: '1000', category: 'other', label: '层级', usage: '悬浮按钮 z-index' },

  // —— Group 布局（Semi $*-floatButton_group*）——
  'floatbutton-group-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '组背景', usage: 'Group 胶囊条背景色' },
  'floatbutton-group-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '组阴影', usage: 'Group 胶囊条阴影' },
  'floatbutton-group-radius': { value: '8px', category: 'radius', label: '组圆角', usage: 'Group 胶囊条圆角（Semi 写死 8px）' },
  'floatbutton-group-padding': { value: '6px', category: 'spacing', label: '组内边距', usage: 'Group 胶囊条内边距（Semi 写死 6px）' },
  'floatbutton-group-gap': { value: '4px', category: 'spacing', label: '组内间距', usage: 'Group 相邻项间距（columnGap，Semi 写死 4px）' },
  'floatbutton-group-bottom': { value: '24px', category: 'spacing', label: '组距底部', usage: 'Group 距视口底部（fixed）' },
  'floatbutton-group-right': { value: '24px', category: 'spacing', label: '组距右侧', usage: 'Group 距视口右侧（fixed）' },

  // —— Group item（Semi $*-floatButton_group_item-*）——
  'floatbutton-group-item-padding-y': { value: '6px', category: 'spacing', label: '项纵向内边距', usage: 'Group item 纵向内边距（Semi 写死 6px）' },
  'floatbutton-group-item-padding-x': { value: '12px', category: 'spacing', label: '项横向内边距', usage: 'Group item 横向内边距（Semi 写死 12px）' },
  'floatbutton-group-item-gap': { value: '8px', category: 'spacing', label: '项内图文间距', usage: 'Group item 图标与文字间距（columnGap，Semi 写死 8px）' },
  'floatbutton-group-item-radius': { value: '4px', category: 'radius', label: '项圆角', usage: 'Group item 圆角（Semi 写死 4px）' },
  'floatbutton-group-item-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '项文字色', usage: 'Group item 文字颜色' },
  'floatbutton-group-item-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '项背景（悬浮）', usage: 'Group item 悬浮背景' },
  'floatbutton-group-item-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '项背景（按下）', usage: 'Group item 按下背景' },
  'floatbutton-group-item-font-size': { value: '14px', category: 'font', label: '项字号', usage: 'Group item 字体大小（Semi 写死 14px）' },
  'floatbutton-group-item-line-height': { value: '20px', category: 'font', label: '项行高', usage: 'Group item 行高（Semi 写死 20px）' },
  'floatbutton-group-item-font-weight': { value: '400', category: 'font', label: '项字重', usage: 'Group item 字重（Semi 写死 400）' },
} satisfies TokenGroup;
