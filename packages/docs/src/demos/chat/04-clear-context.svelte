<script lang="ts">
  // 对齐 Semi「清除上下文」：showClearContext 展示清除按钮，点击在消息流末尾追加分割线。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'user', content: '第一轮对话', status: 'complete' },
    { id: '2', role: 'assistant', content: '好的，已记住上下文。', status: 'complete' },
  ]);
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat
    {chats}
    {roleConfig}
    showClearContext
    onChatsChange={(n) => (chats = n)}
    onClear={() => console.log('上下文已清除')}
  />
</div>
