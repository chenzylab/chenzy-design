<script lang="ts">
  // 最小展示数目：collapse 模式下 minVisibleItems 保证至少展示 N 项，不会折叠到更少（对齐 Semi 文档 demo 3）。
  import { OverflowList, Tag, Slider, Text } from '@chenzy-design/svelte';

  interface Item {
    key: string;
  }

  const items: Item[] = [
    { key: 'alarm' },
    { key: 'bookmark' },
    { key: 'camera' },
    { key: 'duration' },
    { key: 'edit' },
    { key: 'folder' },
  ];

  let width = $state(100);
</script>

<Text type="tertiary">minVisibleItems=&#123;3&#125;：即使容器很窄也至少保留 3 个可见项</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items} minVisibleItems={3}>
    {#snippet visibleItemRenderer(item)}
      <Tag color="blue" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
