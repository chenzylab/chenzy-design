<script lang="ts">
  // 对齐 Semi「自定义渲染输入框」：renderInputArea 可包裹默认输入区（defaultNode），
  // 或用 detailProps 拆分节点（清除/上传/输入/发送）自由组合。这里在默认输入区上方加一行提示。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: ChatRoleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'green' },
  };

  let chats = $state<ChatMessage[]>([
    { id: '1', role: 'assistant', content: '试试下面自定义的输入区。', status: 'complete' },
  ]);
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <Chat {chats} {roleConfig} onChatsChange={(n) => (chats = n)}>
    {#snippet renderInputArea({ defaultNode })}
      <div>
        <div style="padding:4px 16px;font-size:12px;color:var(--cd-color-text-2);">
          自定义输入区顶部提示
        </div>
        {#if defaultNode}{@render defaultNode()}{/if}
      </div>
    {/snippet}
  </Chat>
</div>
