<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';

  const panels = [
    { key: '1', header: '箭头在左' },
    { key: '2', header: '展开此面板' },
  ];
</script>

<Collapse {panels} expandIconPosition="left" defaultActiveKey="1">
  {#snippet children({ key })}
    {#if key === '1'}
      <p>通过 expandIconPosition="left" 将展开箭头移到左侧。</p>
    {:else}
      <p>面板二的内容。</p>
    {/if}
  {/snippet}
</Collapse>
