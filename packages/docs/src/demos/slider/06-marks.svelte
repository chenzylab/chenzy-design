<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';

  const marks = {
    0: '0°C',
    20: '20°C',
    40: '40°C',
    100: '100°C',
  };
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 40px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">带刻度的区间选择（step 10）</Text>
    <Slider range defaultValue={[20, 40]} step={10} {marks} />
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">included=false 时刻度不随选区高亮</Text>
    <Slider range defaultValue={[20, 40]} step={10} {marks} included={false} />
  </div>
</div>
