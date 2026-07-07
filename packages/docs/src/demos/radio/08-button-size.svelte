<script lang="ts">
  import { RadioGroup, Text, Space } from '@chenzy-design/svelte';

  const options = [
    { label: '即时推送', value: 1 },
    { label: '定时推送', value: 2 },
    { label: '动态推送', value: 3 },
  ];
</script>

<Space vertical spacing="loose" align="start">
  <!-- type=button 的三种尺寸，buttonSize 控制 -->
  <div>
    <Text type="tertiary">buttonSize=small</Text>
    <RadioGroup type="button" buttonSize="small" defaultValue={1} {options} />
  </div>
  <div>
    <Text type="tertiary">buttonSize=middle（默认）</Text>
    <RadioGroup type="button" buttonSize="middle" defaultValue={1} {options} />
  </div>
  <div>
    <Text type="tertiary">buttonSize=large</Text>
    <RadioGroup type="button" buttonSize="large" defaultValue={1} {options} />
  </div>
</Space>
