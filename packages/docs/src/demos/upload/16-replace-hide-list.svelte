<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  let textVal = $state<UploadFileItem[]>([
    { uid: 'r-1', name: 'avatar.png', size: 51200, status: 'success' },
  ]);
  let picVal = $state<UploadFileItem[]>([
    { uid: 'rp-1', name: 'cover.svg', size: 2048, status: 'success', url: demoImageSrc },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">showReplace：已上传项显示"替换"按钮，点击重选文件替换该项（text）。</Text>
  <Upload
    showReplace
    action="/api/upload"
    value={textVal}
    onChange={(list) => (textVal = list)}
  />

  <Text type="tertiary">showReplace（picture-card）：hover 卡片显示替换。</Text>
  <Upload
    showReplace
    listType="picture-card"
    accept="image/*"
    action="/api/upload"
    value={picVal}
    onChange={(list) => (picVal = list)}
  />

  <Text type="tertiary">showUploadList=false：不渲染文件列表，仅保留触发器（列表交由外部呈现）。</Text>
  <Upload showUploadList={false} multiple action="/api/upload" />
</Space>
