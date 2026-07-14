<script lang="ts">
  import { SideSheet, RadioGroup, Radio, Button } from '@chenzy-design/svelte';

  type Placement = 'left' | 'right' | 'top' | 'bottom';
  let visible = $state(false);
  let placement = $state<Placement>('right');
  const change = () => (visible = !visible);
</script>

<RadioGroup value={placement} onChange={(v) => (placement = v as Placement)}>
  <Radio value="right">right</Radio>
  <Radio value="left">left</Radio>
  <Radio value="top">top</Radio>
  <Radio value="bottom">bottom</Radio>
</RadioGroup>
<br />
<br />
<Button onclick={change}>Open SideSheet</Button>
<SideSheet title="滑动侧边栏" {visible} onCancel={change} {placement}>
  <p>This is the content of a basic sidesheet.</p>
  <p>Here is more content...</p>
</SideSheet>
