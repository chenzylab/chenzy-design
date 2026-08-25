<!--
  ReferSlotNode — 对齐 Semi「自定义扩展」demo 的 ReferSlotComponent：极简 NodeView，
  只显示 value 文本，点击叉号删除整个节点（deleteNode）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';

  let { node }: NodeViewProps = $props();

  const value = $derived((node.attrs.value as string) ?? '');
</script>

<NodeViewWrapper as="span" class="ai-chat-input-refer-slot-wrapper">
  <span class="ai-chat-input-refer-slot">
    {value}
  </span>
</NodeViewWrapper>
