<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // 通过 maxHeight/maxWidth/minHeight/minWidth 设置最大、最小宽高。
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <Resizable
    maxWidth={200}
    maxHeight={300}
    minWidth={50}
    minHeight={50}
    defaultSize={{ width: 100, height: 100 }}
    style="margin-left: 20%; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">width在50到200之间，height在50到300之间</div>
  </Resizable>
</div>
