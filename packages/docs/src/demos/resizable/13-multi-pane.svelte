<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 三面板 + 两把手；中间那个把手 disabled（锁定，不可拖），仅首尾两把手可调。
</script>

<ResizeGroup direction="horizontal" class="demo-group">
  <ResizeItem defaultSize="25%" min="80px">
    <div class="pane">A（可拖）</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem defaultSize="50%">
    <div class="pane">B（右侧把手锁定）</div>
  </ResizeItem>
  <ResizeHandler disabled />
  <ResizeItem min="80px">
    <div class="pane pane--locked">C（左侧把手锁定）</div>
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
    padding: 0 8px;
    text-align: center;
    color: var(--cd-color-text-1);
    background: var(--cd-color-fill-0);
  }
  .pane--locked {
    background: var(--cd-color-fill-1);
  }
</style>
