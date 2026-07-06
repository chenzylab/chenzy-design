<script lang="ts">
  import { Feedback, Button, Rating, Text, Space } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>('');
</script>

<Button onclick={() => (open = true)}>自定义内容</Button>

<Feedback
  type="custom"
  title="给这次服务打分"
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={() => { open = false; }}
  onCancel={() => { open = false; }}
>
  {#snippet renderContent({ setValue })}
    <Space direction="vertical">
      <Text type="tertiary">用星级为本次服务打分：</Text>
      <Rating onChange={(v) => setValue(String(v))} />
    </Space>
  {/snippet}
</Feedback>
