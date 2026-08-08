<script lang="ts">
  // 对齐 Semi「自定义渲染顶部区域」：renderTopSlot 自定义顶部区自绘引用/附件条目
  // （用 handleReferenceDelete / handleUploadFileDelete 承载删除交互），
  // 必须配合 showReference={false} showUploadFile={false} 关掉内置渲染，
  // 否则内置引用条/附件区会在自定义顶部区之外重复渲染一次。
  // topSlotPosition 控制自定义内容相对它们的位置（top / middle / bottom）。
  import { AIChatInput, Button } from '@chenzy-design/svelte';
  import type { AIChatInputAttachment, AIChatInputReference } from '@chenzy-design/svelte';

  const positions = ['top', 'middle', 'bottom'] as const;
  let position = $state<(typeof positions)[number]>('top');

  const uploadProps = { action: 'https://api.semi.design/upload' };

  // 引用条目用 name 作显示名（type='text' 时才用 content）。
  let references = $state<AIChatInputReference[]>([
    { id: 'r1', name: 'Svelte 5 Runes 指南', type: 'link' },
    { id: 'r2', name: '设计规范.pdf', type: 'file' },
  ]);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Button
    size="small"
    onclick={() => {
      const next = positions[(positions.indexOf(position) + 1) % positions.length];
      position = next;
    }}
  >
    topSlotPosition: {position}
  </Button>

  <div style="margin: 12px;">
    <AIChatInput
      placeholder="自定义渲染顶部内容，可用于渲染上传内容、引用内容"
      {references}
      {uploadProps}
      showReference={false}
      showUploadFile={false}
      topSlotPosition={position}
      renderTopSlot={topSlot}
    />
  </div>
</div>

{#snippet topSlot({
  references: refs,
  attachments,
  handleReferenceDelete,
  handleUploadFileDelete,
}: {
  references: AIChatInputReference[];
  attachments: AIChatInputAttachment[];
  handleReferenceDelete: (reference: AIChatInputReference) => void;
  handleUploadFileDelete: (attachment: AIChatInputAttachment) => void;
})}
  <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0;">
    {#each refs as ref (ref.id)}
      <span
        style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: var(--cd-color-fill-0); font-size: 12px;"
      >
        {ref.name}
        <button
          type="button"
          style="border: none; background: none; cursor: pointer; padding: 0; line-height: 1;"
          onclick={() => handleReferenceDelete(ref)}
          aria-label="删除引用"
        >
          ×
        </button>
      </span>
    {/each}
    {#each attachments as attachment (attachment.uid)}
      <span
        style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: var(--cd-color-fill-0); font-size: 12px;"
      >
        {attachment.name}
        <button
          type="button"
          style="border: none; background: none; cursor: pointer; padding: 0; line-height: 1;"
          onclick={() => handleUploadFileDelete(attachment)}
          aria-label="删除附件"
        >
          ×
        </button>
      </span>
    {/each}
  </div>
{/snippet}
