<script lang="ts">
  // 滚动模式相交回调：renderMode="scroll" 下 onIntersect / onVisibleStateChange 上报各项可见性，
  // threshold 控制触发阈值（对齐 Semi stories overlap overflow threshold）。
  import { OverflowList, Tag, Text } from '@chenzy-design/svelte';

  interface Item {
    key: string;
  }

  const items: Item[] = Array.from({ length: 12 }, (_, i) => ({ key: `tab-${i + 1}` }));

  let visibleCount = $state(0);
</script>

<Text type="tertiary">threshold=&#123;0.2&#125;：横向滚动时上报当前可见项数目（onVisibleStateChange）</Text>
<br />
<div style="width:40%">
  <OverflowList
    {items}
    renderMode="scroll"
    threshold={0.2}
    onVisibleStateChange={(state) => {
      let n = 0;
      for (const v of state.values()) if (v) n += 1;
      visibleCount = n;
    }}
  >
    {#snippet visibleItemRenderer(item)}
      <Tag color="blue" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}
        <Tag style="margin:0 8px;flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>
      {/if}
    {/snippet}
  </OverflowList>
</div>
<Text type="tertiary">当前可见项：{visibleCount} / {items.length}</Text>
