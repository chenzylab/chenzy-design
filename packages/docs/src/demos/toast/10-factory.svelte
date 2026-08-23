<script lang="ts">
  import { Toast, ToastFactory, Button } from '@chenzy-design/svelte';

  // 如需使用不同 config 的 Toast，可用 ToastFactory.create(config) 创建新的 Toast（对齐 Semi）。
  // 常用于覆盖全局配置，如 getPopupContainer 指定自定义容器。
  let containerEl = $state<HTMLElement | null>(null);
  let custom: ReturnType<typeof ToastFactory.create> | null = null;

  function showInContainer() {
    custom ??= ToastFactory.create({ getPopupContainer: () => containerEl });
    custom.info('Toast in some container');
  }
</script>

<div>
  <Button onclick={() => Toast.info('Default Toast')}>Default Toast</Button>
  <br />
  <br />
  <Button onclick={showInContainer}>Toast in custom container</Button>
  <div bind:this={containerEl} class="custom-toast-container">custom container</div>
</div>

<style>
  /* 对齐 Semi getPopupContainer 文档说明：自定义容器场景需要 container 与内部
     .cd-toast-wrapper 都设 position:relative，toast 才会真实显示在容器内部
    （否则 wrapper 仍相对视口固定，仅 DOM 树位置改变，视图渲染位置不变）。 */
  .custom-toast-container {
    position: relative;
  }
  .custom-toast-container :global(.cd-toast-wrapper) {
    position: relative;
  }
</style>
