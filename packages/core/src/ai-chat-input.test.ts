import { describe, it, expect } from 'vitest';
import {
  isSendHotKey,
  resolveCanSend,
  buildMessageContent,
  transformDocToContents,
  suggestionContent,
  nextSuggestionIndex,
  referenceLabel,
  isImageReference,
  skillLabel,
  getSkillSlotHTML,
  shouldOpenSkillPanel,
  setConfigureField,
  removeConfigureField,
  messageToChatInput,
  chatInputToChatCompletion,
  type AIChatInputContent,
} from './ai-chat-input.js';

describe('ai-chat-input · isSendHotKey', () => {
  it("sendHotKey='enter'：裸 Enter 发送、Shift+Enter 换行", () => {
    expect(isSendHotKey('Enter', false, 'enter')).toBe(true);
    expect(isSendHotKey('Enter', true, 'enter')).toBe(false);
  });
  it("sendHotKey='shift+enter'：Shift+Enter 发送、裸 Enter 换行", () => {
    expect(isSendHotKey('Enter', true, 'shift+enter')).toBe(true);
    expect(isSendHotKey('Enter', false, 'shift+enter')).toBe(false);
  });
  it('非 Enter 键永不发送', () => {
    expect(isSendHotKey('a', false, 'enter')).toBe(false);
    expect(isSendHotKey('ArrowDown', true, 'shift+enter')).toBe(false);
  });
});

describe('ai-chat-input · resolveCanSend', () => {
  it('显式 canSend 优先（受控）', () => {
    expect(resolveCanSend({ canSend: true, isEmpty: true })).toBe(true);
    expect(resolveCanSend({ canSend: false, isEmpty: false, attachments: [{ uid: '1' }] })).toBe(
      false,
    );
  });
  it('非受控：富文本非空即可发送', () => {
    expect(resolveCanSend({ isEmpty: false })).toBe(true);
  });
  it('非受控：空文本但有附件即可发送', () => {
    expect(resolveCanSend({ isEmpty: true, attachments: [{ uid: '1' }] })).toBe(true);
  });
  it('非受控：空文本且无附件不可发送', () => {
    expect(resolveCanSend({ isEmpty: true, attachments: [] })).toBe(false);
    expect(resolveCanSend({ isEmpty: true })).toBe(false);
  });
});

describe('ai-chat-input · buildMessageContent', () => {
  it('省略空字段，只带非空内容', () => {
    const msg = buildMessageContent({ inputContents: [{ type: 'text', text: 'hi' }] });
    expect(msg).toEqual({ inputContents: [{ type: 'text', text: 'hi' }] });
    expect(msg.attachments).toBeUndefined();
    expect(msg.references).toBeUndefined();
    expect(msg.setup).toBeUndefined();
  });
  it('全字段均带上', () => {
    const msg = buildMessageContent({
      inputContents: [{ type: 'text', text: 'hi' }],
      attachments: [{ uid: '1', name: 'a.png' }],
      references: [{ type: 'file', id: 'r1' }],
      setup: { model: 'gpt-5' },
    });
    expect(msg.inputContents).toHaveLength(1);
    expect(msg.attachments).toHaveLength(1);
    expect(msg.references).toHaveLength(1);
    expect(msg.setup).toEqual({ model: 'gpt-5' });
  });
  it('空数组与空对象视作无内容而省略', () => {
    expect(buildMessageContent({ inputContents: [], attachments: [], setup: {} })).toEqual({});
  });
});

describe('ai-chat-input · transformDocToContents', () => {
  it('段落文本 → text content，空段丢弃', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '你好' }] },
        { type: 'paragraph' }, // 空段
        { type: 'paragraph', content: [{ type: 'text', text: 'world' }] },
      ],
    };
    expect(transformDocToContents(doc)).toEqual([
      { type: 'text', text: '你好' },
      { type: 'text', text: 'world' },
    ]);
  });
  it('hardBreak → 换行；嵌套 marks 文本连接', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }],
        },
      ],
    };
    expect(transformDocToContents(doc)).toEqual([{ type: 'text', text: 'a\nb' }]);
  });
  it('transformer 覆盖特定节点转换', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'inputSlot', attrs: { value: 'x' } }],
    };
    const transformer = new Map<string, (n: unknown) => AIChatInputContent>([
      ['inputSlot', (n) => ({ type: 'slot', raw: n })],
    ]);
    expect(transformDocToContents(doc, transformer)).toEqual([
      { type: 'slot', raw: { type: 'inputSlot', attrs: { value: 'x' } } },
    ]);
  });
  it('非法/空 JSON → 空数组', () => {
    expect(transformDocToContents(undefined)).toEqual([]);
    expect(transformDocToContents({})).toEqual([]);
    expect(transformDocToContents({ content: null })).toEqual([]);
  });
});

describe('ai-chat-input · suggestionContent', () => {
  it('string 直接返回', () => {
    expect(suggestionContent('帮我写代码')).toBe('帮我写代码');
  });
  it('对象取 content', () => {
    expect(suggestionContent({ content: '翻译', lang: 'en' })).toBe('翻译');
  });
});

describe('ai-chat-input · nextSuggestionIndex', () => {
  it('len<=0 返回 -1', () => {
    expect(nextSuggestionIndex(0, 0, 1)).toBe(-1);
    expect(nextSuggestionIndex(2, -1, -1)).toBe(-1);
  });
  it('未选中（current<0）：向下从 0、向上从末项', () => {
    expect(nextSuggestionIndex(-1, 3, 1)).toBe(0);
    expect(nextSuggestionIndex(-1, 3, -1)).toBe(2);
  });
  it('向下环绕', () => {
    expect(nextSuggestionIndex(0, 3, 1)).toBe(1);
    expect(nextSuggestionIndex(2, 3, 1)).toBe(0);
  });
  it('向上环绕', () => {
    expect(nextSuggestionIndex(1, 3, -1)).toBe(0);
    expect(nextSuggestionIndex(0, 3, -1)).toBe(2);
  });
});

describe('ai-chat-input · referenceLabel', () => {
  it("type='text' 用 content", () => {
    expect(referenceLabel({ type: 'text', id: '1', content: '引用文本' })).toBe('引用文本');
  });
  it('非文本用 name，缺省回退 id', () => {
    expect(referenceLabel({ type: 'file', id: '1', name: 'a.pdf' })).toBe('a.pdf');
    expect(referenceLabel({ type: 'file', id: 'fallback-id' })).toBe('fallback-id');
  });
});

describe('ai-chat-input · isImageReference', () => {
  it("type='image' 判图", () => {
    expect(isImageReference({ type: 'image', id: '1' })).toBe(true);
  });
  it('url 图片扩展名判图（含 query/hash）', () => {
    expect(isImageReference({ type: 'file', id: '1', url: 'a.png' })).toBe(true);
    expect(isImageReference({ type: 'file', id: '1', url: 'https://x/y.JPG?v=2' })).toBe(true);
    expect(isImageReference({ type: 'file', id: '1', url: 'doc.pdf' })).toBe(false);
    expect(isImageReference({ type: 'file', id: '1' })).toBe(false);
  });
});

describe('ai-chat-input · skillLabel', () => {
  it('label 优先，回退 value，再回退空串', () => {
    expect(skillLabel({ label: '总结', value: 'summarize' })).toBe('总结');
    expect(skillLabel({ value: 'summarize' })).toBe('summarize');
    expect(skillLabel({})).toBe('');
  });
});

describe('ai-chat-input · getSkillSlotHTML', () => {
  it('生成 skill-slot 节点 HTML，带 data 属性', () => {
    const html = getSkillSlotHTML({ label: '总结', value: 'sum', hasTemplate: true });
    expect(html).toBe('<skill-slot data-label="总结" data-value="sum" data-template="true"></skill-slot>');
  });
  it('省略未提供的属性', () => {
    expect(getSkillSlotHTML({ label: '仅标签' })).toBe('<skill-slot data-label="仅标签"></skill-slot>');
  });
  it('转义属性值防注入', () => {
    const html = getSkillSlotHTML({ label: '"><img>&' });
    expect(html).toContain('data-label="&quot;&gt;&lt;img&gt;&amp;"');
    expect(html).not.toContain('<img>');
  });
});

describe('ai-chat-input · shouldOpenSkillPanel', () => {
  it('空编辑区 + 命中 skillHotKey + 有技能 → true', () => {
    expect(shouldOpenSkillPanel({ key: '/', skillHotKey: '/', isEmpty: true, skillCount: 2 })).toBe(true);
  });
  it('非空编辑区不触发', () => {
    expect(shouldOpenSkillPanel({ key: '/', skillHotKey: '/', isEmpty: false, skillCount: 2 })).toBe(false);
  });
  it('键不匹配不触发', () => {
    expect(shouldOpenSkillPanel({ key: 'a', skillHotKey: '/', isEmpty: true, skillCount: 2 })).toBe(false);
  });
  it('无技能不触发', () => {
    expect(shouldOpenSkillPanel({ key: '/', skillHotKey: '/', isEmpty: true, skillCount: 0 })).toBe(false);
  });
});

describe('ai-chat-input · setConfigureField', () => {
  it('合并字段补丁，不可变', () => {
    const v = { model: 'gpt-5' };
    const next = setConfigureField(v, { web: true });
    expect(next).toEqual({ model: 'gpt-5', web: true });
    expect(v).toEqual({ model: 'gpt-5' }); // 原对象不变
  });
  it('同字段覆盖', () => {
    expect(setConfigureField({ model: 'a' }, { model: 'b' })).toEqual({ model: 'b' });
  });
});

describe('ai-chat-input · removeConfigureField', () => {
  it('移除字段，不可变', () => {
    const v = { model: 'gpt-5', web: true };
    const next = removeConfigureField(v, 'web');
    expect(next).toEqual({ model: 'gpt-5' });
    expect(v).toEqual({ model: 'gpt-5', web: true });
  });
  it('移除不存在的字段无副作用', () => {
    expect(removeConfigureField({ a: 1 }, 'b')).toEqual({ a: 1 });
  });
});

describe('ai-chat-input · messageToChatInput', () => {
  it('inputContents → input_text，附件按类型 → input_image/input_file', () => {
    const msg = messageToChatInput(
      {
        inputContents: [{ type: 'text', text: '你好' }],
        attachments: [
          { uid: '1', name: 'a.png', url: 'https://x/a.png' },
          { uid: '2', name: 'doc.pdf', url: 'https://x/doc.pdf' },
        ],
      },
      { id: 'm1', model: 'gpt-5' },
    );
    expect(msg.role).toBe('user');
    expect(msg.id).toBe('m1');
    expect(msg.model).toBe('gpt-5');
    const inner = (msg.content as { content: Record<string, unknown>[] }[])[0]!.content;
    expect(inner).toEqual([
      { type: 'input_text', text: '你好' },
      { type: 'input_image', image_url: 'https://x/a.png', file_id: '1' },
      { type: 'input_file', filename: 'doc.pdf', file_url: 'https://x/doc.pdf', file_id: '2' },
    ]);
  });
  it('缺 id 默认空串；空文本段丢弃', () => {
    const msg = messageToChatInput({ inputContents: [{ type: 'text', text: '' }] });
    expect(msg.id).toBe('');
    const inner = (msg.content as { content: unknown[] }[])[0]!.content;
    expect(inner).toEqual([]);
  });
  it('按 url 图片扩展名判图（attachment.type 是 file/directory 非 mime）', () => {
    const msg = messageToChatInput({ attachments: [{ uid: '1', url: 'https://x/pic.webp' }] });
    const inner = (msg.content as { content: Record<string, unknown>[] }[])[0]!.content;
    expect(inner[0]!.type).toBe('input_image');
  });
});

describe('ai-chat-input · chatInputToChatCompletion', () => {
  it('转成 OpenAI user message 多模态 parts', () => {
    const m = chatInputToChatCompletion({
      inputContents: [{ type: 'text', text: 'hi' }],
      attachments: [{ uid: '1', name: 'a.jpg', url: 'https://x/a.jpg' }],
    });
    expect(m.role).toBe('user');
    expect(m.content).toEqual([
      { type: 'text', text: 'hi' },
      { type: 'image_url', image_url: { url: 'https://x/a.jpg' } },
    ]);
  });
  it('非图附件 → file part', () => {
    const m = chatInputToChatCompletion({
      attachments: [{ uid: '1', name: 'r.pdf', url: 'https://x/r.pdf' }],
    });
    expect(m.content).toEqual([
      { type: 'file', file: { filename: 'r.pdf', file_data: 'https://x/r.pdf' } },
    ]);
  });
  it('空载荷 → 空 content', () => {
    expect(chatInputToChatCompletion({}).content).toEqual([]);
  });
});
