<script lang="ts">
  import { Upload, RadioGroup, Space, Text } from '@chenzy-design/svelte';
  import { IconPlus } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const img = 'data:image/gif;base64,R0lGODlhAQABAIAAAABm/wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  let hotSpot = $state<'start' | 'end'>('end');

  let imageVal = $state<UploadFileItem[]>([
    { uid: 'hs-1', name: 'cover.png', size: 2048, status: 'success', url: img },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    hotSpotLocation 控制照片墙加号瓦片的位置：start 前置、end 后置（对齐 Semi，默认 end）。
  </Text>
  <RadioGroup
    type="button"
    value={hotSpot}
    onChange={(e) => (hotSpot = e.target.value as 'start' | 'end')}
    options={[
      { label: 'start', value: 'start' },
      { label: 'end', value: 'end' },
    ]}
  />
  <Upload
    listType="picture"
    multiple
    accept="image/*"
    action="//example.com/upload"
    hotSpotLocation={hotSpot}
    fileList={imageVal}
    onChange={({ fileList }) => (imageVal = fileList)}
  >
    <IconPlus size="extra-large" />
  </Upload>
</Space>
