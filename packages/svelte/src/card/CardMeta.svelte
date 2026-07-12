<!--
  Card.Meta — 卡片内容区的结构化元信息子组件，对齐 Semi Card.Meta。
  结构（同 Semi meta.tsx）：avatar（左）+ wrapper(title + description)。
  title / description 支持字符串或 Snippet；仅在有 title 或 description 时渲染 wrapper。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface Props {
    /** 头像。 */
    avatar?: Snippet;
    /** 标题。 */
    title?: Snippet | string;
    /** 描述。 */
    description?: Snippet | string;
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
  }

  let { avatar, title, description, class: className, style }: Props = $props();

  const hasWrapper = $derived(title !== undefined || description !== undefined);
</script>

<div class={['cd-card__meta', className].filter(Boolean).join(' ')} {style}>
  {#if avatar}
    <div class="cd-card__meta-avatar">{@render avatar()}</div>
  {/if}
  {#if hasWrapper}
    <div class="cd-card__meta-wrapper">
      {#if title !== undefined}
        <div class="cd-card__meta-wrapper-title">
          {#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
        </div>
      {/if}
      {#if description !== undefined}
        <div class="cd-card__meta-wrapper-description">
          {#if typeof description === 'string'}{description}{:else}{@render description()}{/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-card__meta {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .cd-card__meta-avatar {
    margin-inline-end: var(--cd-card-avatar-marginright);
  }
  .cd-card__meta-wrapper-title {
    font-size: var(--cd-card-title-size);
    font-weight: var(--cd-card-title-weight);
    line-height: var(--cd-card-title-lineheight);
    color: var(--cd-card-title-color);
    letter-spacing: 0;
  }
  .cd-card__meta-wrapper-description {
    font-size: var(--cd-card-default-size);
    font-weight: var(--cd-card-default-weight);
    line-height: var(--cd-card-default-lineheight);
    color: var(--cd-card-desc-color);
    letter-spacing: 0;
  }
</style>
