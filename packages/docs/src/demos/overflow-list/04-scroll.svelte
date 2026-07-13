<script lang="ts">
  // 滚动模式：renderMode="scroll" 不折叠，可见层为可横向滚动容器，溢出项靠滚动查看（对齐 Semi 文档 demo 4）。
  // overflowRenderer 被调用两次，分别渲染 [头部溢出项, 尾部溢出项]，作为两端的计数指示。
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

  let width = $state(60);
</script>

<Text type="tertiary">renderMode="scroll"：不折叠，容器内横向滚动查看溢出项；两端显示已隐藏计数</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items} renderMode="scroll">
    {#snippet visibleItemRenderer(item)}
      <span class="item-cls" style="flex:0 0 auto">
        <Tag color="primary" style="margin-right:8px">{item.key}</Tag>
      </span>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}
        <Tag style="margin:0 8px;flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>
      {/if}
    {/snippet}
  </OverflowList>
</div>
