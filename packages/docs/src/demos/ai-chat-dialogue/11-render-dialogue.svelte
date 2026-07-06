<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    DialogueRenderConfig,
    RenderTitleProps,
  } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    system: { name: 'System', color: '#8c8c8c' },
    user: { name: 'User', color: '#4080ff' },
    assistant: { name: 'Assistant', color: '#00b42a' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: '1',
      role: 'system',
      content: [{ type: 'message', content: [{ type: 'output_text', text: "Hello, I'm your AI assistant." }] }],
      status: 'completed',
    },
    {
      id: '2',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '给一个 Button 组件的使用示例' }] }],
      status: 'completed',
    },
    {
      id: '3',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '以下是一个 Button 的使用示例。' }] }],
      status: 'completed',
    },
  ];

  // dialogueRenderConfig 自定义各区块：这里改写标题（加前缀），并复用默认内容/操作节点。
  const dialogueRenderConfig: DialogueRenderConfig = {
    renderDialogueTitle: titleSlot,
  };
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {dialogueRenderConfig} />
</div>

{#snippet titleSlot({ role }: RenderTitleProps)}
  <div style="font-weight:700; color:var(--cd-color-primary);">My-{role?.name ?? ''}</div>
{/snippet}
