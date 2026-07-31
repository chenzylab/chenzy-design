// AIChatInput 的 showPlaceholderWhenSkillOnly e2e（browser project / 真实 chromium）。
//
// 对齐 Semi richTextInput.tsx 的 custom-placeholder 插件：
// 只选中技能（无其他内容）时仍显示 placeholder，且排在 skill 后方。
//
// 为什么必须放这里：tiptap 需真实 DOM 挂载、ProseMirror decoration 才会生成，
// jsdom 跑不起编辑器；placeholder 本身是 ::before/::after 伪元素，也只有真实浏览器能读。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import AIChatInputPlaceholderKbdFixture from './AIChatInputPlaceholderKbdFixture.svelte';

/** 等编辑器（动态 import tiptap 内核）挂载完成。 */
async function waitEditors(count: number): Promise<void> {
  await expect.poll(() => document.querySelectorAll('.ProseMirror').length, { timeout: 15000 }).toBe(count);
}

/** 往指定编辑器里插入一个 skillSlot 节点（模拟选中技能）。 */
function insertSkill(pm: HTMLElement): void {
  const p = pm.querySelector('p');
  if (!p) return;
  const slot = document.createElement('skill-slot');
  slot.setAttribute('data-value', 'translate');
  slot.setAttribute('data-label', '翻译');
  slot.textContent = '翻译';
  p.appendChild(slot);
}

describe('AIChatInput showPlaceholderWhenSkillOnly', () => {
  it('空编辑器：两个实例都显示 placeholder（基线）', async () => {
    renderKbdFixture(AIChatInputPlaceholderKbdFixture);
    await waitEditors(2);

    const paras = [...document.querySelectorAll('.ProseMirror p')] as HTMLElement[];
    // 空态下 decoration 给首段加 is-empty / is-editor-empty，并带 data-placeholder
    for (const p of paras) {
      expect(p.getAttribute('data-placeholder')).toBe('输入消息');
      expect(p.className).toContain('is-editor-empty');
    }
  });

  it('段落只含 skillSlot 时：开启的实例仍判为空且加 has-skill-slot 类', async () => {
    renderKbdFixture(AIChatInputPlaceholderKbdFixture);
    await waitEditors(2);

    const pms = [...document.querySelectorAll('.ProseMirror')] as HTMLElement[];
    const onPm = pms[0]!;

    insertSkill(onPm);
    // 触发一次 selection 变更让 decoration 重算
    onPm.dispatchEvent(new Event('input', { bubbles: true }));

    await expect
      .poll(() => onPm.querySelector('p')?.className ?? '', { timeout: 5000 })
      .toContain('has-skill-slot');

    // 仍带 placeholder 文案（对齐 Semi：显示在 skill 后方）
    expect(onPm.querySelector('p')?.getAttribute('data-placeholder')).toBe('输入消息');
  });
});
