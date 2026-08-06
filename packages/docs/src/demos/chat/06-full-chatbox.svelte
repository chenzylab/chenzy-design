<script lang="ts">
  // 严格对齐 Semi「完全自定义会话框」：renderFullChatBox 拿到 defaultNodes（avatar/title/content/action），
  // user 消息右对齐、assistant 消息头像与标题同行显示。
  import { Chat, Avatar } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig, ChatRenderFullChatBoxProps } from '@chenzy-design/svelte';

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

  let seq = 0;
  function onMessageSend(): void {
    setTimeout(() => {
      chats = [...chats, { role: 'assistant', id: `id-${++seq}`, content: 'This is a mock response' }];
    }, 200);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }
</script>

<div style="height: 400px; border: 1px solid var(--cd-color-border); border-radius: 16px;">
  <Chat {chats} {roleConfig} {uploadProps} {onChatsChange} {onMessageSend} renderFullChatBox={fullChatBoxSnippet} />
</div>

{#snippet fullChatBoxSnippet({ message, role, defaultNodes, className }: ChatRenderFullChatBoxProps)}
  {@const isUser = message?.role === 'user'}
  <div class={className}>
    <div
      style="display:flex;flex-direction:column;row-gap:4px;align-items:{isUser ? 'flex-end' : 'flex-start'};"
    >
      {#if !isUser}
        <span style="display:flex;align-items:center;justify-content:center;column-gap:10px;padding:5px 0;width:fit-content;">
          <Avatar size="extra-small" shape="square" src={typeof role?.avatar === 'string' ? role.avatar : ''} />
          {@render defaultNodes?.title?.()}
        </span>
      {/if}
      <div style="width:fit-content;">
        {@render defaultNodes?.content?.()}
      </div>
      {@render defaultNodes?.action?.()}
    </div>
  </div>
{/snippet}
