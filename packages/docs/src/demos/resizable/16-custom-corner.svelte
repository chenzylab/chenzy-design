<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // 自定义边角 handler：handleNode 放内容、handleStyle 调样式、handleClass 加类名。
</script>

{#snippet corner()}
  <div class="corner" aria-hidden="true"></div>
{/snippet}

<Resizable
  enable={{ bottomRight: true }}
  defaultSize={{ width: 240, height: 160 }}
  minWidth={120}
  minHeight={80}
  handleNode={{ bottomRight: corner }}
  handleStyle={{ bottomRight: 'width: 16px; height: 16px; right: -8px; bottom: -8px' }}
  handleClass={{ bottomRight: 'my-corner-handle' }}
  class="demo-box"
>
  <div class="demo-content">自定义右下角 handler ↘</div>
</Resizable>

<style>
  :global(.demo-box) {
    position: relative;
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
  .corner {
    width: 100%;
    height: 100%;
    border-right: 3px solid var(--cd-color-primary);
    border-bottom: 3px solid var(--cd-color-primary);
    border-bottom-right-radius: 4px;
  }
</style>
