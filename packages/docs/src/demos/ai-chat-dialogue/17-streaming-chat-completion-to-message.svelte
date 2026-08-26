<script lang="ts">
  import { onDestroy } from 'svelte';
  import { AIChatDialogue, streamingChatCompletionToMessage } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ChatCompletionStreamChunk,
    StreamingChatCompletionState,
  } from '@chenzy-design/svelte';

  // 严格对齐 Semi 官方「消息数据转换」demo（content/ai/aiChatDialogue/index.md:1230+）：
  // Chat Completion API 流式返回，index 0 是文本增量，index 1 是工具调用增量，
  // 每 100ms 送入一个「从头累积的完整切片」（streamingChatCompletionToMessage 的
  // state 靠 processedCountByIndex 记录已处理数量，必须传完整切片而非单个新增块）。
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

  const STREAMING_CHAT_COMPLETION_DATA = [
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { role: 'assistant', content: '', refusal: null }, finish_reason: null }],
      obfuscation: 'ahPqlzj6DD',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { content: '' }, finish_reason: null }],
      obfuscation: 'i2PXRIwvc3D',
    },
    // index 0: 输出文本增量
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { content: '我正在使用 ' }, finish_reason: null }],
      obfuscation: '3sslO5QylW',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { content: 'streamingChatCompletionToMessage' }, finish_reason: null }],
      obfuscation: '3sslO5QylW',
    },
    // index 1: 工具调用增量（function_call / tool_calls）
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011845,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [
        {
          index: 1,
          delta: { tool_calls: [{ id: 'call_1', function: { name: 'searchWeather', arguments: '{"city":"北京"' } }] },
          finish_reason: null,
        },
      ],
      obfuscation: 'T1',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011846,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [
        {
          index: 1,
          delta: { tool_calls: [{ id: 'call_1', function: { name: null, arguments: ',"day":"today"}' } }] },
          finish_reason: null,
        },
      ],
      obfuscation: 'T2',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011844,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { content: ' 转换 Chat Completion Chunks' }, finish_reason: null }],
      obfuscation: 'X1',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011844,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: { content: ' 🥳' }, finish_reason: null }],
      obfuscation: 'X2',
    },
    // 终止信号
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      obfuscation: 'n13SLf',
    },
    {
      id: 'chatcmpl-COjljxurV5GKrRUsg1wd7mIyQCiiT',
      object: 'chat.completion.chunk',
      created: 1760011843,
      model: 'o3-mini-2025-01-31',
      service_tier: 'default',
      system_fingerprint: 'fp_6c43dcef8c',
      choices: [{ index: 1, delta: {}, finish_reason: 'stop' }],
      obfuscation: 'jt9rDb',
    },
  ] as unknown as ChatCompletionStreamChunk[];

  let chats = $state<AIDialogueMessage[]>([]);
  let streamState: StreamingChatCompletionState | undefined;
  let i = 1;

  const timer = setInterval(() => {
    if (i > STREAMING_CHAT_COMPLETION_DATA.length) {
      clearInterval(timer);
      return;
    }
    const slice = STREAMING_CHAT_COMPLETION_DATA.slice(0, i);
    const { messages: partialMessages, state: nextState } = streamingChatCompletionToMessage(slice, streamState);
    streamState = nextState;
    // 对齐官方 `[...messages, partialMessages[0]]`：按 id 更新已存在的消息，
    // 否则追加（官方 React 版本直接拼接会重复追加同 id 消息，这里对齐
    // AIChatDialogue 内部 findIndex-by-id 的更新语义，效果一致且不会重复渲染气泡）。
    const msg = partialMessages[0];
    if (msg) {
      const idx = chats.findIndex((c) => c.id === msg.id);
      chats = idx >= 0 ? [...chats.slice(0, idx), msg, ...chats.slice(idx + 1)] : [...chats, msg];
    }
    i += 1;
  }, 100);

  onDestroy(() => clearInterval(timer));

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }
</script>

<div style="height: 220px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue align="leftRight" mode="bubble" {chats} {roleConfig} {onChatsChange} />
</div>
