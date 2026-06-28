<script lang="ts">
  import { ResizeObserver, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">拖拽右下角调整容器大小，实时显示尺寸</Text>
<div style="margin-top:8px; resize:both; overflow:auto; width:280px; height:120px; min-width:160px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px">
  <ResizeObserver>
    {#snippet children({ width, height })}
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
        {Math.round(width)} × {Math.round(height)} px
      </div>
    {/snippet}
  </ResizeObserver>
</div>
