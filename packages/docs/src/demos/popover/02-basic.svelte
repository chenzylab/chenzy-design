<script lang="ts">
  import {
    Popover,
    Tag,
    Empty,
    IllustrationSuccess,
    IllustrationSuccessDark,
  } from '@chenzy-design/svelte';
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

<Popover {content}>
  <Tag>悬停此处</Tag>
</Popover>
