<script lang="ts">
  import { SideSheet, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  const change = () => (visible = !visible);
</script>

<Button onclick={change}>Open SideSheet</Button>
<SideSheet title="滑动侧边栏" {visible} onCancel={change}>
  <p>This is the content of a basic sidesheet.</p>
  <p>Here is more content...</p>
</SideSheet>
