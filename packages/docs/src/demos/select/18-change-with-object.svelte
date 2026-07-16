<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let picked = $state<{ label: string; value: string | number; country?: string } | undefined>(undefined);
  const optionList = [
    { label: '北京', value: 'bj', country: '中国' },
    { label: '东京', value: 'tk', country: '日本' },
    { label: '纽约', value: 'ny', country: '美国' },
  ];
</script>

<div style="max-width:280px">
  <!-- onChangeWithObject：回调携带完整 option 对象，可读取 value 之外的自定义字段 -->
  <Select
    {optionList}
    onChangeWithObject={(opt) => (picked = opt as typeof picked)}
    placeholder="选择城市"
  />
  <Text type="tertiary">
    {picked ? `${picked.label}（${picked.country}）` : '（未选）'}
  </Text>
</div>
