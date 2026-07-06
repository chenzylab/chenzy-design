<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let brandBtn = $state<HTMLElement | null>(null);
  let helpBtn = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    {
      target: () => brandBtn,
      title: '品牌主题引导',
      description: '使用 primary 主题，气泡与高亮采用品牌色调。',
    },
    {
      target: () => helpBtn,
      title: '随时求助',
      description: '遇到问题可以随时点击这里查看帮助中心。',
    },
  ];
</script>

<div style="display:flex; gap:8px; align-items:center; margin-bottom:16px">
  <button
    bind:this={brandBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    工作台
  </button>
  <button
    bind:this={helpBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    帮助
  </button>
</div>

<Button onclick={() => (visible = true)}>开始引导</Button>

<UserGuide
  {steps}
  {visible}
  theme="primary"
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
