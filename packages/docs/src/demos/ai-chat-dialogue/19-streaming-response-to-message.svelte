<script lang="ts">
  import { onDestroy } from 'svelte';
  import { AIChatDialogue, streamingResponseToMessage } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ResponseStreamChunk,
    StreamingResponseState,
  } from '@chenzy-design/svelte';

  // 严格对齐 Semi 官方「消息数据转换」demo（content/ai/aiChatDialogue/index.md:1449+）：
  // 用固定的乱序索引序列模拟块 5 被跳过、块 6 重复到达、块 5 延迟到达等真实网络场景，
  // 验证 streamingResponseToMessage 的无序容错（按 sequence_number 缓冲/去重）。
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

  const FIXED_SHUFFLED_INDICES = [
    0, // sequence_number: 0
    1, // sequence_number: 1
    2, // sequence_number: 2
    3, // sequence_number: 3
    4, // sequence_number: 4
    6, // sequence_number: 6（块5被跳过）
    6, // sequence_number: 6（块6重复到达）
    7, // sequence_number: 7
    5, // sequence_number: 5（块5延迟到达）
    8, // sequence_number: 8
    9, // sequence_number: 9
    10, // sequence_number: 10
    11, // sequence_number: 11
    12, // sequence_number: 12
    13, // sequence_number: 13
    14, // sequence_number: 14
    15, // sequence_number: 15
    16, // sequence_number: 16
  ];

  const REASONING_CHUNKS: ResponseStreamChunk[] = [
    {
      type: 'response.created',
      sequence_number: 0,
      response: {
        id: 'resp_reason_001',
        object: 'response',
        created_at: 1760091777,
        status: 'in_progress',
        background: false,
        error: null,
        incomplete_details: null,
        instructions: null,
        max_output_tokens: null,
        max_tool_calls: null,
        model: 'o3-mini-2025-01-31',
        output: [],
        parallel_tool_calls: true,
        previous_response_id: null,
        prompt_cache_key: null,
        reasoning: { effort: 'medium', summary: null },
        safety_identifier: null,
        service_tier: 'auto',
        store: true,
        temperature: 1.0,
        text: { format: { type: 'text' }, verbosity: 'medium' },
        tool_choice: 'auto',
        tools: [],
        top_logprobs: 0,
        top_p: 1.0,
        truncation: 'disabled',
        usage: null,
        user: null,
        metadata: {},
      },
    },
    {
      type: 'response.in_progress',
      sequence_number: 1,
      response: {
        id: 'resp_reason_001',
        object: 'response',
        created_at: 1760091777,
        status: 'in_progress',
        background: false,
        error: null,
        incomplete_details: null,
        instructions: null,
        max_output_tokens: null,
        max_tool_calls: null,
        model: 'o3-mini-2025-01-31',
        output: [],
        parallel_tool_calls: true,
        previous_response_id: null,
        prompt_cache_key: null,
        reasoning: { effort: 'medium', summary: null },
        safety_identifier: null,
        service_tier: 'auto',
        store: true,
        temperature: 1.0,
        text: { format: { type: 'text' }, verbosity: 'medium' },
        tool_choice: 'auto',
        tools: [],
        top_logprobs: 0,
        top_p: 1.0,
        truncation: 'disabled',
        usage: null,
        user: null,
        metadata: {},
      },
    },
    // reasoning item（输出索引 0）
    {
      type: 'response.output_item.added',
      sequence_number: 2,
      output_index: 0,
      item: { id: 'rs_reason_001', type: 'reasoning', summary: [] },
    },
    {
      type: 'response.reasoning_summary_part.added',
      sequence_number: 3,
      output_index: 0,
      summary_index: 0,
      part: { type: 'reasoning', text: '' },
    },
    {
      type: 'response.reasoning_summary_text.delta',
      sequence_number: 4,
      output_index: 0,
      summary_index: 0,
      delta: '思',
    },
    {
      type: 'response.reasoning_summary_text.delta',
      sequence_number: 5,
      output_index: 0,
      summary_index: 0,
      delta: '考',
    },
    {
      type: 'response.reasoning_summary_text.delta',
      sequence_number: 6,
      output_index: 0,
      summary_index: 0,
      delta: '完',
    },
    {
      type: 'response.reasoning_summary_text.delta',
      sequence_number: 7,
      output_index: 0,
      summary_index: 0,
      delta: '成',
    },
    {
      type: 'response.reasoning_summary_text.delta',
      sequence_number: 8,
      output_index: 0,
      summary_index: 0,
      delta: '！',
    },
    {
      type: 'response.reasoning_summary_text.done',
      sequence_number: 9,
      output_index: 0,
      summary_index: 0,
      text: '思考完成！',
    },
    {
      type: 'response.output_item.done',
      sequence_number: 10,
      output_index: 0,
      item: { id: 'rs_reason_001', type: 'reasoning', summary: [{ type: 'reasoning', text: '思考完成！' }] },
    },
    // assistant message（输出索引 1）
    {
      type: 'response.output_item.added',
      sequence_number: 11,
      output_index: 1,
      item: { id: 'msg_reason_001', type: 'message', status: 'in_progress', content: [], role: 'assistant' },
    },
    {
      type: 'response.content_part.added',
      sequence_number: 12,
      item_id: 'msg_reason_001',
      output_index: 1,
      content_index: 0,
      part: { type: 'output_text', annotations: [], text: '' },
    },
    {
      type: 'response.output_text.delta',
      sequence_number: 13,
      item_id: 'msg_reason_001',
      output_index: 1,
      content_index: 0,
      delta: '基于上述思考，',
    },
    {
      type: 'response.output_text.delta',
      sequence_number: 14,
      item_id: 'msg_reason_001',
      output_index: 1,
      content_index: 0,
      delta: '结论如下：',
    },
    {
      type: 'response.output_text.done',
      sequence_number: 15,
      item_id: 'msg_reason_001',
      output_index: 1,
      content_index: 0,
      text: '基于上述思考，结论如下：...',
    },
    {
      type: 'response.completed',
      sequence_number: 16,
      response: {
        id: 'resp_reason_001',
        object: 'response',
        created_at: 1760091777,
        status: 'completed',
        background: false,
        error: null,
        incomplete_details: null,
        instructions: null,
        max_output_tokens: null,
        max_tool_calls: null,
        model: 'o3-mini-2025-01-31',
        output: [
          { id: 'rs_reason_001', type: 'reasoning', summary: [{ type: 'reasoning', text: '思考完成！' }] },
          {
            id: 'msg_reason_001',
            type: 'message',
            status: 'completed',
            content: [{ type: 'output_text', annotations: [], text: '基于上述思考，结论如下：...' }],
            role: 'assistant',
          },
        ],
        parallel_tool_calls: true,
        previous_response_id: null,
        prompt_cache_key: null,
        reasoning: { effort: 'medium', summary: null },
        safety_identifier: null,
        service_tier: 'default',
        store: true,
        temperature: 1.0,
        text: { format: { type: 'text' }, verbosity: 'medium' },
        tool_choice: 'auto',
        tools: [],
        top_logprobs: 0,
        top_p: 1.0,
        truncation: 'disabled',
        usage: {
          input_tokens: 12,
          input_tokens_details: { cached_tokens: 0 },
          output_tokens: 120,
          output_tokens_details: { reasoning_tokens: 16 },
          total_tokens: 132,
        },
        user: null,
        metadata: {},
      },
    },
  ] as unknown as ResponseStreamChunk[];

  let chats = $state<AIDialogueMessage[]>([]);
  let currentState: StreamingResponseState | null = null;
  let currentLength = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function tick(): void {
    if (currentLength > FIXED_SHUFFLED_INDICES.length) return;
    timer = setTimeout(() => {
      if (currentLength === 0) {
        currentLength = 1;
        tick();
        return;
      }
      const currentIndices = FIXED_SHUFFLED_INDICES.slice(0, currentLength);
      const currentChunks = currentIndices.map((index) => REASONING_CHUNKS[index]).filter((c) => c !== undefined);
      const result = streamingResponseToMessage(currentChunks, currentState);
      if (result) {
        const { message: responseMessage, nextState } = result;
        if (responseMessage) {
          chats = [responseMessage];
          currentState = nextState;
        }
      }
      currentLength += 1;
      tick();
    }, 200);
  }
  tick();

  onDestroy(() => clearTimeout(timer));

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue align="leftRight" mode="bubble" {chats} {roleConfig} {onChatsChange} />
</div>
