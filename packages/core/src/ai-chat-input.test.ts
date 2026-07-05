import { describe, it, expect } from 'vitest';
import {
  isSendHotKey,
  resolveCanSend,
  buildMessageContent,
  transformDocToContents,
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
