<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // handleNode 自定义某方向把手的内容（这里右边缘放一个可见的抓握条）。
</script>

{#snippet rightGrip()}
  <div
    aria-hidden="true"
    style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; width: 100%; height: 100%; background: var(--cd-color-primary-light-default);"
  >
    <span style="width: 3px; height: 3px; border-radius: 50%; background: var(--cd-color-primary);"></span>
    <span style="width: 3px; height: 3px; border-radius: 50%; background: var(--cd-color-primary);"></span>
    <span style="width: 3px; height: 3px; border-radius: 50%; background: var(--cd-color-primary);"></span>
  </div>
{/snippet}

<div style="width: 500px; height: 60%; max-width: 100%;">
  <Resizable
    defaultSize={{ width: '60%', height: 300 }}
    handleNode={{ right: rightGrip }}
    style="margin-left: 20%; position: relative; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">right</div>
  </Resizable>
</div>
