<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';
</script>

<div class="row">
  <Resizable
    lockAspectRatio
    enable={{ bottomRight: true }}
    defaultSize={{ width: 200, height: 120 }}
    minWidth={100}
    class="demo-box"
  >
    <div class="demo-content">锁比例 (5:3)</div>
  </Resizable>

  <Resizable
    grid={[24, 24]}
    enable={{ right: true, bottom: true, bottomRight: true }}
    defaultSize={{ width: 216, height: 144 }}
    minWidth={96}
    class="demo-box"
  >
    <div class="demo-content">网格吸附 24px</div>
  </Resizable>
</div>

<style>
  .row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
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
    color: var(--cd-color-text-1);
  }
</style>
