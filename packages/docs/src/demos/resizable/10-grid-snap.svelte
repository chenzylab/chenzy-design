<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // grid：调整大小时对齐到 100px 的增量；snapGap：接近下一个网格目标 20px 内才吸附。
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <Resizable
    defaultSize={{ width: '60%', height: 300 }}
    grid={100}
    snapGap={20}
    style="margin-left: 20%; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">snap</div>
  </Resizable>
</div>
