<!--
  InputSlotNode — tiptap inputSlot 自定义节点的 Svelte NodeView（可选补充）。
  对齐 Semi InputSlotComponent：可编辑的内联填空节点（NodeViewContent 承载子文本），
  空态显示 placeholder。通常用于 renderTemplate 模版填空。用 svelte-tiptap NodeViewWrapper +
  NodeViewContent 承载。props 由 SvelteNodeViewRenderer 注入（NodeViewProps：node/editor/getPos）。

  两处对齐 Semi component.tsx：
  1. IME 组字期间隐藏 placeholder——本节点的 NodeView update 在 IME 合成期间被跳过
     （见 input-slot-extension.ts 的 addNodeView update 钩子），Svelte 不会重渲染，
     故改用原生 compositionstart/compositionend 事件驱动一个本地 state，
     避免占位符盖住正在输入的候选字符。
  2. placeholder 消失时用测得的宽度撑住 minWidth，防止插槽在用户打完字后突然收缩跳动。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap';

  const ZERO_WIDTH = '﻿';

  let { node, editor, getPos }: NodeViewProps = $props();

  const placeholder = $derived((node.attrs.placeholder as string) || '');
  // 空态：内容为空或仅零宽锚点。
  const isEmpty = $derived(node.textContent === '' || node.textContent === ZERO_WIDTH);

  let hidePlaceholderInComposition = $state(false);
  let placeholderEl = $state<HTMLSpanElement | undefined>();
  let placeholderWidth = $state<number | undefined>();

  function isSelectionInsideThisSlot(): boolean {
    if (!editor || typeof getPos !== 'function') return false;
    const pos = getPos();
    if (pos === undefined) return false;
    const { from, to } = editor.state.selection;
    return from > pos && to < pos + node.nodeSize;
  }

  $effect(() => {
    const dom = editor?.view?.dom;
    if (!dom) return;
    const onCompositionStart = (): void => {
      if (isSelectionInsideThisSlot()) hidePlaceholderInComposition = true;
    };
    const onCompositionEnd = (): void => {
      hidePlaceholderInComposition = false;
    };
    // capture：确保即便 ProseMirror 内部 stopPropagation 也能收到事件。
    dom.addEventListener('compositionstart', onCompositionStart, true);
    dom.addEventListener('compositionend', onCompositionEnd, true);
    dom.addEventListener('compositioncancel', onCompositionEnd, true);
    return () => {
      dom.removeEventListener('compositionstart', onCompositionStart, true);
      dom.removeEventListener('compositionend', onCompositionEnd, true);
      dom.removeEventListener('compositioncancel', onCompositionEnd, true);
    };
  });

  const shouldShowPlaceholder = $derived(isEmpty && !hidePlaceholderInComposition);

  // 测量 placeholder 宽度撑住 minWidth（Semi useLayoutEffect 同步测量）。
  // 根因排查记录：父容器 .input-slot 的宽度靠这里测量出的 offsetWidth 反过来撑开，
  // 而 .input-slot-placeholder 是无显式 width 的绝对定位元素——若不给 width:max-content
  // （见样式块），其 shrink-to-fit 自动宽度会以包含块（父容器）当前宽度为基准计算；
  // 父容器此刻只有 min-width:2px 的默认宽度撑着，两者互相依赖导致自我塌缩，真机复现
  // offsetWidth 精确退化到等于 fontSize（14px），而非文字实际所需的 81px/304px。
  // 加上 width:max-content 后测量值恢复正常，此处恢复为同步读取，不需要 setTimeout。
  $effect(() => {
    if (shouldShowPlaceholder && placeholderEl) {
      placeholderWidth = placeholderEl.offsetWidth;
    }
  });
</script>

<!-- 类名逐条对齐 Semi extension/inputSlot/component.tsx：input-slot /
     input-slot-placeholder / content 三个都是**无前缀**的（Semi 这几个 tiptap 节点视图
     刻意不带 semi- 前缀），本库原来一律加了 cd-ai-chat-input- 前缀。 -->
<NodeViewWrapper
  as="span"
  class="input-slot"
  data-empty={isEmpty || undefined}
  style={shouldShowPlaceholder && placeholderWidth ? `min-width: ${placeholderWidth}px` : undefined}
>
  {#if placeholder}
    <span
      bind:this={placeholderEl}
      class="input-slot-placeholder"
      contenteditable="false"
      aria-hidden="true"
      style={shouldShowPlaceholder ? undefined : 'display: none'}
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
     本库原来是普通行内元素，会把插槽撑开。
     width:max-content 打破循环依赖：父容器 .input-slot 的宽度靠 JS 测量本元素
     offsetWidth 撑开（见脚本 $effect），而无显式 width 的绝对定位元素的
     shrink-to-fit 自动宽度计算会以包含块（父容器）当前宽度为基准——父容器初始
     只有 min-width:2px 撑着，绝对定位子元素的自动宽度因此被压缩到远小于文字实际
     宽度（真机复现：offsetWidth 精确等于 fontSize 14px 而非文字真实所需的 81px），
     两者互相依赖导致自我塌缩。max-content 让宽度完全由内容决定，不参照包含块。 */
  :global(.input-slot-placeholder) {
    position: absolute;
    width: max-content;
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
