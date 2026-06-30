<!--
  List.Meta — 项内结构化布局：avatar（头像/图标） + title（标题） + description（描述）。
  三段均可用 props（string）或同名 Snippet 提供，Snippet 优先。纯展示，无状态、无 effect。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 左侧头像/图标区，string 直接渲染或用 avatar Snippet。 */
    avatar?: string | Snippet;
    /** 标题，string 或 title Snippet。 */
    title?: string | Snippet;
    /** 描述，string 或 description Snippet。 */
    description?: string | Snippet;
    class?: string;
  }

  let { avatar, title, description, class: className = '' }: Props = $props();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }
</script>

<div class={['cd-list__meta', className].filter(Boolean).join(' ')}>
  {#if avatar !== undefined}
    <div class="cd-list__meta-avatar">
      {#if isSnippet(avatar)}{@render avatar()}{:else}{avatar}{/if}
    </div>
  {/if}
  <div class="cd-list__meta-content">
    {#if title !== undefined}
      <div class="cd-list__meta-title">
        {#if isSnippet(title)}{@render title()}{:else}{title}{/if}
      </div>
    {/if}
    {#if description !== undefined}
      <div class="cd-list__meta-description">
        {#if isSnippet(description)}{@render description()}{:else}{description}{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .cd-list__meta {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-base-tight, 12px);
    flex: 1;
    min-inline-size: 0;
  }
  .cd-list__meta-avatar {
    flex: none;
    display: flex;
    align-items: center;
  }
  .cd-list__meta-content {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-list__meta-title {
    color: var(--cd-list-item-color);
    font-weight: var(--cd-font-weight-medium, 500);
    line-height: 1.4;
  }
  .cd-list__meta-description {
    color: var(--cd-list-header-color);
    font-size: var(--cd-font-size-small, 12px);
    line-height: 1.5;
    margin-block-start: 2px;
  }
</style>
