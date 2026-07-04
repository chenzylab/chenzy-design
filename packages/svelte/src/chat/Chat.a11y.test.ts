// Chat a11y + 渲染：对话主容器（消息流 + 输入区 + 提示区）。
//  - 消息流容器 role=log / aria-live=polite / aria-label 走 locale（非 key 字面量）。
//  - 各 status 消息（complete/loading/error）渲染出对应文本/样式。
//  - 输入文本后点击发送 → 触发 onMessageSend + onChatsChange（core buildSendContent/makeUserMessage）。
//  - 自定义 renderChatBoxContent snippet 生效。
//  - axe 0 violations。
// jsdom 只断言静态渲染 + ARIA + axe + 单次同步事件（真实滚动/回到底部/动画留给浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import type { Component } from 'svelte';
import Chat from './Chat.svelte';
import ChatContentFixture from './ChatContentFixture.svelte';
import type { Message } from './types.js';

// renderWithLocale 接收宽松组件构造器；夹具需要 chats prop，转成宽松类型传入。
const ChatContentFixtureAny = ChatContentFixture as unknown as Component<
  Record<string, unknown>
>;

const baseChats: Message[] = [
  { id: 'm1', role: 'user', content: 'Hello there' },
  { id: 'm2', role: 'assistant', content: 'Hi! How can I help?', status: 'complete' },
  { id: 'm3', role: 'assistant', content: '', status: 'loading' },
  { id: 'm4', role: 'assistant', content: '', status: 'error' },
];

describe('Chat a11y / 渲染', () => {
  it('消息流容器 role=log / aria-live=polite / locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Chat, { props: { chats: baseChats } });
    const log = container.querySelector('.cd-chat-container');
    expect(log).not.toBeNull();
    expect(log?.getAttribute('role')).toBe('log');
    expect(log?.getAttribute('aria-live')).toBe('polite');
    const label = log?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Chat.messageList');
    await expectNoAxeViolations(container);
  });

  it('各 status 消息渲染：complete 文本 / loading / error', async () => {
    const { container } = renderWithLocale(Chat, { props: { chats: baseChats } });
    // 四条消息各一个 chatBox。
    expect(container.querySelectorAll('.cd-chat-chatBox').length).toBe(4);
    // loading / error 文本走 locale（非 key）。
    expect(container.querySelector('.cd-chat-chatBox-error')?.textContent).toBeTruthy();
    expect(container.querySelector('.cd-chat-chatBox-error')?.textContent).not.toBe('Chat.error');
    await expectNoAxeViolations(container);
  });

  it('输入文本后点击发送：触发 onMessageSend + onChatsChange', async () => {
    const onMessageSend = vi.fn();
    const onChatsChange = vi.fn();
    const { container } = renderWithLocale(Chat, {
      props: { chats: baseChats, onMessageSend, onChatsChange },
    });
    const textarea = container.querySelector('.cd-chat-inputBox-textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    await fireEvent.input(textarea, { target: { value: 'a new message' } });
    const sendBtn = container.querySelector('.cd-chat-inputBox-send') as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(false);
    await fireEvent.click(sendBtn);
    expect(onMessageSend).toHaveBeenCalledTimes(1);
    expect(onMessageSend.mock.calls[0]![0]).toBe('a new message');
    expect(onChatsChange).toHaveBeenCalledTimes(1);
    // 新 chats 末条为 user 消息，content 为纯文本（无附件）。
    const nextChats = onChatsChange.mock.calls[0]![0] as Message[];
    const last = nextChats[nextChats.length - 1]!;
    expect(last.role).toBe('user');
    expect(last.content).toBe('a new message');
  });

  it('空输入时发送按钮 disabled', async () => {
    const { container } = renderWithLocale(Chat, { props: { chats: baseChats } });
    const sendBtn = container.querySelector('.cd-chat-inputBox-send') as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(true);
  });

  it('点击点赞：触发 onMessageGoodFeedback + onChatsChange（toggleLike）', async () => {
    const onMessageGoodFeedback = vi.fn();
    const onChatsChange = vi.fn();
    const { container } = renderWithLocale(Chat, {
      props: { chats: baseChats, onMessageGoodFeedback, onChatsChange },
    });
    // 第一条消息（user）的点赞按钮：定位到其操作区 like。
    const likeBtns = container.querySelectorAll('.cd-chat-chatBox-action-btn[aria-pressed]');
    expect(likeBtns.length).toBeGreaterThan(0);
    await fireEvent.click(likeBtns[0] as HTMLButtonElement);
    expect(onMessageGoodFeedback).toHaveBeenCalledTimes(1);
    expect(onChatsChange).toHaveBeenCalledTimes(1);
  });

  it('自定义 renderChatBoxContent snippet 生效', async () => {
    const { container } = renderWithLocale(ChatContentFixtureAny, {
      props: { chats: [{ id: 'x', role: 'assistant', content: 'raw', status: 'complete' }] },
    });
    expect(container.querySelector('.custom-content')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
