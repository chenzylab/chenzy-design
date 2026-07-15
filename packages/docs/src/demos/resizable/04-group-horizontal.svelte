<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 组合基本使用：defaultSize 支持多单位——px（400px）、百分比（20%）、
  // 纯数字比例（0.5 / 1，按比例分配剩余空间）。
</script>

<ResizeGroup direction="horizontal" class="demo-group">
  <ResizeItem defaultSize="400px" min="120px">
    <div class="pane">400px</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem defaultSize="20%">
    <div class="pane">20%</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem defaultSize="0.5">
    <div class="pane">比例 0.5</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem defaultSize={1}>
    <div class="pane">比例 1</div>
  </ResizeItem>
</ResizeGroup>

<style>
  :global(.demo-group) {
    height: 200px;
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
