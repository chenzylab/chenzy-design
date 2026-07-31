<script lang="ts">
  // 对齐 Semi「操作区域」：通过 renderActionArea 自定义输入框右下角操作区，
  // 参数带 canSend / generating，可据此决定渲染发送还是停止。
  import { AIChatInput, Button } from '@chenzy-design/svelte';

  let last = $state('');
</script>

<AIChatInput
  onMessageSend={(m) => (last = JSON.stringify(m.inputContents ?? []).slice(0, 60))}
  renderActionArea={actionArea}
/>

{#if last}
  <p style="margin-top: 8px; color: var(--cd-color-text-2);">已发送：{last}</p>
{/if}

{#snippet actionArea({ canSend, generating }: { canSend: boolean; generating: boolean })}
  <div style="display: flex; gap: 8px; align-items: center;">
    <Button size="small" type="tertiary" theme="borderless" disabled={generating}>草稿</Button>
    <Button size="small" theme="solid" disabled={!canSend}>
      {generating ? '生成中' : '发送'}
    </Button>
  </div>
{/snippet}
