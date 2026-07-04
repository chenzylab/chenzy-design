<script lang="ts">
  import {
    AIChatDialogue,
    responseToMessage,
    chatCompletionToMessage,
  } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    assistant: { name: '助手', color: '#00b42a' },
  };

  // 用 Adapter 把 OpenAI 返回结构转成可展示的 Message。
  // 1) Response API（非流式）
  const fromResponse = responseToMessage({
    id: 'resp_1',
    model: 'gpt-5',
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: '来自 Response API 的回复。' }] }],
  });

  // 2) Chat Completion API（非流式，返回数组，取第一条）
  const fromChatCompletion = chatCompletionToMessage({
    id: 'cc_1',
    choices: [{ message: { role: 'assistant', content: '来自 Chat Completion API 的回复。', refusal: '' } }],
  })[0];

  const chats: AIDialogueMessage[] = [fromResponse, fromChatCompletion].filter(
    Boolean,
  ) as AIDialogueMessage[];
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
