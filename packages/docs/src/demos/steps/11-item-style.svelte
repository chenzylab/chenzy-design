<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Text type="tertiary">每步支持 class / style / ariaLabel（对齐 Semi Steps.Step 的 className/style/aria-label）。</Text>
  <Steps type="basic" current={1} ariaLabel="账户开通流程">
    <Steps.Step title="已完成" description="这是一段描述" ariaLabel="第一步已完成" />
    <Steps.Step title="进行中" description="这是一段描述" style="opacity: 0.95;" />
    <Steps.Step title="等待中" description="这是一段描述" />
  </Steps>
</div>
