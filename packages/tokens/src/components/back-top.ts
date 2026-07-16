/**
 * Component tokens for BackTop（回到顶部）。带元数据的 TokenDef 结构以支持 DSM。
 *
 * 严格对齐 Semi：semi-foundation/backtop/variables.scss 仅 3 个变量，BackTop 自身无视觉 token
 * （圆形按钮观感由内部 IconButton(theme="light") 提供）：
 *   $z-backtop: 10                → backtop-z      = var(--cd-z-affix)（10，同层 Affix）
 *   $spacing-backtop-right: 100px → backtop-right  = 100px
 *   $spacing-backtop-bottom: 50px → backtop-bottom = 50px
 */
import type { TokenGroup } from './token-def.js';

export const backTopTokens = {
  // 对齐 Semi $z-backtop: 10（= --cd-z-affix，同层 Affix）。
  'backtop-z': { value: 'var(--cd-z-affix)', category: 'other', label: '层级', usage: '按钮 z-index（对齐 Semi $z-backtop: 10）' },
  // 对齐 Semi $spacing-backtop-right: 100px。
  'backtop-right': { value: '100px', category: 'spacing', label: '距右侧', usage: '距 inline-end 偏移（对齐 Semi $spacing-backtop-right: 100px）' },
  // 对齐 Semi $spacing-backtop-bottom: 50px。
  'backtop-bottom': { value: '50px', category: 'spacing', label: '距底部', usage: '距底部偏移（对齐 Semi $spacing-backtop-bottom: 50px）' },
} satisfies TokenGroup;
