<!--
  Card.Meta — 卡片内容区的结构化元信息子组件。
  含 avatar（左侧图标/头像）、title（标题）、description（描述），均支持字符串或 Snippet。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface Props {
    avatar?: Snippet;
    title?: Snippet | string;
    description?: Snippet | string;
    class?: string;
    style?: string;
  }

  let { avatar, title, description, class: className, style }: Props = $props();
</script>

<div class={['cd-card__meta', className].filter(Boolean).join(' ')} {style}>
  {#if avatar}
    <div class="cd-card__meta-avatar">{@render avatar()}</div>
  {/if}
  <div class="cd-card__meta-detail">
    {#if title !== undefined}
      <div class="cd-card__meta-title">
        {#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
      </div>
    {/if}
    {#if description !== undefined}
      <div class="cd-card__meta-description">
        {#if typeof description === 'string'}{description}{:else}{@render description()}{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .cd-card__meta {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-3);
  }
  .cd-card__meta-avatar {
    flex: 0 0 auto;
  }
  .cd-card__meta-detail {
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  .cd-card__meta-title {
    color: var(--cd-card-title-color);
    font-weight: var(--cd-font-weight-semibold);
    font-size: var(--cd-font-size-3);
    margin-block-end: var(--cd-spacing-1);
  }
  .cd-card__meta-description {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-2);
  }
</style>
