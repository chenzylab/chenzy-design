<!--
  InputSlotNode — tiptap inputSlot 自定义节点的 Svelte NodeView（可选补充）。
  对齐 Semi InputSlotComponent：可编辑的内联填空节点（NodeViewContent 承载子文本），
  空态显示 placeholder。通常用于 renderTemplate 模版填空。用 svelte-tiptap NodeViewWrapper +
  NodeViewContent 承载。props 由 SvelteNodeViewRenderer 注入（NodeViewProps：node）。

  注：光标进出节点的精细处理（Semi 用零宽字符 + ProseMirror plugin 做全套微调）此处简化——
  仅保证空态 placeholder 与内容归一正确，复杂光标微调留浏览器/后续（见 spec §0.7）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap';

  const ZERO_WIDTH = '﻿';

  let { node }: NodeViewProps = $props();

  const placeholder = $derived((node.attrs.placeholder as string) || '');
  // 空态：内容为空或仅零宽锚点。
  const isEmpty = $derived(node.textContent === '' || node.textContent === ZERO_WIDTH);
</script>

<NodeViewWrapper as="span" class="cd-ai-chat-input-input-slot" data-empty={isEmpty || undefined}>
  {#if isEmpty && placeholder}
    <span class="cd-ai-chat-input-input-slot-placeholder" contenteditable="false" aria-hidden="true"
      >{placeholder}</span
    >
  {/if}
  <NodeViewContent as="span" class="cd-ai-chat-input-input-slot-content" />
</NodeViewWrapper>

<style>
  /* NodeViewWrapper 的 class 在运行时注入，用 :global 命中（避免 unused-selector）。 */
  :global(.cd-ai-chat-input-input-slot) {
    display: inline;
    position: relative;
    border-bottom: 1px dashed var(--cd-color-primary);
    padding: 0 var(--cd-spacing-extra-tight);
  }

  :global(.cd-ai-chat-input-input-slot-placeholder) {
    color: var(--cd-ai-chat-input-placeholder-color);
    pointer-events: none;
    user-select: none;
  }

  :global(.cd-ai-chat-input-input-slot-content) {
    outline: none;
  }
</style>
