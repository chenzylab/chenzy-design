<script lang="ts">
  // observerProperty（对齐 Semi observerProperty）：只关心某一维度时，
  // 另一维度单独变化不触发回调。下方两个容器分别只听宽 / 只听高。
  import { ResizeObserver, Text, Tag } from '@chenzy-design/svelte';

  let widthHits = $state(0);
  let heightHits = $state(0);
</script>

<Text type="tertiary">同时拖拽宽和高：左侧仅宽度变化才计数，右侧仅高度变化才计数</Text>
<div style="margin-top:8px; display:flex; gap:12px; flex-wrap:wrap">
  <div
    style="resize:both; overflow:auto; width:220px; height:120px; min-width:120px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px"
  >
    <ResizeObserver observerProperty="width" onResize={() => (widthHits += 1)}>
      {#snippet children({ width, height })}
        <div style="padding:12px; display:flex; flex-direction:column; gap:4px">
          <Tag color="blue">observerProperty="width"</Tag>
          <Text type="tertiary" size="small">
            {Math.round(width)} × {Math.round(height)} px · 回调 {widthHits} 次
          </Text>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>
  <div
    style="resize:both; overflow:auto; width:220px; height:120px; min-width:120px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px"
  >
    <ResizeObserver observerProperty="height" onResize={() => (heightHits += 1)}>
      {#snippet children({ width, height })}
        <div style="padding:12px; display:flex; flex-direction:column; gap:4px">
          <Tag color="orange">observerProperty="height"</Tag>
          <Text type="tertiary" size="small">
            {Math.round(width)} × {Math.round(height)} px · 回调 {heightHits} 次
          </Text>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>
</div>
