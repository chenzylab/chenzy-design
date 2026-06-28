<script lang="ts">
  import { VirtualList, Text } from '@chenzy-design/svelte';

  // 不定高数据：每行文本长度随机，行高由内容撑开（itemSize='auto'）。
  const lorem =
    '虚拟列表只渲染视口内的行，配合 ResizeObserver 实测每行真实高度并修正偏移。';
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `第 ${i + 1} 条 — ${lorem.slice(0, 6 + (i % 30))}`,
  }));
</script>

<Text type="tertiary">动态/不定高（itemSize='auto'，估算 56px，实测后修正偏移）</Text>
<div style="width:360px; border:1px solid var(--cd-color-border); border-radius:8px; margin-top:8px">
  <VirtualList {data} height={240} itemSize="auto" estimatedItemSize={56} getKey={(it) => it.id}>
    {#snippet renderItem(item)}
      <div style="padding:10px 12px; border-bottom:1px solid var(--cd-color-border)">
        {(item as { text: string }).text}
      </div>
    {/snippet}
  </VirtualList>
</div>
