<script lang="ts">
  import { Upload, Button, Toast } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  function onSizeError(file: UploadFileItem) {
    Toast.error(`${file.name} size invalid`);
  }
</script>

<Upload action="/api/upload" maxSize={1024} minSize={200} {onSizeError}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（最小 200KB，最大 1MB）
  </Button>
</Upload>
