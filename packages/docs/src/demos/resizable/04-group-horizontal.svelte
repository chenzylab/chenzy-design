<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';
</script>

<ResizeGroup direction="horizontal" class="demo-group">
  <ResizeItem defaultSize="30%" min="120px">
    <div class="pane">侧栏 30%</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem>
    <div class="pane">主区（拖中间把手联动）</div>
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
