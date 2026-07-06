<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>('');

  const options = [
    { label: '加载太慢', value: 'slow' },
    { label: '功能缺失', value: 'missing' },
    { label: '存在问题', value: 'buggy' },
    { label: '其他', value: 'other' },
  ];
</script>

<Button onclick={() => (open = true)}>单选原因</Button>

<Feedback
  type="radio"
  title="你遇到的主要问题是？"
  {options}
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={() => { open = false; }}
  onCancel={() => { open = false; }}
/>
