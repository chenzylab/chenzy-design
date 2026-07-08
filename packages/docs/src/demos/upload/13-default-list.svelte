<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // 非受控初始列表：直接给已上传项，组件内部自管后续变化。
  const defaultText: UploadFileItem[] = [
    { uid: 'd-1', name: 'contract.pdf', size: 102400, status: 'success' },
    { uid: 'd-2', name: 'invoice.xlsx', size: 51200, status: 'success' },
  ];

  const defaultPics: UploadFileItem[] = [
    { uid: 'dp-1', name: 'banner.svg', size: 2048, status: 'success', url: demoImageSrc },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">默认文件列表：defaultValue 传入已上传项（含预览 url、status: 'success'），非受控。</Text>
  <Upload multiple defaultValue={defaultText} action="/api/upload" />

  <Text type="tertiary">picture-card 默认已上传图片：</Text>
  <Upload
    listType="picture-card"
    accept="image/*"
    defaultValue={defaultPics}
    action="/api/upload"
  />
</Space>
