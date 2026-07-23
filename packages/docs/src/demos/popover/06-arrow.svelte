<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';
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

{#snippet content()}
  <article>
    Hi ByteDancer, this is a popover.
    <br /> We have 2 lines.
  </article>
{/snippet}

<div style="padding-left: 40px;">
  <div style="margin-left: 40px; white-space: nowrap;">
    {#each tops as [pos, label] (pos)}
      <Popover showArrow {content} position={pos}>
        <Tag style="margin-right: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="width: 40px; float: left;">
    {#each lefts as [pos, label] (pos)}
      <Popover showArrow {content} position={pos}>
        <Tag style="margin-right: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="width: 40px; margin-left: 180px;">
    {#each rights as [pos, label] (pos)}
      <Popover showArrow {content} position={pos}>
        <Tag style="margin-right: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="margin-left: 40px; clear: both; white-space: nowrap;">
    {#each bottoms as [pos, label] (pos)}
      <Popover showArrow {content} position={pos}>
        <Tag style="margin-right: 8px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
</div>
