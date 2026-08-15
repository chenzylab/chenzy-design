// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd，与
// TreeSelect/Select/Cascader 同构模式）：jsdom 不真实播放 CSS animation，用
// dispatchEvent 手动模拟 animationend 验证 JS 状态机本身的正确性。
//
// Dropdown 特有：keepDOM 默认 false（关闭即整个卸载 DOM，来不及播放退场动画——
// 用户未要求保留 DOM，立即消失符合预期）；只有 keepDOM=true 时才有退场动画的中间态。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Fixture from './DropdownMotionFixture.svelte';

function getMenu(): HTMLElement | null {
  return document.querySelector('.cd-dropdown');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('Dropdown 面板进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    render(Fixture, { props: { visible: true } });
    const menu = getMenu();
    expect(menu).not.toBeNull();
    expect(menu?.className).not.toContain('cd-dropdown-hidden');
    expect(menu?.className).toContain('cd-dropdown-motion-show');
  });

  it('keepDOM=true：关闭不立即隐藏，animationend 后才真正隐藏', async () => {
    const { rerender } = render(Fixture, { props: { visible: true, keepDOM: true } });
    await rerender({ visible: false, keepDOM: true });
    await new Promise((r) => setTimeout(r, 0));

    const menu = getMenu();
    expect(menu).not.toBeNull();
    expect(menu?.className).not.toContain('cd-dropdown-hidden');
    expect(menu?.className).toContain('cd-dropdown-motion-hide');

    fireAnimationEnd(menu as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getMenu()?.className).toContain('cd-dropdown-hidden');
  });

  it('keepDOM=false（默认）：关闭时面板整个从 DOM 卸载（不适用退场动画）', async () => {
    const { rerender } = render(Fixture, { props: { visible: true, keepDOM: false } });
    expect(getMenu()).not.toBeNull();

    await rerender({ visible: false, keepDOM: false });
    await new Promise((r) => setTimeout(r, 0));

    expect(getMenu()).toBeNull();
  });

  it('keepDOM=true + motion=false：关闭立即隐藏，无中间态', async () => {
    const { rerender } = render(Fixture, {
      props: { visible: true, keepDOM: true, motion: false },
    });
    await rerender({ visible: false, keepDOM: true, motion: false });
    await new Promise((r) => setTimeout(r, 0));

    expect(getMenu()?.className).toContain('cd-dropdown-hidden');
  });
});
