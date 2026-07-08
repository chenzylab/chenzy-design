<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let val = $state<string | undefined>(undefined);
  let options = $state([
    { label: '前端', value: 'fe' },
    { label: '后端', value: 'be' },
  ]);

  // allowCreate：filter 无匹配时可创建新选项
  function handleCreate(v: string) {
    options = [...options, { label: v, value: v }];
  }
</script>

<div style="max-width:280px">
  <Select
    {options}
    value={val}
    filter
    allowCreate
    onCreate={handleCreate}
    onChange={(v) => (val = v as string)}
    placeholder="输入并创建新标签"
  />
  <Text type="tertiary">已选：{val ?? '（未选）'}</Text>
</div>
