<script lang="ts">
  // 对齐 Semi「自定义渲染会话框」renderChatBoxAction 小节：鼠标移动到会话上显示操作区，
  // 通过 defaultActionsObj 保留默认操作按钮，再追加一个 Dropdown 菜单（分享）。
  import { Chat, Dropdown, Button } from '@chenzy-design/svelte';
  import { IconForward, IconMoreStroked } from '@chenzy-design/icons';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'system', content: "Hello, I'm your AI assistant.", status: 'complete' },
    { id: '2', role: 'user', content: '介绍一下 semi design', status: 'complete' },
    {
      id: '3',
      role: 'assistant',
      content: 'Semi Design 是由抖音前端团队和 MED 产品设计团队设计、开发并维护的设计系统',
      status: 'complete',
    },
  ]);

  let idCounter = 0;
  function getId(): string {
    return `id-${idCounter++}`;
  }

  function onMessageSend(): void {
    const newAssistantMessage: ChatMessage = {
      id: getId(),
      role: 'assistant',
      content: 'This is a mock response',
      status: 'complete',
    };
    setTimeout(() => {
      chats = [...chats, newAssistantMessage];
    }, 200);
  }
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} onChatsChange={(n) => (chats = n)} {onMessageSend}>
    {#snippet renderChatBoxAction({ defaultActionsObj, className })}
      <span class={className} style="visibility:visible;">
        {#if defaultActionsObj}
          {@render defaultActionsObj.copy?.()}
          {@render defaultActionsObj.like?.()}
          {@render defaultActionsObj.dislike?.()}
          {@render defaultActionsObj.delete?.()}
        {/if}
        <Dropdown trigger="click" position="top">
          <Button icon={moreIcon} theme="borderless" type="tertiary" size="small" />
          {#snippet render()}
            <Dropdown.Menu>
              <Dropdown.Item icon={forwardIcon}>分享</Dropdown.Item>
            </Dropdown.Menu>
          {/snippet}
        </Dropdown>
      </span>
    {/snippet}
  </Chat>
</div>

{#snippet moreIcon()}<IconMoreStroked />{/snippet}
{#snippet forwardIcon()}<IconForward />{/snippet}
