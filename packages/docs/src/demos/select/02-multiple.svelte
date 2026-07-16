<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let vals = $state<string[]>([]);

  const optionList = [
    { label: '北京', value: 'bj' },
    { label: '上海', value: 'sh' },
    { label: '广州', value: 'gz' },
    { label: '深圳', value: 'sz' },
    { label: '杭州', value: 'hz' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 8px; max-width: 320px;">
  <Select
    multiple
    {optionList}
    value={vals}
    onChange={(v) => (vals = v as string[])}
    placeholder="选择城市（可多选）"
  />
  <Text type="tertiary">已选：{vals.length ? vals.join(', ') : '（未选）'}</Text>
</div>
