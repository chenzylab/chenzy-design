/**
 * Component tokens for Space. 破坏性对齐 Semi Design
 * （semi-foundation/space/variables.scss，仅 3 个），带元数据的 TokenDef 结构以支持 DSM。
 * 值 var() 引用我们的 spacing global token。Space.svelte 直接消费
 * --cd-spacing-space-tight/medium/loose，无中间层（已删除旧的 space-tight/medium/loose）。
 *
 * 注：Semi space-tight=$spacing-tight(8)、space-medium=$spacing-base(16)、
 * space-loose=$spacing-loose(24)，与我们的 --cd-spacing-* 一致。
 *
 * 见 specs/components/basic/Space.spec.md、specs/00-foundation/dsm.spec.md §4。
 */
import type { TokenGroup } from './token-def.js';

export const spaceTokens = {
  // —— Semi 间距档位（组件直接消费 --cd-spacing-space-*） ——
  'spacing-space-tight': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '紧凑间距', usage: 'spacing=tight 档位 gap（默认，对齐 Semi 8px）' },
  'spacing-space-medium': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '中等间距', usage: 'spacing=medium 档位 gap（对齐 Semi 16px）' },
  'spacing-space-loose': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '宽松间距', usage: 'spacing=loose 档位 gap（对齐 Semi 24px）' },
} satisfies TokenGroup;
