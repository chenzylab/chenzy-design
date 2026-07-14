<script lang="ts">
  // 折叠方向：collapse 模式下 collapseFrom="start" 从头部折叠，尾部项保持可见（对齐 Semi 文档 demo 2）。
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

<Text type="tertiary">collapseFrom="start"：折叠节点渲染在头部，尾部最新项保持可见</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items} collapseFrom="start">
    {#snippet visibleItemRenderer(item)}
      <Tag color="blue" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="margin-right:8px;flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
