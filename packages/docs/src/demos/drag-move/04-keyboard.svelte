<script lang="ts">
  import { DragMove } from '@chenzy-design/svelte';
</script>

<div class="demo-stage">
  <DragMove keyboard keyboardStep={20} constrainer="parent" style="top:20px;left:20px">
    <div class="demo-card">聚焦后按方向键移动</div>
  </DragMove>
</div>

<style>
  .demo-stage {
    position: relative;
    height: 240px;
    border: 1px dashed var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    overflow: hidden;
  }
  :global(.demo-card) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 72px;
    background: var(--cd-color-fill-0);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    color: var(--cd-color-text-1);
  }
</style>
