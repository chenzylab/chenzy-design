<script lang="ts">
  import { UserGuide, Button, Space, Switch, Tag } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

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
  {steps}
  onChange={(c) => console.log('当前引导步骤', c)}
  onNext={() => console.log('下一步引导')}
  onPrev={() => console.log('上一步引导')}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
