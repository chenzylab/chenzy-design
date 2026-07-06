<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>({});

  // 提交异步：await 期间外壳按钮 loading（aria-busy）。
  function submit() {
    return new Promise<void>((resolve) => setTimeout(resolve, 800));
  }
</script>

<Button type="primary" onclick={() => (open = true)}>抽屉形态反馈</Button>

<Feedback
  mode="popup"
  type="emoji"
  title="满意度调查"
  placement="right"
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={async () => {
    await submit();
    open = false;
  }}
  onCancel={() => { open = false; }}
/>
