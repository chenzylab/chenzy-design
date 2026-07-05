<!--
  SkillSlotNode — tiptap skillSlot 自定义节点的 Svelte NodeView（阶段 3）。
  对齐 Semi SkillSlotComponent：把技能渲染为编辑器内的 inline chip（label + 删除）。
  用 svelte-tiptap 的 NodeViewWrapper 承载；删除走 deleteNode（移除该节点）。
  props 由 SvelteNodeViewRenderer 注入（tiptap NodeViewProps：node/editor/deleteNode）。
  aria-label 走 i18n；无 label/value 时不渲染（对齐 Semi 空值返回 null）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { useLocale } from '../locale-provider/index.js';

  let { node, deleteNode }: NodeViewProps = $props();

  const loc = useLocale();

  // 显示文本：label 优先，回退 value（对齐 Semi node.attrs.label ?? node.attrs.value）。
  const label = $derived((node.attrs.label as string) || (node.attrs.value as string) || '');

  function handleRemove(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    deleteNode();
  }
</script>

<NodeViewWrapper as="span" class="cd-ai-chat-input-skill-slot-wrap">
  {#if label}
    <span class="cd-ai-chat-input-skill-slot" contenteditable="false">
      <span class="cd-ai-chat-input-skill-slot-label">{label}</span>
      <button
        type="button"
        class="cd-ai-chat-input-skill-slot-delete"
        aria-label={loc().t('AIChatInput.deleteSkill')}
        onclick={handleRemove}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </span>
  {/if}
</NodeViewWrapper>

<style>
  .cd-ai-chat-input-skill-slot {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: 0 var(--cd-spacing-extra-tight) 0 var(--cd-spacing-tight);
    background: var(--cd-ai-chat-input-skill-bg);
    color: var(--cd-ai-chat-input-skill-color);
    border-radius: var(--cd-ai-chat-input-skill-radius);
    font-size: var(--cd-font-size-regular);
    line-height: 1.6;
    vertical-align: baseline;
  }

  .cd-ai-chat-input-skill-slot-label {
    white-space: nowrap;
  }

  .cd-ai-chat-input-skill-slot-delete {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 0;
    color: var(--cd-ai-chat-input-skill-delete);
  }

  .cd-ai-chat-input-skill-slot-delete:hover {
    color: var(--cd-ai-chat-input-skill-color);
  }

  .cd-ai-chat-input-skill-slot-delete:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }
</style>
