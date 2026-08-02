<!--
  SelectSlotNode — tiptap selectSlot 自定义节点的 Svelte NodeView（可选补充）。
  对齐 Semi SelectSlotComponent：编辑器内联下拉，选中写回 node.attrs.value（updateAttributes）。
  通常用于 renderTemplate 模版填空（模版里嵌可选参数）。用 svelte-tiptap NodeViewWrapper 承载。
  props 由 SvelteNodeViewRenderer 注入（tiptap NodeViewProps：node/updateAttributes）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { Select } from '../select/index.js';

  let { node, updateAttributes }: NodeViewProps = $props();

  // options 存为 JSON 字符串（对齐 Semi）；解析失败回退空数组。
  const options = $derived.by(() => {
    const raw = node.attrs.options as string | undefined;
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return [];
      return arr.map((o) => ({ value: String(o), label: String(o) }));
    } catch {
      return [];
    }
  });

  const value = $derived((node.attrs.value as string) ?? '');

  function handleChange(v: unknown): void {
    if (typeof v === 'string') updateAttributes({ value: v });
  }
</script>

<!-- 类名对齐 Semi extension/selectSlot/index.tsx：select-slot-wrapper（外层）+
     select-slot（Select 自身），两个都**无前缀**。本库原来外层叫
     cd-ai-chat-input-select-slot-wrap，且 Select 上没挂 select-slot。 -->
<NodeViewWrapper as="span" class="select-slot-wrapper">
  <Select
    class="select-slot"
    size="small"
    optionList={options as never}
    value={value as never}
    onChange={handleChange as never}
  />
</NodeViewWrapper>

<style>
  /* 逐条对齐 Semi aiChatInput.scss:570-596。本库原来只有三行自造样式
     （inline-flex + 通用 spacing 外边距 + min-width:80px），
     Semi 的底色/圆角/高度/内距/文本色/箭头色一条都没接。
     NodeViewWrapper 与 Select 内部节点的 class 都在运行时注入，故一律 :global。 */
  :global(.select-slot-wrapper) {
    display: inline-flex;
    vertical-align: baseline;
    margin: var(--cd-spacing-ai-chat-input-rich-text-select-slot-marginy)
      var(--cd-spacing-ai-chat-input-rich-text-select-slot-marginx);
  }

  :global(.select-slot) {
    height: var(--cd-height-ai-chat-input-rich-text-select-slot);
    padding: var(--cd-spacing-ai-chat-input-rich-text-select-slot-paddingy)
      var(--cd-spacing-ai-chat-input-rich-text-select-slot-paddingx);
    border-radius: var(--cd-radius-ai-chat-input-rich-text-select-slot);
    background-color: var(--cd-color-ai-chat-input-rich-text-select-slot-bg);
    font-size: var(--cd-font-size-regular);
  }

  /* Semi 用 .semi-select-selection 命中选中文本；本库 Select 里对应的是 -value。 */
  :global(.select-slot .cd-select-value) {
    color: var(--cd-color-ai-chat-input-rich-text-select-selection-text);
    font-weight: bold;
    margin-left: var(--cd-spacing-ai-chat-input-rich-text-select-selection-marginleft);
  }

  :global(.select-slot .cd-select-arrow) {
    color: var(--cd-color-ai-chat-input-rich-text-select-slot-arrow);
    width: var(--cd-width-ai-chat-input-rich-text-select-slot-arrow);
  }

  /* 展开/聚焦时不显描边（Semi &.semi-select-open / -focus / :focus 均 border-color: transparent）。 */
  :global(.select-slot.cd-select-open),
  :global(.select-slot.cd-select-focus),
  :global(.select-slot:focus) {
    border-color: transparent;
  }
</style>
