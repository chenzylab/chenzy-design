<script lang="ts">
  import { Upload, RadioGroup, Radio, Image } from '@chenzy-design/svelte';
  import { IconPlus, IconEyeOpened } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110"><rect width="200" height="110" fill="#0066ff"/><text x="100" y="62" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  const sizeFileList: UploadFileItem[] = [
    { uid: '1', name: 'image-1.jpg', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];

  // hotSpotLocation 控制照片墙加号瓦片的位置（对齐 Semi，默认 end），是本章节 Semi 原文的第二个子示例。
  let hotSpotLocation = $state<'start' | 'end'>('end');
  const hotSpotFileList: UploadFileItem[] = [
    { uid: '1', name: 'resso.png', status: 'success', size: '130.0KB', preview: true, url: demoImageSrc },
  ];

  function handlePreview(file: UploadFileItem) {
    if (!file.url) return;
    window.open(file.url, 'imagePreview', 'width=300,height=300');
  }
</script>

<Upload
  action="https://api.semi.design/upload"
  listType="picture"
  accept="image/*"
  multiple
  defaultFileList={sizeFileList}
  picHeight={110}
  picWidth={200}
>
  {#snippet renderThumbnail(file)}
    <Image src={file.url} width={200} height={110} />
  {/snippet}
  <IconPlus size="extra-large" style="margin:4px;" />
  点击添加图片
</Upload>

<RadioGroup
  type="button"
  value={hotSpotLocation}
  onChange={(e) => (hotSpotLocation = e.target.value as 'start' | 'end')}
>
  <Radio value="start">start</Radio>
  <Radio value="end">end</Radio>
</RadioGroup>
<hr />
<Upload
  action="https://api.semi.design/upload"
  listType="picture"
  showPicInfo
  accept="image/*"
  multiple
  {hotSpotLocation}
  defaultFileList={hotSpotFileList}
  onPreviewClick={handlePreview}
>
  <IconPlus size="extra-large" />
</Upload>
