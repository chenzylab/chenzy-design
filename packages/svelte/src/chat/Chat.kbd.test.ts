// Chat 输入框 hover / focus 视觉回归（browser project / 真实 chromium）。
//
// 对齐 Semi：输入框视觉全部由外层 `.cd-chat-inputBox-container` 承担
// （Semi 的 -container 只有静态 border，**没有** hover / focus 规则），
// 内层 TextArea 必须压平成透明无边框。
//
// 为什么必须放这里：CSS `:hover` 只有真实指针才命中 —— jsdom 无样式，
// CDP 后台标签（document.hidden）下合成鼠标不投递，都测不出来。
//
// 回归历史：本库 Input 自带 `.cd-input-textarea-wrapper.svelte-xxx:hover/:focus-within`
// 是 (0,3,0)，而 chat 的压平规则 `.cd-chat-inputBox-inputArea.svelte-xxx .cd-input-textarea-wrapper`
// 只有 (0,2,0)，曾被盖过 —— 表现为 hover 变底色、聚焦冒出蓝框，与 Semi 不符。
// 修法是照 Semi 用 `:not(#neverExistElement)` 抬到 (1,2,0)。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ChatInputBoxKbdFixture from './ChatInputBoxKbdFixture.svelte';

function readWrapperStyle() {
  const wrapper = document.querySelector('.cd-input-textarea-wrapper') as HTMLElement;
  const cs = getComputedStyle(wrapper);
  return { bg: cs.backgroundColor, borderWidth: cs.borderTopWidth };
}

describe('Chat 输入框内层 TextArea 压平（对齐 Semi）', () => {
  it('hover 与 focus 都不改变内层底色/边框（视觉由外层 container 承担）', async () => {
    renderKbdFixture(ChatInputBoxKbdFixture);

    const wrapper = document.querySelector('.cd-input-textarea-wrapper') as HTMLElement;
    expect(wrapper).not.toBeNull();

    const initial = readWrapperStyle();
    // 内层应当是透明无边框
    expect(initial.borderWidth).toBe('0px');

    // 真实指针 hover
    await userEvent.hover(wrapper);
    await expect.poll(() => readWrapperStyle().bg).toBe(initial.bg);
    expect(readWrapperStyle().borderWidth).toBe(initial.borderWidth);

    // 真实点击聚焦（textarea 进入 :focus-within）
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    await userEvent.click(textarea);
    await expect.poll(() => wrapper.matches(':focus-within')).toBe(true);

    // 聚焦态同样不应有底色/边框变化
    expect(readWrapperStyle().bg).toBe(initial.bg);
    expect(readWrapperStyle().borderWidth).toBe(initial.borderWidth);
  });
});
