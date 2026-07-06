<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let saveBtn = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    {
      target: () => saveBtn,
      title: '记得保存',
      description: '不遮罩背景，只做轻量提示，用户仍可查看周围内容。',
    },
  ];
</script>

<div style="margin-bottom:16px">
  <button
    bind:this={saveBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    保存
  </button>
</div>

<Button onclick={() => (visible = true)}>开始引导</Button>

<UserGuide
  {steps}
  {visible}
  mask={false}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
