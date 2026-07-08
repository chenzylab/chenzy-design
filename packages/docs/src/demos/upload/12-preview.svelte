<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#722ed1"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  let picVal = $state<UploadFileItem[]>([
    { uid: 'p-1', name: 'photo-1.svg', size: 2048, status: 'success', url: demoImageSrc },
    { uid: 'p-2', name: 'photo-2.svg', size: 2048, status: 'success', url: demoImageSrc },
  ]);

  let previewName = $state('');

  function onPreviewClick(fileItem: UploadFileItem) {
    // 真实场景在此打开图片预览大图弹窗；这里记录点击的文件名。
    previewName = fileItem.name;
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    照片墙放大预览：hover 显示自定义预览图标（renderPicPreviewIcon），点击触发 onPreviewClick。
  </Text>
  <Upload
    listType="picture-card"
    accept="image/*"
    action="/api/upload"
    value={picVal}
    onChange={(list) => (picVal = list)}
    {onPreviewClick}
  >
    {#snippet renderPicPreviewIcon({ preview })}
      <button
        type="button"
        onclick={preview}
        style="all:unset;cursor:pointer;color:#fff;font-size:18px;"
        aria-label="预览"
      >
        🔍
      </button>
    {/snippet}
  </Upload>
  {#if previewName}
    <Text type="secondary">预览：{previewName}</Text>
  {/if}
</Space>
