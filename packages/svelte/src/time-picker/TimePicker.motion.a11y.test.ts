// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd，与
// TreeSelect/Select/Cascader/AutoComplete 同构模式）：jsdom 不真实播放 CSS animation，
// 用 dispatchEvent 手动模拟 animationend 验证 JS 状态机本身的正确性。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import TimePicker from './TimePicker.svelte';

function getPanel(): HTMLElement | null {
  return document.querySelector('.cd-time-picker-panel');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('TimePicker 面板进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    renderWithLocale(TimePicker, { props: { defaultOpen: true } });
    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.hasAttribute('hidden')).toBe(false);
    expect(panel?.className).toContain('cd-time-picker-panel-motion-show');
  });

  it('关闭（Escape）：不立即隐藏，animationend 后才真正隐藏', async () => {
    renderWithLocale(TimePicker, { props: { defaultOpen: true } });
    const panel = getPanel();
    panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.hasAttribute('hidden')).toBe(false);
    expect(getPanel()?.className).toContain('cd-time-picker-panel-motion-hide');

    fireAnimationEnd(getPanel() as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.hasAttribute('hidden')).toBe(true);
  });

  it('motion=false：关闭立即隐藏，无中间态', async () => {
    renderWithLocale(TimePicker, { props: { defaultOpen: true, motion: false } });
    const panel = getPanel();
    panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.hasAttribute('hidden')).toBe(true);
  });
});
