<script lang="ts">
  import { SideSheet, TextArea, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  let value = $state('');
</script>

<Button onclick={() => (visible = true)}>Open SideSheet</Button>
<div style="margin-top:12px">
  <TextArea placeholder="Please enter something" onChange={(v) => (value = v)} />
</div>
<SideSheet
  title="可操作外部的侧边栏"
  {visible}
  onCancel={() => (visible = false)}
  mask={false}
  disableScroll={false}
>
  <p>这里是输入的内容：</p>
  <p>{value}</p>
</SideSheet>
