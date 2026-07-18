<script lang="ts">
  // 对齐 Semi「自定义渲染会话框」：用 renderChatBoxAvatar / renderChatBoxTitle / renderChatBoxContent /
  // renderChatBoxAction snippet 分别覆盖头像、标题、内容、操作区。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: 'AI 助手', color: 'green' },
  };

  const chats: ChatMessage[] = [
    { id: '1', role: 'user', content: '自定义渲染会话框', status: 'complete' },
    { id: '2', role: 'assistant', content: '头像、标题、内容、操作区都可以自定义。', status: 'complete' },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig}>
    {#snippet renderChatBoxAvatar({ role })}
      <div
        style="width:24px;height:24px;border-radius:6px;background:var(--cd-color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;"
      >
        {(role?.name ?? '?').slice(0, 1)}
      </div>
    {/snippet}
    {#snippet renderChatBoxTitle({ role })}
      <div style="font-weight:600;color:var(--cd-color-primary);">{role?.name}</div>
    {/snippet}
    {#snippet renderChatBoxContent({ message })}
      <div style="padding:8px 12px;background:var(--cd-color-fill-1);border-radius:8px;">
        {typeof message?.content === 'string' ? message.content : ''}
      </div>
    {/snippet}
  </Chat>
</div>
