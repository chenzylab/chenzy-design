<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';
  import type { Position } from '@chenzy-design/svelte';

  const tops: Array<[Position, string]> = [['topLeft', 'TL'], ['top', 'Top'], ['topRight', 'TR']];
  const bottoms: Array<[Position, string]> = [['bottomLeft', 'BL'], ['bottom', 'Bottom'], ['bottomRight', 'BR']];

  const card = 'Hi ByteDancer, this is a popover.';
</script>

<div style="padding: 24px 40px;">
  <div style="margin-left: 40px; white-space: nowrap;">
    {#each tops as [pos, label] (pos)}
      <Popover content={card} position={pos} showArrow>
        <Tag style="margin: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="margin-left: 40px; margin-top: 8px; white-space: nowrap;">
    {#each bottoms as [pos, label] (pos)}
      <Popover content={card} position={pos} showArrow>
        <Tag style="margin: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
</div>
