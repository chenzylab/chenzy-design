<script lang="ts">
  import {
    Feedback, Button, Empty, TextArea,
    IllustrationSuccess, IllustrationSuccessDark,
  } from '@chenzy-design/svelte';

  let visible1 = $state(false);
  let value1 = $state('');
  let showThanks1 = $state(false);

  let visible2 = $state(false);
  let value2 = $state('');
  let showThanks2 = $state(false);

  function handleOk1() {
    showThanks1 = true;
    setTimeout(() => {
      visible1 = false;
      setTimeout(() => (showThanks1 = false), 200);
    }, 1500);
  }

  function handleOk2() {
    showThanks2 = true;
    setTimeout(() => {
      visible2 = false;
      setTimeout(() => (showThanks2 = false), 200);
    }, 1500);
  }
</script>

<Button onclick={() => (visible1 = !visible1)}>展示反馈: Popup, 完成提示</Button>
<Feedback
  type="custom"
  visible={visible1}
  okButtonProps={{ disabled: !value1 }}
  title={showThanks1 ? ' ' : '您对本产品的建议是？'}
  footer={showThanks1 ? null : undefined}
  onOk={handleOk1}
  onCancel={() => { visible1 = false; }}
>
  {#snippet renderContent(content)}
    {#if showThanks1}
      <Empty description="感谢您的反馈" style="padding: 30px;">
        {#snippet imageSlot()}
          <IllustrationSuccess style="width: 150px; height: 150px;" />
        {/snippet}
        {#snippet darkModeImageSlot()}
          <IllustrationSuccessDark style="width: 150px; height: 150px;" />
        {/snippet}
      </Empty>
    {:else}
      {@render content()}
    {/if}
  {/snippet}
  {#snippet children()}
    <span>这是一段自定义的内容</span>
    <TextArea onChange={(v) => (value1 = v)} />
  {/snippet}
</Feedback>

<br /><br />

<Button onclick={() => (visible2 = !visible2)}>展示反馈: Modal, 完成提示</Button>
<Feedback
  mode="modal"
  type="custom"
  visible={visible2}
  okButtonProps={{ disabled: !value2 }}
  title={showThanks2 ? ' ' : '您对本产品的建议是？'}
  footer={showThanks2 ? null : undefined}
  onOk={handleOk2}
  onCancel={() => { visible2 = false; }}
>
  {#snippet renderContent(content)}
    {#if showThanks2}
      <Empty description="感谢您的反馈" style="padding: 30px;">
        {#snippet imageSlot()}
          <IllustrationSuccess style="width: 150px; height: 150px;" />
        {/snippet}
        {#snippet darkModeImageSlot()}
          <IllustrationSuccessDark style="width: 150px; height: 150px;" />
        {/snippet}
      </Empty>
    {:else}
      {@render content()}
    {/if}
  {/snippet}
  {#snippet children()}
    <span>这是一段自定义的内容</span>
    <TextArea onChange={(v) => (value2 = v)} />
  {/snippet}
</Feedback>
