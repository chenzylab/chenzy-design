<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // scale：外层缩放 0.5 时，把 scale=0.5 传给 Resizable 修正拖拽 delta，
  // 让指针位移与元素尺寸变化保持一致。
</script>

<div class="scale-wrap">
  <Resizable
    enable={{ right: true, bottom: true, bottomRight: true }}
    defaultSize={{ width: 320, height: 200 }}
    minWidth={120}
    minHeight={80}
    scale={0.5}
    class="demo-box"
  >
    <div class="demo-content">scale 0.5</div>
  </Resizable>
</div>

<style>
  .scale-wrap {
    width: 500px;
    max-width: 100%;
    transform: scale(0.5);
    transform-origin: 0 0;
  }
  :global(.demo-box) {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
  }
  .demo-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--cd-color-text-1);
  }
</style>
