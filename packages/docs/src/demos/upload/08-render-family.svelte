<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload, IconEyeOpened, IconDownload, IconDelete, IconFile } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // 自定义列表操作区（renderFileOperation）：预览 / 下载 / 删除三按钮。
  let opVal = $state<UploadFileItem[]>([
    { uid: 'op-1', name: 'dyBag.png', size: 133120, status: 'success', preview: true, url: demoImageSrc },
  ]);

  // 自定义预览逻辑（previewFile）：uid==='1' 恒返回 IconFile，其余用缩略图。
  let pvVal = $state<UploadFileItem[]>([
    { uid: '1', name: 'dyBag.png', size: 133120, status: 'success', url: demoImageSrc },
    { uid: '2', name: 'dyBag2.png', size: 133120, status: 'success', url: demoImageSrc },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    自定义列表操作区（renderFileOperation）：list 模式下自绘操作按钮组，删除调 file.onRemove()（对齐 Semi）。
  </Text>
  <Upload
    action="//example.com/upload"
    itemStyle={{ width: 300 }}
    fileList={opVal}
    onChange={({ fileList }) => (opVal = fileList)}
  >
    {#snippet renderFileOperation(file)}
      <div style="display:flex;column-gap:8px;padding:0 8px;">
        <Button type="tertiary" theme="borderless" size="small" ariaLabel="预览">
          {#snippet icon()}<IconEyeOpened />{/snippet}
        </Button>
        <Button type="tertiary" theme="borderless" size="small" ariaLabel="下载">
          {#snippet icon()}<IconDownload />{/snippet}
        </Button>
        <Button
          type="tertiary"
          theme="borderless"
          size="small"
          ariaLabel="删除"
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

  <Text type="tertiary">
    自定义预览逻辑（previewFile）：uid==='1' 恒返回 IconFile，其余按缩略图预览（对齐 Semi）。
  </Text>
  <Upload
    action="//example.com/upload"
    fileList={pvVal}
    onChange={({ fileList }) => (pvVal = fileList)}
  >
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
</Space>
