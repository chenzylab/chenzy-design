<!--
  DialogueHint — AIChatDialogue 提示区（严格对齐 Semi widgets/dialogueHint.tsx）。

  注意：Semi 有两个互不相同的 Hint，本库原来把 chat 那个直接复用到了这里，
  导致类名前缀和能力都不对，故拆出本组件：
    - chat/hint.tsx          → semi-chat-hint-*，带 IconArrowRight，prop 名 value
    - aiChatDialogue/dialogueHint.tsx → semi-ai-chat-dialogue-hint-*，
      有 selecting 态（左外边距 52 → 68px 给多选框让位），无箭头图标，prop 名 hints
  DOM：.cd-ai-chat-dialogue-hints[-selecting] > .cd-ai-chat-dialogue-hint-item
        > .cd-ai-chat-dialogue-hint-content
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface RenderHintBoxProps {
    content: string;
    index: number;
    onHintClick: () => void;
  }

  interface Props {
    /** 提示文案列表。 */
    hints?: string[];
    /** 多选中态：容器左外边距加宽给多选框让位（对齐 Semi selecting）。 */
    selecting?: boolean;
    /** 点击某条提示。 */
    onHintClick?: ((hint: string) => void) | undefined;
    /** 自定义整项渲染。 */
    renderHintBox?: Snippet<[RenderHintBoxProps]> | undefined;
    /** 附加类名（合并到容器，对齐 Semi className）。 */
    class?: string;
    /** 容器行内样式（对齐 Semi style）。 */
    style?: string;
  }

  let {
    hints,
    selecting = false,
    onHintClick,
    renderHintBox,
    class: className = '',
    style,
  }: Props = $props();
</script>

{#if hints && hints.length > 0}
  <!-- Semi 用 <section>；这里保持一致。 -->
  <section
    class="cd-ai-chat-dialogue-hints {className}"
    class:cd-ai-chat-dialogue-hints-selecting={selecting}
    {style}
  >
    {#each hints as hint, index (index)}
      {#if renderHintBox}
        {@render renderHintBox({ content: hint, index, onHintClick: () => onHintClick?.(hint) })}
      {:else}
        <!-- Semi 是 div + role=button + 手写 Enter/Space；本库用原生 button，语义等价且自带键盘可达。 -->
        <button
          type="button"
          class="cd-ai-chat-dialogue-hint-item"
          onclick={() => onHintClick?.(hint)}
        >
          <span class="cd-ai-chat-dialogue-hint-content">{hint}</span>
        </button>
      {/if}
    {/each}
  </section>
{/if}

<style>
  /* —— hints 容器（对齐 Semi &-hints）—— */
  .cd-ai-chat-dialogue-hints {
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-ai-chat-dialogue-hints-row-gap);
    margin-top: var(--cd-ai-chat-dialogue-hints-margin-top);
    margin-bottom: var(--cd-ai-chat-dialogue-hints-margin-bottom);
    margin-left: var(--cd-ai-chat-dialogue-hints-margin-left);
  }

  /* 多选态下左外边距加宽（52 → 68px），给行首多选框让位。 */
  .cd-ai-chat-dialogue-hints-selecting {
    margin-left: var(--cd-ai-chat-dialogue-hints-selecting-margin-left);
  }

  /* —— hint-item（对齐 Semi &-hint-item）——
     Semi 无 column-gap（那是 chat 版为了容纳箭头图标才有的）。 */
  .cd-ai-chat-dialogue-hint-item {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    width: fit-content;
    background: var(--cd-ai-chat-dialogue-hint-bg);
    align-items: center;
    border: var(--cd-width-ai-chat-dialogue-hint-border) solid
      var(--cd-color-ai-chat-dialogue-hint-border);
    padding: var(--cd-ai-chat-dialogue-hint-item-padding-y)
      var(--cd-ai-chat-dialogue-hint-item-padding-x);
    border-radius: var(--cd-ai-chat-dialogue-hint-item);
    appearance: none;
    font: inherit;
  }

  .cd-ai-chat-dialogue-hint-item:hover {
    background-color: var(--cd-ai-chat-dialogue-hint-bg-hover);
  }

  /* Semi 靠 role=button 的浏览器默认焦点环；本库用原生 button，
     补 focus-visible 与库内其他可点项一致。 */
  .cd-ai-chat-dialogue-hint-item:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-ai-chat-dialogue-hint-content {
    font-size: var(--cd-ai-chat-dialogue-hint-content-font-size);
    color: var(--cd-ai-chat-dialogue-hint-text);
  }
</style>
