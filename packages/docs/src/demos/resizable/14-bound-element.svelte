<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // boundElement="parent"：伸缩框不能超出父容器边界（对齐 Semi）。
</script>

<div class="bound-box">
  <Resizable
    enable={{ right: true, bottom: true, bottomRight: true }}
    defaultSize={{ width: 160, height: 120 }}
    minWidth={80}
    minHeight={60}
    boundElement="parent"
    class="demo-box"
  >
    <div class="demo-content">拖不出虚线父容器</div>
  </Resizable>
</div>

<style>
  .bound-box {
    width: 360px;
    height: 240px;
    max-width: 100%;
    border: 1px dashed var(--cd-color-primary);
    border-radius: var(--cd-border-radius-medium);
    padding: 8px;
    box-sizing: border-box;
  }
  :global(.demo-box) {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
  }
  .demo-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 12px;
    text-align: center;
    color: var(--cd-color-text-1);
  }
</style>
