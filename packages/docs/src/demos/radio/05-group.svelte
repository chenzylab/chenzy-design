<script lang="ts">
  import { RadioGroup, Radio } from '@chenzy-design/svelte';

  // 一组互斥的 Radio 配合使用。
  let value = $state<string | number | boolean>(1);
</script>

<RadioGroup
  {value}
  onChange={(e) => (value = e.target.value ?? 1)}
  ariaLabel="单选组合示例"
  name="demo-radio-group"
>
  <Radio value={1}>A</Radio>
  <Radio value={2}>B</Radio>
  <Radio value={3}>C</Radio>
  <Radio value={4}>D</Radio>
</RadioGroup>
