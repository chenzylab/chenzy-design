// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd，与
// TreeSelect/Select/Cascader/Dropdown 同构模式）：jsdom 不真实播放 CSS animation，
// 用 dispatchEvent 手动模拟 animationend 验证 JS 状态机本身的正确性。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import AutoComplete from './AutoComplete.svelte';

const data = [
  { label: 'alpha', value: 'alpha' },
  { label: 'beta', value: 'beta' },
];

function getPanel(): HTMLElement | null {
  return document.querySelector('.cd-autocomplete-option-list');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}
function closeByEscape(): void {
  const trigger = document.querySelector('[role="combobox"]') as HTMLElement;
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('AutoComplete 面板进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    renderWithLocale(AutoComplete, { props: { data, defaultOpen: true } });
    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.className).not.toContain('cd-autocomplete-option-list-hidden');
    expect(panel?.className).toContain('cd-autocomplete-option-list-motion-show');
  });

  it('关闭：不立即隐藏，animationend 后才真正隐藏', async () => {
    renderWithLocale(AutoComplete, { props: { data, defaultOpen: true } });
    closeByEscape();
    await new Promise((r) => setTimeout(r, 0));

    const panel = getPanel();
    expect(panel?.className).not.toContain('cd-autocomplete-option-list-hidden');
    expect(panel?.className).toContain('cd-autocomplete-option-list-motion-hide');

    fireAnimationEnd(panel as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.className).toContain('cd-autocomplete-option-list-hidden');
  });

  it('motion=false：关闭立即隐藏，无中间态', async () => {
    renderWithLocale(AutoComplete, { props: { data, defaultOpen: true, motion: false } });
    closeByEscape();
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.className).toContain('cd-autocomplete-option-list-hidden');
  });
});
