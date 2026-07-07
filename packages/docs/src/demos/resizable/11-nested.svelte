<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 嵌套：外层水平分栏，右侧面板内再套一个垂直分栏。典型 IDE 三区布局。
</script>

<ResizeGroup direction="horizontal" class="demo-group">
  <ResizeItem defaultSize="25%" min="120px">
    <div class="pane">左：导航</div>
  </ResizeItem>
  <ResizeHandler />
  <ResizeItem>
    <ResizeGroup direction="vertical" class="demo-inner">
      <ResizeItem defaultSize="65%">
        <div class="pane">右上：编辑区</div>
      </ResizeItem>
      <ResizeHandler />
      <ResizeItem min="60px">
        <div class="pane">右下：终端</div>
      </ResizeItem>
    </ResizeGroup>
  </ResizeItem>
</ResizeGroup>

<style>
  :global(.demo-group) {
    height: 260px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    overflow: hidden;
  }
  :global(.demo-inner) {
    height: 100%;
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
