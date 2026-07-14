<script lang="ts">
  import { UserGuide, Button, Switch, Tag } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let el1 = $state<HTMLElement | null>(null);
  let el2 = $state<HTMLElement | null>(null);
  let el3 = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => el1, title: '新手引导', description: 'Hello ByteDancer!' },
    { target: () => el2, title: 'New Button Style', description: 'Button text is Next' },
    { target: () => el3, title: 'New finish button text', description: 'Button text is I know' },
  ];
</script>

<Button onclick={() => (visible = true)}>开始引导</Button>
<br /><br />
<div style="display:flex; gap:12px; align-items:center">
  <span bind:this={el1}><Switch value={true} /></span>
  <span bind:this={el2}><Tag>Default Tag</Tag></span>
  <span bind:this={el3}><Button>确定</Button></span>
</div>

<UserGuide
  mode="popup"
  mask
  {visible}
  finishText="我知道啦！"
  nextButtonProps={{ children: 'Next' }}
  prevButtonProps={{ children: 'Prev', theme: 'borderless' }}
  {steps}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
