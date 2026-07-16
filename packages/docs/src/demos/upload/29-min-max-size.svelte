<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  let val = $state<UploadFileItem[]>([]);
  let lastError = $state('');

  // onSizeError（对齐 Semi）：大小超限时回调（file, fileList）。
  function onSizeError(file: UploadFileItem) {
    lastError = `${file.name} 大小不合法（限制 200KB ~ 1MB）`;
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    maxSize / minSize（对齐 Semi，单位 KB）：过大或过小的文件标记 validateFail 并触发 onSizeError。
  </Text>
  <Upload
    multiple
    action="/api/upload"
    minSize={200}
    maxSize={1024}
    {onSizeError}
    fileList={val}
    onChange={({ fileList }) => (val = fileList)}
  />
  {#if lastError}
    <Text type="danger">{lastError}</Text>
  {/if}
</Space>
