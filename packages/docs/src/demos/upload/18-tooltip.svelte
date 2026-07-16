<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const seed: UploadFileItem[] = [
    {
      uid: 'long-1',
      name: '这是一个超级超级超级长的文件名用于演示省略号与悬浮提示效果的示例文档.pdf',
      size: 4096,
      status: 'success',
    },
    { uid: 'long-2', name: 'annual-financial-report-2025-final-v2-approved.xlsx', size: 8192, status: 'success' },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">
    文件名超长时省略，showTooltip 对象式（type: 'tooltip'）：hover 用 Tooltip 展示完整文件名。
  </Text>
  <Upload
    multiple
    defaultFileList={seed}
    action="/api/upload"
    showTooltip={{ type: 'tooltip' }}
  />
</Space>
