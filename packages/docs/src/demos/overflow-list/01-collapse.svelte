<script lang="ts">
  // 折叠模式（默认）：renderMode="collapse"，容器放不下时把溢出项收纳为 +N（对齐 Semi 文档 demo 1）。
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

  // Slider 受控不回写：值 + onChange 回填
  let width = $state(100);
</script>

<Text type="tertiary">拖动滑块改变容器宽度，溢出标签自动折叠进 +N</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items}>
    {#snippet visibleItemRenderer(item)}
      <Tag color="primary" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
