import { describe, it, expect } from 'vitest';
import {
  responseToMessage,
  chatCompletionToMessage,
  contentItemType,
  normalizeDialogueContent,
  type OpenAIResponseObject,
  type ChatCompletionObject,
  type OutputMessage,
  type ToolCallContentItem,
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
