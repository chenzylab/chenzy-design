/**
 * Component tokens for Space. 全量对齐 Semi Design
 * （semi-foundation/space/variables.scss，3 个），升级为带元数据的 TokenDef
 * 结构以支持 DSM。值 var() 引用我们的 spacing global token。
 * 末尾保留 chenzy-design Space 实际消费的补充 token（Semi 无），值对齐 Semi。
 *
 * 注：Semi space-tight=$spacing-tight(8)、space-medium=$spacing-base(16)、
 * space-loose=$spacing-loose(24)，与我们的 --cd-spacing-* 一致。
 *
 * 见 specs/components/basic/Space.spec.md、specs/00-foundation/dsm.spec.md §4。
 */
import type { TokenGroup } from './token-def.js';

export const spaceTokens = {
  // —— Semi 间距档位 ——
  'spacing-space-tight': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '默认间距', usage: '默认间距尺寸' },
  'spacing-space-medium': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中等间距', usage: '中等间距尺寸' },
  'spacing-space-loose': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '宽松间距', usage: '宽松间距尺寸' },

  // —— chenzy-design Space 实际消费的补充 token（Semi 无；组件消费；值对齐 Semi） ——
  'space-tight': { value: 'var(--cd-spacing-space-tight)', category: 'spacing', label: '紧凑间距', usage: 'spacing=tight 档位 gap（组件消费；对齐 Semi 8px）' },
  'space-medium': { value: 'var(--cd-spacing-space-medium)', category: 'spacing', label: '中等间距', usage: 'spacing=medium 档位 gap（组件消费；对齐 Semi 16px）' },
  'space-loose': { value: 'var(--cd-spacing-space-loose)', category: 'spacing', label: '宽松间距', usage: 'spacing=loose 档位 gap（组件消费；对齐 Semi 24px）' },
} satisfies TokenGroup;
