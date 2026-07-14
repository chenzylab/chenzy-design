<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: Popup, emoji</Button>
<Feedback
  title="您对本产品的评分是？"
  {visible}
  onOk={() => { visible = false; }}
  onCancel={() => { visible = false; }}
  onValueChange={(value) => console.log('emoji value', value)}
/>
