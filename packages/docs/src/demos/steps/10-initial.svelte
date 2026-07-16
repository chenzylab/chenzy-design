<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Text type="tertiary">initial=2：起始序号从 3 开始记数，onChange 参数 = initial + index。</Text>
  <Steps type="basic" initial={2} current={3} onChange={(i) => console.log(i)}>
    <Steps.Step title="Third" description="这是一段描述" />
    <Steps.Step title="Fourth" description="这是一段描述" />
    <Steps.Step title="Fifth" description="这是一段描述" />
  </Steps>
</div>
