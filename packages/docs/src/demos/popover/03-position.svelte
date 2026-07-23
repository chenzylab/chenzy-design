<script lang="ts">
  import {
    Popover,
    Tag,
    Empty,
    IllustrationSuccess,
    IllustrationSuccessDark,
  } from '@chenzy-design/svelte';
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

{#snippet image()}
  <IllustrationSuccess style="width: 150px; height: 150px;" />
{/snippet}
{#snippet darkImage()}
  <IllustrationSuccessDark style="width: 150px; height: 150px;" />
{/snippet}

{#snippet article()}
  <Empty
    title="先进的设计 / 研发协作方式"
    imageSlot={image}
    darkModeImageSlot={darkImage}
    description="使用 Semi D2C 快速还原 Figma 设计稿，一键转代码"
    style="width: 400px; margin: 0 auto; display: flex; padding: 20px;"
  />
{/snippet}

<div>
  <div style="margin-left: 80px; white-space: nowrap;">
    {#each tops as [pos, label] (pos)}
      <Popover content={article} position={pos}>
        <Tag style="margin: 8px; padding: 20px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="width: 80px; float: left;">
    {#each lefts as [pos, label] (pos)}
      <Popover content={article} position={pos}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="width: 40px; margin-left: 300px;">
    {#each rights as [pos, label] (pos)}
      <Popover content={article} position={pos}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
  <div style="margin-left: 80px; clear: both; white-space: nowrap;">
    {#each bottoms as [pos, label] (pos)}
      <Popover content={article} position={pos}>
        <Tag style="margin: 8px; padding: 20px; width: 60px;">{label}</Tag>
      </Popover>
    {/each}
  </div>
</div>
