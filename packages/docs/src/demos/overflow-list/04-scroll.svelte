<script lang="ts">
  // renderMode="scroll" 滚动模式的折叠列表（对齐 Semi）。
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
  <OverflowList {items} renderMode="scroll">
    {#snippet visibleItemRenderer(item)}
      {@const Icon = item.icon}
      <span class="item-cls">
        <Tag color="blue" contentAlign="center" style="margin-right:8px;flex:0 0 auto">
          <Icon style="margin-right:4px" />{item.key}
        </Tag>
      </span>
    {/snippet}
    {#snippet overflowRenderer(overflow)}
      {#if overflow.length}<Tag style="margin-right:8px;margin-left:8px;flex:0 0 auto;font-variant-numeric:tabular-nums">+{overflow.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
