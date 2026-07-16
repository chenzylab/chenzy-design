<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <Text type="tertiary">basic 迷你尺寸（size="small"）：</Text>
  <Steps type="basic" size="small" current={1}>
    <Steps.Step title="已完成" description="这是一段描述" />
    <Steps.Step title="进行中" description="这是一段描述" />
    <Steps.Step title="等待中" description="这是一段描述" />
  </Steps>

  <Text type="tertiary">nav 迷你尺寸：</Text>
  <div style="display: flex; justify-content: center;">
    <Steps type="nav" size="small" current={1}>
      <Steps.Step title="注册账号" />
      <Steps.Step title="这个项目的文字比较多多多多" />
      <Steps.Step title="产品用途" />
      <Steps.Step title="期待尝试功能" />
    </Steps>
  </div>
</div>
