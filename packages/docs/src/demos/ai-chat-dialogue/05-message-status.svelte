<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // message.status 对应三种官方样式：成功(completed) / 请求中(in_progress·queued) / 失败(failed·cancelled)。
  const chats: AIDialogueMessage[] = [
    {
      id: 'q1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '帮我写一段排序算法' }] }],
      status: 'completed',
    },
    {
      id: 'a-ok',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '这是一段快速排序实现，已完成。' }] }],
      status: 'completed',
    },
    {
      id: 'a-loading',
      role: 'assistant',
      content: [],
      status: 'in_progress',
    },
    {
      id: 'a-fail',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '（这条消息生成失败）' }] }],
      status: 'failed',
    },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
