<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  let imageVal = $state<UploadFileItem[]>([
    { uid: 'img-1', name: 'sample.svg', size: 1024, status: 'success', url: demoImageSrc },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">拖拽上传</Text>
  <Upload multiple draggable accept="image/*" />

  <Text type="tertiary">picture-card（缩略图网格）</Text>
  <Upload
    listType="picture"
    multiple
    accept="image/*"
    fileList={imageVal}
    onChange={({ fileList }) => (imageVal = fileList)}
  />
</Space>
