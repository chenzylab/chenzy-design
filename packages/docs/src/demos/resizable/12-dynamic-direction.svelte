<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler, Button } from '@chenzy-design/svelte';

  // 动态方向：运行时切换 horizontal / vertical。
  let direction = $state<'horizontal' | 'vertical'>('horizontal');
</script>

<div class="demo-toolbar">
  <Button
    size="small"
    onclick={() => (direction = direction === 'horizontal' ? 'vertical' : 'horizontal')}
  >
    切换方向（当前：{direction}）
  </Button>
</div>

{#key direction}
  <ResizeGroup {direction} class="demo-group">
    <ResizeItem defaultSize="40%" min="60px">
      <div class="pane">面板 A</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem min="60px">
      <div class="pane">面板 B</div>
    </ResizeItem>
  </ResizeGroup>
{/key}

<style>
  .demo-toolbar {
    margin-bottom: 12px;
  }
  :global(.demo-group) {
    height: 240px;
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
