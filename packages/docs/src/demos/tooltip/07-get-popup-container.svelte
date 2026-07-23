<script lang="ts">
  import { Tooltip, Tag } from '@chenzy-design/svelte';

  let wrapperEl = $state<HTMLDivElement | null>(null);
</script>

<div id="tooltip-wrapper" style="position: relative;" bind:this={wrapperEl}>
  <Tooltip
    position="right"
    content="浮层被渲染至#tooltip-wrapper元素中"
    trigger="click"
    getPopupContainer={() => wrapperEl}
  >
    <Tag>点击此处</Tag>
  </Tooltip>
</div>
