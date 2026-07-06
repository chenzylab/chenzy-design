<script lang="ts">
  import { UserGuide, Button, Text } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);
  let current = $state(0);

  let a = $state<HTMLElement | null>(null);
  let b = $state<HTMLElement | null>(null);
  let c = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => a, title: '第一步', description: '这是引导的起点。' },
    { target: () => b, title: '第二步', description: '当前步骤由外部状态受控。' },
    { target: () => c, title: '第三步', description: '到达最后一步即可完成。' },
  ];
</script>

<div style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
  <span bind:this={a} style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px">A</span>
  <span bind:this={b} style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px">B</span>
  <span bind:this={c} style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px">C</span>
</div>

<div style="display:flex; gap:12px; align-items:center">
  <Button onclick={() => { current = 0; visible = true; }}>开始引导</Button>
  <Text type="tertiary">当前步骤：{current + 1} / {steps.length}</Text>
</div>

<UserGuide
  {steps}
  {visible}
  {current}
  onChange={(c) => (current = c)}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
