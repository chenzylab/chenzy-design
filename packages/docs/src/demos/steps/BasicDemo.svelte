<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';

  let step = $state(1);
  let stepD = $state(0);
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="width: 480px">
    <Steps
      current={step}
      clickable
      steps={[
        { title: '填写信息', description: '基本资料' },
        { title: '确认订单', description: '核对内容' },
        { title: '完成', description: '提交成功' },
      ]}
      onChange={(c) => (step = c)}
    />
  </div>
  <Text type="tertiary">当前步：{step}</Text>

  <Text type="tertiary">per-step disabled（第 2 步禁用，不可点击）：</Text>
  <div style="width: 480px" data-testid="steps-disabled">
    <Steps
      current={stepD}
      clickable
      steps={[
        { title: '填写信息' },
        { title: '确认订单', disabled: true },
        { title: '完成' },
      ]}
      onChange={(c) => (stepD = c)}
    />
  </div>
  <Text type="tertiary">当前步：{stepD}（点第 2 步应无变化）</Text>

  <Text type="tertiary">dot 点状（横向）：</Text>
  <div style="width: 480px" data-testid="steps-dot">
    <Steps
      current={step}
      dot
      clickable
      steps={[
        { title: '填写信息' },
        { title: '确认订单' },
        { title: '完成' },
      ]}
      onChange={(c) => (step = c)}
    />
  </div>

  <Text type="tertiary">dot 点状（纵向）：</Text>
  <div style="width: 240px" data-testid="steps-dot-vertical">
    <Steps
      current={1}
      dot
      direction="vertical"
      steps={[
        { title: '已下单', description: '14:02' },
        { title: '运输中', description: '配送员已揽件' },
        { title: '已签收' },
      ]}
    />
  </div>

  <Text type="tertiary">type=basic 线框型（描边圆，非实心填充）：</Text>
  <div style="width: 480px" data-testid="steps-basic">
    <Steps
      current={1}
      type="basic"
      steps={[
        { title: '填写信息', description: '基本资料' },
        { title: '确认订单', description: '核对内容' },
        { title: '完成', description: '提交成功' },
      ]}
    />
  </div>

  <Text type="tertiary">icon 自定义图标（emoji 替代默认序号/✓/✕）：</Text>
  <div style="width: 480px" data-testid="steps-icon">
    <Steps
      current={1}
      steps={[
        { title: '登录', description: '账号验证' },
        { title: '配送', description: '正在派送' },
        { title: '收货', description: '确认签收' },
      ]}
    >
      {#snippet icon({ index })}
        <span>{(['🔑', '🚚', '📦'] as const)[index]}</span>
      {/snippet}
    </Steps>
  </div>
</div>
