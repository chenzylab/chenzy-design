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
