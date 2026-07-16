<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const seed: UploadFileItem[] = [
    { uid: 'c-1', name: 'file-a.log', size: 1024, status: 'success' },
    { uid: 'c-2', name: 'file-b.log', size: 2048, status: 'success' },
    { uid: 'c-3', name: 'file-c.log', size: 3072, status: 'success' },
  ];

  // 批量清空前二次确认：返回 false 阻止清空。
  function beforeClear(fileList: UploadFileItem[]): boolean {
    return confirm(`确认清空全部 ${fileList.length} 个文件？`);
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    showClear 批量清空 + beforeClear 二次确认：点击清空按钮先弹确认，取消则保留列表。
  </Text>
  <Upload
    multiple
    showClear
    fileListTitle="待处理文件"
    defaultFileList={seed}
    action="/api/upload"
    {beforeClear}
    onClear={() => console.log('已清空')}
  />
</Space>
