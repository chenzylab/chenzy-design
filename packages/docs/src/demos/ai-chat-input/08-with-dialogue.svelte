<script lang="ts">
  import {
    AIChatInput,
    AIChatDialogue,
    messageToChatInput,
  } from '@chenzy-design/svelte';
  import type {
    AIChatInputMessageContent,
    AIDialogueMessage,
    AIDialogueRoleConfig,
  } from '@chenzy-design/svelte';

  // 端到端桥接：AIChatInput 的 onMessageSend 载荷经 messageToChatInput Adapter
  // 转成 AIDialogueMessage（user 角色），push 进 AIChatDialogue 的 chats 展示。
  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  let chats = $state<AIDialogueMessage[]>([]);
  let seq = 0;

  function handleSend(message: AIChatInputMessageContent): void {
    const userMsg = messageToChatInput(message, { id: `u-${seq++}` });
    userMsg.status = 'completed';
    chats = [...chats, userMsg];
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 640px;">
  <div style="height: 280px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
    <AIChatDialogue {chats} {roleConfig} />
  </div>
  <AIChatInput placeholder="输入并发送，消息进入上方对话…" onMessageSend={handleSend} />
</div>
