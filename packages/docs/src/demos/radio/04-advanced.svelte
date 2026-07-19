<script lang="ts">
  import { Radio } from '@chenzy-design/svelte';

  // 高级模式（mode='advanced'）：checked 可通过点击转换为 unchecked。
  let checked = $state(true);
</script>

<Radio
  value="advanced"
  {checked}
  mode="advanced"
  onChange={(e) => (checked = e.target.checked)}
  ariaLabel="单选示例"
  name="demo-radio-advanced"
>
  允许取消选择
</Radio>
