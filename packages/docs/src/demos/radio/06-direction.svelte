<script lang="ts">
  import { RadioGroup, Text, Space } from '@chenzy-design/svelte';

  const options = [
    { label: 'A', value: 1 },
    { label: 'B', value: 2 },
    { label: 'C', value: 3 },
    { label: 'D', value: 4 },
  ];
</script>

<Space vertical align="start" spacing="loose">
  <!-- direction 控制组内排列（仅 type=default 生效） -->
  <div>
    <Text type="tertiary">horizontal（默认）</Text>
    <RadioGroup direction="horizontal" defaultValue={1} {options} />
  </div>
  <div>
    <Text type="tertiary">vertical</Text>
    <RadioGroup direction="vertical" defaultValue={1} {options} />
  </div>
</Space>
