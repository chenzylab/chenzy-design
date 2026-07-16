<script lang="ts">
  import { Upload, ImagePreview, Space, Text } from '@chenzy-design/svelte';
  import { IconPlus, IconEyeOpened } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  function makeImg(label: string, fill: string) {
    return (
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="${fill}"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">${label}</text></svg>`,
      )
    );
  }

  let picVal = $state<UploadFileItem[]>([
    { uid: 'p-1', name: 'photo-1.svg', size: 2048, status: 'success', url: makeImg('IMG 1', '#722ed1') },
    { uid: 'p-2', name: 'photo-2.svg', size: 2048, status: 'success', url: makeImg('IMG 2', '#0077fa') },
    { uid: 'p-3', name: 'photo-3.svg', size: 2048, status: 'success', url: makeImg('IMG 3', '#00b42a') },
  ]);

  // 从已上传项映射出预览灯箱所需的图片 URL 数组（对齐 ImagePreview 的 src: string[]）。
  const previewImages = $derived(
    picVal.filter((item) => item.url).map((item) => item.url as string),
  );

  let previewVisible = $state(false);
  let previewCurrent = $state(0);

  function onPreviewClick(fileItem: UploadFileItem) {
    // 点击缩略图（hover 显示自定义眼睛图标）：定位到该项在灯箱中的索引并打开放大预览。
    const index = picVal
      .filter((item) => item.url)
      .findIndex((item) => item.name === fileItem.name);
    previewCurrent = index < 0 ? 0 : index;
    previewVisible = true;
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    照片墙放大预览（对齐 Semi）：renderPicPreviewIcon 自绘 hover 眼睛图标，onPreviewClick 监听单张容器点击，弹出 ImagePreview 放大预览，可缩放/旋转/翻页。
  </Text>
  <Upload
    listType="picture"
    accept="image/*"
    action="/api/upload"
    showPicInfo
    fileList={picVal}
    onChange={({ fileList }) => (picVal = fileList)}
    {onPreviewClick}
  >
    {#snippet renderPicPreviewIcon()}
      <IconEyeOpened style="color:var(--cd-color-white);font-size:24px;" />
    {/snippet}
    <IconPlus size="extra-large" />
  </Upload>
</Space>

<ImagePreview
  src={previewImages}
  visible={previewVisible}
  currentIndex={previewCurrent}
  onVisibleChange={(v) => (previewVisible = v)}
  onClose={() => (previewVisible = false)}
  onChange={(index) => (previewCurrent = index)}
/>
