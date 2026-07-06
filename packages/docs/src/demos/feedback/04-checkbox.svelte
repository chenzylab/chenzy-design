<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';
  import type { FeedbackValue } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<FeedbackValue>([]);

  const options = [
    { label: '界面美观', value: 'ui' },
    { label: '易于使用', value: 'ux' },
    { label: '性能流畅', value: 'perf' },
    { label: '功能齐全', value: 'features' },
  ];
</script>

<Button onclick={() => (open = true)}>多选亮点</Button>

<Feedback
  type="checkbox"
  title="你喜欢哪些方面？"
  {options}
  {open}
  {value}
  onOpenChange={(v) => (open = v)}
  onValueChange={(v) => (value = v)}
  onOk={() => { open = false; }}
  onCancel={() => { open = false; }}
/>
