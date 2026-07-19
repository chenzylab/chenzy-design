<script lang="ts">
  // 对齐 Semi「自定义拖动后的位置处理」：传 customMove 后组件不再写 top/left，
  // 由回调自定义应用位置（这里用 transform 平移替代 top/left）。
  import { DragMove } from '@chenzy-design/svelte';

  function customMove(el: HTMLElement, top: number, left: number) {
    el.style.transform = `translate(${left}px, ${top}px)`;
  }
</script>

<div class="demo-stage">
  <DragMove {customMove}>
    <div class="demo-card">customMove 平移</div>
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
</style>
