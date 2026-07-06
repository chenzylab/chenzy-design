<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';
</script>

<Resizable
  enable={{ right: true }}
  defaultSize={{ width: 240, height: 140 }}
  minWidth={120}
  maxWidth={480}
  class="demo-box"
>
  <div class="demo-content">拖右边缘调宽</div>
</Resizable>

<style>
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
    color: var(--cd-color-text-1);
  }
</style>
