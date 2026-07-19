<script lang="ts">
  // 对齐 Semi「动态更新数据」：发送后先插入 loading 消息，模拟异步回复后原地更新为完整内容。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'assistant', content: '你好，有什么可以帮你的吗？', status: 'complete' },
  ]);

  let seq = 1;

  function handleSend(content: string) {
    chats.push({ id: `u-${++seq}`, role: 'user', content, status: 'complete' });
    const replyId = `a-${++seq}`;
    chats.push({ id: replyId, role: 'assistant', content: '', status: 'loading' });
    // 模拟异步：原地把 loading 消息更新为完整回复。
    setTimeout(() => {
      const idx = chats.findIndex((m) => m.id === replyId);
      if (idx >= 0) {
        chats[idx] = { id: replyId, role: 'assistant', content: `收到：${content}`, status: 'complete' };
      }
    }, 1200);
  }
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} onChatsChange={(n) => (chats = n)} onMessageSend={handleSend} />
</div>
