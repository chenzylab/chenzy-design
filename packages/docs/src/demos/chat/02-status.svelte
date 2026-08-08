<script lang="ts">
  // 严格对齐 Semi 消息状态 demo：status 决定会话样式（loading 三点动画/error 红底白字）；
  // roleConfig 三角色真实头像图；可交互（onMessageSend mock 回复 + uploadProps）。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: {
      name: 'User',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: 'Assistant',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
    system: {
      name: 'System',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  let chats = $state<ChatMessage[]>([
    { role: 'assistant', id: '1', createAt: 1715676751919, content: '请求成功' },
    { id: 'loading', role: 'assistant', status: 'loading' },
    { role: 'assistant', id: 'error', content: '请求错误', status: 'error' },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let seq = 0;
  function onMessageSend(): void {
    setTimeout(() => {
      chats.push({
        role: 'assistant',
        id: `mock-${++seq}`,
        createAt: Date.now(),
        content: '这是一条 mock 回复信息',
      });
    }, 200);
  }
</script>

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  onChatsChange={(n) => (chats = n)}
  {onMessageSend}
  style="height: 400px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
/>
