<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let val = $state<string | undefined>(undefined);

  // 分组：optionList 含 { label, options: [] } 即为分组
  const optionList = [
    {
      label: '水果',
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
      ],
    },
    {
      label: '蔬菜',
      options: [
        { label: '番茄', value: 'tomato' },
        { label: '黄瓜', value: 'cucumber' },
      ],
    },
  ];
</script>

<div style="max-width:280px">
  <Select {optionList} value={val} onChange={(v) => (val = v as string)} placeholder="分组选择" />
  <Text type="tertiary">已选：{val ?? '（未选）'}</Text>
</div>
