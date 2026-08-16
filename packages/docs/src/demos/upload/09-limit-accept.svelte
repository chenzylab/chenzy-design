<script lang="ts">
  import { Upload, Space, Text, Button, Toast } from '@chenzy-design/svelte';
  import { IconPlus, IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // limit=1：始终用最新上传的替换当前，不触发 onExceed（对齐 Semi）。
  function onChange1({ fileList }: { fileList: UploadFileItem[] }) {
    console.log(fileList);
  }

  // limit=2：达到上限时禁用触发按钮，超出时提示。
  let disabled2 = $state(false);
  function onChange2({ fileList }: { fileList: UploadFileItem[] }) {
    disabled2 = fileList.length === 2;
  }

  // 照片墙模式下，当已上传文件数量等于 limit 时，会自动隐藏上传入口（对齐 Semi）。
  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );
  const picDefaultList: UploadFileItem[] = [
    { uid: 'l-1', name: 'dyBag.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
    { uid: 'l-2', name: 'dyBag2.jpeg', status: 'success', size: '222.0KB', preview: true, url: demoImageSrc },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">limit=1：始终用最新上传的文件替换当前，不触发 onExceed。</Text>
  <Upload action="/api/upload" limit={1} onChange={onChange1}>
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传（最多 1 项）
    </Button>
  </Upload>

  <Text type="tertiary">limit=2：超出时触发 onExceed 提示，达到上限时禁用触发按钮。</Text>
  <Upload
    action="/api/upload"
    limit={2}
    onExceed={() => Toast.warning('最多只允许上传 2 个文件')}
    onChange={onChange2}
  >
    <Button theme="light" disabled={disabled2}>
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传（最多 2 项）
    </Button>
  </Upload>

  <Text type="tertiary">照片墙模式下，当已上传文件数量等于 limit 时，会自动隐藏上传入口。</Text>
  <Upload
    action="/api/upload"
    limit={2}
    listType="picture"
    accept="image/*"
    multiple
    defaultFileList={picDefaultList}
    onExceed={() => Toast.warning('最多只允许上传 2 个文件')}
  >
    <IconPlus size="extra-large" />
  </Upload>
</Space>
