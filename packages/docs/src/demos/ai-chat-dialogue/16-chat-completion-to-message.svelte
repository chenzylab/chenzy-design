<script lang="ts">
  import { AIChatDialogue, chatCompletionToMessage } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig, ChatCompletionObject } from '@chenzy-design/svelte';

  // 严格对齐 Semi 官方「消息数据转换」demo（content/ai/aiChatDialogue/index.md:1151+）：
  // Chat Completion API 非流式返回，`n` 可 >1 故 chatCompletionToMessage 返回数组。
  const roleConfig: AIDialogueRoleConfig = {
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

  const CHAT_COMPLETION_DATA: ChatCompletionObject = {
    id: 'chatcmpl-B9MBs8CjcvOU2jLn4n570S5qMJKcT',
    object: 'chat.completion',
    created: 1741569952,
    model: 'gpt-4.1-2025-04-14',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! How can I assist you today?',
          refusal: '',
          annotations: [],
          tool_calls: [
            {
              id: 'call_abc123',
              type: 'function',
              function: {
                name: 'get_current_weather',
                arguments: '{\n"location": "Boston, MA"\n}',
              },
            },
          ],
        },
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  };

  let chats = $state<AIDialogueMessage[]>(chatCompletionToMessage(CHAT_COMPLETION_DATA));

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue align="leftRight" mode="bubble" {chats} {roleConfig} {onChatsChange} />
</div>
