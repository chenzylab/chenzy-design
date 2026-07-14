<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: Modal, emoji</Button>
<Feedback
  mode="modal"
  title="Why did you choose this rating?"
  {visible}
  onOk={() => { visible = false; }}
  onCancel={() => { visible = false; }}
  onValueChange={(value) => console.log('emoji value', value)}
/>
