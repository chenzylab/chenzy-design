// AIChatDialogue a11y + 渲染：OpenAI 消息格式对话展示。
//  - 消息流容器 role=log / aria-live=polite / aria-label 走 locale。
//  - ContentItem 分块渲染：output_text→MarkdownRender、reasoning 折叠、function_call 工具块。
//  - 选择模式：checkbox 前置。
//  - axe 0 violations。
// jsdom 断言静态渲染 + ARIA + axe（真实滚动/回到底部留浏览器）。
import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AIChatDialogue from './AIChatDialogue.svelte';
import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

const roleConfig: AIDialogueRoleConfig = {
  user: { name: '我', color: '#4080ff' },
  assistant: { name: '助手', color: '#00b42a' },
};

const chats: AIDialogueMessage[] = [
  {
    id: 'u1',
    role: 'user',
    content: [{ type: 'message', content: [{ type: 'input_text', text: 'hello' }] }],
    status: 'completed',
  },
  {
    id: 'a1',
    role: 'assistant',
    content: [
      { type: 'reasoning', summary: [{ text: 'thinking...' }] },
      { type: 'message', content: [{ type: 'output_text', text: 'Hi there!' }] },
      { type: 'function_call', name: 'get_weather', arguments: '{"city":"SF"}' },
    ],
    status: 'completed',
  },
];

describe('AIChatDialogue a11y / 渲染', () => {
  it('消息流 role=log / aria-live=polite / locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const log = container.querySelector('.cd-ai-dialogue-container');
    expect(log).not.toBeNull();
    expect(log?.getAttribute('role')).toBe('log');
    expect(log?.getAttribute('aria-live')).toBe('polite');
    const label = log?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('AIChatDialogue.messageList');
    await expectNoAxeViolations(container);
  });

  it('两条消息各一个 DialogueBox', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    expect(container.querySelectorAll('.cd-ai-dialogue-box').length).toBe(2);
  });

  it('ContentItem 分块：reasoning 折叠块 + function_call 工具块渲染', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    // reasoning 折叠按钮存在，aria-expanded=false（默认收起）。
    const toggle = container.querySelector('.cd-ai-dialogue-reasoning-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    // function_call 工具块名称渲染。
    const tool = container.querySelector('.cd-ai-dialogue-tool-name');
    expect(tool?.textContent).toBe('get_weather');
  });

  it('reasoning 折叠：点击后展开 aria-expanded=true', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const toggle = container.querySelector('.cd-ai-dialogue-reasoning-toggle') as HTMLButtonElement;
    await fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('.cd-ai-dialogue-reasoning-body')).not.toBeNull();
  });

  it('选择模式：每条消息前置 checkbox', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig, selecting: true },
    });
    expect(container.querySelectorAll('.cd-ai-dialogue-box-select').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('error 状态渲染错误文案（走 locale 非 key）', async () => {
    const errorChats: AIDialogueMessage[] = [
      { id: 'e1', role: 'assistant', content: [], status: 'failed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: errorChats, roleConfig },
    });
    const err = container.querySelector('.cd-ai-dialogue-box-error');
    expect(err?.textContent).toBeTruthy();
    expect(err?.textContent).not.toBe('AIChatDialogue.error');
  });
});
