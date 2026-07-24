<script lang="ts">
  import { Image } from '@chenzy-design/svelte';
  import { IconUploadError } from '@chenzy-design/icons';
</script>

<div style="display: flex; align-items: center; flex-direction: column;">
  <span>加载失败默认样式</span>
  <Image width={200} height={200} src="https://load-error.jpeg" />
  <br />
  <span>自定义加载失败占位图</span>
  <Image width={200} height={200} src="https://load-error.jpeg" fallback={fallbackNode} />
</div>

{#snippet fallbackNode()}
  <IconUploadError style="font-size: 50px;" />
{/snippet}
