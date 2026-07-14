<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: Popup, text</Button>
<Feedback
  type="text"
  textAreaProps={{ maxCount: 200 }}
  title="您对本产品的建议是？"
  {visible}
  onOk={() => { visible = false; }}
  onCancel={() => { visible = false; }}
/>
