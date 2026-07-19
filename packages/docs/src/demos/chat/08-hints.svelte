<script lang="ts">
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'assistant', content: '试试下面的快捷提问：', status: 'complete' },
  ]);

  const hints = ['介绍一下组件库', '如何自定义主题？', '支持哪些富媒体组件？'];

  let seq = 1;

  function handleSend(content: string) {
    chats.push({ id: `u-${++seq}`, role: 'user', content, status: 'complete' });
    chats.push({ id: `a-${++seq}`, role: 'assistant', content: `你问的是：${content}`, status: 'complete' });
  }
</script>

<div style="height: 440px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} {hints} onMessageSend={handleSend} onHintClick={handleSend} />
</div>
