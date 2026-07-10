<script lang="ts">
  import { Steps, Text } from '@chenzy-design/svelte';

  const steps = [
    { title: '已完成', description: '这是一段描述' },
    { title: '进行中', description: '这是一段描述' },
    { title: '等待中', description: '这是一段描述' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <Text type="tertiary">basic 迷你尺寸（size="small"）：</Text>
  <Steps type="basic" size="small" current={1} {steps} />

  <Text type="tertiary">nav 迷你尺寸：</Text>
  <div style="display: flex; justify-content: center;">
    <Steps
      type="nav"
      size="small"
      current={1}
      steps={[
        { title: '注册账号' },
        { title: '这个项目的文字比较多多多多' },
        { title: '产品用途' },
        { title: '期待尝试功能' },
      ]}
    />
  </div>
</div>
