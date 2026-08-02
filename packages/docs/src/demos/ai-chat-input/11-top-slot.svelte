<script lang="ts">
  // 对齐 Semi「自定义渲染顶部区域」：renderTopSlot 自定义顶部区，
  // 配合 showReference / showUploadFile 控制内置引用与附件展示区，
  // topSlotPosition 控制自定义内容相对它们的位置（top / bottom）。
  import { AIChatInput, Button, Tag } from '@chenzy-design/svelte';
  import type { AIChatInputReference } from '@chenzy-design/svelte';

  let position = $state<'top' | 'bottom'>('top');

  // 引用条目用 name 作显示名（type='text' 时才用 content）。
  const references: AIChatInputReference[] = [
    { id: 'r1', name: 'Svelte 5 Runes 指南', type: 'link' },
    { id: 'r2', name: '设计规范.pdf', type: 'file' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Button size="small" onclick={() => (position = position === 'top' ? 'bottom' : 'top')}>
    topSlotPosition: {position}
  </Button>

  <AIChatInput {references} topSlotPosition={position} renderTopSlot={topSlot} />
</div>

{#snippet topSlot({ references: refs }: { references: AIChatInputReference[] })}
  <div style="display: flex; gap: 8px; align-items: center; padding: 4px 0;">
    <span style="color: var(--cd-color-text-2); font-size: 12px;">自定义顶部区</span>
    <Tag size="small">引用 {refs.length} 条</Tag>
  </div>
{/snippet}
