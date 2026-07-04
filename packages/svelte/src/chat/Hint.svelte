<!--
  Hint — Chat 提示区（对齐 Semi chat-hint）。
  横排一组可点击提示项；点击派发 onHintClick(hint)（Chat 容器据此追加一条 user 消息）。
  自定义整项渲染走 renderHintBox snippet（对齐 Semi renderHintBox render prop）。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { RenderHintBoxProps } from './types.js';

  interface Props {
    /** 提示文本列表。 */
    hints?: string[];
    /** 点击某项回调，参数为提示文本。 */
    onHintClick?: ((hint: string) => void) | undefined;
    /** 自定义单项渲染（对齐 Semi renderHintBox）。 */
    renderHintBox?: Snippet<[RenderHintBoxProps]> | undefined;
    /** 附加类名。 */
    class?: string;
    /** 内联样式。 */
    style?: string;
  }

  let { hints, onHintClick, renderHintBox, class: className = '', style }: Props = $props();
</script>

{#if hints && hints.length > 0}
  <div class="cd-chat-hint {className}" {style}>
    {#each hints as hint, index (index)}
      {#if renderHintBox}
        {@render renderHintBox({ content: hint, index, onHintClick: () => onHintClick?.(hint) })}
      {:else}
        <button
          type="button"
          class="cd-chat-hint-item"
          onclick={() => onHintClick?.(hint)}
        >
          {hint}
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .cd-chat-hint {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-tight) 0;
  }

  .cd-chat-hint-item {
    appearance: none;
    border: none;
    cursor: pointer;
    font: inherit;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-base);
    background: var(--cd-chat-hint-bg);
    color: var(--cd-chat-hint-color);
    border-radius: var(--cd-chat-hint-radius);
    transition: background var(--cd-chat-motion-duration) ease;
  }

  .cd-chat-hint-item:hover {
    background: var(--cd-chat-hint-bg-hover);
  }

  .cd-chat-hint-item:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
