<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const options = Array.from({ length: 20 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
</script>

<div style="max-width: 280px;">
  <Select {options} filter placeholder="输入关键词过滤" />
</div>
