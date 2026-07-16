<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#00b42a"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  let listVal = $state<UploadFileItem[]>([
    { uid: 'r-1', name: 'report.pdf', size: 4096, status: 'success' },
  ]);
  let picVal = $state<UploadFileItem[]>([
    { uid: 'p-1', name: 'cover.svg', size: 2048, status: 'success', url: demoImageSrc },
  ]);
</script>

<!-- renderFileItem：完全自定义文本列表项。 -->
<Upload
  action="//example.com/upload"
  fileList={listVal}
  onChange={({ fileList }) => (listVal = fileList)}
>
  {#snippet renderFileItem(file)}
    <span style="display:flex;gap:8px;align-items:center;">
      📄 {file.name}
      <button type="button" onclick={file.onRemove}>删除</button>
    </span>
  {/snippet}
</Upload>

<!-- showPicInfo + renderPicInfo：picture 照片墙图片信息浮层。 -->
<Upload
  listType="picture"
  accept="image/*"
  action="//example.com/upload"
  showPicInfo
  fileList={picVal}
  onChange={({ fileList }) => (picVal = fileList)}
>
  {#snippet renderPicInfo(file)}
    <span>{file.name} · {(file.size / 1024).toFixed(1)}KB</span>
  {/snippet}
</Upload>
