<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);
  let el = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => el, title: 'No Mask', description: 'Hello ByteDancer!' },
  ];
</script>

<span bind:this={el}>
  <Button onclick={() => (visible = true)}>开始引导</Button>
</span>

<UserGuide
  mode="popup"
  mask={false}
  {visible}
  {steps}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
