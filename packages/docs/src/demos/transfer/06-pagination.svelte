<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const data = Array.from({ length: 100 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>([]);
</script>

<!-- 左侧分页：pageSize 控制每页条数（非受控页码） -->
<Transfer
  dataSource={data}
  {value}
  pagination={{ pageSize: 10 }}
  onChange={(keys) => (value = keys)}
/>
