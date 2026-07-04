<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '介绍一下这个组件库' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: '这是一套对标 **Semi Design** 的 Svelte 5 组件库，包含富媒体、AI 会话等组件。',
            },
          ],
        },
      ],
      status: 'completed',
    },
  ];
</script>

<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
