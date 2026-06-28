<script lang="ts">
  import { RadioGroup, Text } from '@chenzy-design/svelte';

  let val = $state<string | number | boolean>('1');
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <RadioGroup
    value={val}
    onChange={(v) => (val = v)}
    options={[
      { label: '苹果', value: '1' },
      { label: '橘子', value: '2' },
      { label: '香蕉', value: '3' },
    ]}
  />
  <Text type="tertiary">当前选择：{val}</Text>
</div>
