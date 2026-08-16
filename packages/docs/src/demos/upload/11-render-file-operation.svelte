<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload, IconDownload, IconEyeOpened, IconDelete } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const defaultFileList: UploadFileItem[] = [
    { uid: '1', name: 'dyBag.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];
</script>

<Upload action="https://api.semi.design/upload" {defaultFileList} itemStyle={{ width: 300 }}>
  {#snippet renderFileOperation(file)}
    <div style="display:flex;column-gap:8px;padding:0 8px;">
      <Button type="tertiary" theme="borderless" size="small" aria-label="预览">
        {#snippet icon()}<IconEyeOpened />{/snippet}
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
