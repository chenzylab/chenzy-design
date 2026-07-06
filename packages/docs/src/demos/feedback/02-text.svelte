<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>('');
</script>

<Button onclick={() => (open = true)}>文本反馈</Button>

<Feedback
  type="text"
  title="告诉我们你的想法"
  textAreaProps={{ rows: 4, showCount: true, maxCount: 200 }}
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={() => { open = false; }}
  onCancel={() => { open = false; }}
/>
