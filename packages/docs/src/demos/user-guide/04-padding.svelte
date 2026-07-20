<script lang="ts">
  import { UserGuide, Button, Switch, Tag } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let el1 = $state<HTMLElement | null>(null);
  let el2 = $state<HTMLElement | null>(null);
  let el3 = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => el1, title: '新手引导', description: 'Hello ByteDancer!' },
    { target: () => el2, title: 'New Padding', description: 'This is 10px padding' },
    { target: () => el3, title: 'Change Padding', description: 'We change the Padding to 15px', spotlightPadding: 15 },
  ];
</script>

<Button onclick={() => (visible = true)}>开始引导</Button>
<br /><br />
<div style="display:flex; gap:12px; align-items:center">
  <span bind:this={el1}><Switch checked={true} /></span>
  <span bind:this={el2}><Tag>Default Tag</Tag></span>
  <span bind:this={el3}><Button>确定</Button></span>
</div>

<UserGuide
  mode="popup"
  mask
  {visible}
  spotlightPadding={10}
  {steps}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
