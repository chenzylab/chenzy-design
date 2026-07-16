<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let val = $state<string | undefined>(undefined);

  const optionList = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橙子', value: 'orange' },
    { label: '葡萄（禁用）', value: 'grape', disabled: true },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 8px; max-width: 280px;">
  <Select {optionList} value={val} onChange={(v) => (val = v as string)} placeholder="请选择水果" />
  <Text type="tertiary">已选：{val ?? '（未选）'}</Text>
</div>
