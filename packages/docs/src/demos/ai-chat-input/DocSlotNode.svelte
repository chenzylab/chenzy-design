<!--
  DocSlotNode — 用户自定义 tiptap 节点的 NodeView 示例，对齐 Semi docSlot.jsx 的
  docSlotComponent：点击 chip 打印 console.log，展示带图标+省略号文本的自定义节点渲染。
  用于「自定义扩展」章节的 AddPasteRule demo，演示如何用 nodePasteRule 让粘贴内容自动
  识别并转换为自定义节点——这不是本库内置能力，是 tiptap 自定义扩展的用户实现示例。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { IconFile } from '@chenzy-design/icons';
  import { Text } from '@chenzy-design/svelte';

  let { node }: NodeViewProps = $props();

  const value = $derived((node.attrs.urlValue as string) ?? '');

  function handleClick(): void {
    console.log('click doc slot', value);
  }
</script>

<NodeViewWrapper as="span" class="doc-slot-container" onclick={handleClick}>
  <span class="doc-slot-text-container">
    <IconFile />
    <Text class="doc-slot-text" ellipsis={{ showTooltip: { opts: { content: value } } }}>
      {value}
    </Text>
  </span>
</NodeViewWrapper>

<style>
  :global(.doc-slot-container) {
    display: inline-flex;
    cursor: pointer;
    vertical-align: bottom;
  }

  :global(.doc-slot-text-container) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 200px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--cd-color-fill-0);
  }

  :global(.doc-slot-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
