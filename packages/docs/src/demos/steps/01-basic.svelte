<script lang="ts">
  import { Steps, Button, Text } from '@chenzy-design/svelte';

  let current = $state(0);
  const steps = [
    { title: '填写信息', description: '基本资料' },
    { title: '确认订单', description: '核对内容' },
    { title: '完成支付', description: '提交成功' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <Steps {current} {steps} />
  <div style="display: flex; gap: 8px;">
    <Button disabled={current === 0} onclick={() => (current -= 1)}>上一步</Button>
    <Button type="primary" disabled={current >= steps.length - 1} onclick={() => (current += 1)}>下一步</Button>
  </div>
  <Text type="tertiary">当前步：{current + 1} / {steps.length}</Text>
</div>
