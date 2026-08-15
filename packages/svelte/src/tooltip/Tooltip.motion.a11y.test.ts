// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd）：jsdom
// 不真实播放 CSS animation，用 dispatchEvent 手动模拟 animationend 验证 JS 状态机本身的
// 正确性。Tooltip 是全部浮层组件（Popover/Popconfirm/Dropdown/DatePicker...）的继承链底层，
// 这里验证的状态机也间接覆盖了它们复用到的动画基础设施。
//
// Tooltip 特有：keepDOM 默认 false（关闭即整个卸载 DOM，来不及播放退场动画——用户未要求
// 保留 DOM，立即消失符合预期，afterClose 立即触发）；只有 keepDOM=true 时才有退场中间态，
// afterClose 等 animationend 真正触发才调用（而非旧的 requestAnimationFrame 近似值）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Fixture from './TooltipA11yFixture.svelte';

function getWrapper(): HTMLElement | null {
  return document.querySelector('[role="tooltip"]');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('Tooltip 面板进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    render(Fixture, { props: { visible: true } });
    const wrapper = getWrapper();
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).not.toContain('cd-tooltip-wrapper-hidden');
    expect(wrapper?.className).toContain('cd-tooltip-wrapper-motion-show');
  });

  it('keepDOM=true：关闭不立即隐藏，animationend 后才真正隐藏', async () => {
    const { rerender } = render(Fixture, { props: { visible: true, keepDOM: true } });
    await rerender({ visible: false, keepDOM: true });
    await new Promise((r) => setTimeout(r, 0));

    const wrapper = getWrapper();
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).not.toContain('cd-tooltip-wrapper-hidden');
    expect(wrapper?.className).toContain('cd-tooltip-wrapper-motion-hide');

    fireAnimationEnd(wrapper as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getWrapper()?.className).toContain('cd-tooltip-wrapper-hidden');
  });

  it('keepDOM=false（默认）：关闭时面板整个从 DOM 卸载（不适用退场动画）', async () => {
    const { rerender } = render(Fixture, { props: { visible: true, keepDOM: false } });
    expect(getWrapper()).not.toBeNull();

    await rerender({ visible: false, keepDOM: false });
    await new Promise((r) => setTimeout(r, 0));

    expect(getWrapper()).toBeNull();
  });

  it('keepDOM=true + motion=false：关闭立即隐藏，无中间态', async () => {
    const { rerender } = render(Fixture, {
      props: { visible: true, keepDOM: true, motion: false },
    });
    await rerender({ visible: false, keepDOM: true, motion: false });
    await new Promise((r) => setTimeout(r, 0));

    expect(getWrapper()?.className).toContain('cd-tooltip-wrapper-hidden');
  });
});
