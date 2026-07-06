<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '你好，我是 AI 助手，试试下面的提示词。' }] }],
      status: 'completed',
    },
  ];

  // hints 在会话底部展示提示区；点击某项触发 onHintClick，该内容将成为新的用户输入。
  const hints = ['介绍一下这个组件库', '如何自定义主题？', '支持哪些 AI 组件？'];

  let lastHint = $state('');
</script>

<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {hints} onHintClick={(h) => (lastHint = h)} />
</div>
{#if lastHint}
  <p style="margin-top: 8px; color: var(--cd-color-text-2);">点击了提示：{lastHint}</p>
{/if}
