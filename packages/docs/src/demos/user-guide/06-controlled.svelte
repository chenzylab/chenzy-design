<script lang="ts">
  import { UserGuide, Button, Space, Switch, Tag } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);
  let current = $state(0);

  let el1 = $state<HTMLElement | null>(null);
  let el2 = $state<HTMLElement | null>(null);
  let el3 = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    { target: () => el1, title: '新手引导', description: 'Hello ByteDancer!', position: 'bottom' },
    { target: () => el2, title: 'Switch', description: 'This is a Semi Switch', position: 'bottom' },
    { target: () => el3, title: 'Button', description: 'This is a Semi Button', position: 'bottom' },
  ];
</script>

<Button onclick={() => (visible = true)}>开始引导</Button>
<br /><br />
<Space>
  <span bind:this={el1}><Switch defaultChecked={true} /></span>
  <span bind:this={el2}><Tag>Default Tag</Tag></span>
  <span bind:this={el3}><Button>确定</Button></span>
</Space>

<UserGuide
  mode="popup"
  mask
  {visible}
  {current}
  {steps}
  onChange={(c) => (current = c)}
  onFinish={() => { visible = false; current = 0; }}
  onSkip={() => { visible = false; current = 0; }}
/>
