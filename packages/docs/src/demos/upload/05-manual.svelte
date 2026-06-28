<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // 手动上传：不传 action / customRequest，仅收集文件，点击按钮时统一处理。
  let files = $state<UploadFileItem[]>([]);
  let log = $state('');

  function manualUpload() {
    const names = files.map((f) => f.name).join('、');
    log = files.length ? `准备上传：${names}` : '暂无待上传文件';
  }
</script>

<Space direction="vertical" align="start">
  <Text type="tertiary">选择文件后不会自动上传，点击下方按钮手动触发</Text>
  <Upload
    multiple
    showClear
    fileListTitle="待上传列表"
    onChange={(list) => (files = list)}
  />
  <button type="button" onclick={manualUpload}>开始上传</button>
  {#if log}
    <Text type="secondary">{log}</Text>
  {/if}
</Space>
