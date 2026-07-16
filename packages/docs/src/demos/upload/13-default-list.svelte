<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload, IconPlus } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // 非受控初始列表：直接给已上传项，组件内部自管后续变化。
  // 对齐 Semi：混合态样本，第二项 uploadFail 展示失败卡片（红底 + hover 重试）。
  const defaultText: UploadFileItem[] = [
    { uid: 'd-1', name: 'contract.pdf', size: 102400, status: 'success' },
    { uid: 'd-2', name: 'invoice.xlsx', size: 51200, status: 'uploadFail' },
  ];

  const defaultPics: UploadFileItem[] = [
    { uid: 'dp-1', name: 'banner.svg', size: 2048, status: 'success', url: demoImageSrc },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">默认文件列表：defaultFileList 传入已上传项（含成功项与失败项混合态），非受控。</Text>
  <Upload multiple defaultFileList={defaultText} action="/api/upload">
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传
    </Button>
  </Upload>

  <Text type="tertiary">picture-card 默认已上传图片：</Text>
  <Upload
    listType="picture"
    accept="image/*"
    defaultFileList={defaultPics}
    action="/api/upload"
  >
    <IconPlus size="extra-large" />
  </Upload>
</Space>
