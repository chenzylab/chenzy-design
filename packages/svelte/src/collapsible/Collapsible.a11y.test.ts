// Collapsible a11y + 渲染测试（dom project / jsdom）。
// Collapsible 是折叠原语，无触发器 UI。这里断言（对齐 Semi index.tsx 机制）：
//   - shouldRender 组合（isOpen / keepDOM / lazyRender / collapseHeight）决定内容 DOM 存留；
//   - DOM 2 层：.cd-collapsible-wrapper > .cd-collapsible-content（id 透传至内容元素）；
//   - motion=false 即时（无过渡）、onMotionEnd 回调（height transitionend）、reCalcKey 不崩；
//   - axe 无 violations。
// 真实高度过渡 / ResizeObserver 测高留给浏览器实测（jsdom 无布局，scrollHeight=0）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './CollapsibleFixture.svelte';

const content = (c: Element) => c.querySelector('[data-testid="content"]');
const root = (c: Element) => c.querySelector('.cd-collapsible-wrapper');
const contentBox = (c: Element) => c.querySelector('.cd-collapsible-content');

describe('Collapsible 渲染 / a11y', () => {
  it('默认折叠（isOpen=false, keepDOM=false）：内容 DOM 不渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {});
    expect(root(container)).toBeTruthy();
    // 完全折叠 + 不 keepDOM + collapseHeight=0 → shouldRender=false → 内容不在 DOM。
    expect(content(container)).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('isOpen=true：内容渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, { props: { isOpen: true } });
    expect(content(container)).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('keepDOM=true 折叠：内容 DOM 保留（对齐 Semi shouldRender）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: false, keepDOM: true },
    });
    // keepDOM → 折叠也渲染内容 DOM。
    expect(content(container)).toBeTruthy();
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

  it('collapseHeight>0：折叠仍渲染内容（保留部分高度作截断展示）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: false, collapseHeight: 40 },
    });
    // collapseHeight>0 → shouldRender=true 即使折叠。
    expect(content(container)).toBeTruthy();
  });

  it('motion=false：折叠/展开无过渡 class（即时显隐）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, motion: false },
    });
    // motion=false → 永不挂 .cd-collapsible-transition。
    expect(root(container)?.classList.contains('cd-collapsible-transition')).toBe(false);
  });

  it('id：透传到内容容器', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, id: 'my-collapsible-content' },
    });
    expect(contentBox(container)?.id).toBe('my-collapsible-content');
  });

  it('onMotionEnd：wrapper transitionend 触发回调（对齐 Semi 无 propertyName 过滤）', async () => {
    const onMotionEnd = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, onMotionEnd },
    });
    const el = root(container) as HTMLElement;
    const ev = new Event('transitionend', { bubbles: false }) as TransitionEvent;
    Object.defineProperty(ev, 'propertyName', { value: 'height' });
    el.dispatchEvent(ev);
    expect(onMotionEnd).toHaveBeenCalledTimes(1);
  });

  it('reCalcKey 设置：正常渲染不抛错', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true, collapseHeight: 40, reCalcKey: 'v1' },
    });
    expect(content(container)).toBeTruthy();
  });

  it('class：透传到根节点', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { isOpen: true },
    });
    expect(root(container)?.classList.contains('cd-collapsible-wrapper')).toBe(true);
  });
});
