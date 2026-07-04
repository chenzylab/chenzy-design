<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // 展示多种 ContentItem 块：思考(reasoning)、正文(output_text)、工具调用(function_call)。
  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '旧金山今天天气如何？' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [
        { type: 'reasoning', summary: [{ text: '用户询问天气，需要调用天气工具查询。' }] },
        { type: 'function_call', name: 'get_weather', arguments: '{"city":"San Francisco"}' },
        {
          type: 'message',
          content: [{ type: 'output_text', text: '旧金山今天晴，18°C。' }],
        },
      ],
      status: 'completed',
    },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
