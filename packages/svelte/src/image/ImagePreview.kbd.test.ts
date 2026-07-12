// Image 灯箱键盘 e2e（browser project / 真实 chromium）。
// ImagePreview 是 portal 到 body 的全屏 dialog（aria-modal=true）：useFocusTrap 把焦点锁在
// 灯箱内 + 关闭归还触发元素；全局 keydown 监听 Esc 关闭、←→ 翻页（onChange 切 current）。
// jsdom 测不了真实焦点陷阱/归还，故真浏览器断 .toHaveFocus()。
//   1. 聚焦 trigger 并点击开灯箱 → 焦点进入灯箱（首个可聚焦 = 关闭按钮）。
//   2. → 翻到下一张（counter 1/3 → 2/3），← 翻回。
//   3. Esc 关闭灯箱 → 焦点归还 trigger。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ImagePreviewKbdFixture from './ImagePreviewKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

function counterText(): string {
  return document.querySelector('.cd-image-preview-footer-page')?.textContent?.trim() ?? '';
}

describe('Image 灯箱键盘 e2e（focus trap + ←→ 翻页 + Esc 归还）', () => {
  it('开灯箱焦点入内；←→ 翻页；Esc 关闭归还 trigger', async () => {
    const { baseElement } = renderKbdFixture(ImagePreviewKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    // 灯箱 portal 到 body：查 role=dialog（aria-modal=true）。
    const overlay = document.querySelector('.cd-image-preview[role="dialog"]') as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute('aria-modal')).toBe('true');

    // 1. 焦点进入灯箱（focus trap activate；落在内部可聚焦项）。
    await expect.poll(() => overlay.contains(document.activeElement)).toBe(true);
    expect(counterText()).toBe('1/3');

    // 2. → 翻到下一张（onChange 切 current）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => counterText()).toBe('2/3');
    // 焦点仍困在灯箱内。
    expect(overlay.contains(document.activeElement)).toBe(true);
    // ← 翻回上一张。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(() => counterText()).toBe('1/3');

    // 3. Esc 关闭灯箱 → 焦点归还 trigger（focus trap deactivate returnFocus）。
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('.cd-image-preview')).toBeNull();
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
