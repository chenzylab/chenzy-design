<script lang="ts">
  // 严格对齐 Semi「自定义渲染会话框」renderChatBoxAction 小节：保留 defaultActionsObj
  // 全部默认操作节点（copy/reset/like/dislike/delete），再追加 Dropdown 菜单（分享）。
  import { Chat, Dropdown, Button } from '@chenzy-design/svelte';
  import { IconForward, IconMoreStroked } from '@chenzy-design/icons';
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

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  {onChatsChange}
  {onMessageSend}
  style="height: 400px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
>
  {#snippet renderChatBoxAction({ defaultActionsObj, className })}
    <span class={className}>
      {#if defaultActionsObj}
        {@render defaultActionsObj.copyNode?.()}
        {@render defaultActionsObj.likeNode?.()}
        {@render defaultActionsObj.dislikeNode?.()}
        {@render defaultActionsObj.resetNode?.()}
        {@render defaultActionsObj.deleteNode?.()}
      {/if}
      <Dropdown trigger="click" position="top">
        <Button icon={moreIcon} theme="borderless" type="tertiary" />
        {#snippet render()}
          <Dropdown.Menu>
            <Dropdown.Item icon={forwardIcon}>分享</Dropdown.Item>
          </Dropdown.Menu>
        {/snippet}
      </Dropdown>
    </span>
  {/snippet}
</Chat>

{#snippet moreIcon()}<IconMoreStroked />{/snippet}
{#snippet forwardIcon()}<IconForward />{/snippet}
