<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  // 虚拟化：大数据下拉只渲染视口内 option
  const options = Array.from({ length: 2000 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
</script>

<div style="max-width:280px">
  <Select {options} filter virtualized placeholder="2000 项虚拟滚动" />
  <Text type="tertiary">2000 项，仅渲染视口内选项</Text>
</div>
