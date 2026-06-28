<script lang="ts">
  import { VirtualList, Text } from '@chenzy-design/svelte';

  // 横向虚拟化：itemSize 作列宽，沿 x 轴排列、读写 scrollLeft（仅支持 fixed 定宽）。
  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, n: i + 1 }));
</script>

<Text type="tertiary">横向虚拟化（horizontal，列宽 80px，1 万列只渲染视口列）</Text>
<div
  style="width:360px; height:96px; border:1px solid var(--cd-color-border); border-radius:8px; margin-top:8px"
>
  <VirtualList {data} horizontal height="360px" itemSize={80} getKey={(it) => it.id}>
    {#snippet renderItem(item)}
      <div
        style="display:flex; align-items:center; justify-content:center; height:100%; border-right:1px solid var(--cd-color-border); font-variant-numeric:tabular-nums"
      >
        {(item as { n: number }).n}
      </div>
    {/snippet}
  </VirtualList>
</div>
