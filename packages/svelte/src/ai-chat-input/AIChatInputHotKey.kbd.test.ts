// allowHotKeySend 热键让路 e2e（browser project / 真实 chromium）。
//
// 对齐 Semi statusExtension.tsx + foundation.ts 的同名判定：自定义扩展若也用 Enter
// 做快捷操作，可把 editor.storage.CdAIChatInput.allowHotKeySend 置 false，声明
// 「Enter 归我用」，此时 AIChatInput 不应把 Enter 当发送热键。
//
// 本库此前完全没有这个机制——任何用 Enter 的自定义扩展都会和发送键打架，
// 而文档里「通过 extensions 自定义扩展」这条对用户就是个坑。
//
// 必须真实浏览器：需要真的 tiptap Editor 实例才有 editor.storage 命名空间。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import AIChatInputHotKeyKbdFixture from './AIChatInputHotKeyKbdFixture.svelte';

// 本夹具挂两个 tiptap 实例，且内核是动态 import。全量跑（多 project 并行）时
// 竞争资源会显著变慢，故超时给得比单实例用例更宽，避免偶发假红。
async function waitEditors(count: number): Promise<void> {
  await expect
    .poll(() => document.querySelectorAll('.ProseMirror').length, { timeout: 30000 })
    .toBe(count);
}

function pressEnter(pm: HTMLElement): void {
  pm.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
  );
}

function countOf(testid: string): number {
  return Number(document.querySelector(`[data-testid="${testid}"]`)?.textContent ?? '-1');
}

describe('AIChatInput allowHotKeySend', () => {
  it('默认允许：Enter 触发发送', async () => {
    renderKbdFixture(AIChatInputHotKeyKbdFixture);
    await waitEditors(2);

    const on = document.querySelector('[data-testid="allow-on"] .ProseMirror') as HTMLElement;
    expect(countOf('count-on')).toBe(0);
    pressEnter(on);
    await expect.poll(() => countOf('count-on'), { timeout: 10000 }).toBe(1);
  });

  it('扩展置 allowHotKeySend=false：Enter 不发送（把热键让给扩展）', async () => {
    renderKbdFixture(AIChatInputHotKeyKbdFixture);
    await waitEditors(2);

    const off = document.querySelector('[data-testid="allow-off"] .ProseMirror') as HTMLElement;

    // 先确认 storage 命名空间确实存在且已被夹具置 false——否则本用例可能因为
    // 「根本没装上扩展」而假绿（那样 Enter 也不会发送，但原因完全不同）。
    await expect
      .poll(
        () => document.querySelector('[data-testid="storage-state"]')?.textContent ?? '',
        { timeout: 5000 },
      )
      .toBe('set-false');

    pressEnter(off);
    // 给足时间：若会发送，1 已经写进去了。
    await new Promise((r) => setTimeout(r, 500));
    expect(countOf('count-off'), 'allowHotKeySend=false 时不应发送').toBe(0);
  });
});
