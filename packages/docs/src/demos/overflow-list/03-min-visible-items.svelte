<script lang="ts">
  // collapse 模式下 minVisibleItems 设置最小展示的数目（对齐 Semi）。
  import { OverflowList, Tag, Slider } from '@chenzy-design/svelte';
  import {
    IconAlarm,
    IconBookmark,
    IconCamera,
    IconDuration,
    IconEdit,
    IconFolder,
  } from '@chenzy-design/icons';

  const items = [
    { icon: IconAlarm, key: 'alarm' },
    { icon: IconBookmark, key: 'bookmark' },
    { icon: IconCamera, key: 'camera' },
    { icon: IconDuration, key: 'duration' },
    { icon: IconEdit, key: 'edit' },
    { icon: IconFolder, key: 'folder' },
  ];

  let width = $state(100);
</script>

<Slider step={1} value={width} onChange={(v) => (width = typeof v === 'number' ? v : (v[0] ?? 100))} />
<br />
<br />
<div style="width:{width}%">
  <OverflowList {items} minVisibleItems={3}>
    {#snippet visibleItemRenderer(item)}
      {@const Icon = item.icon}
      <Tag color="blue" contentAlign="center" style="margin-right:8px;flex:0 0 auto">
        <Icon style="margin-right:4px" />{item.key}
      </Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
