// Chat 视觉度量对齐 Semi（browser project / 真实 chromium）。
//
// 存在意义：a11y / kbd / 元素计数类断言**测不出视觉差异**——line-height 差 1px、
// textarea 行数不对、凭空多出 placeholder，这些用例全都照样绿，只能靠人肉眼发现。
// 本用例把 Semi 官网实测读数（见 test-utils/semi-metrics.ts）钉成基线，逐属性比对，
// 数值对不上就红。
//
// 已由本用例覆盖的三个真实回归（2026-07-31 用户肉眼指出后修复）：
//   1. textarea line-height 写成 `1.5`（→21px），Semi 是固定 `20px`；
//   2. 显式传 `rows={1}` 让初始框收成单行（31px），Semi 无 rows、初始 4 行 90px；
//   3. placeholder 兜底到自造 locale 键，凭空显示「输入消息」，Semi 默认无占位符。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import { CHAT_INPUT_TEXTAREA, CHAT_INPUT_CONTAINER } from '../test-utils/semi-metrics.js';
import ChatInputBoxKbdFixture from './ChatInputBoxKbdFixture.svelte';

function computedOf(el: Element, keys: string[]): Record<string, string> {
  const cs = getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = cs[k as keyof CSSStyleDeclaration] as string;
  return out;
}

describe('Chat 视觉度量对齐 Semi 实测基线', () => {
  it('输入框 textarea 的 line-height / font-size / padding / 初始高度与 Semi 一致', () => {
    renderKbdFixture(ChatInputBoxKbdFixture);

    const textarea = document.querySelector('.cd-chat-inputBox-container textarea');
    expect(textarea).not.toBeNull();

    const keys = Object.keys(CHAT_INPUT_TEXTAREA.computed);
    expect(computedOf(textarea!, keys)).toEqual(CHAT_INPUT_TEXTAREA.computed);
  });

  it('输入框容器 padding / align-items 与 Semi 一致', () => {
    renderKbdFixture(ChatInputBoxKbdFixture);

    const container = document.querySelector('.cd-chat-inputBox-container');
    expect(container).not.toBeNull();

    const keys = Object.keys(CHAT_INPUT_CONTAINER.computed);
    expect(computedOf(container!, keys)).toEqual(CHAT_INPUT_CONTAINER.computed);
  });

  it('未传 placeholder 时不显示占位符（对齐 Semi：无内置默认文案）', () => {
    renderKbdFixture(ChatInputBoxKbdFixture);

    const textarea = document.querySelector(
      '.cd-chat-inputBox-container textarea',
    ) as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('');
  });
});
