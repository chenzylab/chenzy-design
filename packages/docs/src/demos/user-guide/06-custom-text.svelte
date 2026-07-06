<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let step1 = $state<HTMLElement | null>(null);
  let step2 = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    {
      target: () => step1,
      title: '自定义按钮文案',
      description: '通过 nextButtonProps / prevButtonProps 定制按钮外观。',
    },
    {
      target: () => step2,
      title: '完成',
      description: '最后一步的按钮文案改为「知道了」。',
    },
  ];
</script>

<div style="display:flex; gap:8px; align-items:center; margin-bottom:16px">
  <span bind:this={step1} style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px">功能 A</span>
  <span bind:this={step2} style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px">功能 B</span>
</div>

<Button onclick={() => (visible = true)}>开始引导</Button>

<UserGuide
  {steps}
  {visible}
  finishText="知道了"
  nextButtonProps={{ theme: 'solid' }}
  prevButtonProps={{ type: 'tertiary' }}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
