<script lang="ts">
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
    // 模拟助手回复
    chats.push({
      id: `a-${++seq}`,
      role: 'assistant',
      content: `收到：${content}`,
      status: 'complete',
    });
  }
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} onMessageSend={handleSend} placeholder="输入消息…" />
</div>
