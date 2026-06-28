<script lang="ts">
  import { RadioGroup, Text } from '@chenzy-design/svelte';

  let val = $state<string | number | boolean>('day');
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <RadioGroup
    type="button"
    value={val}
    onChange={(v) => (val = v)}
    options={[
      { label: '日', value: 'day' },
      { label: '周', value: 'week' },
      { label: '月', value: 'month' },
      { label: '年', value: 'year' },
    ]}
  />
  <Text type="tertiary">当前：{val}</Text>
</div>
