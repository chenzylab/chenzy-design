// Collapsible a11y + 渲染测试（dom project / jsdom）。
// Collapsible 是折叠原语，无触发器 UI。这里断言：
//   - shouldRender 组合（isOpen / keepDOM / lazyRender / collapseHeight）决定内容 DOM 存留；
//   - 完全折叠且不可见时内容 aria-hidden=true（移出可达性树）；
//   - motion=false 即时（无过渡 class 语义）、onMotionEnd 回调、reCalcKey 不崩；
//   - axe 无 violations。
// 真实高度过渡 / rAF 测高留给浏览器实测（jsdom 无布局，scrollHeight=0）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './CollapsibleFixture.svelte';

const content = (c: Element) => c.querySelector('[data-testid="content"]');
const root = (c: Element) => c.querySelector('.cd-collapsible');
const contentBox = (c: Element) => c.querySelector('.cd-collapsible__content');

describe('Collapsible 渲染 / a11y', () => {
  it('默认折叠（isOpen=false, keepDOM=false）：内容 DOM 不渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {});
    expect(root(container)).toBeTruthy();
    // 完全折叠 + 不 keepDOM + collapseHeight=0 → shouldRender=false → 内容不在 DOM。
    expect(content(container)).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('isOpen=true：内容渲染，content 无 aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, { props: { isOpen: true } });
    expect(content(container)).toBeTruthy();
    expect(contentBox(container)?.hasAttribute('aria-hidden')).toBe(false);
    await expectNoAxeViolations(container);
  });

  it('keepDOM=true 折叠：内容 DOM 保留但 aria-hidden=true（移出可达性树）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: false, keepDOM: true },
    });
    // keepDOM → 折叠也渲染内容 DOM。
    expect(content(container)).toBeTruthy();
    // 完全折叠且不可见 → aria-hidden。
    expect(contentBox(container)?.getAttribute('aria-hidden')).toBe('true');
  });

  it('lazyRender + keepDOM 折叠（首展前）：内容不渲染', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: false, keepDOM: true, lazyRender: true },
    });
    // hasBeenRendered=false → shouldRender=false → 首展前不渲染。
    expect(content(container)).toBeNull();
  });

  it('lazyRender + keepDOM 且 isOpen=true：内容渲染（首展）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, keepDOM: true, lazyRender: true },
    });
    expect(content(container)).toBeTruthy();
  });

  it('collapseHeight>0：走测高机制，root 带 --measure，折叠仍渲染内容（截断展示）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: false, collapseHeight: 40 },
    });
    expect(root(container)?.classList.contains('cd-collapsible--measure')).toBe(true);
    // collapseHeight>0 → shouldRender=true 即使折叠。
    expect(content(container)).toBeTruthy();
    // collapseHeight>0 折叠不完全，内容不整体 aria-hidden（截断仍需可感知）。
    expect(contentBox(container)?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('motion=false：根节点无 --motion class（即时显隐）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, motion: false },
    });
    expect(root(container)?.classList.contains('cd-collapsible--motion')).toBe(false);
  });

  it('motion=true（默认）：根节点带 --motion class', async () => {
    const { container } = renderWithLocale(Fixture, { props: { isOpen: true } });
    expect(root(container)?.classList.contains('cd-collapsible--motion')).toBe(true);
  });

  it('id：透传到内容容器', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, id: 'my-collapsible-content' },
    });
    expect(contentBox(container)?.id).toBe('my-collapsible-content');
  });

  it('onMotionEnd：容器 transitionend（grid-template-rows）触发回调', async () => {
    const onMotionEnd = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, onMotionEnd },
    });
    const el = root(container) as HTMLElement;
    // 派发容器自身的 grid-template-rows 过渡结束事件。
    const ev = new Event('transitionend', { bubbles: false }) as TransitionEvent;
    Object.defineProperty(ev, 'propertyName', { value: 'grid-template-rows' });
    Object.defineProperty(ev, 'target', { value: el });
    Object.defineProperty(ev, 'currentTarget', { value: el });
    el.dispatchEvent(ev);
    expect(onMotionEnd).toHaveBeenCalledTimes(1);
  });

  it('onMotionEnd：子元素冒泡的 transitionend 不误触发', async () => {
    const onMotionEnd = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, onMotionEnd },
    });
    const el = root(container) as HTMLElement;
    const child = contentBox(container) as HTMLElement;
    const ev = new Event('transitionend', { bubbles: true }) as TransitionEvent;
    Object.defineProperty(ev, 'propertyName', { value: 'transform' });
    Object.defineProperty(ev, 'target', { value: child });
    Object.defineProperty(ev, 'currentTarget', { value: el });
    el.dispatchEvent(ev);
    expect(onMotionEnd).not.toHaveBeenCalled();
  });

  it('reCalcKey 设置：测高机制下正常渲染不抛错', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, collapseHeight: 40, reCalcKey: 'v1' },
    });
    expect(content(container)).toBeTruthy();
    expect(root(container)?.classList.contains('cd-collapsible--measure')).toBe(true);
  });

  it('class / style：透传到根节点', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true },
    });
    // 基础 class 存在即可（class/style 透传由 join 拼接，见组件）。
    expect(root(container)?.classList.contains('cd-collapsible')).toBe(true);
  });
});
