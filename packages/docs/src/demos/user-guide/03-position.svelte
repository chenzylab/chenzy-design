<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);
  let el = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => el, title: '新手引导', description: 'Hello ByteDancer!', position: 'top' },
    { target: () => el, title: 'New Position', description: 'This is Right Position', position: 'right' },
    { target: () => el, title: 'Hide Arrow', description: 'We hide the arrow', position: 'bottom', showArrow: false },
  ];
</script>

<div style="display:flex; justify-content:center; padding:80px 0">
  <span bind:this={el}>
    <Button onclick={() => (visible = true)}>开始引导</Button>
  </span>
</div>

<UserGuide
  mode="popup"
  mask
  {visible}
  {steps}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
