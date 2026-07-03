/**
 * Component tokens for BackTop (M6 Other). 升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。回退 Alias，禁写死。
 *
 * 注：Semi 的 semi-foundation/backtop/variables.scss 仅 3 个 token
 * （$z-backtop / $spacing-backtop-right / $spacing-backtop-bottom），命名体系与
 * chenzy-design BackTop 组件实际消费的 token 无对应；组件的 offset-right/bottom 走
 * 运行时内联变量（BackTop.svelte 由 offsetBottom/offsetRight props 注入），非主题 token。
 * 故此处保留组件在用的自有 token 与现值，仅升级结构。
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
  'backtop-z': { value: '900', category: 'other', label: '层级', usage: '按钮 z-index' },
  'backtop-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦环色', usage: '键盘聚焦描边颜色' },
  'backtop-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '动画时长', usage: '显隐 / 悬浮过渡时长' },
} satisfies TokenGroup;
