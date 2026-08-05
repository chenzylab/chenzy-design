<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <Resizable
    lockAspectRatio
    defaultSize={{ width: 400, height: 300 }}
    style="margin-bottom: 10px; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">lock</div>
  </Resizable>

  <Resizable
    lockAspectRatio={16 / 9}
    defaultSize={{ width: 200, height: (200 * 9) / 16 }}
    style="border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">16 / 9</div>
  </Resizable>
</div>
