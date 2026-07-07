<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 双击把手折叠/展开左侧面板（本库相较 Semi 额外提供）。
</script>

<p class="demo-tip">双击中间把手：折叠 / 展开左侧栏</p>

<ResizeGroup direction="horizontal" class="demo-group">
  <ResizeItem defaultSize="30%" min="0px">
    <div class="pane">侧栏（双击把手折叠）</div>
  </ResizeItem>
  <ResizeHandler collapsible />
  <ResizeItem>
    <div class="pane">主区</div>
  </ResizeItem>
</ResizeGroup>

<style>
  .demo-tip {
    font-size: 13px;
    color: var(--cd-color-text-2);
    margin: 0 0 12px;
  }
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
</style>
