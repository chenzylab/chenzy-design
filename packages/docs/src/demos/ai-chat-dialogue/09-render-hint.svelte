<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    assistant: { name: '助手', color: '#00b42a' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '选一个方向开始吧。' }] }],
      status: 'completed',
    },
  ];

  const hints = ['写一首诗', '解释一段代码', '翻译成英文'];
  let lastHint = $state('');
</script>

<!-- renderHintBox 自定义提示项渲染：参数为 { content, index, onHintClick }。 -->
<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {hints} onHintClick={(h) => (lastHint = h)}>
    {#snippet renderHintBox({ content, index, onHintClick })}
      <button
        type="button"
        onclick={onHintClick}
        style="display:flex; align-items:center; gap:6px; padding:6px 12px; margin:4px;
               border:1px solid var(--cd-color-primary); border-radius:16px;
               background:var(--cd-color-primary-light-default); color:var(--cd-color-primary); cursor:pointer;"
      >
        <span style="font-weight:600;">{index + 1}</span>
        <span>{content}</span>
      </button>
    {/snippet}
  </AIChatDialogue>
</div>
{#if lastHint}
  <p style="margin-top: 8px; color: var(--cd-color-text-2);">点击了提示：{lastHint}</p>
{/if}
