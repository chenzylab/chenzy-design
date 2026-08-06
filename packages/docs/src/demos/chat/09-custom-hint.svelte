<script lang="ts">
  // 严格对齐 Semi「自定义提示信息渲染」：renderHintBox 自定义每个提示项渲染
  // （content/index/onHintClick），点击后清空 hints、mock 一条回复。
  import { Chat } from '@chenzy-design/svelte';
  import { IconArrowRight } from '@chenzy-design/icons';
  import type { ChatMessage, ChatRoleConfig, ChatRenderHintBoxProps } from '@chenzy-design/svelte';

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
    {
      role: 'assistant',
      id: '1',
      createAt: 1715676751919,
      content: 'Semi Design 是由抖音前端团队和 MED 产品设计团队设计、开发并维护的设计系统，你可以向我提问任何关于 Semi 的问题。',
    },
  ]);

  let hints = $state(['告诉我更多', 'Semi Design 的组件有哪些？', '我能够通过 DSM 定制自己的主题吗？']);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let seq = 0;
  function onMessageSend(): void {
    setTimeout(() => {
      chats = [
        ...chats,
        { role: 'assistant', id: `id-${++seq}`, createAt: Date.now(), content: '这是一条 mock 回复信息' },
      ];
    }, 200);
    hints = [];
  }

  function onHintClick(): void {
    hints = [];
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  function onClear(): void {
    hints = [];
  }
</script>

<Chat
  {hints}
  {onHintClick}
  {chats}
  {roleConfig}
  {uploadProps}
  {onChatsChange}
  {onMessageSend}
  {onClear}
  renderHintBox={hintBoxSnippet}
  style="height: 400px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
/>

{#snippet hintBoxSnippet({ content, onHintClick: handleClick }: ChatRenderHintBoxProps)}
  <button
    type="button"
    onclick={handleClick}
    style="border:1px solid var(--cd-color-border);padding:10px;border-radius:10px;color:var(--cd-color-text-1);display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-size:14px;width:100%;background:transparent;"
  >
    {content}
    <IconArrowRight style="margin-left:10px;" />
  </button>
{/snippet}
