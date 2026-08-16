<script lang="ts">
  import { Upload, ImagePreview, Button } from '@chenzy-design/svelte';
  import { IconUpload, IconExpand, IconDownload, IconDelete, IconFile } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const previewDefaultList: UploadFileItem[] = [
    { uid: '1', name: 'dyBag.png', status: 'success', size: '130.0KB', url: demoImageSrc },
    { uid: '2', name: 'dyBag2.png', status: 'success', size: '130.0KB', url: demoImageSrc },
  ];

  const opDefaultList: UploadFileItem[] = [
    { uid: '1', name: 'dyBag.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];
  let opPreviewVisible = $state(false);
</script>

<Upload action="https://api.semi.design/upload" defaultFileList={previewDefaultList}>
  {#snippet previewFile(file)}
    {#if file.uid === '1'}
      <IconFile size="large" />
    {:else}
      <img src={file.url} alt={file.name} style="width:100%;height:100%;object-fit:cover;" />
    {/if}
  {/snippet}
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>

<Upload action="https://api.semi.design/upload" defaultFileList={opDefaultList} itemStyle={{ width: 300 }}>
  {#snippet renderFileOperation(file)}
    <div style="display:flex;column-gap:8px;padding:0 8px;">
      <Button
        type="tertiary"
        theme="borderless"
        size="small"
        aria-label="放大预览"
        onclick={() => (opPreviewVisible = true)}
      >
        {#snippet icon()}<IconExpand />{/snippet}
      </Button>
      <Button type="tertiary" theme="borderless" size="small" aria-label="下载">
        {#snippet icon()}<IconDownload />{/snippet}
      </Button>
      <Button
        type="tertiary"
        theme="borderless"
        size="small"
        aria-label="删除"
        onclick={() => file.onRemove()}
      >
        {#snippet icon()}<IconDelete />{/snippet}
      </Button>
    </div>
  {/snippet}
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>

<ImagePreview
  src={demoImageSrc}
  visible={opPreviewVisible}
  onVisibleChange={(v) => (opPreviewVisible = v)}
/>
