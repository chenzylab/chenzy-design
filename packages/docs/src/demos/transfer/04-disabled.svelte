<script lang="ts">
  import { Transfer, Space, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 8 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
    disabled: i === 1 || i === 4,
  }));

  let v1 = $state<(string | number)[]>(['2']);
  let v2 = $state<(string | number)[]>(['2', '3']);
</script>

<Space vertical align="start">
  <Text type="tertiary">整体禁用（disabled）：</Text>
  <Transfer disabled dataSource={data} value={v1} onChange={(keys) => (v1 = keys)} />

  <Text type="tertiary">单项禁用（item.disabled，选项 1 / 4 不可迁移）：</Text>
  <Transfer dataSource={data} value={v2} onChange={(keys) => (v2 = keys)} />
</Space>
