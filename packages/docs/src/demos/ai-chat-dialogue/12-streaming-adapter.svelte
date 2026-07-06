<script lang="ts">
  import { onDestroy } from 'svelte';
  import { AIChatDialogue, streamingResponseToMessage } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ResponseStreamChunk,
    StreamingResponseState,
  } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // 模拟 Response API 流式返回的 chunk 序列（对齐 OpenAI 流式事件类型）。
  const full = '这是通过 streamingResponseToMessage 逐块累积渲染的流式回复。';
  const pieces = full.match(/.{1,4}/gu) ?? [];
  const stream: ResponseStreamChunk[] = [
    { type: 'response.created', sequence_number: 0, response: { id: 'r1', model: 'gpt-5' } },
    {
      type: 'response.output_item.added',
      sequence_number: 1,
      output_index: 0,
      item: { type: 'message', role: 'assistant', content: [] },
    },
    ...pieces.map((delta, i) => ({
      type: 'response.output_text.delta',
      sequence_number: 2 + i,
      output_index: 0,
      content_index: 0,
      delta,
    })),
  ];

  const baseUser: AIDialogueMessage = {
    id: 'u1',
    role: 'user',
    content: [{ type: 'message', content: [{ type: 'input_text', text: '演示一下流式输出' }] }],
    status: 'completed',
  };

  let chats = $state<AIDialogueMessage[]>([baseUser]);
  let streamState: StreamingResponseState | null = null;
  let idx = 0;

  // 每 120ms 送入一个 chunk，增量归约后更新最后一条 assistant 消息。
  const timer = setInterval(() => {
    if (idx >= stream.length) {
      clearInterval(timer);
      return;
    }
    const result = streamingResponseToMessage([stream[idx]], streamState);
    idx += 1;
    if (!result) return;
    streamState = result.nextState;
    const msg = result.message;
    if (!msg) return;
    const streamed: AIDialogueMessage = { ...msg, status: msg.status ?? 'in_progress' };
    chats = [baseUser, streamed];
  }, 120);

  onDestroy(() => clearInterval(timer));
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
