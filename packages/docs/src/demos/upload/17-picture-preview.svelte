<script lang="ts">
  import { Upload, Image } from '@chenzy-design/svelte';
  import { IconPlus, IconEyeOpened } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#722ed1"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const thumbFileList: UploadFileItem[] = [
    { uid: '1', name: 'music.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];

  const previewFileList: UploadFileItem[] = [
    { uid: '1', name: 'resso.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];

  function handlePreview(file: UploadFileItem) {
    if (!file.url) return;
    window.open(file.url, 'imagePreview', 'width=300,height=300');
  }
</script>

<Upload action="https://api.semi.design/upload" listType="picture" accept="image/*" multiple defaultFileList={thumbFileList}>
  {#snippet renderThumbnail(file)}
    <Image src={file.url} />
  {/snippet}
  <IconPlus size="extra-large" />
</Upload>

<Upload
  action="https://api.semi.design/upload"
  listType="picture"
  showPicInfo
  accept="image/*"
  multiple
  defaultFileList={previewFileList}
  onPreviewClick={handlePreview}
>
  {#snippet renderPicPreviewIcon()}
    <IconEyeOpened style="color:var(--cd-color-white);font-size:24px;" />
  {/snippet}
  <IconPlus size="extra-large" />
</Upload>
