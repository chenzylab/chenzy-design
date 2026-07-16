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

<NodeViewWrapper as="span" class="cd-ai-chat-input-select-slot-wrap">
  <Select
    size="small"
    optionList={options as never}
    value={value as never}
    onChange={handleChange as never}
  />
</NodeViewWrapper>

<style>
  /* NodeViewWrapper 的 class 在运行时注入，用 :global 命中（避免 unused-selector）。 */
  :global(.cd-ai-chat-input-select-slot-wrap) {
    display: inline-flex;
    vertical-align: baseline;
    margin: 0 var(--cd-spacing-extra-tight);
  }

  :global(.cd-ai-chat-input-select-slot-wrap .cd-select) {
    min-width: 80px;
  }
</style>
