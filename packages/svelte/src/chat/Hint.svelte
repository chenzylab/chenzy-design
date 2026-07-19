<!--
  Hint — Chat 提示区（严格对齐 Semi chat/hint）。
  DOM 对齐 Semi：.cd-chat-hints（容器，column） > .cd-chat-hint-item（border）
    ( .cd-chat-hint-content + .cd-chat-hint-icon(IconArrowRight) )。
  点击派发 onHintClick(hint)。自定义整项渲染走 renderHintBox snippet。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconArrowRight } from '@chenzy-design/icons';
  import type { RenderHintBoxProps } from './types.js';

  interface Props {
    hints?: string[];
    onHintClick?: ((hint: string) => void) | undefined;
    renderHintBox?: Snippet<[RenderHintBoxProps]> | undefined;
    class?: string;
    style?: string;
  }

  let { hints, onHintClick, renderHintBox, class: className = '', style }: Props = $props();
</script>

{#if hints && hints.length > 0}
  <div class="cd-chat-hints {className}" {style}>
    {#each hints as hint, index (index)}
      {#if renderHintBox}
        {@render renderHintBox({ content: hint, index, onHintClick: () => onHintClick?.(hint) })}
      {:else}
        <button type="button" class="cd-chat-hint-item" onclick={() => onHintClick?.(hint)}>
          <span class="cd-chat-hint-content">{hint}</span>
          <IconArrowRight class="cd-chat-hint-icon" />
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  /* —— hints 容器（对齐 Semi .semi-chat-hints：column + marginLeft 34px） —— */
  .cd-chat-hints {
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-chat-hint-rowGap);
    margin-top: var(--cd-chat-hint-marginY);
    margin-bottom: var(--cd-chat-hint-marginY);
    margin-left: var(--cd-chat-hint-marginLeft);
  }

  /* —— hint-item（对齐 Semi -hint-item：border + radius + 内容/图标列间距） —— */
  .cd-chat-hint-item {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    column-gap: var(--cd-chat-hint-item-columnGap);
    width: fit-content;
    background: var(--cd-chat-hint-item-bg);
    align-items: center;
    border: var(--cd-chat-hint-item-border-width) solid var(--cd-chat-hint-item-border);
    padding: var(--cd-chat-hint-item-marginY) var(--cd-chat-hint-item-marginX);
    border-radius: var(--cd-chat-hint-item-radius);
    appearance: none;
    font: inherit;
  }

  .cd-chat-hint-item:hover {
    background-color: var(--cd-chat-hint-item-bg-hover);
  }

  .cd-chat-hint-item:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-chat-hint-content {
    font-size: var(--cd-chat-hint-content-font-size);
    color: var(--cd-chat-hint-content-text);
  }

  .cd-chat-hint-item :global(.cd-chat-hint-icon) {
    color: var(--cd-chat-hint-icon);
  }
</style>
