<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  let uploadRef = $state<ReturnType<typeof Upload> | undefined>(undefined);
  let fileList = $state<UploadFileItem[]>([
    { uid: 'i-1', name: 'first.txt', size: 1024, status: 'success' },
  ]);

  function insertAtFront() {
    const f = new File(['generated'], `inserted-${Date.now()}.txt`, { type: 'text/plain' });
    // 插入到列表最前（index 0）。
    uploadRef?.insert([f], 0);
  }

  function openDialog() {
    uploadRef?.openFileDialog();
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    命令式 API：bind:this 拿到 ref，insert(files, index) 指定位置插入、openFileDialog() 打开选择器。
  </Text>
  <Upload
    bind:this={uploadRef}
    multiple
    action="/api/upload"
    value={fileList}
    onChange={(list) => (fileList = list)}
  />
  <Space>
    <Button onclick={insertAtFront}>在最前插入文件</Button>
    <Button onclick={openDialog}>打开文件选择器</Button>
  </Space>
</Space>
