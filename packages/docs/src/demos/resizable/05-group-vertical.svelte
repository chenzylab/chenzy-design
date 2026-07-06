<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';
</script>

<ResizeGroup direction="vertical" class="demo-group">
  <ResizeItem defaultSize="40%" min="60px">
    <div class="pane">上 40%</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem min="60px">
    <div class="pane">下（拖把手上下联动）</div>
  </ResizeItem>
</ResizeGroup>

<style>
  :global(.demo-group) {
    height: 260px;
    width: 320px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    overflow: hidden;
  }
  .pane {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--cd-color-text-1);
    background: var(--cd-color-fill-0);
  }
</style>
