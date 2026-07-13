// OverflowList a11y：溢出折叠列表（严格镜像 Semi）。
// OverflowList 是纯行为组件，不注入语义角色（对齐 Semi）；DOM 结构为
// cd-overflow-list > cd-overflow-list-item / cd-overflow-list-overflow / cd-overflow-list-scroll-wrapper，
// 可见/溢出内容语义由 visibleItemRenderer/overflowRenderer 提供的宿主内容决定。
// jsdom 无布局，不会真实折叠；本套件只断言 DOM 结构 + axe（折叠行为留给浏览器 e2e）。
import { describe, it, expect, beforeAll } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import OverflowListFixture from './OverflowListA11yFixture.svelte';

// jsdom 无 ResizeObserver / IntersectionObserver（OverflowList 用其测量/观测）。
// 仅在本测试内补 no-op 桩，不改基建/组件源码——测量/折叠不在静态 a11y 范围（留给 e2e）。
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
  if (!('IntersectionObserver' in globalThis)) {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

describe('OverflowList a11y', () => {
  it('collapse 模式：根节点 cd-overflow-list + 可见项 cd-overflow-list-item，无 axe violations', async () => {
    const { container } = renderWithLocale(OverflowListFixture, {});
    const root = container.querySelector('.cd-overflow-list');
    expect(root).not.toBeNull();
    // 可见项包裹类对齐 Semi semi-overflow-list-item。
    expect(container.querySelectorAll('.cd-overflow-list-item').length).toBeGreaterThan(0);
    await expectNoAxeViolations(container);
  });

  it('scroll 模式：滚动 wrapper cd-overflow-list-scroll-wrapper，无 axe violations', async () => {
    const { container } = renderWithLocale(OverflowListFixture, {
      props: { renderMode: 'scroll' },
    });
    const wrapper = container.querySelector('.cd-overflow-list-scroll-wrapper');
    expect(wrapper).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
