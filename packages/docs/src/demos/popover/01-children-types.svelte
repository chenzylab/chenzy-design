<script lang="ts">
  import {
    Popover,
    Space,
    Empty,
    IllustrationSuccess,
    IllustrationSuccessDark,
  } from '@chenzy-design/svelte';
  import FunctionalComponent from './_functional-component.svelte';
  import ClassComponent from './_class-component.svelte';

  const style =
    'border: 2px solid var(--cd-color-border); padding-left: 4px; padding-right: 4px; border-radius: 4px;';
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

<Space>
  <Popover {content}>
    <FunctionalComponent {style} />
  </Popover>
  <Popover {content}>
    <ClassComponent {style} />
  </Popover>
  <Popover {content}>
    <span {style}>DOM</span>
  </Popover>
</Space>
