<!--
  AIChatInputSuggestionItem — 建议面板单项（1:1 对齐 Semi suggestionItem.tsx）。

  与 Semi 一致：renderSuggestionItem 存在时**整项替换**（回传
  { suggestion, className, onClick, onMouseEnter }），而非塞进默认外壳里。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { suggestionContent, type AIChatInputSuggestion } from '@chenzy-design/core';

  interface Props {
    suggestion: AIChatInputSuggestion;
    isActive?: boolean;
    index: number;
    /** 整项替换渲染（对齐 Semi renderSuggestionItem，入参对齐 RenderSuggestionItemProps）。 */
    renderSuggestionItem?:
      | Snippet<
          [
            {
              suggestion: AIChatInputSuggestion;
              className: string;
              onClick: () => void;
              onMouseEnter: () => void;
            },
          ]
        >
      | undefined;
    onClick: (suggestion: AIChatInputSuggestion) => void;
    onMouseEnter: (index: number) => void;
  }

  let {
    suggestion,
    isActive = false,
    index,
    renderSuggestionItem,
    onClick,
    onMouseEnter,
  }: Props = $props();

  const content = $derived(suggestionContent(suggestion));

  const className = $derived(
    `cd-ai-chat-input-suggestion-item${isActive ? ' cd-ai-chat-input-suggestion-item-active' : ''}`,
  );

  function handleClick(): void {
    onClick(suggestion);
  }

  function handleMouseEnter(): void {
    onMouseEnter(index);
  }
</script>

{#if renderSuggestionItem}
  {@render renderSuggestionItem({
    suggestion,
    className,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
  })}
{:else}
  <div
    class={className}
    role="option"
    aria-selected={isActive}
    tabindex="-1"
    onmousedown={(e) => {
      // mousedown 而非 click：避免编辑器先 blur 触发 useDismiss 关闭面板。
      e.preventDefault();
      handleClick();
    }}
    onmouseenter={handleMouseEnter}
  >
    {content}
  </div>
{/if}

<style>
  /* Semi: &-suggestion &-item { radius + padding + text-0 + @include font-size-regular } */
  .cd-ai-chat-input-suggestion-item {
    padding: var(--cd-spacing-ai-chat-input-suggestion-item-paddingy)
      var(--cd-spacing-ai-chat-input-suggestion-item-paddingx);
    border-radius: var(--cd-radius-ai-chat-input-suggestion-item);
    color: var(--cd-color-ai-chat-input-suggestion-item-text);
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    cursor: pointer;
  }

  /* 同 skill-item：Semi 只有 -active 一条，悬浮高亮由 onMouseEnter 驱动同一状态。 */
  .cd-ai-chat-input-suggestion-item-active {
    background-color: var(--cd-color-ai-chat-input-suggestion-item-bg-active);
  }
</style>

