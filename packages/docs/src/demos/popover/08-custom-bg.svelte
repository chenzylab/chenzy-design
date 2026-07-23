<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';

  let parent: HTMLDivElement;
</script>

<div id="popup-parent" bind:this={parent} style="position: relative;">
  <Popover
    getPopupContainer={() => parent}
    trigger="custom"
    visible
    position="right"
    showArrow
    arrowStyle={{
      borderColor: 'var(--cd-color-blue-4)',
      backgroundColor: 'var(--cd-color-blue-4)',
    }}
    style="background-color: var(--cd-color-blue-4); border-color: var(--cd-color-blue-4); color: var(--cd-color-white); border-width: 1px; border-style: solid;"
  >
    {#snippet content()}
      <article style="padding: 4px;">Hi, chenzy-design Popover.</article>
    {/snippet}
    <Tag style="background-color: var(--cd-color-blue-4); color: var(--cd-color-white);">
      Colorful Popover
    </Tag>
  </Popover>
</div>
