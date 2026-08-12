<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const data = Array.from({ length: 20 }, (_, i) => ({
    label: `选项名称 ${i}`,
    value: i,
    disabled: false,
    key: `key-${i}`,
  }));
</script>

<Transfer
  style="width: 568px; height: 416px"
  disabled
  dataSource={data}
  defaultValue={[2, 4]}
  onChange={(values, items) => console.log(values, items)}
/>
