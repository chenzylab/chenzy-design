<script lang="ts">
  import { Upload, Space, Text, Image } from '@chenzy-design/svelte';
  import { IconPlus } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const img = (fill: string) =>
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110"><rect width="200" height="110" fill="${fill}"/><text x="100" y="62" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>`,
    );

  let val = $state<UploadFileItem[]>([
    { uid: 's-1', name: 'wide.svg', size: 4096, status: 'success', url: img('#0066ff') },
    { uid: 's-2', name: 'wide2.svg', size: 4096, status: 'success', url: img('#00b42a') },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    picWidth / picHeight（对齐 Semi，v2.42+）：统一定制照片墙缩略图与添加瓦片的宽高（number 视为 px）。
  </Text>
  <Upload
    listType="picture"
    multiple
    accept="image/*"
    action="/api/upload"
    picWidth={200}
    picHeight={110}
    fileList={val}
    onChange={({ fileList }) => (val = fileList)}
  >
    {#snippet renderThumbnail(file)}
      <Image src={file.url} width={200} height={110} />
    {/snippet}
    <IconPlus size="extra-large" style="margin:4px;" />
    点击添加图片
  </Upload>
</Space>
