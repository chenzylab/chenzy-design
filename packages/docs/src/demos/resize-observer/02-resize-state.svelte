<script lang="ts">
  import { ResizeObserver, Text, Tag } from '@chenzy-design/svelte';

  let resizing = $state(false);
  let last = $state<{ width: number; height: number } | null>(null);
</script>

<Text type="tertiary">拖拽调整时显示“调整中”，松手静默后提交“调整完成”</Text>
<div style="margin-top:8px; display:flex; align-items:center; gap:8px">
  <Tag color={resizing ? 'warning' : 'success'}>
    {resizing ? '调整中…' : '空闲'}
  </Tag>
  {#if last}
    <Text type="tertiary" size="small">
      已提交 {Math.round(last.width)} × {Math.round(last.height)} px
    </Text>
  {/if}
</div>
<div style="margin-top:8px; resize:both; overflow:auto; width:280px; height:120px; min-width:160px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px">
  <ResizeObserver
    debounce={120}
    onResizeStart={() => (resizing = true)}
    onResizeEnd={(e) => {
      resizing = false;
      last = { width: e.width, height: e.height };
    }}
  >
    {#snippet children({ width, height })}
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
        {Math.round(width)} × {Math.round(height)} px
      </div>
    {/snippet}
  </ResizeObserver>
</div>
