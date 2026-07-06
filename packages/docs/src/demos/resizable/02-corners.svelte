<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';
</script>

<Resizable
  enable={{ topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
  defaultSize={{ width: 220, height: 160 }}
  minWidth={100}
  minHeight={80}
  maxWidth={420}
  maxHeight={320}
  class="demo-box"
>
  <div class="demo-content">四角自由缩放</div>
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
