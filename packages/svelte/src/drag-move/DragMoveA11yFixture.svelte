<script lang="ts">
  // DragMove a11y 测试夹具：约束在父容器，纯 pointer（对齐 Semi，无键盘）。
  import DragMove from './DragMove.svelte';
</script>

<div style="position:relative;height:300px;width:300px">
  <DragMove constrainer="parent">
    <div style="width:80px;height:60px;padding:8px">card</div>
  </DragMove>
</div>
