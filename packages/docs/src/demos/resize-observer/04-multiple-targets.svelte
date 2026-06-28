<script lang="ts">
  import { ResizeObserver, Text } from '@chenzy-design/svelte';

  // multiple 模式：观测包裹元素的每个直接子元素，onResize 按 target 路由。
  const ids = ['A', 'B', 'C'] as const;
  const sizes = $state<Record<string, { width: number; height: number }>>({});
</script>

<Text type="tertiary">multiple 模式：分别监听三个可独立调整大小的子卡片</Text>
<div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
  {#each ids as id (id)}
    {@const s = sizes[id]}
    <Text type="tertiary" size="small">
      {id}: {s ? `${Math.round(s.width)} × ${Math.round(s.height)}` : '—'} px
    </Text>
  {/each}
</div>
<ResizeObserver
  multiple
  onResize={(e) => {
    const id = (e.target as HTMLElement).dataset.id;
    if (id) sizes[id] = { width: e.width, height: e.height };
  }}
>
  {#snippet children()}
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px">
      {#each ids as id (id)}
        <div
          data-id={id}
          style="resize:both; overflow:auto; width:140px; height:90px; min-width:80px; min-height:60px; display:flex; align-items:center; justify-content:center; border:1px dashed var(--cd-color-border); border-radius:8px; color:var(--cd-color-text-1)"
        >
          卡片 {id}
        </div>
      {/each}
    </div>
  {/snippet}
</ResizeObserver>
