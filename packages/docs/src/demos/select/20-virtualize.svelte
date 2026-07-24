<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  // 大量 Option 时开启列表虚拟化，仅渲染视口内选项。
  const optionList = Array.from({ length: 2000 }, (_, i) => ({
    value: `${i}`,
    label: `选项 ${i}`,
  }));
</script>

<Select
  filter
  placeholder="虚拟化 2000 项"
  style="width: 300px"
  virtualize={{ height: 300, width: 300, itemSize: 36 }}
  maxHeight={300}
  {optionList}
/>
