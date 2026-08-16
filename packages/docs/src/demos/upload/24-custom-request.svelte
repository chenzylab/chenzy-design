<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { CustomRequestArgs } from '@chenzy-design/svelte';

  function mockRequest({ onProgress, onSuccess }: CustomRequestArgs): void {
    let count = 0;
    const interval = setInterval(() => {
      if (count === 100) {
        clearInterval(interval);
        onSuccess(undefined);
        return;
      }
      onProgress({ total: 100, loaded: count });
      count += 20;
    }, 500);
  }
</script>

<Upload action="https://api.semi.design/upload" customRequest={mockRequest}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>
