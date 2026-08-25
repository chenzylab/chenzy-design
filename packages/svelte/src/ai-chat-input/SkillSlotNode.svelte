<!--
  SkillSlotNode — tiptap skillSlot 自定义节点的 Svelte NodeView（阶段 3）。
  对齐 Semi SkillSlotComponent：把技能渲染为编辑器内的 inline chip（label + 删除）。
  用 svelte-tiptap 的 NodeViewWrapper 承载。
  props 由 SvelteNodeViewRenderer 注入（tiptap NodeViewProps：node/editor）。
  aria-label 走 i18n；无 label/value 时不渲染（对齐 Semi 空值返回 null）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { useLocale } from '../locale-provider/index.js';

  let { node, editor }: NodeViewProps = $props();

  const loc = useLocale();

  // 显示文本：label 优先，回退 value（对齐 Semi node.attrs.label ?? node.attrs.value）。
  const label = $derived((node.attrs.label as string) || (node.attrs.value as string) || '');

  // 对齐 Semi onRemove：清空整个编辑器内容（不是只删这一个节点）。
  function handleRemove(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    editor?.commands.clearContent();
  }
</script>

<!-- 类名逐条对齐 Semi extension/skillSlot/index.tsx：skill-slot-wrapper / skill-slot /
     skill-slot-delete 三个都**无前缀**（同 inputSlot/selectSlot）。本库原来加了
     cd-ai-chat-input- 前缀，且外层写成 -wrap（Semi 是 -wrapper）。
     Semi 里技能名是 skill-slot 的直接文本子节点，没有 -label 这一层，故一并去掉。
     删除按钮保留 <button>（Semi 是给 IconClose 挂 onClick，键盘不可达）。 -->
<NodeViewWrapper as="span" class="skill-slot-wrapper">
  {#if label}
    <span class="skill-slot" contenteditable="false">
      {label}
      <button
        type="button"
        class="skill-slot-delete"
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
  /* 逐条对齐 Semi aiChatInput.scss:612-648。
     本库原来是「常显药丸（有底色）+ 常显删除按钮」，用的是自造的
     -skill-bg/-skill-color/-skill-radius/-skill-delete 四条 token；
     Semi 是「纯文字（只有主色 + 600 字重）→ hover 才染底 → 删除按钮平时
     display:none，hover 时浮到右上角变成一个小圆徽标」。 */
  :global(.skill-slot-wrapper) {
    display: inline-flex;
    position: relative;
    padding: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-paddingy)
      var(--cd-spacing-ai-chat-input-rich-text-skill-slot-paddingx);
    margin: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-marginy)
      var(--cd-spacing-ai-chat-input-rich-text-skill-slot-marginx);
    border-radius: var(--cd-radius-ai-chat-input-rich-text-skill-slot);
  }

  :global(.skill-slot) {
    white-space: nowrap;
    outline: none;
    color: var(--cd-color-ai-chat-input-rich-text-skill-slot-text);
    font-weight: var(--cd-font-ai-chat-input-rich-text-skill-slot-fontweight);
  }

  /* 平时不显示（Semi &-delete { display: none }）。 */
  :global(.skill-slot-delete) {
    display: none;
    appearance: none;
    border: none;
    padding: 0;
  }

  :global(.skill-slot-wrapper:hover) {
    background-color: var(--cd-color-ai-chat-input-rich-text-skill-slot-bg-hover);
  }

  /* hover 时浮出：绝对定位到右上角，圆形小徽标。 */
  :global(.skill-slot-wrapper:hover .skill-slot-delete) {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    top: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-top);
    right: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-right);
    transform: translate(50%, -50%);
    border-radius: 50%;
    width: var(--cd-width-ai-chat-input-rich-text-select-slot-delete);
    height: var(--cd-width-ai-chat-input-rich-text-select-slot-delete);
    font-size: var(--cd-width-ai-chat-input-rich-text-select-slot-delete-icon);
    background: var(--cd-color-ai-chat-input-rich-text-skill-slot-delete-bg);
    color: var(--cd-color-ai-chat-input-rich-text-skill-slot-delete-text);
  }

  /* 键盘可达性：本库删除按钮是真 <button>（Semi 是给 IconClose 挂 onClick），
     故聚焦时也要显示出来，否则 Tab 到一个 display:none 的按钮上无从操作。 */
  :global(.skill-slot-delete:focus-visible) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-top);
    right: var(--cd-spacing-ai-chat-input-rich-text-skill-slot-right);
    transform: translate(50%, -50%);
    border-radius: 50%;
    width: var(--cd-width-ai-chat-input-rich-text-select-slot-delete);
    height: var(--cd-width-ai-chat-input-rich-text-select-slot-delete);
    background: var(--cd-color-ai-chat-input-rich-text-skill-slot-delete-bg);
    color: var(--cd-color-ai-chat-input-rich-text-skill-slot-delete-text);
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }
</style>
