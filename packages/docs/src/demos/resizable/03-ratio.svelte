<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // ratio：拖动与实际变化的比例，ratio=2 时拖动 1px、尺寸变化 2px。
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <Resizable
    defaultSize={{ width: 200, height: 200 }}
    ratio={2}
    style="border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">ratio=2</div>
  </Resizable>
</div>
