<script lang="ts">
  // 对齐 Semi「完全自定义整个会话框」：renderFullChatBox 提供拆分节点（avatar/title/content/action），
  // 自由组合整条消息布局。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  const chats: ChatMessage[] = [
    { id: '1', role: 'assistant', content: '这是一条完全自定义布局的消息。', status: 'complete' },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig}>
    {#snippet renderFullChatBox({ message, role })}
      <div style="border:1px dashed var(--cd-color-primary);border-radius:8px;padding:12px;margin:8px 0;">
        <div style="font-size:12px;color:var(--cd-color-text-2);margin-bottom:4px;">{role?.name}</div>
        <div>{typeof message?.content === 'string' ? message.content : ''}</div>
      </div>
    {/snippet}
  </Chat>
</div>
