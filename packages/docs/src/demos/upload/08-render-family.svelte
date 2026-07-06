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
  value={listVal}
  onChange={(list) => (listVal = list)}
>
  {#snippet renderFileItem({ fileItem, remove })}
    <span style="display:flex;gap:8px;align-items:center;">
      📄 {fileItem.name}
      <button type="button" onclick={remove}>删除</button>
    </span>
  {/snippet}
</Upload>

<!-- showPicInfo + renderPicInfo：picture-card 图片信息浮层。 -->
<Upload
  listType="picture-card"
  accept="image/*"
  action="//example.com/upload"
  showPicInfo
  value={picVal}
  onChange={(list) => (picVal = list)}
>
  {#snippet renderPicInfo({ fileItem })}
    <span>{fileItem.name} · {(fileItem.size / 1024).toFixed(1)}KB</span>
  {/snippet}
</Upload>
