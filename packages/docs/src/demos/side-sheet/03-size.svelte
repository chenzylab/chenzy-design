<script lang="ts">
  import { SideSheet, RadioGroup, Radio, Button } from '@chenzy-design/svelte';

  type Size = 'small' | 'medium' | 'large';
  let visible = $state(false);
  let size = $state<Size>('small');
  const change = () => (visible = !visible);
</script>

<RadioGroup value={size} onChange={(v) => (size = v as Size)}>
  <Radio value="small">small</Radio>
  <Radio value="medium">medium</Radio>
  <Radio value="large">large</Radio>
</RadioGroup>
<br />
<br />
<Button onclick={change}>Open SideSheet</Button>
<SideSheet title="滑动侧边栏" {visible} onCancel={change} {size}>
  <p>This is the content of a basic sidesheet.</p>
  <p>Here is more content...</p>
</SideSheet>
