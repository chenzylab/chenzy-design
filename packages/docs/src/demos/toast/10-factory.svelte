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

<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start">
  <Button onclick={() => Toast.info('Default Toast')}>Default Toast</Button>
  <Button onclick={showInContainer}>Toast in custom container</Button>
</div>
<div
  bind:this={containerEl}
  style="position:relative; margin-top:16px; padding:12px; min-height:80px; border:1px dashed var(--cd-color-border)"
>
  custom container
</div>
