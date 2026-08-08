<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // scale：外层缩放 0.5 时，把 scale=0.5 传给 Resizable 修正拖拽 delta，
  // 让指针位移与元素尺寸变化保持一致。
</script>

<div style="width: 500px; height: 60%; max-width: 100%; transform: scale(0.5); transform-origin: 0 0;">
  <Resizable
    defaultSize={{ width: '60%', height: '60%' }}
    scale={0.5}
    style="border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">scale 0.5</div>
  </Resizable>
</div>
