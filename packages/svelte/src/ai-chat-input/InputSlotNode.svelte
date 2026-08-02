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

<!-- 类名逐条对齐 Semi extension/inputSlot/component.tsx：input-slot /
     input-slot-placeholder / content 三个都是**无前缀**的（Semi 这几个 tiptap 节点视图
     刻意不带 semi- 前缀），本库原来一律加了 cd-ai-chat-input- 前缀。 -->
<NodeViewWrapper as="span" class="input-slot" data-empty={isEmpty || undefined}>
  {#if isEmpty && placeholder}
    <span class="input-slot-placeholder" contenteditable="false" aria-hidden="true"
      >{placeholder}</span
    >
  {/if}
  <NodeViewContent as="span" class="content" />
</NodeViewWrapper>

<style>
  /* NodeViewWrapper 的 class 在运行时注入，用 :global 命中（避免 unused-selector）。 */
  /* 逐条对齐 Semi aiChatInput.scss:538-563：主色浅底的行内药丸。
     本库原来画的是「1px 虚线下划线」，与 Semi 完全不是一个视觉；
     那 13 条 $*-rich_text-input_slot-* 变量本库也只有 lineHeight 一条。 */
  :global(.input-slot) {
    display: inline-block;
    box-sizing: content-box;
    position: relative;
    background-color: var(--cd-color-ai-chat-input-rich-text-input-slot-bg);
    border-radius: var(--cd-radius-ai-chat-input-rich-text-input-slot);
    padding: var(--cd-spacing-ai-chat-input-rich-text-input-slot-paddingy)
      var(--cd-spacing-ai-chat-input-rich-text-input-slot-paddingx);
    margin: var(--cd-spacing-ai-chat-input-rich-text-input-slot-marginy)
      var(--cd-spacing-ai-chat-input-rich-text-input-slot-marginx);
    font-weight: var(--cd-font-ai-chat-input-rich-text-input-slot-fontweight);
    min-width: var(--cd-width-ai-chat-input-rich-text-input-slot);
    line-height: var(--cd-ai-chat-input-rich-text-input-slot-lineheight);
  }

  /* Semi 的占位符是**绝对定位**贴在 padding 内缘（不占位、不换行），
     本库原来是普通行内元素，会把插槽撑开。 */
  :global(.input-slot-placeholder) {
    position: absolute;
    top: var(--cd-spacing-ai-chat-input-rich-text-input-slot-paddingy);
    left: var(--cd-spacing-ai-chat-input-rich-text-input-slot-paddingx);
    z-index: var(--cd-z-ai-chat-input-rich-text-input-slot-placeholder);
    color: var(--cd-color-ai-chat-input-rich-text-input-slot-placeholder);
    white-space: pre;
    pointer-events: none;
    user-select: none;
  }

  :global(.input-slot .content) {
    outline: none;
    color: var(--cd-color-ai-chat-input-rich-text-input-slot-text);
  }
</style>
