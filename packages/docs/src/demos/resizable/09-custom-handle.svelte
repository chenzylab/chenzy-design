<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // handleNode 自定义某方向把手的内容（这里右边缘放一个可见的抓握条）。
</script>

{#snippet rightGrip()}
  <div class="grip" aria-hidden="true">
    <span></span><span></span><span></span>
  </div>
{/snippet}

<Resizable
  enable={{ right: true }}
  defaultSize={{ width: 260, height: 160 }}
  minWidth={140}
  maxWidth={480}
  handleNode={{ right: rightGrip }}
  class="demo-box"
>
  <div class="demo-content">右边缘自定义抓握条 →</div>
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
    color: var(--cd-color-text-1);
  }
  .grip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 100%;
    height: 100%;
    background: var(--cd-color-primary-light-default);
  }
  .grip span {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--cd-color-primary);
  }
</style>
