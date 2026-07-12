<script lang="ts">
  import { Calendar, Text } from '@chenzy-design/svelte';

  // 增强场景（Semi 未单列）：onClick 回调点击的精确时间点。
  let clicked = $state('（未点击）');
</script>

<Calendar
  mode="week"
  height={400}
  onClick={(_e, date) => (clicked = date.toLocaleString('zh-CN'))}
/>
<Text type="tertiary">点击时间：{clicked}</Text>
