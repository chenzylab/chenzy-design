// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd，与
// TreeSelect 同构模式）：jsdom 不真实播放 CSS animation，用 dispatchEvent 手动模拟
// animationend 验证 JS 状态机本身的正确性（CSS 动画播放时长是浏览器职责）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Select from './Select.svelte';

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

function getDropdown(): HTMLElement | null {
  return document.querySelector('.cd-select-dropdown');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}
// Select clickToHide 默认 false（点击 trigger 不关闭已展开面板，对齐 Semi），
// 用 Escape 键关闭（组件 keydown 处理里 isOpen 时 Escape 触发 setOpen(false)）。
function closeByEscape(): void {
  const trigger = document.querySelector('[role="combobox"]') as HTMLElement;
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('Select 面板进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    renderWithLocale(Select, { props: { optionList: options, defaultOpen: true } });
    const dropdown = getDropdown();
    expect(dropdown).not.toBeNull();
    expect(dropdown?.hasAttribute('hidden')).toBe(false);
    expect(dropdown?.className).toContain('cd-select-dropdown-motion-show');
  });

  it('关闭（destroyOnClose=false 默认）：不立即 hidden，animationend 后才真正 hidden', async () => {
    renderWithLocale(Select, { props: { optionList: options, defaultOpen: true } });
    closeByEscape();
    await new Promise((r) => setTimeout(r, 0));

    const dropdown = getDropdown();
    expect(dropdown?.hasAttribute('hidden')).toBe(false);
    expect(dropdown?.className).toContain('cd-select-dropdown-motion-hide');

    fireAnimationEnd(dropdown as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getDropdown()?.hasAttribute('hidden')).toBe(true);
  });

  it('motion=false：关闭立即 hidden，无中间态', async () => {
    renderWithLocale(Select, { props: { optionList: options, defaultOpen: true, motion: false } });
    closeByEscape();
    await new Promise((r) => setTimeout(r, 0));

    expect(getDropdown()?.hasAttribute('hidden')).toBe(true);
  });

  it('destroyOnClose=true：关闭时面板整个从 DOM 卸载（不适用退场动画，立即消失符合语义）', async () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, destroyOnClose: true },
    });
    expect(getDropdown()).not.toBeNull();

    closeByEscape();
    await new Promise((r) => setTimeout(r, 0));

    expect(getDropdown()).toBeNull();
  });
});
