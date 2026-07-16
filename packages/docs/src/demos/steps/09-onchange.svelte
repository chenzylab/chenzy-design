<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';

  let current = $state(1);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Steps type="basic" {current} onChange={(index) => (current = index)}>
    <Steps.Step title="First" />
    <Steps.Step title="Second" />
    <Steps.Step title="Last" />
  </Steps>
  <Text type="tertiary">点击任意步切换。onChange 参数 = initial + index，当前：{current}</Text>
</div>
