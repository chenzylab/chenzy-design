<script lang="ts">
  import { VirtualList, Button, Space } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `第 ${i + 1} 行` }));

  // 命令式 API：通过 bind:this 拿组件实例引用，调用 scrollToIndex(index, { align }).
  let list = $state<{ scrollToIndex: (i: number, o?: { align?: 'start' | 'center' | 'end' }) => void } | null>(
    null,
  );
</script>

<Space>
  <Button size="small" onclick={() => list?.scrollToIndex(0)}>顶部</Button>
  <Button size="small" onclick={() => list?.scrollToIndex(5000, { align: 'center' })}>
    跳到 5000（居中）
  </Button>
  <Button size="small" onclick={() => list?.scrollToIndex(9999, { align: 'end' })}>末尾</Button>
</Space>
<div style="width:320px; border:1px solid var(--cd-color-border); border-radius:8px; margin-top:8px">
  <VirtualList bind:this={list} {data} height={200} itemSize={36} getKey={(it) => it.id}>
    {#snippet renderItem(item, index)}
      <div style="padding:0 12px; line-height:36px; border-bottom:1px solid var(--cd-color-border)">
        #{index} — {(item as { text: string }).text}
      </div>
    {/snippet}
  </VirtualList>
</div>
