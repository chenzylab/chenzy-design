<script lang="ts">
  import { RadioGroup, Radio } from '@chenzy-design/svelte';
</script>

<!-- direction 决定组内 radio 水平或垂直排列（仅 type=default 生效） -->
<RadioGroup direction="vertical" ariaLabel="单选组合示例" name="demo-radio-group-vertical">
  <Radio value={1}>A</Radio>
  <Radio value={2}>B</Radio>
  <Radio value={3}>C</Radio>
  <Radio value={4}>D</Radio>
</RadioGroup>
