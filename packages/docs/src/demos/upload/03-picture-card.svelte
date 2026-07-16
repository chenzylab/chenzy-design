<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import { IconPlus } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  let imageVal = $state<UploadFileItem[]>([
    { uid: 'pc-1', name: 'cover.svg', size: 2048, status: 'success', url: demoImageSrc },
  ]);
</script>

<Upload
  listType="picture"
  multiple
  accept="image/*"
  action="//example.com/upload"
  fileList={imageVal}
  onChange={({ fileList }) => (imageVal = fileList)}
>
  <IconPlus size="extra-large" />
</Upload>
