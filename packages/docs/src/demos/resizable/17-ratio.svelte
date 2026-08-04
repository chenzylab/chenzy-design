<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // ratio：拖动与实际变化的比例，ratio=2 时拖动 1px、尺寸变化 2px。
</script>

<Resizable
  enable={{ right: true, bottom: true, bottomRight: true }}
  defaultSize={{ width: 200, height: 200 }}
  ratio={2}
  class="demo-box"
>
  <div class="demo-content">ratio=2</div>
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
