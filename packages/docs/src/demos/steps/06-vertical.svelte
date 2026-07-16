<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <Text type="tertiary">fill 竖直方向：</Text>
  <div style="width: 300px">
    <Steps type="fill" direction="vertical" current={1} onChange={(i) => console.log(i)}>
      <Steps.Step title="已完成" description="这是一段描述" />
      <Steps.Step title="进行中" description="这是一段描述" />
      <Steps.Step title="等待中" description="这是一段描述" />
    </Steps>
  </div>

  <Text type="tertiary">basic 竖直方向：</Text>
  <Steps type="basic" direction="vertical" current={1} onChange={(i) => console.log(i)}>
    <Steps.Step title="已完成" description="这是一段描述" />
    <Steps.Step title="进行中" description="这是一段描述" />
    <Steps.Step title="等待中" description="这是一段描述" />
  </Steps>
</div>
