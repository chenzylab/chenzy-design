<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';
</script>

<div style="width: 500px; max-width: 100%;">
  <Resizable
    enable={{ right: true }}
    defaultSize={{ width: 240, height: 140 }}
    minWidth={120}
    maxWidth={480}
    style="border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">拖右边缘调宽</div>
  </Resizable>
</div>
