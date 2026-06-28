<script lang="ts">
  import { VirtualList, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `第 ${i + 1} 行` }));
</script>

<Text type="tertiary">固定行高（1 万行，itemSize=36，仅渲染视口内行）</Text>
<div style="width:320px; border:1px solid var(--cd-color-border); border-radius:8px; margin-top:8px">
  <VirtualList {data} height={200} itemSize={36} getKey={(it) => it.id}>
    {#snippet renderItem(item)}
      <div style="padding:0 12px; line-height:36px; border-bottom:1px solid var(--cd-color-border)">
        {(item as { text: string }).text}
      </div>
    {/snippet}
  </VirtualList>
</div>
