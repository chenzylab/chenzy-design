import { describe, it, expect } from 'vitest';
import {
  responseToMessage,
  chatCompletionToMessage,
  streamingResponseToMessage,
  streamingChatCompletionToMessage,
  contentItemType,
  normalizeDialogueContent,
  type OpenAIResponseObject,
  type ChatCompletionObject,
  type OutputMessage,
  type ToolCallContentItem,
  type ResponseStreamChunk,
  type ChatCompletionStreamChunk,
} from './ai-chat-dialogue.js';

describe('ai-chat-dialogue · responseToMessage', () => {
  it('Response Object → assistant Message，output 作为 content', () => {
    const resp: OpenAIResponseObject = {
      id: 'resp_1',
      model: 'gpt-5',
      status: 'completed',
      created_at: 1234,
      output_text: 'hello',
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'hello' }] }],
    };
    const msg = responseToMessage(resp);
    expect(msg.id).toBe('resp_1');
    expect(msg.role).toBe('assistant');
    expect(msg.status).toBe('completed');
    expect(msg.model).toBe('gpt-5');
    expect(msg.output_text).toBe('hello');
    expect(Array.isArray(msg.content)).toBe(true);
  });
});

describe('ai-chat-dialogue · chatCompletionToMessage', () => {
  it('单 choice text → 一条 Message，含 output_text 块', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_1',
      choices: [{ message: { role: 'assistant', content: 'hi there', refusal: '' } }],
    };
    const msgs = chatCompletionToMessage(cc);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]!.id).toBe('cc_1');
    expect(msgs[0]!.status).toBe('completed');
    const content = msgs[0]!.content as OutputMessage[];
    expect(content[0]!.type).toBe('message');
    const inner = content[0]!.content!;
    expect(inner[0]!.type).toBe('output_text');
    expect((inner[0] as { text: string }).text).toBe('hi there');
  });

  it('多 choice（n>1）→ 多条 Message', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_2',
      choices: [
        { message: { role: 'assistant', content: 'a', refusal: '' } },
        { message: { role: 'assistant', content: 'b', refusal: '' } },
      ],
    };
    expect(chatCompletionToMessage(cc)).toHaveLength(2);
  });

  it('annotations 映射到 output_text.annotations', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_3',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'see source',
            refusal: '',
            annotations: [{ type: 'url_citation', url_citation: { url: 'https://x.com', title: 'X' } }],
          },
        },
      ],
    };
    const content = chatCompletionToMessage(cc)[0]!.content as OutputMessage[];
    const outputText = content[0]!.content![0] as { annotations: { url?: string }[] };
    expect(outputText.annotations[0]!.url).toBe('https://x.com');
  });

  it('function_call → function_call 块', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_4',
      choices: [
        {
          message: {
            role: 'assistant',
            content: '',
            refusal: '',
            function_call: { name: 'get_weather', arguments: '{"city":"SF"}' },
          },
        },
      ],
    };
    const content = chatCompletionToMessage(cc)[0]!.content as ToolCallContentItem[];
    const fc = content.find((c) => c.type === 'function_call');
    expect(fc).toBeDefined();
    expect(fc!.name).toBe('get_weather');
    expect(fc!.status).toBe('completed');
  });

  it('tool_calls（function）→ function_call 块', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_5',
      choices: [
        {
          message: {
            role: 'assistant',
            content: '',
            refusal: '',
            tool_calls: [{ type: 'function', function: { name: 'search', arguments: '{}' } }],
          },
        },
      ],
    };
    const content = chatCompletionToMessage(cc)[0]!.content as ToolCallContentItem[];
    expect(content.some((c) => c.type === 'function_call' && c.name === 'search')).toBe(true);
  });

  it('audio → audio 块', () => {
    const cc: ChatCompletionObject = {
      id: 'cc_6',
      choices: [{ message: { role: 'assistant', content: '', refusal: '', audio: { data: 'x' } } }],
    };
    const content = chatCompletionToMessage(cc)[0]!.content as { type?: string }[];
    expect(content.some((c) => c.type === 'audio')).toBe(true);
  });
});

describe('ai-chat-dialogue · helpers', () => {
  it('contentItemType 取 type', () => {
    expect(contentItemType({ type: 'reasoning' })).toBe('reasoning');
    expect(contentItemType({} as never)).toBe('unknown');
  });

  it('normalizeDialogueContent：string → 单 output_text 块', () => {
    const items = normalizeDialogueContent('plain text');
    expect(items).toHaveLength(1);
    const inner = (items[0] as OutputMessage).content![0] as { text: string };
    expect(inner.text).toBe('plain text');
  });

  it('normalizeDialogueContent：数组原样返回、null → []', () => {
    const arr = [{ type: 'reasoning' }];
    expect(normalizeDialogueContent(arr)).toBe(arr);
    expect(normalizeDialogueContent(undefined)).toEqual([]);
  });
});

describe('ai-chat-dialogue · streamingResponseToMessage', () => {
  it('无块 → null', () => {
    expect(streamingResponseToMessage([])).toBeNull();
    expect(streamingResponseToMessage(null)).toBeNull();
  });

  it('快速路径：末块 response.completed 直接返回完整消息', () => {
    const chunks: ResponseStreamChunk[] = [
      {
        type: 'response.completed',
        response: {
          id: 'r1',
          model: 'gpt-5',
          status: 'completed',
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'hi' }] }],
          output_text: 'hi',
          created_at: 123,
        },
      },
    ];
    const res = streamingResponseToMessage(chunks)!;
    expect(res.nextState).toBeNull();
    expect(res.message?.id).toBe('r1');
    expect(res.message?.output_text).toBe('hi');
    expect(res.message?.status).toBe('completed');
  });

  it('顺序 delta 累积 output_text（含 created + item.added）', () => {
    const chunks: ResponseStreamChunk[] = [
      { type: 'response.created', sequence_number: 0, response: { id: 'r2', model: 'm', created_at: 1 } },
      { type: 'response.output_item.added', sequence_number: 1, output_index: 0, item: { type: 'message' } },
      { type: 'response.output_text.delta', sequence_number: 2, output_index: 0, content_index: 0, delta: '你' },
      { type: 'response.output_text.delta', sequence_number: 3, output_index: 0, content_index: 0, delta: '好' },
    ];
    const res = streamingResponseToMessage(chunks)!;
    expect(res.message?.id).toBe('r2');
    // 增量下 output_text 提取顶层 output_text item；message 类型的文本在嵌套 content 里。
    const inner = (res.message?.content as any[])[0].content[0];
    expect(inner.text).toBe('你好');
    expect(res.message?.status).toBe('in_progress');
  });

  it('增量：分两次调用累积（第二次传 nextState）', () => {
    const first = streamingResponseToMessage([
      { type: 'response.output_item.added', sequence_number: 0, output_index: 0, item: { type: 'message' } },
      { type: 'response.output_text.delta', sequence_number: 1, output_index: 0, content_index: 0, delta: 'a' },
    ])!;
    const second = streamingResponseToMessage(
      [{ type: 'response.output_text.delta', sequence_number: 2, output_index: 0, content_index: 0, delta: 'b' }],
      first.nextState,
    )!;
    expect((second.message?.content as any[])[0].content[0].text).toBe('ab');
  });

  it('无序缓冲：块 [0,2] 先到缓冲 2，[1] 补齐后按序处理 0,1,2', () => {
    const s1 = streamingResponseToMessage([
      { type: 'response.output_item.added', sequence_number: 0, output_index: 0, item: { type: 'message' } },
      { type: 'response.output_text.delta', sequence_number: 2, output_index: 0, content_index: 0, delta: 'B' },
    ])!;
    // seq 2 还没处理（等 seq 1）
    expect(s1.message?.output_text).toBe('');
    const s2 = streamingResponseToMessage(
      [{ type: 'response.output_text.delta', sequence_number: 1, output_index: 0, content_index: 0, delta: 'A' }],
      s1.nextState,
    )!;
    expect((s2.message?.content as any[])[0].content[0].text).toBe('AB');
  });

  it('reasoning delta 累积到 summary', () => {
    const res = streamingResponseToMessage([
      { type: 'response.output_item.added', sequence_number: 0, output_index: 0, item: { type: 'reasoning' } },
      { type: 'response.reasoning_summary_text.delta', sequence_number: 1, output_index: 0, summary_index: 0, delta: '思考' },
    ])!;
    const item = (res.message?.content as any[])[0];
    expect(item.summary[0].text).toBe('思考');
  });

  it('function_call_arguments delta 累积 + done 设 name', () => {
    const res = streamingResponseToMessage([
      { type: 'response.output_item.added', sequence_number: 0, output_index: 0, item: { type: 'function_call' } },
      { type: 'response.function_call_arguments.delta', sequence_number: 1, output_index: 0, delta: '{"a":' },
      { type: 'response.function_call_arguments.done', sequence_number: 2, output_index: 0, name: 'fn', arguments: '{"a":1}' },
    ])!;
    const item = (res.message?.content as any[])[0];
    expect(item.name).toBe('fn');
    expect(item.arguments).toBe('{"a":1}');
  });

  it('error 块记录到 message.error', () => {
    const res = streamingResponseToMessage([
      { type: 'response.created', sequence_number: 0, response: { id: 'r' } },
      { type: 'error', sequence_number: 1, code: 'E', message: 'boom' },
    ])!;
    expect(res.message?.error).toEqual({ code: 'E', message: 'boom' });
  });
});

describe('ai-chat-dialogue · streamingChatCompletionToMessage', () => {
  const chunk = (
    id: string,
    delta: Record<string, unknown>,
    finish: string | null = null,
    index = 0,
  ): ChatCompletionStreamChunk => ({
    id,
    choices: [{ index, delta, finish_reason: finish }],
  });

  it('累积 content delta，finish_reason 非 null → completed', () => {
    const res = streamingChatCompletionToMessage([
      chunk('c1', { content: 'Hel' }),
      chunk('c1', { content: 'lo' }, 'stop'),
    ]);
    expect(res.messages).toHaveLength(1);
    const m = res.messages[0]!;
    expect(m.status).toBe('completed');
    const text = (m.content as any[])[0].content[0].text;
    expect(text).toBe('Hello');
  });

  it('增量：第二次调用传 state 只处理新片段', () => {
    const r1 = streamingChatCompletionToMessage([chunk('c2', { content: 'A' })]);
    const r2 = streamingChatCompletionToMessage(
      [chunk('c2', { content: 'A' }), chunk('c2', { content: 'B' }, 'stop')],
      r1.state,
    );
    const text = (r2.messages[0]!.content as any[])[0].content[0].text;
    expect(text).toBe('AB');
  });

  it('tool_calls 累积（function）', () => {
    const res = streamingChatCompletionToMessage([
      chunk('c3', { tool_calls: [{ id: 't1', function: { name: 'foo', arguments: '{"x":' } }] }),
      chunk('c3', { tool_calls: [{ id: 't1', function: { name: '', arguments: '1}' } }] }, 'tool_calls'),
    ]);
    const tool = (res.messages[0]!.content as any[]).find((c) => c.type === 'function_call');
    expect(tool.name).toBe('foo');
    // 对齐 Semi：arguments 累积门控在 function.name 非空的段；后续 name 为空的段不再累积
    // （保真 Semi 行为，即末段 name 空时其 arguments 不拼接），故停在首段的 '{"x":'。
    expect(tool.arguments).toBe('{"x":');
  });

  it('多 choice.index 分组产出多条消息', () => {
    const res = streamingChatCompletionToMessage([
      { id: 'c4', choices: [
        { index: 0, delta: { content: 'a' }, finish_reason: 'stop' },
        { index: 1, delta: { content: 'b' }, finish_reason: 'stop' },
      ] },
    ]);
    expect(res.messages).toHaveLength(2);
  });
});
