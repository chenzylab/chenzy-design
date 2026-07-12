/**
 * Component tokens for BackTop（回到顶部）。带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。回退 Alias，禁写死。
 *
 * 与 Semi 对齐：Semi 的 semi-foundation/backtop/variables.scss 仅 3 个变量——
 *   $z-backtop: 10               → backtop-z          = var(--cd-z-affix)（10）
 *   $spacing-backtop-right: 100px→ 组件默认 right prop（100）
 *   $spacing-backtop-bottom: 50px→ 组件默认 bottom prop（50）
 * Semi 的圆形壳与配色靠 IconButton(theme="light") 提供、无独立 token；chenzy 的
 * BackTop 自带圆形按钮壳，故补齐 size / bg / color / border / shadow / radius /
 * focus-ring / motion 等视觉 token（Semi 没有的场景，我们补全）。所有值均回退 alias，
 * 无写死、无 Semi 不存在的语义中间变量。
 */
import type { TokenGroup } from './token-def.js';

export const backTopTokens = {
  'backtop-size': { value: '40px', category: 'width', label: '按钮尺寸', usage: '回到顶部按钮默认宽高' },
  'backtop-size-small': { value: '32px', category: 'width', label: '按钮尺寸（小）', usage: '小尺寸回到顶部按钮宽高' },
  'backtop-size-large': { value: '48px', category: 'width', label: '按钮尺寸（大）', usage: '大尺寸回到顶部按钮宽高' },
  'backtop-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '背景色', usage: '按钮背景色 - 默认' },
  'backtop-bg-hover': { value: 'var(--cd-color-bg-3)', category: 'color', label: '背景色（悬浮）', usage: '按钮背景色 - 悬浮' },
  'backtop-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色（按下）', usage: '按钮背景色 - 按下' },
  'backtop-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标颜色', usage: '按钮内图标 / 文字颜色' },
  'backtop-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '按钮描边颜色' },
  'backtop-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '阴影', usage: '按钮悬浮投影' },
  'backtop-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '圆角', usage: '按钮圆角（默认全圆）' },
  // 对齐 Semi $z-backtop: 10（= --cd-z-affix，同层 Affix；替换原字面量 900）。
  'backtop-z': { value: 'var(--cd-z-affix)', category: 'other', label: '层级', usage: '按钮 z-index（对齐 Semi $z-backtop: 10）' },
  'backtop-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦环色', usage: '键盘聚焦描边颜色' },
  'backtop-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '动画时长', usage: '显隐 / 悬浮过渡时长' },
} satisfies TokenGroup;
