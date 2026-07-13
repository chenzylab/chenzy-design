<script lang="ts">
  import { Tooltip, Tag } from '@chenzy-design/svelte';
  import type { Position } from '@chenzy-design/svelte';

  const tops: Array<[Position, string]> = [
    ['topLeft', 'TL'],
    ['top', 'Top'],
    ['topRight', 'TR'],
  ];
  const lefts: Array<[Position, string]> = [
    ['leftTop', 'LT'],
    ['left', 'Left'],
    ['leftBottom', 'LB'],
  ];
  const rights: Array<[Position, string]> = [
    ['rightTop', 'RT'],
    ['right', 'Right'],
    ['rightBottom', 'RB'],
  ];
  const bottoms: Array<[Position, string]> = [
    ['bottomLeft', 'BL'],
    ['bottom', 'Bottom'],
    ['bottomRight', 'BR'],
  ];
</script>

<div style="padding: 24px;">
  <div style="margin-left: 80px; white-space: nowrap;">
    {#each tops as [pos, label] (pos)}
      <Tooltip content="hi bytedance" position={pos} arrowPointAtCenter={false}>
        <Tag style="margin: 8px; padding: 20px;">{label}</Tag>
      </Tooltip>
    {/each}
  </div>
  <div style="width: 80px; float: left;">
    {#each lefts as [pos, label] (pos)}
      <Tooltip content="hi bytedance" position={pos} arrowPointAtCenter={false}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Tooltip>
    {/each}
  </div>
  <div style="width: 40px; margin-left: 300px;">
    {#each rights as [pos, label] (pos)}
      <Tooltip content="hi bytedance" position={pos} arrowPointAtCenter={false}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Tooltip>
    {/each}
  </div>
  <div style="margin-left: 80px; clear: both; white-space: nowrap;">
    {#each bottoms as [pos, label] (pos)}
      <Tooltip content="hi bytedance" position={pos} arrowPointAtCenter={false}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Tooltip>
    {/each}
  </div>
</div>
