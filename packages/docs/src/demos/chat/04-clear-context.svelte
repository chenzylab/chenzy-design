<script lang="ts">
  // 严格对齐 Semi「清除上下文」：showClearContext 展示清除按钮；onMessageSend mock 回复；
  // onMessageReset 把最后一条消息重置为 mock 内容。
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
    { role: 'system', id: '1', createAt: 1715676751919, content: "Hello, I'm your AI assistant." },
    { role: 'user', id: '2', createAt: 1715676751919, content: '介绍一下 Semi Design' },
    {
      role: 'assistant',
      id: '3',
      createAt: 1715676751919,
      content: 'Semi Design 是由抖音前端团队和 MED 产品设计团队设计、开发并维护的设计系统',
    },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };
  const uploadTipProps = { content: '自定义上传按钮提示信息' };

  let seq = 0;
  function getId(): string {
    return `id-${++seq}`;
  }

  function onMessageSend(): void {
    setTimeout(() => {
      chats = [
        ...chats,
        { role: 'assistant', id: getId(), createAt: Date.now(), content: '这是一条 mock 回复信息' },
      ];
    }, 200);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  function onMessageReset(): void {
    setTimeout(() => {
      const lastMessage = chats[chats.length - 1];
      if (!lastMessage) return;
      chats = [
        ...chats.slice(0, -1),
        { ...lastMessage, status: 'complete', content: 'This is a mock reset message.' },
      ];
    }, 200);
  }
</script>

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  {uploadTipProps}
  showClearContext
  {onChatsChange}
  {onMessageSend}
  {onMessageReset}
  style="height: 550px; border: 1px solid var(--cd-color-border); border-radius: 16px; margin: 8px 16px;"
/>
