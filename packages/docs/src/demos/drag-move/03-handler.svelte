<script lang="ts">
  import { DragMove } from '@chenzy-design/svelte';

  let titleEl = $state<HTMLElement | null>(null);
</script>

<div class="demo-stage">
  <DragMove handler={() => titleEl!} constrainer="parent" style="top:20px;left:20px">
    <div class="demo-panel">
      <div bind:this={titleEl} class="demo-title">标题栏（把手）</div>
      <div class="demo-body">正文区域不可拖拽，只有标题栏能拖</div>
    </div>
  </DragMove>
</div>

<style>
  .demo-stage {
    position: relative;
    height: 260px;
    border: 1px dashed var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    overflow: hidden;
  }
  :global(.demo-panel) {
    width: 200px;
    background: var(--cd-color-fill-0);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    overflow: hidden;
  }
  .demo-title {
    padding: 8px 12px;
    background: var(--cd-color-fill-1);
    color: var(--cd-color-text-0);
    cursor: move;
  }
  .demo-body {
    padding: 12px;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-body);
  }
</style>
