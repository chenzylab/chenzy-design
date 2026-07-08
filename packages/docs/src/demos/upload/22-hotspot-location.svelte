<script lang="ts">
  import { Upload, RadioGroup, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const img = 'data:image/gif;base64,R0lGODlhAQABAIAAAABm/wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  let hotSpot = $state<'start' | 'end' | 'none'>('start');

  let imageVal = $state<UploadFileItem[]>([
    { uid: 'hs-1', name: 'cover.png', size: 2048, status: 'success', url: img },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    hotSpotLocation 控制照片墙加号瓦片的位置：start 前置、end 后置、none 隐藏。
  </Text>
  <RadioGroup
    type="button"
    bind:value={hotSpot}
    options={[
      { label: 'start', value: 'start' },
      { label: 'end', value: 'end' },
      { label: 'none', value: 'none' },
    ]}
  />
  <Upload
    listType="picture-card"
    multiple
    accept="image/*"
    action="//example.com/upload"
    hotSpotLocation={hotSpot}
    value={imageVal}
    onChange={(list) => (imageVal = list)}
  />
</Space>
