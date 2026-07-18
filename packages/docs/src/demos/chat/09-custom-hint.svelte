<script lang="ts">
  // 对齐 Semi「自定义提示信息渲染」：renderHintBox 自定义每个提示项的渲染（content/index/onHintClick）。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'assistant', content: '选择下面的提示，或直接输入。', status: 'complete' },
  ]);

  const hints = ['帮我写一封邮件', '总结这段文字', '翻译成英文'];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} {hints} onChatsChange={(n) => (chats = n)}>
    {#snippet renderHintBox({ content, index, onHintClick })}
      <button
        type="button"
        onclick={onHintClick}
        style="display:flex;align-items:center;gap:8px;width:fit-content;padding:8px 12px;border:1px solid var(--cd-color-primary);border-radius:16px;background:var(--cd-color-primary-light-default);color:var(--cd-color-primary);cursor:pointer;"
      >
        <span style="font-weight:600;">{index + 1}.</span>
        {content}
      </button>
    {/snippet}
  </Chat>
</div>
