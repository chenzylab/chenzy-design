<script lang="ts">
  import { Feedback, Button, Text } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>({});
</script>

<Button type="primary" onclick={() => (open = true)}>评价体验</Button>
{#if value && typeof value === 'object' && !Array.isArray(value) && value.emoji}
  <Text type="tertiary">已选：{value.emoji}</Text>
{/if}

<Feedback
  type="emoji"
  title="你的体验如何？"
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={() => { open = false; }}
  onCancel={() => { open = false; }}
/>
