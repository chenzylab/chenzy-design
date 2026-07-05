<script lang="ts">
  import { AIChatDialogue, AIChatInput } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    AIChatInputMessageContent,
  } from '@chenzy-design/svelte';

  // 消息编辑端到端：点击 user 消息的编辑按钮 → onMessageEdit 设 message.editing=true →
  // messageEditRender 用 AIChatInput 编辑器替代内容（载入原消息文本）→ 发送保存回消息。
  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  let chats = $state<AIDialogueMessage[]>([
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '介绍一下这个库' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '这是一套 Svelte 5 组件库。' }] }],
      status: 'completed',
    },
  ]);

  function handleEdit(message: AIDialogueMessage): void {
    chats = chats.map((m) => ({ ...m, editing: m.id === message.id }));
  }

  function handleSave(id: string, message: AIChatInputMessageContent): void {
    const text = (message.inputContents ?? []).map((c) => c.text).join('');
    chats = chats.map((m) =>
      m.id === id
        ? {
            ...m,
            editing: false,
            content: [{ type: 'message', content: [{ type: 'input_text', text }] }],
          }
        : m,
    );
  }
</script>

<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} onMessageEdit={handleEdit}>
    {#snippet messageEditRender(payload: AIChatInputMessageContent)}
      {@const editingMsg = chats.find((m) => m.editing)}
      <AIChatInput
        defaultContent={`<p>${(payload.inputContents ?? []).map((c) => c.text).join('')}</p>`}
        placeholder="编辑消息…"
        onMessageSend={(m) => editingMsg && handleSave(editingMsg.id, m)}
      />
    {/snippet}
  </AIChatDialogue>
</div>
