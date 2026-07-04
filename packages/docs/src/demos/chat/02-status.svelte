<script lang="ts">
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  const chats: ChatMessage[] = [
    { id: '1', role: 'user', content: '帮我总结一下这份文档', status: 'complete' },
    { id: '2', role: 'assistant', content: '正在生成…', status: 'loading' },
    { id: '3', role: 'assistant', content: '这是部分内容', status: 'incomplete' },
    { id: '4', role: 'assistant', content: '生成失败，请重试', status: 'error' },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} />
</div>
