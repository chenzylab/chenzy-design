<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#86909c"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const textVal: UploadFileItem[] = [
    { uid: 'x-1', name: 'locked.pdf', size: 4096, status: 'success' },
  ];
  const picVal: UploadFileItem[] = [
    { uid: 'xp-1', name: 'locked.svg', size: 2048, status: 'success', url: demoImageSrc },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">禁用（text）：触发器不可点，已有列表项也不可移除。</Text>
  <Upload disabled multiple defaultValue={textVal} />

  <Text type="tertiary">禁用（picture-card）：</Text>
  <Upload disabled listType="picture-card" accept="image/*" defaultValue={picVal} />
</Space>
