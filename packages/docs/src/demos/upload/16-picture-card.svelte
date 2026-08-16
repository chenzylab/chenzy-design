<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import { IconPlus } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const defaultFileList: UploadFileItem[] = [
    { uid: '1', name: 'dy.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];

  const infoFileList: UploadFileItem[] = [
    { uid: '1', name: 'music.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
    { uid: '2', name: 'brand.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];
</script>

<Upload action="https://api.semi.design/upload" listType="picture" accept="image/*" multiple {defaultFileList}>
  <IconPlus size="extra-large" />
</Upload>

<Upload
  action="https://api.semi.design/upload"
  listType="picture"
  showPicInfo
  accept="image/*"
  multiple
  defaultFileList={infoFileList}
>
  <IconPlus size="extra-large" />
</Upload>
