<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';
  import type { Position } from '@chenzy-design/svelte';

  const tops: Array<[Position, string]> = [['topLeft', 'TL'], ['top', 'Top'], ['topRight', 'TR']];

  const card = 'Hi ByteDancer, this is a popover.';
</script>

<div style="padding: 24px 40px;">
  <div style="margin-left: 40px; white-space: nowrap;">
    {#each tops as [pos, label] (pos)}
      <Popover content={card} position={pos} showArrow arrowPointAtCenter>
        <Tag style="margin: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
</div>
