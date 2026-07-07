<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // 不设 enable，八个方向（4 边 + 4 角）把手全部启用。
</script>

<Resizable
  defaultSize={{ width: 280, height: 180 }}
  minWidth={120}
  minHeight={100}
  maxWidth={480}
  maxHeight={320}
  class="demo-box"
>
  <div class="demo-content">八方向把手：拖任意边或角</div>
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
    padding: 0 16px;
    text-align: center;
    color: var(--cd-color-text-1);
  }
</style>
