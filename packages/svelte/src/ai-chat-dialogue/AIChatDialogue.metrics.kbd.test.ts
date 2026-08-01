// DialogueBox 布局实测值 vs Semi（browser project / 真实 chromium）。
//
// 为什么要真浏览器：这些值全靠 var(--cd-*) 解析，jsdom 不算样式，
// a11y 用例里断类名全绿也证明不了「padding 真的是 8/16px」。
// 本库此前 wrapper 用的是 --cd-spacing-tight 这类通用值，
// 而 Semi 的 token 早就按 $spacing-aiChatDialogue_wrapper-* 建好了，只是没接上——
// 类名一个不差，量出来却对不上，正是这种缺口需要机器盯住。
//
// 注意必须引 tokens.css：不引则 var(--cd-*) 全部失效，
// padding 量出来是 0px、column-gap 是 normal，断言会假绿。
import '@chenzy-design/tokens/tokens.css';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AIChatDialogue from './AIChatDialogue.svelte';
import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

const roleConfig: AIDialogueRoleConfig = {
  user: { name: '我' },
  assistant: { name: '助手' },
};

const chats: AIDialogueMessage[] = [
  { id: 'u1', role: 'user', content: 'hi' },
  { id: 'a1', role: 'assistant', content: 'yo' },
];

/** Semi aiChatDialogue/variables.scss 实测值。 */
const SEMI = {
  wrapperPaddingY: '8px', // $spacing-aiChatDialogue_wrapper-paddingY
  wrapperPaddingX: '16px', // $spacing-aiChatDialogue_wrapper-paddingX
  wrapperColumnGap: '16px', // $spacing-aiChatDialogue_wrapper-columnGap
  containerColumnGap: '12px', // $spacing-aiChatDialogue_container-columnGap
} as const;

const settle = () => new Promise((r) => setTimeout(r, 100));

describe('AIChatDialogue 布局实测（对齐 Semi）', () => {
  it('wrapper：padding 8/16px + column-gap 16px + align-items center', async () => {
    render(AIChatDialogue, { props: { chats, roleConfig } });
    await settle();
    const w = document.querySelector('.cd-ai-chat-dialogue-wrapper') as HTMLElement;
    const cs = getComputedStyle(w);
    expect(cs.paddingTop, 'wrapper 垂直内边距').toBe(SEMI.wrapperPaddingY);
    expect(cs.paddingLeft, 'wrapper 水平内边距').toBe(SEMI.wrapperPaddingX);
    expect(cs.columnGap, 'wrapper 列间距').toBe(SEMI.wrapperColumnGap);
    // Semi 是 center（本库原来是 flex-start）。
    expect(cs.alignItems, 'wrapper 垂直对齐').toBe('center');
  });

  it('container：column-gap 12px，user 那条 row-reverse、assistant 那条 row', async () => {
    render(AIChatDialogue, { props: { chats, roleConfig } });
    await settle();
    const containers = document.querySelectorAll('.cd-ai-chat-dialogue-container');
    expect(containers.length).toBe(2);
    expect(getComputedStyle(containers[0] as HTMLElement).columnGap).toBe(
      SEMI.containerColumnGap,
    );
    // chats[0] 是 user + 默认 align=leftRight → 右对齐。
    const right = document.querySelector(
      '.cd-ai-chat-dialogue-container-right',
    ) as HTMLElement;
    expect(right, 'user 消息应带 -container-right').not.toBeNull();
    expect(getComputedStyle(right).flexDirection).toBe('row-reverse');
    // assistant 那条不反转。
    expect(getComputedStyle(containers[1] as HTMLElement).flexDirection).toBe('row');
  });

  it('align=leftAlign：两条都不反转', async () => {
    render(AIChatDialogue, { props: { chats, roleConfig, align: 'leftAlign' } });
    await settle();
    const containers = document.querySelectorAll('.cd-ai-chat-dialogue-container');
    for (const c of containers) {
      expect(getComputedStyle(c as HTMLElement).flexDirection).toBe('row');
    }
  });

  it('continueSend：同角色第二条头像 visibility hidden（占位不显示）', async () => {
    const sameRole: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: '第一句' },
      { id: 'a2', role: 'assistant', content: '第二句' },
    ];
    render(AIChatDialogue, { props: { chats: sameRole, roleConfig } });
    await settle();
    const avatars = document.querySelectorAll('.cd-ai-chat-dialogue-avatar');
    expect(avatars.length).toBe(2);
    expect(getComputedStyle(avatars[0] as HTMLElement).visibility).toBe('visible');
    expect(getComputedStyle(avatars[1] as HTMLElement).visibility).toBe('hidden');
  });
});
