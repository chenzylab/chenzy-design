<script lang="ts">
  import { Tooltip, Tag } from '@chenzy-design/svelte';

  // 传入 getPopupContainer，浮层将渲染至该函数返回的 DOM 中。
  // 注意：返回容器若不是 document.body，需设 position: relative（对齐 Semi）。
  let wrapperEl = $state<HTMLDivElement | null>(null);
</script>

<div bind:this={wrapperEl} style="position: relative;">
  <Tooltip
    position="right"
    content="浮层被渲染至 #tooltip-wrapper 元素中"
    trigger="click"
    getPopupContainer={() => wrapperEl}
  >
    <Tag>点击此处</Tag>
  </Tooltip>
</div>
