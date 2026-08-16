<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#86909c"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const defaultFileList: UploadFileItem[] = [
    { uid: '1', name: 'first.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
    { uid: '2', name: 'second.png', status: 'validateFail', size: '222.0KB', preview: true, url: demoImageSrc },
  ];
</script>

<Upload action="https://api.semi.design/upload" disabled {defaultFileList}>
  <Button theme="light" disabled>
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>
