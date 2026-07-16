<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';
  import type { TransferItem } from '@chenzy-design/svelte';

  const data = Array.from({ length: 12 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
    disabled: i % 4 === 0,
  }));

  let value = $state<(string | number)[]>(['2', '5']);
  let picked = $state<string>('');

  // onChange 回传 (values, items) 两参（对齐 Semi）。
  function onChange(keys: (string | number)[], items: TransferItem[]) {
    value = keys;
    picked = items.map((i) => i.label).join('、');
  }
</script>

<Transfer dataSource={data} {value} {onChange} />
<Text type="tertiary">已选项：{picked || '（无）'}</Text>
