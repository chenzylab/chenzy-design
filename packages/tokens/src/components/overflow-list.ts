/**
 * Component tokens for OverflowList (M4 Show, collapse subset). 升级为带元数据的
 * TokenDef 结构以支持 DSM。回退 Alias，禁写死。Semi 无 semi-foundation/overflowList/
 * variables.scss，故保留 chenzy-design 自有 token 与现值。
 */
import type { TokenGroup } from './token-def.js';

export const overflowListTokens = {
  'overflow-list-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '子项间距', usage: '列表项之间的间距 - 默认' },
  'overflow-list-gap-small': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '子项间距（小）', usage: '列表项之间的间距 - 紧凑' },
  'overflow-list-gap-large': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '子项间距（大）', usage: '列表项之间的间距 - 宽松' },
  'overflow-list-overflow-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '溢出项文字色', usage: '折叠指示器文字颜色 - 默认' },
  'overflow-list-overflow-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '溢出项文字色（悬浮）', usage: '折叠指示器文字颜色 - 悬浮' },
  'overflow-list-overflow-bg': { value: 'transparent', category: 'color', label: '溢出项背景', usage: '折叠指示器背景色 - 默认' },
  'overflow-list-overflow-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '溢出项背景（悬浮）', usage: '折叠指示器背景色 - 悬浮' },
  'overflow-list-overflow-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '溢出项圆角', usage: '折叠指示器圆角' },
  'overflow-list-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦环色', usage: '折叠指示器键盘聚焦描边颜色' },
} satisfies TokenGroup;
