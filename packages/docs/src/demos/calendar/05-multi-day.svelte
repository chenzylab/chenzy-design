<script lang="ts">
  import { Calendar } from '@chenzy-design/svelte';

  // 对齐 Semi「多日视图」：range 必传，左闭右开。
  const range: [Date, Date] = [new Date(2020, 8, 26), new Date(2020, 8, 31)];
</script>

<Calendar mode="range" {range} />
