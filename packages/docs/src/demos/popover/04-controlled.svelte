<script lang="ts">
  import {
    Popover,
    RadioGroup,
    Radio,
    Empty,
    IllustrationSuccess,
    IllustrationSuccessDark,
  } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

{#snippet image()}
  <IllustrationSuccess style="width: 150px; height: 150px;" />
{/snippet}
{#snippet darkImage()}
  <IllustrationSuccessDark style="width: 150px; height: 150px;" />
{/snippet}

{#snippet content()}
  <Empty
    title="先进的设计 / 研发协作方式"
    imageSlot={image}
    darkModeImageSlot={darkImage}
    description="使用 Semi D2C 快速还原 Figma 设计稿，一键转代码"
    style="width: 400px; margin: 0 auto; display: flex; padding: 20px;"
  />
{/snippet}

<Popover {visible} {content} trigger="custom">
  <RadioGroup type="button" value={visible} onChange={(e) => (visible = e.target.value as boolean)}>
    <Radio value={true}>受控显示</Radio>
    <Radio value={false}>受控隐藏</Radio>
  </RadioGroup>
</Popover>
