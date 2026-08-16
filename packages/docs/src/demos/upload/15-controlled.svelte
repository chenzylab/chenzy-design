<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const initList: UploadFileItem[] = [
    { uid: '1', name: 'dyBag.jpeg', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
    { uid: '2', name: 'dy.jpeg', status: 'uploading', size: '222.0KB', percent: 50, preview: true, url: demoImageSrc },
  ];

  let list = $state<UploadFileItem[]>(initList);
</script>

<Upload
  action="https://api.semi.design/upload"
  onChange={({ fileList }) => (list = [...fileList])}
  fileList={list}
  showRetry={false}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>
