<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';

  const panels = [
    { key: '1', header: '面板一' },
    { key: '2', header: '面板二' },
    { key: '3', header: '面板三' },
  ];
</script>

<Collapse {panels} defaultActiveKey="1">
  {#snippet children({ key })}
    {#if key === '1'}
      <p>面板一的内容，折叠面板用于承载大量内容，节省页面空间。</p>
    {:else if key === '2'}
      <p>面板二的内容。</p>
    {:else}
      <p>面板三的内容。</p>
    {/if}
  {/snippet}
</Collapse>
