<script lang="ts">
  import { Feedback, Button, Empty, TextArea } from '@chenzy-design/svelte';

  let visible = $state(false);
  let value = $state('');
  let showThanks = $state(false);

  function handleOk() {
    showThanks = true;
    setTimeout(() => {
      visible = false;
      setTimeout(() => (showThanks = false), 200);
    }, 1500);
  }
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: 完成提示</Button>
<Feedback
  type="custom"
  {visible}
  okButtonProps={{ disabled: !value }}
  title={showThanks ? ' ' : '您对本产品的建议是？'}
  footer={showThanks ? null : undefined}
  onOk={handleOk}
  onCancel={() => { visible = false; }}
>
  {#snippet renderContent(content)}
    {#if showThanks}
      <Empty description="感谢您的反馈" style="padding: 30px;" />
    {:else}
      {@render content()}
    {/if}
  {/snippet}
  {#snippet children()}
    <span>这是一段自定义的内容</span>
    <TextArea onChange={(v) => (value = v)} />
  {/snippet}
</Feedback>
