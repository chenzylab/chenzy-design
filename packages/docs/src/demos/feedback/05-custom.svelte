<script lang="ts">
  import { Feedback, Button, TextArea } from '@chenzy-design/svelte';

  let visible = $state(false);
  let value = $state('');
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: Popup, custom</Button>
<Feedback
  type="custom"
  okButtonProps={{ disabled: !value }}
  title="您对本产品的建议是？"
  {visible}
  onOk={() => { visible = false; }}
  onCancel={() => { visible = false; }}
>
  {#snippet children()}
    <span>这是一段自定义的内容</span>
    <TextArea onChange={(v) => (value = v)} />
  {/snippet}
</Feedback>
